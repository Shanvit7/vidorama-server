const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  magicToken: { type: String,unique: true, partialFilterExpression: { magicToken: { $type: 'string' } } },
  userAuthId: { type: String, unique:true },
});

module.exports = mongoose.model("User", userSchema);
