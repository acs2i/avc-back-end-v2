import { ObjectId } from "mongodb";
import mongoose, { Schema, Document, Model } from "mongoose";

interface PriceItemSchema {
  peau: number; // Prix d'achat en unité
  tbeu_pb: number; // Taux de base en unité - prix de base
  tbeu_pmeu: number; // Taux de base en unité - prix modifié
}

interface PriceSchema {
  tarif_id: ObjectId; // ID du tarif
  currency: string; // Devise
  supplier_id: ObjectId; // ID du fournisseur
  price: PriceItemSchema[]; // Détail des prix
  store: string; // Magasin
}

interface UvcSchema {
  code: string; // Code de l'UVC
  dimensions: string[]; // Dimensions de l'UVC
  prices: PriceSchema[]; // Liste des prix
  eans: string[]; // Liste des codes EAN
  status: number; // Statut de l'UVC
  additional_fields: any; // Champs additionnels
}

interface SupplierSchema {
  supplier_id: ObjectId; // ID du fournisseur
  supplier_ref: string; // Référence du fournisseur
  pcb: string; // PCB
  custom_cat: string; // Catégorie douanière
  made_in: string; // Pays d'origine
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
  tax: string;
  peau: number;
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
  peau: { type: Number },
  tbeu_pb: { type: Number },
  tbeu_pmeu: { type: Number },
});

const priceSchema = new mongoose.Schema<PriceSchema>(
  {
    // tarif_id: { type: mongoose.Schema.Types.ObjectId, ref: "tarif", default: "" },
    currency: { type: String },
    // supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: "supplier", default: "" },
    price: [priceItemSchema],
    store: { type: String },
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
    alias: { type: String },
    short_label: { type: String },
    long_label: { type: String },
    type: { type: String },
    tag_ids: [{ type: mongoose.Schema.Types.Mixed, ref: "tag" }],
    suppliers: [supplierSchema],
    dimension_types: [{ type: String }],
    brand_ids: [{ type: mongoose.Schema.Types.Mixed, ref: "brand" }],
    collection_ids: [{ type: mongoose.Schema.Types.Mixed, ref: "collection" }],
    tax: {type: String},
    peau: { type: Number },
    tbeu_pb: { type: Number },
    tbeu_pmeu: { type: Number },
    height: {type: String},
    width: {type: String},
    length: {type: String},
    size_unit: {type: String},
    weigth_unit: {type: String},
    gross_weight: {type: String},
    net_weight: {type: String},
    comment: { type: String, maxlength: 3000 },
    imgPath: { type: String },
    status: { type: String },
    step: {type: Number, default: 1},
    additional_fields: [
      {
        label: { type: String},
        value: { type: String},
        field_type: { type: String},
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
