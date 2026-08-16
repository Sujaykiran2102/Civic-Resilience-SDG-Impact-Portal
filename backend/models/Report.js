const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true,
    default: () => `REP-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  },
  originalText: {
    type: String,
    required: [true, 'Original report text is required'],
    trim: true,
    maxlength: [2000, 'Report text cannot exceed 2000 characters']
  },
  language: {
    type: String,
    default: 'auto',
    trim: true
  },
  translatedText: {
    type: String,
    trim: true
  },
  sdgCategory: {
    type: Number,
    required: true,
    min: [1, 'SDG category must be between 1 and 17'],
    max: [17, 'SDG category must be between 1 and 17'],
    index: true // Indexed for faster aggregation in the dashboard charts
  },
  severityLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected', 'Resolved'],
    default: 'Pending'
  }
}, {
  timestamps: true 
});

// Geospatial index for potential map-based features
reportSchema.index({ location: '2dsphere' });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;