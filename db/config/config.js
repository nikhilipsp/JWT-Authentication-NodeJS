require("dotenv").config(); // this is important!
const config = require("config");
const {
  db: { host, name, user },
} = config;

module.exports = {
  local: {
    username: user,
    password: process.env.dbpassword,
    database: name,
    host: host,
    dialect: "mysql",
  },
  development: {
    username: "root",
    password: process.env.dbpassword,
    database: "jwtAuth",
    host: "localhost",
    dialect: "mysql",
  },
  test: {
    username: user,
    password: process.env.dbpassword,
    database: name,
    host: host,
    dialect: "mysql",
  },
  production: {
    username: user,
    password: process.env.dbpassword,
    database: name,
    host: host,
    dialect: "mysql",
  },
};
