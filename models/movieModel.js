const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required field"],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required field"],
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, "Duration is required field"],
  },
  ratings: {
    type: Number,
    //default: 1.0,
  },
  totalRatings: {
    type: Number,
  },
  releaseYear: {
    type: Number,
    required: [true, "Release year is required field"],
  },
  releaseDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false, //exclude this field to client
  },
  genres: {
    type: [String],
    required: [true, "Genres is required field"],
  },
  directors: {
    type: [String],
    required: [true, "Directors is required field"],
  },
  actors: {
    type: [String],
    required: [true, "Actors is required field"],
  },
  coverImage: {
    type: String,
    required: [true, "Cover image is required field"],
  },
  price: {
    type: Number,
    required: [true, "Price is required field"],
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
