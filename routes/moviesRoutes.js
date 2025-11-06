const express = require("express");
const moviesController = require("../controller/moviesController");
const authController = require("../controller/authController");

const router = express.Router(); //moviesRouter act as a middleware
//router.param("id", moviesController.checkId); //param middleware

router
  .route("/highest-rated")
  .get(moviesController.getHighestRated, moviesController.getMovies);

router.route("/movie-stats").get(moviesController.getMovieStats);

router.route("/movies-by-genre/:genre").get(moviesController.getMovieByGenre);

router
  .route("/")
  .get(authController.protect, moviesController.getMovies)
  .post(moviesController.addMovie);

router
  .route("/:id")
  .get(authController.protect, moviesController.getMovie)
  .patch(moviesController.updateMovie)
  .delete(moviesController.deleteMovie);

module.exports = router;
