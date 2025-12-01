import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  price: { type: Number, required: true },
  description: { type: String },
  images: [String],
  variants: [
    {
      color: String,
      sizes: [
        {
          size: String,
          stock: Number,
        },
      ],
      images: [String],
    },
  ],
  averageRating: { type: Number, default: 0 }, // số sao trung bình
  numReviews: { type: Number, default: 0 }, // số lượng review
});

const Product = mongoose.model("Product", productSchema);
export default Product;
