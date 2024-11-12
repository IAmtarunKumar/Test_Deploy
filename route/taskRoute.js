const express = require("express");
const route = express.Router();
const {auth} = require("../Middleware/authorization");
const Task = require("../model/taskModel");
const multer = require("multer")
const { uploadFileToFirebase , bucket} = require('../utils/fireBase');
const { logger } = require("../utils/logger");
const { Project } = require("../model/projectModel");
// const { Project } = require("../model/projectModel");
const upload = multer({ storage: multer.memoryStorage() });
 
// Create a new task
// route.post("/create", auth, async (req, res) => {
//   try {
 
//     const newTask = new Task(req.body);

//     await newTask.save();
//     return res.status(201).json(newTask);
//   } catch (error) {
//     console.error("Error creating task:", error);
//     return res.status(500).send(`Internal server error: ${error.message}`);
//   }
// });


// Fetch all tasks - Only assigned tasks for non-admins
route.get("/get", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const { roles, id } = req.user; // Extract user role and ID

    let query = {};
    if (roles !== "Admin") {
      // If the user is not an admin, only fetch tasks assigned to them
      query.assignedTo = id;
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email userId")
      .populate("project", "projectName projectId")
      .populate("assignedBy", "name email userId")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalTasks = await Task.countDocuments(query);

    res.status(200).json({
      tasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: parseInt(page),
      totalTasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
});

// Get a single task by ID - Only assigned tasks for non-admins
route.get("/get/:_id", auth, async (req, res) => {
  try {
    const { _id } = req.params;
    const { roles, id } = req.user; // Extract user role and ID

    // Find the task by ID
    const task = await Task.findById(_id)
      .populate("assignedTo", "name email userId")
      .populate("project", "projectName projectId")
      .populate("assignedBy", "name email userId");

    if (!task) {
      return res.status(404).send("Task not found");
    }

    // Check if the user has permission to view this task
    if (roles !== "Admin" && (!task.assignedTo || task.assignedTo._id.toString() !== id.toString())) {
      return res.status(403).send("Access denied: You are not authorized to view this task.");
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task by ID:", error);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
});




route.post("/create", auth, upload.array('file'), async (req, res) => {
  try {
     let fileUrls = [];

        if (req.files && req.files.length > 0) {
              const newFileUrls = await uploadFileToFirebase(req.files); 
              fileUrls = [...fileUrls, ...newFileUrls];  
    }

     const newTask = new Task({
      ...req.body,           
      files: fileUrls,           
       assignedBy:req.user.id, 


    });
    console.log(req.body)
     const savedTask = await newTask.save();
    console.log("Task added and saved:", savedTask);

     return res.status(200).send({ message: 'Task created successfully', Task: savedTask });

  } catch (error) {
    console.error('Error adding files to Task:', error);
    return res.status(500).send({ message: `Internal server error: ${error.message}` });
  }
});

 
// Update  
route.post("/update", auth, upload.array('file'), async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    let fileUrls = [];

    // If there are new files, upload them
    if (req.files && req.files.length > 0) {
      const newFileUrls = await uploadFileToFirebase(req.files);
      fileUrls = [...fileUrls, ...newFileUrls];
    }

    // Find the current task
    const currentTask = await Task.findById(_id);
    if (!currentTask) {
      return res.status(404).send("Task not found");
    }

    // Prepare the update fields
    const updateFields = {
      ...updateData,
      files: fileUrls.length > 0 ? [...currentTask.files, ...fileUrls] : currentTask.files
    };

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(_id, updateFields, { new: true });

    return res.status(200).json({
      message: 'Task updated successfully',
      Task: updatedTask
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
});



//  Delete  
route.post("/delete", auth, async (req, res) => {
  try {
    const { _id} = req.body;

    if (!_id || (Array.isArray(_id) && _id.length === 0)) {
      return res.status(400).send("No _id provided for deletion.");
    }

     const _idArray = Array.isArray(_id) ? _id : [_id];

    // Delete multiple items if _id is an array, otherwise delete a single item
    const deletedTasks = await Task.deleteMany({ _id: { $in: _idArray } });

    if (deletedTasks.deletedCount === 0) {
      return res.status(404).send("No Tasks found for the provided ID(s).");
    }

    return res.status(200).send({
      message: `${deletedTasks.deletedCount} Task deleted successfully.`,
      deletedTasks
    });
  } catch (error) {
    console.error("Error deleting Tasks:", error);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
});



route.post("/create-and-assign", auth, upload.array('file'), async (req, res) => {
  try {
    let fileUrls = [];

    // Handle file uploads to Firebase
    if (req.files && req.files.length > 0) {
      const newFileUrls = await uploadFileToFirebase(req.files);
      fileUrls = [...fileUrls, ...newFileUrls];
    }

    // Destructure project and other task data from the request body
    let { project, ...taskData } = req.body;

    // Check for both `assignedTo` and `userIds` fields in the request body
    let userIds = req.body.assignedTo || req.body.userIds;

    // If `assignedTo` or `userIds` is a single ID, convert it to an array
    if (!Array.isArray(userIds)) {
      userIds = [userIds];
    }

    // Create a single task with multiple assignees
    const newTask = new Task({
      ...taskData,
      files: fileUrls,
      assignedBy: req.user.id,
      assignedTo: userIds, // Assign multiple users in one task
      project: project,
    });

    const savedTask = await newTask.save();

    // Update the Project with the new task ID
    let updatedProject;
    if (project) {
      updatedProject = await Project.findByIdAndUpdate(
        project,
        { $push: { tasks: savedTask._id } }, // Add the single task ID
        { new: true, useFindAndModify: false }
      ).populate('tasks'); // Populate the tasks array with the full task details
    }

    return res.status(200).send({
      message: 'Task created and assigned successfully',
      project: updatedProject, // Send back the full updated project with all tasks
    });

  } catch (error) {
    console.error('Error creating and assigning tasks:', error);
    return res.status(500).send({
      message: `Internal server error: ${error.message}`,
    });
  }
});






route.get("/export", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, name, id, startDate, endDate } = req.query; // Extract search parameters and pagination
    const skip = (page - 1) * limit;
    const filterQuery = {};

    // Search filters
    if (name) {
      filterQuery.name = { $regex: new RegExp(name, 'i') }; // Case-insensitive search by name
    }

    // Check if the ID is a single value or multiple IDs (comma-separated string)
    if (id) {
      if (Array.isArray(id)) {
        // If multiple IDs are passed as an array
        filterQuery._id = { $in: id };
      } else if (id.includes(',')) {
        // If multiple IDs are passed as a comma-separated string
        const idArray = id.split(',').map((i) => i.trim());
        filterQuery._id = { $in: idArray };
      } else {
        // If a single ID is passed
        filterQuery._id = id;
      }
    }

    // Search by date range (startDate and endDate)
    if (startDate || endDate) {
      filterQuery.createdAt = {};
      if (startDate) {
        filterQuery.createdAt.$gte = new Date(startDate); // Tasks from startDate onwards
      }
      if (endDate) {
        filterQuery.createdAt.$lte = new Date(endDate); // Tasks until endDate
      }
    }

    // Fetch tasks based on search criteria with pagination
    const tasks = await Task.find(filterQuery)
      .populate("assignedTo", "name email")
      .populate("project", "name")
      .populate("assignedBy", "name email")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Count total tasks matching the search criteria
    const totalTasks = await Task.countDocuments(filterQuery);

    res.status(200).json({
      message: "Search results fetched successfully!",
      tasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: parseInt(page),
      totalTasks,
    });
  } catch (error) {
    console.error("Error exporting tasks:", error);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
});


module.exports = route;
