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

async function generateAccessAndRefereshTokens(userId) {
  try {
    const user = await User.findOne({
      where: {
        id: userId,
      },
    });
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await User.update(
      { refreshToken: String(refreshToken) },
      {
        where: {
          id: userId,
        },
      }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new Error(error.message || "Error generating tokens");
  }
}

async function registerUser(req, res) {
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
    throw new Error(error.message || "Error registering user");
  }
}

async function loginUser(req, res) {
  try {
    const { email, userName, password } = req.body;
    console.log(email);

    if (!userName && !email) {
      return res.status(400).json(`username or email is required`);
    }
    //find the user
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: email }, { username: userName }],
      },
    });

    if (!user) {
      return res.status(404).json(`User does not exist`);
    }
    //password check
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res.status(401).json(`Invalid user credentials`);
    }
    //access and referesh token
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user.id
    );

    const loggedInUser = await User.findOne({
      where: { id: user.id },
      attributes: { exclude: ["password", "refreshToken"] },
    });

    const options = {
      httpOnly: true,
      secure: true,
    };
    //send cookie
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        `User logged In Successfully : ${JSON.stringify({
          user: loggedInUser,
          accessToken,
          refreshToken,
        })}`
      );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Error occured in loginUser ${error}` });
  }
}

async function logoutUser(req, res) {
  await User.update({ refreshToken: null }, { where: { id: req.user.id } });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json("User logged Out");
}

module.exports.registerUser = registerUser;
module.exports.loginUser = loginUser;
module.exports.logoutUser = logoutUser;
