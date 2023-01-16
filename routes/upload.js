const express = require("express");
const path = require("path");
const router = express.Router();
const { auth, authAdmin } = require("../middlewares/auth");
const { CategoryModel } = require("../models/categoryModel");
const { FoodModel } = require("../models/foodModel");
const { UserModel } = require("../models/userModel");
const { monkeyUpload } = require("../util/uploadFile")

router.get("/", (req, res) => {
  res.json({ msg: "Upload work!" })
})

//upload  avatar img in signUp in first time
router.post("/uploadAvatarSignUp/:id", async (req, res) => {
  const userId = req.params.id
  try {
    let data = await monkeyUpload(req, "myFile22", "images/imagesAvatar/" + userId);
    if (data.fileName) {
      let updateData = await UserModel.updateOne({ _id: userId }, { img_url: data.fileName })
     return res.json(data)
    }
    else {
      return res.status(400).json({ msg: "There problem" })
    }
  }
  catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
})


//I didn`t use it yet
//update avatar img not in the first time 
router.post("/uploadAvatar", async (req, res) => {
  try {
    let data = await monkeyUpload(req, "myFile22", "images/imagesAvatar/" + req.tokenData._id);
    if (data.fileName) {
      let updateData = await UserModel.updateOne({ _id: req.tokenData._id }, { img_url: data.fileName })
     return res.json(data)
    }
    else {
      return res.status(400).json({ msg: "There problem" })
    }
  }
  catch (err) {
    console.log(err)
    return res.status(500).json({ msg: "err", err })
  }
})

//used, works
//add category img by id
router.post("/uploadCategory/:id", authAdmin, async (req, res) => {
  try {
    const categoryId = req.params.id
    let data = await monkeyUpload(req, "myFile22", "images/imagesCategory/" + categoryId);
    if (data.fileName) {
      let updateData = await CategoryModel.updateOne({ _id: categoryId }, { img_url: data.fileName })
      return res.json(data)
    }
    else {
      return res.status(400).json({ msg: "There problem" })
    }
  }
  catch (err) {
    console.log(err)
    return res.status(500).json({ msg: "err", err })
  }
})

//used, works
router.post("/uploadFood/:id", auth, async (req, res) => {
  const foodId = req.params.id
  try {
    let data = await monkeyUpload(req, "myFile22", "images/imagesFood/" +foodId);
    if (data.fileName) {
      let updateData = await FoodModel.updateOne({ _id: foodId }, { img_url: data.fileName })
      res.json(data)
    }
    else {
      return res.status(400).json({ msg: "There problem" })
    }
  }
  catch (err) {
    console.log(err)
    return res.status(500).json({ msg: "err", err })
  }
})


module.exports = router;