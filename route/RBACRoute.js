// routes.js
const express = require("express");
const { auth ,authorize } = require("../Middleware/authorization");
const { Role ,User} = require("../model/userModel");
const router = express.Router();
 
// Only users with 'view_dashboard' permission can access this route
// router.get("/dashboard", auth, authorize("view_dashboard"), (req, res) => {
//     res.json({ message: "Welcome to the Dashboard" });
//   });
  
  // Only users with 'manage_users' permission can access this route
  // router.post("/users", auth, authorize("manage_users"), (req, res) => {
  //   res.json({ message: "User management page" });
  // });


// Create a new role
// router.post("/roles", auth, authorize("manage_roles"), async (req, res) => {
//     const { name, permissions } = req.body;
//     const role = new Role({ name, permissions });
//     await role.save();
//     res.status(201).json({ message: "Role created", role });
//   });
  
  // Update permissions for a role
  // router.post("/roles/:roleId", auth, authorize("manage_roles"), async (req, res) => {
  //   const { permissions } = req.body;
  //   const role = await Role.findByIdAndUpdate(req.params.roleId, { permissions }, { new: true });
  //   res.status(200).json({ message: "Role updated", role });
  // });
  
  // Assign role to a user
  // router.post("/users/:userId/role", auth, authorize("manage_users"), async (req, res) => {
  //   const { roleId } = req.body;
  //   const user = await User.findByIdAndUpdate(req.params.userId, { role: roleId }, { new: true });
  //   res.status(200).json({ message: "User role updated", user });
  // });
  

  // router.get('/roles',auth, async (req, res) => {
  //   try {
  //     const roles = await Role.find({}, '_id name'); // Fetch roles with ID and name fields only
  //     res.json(roles);
  //   } catch (error) {
  //     res.status(500).json({ message: 'Failed to fetch roles' });
  //   }
  // });
module.exports = router;
