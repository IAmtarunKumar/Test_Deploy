const mongoose = require('mongoose');

// Sequence schema for generating sequential IDs based on roles or asset type
const sequenceSchema = new mongoose.Schema({
  seqName: { type: String, required: true, unique: true },
  seqValue: { type: Number, default: 0 },
});

const Sequence = mongoose.model('Sequence', sequenceSchema);

// Function to generate sequential IDs for users based on roles or for assets
async function getNextSequenceValue(type) {
  const prefixMap = {
    Admin: 'ADM',
    Employee: 'EMP',
    Supervisor: 'SPV',
    Client: 'CLT',
    // Asset: 'AST',
  };

  const prefix = prefixMap[type] || 'USR';

  const sequenceDoc = await Sequence.findOneAndUpdate(
    { seqName: type },
    { $inc: { seqValue: 1 } },
    { new: true, upsert: true }
  );

  const sequenceNumber = sequenceDoc.seqValue.toString().padStart(4, '0');
  return `${prefix}-${sequenceNumber}`;
}

// // Asset schema
// const assetSchema = new mongoose.Schema({
//   assetName: { type: String  },
//   assetId: { type: String },  // Auto-generated unique ID
//   assignedDate: { type: String, default: Date.now },
//   assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   purchaseDate: { type: String },
//   purchaseFrom: { type: String },
//   manufacturer: { type: String },
//   model: { type: String },
//   serialNumber: { type: String },
//   supplier: { type: String },
//   files: [{ type: String }],  // Array of file paths or URLs
//   condition: { type: String },
//   value: { type: String },
//   warranty: { type: String },
//   warrantyEnd: { type: String },
//   amount: { type: String },
//   description: { type: String },
//   status: { type: String, enum: ['Pending', 'Approved', 'Returned'], default: 'Pending' }
// }, { timestamps: true });

// // Middleware to generate a unique assetId before saving
// assetSchema.pre('save', async function (next) {
//   if (!this.assetId) {
//     this.assetId = await getNextSequenceValue("Asset");
//   }
//   next();
// });

// User schema with primary and secondary contact details, and bank details
const userSchema = new mongoose.Schema({
  userId: { type: String },  // Auto-generated unique ID
  name: { type: String  },
  email: { type: String  },
  password: { type: String  },
  mobile: { type: String },
  roles: { type: String  },
  document: [String],
  assigned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  clientName: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  permissions: { type: [String] },
  // assets: [assetSchema],
  image: { type: String },
  DOB: { type: String },
  remarks: [{ type: String }],
  project: { type: String },
  personalEmail: { type: String },
  startDate: { type: String },
  leaveDates: [{ type: String }],
  address: { type: String },
  gender: { type: String },
  status: { type: String, default: 'Pending' },
  joiningDate: { type: String },
  departments: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designations: { type: mongoose.Schema.Types.ObjectId, ref: 'Designation' },
  contactName: { type: String },
  contactEmail: { type: String },
  contactMobile: { type: String },
  salary: { type: String },
  payslip: { type: String },

  // Primary Contact Information
  primaryContact: {
    name: { type: String },
    relationship: { type: String },
    phone: { type: String },
    address: { type: String },
  },

  // Secondary Contact Information
  secondaryContact: {
    name: { type: String },
    relationship: { type: String },
    phone: { type: String },
    address: { type: String },
  },

  // Bank Details
  bankDetails: {
    bankName: { type: String },
    accountNumber: { type: String },
    accountHolder: { type: String },
    IFSCCode: { type: String },
    branchName: { type: String },
    accountType: { type: String, enum: ['Savings', 'Current'] },
    PANNumber: { type: String }
  },

  currentOtp: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to generate unique userId based on role before saving
userSchema.pre('save', async function (next) {
  if (!this.userId && this.roles) {
    this.userId = await getNextSequenceValue(this.roles);
  } else if (!this.roles) {
    return next(new Error('roles is required to generate userId'));
  }
  next();
});

// const Asset = mongoose.model('Asset', assetSchema);
const User = mongoose.model('User', userSchema);
module.exports = { User, Sequence };
