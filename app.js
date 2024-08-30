var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");

var app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

module.exports = app;
