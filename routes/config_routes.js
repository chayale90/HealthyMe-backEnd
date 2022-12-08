const indexR = require("./index");
const usersR = require("./users");
const catsR = require("./categories");
const foodsR = require("./foods");
const uploadR = require("./upload");

exports.routesInit = (app) => {
  app.use("/",indexR);
  app.use("/users",usersR);
  app.use("/categories",catsR);
  app.use("/foods",foodsR);
  app.use("/upload",uploadR);
}