const config = require("config");
const Sequelize = require("sequelize");
require("dotenv").config();

const {
  db: { host, port, name, user },
} = config;

const sequelize = new Sequelize(name, user, process.env.dbpassword, {
  host: host,
  dialect: "mysql",
  port: port,
  dialectOptions: {
    connectTimeout: 60000,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

module.exports.sequelize = sequelize;
