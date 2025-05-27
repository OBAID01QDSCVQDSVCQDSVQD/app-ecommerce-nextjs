import mongoose, { Schema, model, models } from 'mongoose'

const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  cartItems: [
    {
      productId: String,
      quantity: Number,
      price: Number,
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
