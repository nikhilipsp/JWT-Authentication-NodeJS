const jwt = require("jsonwebtoken");
const path = require("path");
const Sequelize = require("sequelize");
const db = require("../db/connection");
const User = require(path.join(__dirname, "../db/models/user.js"))(
  db.sequelize,
  Sequelize.DataTypes
);

const verifyJWT = async function (req, res, next) {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json("Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findOne({
      where: { id: decodedToken?._id },
      attributes: { exclude: ["password", "refreshToken"] },
    });

    if (!user) {
      return res.status(401).json("Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new Error(error.message || "Invalid access token");
  }
};

module.exports.verifyJWT = verifyJWT;
