const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imagePath: { type: String, required: true },
  // Adding information about user who create the post
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true }
});

module.exports = mongoose.model("Post", postSchema);
