const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    date: {
        type: String,
        required: true,
    },
    workSessions: [
        {
            punchIn: Date,
            punchOut: Date,
            status: String, // e.g., "Working", "Late"
        },
    ],
    breakSessions: [
        {
            punchIn: Date,
            punchOut: Date,
        },
    ],
    totalWorkHours: {
        type: Number,
        default: 0, // in minutes
    },
    totalBreakHours: {
        type: Number,
        default: 0, // in minutes
    },
    status: {
        type: String,
        default: "Present",
    },
});

module.exports = mongoose.model('Attendance', attendanceSchema);
