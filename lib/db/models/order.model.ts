import mongoose, { Schema, model, models } from 'mongoose'

const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  cartItems: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      price: Number,
      name: String,
      image: String,

      slug: String,
      category: String,
      brand: String,
     
      attributes: [
        {
          attribute: String,
          value: String
        }
      ],
    },

  ],
  totalPrice: Number,
  shippingInfo: {
    type: Schema.Types.Mixed, // ✅ هذا المهم
    required: true
  },
  status: { type: String, default: 'pending' },
}, { timestamps: true })


export const Order = models.Order || model('Order', OrderSchema)
