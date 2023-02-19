const express = require("express");
const router = express.Router();
const fs = require("fs");
const { add, remove } = require("lodash");
const { API_URL } = require("../constants/const");
const { auth, authAdmin } = require("../middlewares/auth");
const { validateFood, FoodModel } = require("../models/foodModel");
const { UserModel } = require("../models/userModel");


//try 
//     /foods/?searchTerm=icecream
router.get("/", async (req, res) => {
    let perPage = req.query.perPage || 6;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? 1 : -1;
    let searchTerm = req.query.searchTerm;
    let findObj = {};
    // console.log(req.query);
    if (searchTerm) {
        let searchReg = new RegExp(searchTerm, "i");
        findObj = {
            $or: [
                { name: searchReg },
                { description: searchReg },
                { categories_url: searchReg },
                { ingredient: searchReg },
            ],
        };
    }
    if (req.query.categoryTerm) {
        searchTerm = req.query.categoryTerm;
        findObj = { categories_url: searchTerm };
    }
    // console.log(findObj);
    try {
        let data = await FoodModel.find(findObj)
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse }); // like -> order by _id DESC
        data.forEach(item => {
            item.img_url = !item.img_url.includes('http') && item.img_url.length ? API_URL + item.img_url : item.img_url
        });
        let totalItems = await FoodModel.find(findObj).count();
        return res.status(200).json({ data, totalPages: totalItems / perPage });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: "there error try again later", err });
    }
});


//works 
//get my foods
router.get("/myFoods", auth, async (req, res) => {
    let perPage = req.query.perPage || 3;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? 1 : -1;

    try {
        let data = await FoodModel.find({ user_id: req.tokenData._id })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse })        // like -> order by _id DESC
        data.forEach(item => {
            item.img_url = !item.img_url.includes('http') && item.img_url.length ? API_URL + item.img_url : item.img_url
            // item.name= item.name.slice(0, 1).toUpperCase() + item.name.slice(1)
        });
        return res.status(200).json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

//works but not used because I have populate
//get user's foods
router.get("/userFoods/:userID", auth, async (req, res) => {
    let perPage = req.query.perPage || 4;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? 1 : -1;
    let userID = req.params.userID;
    // console.log(userID);
    try {
        let data = await FoodModel.find({ user_id: userID })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse })        // like -> order by _id DESC
        data.forEach(item => {
            item.img_url = !item.img_url.includes('http') && item.img_url.length ? API_URL + item.img_url : item.img_url
        });
        return res.status(200).json(data);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ msg: "there error try again later", err })
    }
})

//works not used 
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
        foodInfo.img_url = !foodInfo.img_url.includes('http') && foodInfo.img_url.length ? API_URL + foodInfo.img_url : foodInfo.img_url
        res.status(200).json(foodInfo);
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ msg: "err", err })
    }
})




//works
//get all foods that i liked them
//     /foods/myLikeFoods
router.get("/myLikeFoods", auth, async (req, res) => {
    let perPage = req.query.perPage || 6;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? 1 : -1;
    try {
        let data = await FoodModel.find({ likes: req.tokenData._id })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse })        // like -> order by _id DESC
        data.forEach(item => {
            item.img_url = !item.img_url.includes('http') && item.img_url.length ? API_URL + item.img_url : item.img_url
        });
        res.status(200).json(data);
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
        res.status(200).json(users);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})


//works in client
//add food
router.post("/", auth, async (req, res) => {
    let validBody = validateFood(req.body);
    if (validBody.error) {
        res.status(400).json(validBody.error.details)
    }
    try {
        let myId = req.tokenData._id
        let food = new FoodModel(req.body);
        food.user_id = req.tokenData._id;

        //push idFood to array of posts and add 5 coins
        let user = await UserModel.findByIdAndUpdate({ _id: myId }, { $push: { posts: food._id }, $inc: { score: 5 } })
        food.user_nickname = user.nickname;

        //  update totalPrepTime
        food.totalPrepMinutes = (food.prepHours * 60) + food.prepMinutes;

        await food.save();
        return res.status(201).json(food);
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ msg: "err", err })
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
        res.status(200).json(data);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

//works back & front
//delete food and img food
router.delete("/:idDel", auth, async (req, res) => {
    let idDel = req.params.idDel
    let myUser = req.tokenData._id
    let deleteFood;
    // console.log(idDel);
    try {
        //delete img_url
        fs.unlink(`public/images/imagesFood/${idDel}.png`, async (err) => {
            if (err) {
                console.log(err);
                return res.status(400).json({ msg: "Not found the image" });
            }
        })
        let updateImgFood = await FoodModel.updateOne({ _id: idDel }, { img_url: " " })

        if (req.tokenData.role == "admin") {
            deleteFood = await FoodModel.deleteOne({ _id: idDel });
        }
        else {
            deleteFood = await FoodModel.deleteOne({ _id: idDel, user_id: myUser });
        }

        //remove Food from posts array and decrease the coins in 5 
        let updatePosts = await UserModel.updateOne({ _id: myUser }, { $pull: { posts: idDel }, $inc: { score: -5 } })

        return res.status(200).json({ updatePosts, deleteFood, updateImgFood });
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ msg: "err", err })
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





//works in front
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