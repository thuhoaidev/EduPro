const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  withdrawRequestId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'WithdrawRequest', 
    required: true 
  },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  bank: String,
  account: String,
  holder: String,
  issuedAt: { 
    type: Date, 
    default: Date.now 
  },
  issuedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  file: String, // Đường dẫn file PDF hóa đơn
  status: { 
    type: String, 
    enum: ['issued', 'cancelled'], 
    default: 'issued' 
  }
});

// Tạo invoice number tự động
InvoiceSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', InvoiceSchema); 