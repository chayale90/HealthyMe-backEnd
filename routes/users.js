const express = require("express");
const bcrypt = require("bcrypt");
const { auth, authAdmin } = require("../middlewares/auth");
const { UserModel, validUser, validLogin, createToken } = require("../models/userModel");
const { API_URL } = require("../constants/const");
const router = express.Router();


//Check the router "users" works
router.get("/", (req, res) => {
  res.json({ msg: "users work" })
})

// ראוט שבודק שהטוקן תקין ומחזיר מידע עליו כגון איי די של המשתמש פלוס התפקיד שלו
router.get("/checkToken", auth, async (req, res) => {
  // console.log(req.tokenData)
  res.status(200).json(req.tokenData);
})



//works in front V
// An area that returns the user's details according to the token he sends
router.get("/myInfo", auth, async (req, res) => {
  try {
    let userInfo = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 })
    userInfo.img_url = !userInfo.img_url.includes('http') && userInfo.img_url.length ? (API_URL + userInfo.img_url) : userInfo.img_url
    res.status(200).json(userInfo);
  }
  catch (err) {
    console.log(err)
    return res.status(500).json({ msg: "err", err })
  }
})

//works in front V
// just admin can get all users
router.get("/usersList", authAdmin, async (req, res) => {
  let perPage = req.query.perPage || 5;
  let page = req.query.page || 1;
  try {
    let data = await UserModel.find({}, { password: 0 })
      .limit(5)
      .skip((page - 1) * perPage)
    data.forEach(item => {
      item.img_url = !item.img_url.includes('http') && item.img_url.length ? (API_URL + item.img_url) : item.img_url
    });
    res.status(200).json(data)
  }
  catch (err) {
    console.log(err)
    return res.status(500).json({ msg: "err", err })
  }
})

//works
//Count users
router.get("/count", authAdmin, async (req, res) => {
  try {
    let count = await UserModel.countDocuments({})
    res.status(200).json({ count })
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})


//works in front
// An area that returns the user's details 
router.get("/userInfo/:userID", auth, async (req, res) => {
  try {
    let userID = req.params.userID;
    let userInfo;
    if (req.tokenData.role == "admin") {
      userInfo = await UserModel.findOne({ _id: userID }, { password: 0 });
    }
    else {
      userInfo = await UserModel.findOne({ _id: userID }, { password: 0, height: 0, weight: 0, email: 0, _id: 0 });
    }
    userInfo.img_url = !userInfo.img_url.includes('http') && userInfo.img_url.length ? (API_URL + userInfo.img_url) : userInfo.img_url
    res.status(200).json(userInfo);
  }
  catch (err) {
    console.log(err)
    return res.status(500).json({ msg: "err", err })
  }
})



//works
//     /users/search?s=
router.get("/search", async (req, res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;
  try {
    let queryS = req.query.s;
    let searchReg = new RegExp(queryS, "i")
    let data = await UserModel.find({ $or: [{ name: searchReg }, { nickname: searchReg }, { location: searchReg }] })
      .limit(perPage)
      .skip((page - 1) * perPage)
    res.status(200).json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }
})

//works
//get all my followers
//    /users/myFollowers?search= 
router.get("/myFollowers", auth, async (req, res) => {
  const perPage = req.query.perPage || 2;
  const page = req.query.page || 1;
  try {
    let user = await UserModel.findOne({ _id: req.tokenData._id })
    let users = await UserModel.find({ _id: user.followers })
      .limit(perPage)
      .skip((page - 1) * perPage)
    users.forEach(item => {
      item.img_url = !item.img_url.includes('http') && item.img_url.length ? (API_URL + item.img_url) : item.img_url
    });


    return res.status(200).json(users);
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "there error try again later", err })
  }
})

//works
//get all my followings
//    /users/myFollowings
router.get("/myFollowings", auth, async (req, res) => {
  let perPage = req.query.perPage || 2;
  let page = req.query.page || 1;
  try {
    let user = await UserModel.findOne({ _id: req.tokenData._id })
    let users = await UserModel.find({ _id: user.followings })
      .limit(perPage)
      .skip((page - 1) * perPage)
    users.forEach(item => {
      item.img_url = !item.img_url.includes('http') && item.img_url.length ? (API_URL + item.img_url) : item.img_url
    });
    return res.status(200).json(users);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }
})


//works in front
//add user
router.post("/", async (req, res) => {
  let validBody = validUser(req.body);
  //if have mistake in req.body that came fron client side 
  //will be error and return details of mistake
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    console.log(req.body);
    let user = new UserModel(req.body);

    //level of pass=10
    user.password = await bcrypt.hash(user.password, 10);
    // translate to unix time
    user.birth_date = Date.parse(user.birth_date);
    await user.save();
    user.password = "***";
    user.date_created = new Date(Date.now() + 2 * 60 * 60 * 1000)
    user.updatedAt = new Date(Date.now() + 2 * 60 * 60 * 1000)
    res.status(201).json(user);
  }
  catch (err) {
    if (err.code == 11000) {
      return res.status(500).json({ msg: "Email already in system, try log in", code: 11000 })
    }
    console.log(err);
    res.status(500).json({ msg: "err", err })
  }
})


//works in front
//Login user
router.post("/login", async (req, res) => {
  let validBody = validLogin(req.body);
  if (validBody.error) {
    // .details -> מחזיר בפירוט מה הבעיה צד לקוח
    return res.status(400).json(validBody.error.details);
  }
  try {
    // קודם כל לבדוק אם המייל שנשלח קיים  במסד
    let user = await UserModel.findOne({ email: req.body.email })
    if (!user) {
      return res.status(401).json({ msg: "Password or email is worng ,code:1" })
    }
    // אם הסיסמא שנשלחה בבאדי מתאימה לסיסמא המוצפנת במסד של אותו משתמש
    let authPassword = await bcrypt.compare(req.body.password, user.password);
    if (!authPassword) {
      return res.status(401).json({ msg: "Password or email is worng ,code:2" });
    }
    // מייצרים טוקן לפי שמכיל את האיידי של המשתמש
    let token = createToken(user._id, user.role);
    res.json({ token, role: user.role });
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})


//לנסות לקצר את הכתיבה הארוכה באמצעות select 
//האם זה בסדר שלא ניתן לערוך את העוקבים? והurl_name?
// //Edit user
router.put("/:idEdit", auth, async (req, res) => {
  try {
    let idEdit = req.params.idEdit
    let user;
    // if (req.body.email || req.body.date_created || req.body.active || req.body.role || req.body._id || req.body.rank || req.body.score || req.body.nickname || req.body.password || req.body.followers || req.body.followings) {
    //   return res.status(401).json({ msg: "You can't change your email/password/date_created/active/role/_id/rank/score/nickname" })
    // }
    if (req.tokenData.role == "admin") {
      user = await UserModel.updateOne({ _id: idEdit }, req.body)
    }
    if (req.tokenData._id != idEdit) {
      return res.status(401).json({ msg: "You can't change details of other user" })
    }
    else {
      user = await UserModel.updateOne({ _id: idEdit, _id: req.tokenData._id }, req.body)
    }
    user = await UserModel.findOne({ _id: idEdit })
    user.updatedAt = new Date(Date.now() + 2 * 60 * 60 * 1000)
    await user.save()
    user.password = "***";
    res.json(user);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

//works
//delete user just by admin
router.delete("/:idDel", authAdmin, async (req, res) => {
  try {
    let idDel = req.params.idDel
    let data = await UserModel.deleteOne({ _id: idDel });
    res.json(data);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})


//
//  I do follow and add/remove the id of user to/from array of followings
router.patch("/changeFollow/:userID", auth, async (req, res) => {
  try {
    const userID = req.params.userID
    const myId = req.tokenData._id
    let addFollowings;
    let addFollowers;
    let myUser = await UserModel.findOne({ _id: myId })
    if (!myUser.followings.includes(userID)) {
      console.log("out");
      addFollowings = await UserModel.updateOne({ _id: myId }, { $push: { followings: userID } })
      addFollowers= await UserModel.updateOne({ _id: userID }, { $push: { followers: myId } })
    }
    else {
      console.log("in");
      addFollowings = await UserModel.updateOne({ _id: myId }, { $pull: { followings: userID } })
      addFollowers= await UserModel.updateOne({ _id: userID }, { $pull: { followers: myId } })
    }
    console.log({addFollowers,addFollowings});
    return res.status(200).json({addFollowers,addFollowings});
  }
  catch (err) {
    console.log(err)
    return res.status(500).json({ msg: "err", err })
  }
})


//works in front
//Change user to admin just by other admin
router.patch("/changeRole/:userID", authAdmin, async (req, res) => {
  if (!req.body.role) {
    return res.status(400).json({ msg: "Need to send role in body" });
  }

  try {
    let userID = req.params.userID
    // superAdmin can't change to other thing (to user)
    if (userID == "6376bafda2711b7ac1c693a0") {
      return res.status(401).json({ msg: "You can't change superadmin to user" });

    }
    let data = await UserModel.updateOne({ _id: userID }, { role: req.body.role })
    res.json(data);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})


//works in front
// Do that user will not able to add new food / ban that dont delete the user
// מאפשר לגרום למשתמש לא יכולת להוסיף מוצרים חדשים/ סוג של באן שלא מוחק את המשתמש
router.patch("/changeActive/:userID", authAdmin, async (req, res) => {
  if (!req.body.active && (req.body.active != false)) {
    return res.status(400).json({ msg: "Need to send active in body" });
  }

  try {
    let userID = req.params.userID
    // לא מאפשר ליוזר אדמין להפוך למשהו אחר/ כי הוא הסופר אדמין
    if (userID == "6376bafda2711b7ac1c693a0") {
      return res.status(401).json({ msg: "You cant change superadmin to user" });

    }
    let data = await UserModel.updateOne({ _id: userID }, { active: req.body.active })
    res.json(data);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})



//בעיה אם הטוקן של מישהו אחר הוא יכול להחליף את הסיסמא
//change my password
router.patch("/changeMyPass", auth, async (req, res) => {
  try {
    // קודם כל לבדוק אם המייל שנשלח קיים  במסד
    let user = await UserModel.findOne({ email: req.body.email, _id: req.tokenData._id })
    if (!user) {
      return res.status(401).json({ msg: "Password or email is worng ,code:1" })
    }
    // אם הסיסמא שנשלחה בבאדי מתאימה לסיסמא המוצפנת במסד של אותו משתמש
    let authPassword = await bcrypt.compare(req.body.password, user.password);
    if (!authPassword) {
      return res.status(401).json({ msg: "Password or email is worng ,code:2" });
    }
    //בדיקה שהסיסמאות לא זהות
    if (req.body.password == req.body.newPassword) {
      return res.status(401).json({ msg: "The passwords same" });
    }
    //שומרים את הסיסמא מוצפנת 
    user.password = await bcrypt.hash(req.body.newPassword, 10);
    await user.save();
    res.json({ msg: "password changed successfully" });
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})









module.exports = router;