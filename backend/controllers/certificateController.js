const db = require('../config/db');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('../utils/notificationHelper');
const { updateLeaderboardCache } = require('../utils/leaderboardCache');
const xlsx = require('xlsx');
const { generateCertificatePDF } = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs-extra');

/**
 * @desc    Upload a new certificate
 * @route   POST /api/certificates/upload
 * @access  Private (Logged-in users)
 */
const uploadCertificate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { club_id, position, event_date, event_name } = req.body;
    let file_url = null;

    if (req.file) {
      file_url = `/uploads/${req.file.filename}`;
    }

    if (!club_id || !position || !event_date || !file_url || !event_name) {
      res.status(400); 
      throw new Error('Please provide club_id, event_name, position, event_date, and file.');
    }

    const validPositions = ['winner', 'runnerup1', 'runnerup2', 'participant'];
    if (!validPositions.includes(position.toLowerCase())) {
      res.status(400);
      throw new Error('Invalid position.');
    }

    const insertQuery = `
      INSERT INTO certificates (user_id, club_id, event_name, position, event_date, file_url, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `;

    const [result] = await db.query(insertQuery, [
      userId, 
      club_id, 
      event_name,
      position.toLowerCase(), 
      event_date, 
      file_url
    ]);

    res.status(201).json({
      success: true,
      message: 'Certificate uploaded successfully',
      data: { certificateId: result.insertId, file_url }
    });
  } catch (error) {
    next(error); 
  }
};

/**
 * @desc    Get logged in user's certificates
 * @route   GET /api/certificates/my-certificates
 */
const getStudentCertificates = async (req, res, next) => {
  try {
    const query = `
      SELECT c.*, cl.name as club_name 
      FROM certificates c
      LEFT JOIN clubs cl ON c.club_id = cl.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `;
    const [certs] = await db.query(query, [req.user.id]);
    res.status(200).json({ success: true, count: certs.length, data: certs });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk generate certificates (Admin only)
 * @route   POST /api/certificates/bulk-generate
 * @access  Private (Admin)
 */
const bulkGenerateCertificates = async (req, res, next) => {
  try {
    const { event_name, event_date, position, pastedData } = req.body;
    let studentData = [];

    // Always fetch fresh club_id from DB (avoids stale JWT token issues)
    const [adminRows] = await db.query('SELECT club_id FROM users WHERE id = ?', [req.user.id]);
    const club_id = adminRows[0]?.club_id;

    // Validations
    if (!club_id) {
      res.status(403);
      throw new Error('User does not have an assigned club. Please ask a super admin to assign your club.');
    }

    if (!event_name || !event_date || !position) {
      res.status(400);
      throw new Error('Please provide event_name, event_date, and position.');
    }

    const pointsMap = {
      winner: 50,
      runnerup1: 35,
      runnerup2: 20,
      participant: 10
    };

    const points = pointsMap[position.toLowerCase()];
    if (!points) {
      res.status(400);
      throw new Error('Invalid position.');
    }

    // Parse Data
    if (req.file) {
      // Excel upload
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      studentData = xlsx.utils.sheet_to_json(worksheet);
    } else if (pastedData) {
      // JSON or CSV-like pasted data
      if (typeof pastedData === 'string') {
        // Try parsing CSV-like text (Name, ERP, Branch, Course, Semester, College)
        const lines = pastedData.trim().split('\n');
        studentData = lines.map(line => {
          const parts = line.split(',').map(s => s.trim());
          return {
            Name: parts[0],
            ERP: parts[1],
            Branch: parts[2],
            Course: parts[3],
            Semester: parts[4],
            College: parts[5]
          };
        });
      } else {
        studentData = pastedData;
      }
    }

    if (studentData.length === 0) {
      res.status(400);
      throw new Error('No student data provided.');
    }

    // Process Students
    const results = {
      success: [],
      failed: []
    };

    // Create Batch record
    const [batchResult] = await db.query(
      'INSERT INTO certificate_batches (club_id, position, event_name) VALUES (?, ?, ?)',
      [club_id, position.toLowerCase(), event_name]
    );

    for (const student of studentData) {
      try {
        const erp = student.ERP || student.erp;
        const name = student.Name || student.name;
        const college = student.College || student.college || 'CampusRank University';

        if (!erp) {
          results.failed.push({ student, error: 'Missing ERP' });
          continue;
        }

        // Find user in DB
        const [users] = await db.query('SELECT id, name FROM users WHERE erp = ?', [erp]);
        
        if (users.length === 0) {
          results.failed.push({ student, error: 'User not found in system via ERP' });
          continue;
        }

        const userId = users[0].id;
        const studentName = users[0].name || name;

        // Generate PDF
        const pdfUrl = await generateCertificatePDF({
          name: studentName,
          event_name,
          position,
          event_date,
          erp,
          college
        });

        // Store in e_certificates (display only as per requirement)
        await db.query(
          `INSERT INTO e_certificates 
           (user_id, club_id, event_name, event_date, position, certificate_url, points) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [userId, club_id, event_name, event_date, position.toLowerCase(), pdfUrl, points]
        );

        // SYNC WITH EVENT_PARTICIPATION (Centralized Points Control)
        // E-Certificate ALWAYS Overrides manual or existing records for the same event
        await db.query(
          `INSERT INTO event_participation 
           (user_id, club_id, event_name, event_date, position, source, points) 
           VALUES (?, ?, ?, ?, ?, 'e_certificate', ?)
           ON DUPLICATE KEY UPDATE
           position = VALUES(position),
           points = VALUES(points),
           source = 'e_certificate'`,
          [userId, club_id, event_name, event_date, position.toLowerCase(), points]
        );

        // Update user total points from central table
        await db.query(
          `UPDATE users 
           SET total_points = (SELECT SUM(points) FROM event_participation WHERE user_id = ?) 
           WHERE id = ?`, 
          [userId, userId]
        );

        results.success.push({ erp, name: studentName, url: pdfUrl });

        // NOTIFY STUDENT AND REFRESH CACHE
        createNotification(userId, `You have received a ${position} certificate for ${event_name}! 🏆 (+${points} points)`, 'success', 'E-Certificate Received');
        updateLeaderboardCache(userId, club_id, points, event_date);
      } catch (error) {
        results.failed.push({ student, error: error.message });
      }
    }

    // LOG ACTION
    logActivity(req.user.id, 'SEND_E_CERT', batchResult.insertId, { event_name, student_count: results.success.length });

    res.status(200).json({
      success: true,
      batchId: batchResult.insertId,
      results
    });

  } catch (error) {
    next(error);
  }
};



/**
 * @desc    Get current user's E-Certificates
 * @route   GET /api/certificates/my-e-certificates
 */
const getMyECertificates = async (req, res, next) => {
  try {
    const query = `
      SELECT ec.*, cl.name as club_name 
      FROM e_certificates ec
      LEFT JOIN clubs cl ON ec.club_id = cl.id
      WHERE ec.user_id = ?
      ORDER BY ec.created_at DESC
    `;
    const [certs] = await db.query(query, [req.user.id]);
    res.status(200).json({ success: true, count: certs.length, data: certs });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's Participation History (Centralized)
 * @route   GET /api/certificates/my-participations
 */
const getMyParticipations = async (req, res, next) => {
  try {
    const query = `
      SELECT ep.*, cl.name as club_name 
      FROM event_participation ep
      LEFT JOIN clubs cl ON ep.club_id = cl.id
      WHERE ep.user_id = ?
      ORDER BY ep.event_date DESC
    `;
    const [participations] = await db.query(query, [req.user.id]);
    res.status(200).json({ success: true, count: participations.length, data: participations });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadCertificate,
  getStudentCertificates,
  bulkGenerateCertificates,
  getMyECertificates,
  getMyParticipations
};
