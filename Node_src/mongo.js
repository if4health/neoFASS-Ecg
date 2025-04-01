const mongoose = require('mongoose');

const { DB_URI, DB_NAME } = process.env;

console.log(DB_URI);

class dbConnect {
  constructor() {
    mongoose.connect(DB_URI, {
      dbName: DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    this.mongodb = mongoose.connection;
  }
}

module.exports = new dbConnect();
