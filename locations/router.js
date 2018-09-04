"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const router = express.Router();
const jsonParser = bodyParser.json();
const { Locations } = require("./models");
const { User } = require("../users/models");
const jwtAuth = passport.authenticate("jwt", { session: false });

router.get("/", jwtAuth, (req, res) => {
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

router.get("/favorites", jwtAuth, (req, res) => {
  User.findById(req.user.id)
    .populate("favorites")
    .then(user => {
      res.json({
        locations: user.favorites.map(location => location.serialize())
      });
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: "internal server error" });
    });
});

router.get("/createdByUser", jwtAuth, (req, res) => {
  Locations.find({ createdBy: req.user.id })
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
  let userFavorites = [];
  User.findById(req.user.id)
    .then(user => {
      userFavorites = user.favorites;
      return Locations.findById(req.params.id).populate("createdBy");
    })

    .then(location => {
      let serializedLocation = location.serialize();
      if (userFavorites.indexOf(serializedLocation.id) >= 0) {
        serializedLocation.favorite = true;
      }
      res.json(serializedLocation);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: "internal server error" });
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
  console.log("user", req.user.id);
  Locations.create({
    createdBy: req.user.id,
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

router.post("/favorites/:id", jwtAuth, (req, res) => {
  User.findById(req.user.id)
    .then(user => {
      //check if loction is already in favorites
      let locationId = req.params.id;
      const found = user.favorites.some(
        index => index.toString() === locationId
      );
      if (!found) {
        user.favorites.push(req.params.id);
        return user.save();
      } else {
        console.log("already there");
      }
    })
    .then(user => res.status(204).end())
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    });
});

// put route
router.put("/:id", jsonParser, (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = `Request path id \`${req.params.id}\` and request body id
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

  Locations.findByIdAndUpdate(req.params.id, { $set: toUpdate }, { new: true })
    .then(location => res.status(201).json(location))
    .catch(error => res.status(500).json({ message: "Internal server error" }));
});

//delete route
router.delete("/:id", (req, res) => {
  Locations.findByIdAndRemove(req.params.id)
    .then(location => res.status(204).end())
    .catch(error => res.status(500).json({ message: "Internal server error" }));
});

module.exports = { router };
