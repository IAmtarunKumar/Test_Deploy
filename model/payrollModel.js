const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    basic: { type: String, default: "0" },
    da: { type: String, default: "0" }, // DA - Dearness Allowance (40%)
    hra: { type: String, default: "0" }, // HRA - House Rent Allowance (15%)
    conveyance: { type: String, default: "0" },
    allowance: { type: String, default: "0" },
    medicalAllowance: { type: String, default: "0" },
    otherEarnings: { type: String, default: "0" },
    tds: { type: String, default: "0" }, // TDS - Tax Deducted at Source
    esi: { type: String, default: "0" }, // ESI - Employee State Insurance
    pf: { type: String, default: "0" }, // PF - Provident Fund
    leave: { type: String, default: "0" },
    professionalTax: { type: String, default: "0" },
    labourWelfare: { type: String, default: "0" },
    otherDeductions: { type: String, default: "0" },
    netSalary: { type: String, default: "0" }, // Calculated field as string
}, { timestamps: true });

module.exports = mongoose.model('Salary', salarySchema);
