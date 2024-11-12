const express = require('express');
const { Invoice ,Estimate} = require('../model/invoiceModel');
const {auth} = require('../Middleware/authorization');
const route = express.Router()



route.post('/invoice/post', auth, async (req, res) => {
    const invoice = new Invoice(req.body);
    try {
        const savedInvoice = await invoice.save();
        res.status(200).send(savedInvoice);
    } catch (error) {
        res.status(400).send(error);
    }
});


// Read (GET) - Fetch all invoices
route.get('/invoice/get',auth, async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ _id: -1 });
        res.status(200).send(invoices);
    } catch (error) {
        res.status(500).send(error);
    }
});


route.post('/invoice/update',auth, async (req, res) => {
    try {
    
const {_id }= req.body      
  const invoice = await Invoice.findByIdAndUpdate(_id, req.body, {
            new: true, // Return the updated document
         });
        if (!invoice) return res.status(404).send('Invoice not found');
        res.status(200).send(invoice);
    } catch (error) {
        res.status(400).send(error);
    }
});


// Delete (DELETE) - Remove an invoice
route.post("/invoice/delete", auth, async (req, res) => {
    try {
      const { _id} = req.body;
  
      if (!_id || (Array.isArray(_id) && _id.length === 0)) {
        return res.status(400).send("No _id provided for deletion.");
      }
  
       const _idArray = Array.isArray(_id) ? _id : [_id];
  
      // Delete multiple items if _id is an array, otherwise delete a single item
      const deletedInvoices = await Invoice.deleteMany({ _id: { $in: _idArray } });
  
      if (deletedInvoices.deletedCount === 0) {
        return res.status(404).send("No Invoices found for the provided ID(s).");
      }
  
      return res.status(200).send({
        message: `${deletedInvoices.deletedCount} Invoice deleted successfully.`,
        deletedInvoices
      });
    } catch (error) {
      console.error("Error deleting Invoices:", error);
      return res.status(500).send(`Internal server error: ${error.message}`);
    }
  });

/////////////////////////////////////////////// estimate ////////////////////////////////////////////////

// Create an estimate
route.post('/estimates/post',auth, async (req, res) => {
    try {
        const estimate = new Estimate(req.body);
        await estimate.save();
        res.status(201).json({
            message: 'Estimate created successfully',
            estimate,
        });
    } catch (error) {
        res.status(400).json({ message: 'Error creating estimate', error: error.message });
    }
});


// Get all estimates
route.get('/estimates/get',auth, async (req, res) => {
    try {
        const estimates = await Estimate.find();
        res.status(200).json(estimates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching estimates', error: error.message });
    }
});


// Update an estimate by ID
route.post('/estimates/update',auth, async (req, res) => {
    try {
        const estimate = await Estimate.findByIdAndUpdate(req.body._id, req.body, { new: true });
        if (!estimate) {
            return res.status(404).json({ message: 'Estimate not found' });
        }
        res.status(200).json({
            message: 'Estimate updated successfully',
            estimate,
        });
    } catch (error) {
        res.status(400).json({ message: 'Error updating estimate', error: error.message });
    }
});


// Delete an estimate by ID
route.post('/estimates/delete',auth, async (req, res) => {
    try {
        const estimate = await Estimate.findByIdAndDelete(req.body._id);
        if (!estimate) {
            return res.status(404).json({ message: 'Estimate not found' });
        }
        res.status(200).json({ message: 'Estimate deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting estimate', error: error.message });
    }
});


module.exports = route
