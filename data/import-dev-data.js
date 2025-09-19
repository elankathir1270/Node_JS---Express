const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const Movie = require("./../models/movieModel");

dotenv.config({ path: "./config.env" });

//connect to mongodb
mongoose
  .connect(process.env.CONN_STR, { useNewUrlParser: true })
  .then((conn) => {
    //console.log(conn);
    console.log("DB Connection Successful");
  })
  .catch((error) => {
    console.log("Some Error has Occured");
  });

//read movies.json file
const movies = JSON.parse(fs.readFileSync("./data/movies.json", "utf-8"));

//delete existing document from mongodb collection
const deleteMovies = async () => {
  try {
    await Movie.deleteMany();
    console.log("data successfully deleted");
  } catch (error) {
    console.log(error.message);
  }
  process.exit();
};

//import movies data to mongodb collection
const importMovies = async () => {
  try {
    await Movie.create(movies);
    console.log("data successfully imported");
  } catch (error) {
    console.log(error.message);
  }
  process.exit();
};

//console.log(process.argv);
if (process.argv[2] === "--import") {
  importMovies();
}
if (process.argv[2] === "--delete") {
  deleteMovies();
}
