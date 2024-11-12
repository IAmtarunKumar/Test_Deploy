const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: String, // E.g., 'Admin', 'Manager', 'Employee'
    permissions: [{ type: String }] // List of permission strings
  });
  
   const Role = mongoose.model('Role', roleSchema);
   module.exports = Role