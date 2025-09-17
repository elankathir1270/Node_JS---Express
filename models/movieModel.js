const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required field"],
    unique: true,
  },
  description: String,
  duration: {
    type: Number,
    required: [true, "Duration is required field"],
  },
  ratings: {
    type: Number,
    default: 1.0,
  },
});

// responsible for creating collection in DB with name 'Movie' based on movieSchema
const Movie = mongoose.model("Movie", movieSchema);

// const testMovie = new Movie({
//   name: "Endhiran",
//   description: "Test description",
//   duration: 185,
//   ratings: 4.5,
// });

// testMovie
//   .save()
//   .then((res) => console.log(res))
//   .catch((err) => console.log("some error " + err));

module.exports = Movie;
