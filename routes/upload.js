const express = require("express");
const router = express.Router();
const { auth, authAdmin } = require("../middlewares/auth");
const { CategoryModel } = require("../models/categoryModel");
const { FoodModel } = require("../models/foodModel");
const { UserModel } = require("../models/userModel");
const { uploadFile } = require("../util/uploadFile")

router.get("/", (req, res) => {
  res.json({ msg: "Upload work!" })
})

//upload avatar image in signUp in first time
router.post("/uploadAvatar/:id", async (req, res) => {
  const userId = req.params.id
  try {
    let data = await uploadFile(req, "myFile22", "images/imagesAvatar/" + userId);
    if (data.fileName) {
      await UserModel.updateOne({ _id: userId }, { img_url: data.fileName })
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



//update avatar img not in the first time in order to add middleWare-auth token
router.post("/uploadAvatarUpdate",auth, async (req, res) => {
  try {
    let data = await uploadFile(req, "myFile22", "images/imagesAvatar/" + req.tokenData._id);
    if (data.fileName) {
     await UserModel.updateOne({ _id: req.tokenData._id }, { img_url: data.fileName })
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


//upload Category image
router.post("/uploadCategory/:id", authAdmin, async (req, res) => {
  try {
    const categoryId = req.params.id
    let data = await uploadFile(req, "myFile22", "images/imagesCategory/" + categoryId);
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

//upload food image in first time and update food image - V
router.post("/uploadFood/:id", auth, async (req, res) => {
  const foodId = req.params.id;
  try {
    let data = await uploadFile(req, "myFile22", "images/imagesFood/" +foodId);
    if (data.fileName) {
      await FoodModel.updateOne({ _id: foodId }, { img_url: data.fileName })
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