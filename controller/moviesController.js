const Movie = require("./../models/movieModel");

exports.getMovies = async (req, res) => {
  try {
    const movies = await Movie.find();

    res.status(200).json({
      status: "success",
      length: movies.length,
      data: {
        movies,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};
exports.getMovie = async (req, res) => {
  try {
    //const movie = await Movie.find({_id : req.params.id});
    const movie = await Movie.findById(req.params.id);

    res.status(200).json({
      status: "success",
      data: {
        movie,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};
exports.addMovie = async (req, res) => {
  // const movie = new Movie({})
  // movie.save();
  //another way
  try {
    const movie = await Movie.create(req.body);

    res.status(200).json({
      status: "success",
      data: movie,
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};
exports.updateMovie = async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      data: {
        movie: updatedMovie,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};
exports.deleteMovie = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "success",
      data: null,
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
