const Application = require('../models/Application');

// @desc    Get all user applications with search, filter, and sorting
// @route   GET /api/applications
// @access  Private
const getApplications = async (req, res) => {
  try {
    const { search, status, packageMin, packageMax, deadlineStatus, sortBy, sortOrder } = req.query;
    
    // Base query: only fetch applications belonging to the logged-in user
    let query = { userId: req.user._id };

    // Search filter (companyName or role)
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Package range filter
    if (packageMin || packageMax) {
      query.package = {};
      if (packageMin) query.package.$gte = Number(packageMin);
      if (packageMax) query.package.$lte = Number(packageMax);
    }

    // Deadline Status filter (calculated based on current date)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadlineStatus) {
      if (deadlineStatus === 'overdue') {
        query.deadlineDate = { $lt: today };
        query.status = { $nin: ['Selected', 'Rejected'] }; // only overdue if not completed
      } else if (deadlineStatus === 'upcoming') {
        query.deadlineDate = { $gte: today };
      } else if (deadlineStatus === '0-2days') {
        const twoDaysLater = new Date(today);
        twoDaysLater.setDate(today.getDate() + 2);
        twoDaysLater.setHours(23, 59, 59, 999);
        query.deadlineDate = { $gte: today, $lte: twoDaysLater };
      } else if (deadlineStatus === '3-5days') {
        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(today.getDate() + 3);
        const fiveDaysLater = new Date(today);
        fiveDaysLater.setDate(today.getDate() + 5);
        fiveDaysLater.setHours(23, 59, 59, 999);
        query.deadlineDate = { $gte: threeDaysLater, $lte: fiveDaysLater };
      } else if (deadlineStatus === '6+days') {
        const sixDaysLater = new Date(today);
        sixDaysLater.setDate(today.getDate() + 6);
        query.deadlineDate = { $gte: sixDaysLater };
      }
    }

    // Sorting setup
    let sortOptions = {};
    const order = sortOrder === 'desc' ? -1 : 1;

    if (sortBy === 'package') {
      sortOptions.package = order;
    } else if (sortBy === 'deadline') {
      sortOptions.deadlineDate = order;
    } else if (sortBy === 'appliedDate') {
      sortOptions.appliedDate = order;
    } else {
      // Default sort by appliedDate descending
      sortOptions.appliedDate = -1;
    }

    const applications = await Application.find(query).sort(sortOptions);
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single application details
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new application
// @route   POST /api/applications
// @access  Private
const createApplication = async (req, res) => {
  try {
    const { companyName, role, package, applicationLink, appliedDate, deadlineDate, status, notes } = req.body;

    if (!companyName || !role || !package || !deadlineDate) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const application = await Application.create({
      userId: req.user._id,
      companyName,
      role,
      package,
      applicationLink,
      appliedDate: appliedDate || Date.now(),
      deadlineDate,
      status: status || 'Applied',
      notes
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an application
// @route   PUT /api/applications/:id
// @access  Private
const updateApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const { companyName, role, package, applicationLink, appliedDate, deadlineDate, status, notes } = req.body;

    application.companyName = companyName || application.companyName;
    application.role = role || application.role;
    application.package = package !== undefined ? package : application.package;
    application.applicationLink = applicationLink !== undefined ? applicationLink : application.applicationLink;
    application.appliedDate = appliedDate || application.appliedDate;
    application.deadlineDate = deadlineDate || application.deadlineDate;
    application.status = status || application.status;
    application.notes = notes !== undefined ? notes : application.notes;

    const updatedApplication = await application.save();
    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an application
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({ message: 'Application removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication
};
