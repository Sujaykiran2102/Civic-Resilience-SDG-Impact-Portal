// backend/routes/reportRoutes.js
const express = require('express');
const axios = require('axios');
const Report = require('../models/Report');

const router = express.Router();

/**
 * @route   POST /api/reports
 * @desc    Submit a new civic report, process via AI, and save to DB
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { originalText, coordinates, address } = req.body;

    if (!originalText || !coordinates || coordinates.length !== 2) {
      return res.status(400).json({ 
        message: 'Original text and valid coordinates [longitude, latitude] are required.' 
      });
    }

    // Call the Python AI Microservice
    // We pass the raw text to let the AI determine language, translate, and categorize
    let aiData = {};
    try {
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/api/analyze`, {
        text: originalText
      });
      aiData = aiResponse.data;
    } catch (aiError) {
      console.error('AI Service Error:', aiError.message);
      return res.status(503).json({ 
        message: 'AI processing service is currently unavailable. Please try again later.' 
      });
    }

    // Construct and save the report with enriched AI data
    const newReport = new Report({
      originalText,
      language: aiData.language || 'unknown',
      translatedText: aiData.translatedText,
      sdgCategory: aiData.sdgCategory,
      severityLevel: aiData.severityLevel,
      location: {
        type: 'Point',
        coordinates,
        address
      }
    });

    const savedReport = await newReport.save();

    res.status(201).json({
      message: 'Report submitted successfully',
      report: savedReport
    });

  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Server error processing report' });
  }
});

/**
 * @route   GET /api/analytics
 * @desc    Get aggregated report counts grouped by SDG category
 * @access  Public
 */
router.get('/analytics', async (req, res) => {
  try {
    const analyticsData = await Report.aggregate([
      {
        $group: {
          _id: '$sdgCategory',
          count: { $sum: 1 },
          highSeverityCount: {
            $sum: {
              $cond: [{ $eq: ['$severityLevel', 'High'] }, 1, 0]
            }
          },
          criticalSeverityCount: {
            $sum: {
              $cond: [{ $eq: ['$severityLevel', 'Critical'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 } // Sort by SDG Category (1 to 17)
      },
      {
        $project: {
          sdgCategory: '$_id',
          count: 1,
          highSeverityCount: 1,
          criticalSeverityCount: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

module.exports = router;