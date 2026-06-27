const InterviewExperience = require('../models/InterviewExperience');

// @desc    Get all user interview experiences
// @route   GET /api/interviews
// @access  Private
const getInterviews = async (req, res) => {
  try {
    const { search, result } = req.query;

    let query = { userId: req.user._id };

    // Search by companyName
    if (search) {
      query.companyName = { $regex: search, $options: 'i' };
    }

    // Filter by result
    if (result && result !== 'All') {
      query.result = result;
    }

    const interviews = await InterviewExperience.find(query).sort({ interviewDate: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single interview experience
// @route   GET /api/interviews/:id
// @access  Private
const getInterviewById = async (req, res) => {
  try {
    const interview = await InterviewExperience.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!interview) {
      return res.status(404).json({ message: 'Interview experience not found' });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create interview experience
// @route   POST /api/interviews
// @access  Private
const createInterview = async (req, res) => {
  try {
    const { applicationId, companyName, role, interviewDate, rounds, questionsAsked, experienceSummary, result } = req.body;

    if (!companyName || !role || !interviewDate || !rounds || !questionsAsked || !experienceSummary) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const interview = await InterviewExperience.create({
      userId: req.user._id,
      applicationId: applicationId || null,
      companyName,
      role,
      interviewDate,
      rounds,
      questionsAsked,
      experienceSummary,
      result: result || 'Waiting'
    });

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update interview experience
// @route   PUT /api/interviews/:id
// @access  Private
const updateInterview = async (req, res) => {
  try {
    const interview = await InterviewExperience.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!interview) {
      return res.status(404).json({ message: 'Interview experience not found' });
    }

    const { applicationId, companyName, role, interviewDate, rounds, questionsAsked, experienceSummary, result } = req.body;

    interview.applicationId = applicationId !== undefined ? applicationId : interview.applicationId;
    interview.companyName = companyName || interview.companyName;
    interview.role = role || interview.role;
    interview.interviewDate = interviewDate || interview.interviewDate;
    interview.rounds = rounds !== undefined ? rounds : interview.rounds;
    interview.questionsAsked = questionsAsked || interview.questionsAsked;
    interview.experienceSummary = experienceSummary || interview.experienceSummary;
    interview.result = result || interview.result;

    const updatedInterview = await interview.save();
    res.json(updatedInterview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete interview experience
// @route   DELETE /api/interviews/:id
// @access  Private
const deleteInterview = async (req, res) => {
  try {
    const interview = await InterviewExperience.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!interview) {
      return res.status(404).json({ message: 'Interview experience not found' });
    }

    res.json({ message: 'Interview experience removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview
};
