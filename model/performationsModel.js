// models/Resignation.js
const mongoose = require('mongoose');

const ResignationSchema = new mongoose.Schema({
   employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   department:{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
   noticeDate: String, // Change to Date type
   resignationDate: String, // Change to Date type
   reason: String
}, {
   timestamps: true
});
 

const TerminationSchema = new mongoose.Schema({
   employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   department:{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
   TerminationType: String,
   noticeDate: String, // Change to Date type
   terminationDate: String, // Change to Date type
   reason: String
}, {
   timestamps: true
});

 
const Resignation = mongoose.model('Resignation', ResignationSchema);
const Termination = mongoose.model('Termination', TerminationSchema);
module.exports = {Termination, Resignation};