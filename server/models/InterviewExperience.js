const mongoose = require('mongoose');

const InterviewExperienceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: false
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
  interviewDate: {
    type: Date,
    required: [true, 'Please provide interview date']
  },
  rounds: {
    type: Number,
    required: [true, 'Please provide number of rounds']
  },
  questionsAsked: {
    type: String,
    required: [true, 'Please provide questions asked']
  },
  experienceSummary: {
    type: String,
    required: [true, 'Please provide experience summary']
  },
  result: {
    type: String,
    enum: ['Selected', 'Rejected', 'Waiting'],
    default: 'Waiting'
  }
}, { timestamps: true });

module.exports = mongoose.model('InterviewExperience', InterviewExperienceSchema);
