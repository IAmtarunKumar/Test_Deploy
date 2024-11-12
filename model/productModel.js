const mongoose = require('mongoose');

const SeqSchema = new mongoose.Schema({
  seqName: { type: String, required: true, unique: true },
  seqValue: { type: Number, default: 0 },
});

const Seq = mongoose.model("SeqProduct", SeqSchema);

async function getNextSeqValue(seqName) {
  const SeqDoc = await Seq.findOneAndUpdate(
    { seqName },
    { $inc: { seqValue: 1 } },
    { new: true, upsert: true }
  );
  const SeqNumber = SeqDoc.seqValue.toString().padStart(4, '0'); // Pads to 4 digits
  return `PROD-${SeqNumber}`;
}

const categorySchema = new mongoose.Schema({
  category: { type: String },
});

const productSchema = new mongoose.Schema({
  productId: { type: String, unique: true },
  productName: { type: String,  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  supplier: { type: String },
  quantity: { type: String, default: 0 }, // Set to String for arithmetic operations
  purchaseDate: { type: String },
  price: { type: String, default: 0 }, // Set to String
  tax: { type: String, default: 0 }, // Set to String
  discountPercentage: { type: String, default: 0 }, // Set to String
  discountRupee: { type: String, default: 0 }, // Set to String
  status: { type: String, default: 'Available' },
  description: { type: String },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

// Consolidated pre-save middleware for `productId` and `updatedAt`
productSchema.pre('save', async function (next) {
  if (!this.productId) {
    this.productId = await getNextSeqValue('productId');
  }
  this.updatedAt = Date.now();
  next();
});

const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);

module.exports = { Product, Category };
