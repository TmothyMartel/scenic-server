"use strict";
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: { type: String, default: "" },
  email: { type: String, required: true },
  about: { type: String },
  imageUrl: { type: String, default: "../public/images/user.svg" }
});

UserSchema.methods.serialize = function() {
  return {
    username: this.username || "",
    name: this.name || "",
    about: this.about || "",
    imageUrl: this.imageUrl
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 8);
};

const User = mongoose.model("User", UserSchema);

module.exports = { User };
