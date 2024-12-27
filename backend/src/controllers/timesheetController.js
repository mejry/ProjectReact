const { TimeSheet } = require("../models");
const asyncHandler = require("../utils/asyncHandler");

// Get week timesheet
const getWeekTimesheet = asyncHandler(async (req, res) => {
  const date = new Date(req.query.date || new Date());
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const entries = await TimeSheet.find({
    user: req.user._id,
    date: {
      $gte: startOfWeek,
      $lte: endOfWeek,
    },
  }).sort("date");

  // Create a map of all week days
  const weekData = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);
    weekData.push({
      date: currentDate,
      startTime: "",
      endTime: "",
      breakDuration: 0,
      totalHours: 0,
      status: "pending",
    });
  }

  // Fill in existing entries
  entries.forEach((entry) => {
    const dayIndex = new Date(entry.date).getDay();
    weekData[dayIndex] = {
      _id: entry._id,
      date: entry.date,
      startTime: entry.startTime,
      endTime: entry.endTime,
      breakDuration: entry.breakDuration,
      totalHours: entry.totalHours,
      status: entry.status,
    };
  });

  res.json({
    startDate: startOfWeek,
    endDate: endOfWeek,
    entries: weekData,
  });
});

// Get timesheet summary
const getTimesheetSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    res.status(400);
    throw new Error("Start date and end date are required");
  }

  const query = {
    user: req.user._id,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  const entries = await TimeSheet.find(query);

  const summary = {
    totalHours: 0,
    regularHours: 0,
    overtimeHours: 0,
    daysWorked: 0,
    approvedEntries: 0,
    pendingEntries: 0,
    rejectedEntries: 0,
  };

  entries.forEach((entry) => {
    // Calculate hours
    const hours = entry.totalHours;
    if (hours <= 8) {
      summary.regularHours += hours;
    } else {
      summary.regularHours += 8;
      summary.overtimeHours += hours - 8;
    }
    summary.totalHours += hours;

    // Count days worked
    if (hours > 0) {
      summary.daysWorked++;
    }

    // Track entry statuses
    switch (entry.status) {
      case "approved":
        summary.approvedEntries++;
        break;
      case "pending":
        summary.pendingEntries++;
        break;
      case "rejected":
        summary.rejectedEntries++;
        break;
    }
  });

  // Round all hour values to 2 decimal places
  summary.totalHours = parseFloat(summary.totalHours.toFixed(2));
  summary.regularHours = parseFloat(summary.regularHours.toFixed(2));
  summary.overtimeHours = parseFloat(summary.overtimeHours.toFixed(2));

  res.json(summary);
});

// Submit or update timesheet entries in bulk
const bulkUpdateTimesheet = asyncHandler(async (req, res) => {
  console.log(req.body);

  const { entry } = req.body;
  console.log(entry);
  if (!Array.isArray(entry)) {
    res.status(400);
    throw new Error("Invalid entries format");
  }

  // Validate entries
  entry.forEach((entry) => {
    console.log("hhhh", entry);

    if (!entry.startTime || !entry.endTime) {
      res.status(400);
      throw new Error("Start time and end time are required for all entries");
    }

    const start = new Date(`2000-01-01T${entry.startTime}`);
    const end = new Date(`2000-01-01T${entry.endTime}`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400);
      throw new Error("Invalid time format");
    }

    if (end <= start) {
      res.status(400);
      throw new Error("End time must be after start time");
    }

    const breakDuration = parseFloat(entry.breakDuration);
    if (isNaN(breakDuration) || breakDuration < 0) {
      res.status(400);
      throw new Error("Invalid break duration");
    }

    const totalHours = (end - start) / (1000 * 60 * 60) - breakDuration;
    if (totalHours <= 0) {
      res.status(400);
      throw new Error("Total working hours must be greater than 0");
    }
  });

  const operations = entry.map((entry) => {
    const updateData = {
      user: req.user._id,
      date: new Date(entry.date),
      startTime: entry.startTime,
      endTime: entry.endTime,
      breakDuration: parseFloat(entry.breakDuration),
      totalHours: parseFloat(entry.totalHours),
      status: "pending",
    };

    if (entry._id) {
      // Update existing entry
      return {
        updateOne: {
          filter: {
            _id: entry._id,
            user: req.user._id,
            // Only allow updates if status is pending
            status: "pending",
          },
          update: { $set: updateData },
          upsert: false,
        },
      };
    } else {
      // Create new entry
      return {
        insertOne: {
          document: updateData,
        },
      };
    }
  });

  try {
    const result = await TimeSheet.bulkWrite(operations, { ordered: false });
    res.json({
      message: "Timesheet updated successfully",
      result: {
        modified: result.modifiedCount,
        inserted: result.insertedCount,
        total: result.modifiedCount + result.insertedCount,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error("Duplicate entries found for the same date");
    }
    throw error;
  }
});

// Update timesheet status (for admin)
const updateTimesheetStatus = asyncHandler(async (req, res) => {
  const { status, comment } = req.body;
  const { id } = req.params;

  if (!["approved", "rejected", "pending"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const timesheet = await TimeSheet.findById(id);

  if (!timesheet) {
    res.status(404);
    throw new Error("Timesheet entry not found");
  }

  timesheet.status = status;
  if (comment) {
    timesheet.statusComment = comment;
  }

  const updatedTimesheet = await timesheet.save();

  // Optionally send notification to user about status update
  if (req.io) {
    req.io.to(timesheet.user.toString()).emit("timesheetUpdate", {
      type: "status",
      timesheetId: timesheet._id,
      status,
      comment,
    });
  }

  res.json(updatedTimesheet);
});

// Delete timesheet entry
const deleteTimesheetEntry = asyncHandler(async (req, res) => {
  const timesheet = await TimeSheet.findOne({
    _id: req.params.id,
    user: req.user._id,
    status: "pending", // Only allow deletion of pending entries
  });

  if (!timesheet) {
    res.status(404);
    throw new Error("Timesheet entry not found or cannot be deleted");
  }

  await timesheet.remove();
  res.json({ message: "Timesheet entry removed successfully" });
});

// Get all timesheets (admin only)
const getAllTimesheets = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    userId,
    status,
    page = 1,
    limit = 10,
  } = req.query;

  let query = {};

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  if (userId) {
    query.user = userId;
  }

  if (status && ["approved", "rejected", "pending"].includes(status)) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const [timesheets, total] = await Promise.all([
    TimeSheet.find(query)
      .populate("user", "name email department")
      .sort("-date")
      .skip(skip)
      .limit(parseInt(limit)),
    TimeSheet.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    timesheets,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalEntries: total,
      entriesPerPage: parseInt(limit),
    },
  });
});
const submitTimesheet = asyncHandler(async (req, res) => {
  const { date, startTime, endTime, breakDuration } = req.body;

  // Validate inputs
  if (!date || !startTime || !endTime) {
    res.status(400);
    throw new Error("Date, start time and end time are required");
  }

  // Calculate total hours
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    res.status(400);
    throw new Error("Invalid time format");
  }

  if (end <= start) {
    res.status(400);
    throw new Error("End time must be after start time");
  }

  const breakHours = parseFloat(breakDuration || 0);
  if (isNaN(breakHours) || breakHours < 0) {
    res.status(400);
    throw new Error("Invalid break duration");
  }

  const totalHours = (end - start) / (1000 * 60 * 60) - breakHours;
  if (totalHours <= 0) {
    res.status(400);
    throw new Error("Total working hours must be greater than 0");
  }

  // Check for existing entry
  let timesheet = await TimeSheet.findOne({
    user: req.user._id,
    date: new Date(date),
  });

  if (timesheet) {
    // Update existing entry if it's in pending status
    if (timesheet.status !== "pending") {
      res.status(400);
      throw new Error("Cannot update approved or rejected timesheet entries");
    }

    timesheet.startTime = startTime;
    timesheet.endTime = endTime;
    timesheet.breakDuration = breakHours;
    timesheet.totalHours = totalHours;
  } else {
    // Create new entry
    timesheet = new TimeSheet({
      user: req.user._id,
      date: new Date(date),
      startTime,
      endTime,
      breakDuration: breakHours,
      totalHours,
      status: "pending",
    });
  }

  const savedTimesheet = await timesheet.save();
  res.status(201).json(savedTimesheet);
});
const updateTimesheetEntry = asyncHandler(async (req, res) => {
  const { startTime, endTime, breakDuration } = req.body;

  try {
    // Find timesheet entry
    const timesheet = await TimeSheet.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!timesheet) {
      res.status(404);
      throw new Error("Timesheet entry not found");
    }

    // Calculate total hours
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const totalHours =
      (end - start) / (1000 * 60 * 60) - (parseFloat(breakDuration) || 0);

    // Validate times
    if (end <= start) {
      res.status(400);
      throw new Error("End time must be after start time");
    }

    if (totalHours <= 0) {
      res.status(400);
      throw new Error("Total hours must be greater than 0");
    }

    // Update timesheet entry
    timesheet.startTime = startTime;
    timesheet.endTime = endTime;
    timesheet.breakDuration = parseFloat(breakDuration) || 0;
    timesheet.totalHours = totalHours;

    const updatedTimesheet = await timesheet.save();

    res.json(updatedTimesheet);
  } catch (error) {
    console.error("Update timesheet error:", error);
    res.status(error.status || 500).json({
      message: error.message || "Error updating timesheet entry",
    });
  }
});
// Make sure to add submitTimesheet to the exports
module.exports = {
  getWeekTimesheet,
  getTimesheetSummary,
  submitTimesheet, // Add this
  bulkUpdateTimesheet,
  updateTimesheetStatus,
  deleteTimesheetEntry,
  getAllTimesheets,
  updateTimesheetEntry,
};
