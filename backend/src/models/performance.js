const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  evaluator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  categories: [{
    name: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 5
    },
    comments: String
  }],
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  comments: String,
  status: {
    type: String,
    enum: ['draft', 'submitted', 'acknowledged'],
    default: 'draft'
  },
  acknowledgement: {
    date: Date,
    comments: String
  }
}, {
  timestamps: true
});

// Calculate overall score before saving
performanceSchema.pre('save', function(next) {
  if (this.categories.length > 0) {
    const sum = this.categories.reduce((acc, cat) => acc + cat.score, 0);
    this.overallScore = Number((sum / this.categories.length).toFixed(1));
  }
  next();
});

module.exports = mongoose.model('Performance', performanceSchema);