const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  departments: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const DesignationSchema = new mongoose.Schema({
  designations: { type: String },
  departments: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, // Reference to Department model
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Department = mongoose.model('Department', DepartmentSchema);
const Designation = mongoose.model('Designation', DesignationSchema);
module.exports = { Department, Designation };
