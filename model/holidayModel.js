const mongoose = require('mongoose');
const moment = require('moment');

const holidaySchema = new mongoose.Schema({
    holidayName: { type: String },
    holidayDate: { type: String },
    offDays: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// LeavesType Schema and Model
const leaveTypeSchema = new mongoose.Schema({
    leaveName: { type: String },
    day: { type: String },
    durationLeave: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const LeavesType = mongoose.model('LeavesType', leaveTypeSchema);

// Leaves Schema and Model
const leavesSchema = new mongoose.Schema({
    leaveId: { type: String },
    todayPresents: { type: String, default: 0 },
    plannedLeaves: { type: String, default: 0 },
    unplannedLeaves: { type: String, default: 0 },
    pendingRequests: { type: String, default: 0 },
    leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'LeavesType' },
    daysLeaveType: { type: String },
    leaveStatus: { type: String, default: 'Pending' },
    from: { type: String },
    to: { type: String },
    halfDay: {
        type: String,
        enum: ['First Half', 'Second Half'],
        default: null
    },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    totalLeaves: { type: String, default: 0 },
    leavesTaken: { type: String, default: 0 },
    leavesAbsent: { type: String, default: 0 },
    pendingAppproval: { type: String },
    workingDays: { type: String, default: 0 },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    noOfDays: { type: String, default: 0 },
    reamaingLeave: { type: String },
    reason: { type: String },
    status: { type: String },
    remark: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

 

leavesSchema.pre('save', function (next) {
    if (this.from) {
        this.from = moment(this.from).format('D MMM YYYY');
    }
    if (this.to) {
        this.to = moment(this.to).format('D MMM YYYY');
    }
    next();
});

 

const Leaves = mongoose.model('Leaves', leavesSchema);
 
const Holiday = mongoose.model('Holiday', holidaySchema);
module.exports = { Leaves, Holiday ,LeavesType }
