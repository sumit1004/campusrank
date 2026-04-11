const db = require('../config/db');

/**
 * @desc    Upload a new certificate
 * @route   POST /api/certificates/upload
 * @access  Private (Logged-in users)
 */
const uploadCertificate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { club_id, position, event_date } = req.body;
    let file_url = null;

    if (req.file) {
      file_url = `/uploads/${req.file.filename}`;
    }

    if (!club_id || !position || !event_date || !file_url) {
      res.status(400); 
      throw new Error('Please provide club_id, position, event_date, and file.');
    }

    const validPositions = ['winner', 'runnerup1', 'runnerup2', 'participant'];
    if (!validPositions.includes(position.toLowerCase())) {
      res.status(400);
      throw new Error('Invalid position.');
    }

    const insertQuery = `
      INSERT INTO certificates (user_id, club_id, position, event_date, file_url, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `;

    const [result] = await db.query(insertQuery, [
      userId, 
      club_id, 
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

module.exports = {
  uploadCertificate,
  getStudentCertificates
};
