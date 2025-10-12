const ApiFeatures = require("../utils/apiFeatures");
const CustomError = require("../utils/customError");
const Movie = require("./../models/movieModel");
const asyncErrorHandler = require("./../utils/asyncErrorHandler"); //using this remove try catch blocks

//Aliasing a route using middleware
// exports.getHighestRated = (req, res, next) => {
//   req.query.limit = "2";
//   req.query.sort = "-ratings";
//   next();
// };

/**
note:
By default in Express, req.query isn’t a plain mutable object.
Depending on your query parser setting, it can be a prototype-less object,
sometimes even treated as immutable. That’s why your earlier assignments (req.query.limit = "2") didn’t stick.
So..
*/

//another way
exports.getHighestRated = (req, res, next) => {
  Object.defineProperty(req, "query", {
    value: { ...req.query, sort: "-ratings", limit: "3" },
    writeable: true,
  });

  next();
};

exports.getMovies = asyncErrorHandler(async (req, res, next) => {
  const feature = new ApiFeatures(Movie.find(), req.query)
    .filter()
    .sort()
    .limitingFields()
    .paginate();

  let movies = await feature.query;
  //console.log(req.query);

  //if need to delete some fields in req.query(useful mongodb below v7)
  // const excludeFields = ["sort", "page", "limit", "fields"];
  // const queryObjCopy = { ...req.query };

  // excludeFields.forEach((el) => {
  //   delete queryObjCopy[el];
  // });

  /**
   * postman request:
   * http://localhost:3000/api/v1/movies/?duration[gte]=155&ratings[gte]=4.5&price[lte]=300
   * localhost:3000/api/v1/movies/?sort=-price
   * localhost:3000/api/v1/movies/?sort=-releaseYear,ratings
   * localhost:3000/api/v1/movies/?fields=name,releaseYear,ratings,price
   */

  //Filtering logic
  // let queryStr = JSON.stringify(queryObjCopy);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  // const queryObj = JSON.parse(queryStr);

  // let query = Movie.find(queryObj);

  //Sorting logic (sort is a query function)
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(",").join(" ");
  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort("-createdAt");
  // }

  //Limiting fields
  // if (req.query.fields) {
  //   const fields = req.query.fields.split(",").join(" ");
  //   query = query.select(fields);
  // } else {
  //   query = query.select("-__v"); // '-' indicates exclude field.
  // }

  //Pagination
  // const page = req.query.page * 1;
  // const limit = req.query.limit * 1;

  // //page 1: 1-10, page 2: 11-20, page 3: 21-30
  // const skip = (page - 1) * limit;
  // query = query.skip(skip).limit(limit);

  // if (req.query.page) {
  //   const moviesCount = await Movie.countDocuments();
  //   if (skip >= moviesCount) {
  //     throw new Error("This page is not found");
  //   }
  // }

  //const movies = await query; // silently it is Movie.find().sort()

  // find({ //queryObj
  //   duration: { $gte: 155 },
  //   ratings: { $gte: 4.5 },
  //   price: { $lte: 350 },
  // });

  //another way
  // const movies = await Movie.find()
  //   .where("duration")
  //   .gte(req.query.duration)
  //   .where("ratings")
  //   .equals(req.query.ratings);
  //   .where("price")
  //   .lte(req.query.ratings);

  res.status(200).json({
    status: "success",
    length: movies.length,
    data: {
      movies,
    },
  });
});
exports.getMovie = asyncErrorHandler(async (req, res, next) => {
  //const movie = await Movie.find({_id : req.params.id});
  const movie = await Movie.findById(req.params.id);

  //handling no found error
  if (!movie) {
    const error = new CustomError("Movie with that Id is not found", 404);
    return next(error);
  }

  res.status(200).json({
    status: "success",
    data: {
      movie,
    },
  });
});

exports.addMovie = asyncErrorHandler(async (req, res, next) => {
  // const movie = new Movie({})
  // movie.save();
  //another way

  const movie = await Movie.create(req.body);

  res.status(200).json({
    status: "success",
    data: movie,
  });
});

exports.updateMovie = asyncErrorHandler(async (req, res, next) => {
  const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  //handling no found error
  if (!updatedMovie) {
    const error = new CustomError("Movie with that Id is not found", 404);
    return next(error);
  }

  res.status(200).json({
    status: "success",
    data: {
      movie: updatedMovie,
    },
  });
});
exports.deleteMovie = asyncErrorHandler(async (req, res, next) => {
  const deletedMovie = await Movie.findByIdAndDelete(req.params.id);

  //handling no found error
  if (!deletedMovie) {
    const error = new CustomError("Movie with that Id is not found", 404);
    return next(error);
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getMovieStats = asyncErrorHandler(async (req, res, next) => {
  const stats = await Movie.aggregate([
    { $match: { ratings: { $gte: 4.5 } } },
    {
      $group: {
        _id: "$releaseYear",
        avgRatings: { $avg: "$ratings" },
        avgPrice: { $avg: "$price" },
        maxPrice: { $max: "$price" },
        minPrice: { $min: "$price" },
        priceTotal: { $sum: "$price" },
        movieCount: { $sum: 1 },
      },
    },
    { $sort: { minPrice: 1 } }, //1-asc,-1-dsc
    { $match: { maxPrice: { $gte: 350 } } },
  ]);

  /**
   * based on '$match' stage result, '$group' stage will do its work then
   * based on '$group' stage result '$sort' will do its work.
   * in short one stag result is input to another stage.
   */

  res.status(200).json({
    status: "success",
    count: stats.length,
    data: { stats },
  });
});

//url: localhost:3000/api/v1/movies/movies-by-genre/Romance

exports.getMovieByGenre = async (req, res) => {
  try {
    const genre = req.params.genre;
    const movies = await Movie.aggregate([
      { $unwind: "$genres" },
      {
        $group: {
          _id: "$genres",
          movieCount: { $sum: 1 },
          movies: { $push: "$name" }, //here $sum and $push are aggregate operators.
        },
      },
      { $addFields: { genre: "$_id" } },
      { $project: { _id: 0 } }, //fields which we want "1", dont "0"
      { $sort: { movieCount: -1 } },
      //{$limit : 6},
      { $match: { genre: genre } },
    ]);

    res.status(200).json({
      status: "success",
      count: movies.length,
      data: { movies },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};
//+++++++++++This Logic is for work with local DATA++++++++++++
// const fs = require("fs");
// const movies = JSON.parse(fs.readFileSync("./data/movies.json"));

// exports.checkId = (req, res, next, value) => {
//   console.log("movie id is" + value);

//   const movie = movies.find((el) => el.id === value * 1);

//   if (!movie) {
//     return res.status(404).json({
//       status: "fail",
//       data: {
//         movie: `Movie with ID ${value} is not found`,
//       },
//     });
//   }

//   next();
// };

// exports.validateBody = (req, res, next) => {
//   if (!req.body?.name || !req.body?.year) {
//     return res.status(400).json({
//       status: "fail",
//       message: "Not a valid movie",
//     });
//   }

//   next();
// };

// //Route handler
// //Route = Http Req + URL
// // app.get("/", (req, res) => {
// //   // res.status(200).send("<h2>Hello from Express server</h2>"); //by default content type-text/html
// //   res.status(200).json({ message: "Hello world", status: 200 }); //for json by default content type-application/json
// // });

// exports.getMovies = (req, res) => {
//   res.status(200).json({
//     status: "success",
//     count: movies.length,
//     requestedAt: req.requestedAt,
//     data: {
//       movies: movies,
//     },
//   });
// };

// exports.getMovie = (req, res) => {
//   /* ex: "/api/v1/movies/:id/:name/:x" like this we can specify how many parameters we want
//       but client(postman or any other) has to set values for provided parameters ex: "/api/v1/movies/9/srk/12"
//       to make parameter optional ex: "/api/v1/movies/:id/:name?/:x?" now client no need to set values for 'id and x'.
//       */
//   //console.log(req.params);

//   //convert ID into number type
//   const id = req.params.id * 1;
//   //find movie based on parameter
//   const movie = movies.find((el) => el.id === id);

//   //   if (!movie) {
//   //     return res.status(404).json({
//   //       status: "fail",
//   //       data: {
//   //         movie: `Movie with ID ${id} is not found`,
//   //       },
//   //     });
//   //   }

//   //send movie in response
//   res.status(200).json({
//     status: "success",
//     data: {
//       movie: movie,
//     },
//   });
// };

// exports.addMovie = (req, res) => {
//   //console.log(req.body);
//   //add new Id to req.body
//   const newId = movies[movies.length - 1].id + 1;

//   //create new movie object
//   const newMovie = Object.assign({ id: newId }, req.body);
//   movies.push(newMovie);

//   fs.writeFile("./data/movies.json", JSON.stringify(movies), (err) => {
//     res.status(201).json({
//       status: "success",
//       data: {
//         movie: newMovie,
//       },
//     });
//   });
// };

// exports.updateMovie = (req, res) => {
//   //convert ID into number type
//   const id = req.params.id * 1;

//   //find movie
//   let movieToUpdate = movies.find((el) => el.id === id);

//   //   if (!movieToUpdate) {
//   //     return res.status(404).json({
//   //       status: "fail",
//   //       data: {
//   //         movie: `Movie with ID ${id} is not found`,
//   //       },
//   //     });
//   //   }

//   //update movie
//   Object.assign(movieToUpdate, req.body);
//   let index = movies.indexOf(movieToUpdate);

//   movies[index] = movieToUpdate;
//   fs.writeFile("./data/movies.json", JSON.stringify(movies), (err) => {
//     res.status(200).json({
//       status: "success",
//       data: {
//         movie: movieToUpdate,
//       },
//     });
//   });
// };

// exports.deleteMovie = (req, res) => {
//   const id = req.params.id * 1;
//   const movieToDelete = movies.find((el) => el.id === id);

//   //   if (!movieToDelete) {
//   //     return res.status(404).json({
//   //       status: "fail",
//   //       data: {
//   //         movie: `Movie with ID ${id} is not found`,
//   //       },
//   //     });
//   //   }

//   const index = movies.indexOf(movieToDelete);

//   movies.splice(index, 1);

//   fs.writeFile("./data/movies.json", JSON.stringify(movies), (err) => {
//     res.status(204).json({
//       status: "success",
//       data: null,
//     });
//   });
// };
