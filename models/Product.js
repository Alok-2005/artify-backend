import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: String,
    category: String,
    location: String,
    description: String,
    imageUrl: String,
    isPublished: { type: Boolean, default: false },
    instagramPostId: String,
    publishedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
