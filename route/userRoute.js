const express = require("express")
const {User  } = require('../model/userModel')
const { uploadFileToFirebase , bucket} = require('../utils/fireBase');
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv");
const {auth} = require("../Middleware/authorization");
 const multer = require('multer');
 const { logger } = require("../utils/logger");
const sendOTPEmail = require("../utils/mailSent");
const { Project } = require("../model/projectModel");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); 
const route = express.Router()
const ExcelJS = require('exceljs');

dotenv.config()
 
// Generate OTP
function generateOtp() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }


// User Registration API
route.post("/register", async (req, res) => {
  try {
    const { name, email, mobile, password, roles } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create and save the user
    const user = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
      roles,
    });

    await user.save();
    res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Registration Error:", error.message);
    res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
});

// User Login API
route.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the entered password matches the stored hashed password
    const isPasswordMatch = await bcryptjs.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid login credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { user: { id: user._id, roles: user.roles } },
      process.env.SECRET_KEY,
      { expiresIn: "9h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        roles: user.roles,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});


route.post("/sendResetOtp", async (req, res) => {
    // console.log("calling api sent opt")
    const { email } = req.body;
  // console.log(req.body)
    if (!email) {
      return res.status(400).send("Email is required.");
    }
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(400).send("User not found.");
      
      const otp = generateOtp();
  console.log(otp)
  user.currentOtp = otp;
      await user.save();
  
      // Send OTP email
      sendOTPEmail(user.email, otp);
  // console.log(otp)
      res.status(200).json({message:"OTP sent to email successfully."});
    } catch (error) {
      console.error("Internal server error:", error.message);
      res.status(500).send("Internal server error");
    }
  });


route.post('/verifyOtp', async (req, res) => {
  const { email, currentOtp } = req.body;
  // console.log(req.body)
  if (!email || !currentOtp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    // Find user by email and OTP
    const user = await User.findOne({ email: email.toLowerCase(), currentOtp });

    if (!user) {
      return res.status(404).json({ message: 'User not found or invalid OTP' });
    }

    // Mark the user as verified
    // user.registrationVerified = true;
    user.currentOtp = null; // Clear OTP after verification
    await user.save();

    res.status(200).json({
      message: 'OTP verified successfully. User is now registered.',
    });
  } catch (error) {
    logger.error(`Error managing encryption keys: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});


 

route.get("/roles/get", auth, async (req, res) => {
  try {
      const { roles, id } = req.user; // Get the user's roles and id from the authenticated request
      const role = await User.find({ roles: roles, _id: id }); // Find users by roles and id

      // Return the roles
      return res.status(200).json( {role} );
  } catch (error) {
      console.error('Error fetching user roles:', error);
      return res.status(500).send(`Internal server error: ${error.message}`);
  }
});


 



// update Admin / user By Id 
route.post("/update", auth, upload.single('image'), async (req, res) => {
  try {
    console.log("Request Payload:", req.body); // Log to verify the incoming data
    const { _id, ...updateData } = req.body;

    // Check if the User exists
    const existingUser = await User.findById(_id);
    if (!existingUser) {
      return res.status(404).send({ msg: 'User not found' });
    }
  
    let fileUrl = existingUser.image || ""; // Initialize with the existing image URL if it exists

    // Process the uploaded file
    if (req.file) {
      // Upload new file to Firebase Storage and get the URL
      const uploadedUrls = await uploadFileToFirebase(req.file); // This will return an array of URLs
      fileUrl = uploadedUrls[0]; // Get the first URL since we're uploading only a single file
    }

    // Include the updated image URL in the update data
    updateData.image = fileUrl; // Assign a single string, not an array

    // Update the user with the new data
    const updatedUser = await User.findByIdAndUpdate(_id, updateData, { new: true });
    
    if (!updatedUser) {
      return res.status(500).send({ msg: 'Error updating user data' });
    }

    // Return the updated user details
    return res.status(200).send({ msg: 'User updated successfully', updatedUser });

  } catch (error) {
    console.error('Error updating User:', error);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
});
1




route.post('/resetPassword', auth, async (req, res) => {
  const { email, currentOtp, newPassword } = req.body;

  if (!email || !currentOtp || !newPassword) {
    return res.status(400).send("Email, OTP, and new password are required.");
  }

  try {
    let user = await User.findOne({ email, currentOtp });

    if (!user) {
      return res.status(404).send("Invalid OTP or User not found.");
    }

    if (!user.passwordResetApproved) {
      return res.status(200).send("Password reset request not approved by admin.");
    }

    const hashNewPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashNewPassword;
    user.currentOtp = null; // Clear OTP after reset
    user.passwordResetApproved = false; // Reset approval flag

    await user.save();

    res.status(200).send("Your password changed successfully.");
  } catch (error) {
    logger.error(`Error managing encryption keys: ${error.message}`);
        res.status(500).send("Internal server error");
  }
});


 
route.get('/data/get', auth, async (req, res) => {
  try {
    const { roles, id } = req.user; // Extract the roles and id from the authenticated user
    // console.log("req.user", req.user);

    // Get page and limit from query parameters or set default values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let users;

    if (roles === "Admin") {
      // Fetch employees with assigned project details populated
      const employees = await User.find({ roles: { $in: ["Employee", "Supervisor"] } })
        .populate("assigned", "projectName projectId")
        .populate("departments", "departments")
        .populate("designations", "designations")
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

      // Fetch clients with pagination applied
      const clients = await User.find({ roles: "Client" })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

      users = { employees, clients };

    } 
    
     else if (roles === "Employee") {
      // Fetch employee's assigned projects based on user ID
      const employee = await User.find({ _id: id })
        .populate("assigned", "projectName projectId")
        .populate("clientName", "name userId")
        .populate("departments", "departments")
        .populate("designations", "designations")
        .sort({ _id: -1 });
 
      users = { employee };

    } else if (roles === "Supervisor") {
      // Fetch employees managed by the supervisor
      const employees = await User.find({ roles: "Employee" })
      .populate("assigned", "projectName projectId")
      .populate("clientName", "name userId")
      .populate("departments", "departments")
      .populate("designations", "designations")
              .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

      const clients = await User.find({ roles: "Client" })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

      users = { employees, clients };

    } else {
      return res.status(403).send('Access denied: roles not recognized.');
    }

    // Get the total count of employee records for pagination metadata
    const totalEmployees = await User.countDocuments({ roles: { $in: ["Employee", "Supervisor"] } });

    // Return the sorted user lists along with pagination metadata
    res.status(200).json({
      users,
      totalEmployees,
      currentPage: page,
    });

  } catch (error) {
    console.error(`Error fetching users: ${error.message}`);
    res.status(500).send(`Internal server error: ${error.message}`);
  }
});



route.get('/get/:id', auth, async (req, res) => {
  try {
    const { id } = req.params; // Get the project ID from the request parameters
// console.log(id)
     const user = await User.findById(id)
     .populate("assigned", "projectName projectId")
     .populate("clientName", "name userId")
     .populate("departments", "departments")
     .populate("designations", "designations")
         if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    logger.error(`Error fetching user: ${error.message}`);
    res.status(400).send(`Internal server error: ${error.message}`);
  }
});

 

route.post('/post', auth, async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log full request body
    console.log("Contact Name:", req.body.contactName); // Log each field separately
    console.log("Contact Email:", req.body.contactEmail);
    console.log("Contact Mobile:", req.body.contactMobile);

    if (req.body.password) {
      req.body.password = await bcryptjs.hash(req.body.password, 10);
    }

    const user = new User(req.body);
    await user.save();

    res.status(200).send(user);
  } catch (error) {
    console.error(`Error creating user: ${error.message}`);
    res.status(400).send(`Internal server error: ${error.message}`);
  }
});





route.post("/delete", auth, async (req, res) => {
  try {
    const { _id} = req.body;

    if (!_id || (Array.isArray(_id) && _id.length === 0)) {
      return res.status(400).send("No _id provided for deletion.");
    }

     const _idArray = Array.isArray(_id) ? _id : [_id];

    // Delete multiple items if _id is an array, otherwise delete a single item
    const deletedUsers = await User.deleteMany({ _id: { $in: _idArray } });

    if (deletedUsers.deletedCount === 0) {
      return res.status(404).send("No Users found for the provided ID(s).");
    }

    return res.status(200).send({
      message: `${deletedUsers.deletedCount} User deleted successfully.`,
      deletedUsers
    });
  } catch (error) {
    console.error("Error deleting Users:", error);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
});



route.get("/roles", auth, async (req, res) => {
    try {
        console.log("Authentication Middleware Called");
        console.log("User Object:", req.user); // Log user object

        const { roles, _id } = req.user; // Extract the roles from req.user
        console.log("User roles:", roles); // Log the extracted roles

        // Check for both roles and _id
        if (!roles || !_id) {
            return res.status(400).send({ message: "roles or ID not found" });
        }

        return res.status(200).send({ roles, _id }); // Send back the user's roles
    } catch (error) {
        logger.error(`Error fetching user roles: ${error.message}`);
        return res.status(500).send({ message: "Internal server error", error: error.message });
    }
});


 
// Update bank details route
route.post('/update-bank-details', auth, async (req, res) => {
  try {
    const { _id, bankDetails } = req.body;

    const user = await User.findByIdAndUpdate(_id, { bankDetails }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Bank details updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Delete bank details route
route.post('/delete-bank-details', auth, async (req, res) => {
  try {
    const { _id } = req.body;

    const user = await User.findByIdAndUpdate(_id, { bankDetails: null }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Bank details deleted successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


route.post('/file/delete',auth, async (req, res) => {
  const fileName = req.query.fileName; // or req.body.fileName if using POST
  if (!fileName) {
      return res.status(400).send('File name is required.');
  }

  try {
      const file = bucket.file(fileName);
      await file.delete();
      res.status(200).send({ message: `File ${fileName} deleted successfully.` });
  } catch (error) {
      res.status(500).send({ error: `Failed to delete file: ${error.message}` });
  }
});






route.post('/create',auth, upload.array('file'),async (req, res) => {
  try {
    // const { image } = req.body;

    // Initialize fileUrls for demo
    let fileUrls = [];

    // Check if files were uploaded
    if (req.files && req.files.length > 0) {
      // Upload new files to Firebase Storage and get their URLs
      const newFileUrls = await uploadFileToFirebase(req.files);
      fileUrls = newFileUrls;
        }

          // Validate fileUrls to ensure it is a flat array of strings
      if (!Array.isArray(fileUrls) || fileUrls.some(url => typeof url !== 'string')) {
        throw new Error('Invalid file URLs format');
    }

    // Create a demo work update object
    const imgcreate = {
      image: fileUrls // Array of demo image URLs
    };
    await imgcreate.save();
    // Send success response with the demo work update
    return res.status(200).send({ msg: 'Images  created successfully', imgcreate});
  } catch (error) {
    logger.error(`Error managing encryption keys: ${error.message}`);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
});







route.get("/attendance",auth,async(req,res)=>{
try {
  const roles = req.user.roles
  const getEmployee = await User.find({roles})
  return res.status(200).json(getEmployee)
} catch (error) {
  return res.status(400).send(error.message)
}
})

// error email or mobile
const uploadss = multer(); // This will handle `FormData` without saving the files

route.post("/error", auth, async (req, res) => {
  try {
    // console.log(req.body, "frontEnd")
    const { mobile, email } = req.body;
    // console.log(req.body, "BackendEnd")
    // console.log(email, "Email")
    // console.log(mobile, "Mobile")

    const existingUser = await User.findOne({
      $or: [{ mobile: mobile }, { email: email }],
    });
    // console.log("existingUser", existingUser);

    if (existingUser) {
      return res.status(409).send("Mobile or Email already exists.");
    } else {
      return res.status(200).send("No existing User found. You can proceed.");
    }
  } catch (error) {
    console.error("Error assigning Users:", error);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
});


 

// route.get("/export", auth, async (req, res) => {
//   const { id, roles } = req.user;

//   try {
//     const {
//       data,
//       key,
//       value,
//       userId,
//       ids,        // ids could be a string or an array
//       name,
//       page = 1,
//       limit = 10,
//       format 
//     } = req.query;

//     if (!data) {
//       return res.status(400).json({ error: "Missing data parameter" });
//     }

//     let filterQuery = {};
//     const skip = (page - 1) * limit;

//     // Check if ids is an array or a string that needs to be split
//     if (ids) {
//       if (Array.isArray(ids)) {
//         filterQuery._id = { $in: ids };  // Use it directly if it's already an array
//       } else {
//         filterQuery._id = { $in: ids.split(',') };  // Split it if it's a comma-separated string
//       }
//     }

//     // Handle specific user filtering by userId (if present)
//     if (userId) {
//       filterQuery.userId = { $regex: new RegExp(userId, 'i') }; // Flexible userId search
//     }

//     // Handle dynamic filtering based on key-value pairs (e.g., status=Active)
//     if (key && value) {
//       filterQuery[key] = { $regex: new RegExp(value, 'i') }; // Case-insensitive filtering
//     }

//     let UsersData;

//     if (data === "all") {
//       if (roles === "Admin" || roles === "Supervisor") {
//         // Fetch Users Data with Pagination
//         UsersData = await User.find(filterQuery)
//           .skip(skip)
//           .limit(parseInt(limit));

//         const totalCount = await User.countDocuments(filterQuery);

//         // Check if the request asks for Excel file download
//         if (format === 'excel') {
//           return generateExcelFile(res, UsersData, totalCount);
//         }

//         // Return normal JSON response if not Excel
//         return res.status(200).json({
//           message: "Users fetched successfully!",
//           data: UsersData,
//           totalCount,
//           totalPages: Math.ceil(totalCount / limit),
//           currentPage: page,
//         });

//       } else if (roles === "Employee") {
//         const employeeDetails = await User.findOne({ _id: id });
//         const projects = await Project.find({ assignedTo: id });
//         const clients = await User.find({ assignedTo: id });

//         UsersData = {
//           employeeDetails,
//           projects,
//           clients,
//         };

//         return res.status(200).json({
//           message: "Employee data fetched successfully!",
//           data: UsersData,
//         });

//       } else {
//         return res.status(403).send("Unauthorized.");
//       }

//     } else if (data === "search") {
//       if (!userId && !name) {
//         return res.status(400).json({ error: "Missing search parameters: userId or name" });
//       }

//       let searchQuery = {};

//       if (userId) {
//         searchQuery.userId = { $regex: new RegExp(userId, "i") }; 
//       }
//       if (name) {
//         searchQuery.name = { $regex: new RegExp(name, "i") };
//       }

//       if (roles === "Admin" || roles === "Supervisor") {
//         UsersData = await User.find(searchQuery)
//           .skip(skip)
//           .limit(parseInt(limit));

//         const totalCount = await User.countDocuments({ ...filterQuery, ...searchQuery });

//         if (format === 'excel') {
//           return generateExcelFile(res, UsersData, totalCount);
//         }

//         return res.status(200).json({
//           message: "Search results fetched successfully!",
//           data: UsersData,
//           totalCount,
//           totalPages: Math.ceil(totalCount / limit),
//           currentPage: page,
//         });

//       } else if (roles === "Employee") {
//         const employeeDetails = await User.findOne({
//           _id: id,
//           ...searchQuery,
//         });
//         const projects = await Project.find({ assignedTo: id });
//         const clients = await User.find({ assignedTo: id });

//         UsersData = {
//           employeeDetails,
//           projects,
//           clients,
//         };

//         return res.status(200).json({
//           message: "Search results fetched successfully!",
//           data: UsersData,
//         });

//       } else {
//         return res.status(403).send("Unauthorized.");
//       }

//     } else {
//       return res.status(400).json({ error: "Invalid data parameter" });
//     }
//   } catch (error) {
//     console.error("Error fetching/exporting Users:", error);
//     return res.status(500).json({ error: `Internal server error: ${error.message}` });
//   }
// });


// // Function to generate and send Excel file
// const generateExcelFile = async (res, UsersData, totalCount) => {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet('Users Data');

//   // Define the columns for the Excel file
//   worksheet.columns = [
//     { header: 'ID', key: 'userId', width: 20 },
//     { header: 'Name', key: 'name', width: 30 },
//     { header: 'Email', key: 'email', width: 30 },
//     { header: 'Mobile', key: 'mobile', width: 30 },
//     { header: 'Role', key: 'role', width: 20 },
//     { header: 'Designation', key: 'designation', width: 30 },
//     { header: 'Department', key: 'department', width: 30 },
//     { header: 'Status', key: 'status', width: 30 },
//     { header: 'Joining Date', key: 'joiningDate', width: 30 },
//     { header: 'DOB', key: 'DOB', width: 30 },
//     { header: 'Created At', key: 'createdAt', width: 20 },
//   ];

//   // Add user data to worksheet
//   UsersData.forEach(user => {
//     worksheet.addRow({
//       _id: user._id.toString(),
//       name: user.name,
//       email: user.email,
//       mobile: user.mobile,
//       email: user.email,
//       role: user.role,
//       designation: user.designation, 
//       department: user.department, 
//       status: user.status, 
//       joiningDate: user.joiningDate,
//       DOB: user.DOB,
//       createdAt: user.createdAt.toISOString().split('T')[0], // Format date
//     });
//   });

//   // Add total count in the last row
//   worksheet.addRow({});
//   worksheet.addRow({ _id: '', name: 'Total Users:', email: totalCount });

//   // Set headers for file download
//   res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//   res.setHeader('Content-Disposition', 'attachment; filename="users-data.xlsx"');

//   // Write workbook to response stream
//   await workbook.xlsx.write(res);
//   res.end();
// };




/////////////////////////////  assets /////////////////////////////////////////////

// CREATE a new asset
// route.post("/assets/create", auth, upload.array('file'), async (req, res) => {
//   try {
//      let fileUrls = [];

//         if (req.files && req.files.length > 0) {
//               const newFileUrls = await uploadFileToFirebase(req.files); 
//               fileUrls = [...fileUrls, ...newFileUrls];  
//     }

//      const newAsset = new Asset({
//       ...req.body,           
//       files: fileUrls,           
//        assignedBy:req.user.id, 


//     });
//     // console.log(req.body)
//      const savedAsset = await newAsset.save();
//     // console.log("Asset added and saved:", savedAsset);

//      return res.status(200).send({ message: 'Asset created successfully', Asset: savedAsset });

//   } catch (error) {
//     console.error('Error adding files to Asset:', error);
//     return res.status(500).send({ message: `Internal server error: ${error.message}` });
//   }
// });

// // READ all assets (Admin-only access)
// route.get('/assets/get',auth, async (req, res) => {
//   try {
//     const assets = await Asset.find();
//     res.json(assets);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // READ a single asset by ID
// route.get('/assets/:id',auth, async (req, res) => {
//   try {
//     const asset = await Asset.findById(req.params.id);
//     if (!asset) 
//       return res.status(404).json({ message: 'Asset not found' });
//     res.json(asset);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

 
// route.post("/assets/update", auth, upload.array('file'), async (req, res) => {
//   try {
//     const { _id, ...updateData } = req.body;
//     let fileUrls = [];

//     // If there are new files, upload them
//     if (req.files && req.files.length > 0) {
//       const newFileUrls = await uploadFileToFirebase(req.files);
//       fileUrls = [...fileUrls, ...newFileUrls];
//     }

//     // Find the current Asset
//     const currentAsset = await Asset.findById(_id);
//     if (!currentAsset) {
//       return res.status(404).send("Asset not found");
//     }

//     // Prepare the update fields
//     const updateFields = {
//       ...updateData,
//       files: fileUrls.length > 0 ? [...currentAsset.files, ...fileUrls] : currentAsset.files
//     };

//     // Update the Asset
//     const updatedAsset= await Asset.findByIdAndUpdate(_id, updateFields, { new: true });

//     return res.status(200).json({
//       message: 'Asset updated successfully',
//       Task: updatedAsset
//     });
//   } catch (error) {
//     console.error("Error updating Asset:", error);
//     return res.status(500).send(`Internal server error: ${error.message}`);
//   }
// });

// // DELETE an asset by ID
// route.post("/assets/delete", auth, async (req, res) => {
//   try {
//     const { _id} = req.body;

//     if (!_id || (Array.isArray(_id) && _id.length === 0)) {
//       return res.status(400).send("No _id provided for deletion.");
//     }

//      const _idArray = Array.isArray(_id) ? _id : [_id];

//     // Delete multiple items if _id is an array, otherwise delete a single item
//     const deletedAsset = await Asset.deleteMany({ _id: { $in: _idArray } });

//     if (deletedAsset.deletedCount === 0) {
//       return res.status(404).send("No Asset found for the provided ID(s).");
//     }

//     return res.status(200).send({
//       message: `${deletedAsset.deletedCount} Asset deleted successfully.`,
//       deletedAsset
//     });
//   } catch (error) {
//     console.error("Error deleting Asset:", error);
//     return res.status(500).send(`Internal server error: ${error.message}`);
//   }
// });

// // ASSIGN an asset to a user
// route.post('/assets/assign', auth, async (req, res) => {
//   try {
//     const { assetIds, userId } = req.body;

//     // Validate that both assetIds and userId are provided
//     if (!Array.isArray(assetIds) || assetIds.length === 0) {
//       return res.status(400).json({ message: 'assetIds must be a non-empty array' });
//     }
//     if (!userId) {
//       return res.status(400).json({ message: 'userId is required' });
//     }

//     // Find the user by ID
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     // Iterate over the asset IDs and assign each asset to the user
//     const updatedAssets = [];
//     for (const assetId of assetIds) {
//       const asset = await Asset.findById(assetId);
//       if (asset) {
//         asset.assignee = userId;
//         await asset.save();
//         updatedAssets.push(asset);
//       }
//     }

//     res.json({ message: 'Assets assigned successfully', assets: updatedAssets });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });


// // GET assets assigned to a specific user based on role
// route.get('/users/:userId/assets', auth, async (req, res) => {
//   try {
//     const { roles, id } = req.user;

//     // Check if the requested user ID matches the logged-in user ID
//     const user = await User.findById(req.params.userId)
//       .populate('assets', 'assetName assetId');

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Admin can view any user's assets, but employees can only view their own
//     if (roles === "Admin" || (roles === "Employee" && req.params.userId === id.toString())) {
//       res.status(200).json(user.assets);
//     } else {
//       return res.status(403).json({ message: 'Access denied.' });
//     }

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });


































module.exports = route
