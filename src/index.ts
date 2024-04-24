// server.ts
import dotenv from "dotenv"
import express from "express"
import authRoutes from "./routes/authRoutes"
import productRoutes from "./routes/productRoutes"
import familyRoutes from "./routes/familyRoutes"
import brandRoutes from "./routes/brandRoutes"
import dimensionRoutes from "./routes/dimensionRoutes"

import collectionRoutes from "./routes/collectionRoutes"
import dbConnect from "./config/dbConnect"
import bodyParser from "body-parser"
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors()
);

// ROUTES
app.get('/', (req: any, res: any) => {
  res.send('Hello, world! test');
});

// AUTH ROUTES
app.use("/api/v1/auth", authRoutes);

// PRODUCTS ROUTES
app.use("/api/v1/product", productRoutes);

// family ROUTES
app.use("/api/v1/family", familyRoutes);

// BRAND ROUTES
app.use("/api/v1/brand", brandRoutes);

// COLLECTION ROUTES
app.use("/api/v1/collection", collectionRoutes);

// Dimenmsions ROUTES
app.use("/api/v1/dimension", dimensionRoutes);

// USERS ROUTES
// TO DO

app.listen(PORT, () => {
  dbConnect();
  console.log(`Server is running on port ${PORT}`);
});
