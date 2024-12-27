const { User, Leave, TimeSheet, Performance, Notification } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

// Create performance evaluation
const createEvaluation = asyncHandler(async (req, res) => {
  const { employeeId, period, categories, comments } = req.body;

  // Verify employee exists
  const employee = await User.findById(employeeId);
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  const evaluation = new Performance({
    employee: employeeId,
    evaluator: req.user._id,
    period,
    categories: categories.map(cat => ({
      name: cat.name,
      score: cat.score,
      comments: cat.comments
    })),
    comments
  });

  const savedEvaluation = await evaluation.save();

  // Send notification if socket is available
  if (req.io) {
    req.io.to(employeeId).emit('newEvaluation', {
      message: 'You have a new performance evaluation',
      evaluationId: savedEvaluation._id
    });
  }

  res.status(201).json(savedEvaluation);
});

// Get all evaluations
const getAllEvaluations = asyncHandler(async (req, res) => {
  const { period, employeeId } = req.query;
  let query = {};

  if (period) {
    query['period.startDate'] = { $gte: new Date(period.startDate) };
    query['period.endDate'] = { $lte: new Date(period.endDate) };
  }

  if (employeeId) {
    query.employee = employeeId;
  }

  const evaluations = await Performance.find(query)
    .populate('employee', 'name email department position')
    .populate('evaluator', 'name')
    .sort('-createdAt');

  res.json(evaluations);
});

// Get my evaluations
const getMyEvaluations = asyncHandler(async (req, res) => {
  const evaluations = await Performance.find({ employee: req.user._id })
    .populate('evaluator', 'name')
    .sort('-createdAt');
  
  const recentEvaluations = evaluations.map(ev => ({
    id: ev._id,
    score: ev.overallScore,
    date: ev.createdAt,
    categories: ev.categories,
    comments: ev.comments,
    status: ev.status,
    period: ev.period,
    evaluator: ev.evaluator.name
  }));

  res.json({
    data: recentEvaluations,
    recent: evaluations.slice(0, 2).map(ev => ({
      description: `New performance evaluation from ${ev.evaluator.name}`,
      date: ev.createdAt
    })),
    summary: {
      total: evaluations.length,
      averageScore: evaluations.reduce((acc, ev) => acc + ev.overallScore, 0) / evaluations.length || 0,
      latestScore: evaluations[0]?.overallScore || 0
    }
  });
});

// Get evaluation by ID
const getEvaluationById = asyncHandler(async (req, res) => {
  const evaluation = await Performance.findById(req.params.id)
    .populate('employee', 'name email department position')
    .populate('evaluator', 'name');

  if (!evaluation) {
    res.status(404);
    throw new Error('Evaluation not found');
  }

  // Check if user is authorized to view this evaluation
  if (evaluation.employee._id.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this evaluation');
  }

  res.json(evaluation);
});

// Update evaluation
const updateEvaluation = asyncHandler(async (req, res) => {
  const { categories, comments, period } = req.body;
  const evaluation = await Performance.findById(req.params.id);

  if (!evaluation) {
    res.status(404);
    throw new Error('Evaluation not found');
  }

  if (evaluation.status === 'acknowledged') {
    res.status(400);
    throw new Error('Cannot update acknowledged evaluation');
  }

  evaluation.categories = categories || evaluation.categories;
  evaluation.comments = comments || evaluation.comments;
  evaluation.period = period || evaluation.period;

  const updatedEvaluation = await evaluation.save();

  // Notify employee of update if socket is available
  if (req.io) {
    req.io.to(evaluation.employee.toString()).emit('evaluationUpdated', {
      message: 'Your performance evaluation has been updated',
      evaluationId: evaluation._id
    });
  }

  res.json(updatedEvaluation);
});

// Acknowledge evaluation
const acknowledgeEvaluation = asyncHandler(async (req, res) => {
  const evaluation = await Performance.findById(req.params.id);

  if (!evaluation) {
    res.status(404);
    throw new Error('Evaluation not found');
  }

  if (evaluation.employee.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to acknowledge this evaluation');
  }

  if (evaluation.status === 'acknowledged') {
    res.status(400);
    throw new Error('Evaluation already acknowledged');
  }

  evaluation.status = 'acknowledged';
  evaluation.acknowledgement = {
    date: new Date(),
    comments: req.body.comments || ''
  };

  const updatedEvaluation = await evaluation.save();

  // Notify evaluator if socket is available
  if (req.io) {
    req.io.to(evaluation.evaluator.toString()).emit('evaluationAcknowledged', {
      message: 'An evaluation has been acknowledged',
      evaluationId: evaluation._id
    });
  }

  res.json(updatedEvaluation);
});

// Delete evaluation
const deleteEvaluation = asyncHandler(async (req, res) => {
  const evaluation = await Performance.findById(req.params.id);

  if (!evaluation) {
    res.status(404);
    throw new Error('Evaluation not found');
  }

  await evaluation.remove();
  res.json({ message: 'Evaluation removed' });
});

module.exports = {
  createEvaluation,
  getAllEvaluations,
  getMyEvaluations,
  getEvaluationById,
  updateEvaluation,
  acknowledgeEvaluation,
  deleteEvaluation
};