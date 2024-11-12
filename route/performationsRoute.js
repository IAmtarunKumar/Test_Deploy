const express = require('express');
const router = express.Router();
const { Resignation, Termination } = require('../model/performationsModel');
const { auth } = require('../Middleware/authorization');

// Route to add a new resignation
router.post('/resignation/post', auth, async (req, res) => {
    try {
        const { noticeDate, resignationDate, ...otherData } = req.body;
        
        const resignation = new Resignation({
            ...otherData,
            noticeDate: new Date(noticeDate),
            resignationDate: new Date(resignationDate),
            employee: req.user._id  // Assign the logged-in user's ID to the employee field
        });

        await resignation.save();
        res.status(201).json({ message: 'Resignation added successfully', resignation });
    } catch (error) {
        res.status(500).json({ message: 'Error adding resignation', error });
    }
});

// Route to get all resignations (Admins only, otherwise only the user's own resignations)
router.get('/resignation/getAll', auth, async (req, res) => {
  try {
      const { roles, _id: userId } = req.user;
      let query = roles === 'Admin' ? {} : { employee: userId };

      const resignations = await Resignation.find(query)
          .populate('employee', 'name userId')
          .populate('department', 'departments')
          .sort({ _id: -1 });

      res.status(200).json(resignations);
  } catch (error) {
      console.error("Error retrieving resignations:", error);
      res.status(500).json({ message: 'Error retrieving resignations', error: error.message });
  }
});

// Route to get a specific resignation by ID
router.get('/resignation/getSingle/:_id', auth, async (req, res) => {
    try {
        const { roles, _id: userId } = req.user;
        
        const resignation = await Resignation.findById(req.params._id)
            .populate('employee', 'name userId');
        
        if (!resignation) return res.status(404).json({ message: 'Resignation not found' });

        if (roles !== 'Admin' && resignation.employee._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Access denied: Unauthorized to view this resignation.' });
        }

        res.status(200).json(resignation);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving resignation', error });
    }
});

// Route to update a resignation (Admins only, or the user's own resignation)
router.post('/resignation/update', auth, async (req, res) => {
    try {
      const { roles, _id: userId } = req.user;
      const { _id, ...updateData } = req.body;

      const resignation = await Resignation.findById(_id);
      if (!resignation) return res.status(404).json({ message: 'Resignation not found' });

      if (roles !== 'Admin' && resignation.employee.toString() !== userId.toString()) {
          return res.status(403).json({ message: 'Access denied: Unauthorized to update this resignation.' });
      }

      const updatedResignation = await Resignation.findByIdAndUpdate(_id, updateData, { new: true });
      res.json(updatedResignation);
    } catch (error) {
      console.error("Error updating resignation:", error);
      res.status(500).json({ message: 'Error updating resignation', error });
    }
});

// Route to delete a resignation (Admins only, or the user's own resignation)
router.post("/resignation/delete/:_id", auth, async (req, res) => {
  try {
      const { roles, _id: userId } = req.user;
      const { _id } = req.params;

      const resignation = await Resignation.findById(_id);
      if (!resignation) return res.status(404).json({ message: 'Resignation not found' });

      if (roles !== 'Admin' && resignation.employee.toString() !== userId.toString()) {
          return res.status(403).json({ message: 'Access denied: Unauthorized to delete this resignation.' });
      }

      await resignation.deleteOne();
      res.status(200).send({ message: 'Resignation deleted successfully.' });
  } catch (error) {
      console.error("Error deleting resignation:", error);
      res.status(500).send({ message: `Internal server error: ${error.message}` });
  }
});

///////////////////////////////////////// Termination //////////////////////////////////

// Route to add a new termination
router.post('/termination/post', auth, async (req, res) => {
    try {
        const { noticeDate, terminationDate, ...otherData } = req.body;

        const termination = new Termination({
            ...otherData,
            noticeDate: new Date(noticeDate),
            terminationDate: new Date(terminationDate)
         });

        await termination.save();
        res.status(201).json({ message: 'Termination added successfully', termination });
    } catch (error) {
        res.status(500).json({ message: 'Error adding termination', error });
    }
});

// Route to get all terminations (Admins only, otherwise only the user's own terminations)
router.get('/termination/getAll', auth, async (req, res) => {
  try {
      const { roles, _id: userId } = req.user;
      let query = roles === 'Admin' ? {} : { employee: userId };

      const terminations = await Termination.find(query)
          .populate('employee', 'name userId')
          .populate('department', 'departments')
          .sort({ _id: -1 });

      res.status(200).json(terminations);
  } catch (error) {
      console.error("Error retrieving terminations:", error);
      res.status(500).json({ message: 'Error retrieving terminations', error: error.message });
  }
});

// Route to get a specific termination by ID
router.get('/termination/getSingle/:_id', auth, async (req, res) => {
    try {
        const { roles, _id: userId } = req.user;
        
        const termination = await Termination.findById(req.params._id)
            .populate('employee', 'name userId');
        
        if (!termination) return res.status(404).json({ message: 'Termination not found' });

        if (roles !== 'Admin' && termination.employee._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Access denied: Unauthorized to view this termination.' });
        }

        res.status(200).json(termination);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving termination', error });
    }
});

// Route to update a termination (Admins only, or the user's own termination)
router.post('/termination/update', auth, async (req, res) => {
    try {
      const { roles, _id: userId } = req.user;
      const { _id, ...updateData } = req.body;

      const termination = await Termination.findById(_id);
      if (!termination) return res.status(404).json({ message: 'Termination not found' });

      if (roles !== 'Admin' && termination.employee.toString() !== userId.toString()) {
          return res.status(403).json({ message: 'Access denied: Unauthorized to update this termination.' });
      }

      const updatedTermination = await Termination.findByIdAndUpdate(_id, updateData, { new: true });
      res.json(updatedTermination);
    } catch (error) {
      console.error("Error updating termination:", error);
      res.status(500).json({ message: 'Error updating termination', error });
    }
});

// Route to delete a termination (Admins only, or the user's own termination)
router.post("/termination/delete/:_id", auth, async (req, res) => {
  try {
      const { roles, _id: userId } = req.user;
      const { _id } = req.params;

      const termination = await Termination.findById(_id);
      if (!termination) return res.status(404).json({ message: 'Termination not found' });

      if (roles !== 'Admin' && termination.employee.toString() !== userId.toString()) {
          return res.status(403).json({ message: 'Access denied: Unauthorized to delete this termination.' });
      }

      await termination.deleteOne();
      res.status(200).send({ message: 'Termination deleted successfully.' });
  } catch (error) {
      console.error("Error deleting termination:", error);
      res.status(500).send({ message: `Internal server error: ${error.message}` });
  }
});

module.exports = router;
