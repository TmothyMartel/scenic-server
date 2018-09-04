"use strict";
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const defaultImage = "./images/user.svg";
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
  imageUrl: { type: String, default: defaultImage },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Location" }]
});

// UserSchema.pre("find", function(next) {
//   this.populate("favorites");
//   next();
// });

// UserSchema.pre("findById", function(next) {
//   this.populate("favorites");
//   next();
// });

UserSchema.methods.serialize = function() {
  return {
    id: this._id,
    username: this.username || "",
    email: this.email,
    name: this.name || "",
    about: this.about || "",
    imageUrl: this.imageUrl,
    favorites: this.favorites
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
