const express = require('express');
const router = express.Router();
const {
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getInterviews)
  .post(protect, createInterview);

router.route('/:id')
  .get(protect, getInterviewById)
  .put(protect, updateInterview)
  .delete(protect, deleteInterview);

module.exports = router;
