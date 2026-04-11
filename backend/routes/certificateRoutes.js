const express = require('express');
const router = express.Router();
const { uploadCertificate, getStudentCertificates } = require('../controllers/certificateController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// POST /api/certificates/upload
router.post('/upload', protect, upload.single('file'), uploadCertificate);

// GET /api/certificates/my-certificates
router.get('/my-certificates', protect, getStudentCertificates);

module.exports = router;
