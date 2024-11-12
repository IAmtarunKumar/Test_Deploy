const mongoose = require('mongoose');

// Define the Task Schema
const taskSchema = new mongoose.Schema({
    taskId: String,
    title: String,
    startDate: String,
    deadline :String,
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // Reference to Project model
    status: String,
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of references to User model (multiple users)
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User model (task creator)
    taskDescription: String,
    files: [String], // Array of strings to store file URLs or paths
    createdAt: { type: Date, default: Date.now }, // Timestamp for creation
    updatedAt: { type: Date, default: Date.now }  // Timestamp for last update
});

// Middleware to update `updatedAt` before saving
taskSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Create the Task Model from the schema
const Task = mongoose.model('Task', taskSchema);

// Export the Task model
module.exports = Task;
