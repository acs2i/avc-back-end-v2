import mongoose from "mongoose"

const NotificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});
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
  comment: {
    type: String,
    maxlength: 250
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "draft",
      default: [],
      timestamp: true
    },
  ],
  unreadMessages: {
    type: Map,
    of: Number,
    default: {}
  },
  notifications: [{
    message:  String,
    date: Date,
    read: Boolean
  }],
}, {timestamps: true, collection: "user"}


);

const User = mongoose.model("user", UserSchema);
export default User;