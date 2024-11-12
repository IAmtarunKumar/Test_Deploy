const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryName: {type: String },
    // subCategoryName: {type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt : { type: Date, default: Date.now } 
  });


  const budgetsSchema = new mongoose.Schema({
    // taskId : String,
    budgetTitle: {type: String },
    budgetType: {type: String },
    startDate: {type: String },
    endDate: {type: String },
    expectedRevenues :[{
        revenueTitle: {type: String },
        revenueAmount: {type: String },
        totalRevenue: {type: String },

    }],
  
    expensesRevenues :[{
        expensesTitle: {type: String },
        expensesAmount: {type: String },
        totalExpenses: {type: String },
    }],
    expectedProfit:{type: String },
    taxAmount: {type: String },
    budgetAmount: {type: String },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt : { type: Date, default: Date.now } 
  });


  const BudgetsExpensesSchema = new mongoose.Schema({
    // taskId : String,
    note: {type: String },
    categoryName: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    // subCategoryName: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    amount: {type: String },
    expensesDate: {type: String },
    files:[{type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt : { type: Date, default: Date.now } 
  });

  
  const BudgetsRevenuesSchema = new mongoose.Schema({
    // taskId : String,
    note: {type: String },
    categoryName: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    // subCategoryName: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    amount: {type: String },
    //  expensesDate: {type: String },
    revenueDate:{type: String },
     files:[{type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt : { type: Date, default: Date.now } 
  });

  

  const BudgetsRevenues = mongoose.model('BudgetsRevenues', BudgetsRevenuesSchema );


  const BudgetsExpenses = mongoose.model('BudgetsExpenses', BudgetsExpensesSchema );

  

  const Category = mongoose.model('category', categorySchema );
  const Budgets = mongoose.model('budgets', budgetsSchema );

module.exports = {Category , Budgets ,BudgetsExpenses ,BudgetsRevenues}