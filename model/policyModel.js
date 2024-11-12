const mongoose = require('mongoose');
const moment = require('moment-timezone');

const policySchema = new mongoose.Schema({
  policyName: {
    type: String,
  },
  description: {
    type: String,
  },
  date: {
    type: String,
  },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  files: [{ type: String }],
  createdAt: {
    type: Date,
    default: () => moment().tz('Asia/Kolkata').toDate(),
  },
  updatedAt: {
    type: Date,
    default: () => moment().tz('Asia/Kolkata').toDate(),
  },
});

// Middleware to update `updatedAt` with the current IST time on each update
policySchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: moment().tz('Asia/Kolkata').toDate() });
  next();
});

policySchema.pre('save', function (next) {
  this.updatedAt = moment().tz('Asia/Kolkata').toDate();
  next();
});

// Virtual fields to format `createdAt` and `updatedAt` in IST with custom formats
policySchema.virtual('createdAtFormatted').get(function () {
  return moment(this.createdAt).tz('Asia/Kolkata').format('DD/MM/YYYY hh:mm A'); // e.g., "09/11/2024 03:00 PM"
});

policySchema.virtual('updatedAtFormatted').get(function () {
  return moment(this.updatedAt).tz('Asia/Kolkata').format('DD/MM/YYYY hh:mm A');
});

// Ensure virtual fields are included when converting to JSON or object
policySchema.set('toJSON', { virtuals: true });
policySchema.set('toObject', { virtuals: true });

const Policy = mongoose.model('Policy', policySchema);

module.exports = Policy;
