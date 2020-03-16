const express = require("express");
const cors = require("cors");
const app = express();
const swagger = require('swagger-ui-express')
const documentation = require('./swagger.json')
const {notFound, internalServerError} = require('./helpers/error.js')

const mongoose = require("mongoose");
var morgan = require("morgan");
const dotenv = require("dotenv");
dotenv.config();
mongoose.set('useFindAndModify', false)

const env = process.env.NODE_ENV;
const dbConnectionString = {
  development: process.env.DB_CONNECTION,
  test: process.env.DB_CONNECTION_TEST,
  staging: process.env.DB_CONNECTION_STAGING,
  production: process.env.DB_CONNECTION_PRODUCTION
};

console.log(dbConnectionString[env]);
app.use(morgan("tiny"));


mongoose
  .connect(dbConnectionString[env], {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => console.log("Database connected!"))
  .catch(err => console.log(err));

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
const router = require("./router.js");
app.use("/api/v1", router);
app.use('/documentation', swagger.serve, swagger.setup(documentation))

app.use(notFound);
app.use(internalServerError);

module.exports = app;
