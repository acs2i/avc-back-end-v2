import { ObjectId } from "mongodb";
import mongoose, { Schema, Document, Model } from "mongoose";

interface PriceSchema {
  tarif_id: ObjectId;
  currency: string;
  supplier_id: ObjectId;
  price: number[];
  store: string;
}

interface UvcSchema {
  code: string;
  dimensions: string[];
  prices: PriceSchema[];
  eans: string[];
  status: number;
  additional_fields: any;
}

interface DraftSchema extends Document {
  creator_id: ObjectId;
  reference: string;
  name: string;
  short_label: string;
  long_label: string;
  type: string;
  tag_ids: ObjectId[];
  princ_supplier_id: ObjectId;
  supplier_ids: ObjectId[];
  dimension_types: string[];
  brand_ids: ObjectId[];
  collection_ids: ObjectId[];
  imgPath: string;
  status: string;
  additional_fields: any;
  uvc: UvcSchema[];
}

const priceSchema = new mongoose.Schema<PriceSchema>(
  {
    tarif_id: { type: mongoose.Schema.Types.ObjectId, ref: "tarif", default: "" },
    currency: { type: String },
    supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: "supplier", default: "" },
    price: [{ type: Number }],
    store: { type: String },
  },
  { _id: false }
);

const uvcSchema = new mongoose.Schema<UvcSchema>(
  {
    code: { type: String },
    dimensions: [{ type: String }],
    prices: [priceSchema],
    eans: [{ type: String }],
    status: { type: Number },
    additional_fields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  { _id: false }
);

const draftSchema = new mongoose.Schema<DraftSchema>(
  {
    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      timestamp: true,
    },
    reference: { type: String },
    name: { type: String },
    short_label: { type: String },
    long_label: { type: String },
    type: { type: String },
    tag_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "tag" }],
    princ_supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: "supplier" },
    supplier_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "supplier" }],
    dimension_types: [{ type: String }],
    brand_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "brand" }],
    collection_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "collection" }],
    imgPath: { type: String },
    status: { type: String },
    additional_fields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    uvc: [uvcSchema],
  },
  { timestamps: true, collection: "draft" }
);

const DraftModel: Model<DraftSchema> = mongoose.model<DraftSchema>("draft", draftSchema);
export default DraftModel;
