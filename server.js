require("dotenv").config();
const app = require("./app");
const config = require("config");
const {
  service: { port, name },
} = config;

app.listen(port, async () => {
  try {
    const start_message =
      "**** ApplicationServer " +
      name.toUpperCase() +
      " started running on port " +
      port +
      "****";
    console.log(start_message);
  } catch (error) {
    console.log("ApplicationServer Error ", error);
    process.exit(-1);
  }
});
