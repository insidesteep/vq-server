const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    address: {
      type: String,
      require: true,
    },
    phone: {
      type: Number,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "leader"],
      default: "user",
    },
    isLockProfile: {
      type: Boolean,
      default: false,
    },
    statements: [
      {
        type: Schema.Types.ObjectId,
        ref: "Statement",
      },
    ],
    files: [
      {
        type: Schema.Types.ObjectId,
        ref: "File",
      },
    ],

    clients: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    verifyCode: {
      type: String,
      require: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    incomingMessages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);
