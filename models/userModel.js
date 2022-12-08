const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { config } = require("../config/secret")

let userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  info: String,
  nickname: String,
  birth_date: Date,
  location: String,
  img_url: { type: String, default: "" },
  height: Number,
  weight: Number,
  sex: String,
  date_created: {
    type: Date, default: Date.now()
  },
  // role of the user if regular user or admin
  role: {
    type: String, default: "user"
  },
  active: {
    type: Boolean, default: true,
  },
  rank: {
    type: String, default: "Beginer"
  },
  score: {
    type: Number, default: 20
  },
  updatedAt: {
    type: Date, default: Date.now()
  },
  followers: [String],
  followings: [String]
})

exports.UserModel = mongoose.model("users", userSchema);

exports.createToken = (_id, role) => {
  let token = jwt.sign({ _id, role }, config.tokenSecret, { expiresIn: "30d" });
  return token;
}

exports.validUser = (_reqBody) => {
  let joiSchema = Joi.object({
    name: Joi.string().min(2).max(99).required(),
    email: Joi.string().min(2).max(99).email().required(),
    password: Joi.string().min(3).max(99).required(),
    info: Joi.string().min(2).max(99).allow(null, ""),
    nickname: Joi.string().min(2).max(99).allow(null, ""),
    birth_date: Joi.string().min(2).max(99).required(),
    location: Joi.string().min(2).max(99).allow(null, ""),
    img_url: Joi.string().min(2).max(99).allow(null, ""),
    height: Joi.number().min(2).max(350).required(),
    weight: Joi.number().min(2).max(300).required(),
    sex: Joi.string().min(2).max(99).required()
  })

  return joiSchema.validate(_reqBody);
}

exports.validLogin = (_reqBody) => {
  let joiSchema = Joi.object({
    email: Joi.string().min(2).max(99).email().required(),
    password: Joi.string().min(3).max(99).required()
  })

  return joiSchema.validate(_reqBody);
}