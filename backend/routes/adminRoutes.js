const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Report = require('../models/Report');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '8h' });
};

/**
 * @route   POST /api/admin/setup
 * @desc    One-time route to create the first admin (Disable in production!)
 * @access  Public
 */
router.post('/setup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminExists = await Admin.findOne({ username });

    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = await Admin.create({ username, password });
    if (admin) {
      res.status(201).json({
        _id: admin._id,
        username: admin.username,
        token: generateToken(admin._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid admin data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/admin/login
 * @desc    Authenticate admin & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        username: admin.username,
        token: generateToken(admin._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/reports/:id/status
 * @desc    Update the verification status of a report
 * @access  Private (Requires Token)
 */
router.put('/reports/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Ensure valid status
    const validStatuses = ['Pending', 'Verified', 'Rejected', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.verificationStatus = status;
    const updatedReport = await report.save();

    res.json(updatedReport);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating status' });
  }
});

module.exports = router;