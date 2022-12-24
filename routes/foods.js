const express = require("express");
const { add, remove } = require("lodash");
const { auth, authAdmin } = require("../middlewares/auth");
const { validateFood, FoodModel } = require("../models/foodModel");
const { UserModel } = require("../models/userModel");
const router = express.Router();


//works in front
//get all foods
router.get("/", async (req, res) => {
    let perPage = req.query.perPage || 6;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? 1 : -1;
    try {
        let data = await FoodModel.find({})
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse })        // like -> order by _id DESC
        res.json(data);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ msg: "there error try again later", err })
    }
})


//works 
//get my foods
router.get("/myFoods", auth, async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? 1 : -1;

    try {
        let data = await FoodModel.find({ user_id: req.tokenData._id })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse })        // like -> order by _id DESC
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

//works
//get user's foods
router.get("/userFoods/:userID", auth, async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? 1 : -1;

    try {
        let userID = req.params.userID;
        let data = await FoodModel.find({ user_id: userID })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse })        // like -> order by _id DESC
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

//works
//count how many food
router.get("/count", async (req, res) => {
    try {
        // .countDocument -> return how many foods exist in DB
        let count = await FoodModel.countDocuments({})
        res.json({ count });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})


//works
// An area that returns the food's details 
router.get("/foodInfo/:foodID", async (req, res) => {
    try {
        let foodID = req.params.foodID;
        let foodInfo = await FoodModel.findOne({ _id: foodID });
        res.json(foodInfo);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})




//works
//     /foods/search?s=
router.get("/search", async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    try {
        let queryS = req.query.s;
        let searchReg = new RegExp(queryS, "i")
        let data = await FoodModel.find({ $or: [{ name: searchReg }, { description: searchReg }, { categories_url: searchReg }, { ingredient: searchReg }] })
            .limit(perPage)
            .skip((page - 1) * perPage)
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})


//works
//search by category of foods
//     /foods/category/:catname
router.get("/category/:catname", async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    try {
        let paramsS = req.params.catname;
        let searchReg = new RegExp(paramsS, "i")
        let data = await FoodModel.find({ categories_url: searchReg })
            .limit(perPage)
            .skip((page - 1) * perPage)
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})


//works
//get all foods that i liked them
//     /foods/myLikeFoods
router.get("/myLikeFoods", auth, async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    try {
        let data = await FoodModel.find({ likes: req.tokenData._id })
            .limit(perPage)
            .skip((page - 1) * perPage)
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

//works
//get all users that give like to my food
//     /foods/usersLikesFood
router.get("/usersLikesFood/:foodId", auth, async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    try {
        let foodId = req.params.foodId
        let data = await FoodModel.findOne({ _id: foodId, user_id: req.tokenData._id })
        // console.log(foodId)
        // console.log(req.tokenData._id)
        // console.log(data.likes)

        if (!data) {
            return res.status(400).json({ msg: "data not found" })
        }
        let users = await UserModel.find({ _id: data.likes })
            .limit(perPage)
            .skip((page - 1) * perPage)
        res.json(users);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})




//works 
//add food
router.post("/", auth, async (req, res) => {
    let validBody = validateFood(req.body);
    if (validBody.error) {
        res.status(400).json(validBody.error.details)
    }
    try {
        let food = new FoodModel(req.body);
        food.user_id = req.tokenData._id;
        let user = await UserModel.findOne({ _id: req.tokenData._id })
        food.user_nickname = user.nickname;
        await food.save();
        res.json(food);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})


//works
//edit food
router.put("/:idEdit", auth, async (req, res) => {
    let validBody = validateFood(req.body);
    if (validBody.error) {
        res.status(400).json(validBody.error.details)
    }
    try {
        let idEdit = req.params.idEdit
        let data;
        if (req.tokenData.role == "admin") {
            data = await FoodModel.updateOne({ _id: idEdit }, req.body);
        }
        else {
            data = await FoodModel.updateOne({ _id: idEdit, user_id: req.tokenData._id }, req.body);
        }
        data = await FoodModel.findOne({ _id: idEdit })
        data.updatedAt = new Date(Date.now() + 2 * 60 * 60 * 1000)
        data.save()
        res.json(data);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

//works
//delete food
router.delete("/:idDel", auth, async (req, res) => {
    try {
        let idDel = req.params.idDel
        let data;
        if (req.tokenData.role == "admin") {
            data = await FoodModel.deleteOne({ _id: idDel });
        }
        else {
            data = await FoodModel.deleteOne({ _id: idDel, user_id: req.tokenData._id });
        }
        res.json(data);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})


//works in front
//  user do like and add/remove his id to/from array 
router.patch("/changeLike/:foodID", auth, async (req, res) => {
    try {
        const foodID = req.params.foodID
        const userId = req.tokenData._id
        let data;
        let food = await FoodModel.findOne({ _id: foodID })
        if (!food.likes.includes(userId)) {
            data = await FoodModel.updateOne({ _id: foodID }, { $push: { likes: userId } })
        }
        else {
            data = await FoodModel.updateOne({ _id: foodID }, { $pull: { likes: userId } })
        }
        console.log(data);
        res.status(200).json(data);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

//works
//if the admin want to change te active of food
router.patch("/changeActive/:foodID", authAdmin, async (req, res) => {
    if (!req.body.active && req.body.active != false) {
        return res.status(400).json({ msg: "Need to send active in body" });
    }
    try {
        let foodID = req.params.foodID
        let data = await FoodModel.updateOne({ _id: foodID }, { active: req.body.active })
        res.status(200).json(data);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})



module.exports = router;