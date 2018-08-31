"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const router = express.Router();

const jsonParser = bodyParser.json();

const { Locations } = require("./models");

const jwtAuth = passport.authenticate("jwt", { session: false });

//routes
router.get("/", jwtAuth, (req, res) => {
	// Locations.find({ user: req.user.id })
	Locations.find()
		.limit(10)
		.then(locations => {
			res.json({
				locations: locations.map(location => location.serialize())
			});
		})
		.catch(error => {
			console.error(error);
			res.status(500).json({ message: "internal server error" });
		});
});

router.get("/:id", jwtAuth, (req, res) => {
	Locations.findById(req.params.id)
		.then(location => res.json(location.serialize()))
		.catch(error => {
			console.error(error);
			res.status.json({ message: "internal server error" });
		});
});

// post route
router.post("/", jwtAuth, jsonParser, (req, res) => {
	const requiredFields = ["title", "description", "image"];
	requiredFields.forEach(field => {
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	});

	Locations.create({
		createdBy: req.body.createdBy,
		title: req.body.title,
		image: req.body.image,
		description: req.body.description,
		coordinates: req.body.coordinates,
		photoTips: req.body.photoTips
	})
		.then(location => res.status(201).json(location.serialize()))
		.catch(error => {
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		});
});

// put route
router.put("/:id", jsonParser, (req, res) => {
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message = `Request path id \`${
			req.params.id
		}\` and request body id 
		\`${req.body.id}\` must match.`;
		console.error(message);
		return res.status(400).json({ message: message });
	}

	const toUpdate = {};
	const updateFields = ["title", "image", "description", "photoTips"];

	updateFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	Locations.findByIdAndUpdate(
		req.params.id,
		{ $set: toUpdate },
		{ new: true }
	)
		.then(location => res.status(201).json(location))
		.catch(error =>
			res.status(500).json({ message: "Internal server error" })
		);
});

//delete route
router.delete("/:id", (req, res) => {
	Locations.findByIdAndRemove(req.params.id)
		.then(location => res.status(204).end())
		.catch(error =>
			res.status(500).json({ message: "Internal server error" })
		);
});

module.exports = { router };
