import mongoose, { Schema, model, models } from "mongoose";

const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  cartItems: [
    {
      productId: String,
      quantity: Number,
      price: Number,
    }
  ],
  totalPrice: Number,
  shippingInfo: { type: Schema.Types.ObjectId, ref: "ShippingInfo" },
  status: { type: String, default: "pending" },
}, { timestamps: true });

export const Order = models.Order || model("Order", OrderSchema);
