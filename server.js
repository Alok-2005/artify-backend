import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import axios from "axios";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", productRoutes);

app.get("/", (req, res) => res.send("Backend running ✅"));


app.post("/api/trigger-instagram", async (req, res) => {
  try {
    const response = await axios.post(
    //   'https://chowk.app.n8n.cloud/webhook-test/post-to-ig',
    'https://chowk.app.n8n.cloud/webhook/post-to-ig',
      req.body
    );
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("n8n webhook error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));
