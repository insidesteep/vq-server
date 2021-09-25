const { Schema, model } = require("mongoose");

const messageSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    statement: {
      type: Schema.Types.ObjectId,
      ref: "Statement",
    },
    message: {
      type: String,
      require: true,
    },
    unread: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Message", messageSchema);
