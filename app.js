const express = require("express");
const path = require("path");
const http = require("http");
const cors = require("cors");

//must for files
const fileUpload = require("express-fileupload");

const { routesInit } = require("./routes/config_routes")
require("./db/mongoconnect");

const app = express();

// access all domains to reach our server
// app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
})


// to get body
app.use(express.json());



// definition public folder as main folder
app.use(express.static(path.join(__dirname, "public")))

// do the option to work with files
app.use(fileUpload({ limits: { fileSize: 1024 * 1024 * 5 } }))

routesInit(app);

const server = http.createServer(app);

let port = process.env.PORT || 3003
server.listen(port);