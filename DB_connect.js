const mongoose = require("mongoose");

async function databaseConnect() {
  //if connection does not already exist
  if (mongoose.connection.readyState !== 1) {
    try {
      console.log(process.env.MONGOOSE_KEY)
      await mongoose.connect(process.env.MONGOOSE_KEY);
      console.log("successfully connected to database!");
    } catch (e) {
      console.log(e);
      console.log("Cannot connect to database :(");
    }
  } 
}

module.exports = databaseConnect;