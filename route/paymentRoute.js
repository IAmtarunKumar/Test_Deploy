const express = require('express');
const router = express.Router();
const { Payment, Expenses } = require('../model/paymentModel');
const { auth } = require('../Middleware/authorization');
const multer = require("multer");
const { uploadFileToFirebase } = require('../utils/fireBase');
const upload = multer({ storage: multer.memoryStorage() });

// Payment CRUD Operations

// Route to create a new payment
router.post('/payments/post', auth, async (req, res) => {
  try {
    const newPayment = new Payment({
      ...req.body,
      userId: req.user._id, // Associate payment with the logged-in user
    });
    await newPayment.save();
    res.status(200).json(newPayment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating payment' });
  }
});

// Route to get all payments - Admins get all payments, non-admins only get their own
router.get('/payments/get', auth, async (req, res) => {
  try {
    const { roles, _id: userId } = req.user;
    const query = roles === 'Admin' ? {} : { userId };

    const payments = await Payment.find(query)
      .populate('client invoiceID userId')
      .sort({ _id: -1 });

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching payments' });
  }
});

// Route to update a payment - Admins can update any, others only their own
router.post('/payments/update', auth, async (req, res) => {
  try {
    const { roles, _id: userId } = req.user;
    const { _id, ...updateData } = req.body;

    const payment = await Payment.findById(_id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (roles !== 'Admin' && payment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied: Unauthorized to update this payment.' });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(_id, updateData, { new: true });
    res.status(200).json(updatedPayment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating payment' });
  }
});

// Route to delete payments - Admins can delete any, others only their own
router.post("/payments/delete", auth, async (req, res) => {
  try {
    const { roles, _id: userId } = req.user;
    const { _id } = req.body;

    const payment = await Payment.findById(_id);
    if (!payment) {
      return res.status(404).send("Payment not found.");
    }

    if (roles !== 'Admin' && payment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied: Unauthorized to delete this payment.' });
    }

    await payment.deleteOne();
    res.status(200).send({ message: 'Payment deleted successfully.' });
  } catch (error) {
    console.error("Error deleting Payment:", error);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
});

// Expenses CRUD Operations

// Route to create a new expense
router.post("/sales/expenses/post", auth, upload.array('file'), async (req, res) => {
  try {
    let fileUrls = [];
    if (req.files && req.files.length > 0) {
      const newFileUrls = await uploadFileToFirebase(req.files);
      fileUrls = [...fileUrls, ...newFileUrls];
    }

    const newExpenses = new Expenses({
      ...req.body,
      files: fileUrls,
      userId: req.user._id, // Associate expense with the logged-in user
    });

    const savedExpenses = await newExpenses.save();
    res.status(200).send({ message: 'Expenses created successfully', Expenses: savedExpenses });
  } catch (error) {
    console.error('Error adding files to Expenses:', error);
    return res.status(500).send({ message: `Internal server error: ${error.message}` });
  }
});

// Route to get all expenses - Admins get all expenses, non-admins only get their own
router.get('/sales/expenses/get', auth, async (req, res) => {
  try {
    const { roles, _id: userId } = req.user;
    const query = roles === 'Admin' ? {} : { userId };

    const expenses = await Expenses.find(query);
    res.status(200).json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching expenses' });
  }
});

// Route to update an expense - Admins can update any, others only their own
router.post('/sales/expenses/update', auth, upload.array('file'), async (req, res) => {
  try {
    const { roles, _id: userId } = req.user;
    const { _id, ...updateData } = req.body;

    let fileUrls = [];
    if (req.files && req.files.length > 0) {
      const newFileUrls = await uploadFileToFirebase(req.files);
      fileUrls = [...fileUrls, ...newFileUrls];
    }

    const expense = await Expenses.findById(_id);
    if (!expense) {
      return res.status(404).send("Expense not found.");
    }

    if (roles !== 'Admin' && expense.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied: Unauthorized to update this expense.' });
    }

    const updateFields = {
      ...updateData,
      files: fileUrls.length > 0 ? [...expense.files, ...fileUrls] : expense.files
    };

    const updatedExpense = await Expenses.findByIdAndUpdate(_id, updateFields, { new: true });
    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error(`Error updating expense: ${error.message}`);
    return res.status(500).send("Internal server error");
  }
});

// Route to delete an expense - Admins can delete any, others only their own
router.post('/sales/expenses/delete', auth, async (req, res) => {
  try {
    const { roles, _id: userId } = req.user;
    const { _id } = req.body;

    const expense = await Expenses.findById(_id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    if (roles !== 'Admin' && expense.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied: Unauthorized to delete this expense.' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: 'Error deleting expense' });
  }
});

module.exports = router;


// router.post('/taxes/post',auth, async (req, res) => {
//   try {
//      const newTaxes = new Taxes( req.body );
//     await newTaxes.save();
//     res.status(200).json(newTaxes);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error creating Taxes' });
//   }
// });

// router.get('/taxes/get',auth, async (req, res) => {
//   try {
//     const taxes = await Taxes.find().sort({ _id: -1 });  
//     res.json(taxes);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error fetching taxes' });
//   }
// });

// router.post('/taxes/update',auth, async (req, res) => {
//   try {
//     const { _id, ...updateData } = req.body;

//     const taxesUpdate = await Taxes.findByIdAndUpdate(_id, updateData, { new: true });
//     if (!taxesUpdate) {
//       return res.status(404).json({ error: 'Payment not found' });
//     }
//     res.status(200).json(taxesUpdate);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error updating payment' });
//   }
// });


// router.post("/taxes/delete", auth, async (req, res) => {
//   try {
//     const { _id} = req.body;

//     if (!_id || (Array.isArray(_id) && _id.length === 0)) {
//       return res.status(400).send("No _id provided for deletion.");
//     }

//      const _idArray = Array.isArray(_id) ? _id : [_id];

//     // Delete multiple items if _id is an array, otherwise delete a single item
//     const deletedtaxes = await Taxes.deleteMany({ _id: { $in: _idArray } });

//     if (deletedtaxes.deletedCount === 0) {
//       return res.status(404).send("No taxes found for the provided ID(s).");
//     }

//     return res.status(200).send({
//       message: `${deletedtaxes.deletedCount} Payment deleted successfully.`,
//       deletedtaxes
//     });
//   } catch (error) {
//     console.error("Error deleting taxes:", error);
//     return res.status(500).send(`Internal server error: ${error.message}`);
//   }
// });
 