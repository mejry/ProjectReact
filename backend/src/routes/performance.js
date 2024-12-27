const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  createEvaluation,
  getAllEvaluations,
  getMyEvaluations,
  getEvaluationById,
  updateEvaluation,
  acknowledgeEvaluation,
  deleteEvaluation
} = require('../controllers/performanceController');

// Performance routes
router.get('/my-evaluations', protect, getMyEvaluations);
router.get('/evaluation/:id', protect, getEvaluationById);
router.get('/', protect, admin, getAllEvaluations);
router.post('/', protect, admin, createEvaluation);
router.put('/:id', protect, admin, updateEvaluation);
router.delete('/:id', protect, admin, deleteEvaluation);
router.post('/:id/acknowledge', protect, acknowledgeEvaluation);

module.exports = router;