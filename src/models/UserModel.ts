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
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
    },
  ],
  additionalFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {timestamps: true, collection: "user"}


);

const User = mongoose.model("User", UserSchema);
export default User;
