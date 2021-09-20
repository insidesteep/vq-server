const { Schema, model } = require("mongoose");

const statementSchema = new Schema(
  {
    files: [{ type: Schema.Types.ObjectId, ref: "File" }],
    theme: {
      type: String,
      require: true,
    },
    message: {
      type: String,
      require: true,
    },
    responsiblePerson: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reply: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    status: {
      type: String,
      enum: ["new", "accepted", "pending", "completed"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Statement", statementSchema);
