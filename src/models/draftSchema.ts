import { ObjectId } from "mongodb";
import mongoose, { Schema, Document, Model } from "mongoose";

interface UvcSchema {
  code: string;
  dimensions: string[];
  prices: PriceSchema;
  eans: string[];
  status: string;
  additional_fields: any;
  collectionUvc: string;
  blocked: string,
  blocked_reason_code: string,
  height: string;
  width: string;
  length: string;
  gross_weight: string;
  net_weight: string;
}

interface PriceSchema {
  price: PriceItemSchema;
}

interface PriceItemSchema {
  paeu: number;
  tbeu_pb: number;
  tbeu_pmeu: number;
}

interface SupplierSchema {
  supplier_id: ObjectId;
  supplier_ref: string;
  pcb: string;
  custom_cat: string;
  made_in: string;
}

interface DraftSchema extends Document {
  creator_id: ObjectId;
  reference: string;
  alias: string;
  short_label: string;
  long_label: string;
  type: string;
  tag_ids: ObjectId[];
  suppliers: SupplierSchema[];
  dimension_types: string[];
  brand_ids: ObjectId[];
  collection_ids: ObjectId[];
  blocked: string,
  blocked_reason_code: string,
  tax: string;
  paeu: number;
  tbeu_pb: number;
  tbeu_pmeu: number;
  height: string;
  width: string;
  length: string;
  comment: string;
  size_unit: string;
  weigth_unit: string;
  gross_weight: string;
  net_weight: string;
  imgPath: string;
  status: string;
  step: number;
  additional_fields: any;
  uvc: UvcSchema[];
}

const priceItemSchema = new mongoose.Schema<PriceItemSchema>({
  paeu: { type: Number },
  tbeu_pb: { type: Number },
  tbeu_pmeu: { type: Number },
});

const priceSchema = new mongoose.Schema<PriceSchema>(
  {
    price: priceItemSchema,
  },
  { _id: false }
);

const supplierSchema = new mongoose.Schema<SupplierSchema>(
  {
    supplier_id: { type: mongoose.Schema.Types.Mixed, ref: "supplier" },
    supplier_ref: { type: String },
    pcb: { type: String },
    custom_cat: { type: String },
    made_in: { type: String },
  },
  { _id: false }
);

const uvcSchema = new mongoose.Schema<UvcSchema>(
  {
    code: { type: String },
    dimensions: [{ type: String }],
    prices: priceSchema,
    eans: [{ type: String }],
    status: { type: String },
    collectionUvc: { type: String },
    blocked: {type: String},
    blocked_reason_code: {type: String},
    height: { type: String },
    width: { type: String },
    length: { type: String },
    gross_weight: { type: String },
    net_weight: { type: String },
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
    alias: { type: String },
    short_label: { type: String },
    long_label: { type: String },
    type: { type: String },
    tag_ids: [{ type: mongoose.Schema.Types.Mixed, ref: "tag" }],
    suppliers: [supplierSchema],
    dimension_types: [{ type: String }],
    brand_ids: [{ type: mongoose.Schema.Types.Mixed, ref: "brand" }],
    collection_ids: [{ type: mongoose.Schema.Types.Mixed, ref: "collection" }],
    blocked: {type: String, default: "Non"},
    blocked_reason_code: {type: String},
    tax: { type: String },
    paeu: { type: Number },
    tbeu_pb: { type: Number },
    tbeu_pmeu: { type: Number },
    height: { type: String },
    width: { type: String },
    length: { type: String },
    size_unit: { type: String },
    weigth_unit: { type: String },
    gross_weight: { type: String },
    net_weight: { type: String },
    comment: { type: String, maxlength: 3000 },
    imgPath: { type: String },
    status: { type: String },
    step: { type: Number, default: 1 },
    additional_fields: [
      {
        label: { type: String },
        value: { type: String },
        field_type: { type: String },
      },
    ],
    uvc: [uvcSchema],
  },
  { timestamps: true, collection: "draft" }
);

const DraftModel: Model<DraftSchema> = mongoose.model<DraftSchema>(
  "draft",
  draftSchema
);
export default DraftModel;