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

import csvRoutes from "./routes/csv/csvRoutes"


import collectionGetRoutes from "./routes/collection/collectionGet"
import collectionPostRoutes from "./routes/collection/collectionPost"
import collectionPutRoutes from "./routes/collection/collectionPut"

import dimensionGetRoutes from "./routes/dimension/dimensionGet"
import dimensionPostRoutes from "./routes/dimension/dimensionPost"
import dimensionPutRoutes from "./routes/dimension/dimensionPut"

import dimensionGridGetRoutes from "./routes/dimensionGrid/dimensionGridGet"
import dimensionGridPostRoutes from "./routes/dimensionGrid/dimensionGridPost"
import dimensionGridPutRoutes from "./routes/dimensionGrid/dimensionGridPut"


import draftGetRoutes from "./routes/draft/draftGet"
import draftPostRoutes from "./routes/draft/draftPost"
import draftPutRoutes from "./routes/draft/draftPut"


import groupGetRoutes from "./routes/group/groupGet"
import groupPostRoutes from "./routes/group/groupPost"
import groupPutRoutes from "./routes/group/groupPut"

import isoCodeGetRoutes from "./routes/isoCode/isoCodeGet"


import productGetRoutes from "./routes/product/productGet"
import productPostRoutes from "./routes/product/productPost"
import productPutRoutes from "./routes/product/productPut"

import uvcGetRoutes from "./routes/uvc/uvcGet"
import uvcPostRoutes from "./routes/uvc/uvcPost"
import uvcPutRoutes from "./routes/uvc/uvcPut"

import supplierGetRoutes from "./routes/supplier/supplierGet"
import supplierPostRoutes from "./routes/supplier/supplierPost"
import supplierPutRoutes from "./routes/supplier/supplierPut"
import supplierPdfRoutes from "./routes/supplier/supplierPdf"


import tagGetRoutes from "./routes/tag/tagGet"
import tagPostRoutes from "./routes/tag/tagPost"
import tagPutRoutes from "./routes/tag/tagPut"

import tagGroupingGetRoutes from "./routes/tagGrouping/tagGroupingGet"

import tarifGetRoutes from "./routes/tarif/tarifGet"
import tarifPostRoutes from "./routes/tarif/tarifPost"
import tarifPutRoutes from "./routes/tarif/tarifPut"

import userFieldGetRoutes from "./routes/user-field/userFieldGet"
import userFieldPostRoutes from "./routes/user-field/userFieldPost"

import taxGetRoutes from "./routes/tax/taxGet"
import taxPostRoutes from "./routes/tax/taxPost"
import taxPutRoutes from "./routes/tax/taxPut"

import blockGetRoutes from "./routes/block/blockGet"
import blockPostRoutes from "./routes/block/blockPost"
import blockPutRoutes from "./routes/block/BlockPut"

import unitGetRoutes from "./routes/unit/unitGet"

import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'routes', 'supplier', 'public')));
app.use(
  cors()
)

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

// CSV ROUTES
app.use(v1, csvRoutes)

// COLLECTION ROUTES
app.use(v1, collectionGetRoutes);
app.use(v1, collectionPostRoutes);
app.use(v1, collectionPutRoutes);

// Dimenmsions ROUTES
app.use(v1, dimensionGetRoutes);
app.use(v1, dimensionPostRoutes);
app.use(v1, dimensionPutRoutes);


// Dimension Grid ROUTES
app.use(v1, dimensionGridGetRoutes);
app.use(v1, dimensionGridPostRoutes);
app.use(v1, dimensionGridPutRoutes);


// Draft ROUTES
app.use(v1, draftGetRoutes);
app.use(v1, draftPostRoutes);
app.use(v1, draftPutRoutes);
// Group ROUTES
app.use(v1, groupGetRoutes);
app.use(v1, groupPostRoutes);
app.use(v1, groupPutRoutes);

app.use(v1, isoCodeGetRoutes)


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
app.use(v1, supplierPostRoutes)
app.use(v1, supplierPutRoutes)
app.use(v1, supplierPdfRoutes)

// Tag Routes
app.use(v1, tagGetRoutes)
app.use(v1, tagPostRoutes)
app.use(v1, tagPutRoutes)

// Tag Grouping Routes
app.use(v1, tagGroupingGetRoutes)

// Tarif Routes
app.use(v1, tarifGetRoutes)
app.use(v1, tarifPostRoutes)
app.use(v1, tarifPutRoutes)

app.use(v1, userFieldGetRoutes)
app.use(v1, userFieldPostRoutes)

app.use(v1, unitGetRoutes)

app.use(v1, taxGetRoutes)
app.use(v1, taxPostRoutes)
app.use(v1, taxPutRoutes)

app.use(v1, blockGetRoutes)
app.use(v1, blockPostRoutes)
app.use(v1, blockPutRoutes)


app.listen(PORT, () => {
  dbConnect();
  console.log(`Server is running on port ${PORT}`);
});
