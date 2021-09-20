const { Schema, model } = require("mongoose");

const fileSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("File", fileSchema);
