const express = require('express');
const router = express.Router();
const Salary = require('../model/payrollModel');

// Create or Update Salary
router.post('/post', async (req, res) => {
    try {
        const { _id } = req.body;

        // Calculate net salary by parsing req.body fields
        const totalEarnings = parseFloat(req.body.basic || "0") +
                              parseFloat(req.body.da || "0") +
                              parseFloat(req.body.hra || "0") +
                              parseFloat(req.body.conveyance || "0") +
                              parseFloat(req.body.allowance || "0") +
                              parseFloat(req.body.medicalAllowance || "0") +
                              parseFloat(req.body.otherEarnings || "0");

        const totalDeductions = parseFloat(req.body.tds || "0") +
                                parseFloat(req.body.esi || "0") +
                                parseFloat(req.body.pf || "0") +
                                parseFloat(req.body.leave || "0") +
                                parseFloat(req.body.professionalTax || "0") +
                                parseFloat(req.body.labourWelfare || "0") +
                                parseFloat(req.body.otherDeductions || "0");

        const netSalary = (totalEarnings - totalDeductions).toString();

        // Find salary record or create a new one if it doesn't exist
        let salary = await Salary.findOne({ _id });
        if (salary) {
            // Update existing salary record
            salary.set({ ...req.body, netSalary });
        } else {
            // Create new salary record
            salary = new Salary({ ...req.body, netSalary });
        }
        
        await salary.save();
        res.status(200).json({ message: 'Salary saved successfully', salary });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save salary data', details: error });
    }
});

// Get Salary for Employee
router.get('/salary/:_id', async (req, res) => {
    try {
        const { _id } = req.params;
        const salary = await Salary.findOne({ _id });
        if (!salary) return res.status(404).json({ error: 'Salary record not found' });
        
        res.status(200).json(salary);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve salary data', details: error });
    }
});

// Generate Payslip
router.get('/salary/:_id/payslip', async (req, res) => {
    try {
        const { _id } = req.params;
        const salary = await Salary.findOne({ _id });
        if (!salary) return res.status(404).json({ error: 'Salary record not found' });

        // Here, you can add code to format the salary information into a payslip
        res.status(200).json({ message: 'Payslip generated', salary });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate payslip', details: error });
    }
});

module.exports = router;
