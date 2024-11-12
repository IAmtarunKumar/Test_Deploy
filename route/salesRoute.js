const express = require('express');
const router = express.Router();

const Sales = require('../models/Sales');
const multer = require("multer")
const { uploadFiles } = require("../fileUpload");
const {auth} = require('../Middleware/authorization');
const upload = multer({ storage: multer.memoryStorage() });

// Material routes

router.post('/uploadedImages', upload.array('file'), async (req, res) => {
  try {
 
    const fileUrls = await uploadFiles(req);
    const imgcreate = {
      image: fileUrls  
    };

     await imgcreate.save();

 
    return res.status(200).send({ msg: 'Images created successfully', imgcreate });
  } catch (error) {
    console.error('Error creating image:', error);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
});

// Create a new sale
router.post('/sales/create', auth, async (req, res) => {
  try {
    const newSale = new Sales(req.body);
    await newSale.save();
    return res.status(200).json(newSale);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get a list of all sales
router.get('/sales/list', auth, async (req, res) => {
  try {
    const sales = await Sales.find().populate('leadId').populate('createdBy');
    return res.status(200).json(sales);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Update an existing sale
router.put('/sales/update/:id', auth, async (req, res) => {
  try {
    const updatedSale = await Sales.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json(updatedSale);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Delete a sale
router.post("/delete", auth, async (req, res) => {
  try {
    const { _id} = req.body;

    if (!_id || (Array.isArray(_id) && _id.length === 0)) {
      return res.status(400).send("No _id provided for deletion.");
    }

     const _idArray = Array.isArray(_id) ? _id : [_id];

    // Delete multiple items if _id is an array, otherwise delete a single item
    const deletedSales = await Sales.deleteMany({ _id: { $in: _idArray } });

    if (deletedSales.deletedCount === 0) {
      return res.status(404).send("No Saless found for the provided ID(s).");
    }

    return res.status(200).send({
      message: `${deletedSales.deletedCount} Sales deleted successfully.`,
      deletedSales
    });
  } catch (error) {
    console.error("Error deleting Sales:", error);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
});

module.exports = router;
