import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Upload product and save to DB
router.post("/products", upload.single("image"), async (req, res) => {
  try {
    const { name, category, location, description } = req.body;

    const uploaded = await cloudinary.uploader.upload_stream(
      { folder: "products" },
      async (error, result) => {
        if (error) throw error;

        const product = new Product({
          name,
          category,
          location,
          description,
          imageUrl: result.secure_url,
        });

        const saved = await product.save();
        res.json(saved);
      }
    );

    // Write buffer to stream
    uploaded.end(req.file.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload product" });
  }
});

// ✅ Mark product as published (n8n calls this)
router.post("/products/:id/published", async (req, res) => {
  try {
    const { id } = req.params;
    const { instagramPostId } = req.body;

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        isPublished: true,
        instagramPostId,
        publishedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Marked as published", product: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Trigger n8n manually if needed
router.post("/products/:id/postToInstagram", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await axios.post(process.env.N8N_WEBHOOK_URL, {
      imageUrl: product.imageUrl,
      caption: `${product.name} — ${product.description}`,
      productId: product._id,
    });

    res.json({ message: "Sent to n8n for Instagram posting." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to trigger Instagram post" });
  }
});

export default router;
