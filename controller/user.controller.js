const jwt = require("jsonwebtoken");
require("dotenv").config();
const path = require("path");
const db = require("../db/connection");
const Sequelize = require("sequelize");
const User = require(path.join(__dirname, "../db/models/user.js"))(
  db.sequelize,
  Sequelize.DataTypes
);
const Op = Sequelize.Op;

async function registerUser(req, res, callback) {
  try {
    // get user details from frontend
    const { userName, email, fullName, password } = req.body;
    // validation - not empty
    if (
      [fullName, email, userName, password].some(
        (field) => field?.trim() === ""
      )
    ) {
      return res.status(400).json(`All fields are required`);
    }
    // check if user already exists: username, email
    const existedUser = await User.findOne({
      where: {
        [Op.or]: [{ email: email }, { username: userName }],
      },
    });

    if (existedUser) {
      return res.status(409).json(`User with email or username already exists`);
    }
    // create user object - create entry in db
    const user = await User.create({
      userName: userName.toLowerCase(),
      email,
      fullName,
      password,
      refreshToken: null,
    });
    // remove password and refresh token field from response
    const createdUser = await User.findOne({
      where: { id: user.id },
      attributes: { exclude: ["password", "refreshToken"] },
    });
    // check for user creation
    if (!createdUser) {
      return res
        .status(500)
        .json(`Something went wrong while registering the user`);
    }
    // return response
    return res
      .status(201)
      .json(
        `User registered Successfully : ${JSON.stringify(
          createdUser.dataValues
        )}`
      );
  } catch (error) {
    console.log(error);
    callback(new Error(error));
  }
}

module.exports.registerUser = registerUser;
