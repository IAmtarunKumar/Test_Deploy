const express = require("express")
const { auth } = require("../Middleware/authorization");
const route = express.Router()
const dotenv = require("dotenv")
dotenv.config()
const multer = require("multer")
const { uploadFileToFirebase, bucket } = require('../utils/fireBase');
const { logger } = require("../utils/logger");
const { Project } = require("../model/projectModel");
const upload = multer({ storage: multer.memoryStorage() });
 

 
route.get('/get/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { _id, roles } = req.user;

    const project = await Project.findById(id)
      .populate("assignedTo", "name email userId")
      .populate("clientName", "name email userId")
      .populate({
        path: "tasks",
        populate: [
          { path: "assignedTo", select: "name email userId" },
          { path: "assignedBy", select: "name email userId" }
        ]
      });

    if (!project) 
      return res.status(404).json({ message: 'Project not found' });

    if (roles !== 'Admin' && (!project.assignedTo || project.assignedTo._id.toString() !== _id.toString())) {
      return res.status(403).json({ message: 'Access denied: You are not authorized to view this project.' });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error(`Error fetching project: ${error.message}`);
    res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
});




route.get('/get', auth, async (req, res) => {
  try {
    const { id, roles } = req.user;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let projects;
    let totalProjects;

    if (roles === 'Admin') {
      // Admin can see all projects
      projects = await Project.find()
        .populate("assignedTo", "name email userId")
        .populate("clientName", "name email userId")
        .populate({
          path: "tasks", // Change "task" to "tasks" to match the schema field
          populate: [
            { path: "assignedTo", select: "name email userId" },
            { path: "assignedBy", select: "name email userId" }
          ]
        })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      totalProjects = await Project.countDocuments();

    } else {
      // Non-admins can only see projects assigned to them
      projects = await Project.find({ assignedTo: id })
        .populate("assignedTo", "name email userId")
        .populate("clientName", "name email userId")
        .populate({
          path: "tasks", // Change "task" to "tasks"
          populate: [
            { path: "assignedTo", select: "name email userId" },
            { path: "assignedBy", select: "name email userId" }
          ]
        })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      console.log(projects);
      totalProjects = await Project.countDocuments({ assignedTo: id });
    }

    res.status(200).json({
      projects,
      totalPages: Math.ceil(totalProjects / limit),
      currentPage: parseInt(page),
      totalProjects,
    });

  } catch (error) {
    console.error(`Error fetching projects: ${error.message}`);
    res.status(500).send(`Internal server error: ${error.message}`);
  }
});


 

route.post("/post", auth, upload.array('file'), async (req, res) => {
  try {
    let fileUrls = [];

    if (req.files && req.files.length > 0) {
      const newFileUrls = await uploadFileToFirebase(req.files);
      fileUrls = [...fileUrls, ...newFileUrls];
    }

    const newProject = new Project({
      ...req.body,
      document: fileUrls
    });

    const savedProject = await newProject.save();
    console.log("Project added and saved:", savedProject);

    return res.status(200).send({ message: 'Project created successfully', project: savedProject });

  } catch (error) {
    console.error('Error adding files to project:', error);
    return res.status(500).send({ message: `Internal server error: ${error.message}` });
  }
});




route.post("/update", auth, upload.array('file'), async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;

    // Initialize file URLs
    let fileUrls = [];

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const newFileUrls = await uploadFileToFirebase(req.files);
      fileUrls = [...fileUrls, ...newFileUrls];
    }

    // Find the document by ID
    const currentDocument = await Project.findById(_id);

    if (!currentDocument) {
      return res.status(404).send("Document not found.");
    }

    // Prepare update object
    const updateFields = {
      $set: updateData,
    };

    // Append file URLs to the existing `document` field, if there are new files
    if (fileUrls.length > 0) {
      updateFields.$push = { document: { $each: fileUrls } };
    }

    // Update the document with new data and appended files
    const updatedDocument = await Project.findByIdAndUpdate(
      _id,
      updateFields,
      { new: true }
    );

    return res.status(200).send(updatedDocument);

  } catch (error) {
    console.error(`Error updating document: ${error.message}`);
    return res.status(500).send("Internal server error");
  }
});

 

route.post("/delete", auth, async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id || (Array.isArray(_id) && _id.length === 0)) {
      return res.status(400).send("No _id provided for deletion.");
    }

    const _idArray = Array.isArray(_id) ? _id : [_id];

    // Delete multiple items if _id is an array, otherwise delete a single item
    const deletedProjects = await Project.deleteMany({ _id: { $in: _idArray } });

    if (deletedProjects.deletedCount === 0) {
      return res.status(404).send("No Projects found for the provided ID(s).");
    }

    return res.status(200).send({
      message: `${deletedProjects.deletedCount} Project deleted successfully.`,
      deletedProjects
    });
  } catch (error) {
    console.error("Error deleting Projects:", error);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
});




// Assign a project to a user
route.post('/assign', auth, async (req, res) => {
  try {
    const { projectId, userId } = req.body;
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { assignedTo: userId },
      { new: true }
    );
    return res.status(200).json(updatedProject);
  } catch (error) {
    logger.error(`Error managing encryption keys: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
});


route.get("/export", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, name, id, startDate, endDate } = req.query; // Extract search parameters and pagination
    const skip = (page - 1) * limit;
    const filterQuery = {};

    // Search filters
    if (name) {
      filterQuery.name = { $regex: new RegExp(name, 'i') }; // Case-insensitive search by project name
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
        filterQuery.createdAt.$gte = new Date(startDate); // Projects from startDate onwards
      }
      if (endDate) {
        filterQuery.createdAt.$lte = new Date(endDate); // Projects until endDate
      }
    }

    // Fetch projects based on search criteria with pagination
    const projects = await Project.find(filterQuery)
      .populate("assignedTo", "name email")
      .populate("clientName", "name email")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Count total projects matching the search criteria
    const totalProjects = await Project.countDocuments(filterQuery);

    res.status(200).json({
      message: "Search results fetched successfully!",
      projects,
      totalPages: Math.ceil(totalProjects / limit),
      currentPage: parseInt(page),
      totalProjects,
    });
  } catch (error) {
    console.error("Error exporting projects:", error);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
});

 // Delete a single file within a project
route.post('/deleteFile', auth, async (req, res) => {
  const { _id, fileName } = req.body; // Expect project ID and file URL to delete

  if (!fileName) {
      return res.status(400).json({ message: 'fileName is required.' });
  }

  try {
      // Find the project by ID
      const project = await Project.findById(_id);
      if (!project) {
          return res.status(404).send({ message: 'Project not found' });
      }

      // Extract the file name from the URL
      const extractedFileName = fileName.split('?')[0].split('/').pop(); // Gets "491428495.png"
      console.log("Extracted File Name:", extractedFileName); // Debug log

      // Find the exact URL in the document array that contains the file name
      const fileUrlToDelete = project.document.find(fileUrl => {
          const existingFileName = fileUrl.split('?')[0].split('/').pop();
          return existingFileName === extractedFileName;
      });

      if (!fileUrlToDelete) {
          return res.status(404).send({ message: 'File not found in project.' });
      }

      // Delete the file from Firebase Storage using the extracted file name
      const file = bucket.file(extractedFileName); // Reference to Firebase file
      await file.delete(); // Delete file from Firebase

      // Remove the deleted file URL from the project document array
      project.document = project.document.filter(fileUrl => fileUrl !== fileUrlToDelete);
      await project.save();

      res.status(200).send({ message: 'File deleted successfully from project.' });
  } catch (error) {
      console.error('Error deleting project file:', error);
      res.status(500).send({ error: `Failed to delete file: ${error.message}` });
  }
});
module.exports = route
