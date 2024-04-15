import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    family: {
      type: [String],
      default: []
    },
    subFamily: {
      type: [String],
      default: []
    },
    brand: {
      type: String,
    },
    productCollection: {
      type: String,
    },
    uvc: [
      {
        code: { type: String, required: true },
        color: { type: [String] },
        size: { type: [String] },
        price: { type: [Number] },
      }
    ],
    status: {
      type: Number,
      default: 0,
    },
    imgPath: {
      type: String,
      default: ""
    },
    creator: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true, collection: "product" },
);

const Product = mongoose.model("Product", ProductSchema);
export default Product;
