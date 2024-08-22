import mongoose from "mongoose";

// Schéma pour les notifications
const NotificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

// Schéma pour l'utilisateur
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  authorization: {
    type: String,
    required: true,
  },
  imgPath: {
    type: String,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  comment: {
    type: String,
    maxlength: 250,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "draft",
      default: [],
      timestamp: true,
    },
  ],
  unreadMessages: {
    type: Map,
    of: Number,
    default: {},
  },
  notifications: [{
    message: String,
    date: Date,
    read: Boolean,
  }],
}, {
  timestamps: true, 
  collection: "user"
});

// Modèle mongoose basé sur le schéma
const User = mongoose.model("user", UserSchema);
export default User;
