const mongoose = require("mongoose");
const fs = require("fs");

const movieSchema = new mongoose.Schema(
  {
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
    createdBy: {
      type: String,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//virtual properties
/**
 * virtual properties cannot be used in query "Movie.find({durationInHours : 2})"
 * because it wont be in DB documents
 */
movieSchema.virtual("durationInHours").get(function () {
  return this.duration / 60;
});

//document middleware
/**
 * Executed before document is saved in the DB
 * during .save() or .create() function call save event will happen but
 * save event wont be happen for insertMany,findByIdAndUpdate
 */

movieSchema.pre("save", function (next) {
  //here "this" key points to doc middleware
  //console.log(this);
  this.createdBy = "SRK";
  next();
});

movieSchema.post("save", function (doc, next) {
  const content = `A new movie document with name ${doc.name} has been created by ${doc.createdBy} \n`;
  //here we cant access "this"(doc object)
  fs.writeFileSync("./log/log.txt", content, { flag: "a" }, (err) => {
    console.log(err.message);
  });
  next();
});

//query middleware
/**
 * Runs function before or after query(Movie.find({})) is executed
 */

movieSchema.pre(/^find/, function (next) {
  //here using regex to use this function for all sort of query method(event) which starts with find
  //here "this" key points to query object
  //console.log(this);
  this.find({ releaseDate: { $lte: Date.now() } });
  this.startTime = Date.now(); //creating prop in query object
  next();
});

movieSchema.post(/^find/, function (docs, next) {
  this.find({ releaseDate: { $lte: Date.now() } });
  this.endTime = Date.now();

  const content = `Query took ${
    this.endTime - this.startTime
  } milliseconds to fetch the docs \n`;

  fs.writeFileSync("./log/log.txt", content, { flag: "a" }, (err) => {
    console.log(err.message);
  });
  next();
});

//aggregate middleware
/**
 * Runs function before or after aggregate is executed
 */

movieSchema.pre("aggregate", function (next) {
  //here "this" key points to aggregate object
  console.log(
    this.pipeline().unshift({ $match: { releaseDate: { $lte: new Date() } } })
  );
  next();
});

//note: we can add multiple "pre" and "post" hooks.

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
