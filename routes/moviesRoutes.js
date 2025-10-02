const express = require("express");
const moviesController = require("../controller/moviesController");

const router = express.Router(); //moviesRouter act as a middleware
//router.param("id", moviesController.checkId); //param middleware

router
  .route("/highest-rated")
  .get(moviesController.getHighestRated, moviesController.getMovies);

router
  .route("/")
  .get(moviesController.getMovies)
  .post(moviesController.addMovie);

router
  .route("/:id")
  .get(moviesController.getMovie)
  .patch(moviesController.updateMovie)
  .delete(moviesController.deleteMovie);

module.exports = router;
