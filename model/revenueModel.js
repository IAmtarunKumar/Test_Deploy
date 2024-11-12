const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
    revenueId : String,
    totalIncome: {
        type: Number,
     },
    totalOutcome: {
        type: Number,
     },
    totalRevenue: {
        type: Number,
     },
    salesOverview: {
        totalSales: Number,
        totalRevenue: Number,
    },
    earningsPreviousMonth: Number,
    expensesPreviousMonth: Number,
    profitPreviousMonth: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt : { type: Date, default: Date.now }  
});

const Revenue = mongoose.model('Revenue', revenueSchema);

module.exports = Revenue;
