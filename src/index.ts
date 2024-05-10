// server.ts
import bodyParser from "body-parser"
import cors from "cors";
import dbConnect from "./config/dbConnect"
import dotenv from "dotenv"
import express from "express"

import authRoutes from "./routes/authRoutes"

import brandGetRoutes from "./routes/brand/brandGet"
import brandPostRoutes from "./routes/brand/brandPost"
import brandPutRoutes from "./routes/brand/brandPut"

import collectionGetRoutes from "./routes/collection/collectionGet"
import collectionPostRoutes from "./routes/collection/collectionPost"
import collectionPutRoutes from "./routes/collection/collectionPut"

import dimensionGetRoutes from "./routes/dimension/dimensionGet"
import dimensionPostRoutes from "./routes/dimension/dimensionPost"
import dimensionPutRoutes from "./routes/dimension/dimensionPut"


import draftGetRoutes from "./routes/draft/draftGet"
import draftPostRoutes from "./routes/draft/draftPost"
import draftPutRoutes from "./routes/draft/draftPut"


import familyGetRoutes from "./routes/family/familyGet"
import familyPostRoutes from "./routes/family/familyPost"
import familyPutRoutes from "./routes/family/familyPut"

import gridGetRoutes from "./routes/grid/gridGet"
import gridPostRoutes from "./routes/grid/gridPost"

import productGetRoutes from "./routes/product/productGet"
import productPostRoutes from "./routes/product/productPost"
import productPutRoutes from "./routes/product/productPut"

import uvcGetRoutes from "./routes/uvc/uvcGet"
import uvcPostRoutes from "./routes/uvc/uvcPost"
import uvcPutRoutes from "./routes/uvc/uvcPut"

import supplierGetRoutes from "./routes/supplier/supplierGet"


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
app.use(v1, dimensionPutRoutes);

// Draft ROUTES
app.use(v1, draftGetRoutes);
app.use(v1, draftPostRoutes);
app.use(v1, draftPutRoutes);

// Family ROUTES
app.use(v1, familyGetRoutes);
app.use(v1, familyPostRoutes);
app.use(v1, familyPutRoutes);

//Grid ROUTES
app.use(v1, gridGetRoutes);
app.use(v1, gridPostRoutes);

// Product ROUTES
app.use(v1, productGetRoutes);
app.use(v1, productPostRoutes);
app.use(v1, productPutRoutes);

// Uvc Routes
app.use(v1, uvcGetRoutes)
app.use(v1, uvcPostRoutes)
app.use(v1, uvcPutRoutes)

// Supplier Routes
app.use(v1, supplierGetRoutes)


app.listen(PORT, () => {
  dbConnect();
  console.log(`Server is running on port ${PORT}`);
});
