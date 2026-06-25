const mongoose = require('mongoose');

// Stock status shown on the storefront. `few_left` / `sold_out` are driven by the
// admin (not auto-computed) so the client keeps full control of the label.
const STATUSES = ['in_stock', 'few_left', 'sold_out'];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Category is a free string for now (demo categories). The client will
    // provide the real, controlled list later — keep this loose until then.
    category: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String, // single product image (ImageKit URL)
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    // Price in rupees (whole/decimal). Converted to paise only at payment time.
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Quantity in stock.
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'in_stock',
    },
    // Hidden products are kept but not listed on the public storefront.
    active: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

productSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Product', productSchema);
