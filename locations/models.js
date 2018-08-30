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
	photoTips: [{ type: String }],
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}
});

LocationSchema.methods.serialize = function() {
	return {
		id: this._id,
		title: this.title,
		description: this.description,
		image: this.image,
		coordinates: this.coordinates,
		photoTips: this.photoTips || []
	};
};

const Locations = mongoose.model("Location", LocationSchema);

module.exports = { Locations };
