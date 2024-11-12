const express = require('express');
const router = express.Router();
 const {Category, Budgets,BudgetsExpenses,BudgetsRevenues } = require('../model/accountingModel');
 const multer = require("multer")
 const { uploadFileToFirebase , bucket} = require('../utils/fireBase');
const { auth } = require('../Middleware/authorization');
  const upload = multer({ storage: multer.memoryStorage() });
 


  //  GET all categories
router.get('/categories/get',auth, async (req, res) => {
    try {
      const categories = await Category.find();
      res.json(categories);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


    //  CREATE a new category
router.post('/categories/create',auth, async (req, res) => {
  try {
    const category = new Category(req.body); // Use req.body directly
    const newCategory = await category.save();
    res.status(200).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


  //  UPDATE a category using req.body
  router.post('/categories/update',auth, async (req, res) => {
    try {
        const { _id, ...updateData } = req.body;
        const updatedCategory = await Category.findOneAndUpdate(
          { _id },
          updateData,
          { new: true }
        );
        if (!updatedCategory) return res.status(404).json({ message: 'Category not found' });
        res.json(updatedCategory);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    });
  

  //  DELETE a category using req.body
  router.post('/categories/delete',auth, async (req, res) => {
    try {
        const { _id } = req.body;
        const deletedCategory = await Category.findOneAndDelete({ _id });
        if (!deletedCategory) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category deleted' });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });



// Get all budgets
router.get('/budgets/get',auth, async (req, res) => {
  try {
    const budgets = await Budgets.find();
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

 
// Create new budget
router.post('/budgets/create',auth, async (req, res) => {
    try {
       
      const newBudgets = new Budgets(req.body);
    console.log(req.body)
       const savedBudgets = await newBudgets.save();
      console.log("Budgets added and saved:", savedBudgets);
    
       return res.status(200).send({ message: 'Budgets created successfully', Budgets: savedBudgets });
    
    } catch (error) {
      console.error('Error adding files to Budgets:', error);
      return res.status(500).send({ message: `Internal server error: ${error.message}` });
    }
    });

// Update budget using _id in request body
router.post('/budgets/update',auth, async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    const updatedBudget = await Budgets.findOneAndUpdate(
      { _id},
      updateData,
      { new: true }
    );
    if (!updatedBudget) return res.status(404).json({ message: 'Budget not found' });
    res.json(updatedBudget);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete budget using _id from request body
router.post('/budgets/delete',auth, async (req, res) => {
  try {
    const { _id } = req.body;
    const deletedBudget = await Budgets.findOneAndDelete({ _id  });
    if (!deletedBudget) return res.status(404).json({ message: 'Budget not found' });
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Get all expenses
router.get('/expenses/get', async (req, res) => {
  try {
    const budgetsExpenses = await BudgetsExpenses.find()
      .populate('categoryName', 'categoryName'); // Populate only `categoryName` field from `Category`
    res.json(budgetsExpenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


 
// Create new expense
router.post('/expenses/create',auth,upload.array('file'), async (req, res) => {
  try {
      let fileUrls = [];
  
      if (req.files && req.files.length > 0) {
            const newFileUrls = await uploadFileToFirebase(req.files); 
            fileUrls = [...fileUrls, ...newFileUrls];  
  }
  
  const newExpenses = new BudgetsExpenses({
      ...req.body,           
      files: fileUrls     
    });
  console.log(req.body)
     const savedExpenses = await newExpenses.save();
    console.log("Expenses added and saved:", savedExpenses);
  
     return res.status(200).send({ message: 'Expenses created successfully', Expenses: savedExpenses });
  
  } catch (error) {
    console.error('Error adding files to Expenses:', error);
    return res.status(500).send({ message: `Internal server error: ${error.message}` });
  }
  });



router.post("/expenses/update", auth, upload.array('file'), async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    let fileUrls = [];

    // If there are new files, upload them
    if (req.files && req.files.length > 0) {
      const newFileUrls = await uploadFileToFirebase(req.files);
      fileUrls = [...fileUrls, ...newFileUrls];
    }

    // Find the current task
    const currentExpense = await BudgetsExpenses.findById(_id);
    if (!currentExpense) {
      return res.status(404).send("Expense not found");
    }

    // Prepare the update fields
    const updateFields = {
      ...updateData,
      files: fileUrls.length > 0 ? [...currentExpense.files, ...fileUrls] : currentExpense.files
    };

    // Update the task
    const updatedExpense = await BudgetsExpenses.findByIdAndUpdate(_id, updateFields, { new: true });

    return res.status(200).json({
      message: 'Expenses updated successfully',
      Expense: updatedExpense
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
});


// Delete expense using _id from request body
router.post('/expenses/delete',auth, async (req, res) => {
  try {
    const { _id } = req.body;
    const deletedExpense = await BudgetsExpenses.findOneAndDelete({ _id });
    if (!deletedExpense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



  // Get all revenues
router.get('/revenues/get',auth, async (req, res) => {
    try {
        const budgetsRevenues = await BudgetsRevenues.find()
          .populate('categoryName','categoryName')  // Populate the categoryName reference
     
        res.json(budgetsRevenues);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

// Create new revenue
router.post('/revenues/create',auth,upload.array('file'), async (req, res) => {
   try {
    let fileUrls = [];

    if (req.files && req.files.length > 0) {
          const newFileUrls = await uploadFileToFirebase(req.files); 
          fileUrls = [...fileUrls, ...newFileUrls];  
}

const newRevenues = new BudgetsRevenues({
    ...req.body,           
    files: fileUrls     
  });
console.log(req.body)
   const savedRevenues = await newRevenues.save();
  console.log("Revenues added and saved:", savedRevenues);

   return res.status(200).send({ message: 'Revenues created successfully', Revenues: savedRevenues });

} catch (error) {
  console.error('Error adding files to Revenues:', error);
  return res.status(500).send({ message: `Internal server error: ${error.message}` });
}
});

// Update revenue using revenueId in request body
router.post("/revenues/update", auth, upload.array('file'), async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    let fileUrls = [];

    // If there are new files, upload them
    if (req.files && req.files.length > 0) {
      const newFileUrls = await uploadFileToFirebase(req.files);
      fileUrls = [...fileUrls, ...newFileUrls];
    }

    // Find the current task
    const currentRevenues = await BudgetsRevenues.findById(_id);
    if (!currentRevenues) {
      return res.status(404).send("Revenues not found");
    }

    // Prepare the update fields
    const updateFields = {
      ...updateData,
      files: fileUrls.length > 0 ? [...currentRevenues.files, ...fileUrls] : currentRevenues.files
    };

    // Update the task
    const updatedRevenues = await BudgetsRevenues.findByIdAndUpdate(_id, updateFields, { new: true });

    return res.status(200).json({
      message: 'Revenues updated successfully',
      Revenues: updatedRevenues
    });
  } catch (error) {
    console.error("Error updating revenues:", error);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
});

// Delete revenue using revenueId from request body
router.post('/revenues/delete',auth, async (req, res) => {
  try {
    const { _id } = req.body;
    const deletedRevenue = await BudgetsRevenues.findOneAndDelete({ _id });
    if (!deletedRevenue) return res.status(404).json({ message: 'Revenue not found' });
    res.json({ message: 'Revenue deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});










  


  



module.exports = router;
