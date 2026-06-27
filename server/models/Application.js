const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: [true, 'Please provide company name'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Please provide job role'],
    trim: true
  },
  package: {
    type: Number,
    required: [true, 'Please provide package in LPA']
  },
  applicationLink: {
    type: String,
    trim: true
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  deadlineDate: {
    type: Date,
    required: [true, 'Please provide deadline date']
  },
  status: {
    type: String,
    enum: ['Applied', 'OA Cleared', 'Interview Scheduled', 'Selected', 'Rejected'],
    default: 'Applied'
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);
