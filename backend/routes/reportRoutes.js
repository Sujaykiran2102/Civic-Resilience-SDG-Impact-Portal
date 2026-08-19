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
    const { originalText, address } = req.body;

    if (!originalText) {
      return res.status(400).json({ message: 'Original text is required.' });
    }

    // 1. Dynamic Geocoding
    // We default to a generic Chennai coordinate just in case the API fails
    let coordinates = [80.2707, 13.0827]; 
    
    if (address) {
      try {
        // Call the free OpenStreetMap Nominatim API
        // We append "Chennai, Tamil Nadu" to help narrow down local neighborhood names
        const searchQuery = encodeURIComponent(`${address}, Chennai, Tamil Nadu`);
        const geoResponse = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=1`, {
          headers: { 'User-Agent': 'CivicResiliencePortal/1.0' } // Required by Nominatim policy
        });

        if (geoResponse.data && geoResponse.data.length > 0) {
          // MongoDB expects GeoJSON format: [longitude, latitude]
          coordinates = [
            parseFloat(geoResponse.data[0].lon), 
            parseFloat(geoResponse.data[0].lat)
          ];
        }
      } catch (geoError) {
        console.error('Geocoding failed, falling back to default coordinates:', geoError.message);
      }
    }

    // 2. Call the Python AI Microservice
    let aiData = {};
    try {
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/api/analyze`, {
        text: originalText
      });
      aiData = aiResponse.data;
    } catch (aiError) {
      console.error('AI Service Error:', aiError.message);
      return res.status(503).json({ message: 'AI processing service is currently unavailable.' });
    }

    // 3. Construct and save the report with REAL dynamic coordinates
    const newReport = new Report({
      originalText,
      language: aiData.language || 'unknown',
      translatedText: aiData.translatedText,
      sdgCategory: aiData.sdgCategory,
      severityLevel: aiData.severityLevel,
      location: {
        type: 'Point',
        coordinates, // Dynamically generated!
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

/**
 * @route   GET /api/reports
 * @desc    Get all reports (latest first) for mapping
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error fetching reports' });
  }
});

module.exports = router;