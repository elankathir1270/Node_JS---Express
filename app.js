//Import package
const express = require("express"); //returns function
const morgan = require("morgan"); // to get request details
const moviesRouter = require("./routes/moviesRoutes");

const app = express(); //returns object

//creating custom middleware
const logger = function (req, res, next) {
  // structure of middleware function
  console.log("custom middleware function is called");
  next(); //logger function will not be executed unless next() function is called.
};

app.use(express.json()); //middleware //returns middleware function
app.use(logger); // already in middleware function format so we didn't use'()'
app.use(express.static("./public")); //serving static files
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//another way creating custom middleware
app.use((req, res, next) => {
  //creating req property 'requestedAt'
  req.requestedAt = new Date().toISOString();
  next();
});

// //GET - api/v1/movies
// app.get("/api/v1/movies", getMovies);

// //GET - api/v1/movie/:id
// app.get("/api/v1/movies/:id", getMovie);

// //POST - api/v1/movies
// app.post("/api/v1/movies", addMovie);

// //PATCH - api/v1/movies/:id
// app.patch("/api/v1/movies/:id", updateMovie);

// //DELETE - api/v1/movies/:id
// app.delete("/api/v1/movies/:id", deleteMovie);

//note: usually middleware will apply to all the request but when we define path like this that will be applicable only to that path
app.use("/api/v1/movies/", moviesRouter);

module.exports = app;
