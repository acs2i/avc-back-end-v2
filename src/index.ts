// server.ts
import dotenv from "dotenv"
import express from "express"
import authRoutes from "./routes/authRoutes"

import productGetRoutes from "./routes/product/productGet"
import productPostRoutes from "./routes/product/productPost"
import productPutRoutes from "./routes/product/productPut"

import familyGetRoutes from "./routes/family/familyGet"
import familyPostRoutes from "./routes/family/familyPost"
import familyPutRoutes from "./routes/family/familyPut"

import dimensionGetRoutes from "./routes/dimension/dimensionGet"
import dimensionPostRoutes from "./routes/dimension/dimensionPost"

import collectionGetRoutes from "./routes/collection/collectionGet"
import collectionPostRoutes from "./routes/collection/collectionPost"
import collectionPutRoutes from "./routes/collection/collectionPut"

import brandGetRoutes from "./routes/brand/brandGet"
import brandPostRoutes from "./routes/brand/brandPost"
import brandPutRoutes from "./routes/brand/brandPut"

import uvcGetRoutes from "./routes/uvc/uvcGet"
import uvcPostRoutes from "./routes/uvc/uvcPost"
import uvcPutRoutes from "./routes/uvc/uvcPut"


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
const v1 = "/api/v1";

// ROUTES
app.get('/', (req: any, res: any) => {
  res.send('Hello, world! test');
});

// AUTH ROUTES
app.use(v1 + "/auth", authRoutes);

// PRODUCTS ROUTES
app.use(v1, productGetRoutes);
app.use(v1, productPostRoutes);
app.use(v1, productPutRoutes);

// family ROUTES
app.use(v1, familyGetRoutes);
app.use(v1, familyPostRoutes);
app.use(v1, familyPutRoutes);

// BRAND ROUTES
app.use(v1, brandGetRoutes);
app.use(v1, brandPostRoutes);
app.use(v1, brandPutRoutes);

// COLLECTION ROUTES
app.use(v1, collectionGetRoutes);
app.use(v1, collectionPostRoutes);
app.use(v1, collectionPutRoutes);

// Dimenmsions ROUTES
app.use(v1, dimensionGetRoutes);
app.use(v1, dimensionPostRoutes);

// Uvc Routes
app.use(v1, uvcGetRoutes)
app.use(v1, uvcPostRoutes)
app.use(v1, uvcPutRoutes)

// USERS ROUTES
// TO DO

app.listen(PORT, () => {
  dbConnect();
  console.log(`Server is running on port ${PORT}`);
});
