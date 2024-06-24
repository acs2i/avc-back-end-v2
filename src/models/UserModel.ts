import mongoose from "mongoose"

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
  }
}, {timestamps: true, collection: "user"}


);

const User = mongoose.model("User", UserSchema);
export default User;
