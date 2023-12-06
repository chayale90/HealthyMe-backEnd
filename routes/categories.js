const express = require("express");
const fs = require("fs");
const { API_URL } = require("../constants/const");
const { authAdmin } = require("../middlewares/auth");
const {CategoryModel, validateCategory,validateEditCategory,} = require("../models/categoryModel");
const router = express.Router();

//works
//get all categories
router.get("/", async (req, res) => {
  let perPage = req.query.perPage || 99;
  let page = req.query.page || 1;

  try {
    let data = await CategoryModel.find({})
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ _id: -1 }); // .sort({_id:-1}) like -> order by _id DESC

    data.forEach((item) => {
      item.img_url =
        !item.img_url.includes("http") && item.img_url.length
          ? API_URL + item.img_url
          : item.img_url;
    });
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "there error try again later", err });
  }
});

//works
//get categorySingle by id
router.get("/byId/:id", async (req, res) => {
  try {
    let data = await CategoryModel.findOne({ _id: req.params.id });
    data.img_url =
      !data.img_url.includes("http") && data.img_url.length
        ? API_URL + data.img_url
        : data.img_url;
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "there error try again later", err });
  }
});


//add category
router.post("/", authAdmin, async (req, res) => {
  let validBody = validateCategory(req.body);
  if (validBody.error) {
    res.status(400).json(validBody.error.details);
  }
  try {
    let category = new CategoryModel(req.body);
    await category.save();
    res.json(category);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "err", err });
  }
});


//edit category
router.put("/:idEdit", authAdmin, async (req, res) => {
  let validBody = validateEditCategory(req.body);
  if (validBody.error) {
    res.status(400).json(validBody.error.details);
  }
  try {
    let idEdit = req.params.idEdit;
    let data = await CategoryModel.updateOne({ _id: idEdit }, req.body);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});

//delete category
router.delete("/:idDel", authAdmin, async (req, res) => {
  let idDel = req.params.idDel;
  try {
    //delete img_url
    fs.unlink(`public/images/imagesCategory/${idDel}.png`, async (err) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ msg: "Not found the image" });
      }
    });
   await CategoryModel.updateOne({ _id: idDel }, { img_url: " " } );
    let data = await CategoryModel.deleteOne({ _id: idDel });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});

module.exports = router;
