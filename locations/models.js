"use strict";
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const LocationSchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
		unique: true
	},
	description: {
		type: String,
		required: true
	},
	image: {
		type: String,
		reqired: true
	},
	coordinates: {
		latitude: { type: Number },
		longitude: { type: Number }
	},
	photoTips: { type: String, default: "" }
});

LocationSchema.virtual("coords").get(function() {
	return `${this.latitude}, ${this.longitude}`;
});

LocationSchema.methods.serialize = function() {
	return {
		id: this._id,
		title: this.title,
		description: this.description,
		image: this.image,
		coordinates: this.coords,
		photoTips: this.photoTips || ""
	};
};

LocationSchema.methods.validatePassword = function(password) {
	return bcrypt.compare(password, this.password);
};

LocationSchema.statics.hashPassword = function(password) {
	return bcrypt.hash(password, 8);
};

const Locations = mongoose.model("Location", LocationSchema);

module.exports = { Locations };
