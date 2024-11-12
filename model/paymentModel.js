const mongoose = require('mongoose');
 
 
const paymentSchema = new mongoose.Schema({
  paymentId :{type: String},
  paymentType: { type: String  },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  invoiceID: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  paidDate :{type: String},
  paidAmount :{type: String},
  createdAt: { type: Date, default: Date.now },
  updatedAt : { type: Date, default: Date.now }
});

const expensesSchema = new mongoose.Schema({
    expensesId :{type: String},
    item: { type: String  },
    expaneseName: { type: String  },
    purchaseDate :{type: String},
    purchaseBy :{type: String},
    amount :{type: String},
    paidBy :{type: String},
    status: { type: String, default: 'Pending' },
    files:[{type: String}],
    createdAt: { type: Date, default: Date.now },
    updatedAt : { type: Date, default: Date.now }
  }); 

 

const Payment = mongoose.model('Payment', paymentSchema);
const Expenses = mongoose.model('Expenses', expensesSchema);
 
module.exports = {Payment , Expenses  }
