const mongoose = require('mongoose');
const SeqSchema = new mongoose.Schema({
  seqName: { type: String, required: true, unique: true },
  seqValue: { type: Number, default: 0 },
});

const Seq = mongoose.model("Seq", SeqSchema);

async function getNextSeqValue(seqName) {
    const SeqDoc = await Seq.findOneAndUpdate(
        { seqName },
        { $inc: { seqValue: 1 } },
        { new: true, upsert: true }
    );
     const SeqNumber = SeqDoc.seqValue.toString().padStart(4, '0'); // Pad the number to 3 digits
    return `PRO-${SeqNumber}`
}



const projectSchema = new mongoose.Schema({
  projectId: { type: String },
  projectName: { type: String },
  deadline: { type: String },
  description: { type: String },
  price: { type: String },
  tax: { type: String },
  tax_rs: { type: String },
  taxType: { type: String },
  totalPrice: { type: String },
  workAddress :{ type: String },
  siteAddress :{ type: String },
  priority: { type: String , default: 'Normal' },
  discountRupee: { type: String ,default:0},
  discountPercentage: { type: String ,default:0},
  installmentDetails: [{
    paymentDate: { type: String },
    paymentAmount: { type: String },
    paidDate: { type: String },
    paymentStatus: { type: String, default: 'Pending' },
  }],
  clientName: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  document: [{ type: String }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'Pending' },
  startDate: { type: String },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],  totalTasks: Number,

  // Automatically track when the document is created or updated
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // History field to track changes
  history: [
    {
      field: String,  
      oldValue: mongoose.Schema.Types.Mixed,   
      newValue: mongoose.Schema.Types.Mixed,  
      changedAt: { type: Date, default: Date.now }   
    }
  ]
});

// Schema for Material Management
const MaterialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  quantity: { type: String, required: true },
  price : { type: String, required: true },
  allocatedToProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },  
  createdAt: { type: Date, default: Date.now },
  updatedAt : { type: Date, default: Date.now }
});

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactInfo: { type: String },
  materialsSupplied: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Material' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt : { type: Date, default: Date.now }
});

const WorkUpdateSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'  },  
  description: { type: String },  // Description of the work
  progress: { type: String},
  workDate: { type: Date, default: Date.now },  // Date of the work update
  uploadedImages: [String],  // Array of image URLs
  location: { 
    type: {
      latitude: { type: Number  },
      longitude: { type: Number }
    }   // Latitude and Longitude for location tracking
  },
  deviceInfo: { 
    type: String,
    default: 'Mobile'  //  Mobile, Web
  },
  status: { type: String },
  createdAt: { type: Date, default: Date.now },  // Date when the update was created
  updatedAt: { type: Date, default: Date.now }  // Date when the update was last updated
});

// Schema for Inventory Management
const InventorySchema = new mongoose.Schema({
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  allocatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  quantity: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt : { type: Date, default: Date.now } 
});

projectSchema.pre('save', async function (next) {
  if (!this.projectId) {
      this.projectId = await getNextSeqValue('projectId');
  }
  next();
});

projectSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});
const Project = mongoose.model('Project', projectSchema);
const Material = mongoose.model('Material', MaterialSchema);
const Vendor = mongoose.model('Vendor', VendorSchema);
const WorkUpdate = mongoose.model('WorkUpdate', WorkUpdateSchema);
const Inventory = mongoose.model('Inventory', InventorySchema);

module.exports = { Project, Material,Vendor,WorkUpdate, Inventory ,Seq};
