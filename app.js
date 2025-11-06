//Import package
const express = require("express"); //returns function
const morgan = require("morgan"); // to get request details
const qs = require("qs");
const moviesRouter = require("./routes/moviesRoutes");
const authRouter = require("./routes/authRoutes");
const CustomError = require("./utils/customError");
const globalErrorHandler = require("./controller/errorController");

const app = express(); //returns object

app.set("query parser", (str) => qs.parse(str));

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
app.use("/api/v1/movies", moviesRouter);
app.use("/api/v1/users", authRouter);

//Default route
// app.all("*", (req, res) => {
//   res.status(404).json({
//     status: "fail",
//     message: `Can't find ${req.originalUrl} on this server!`,
//   });
// });

//Default route for current version of Express(5.1.0)
app.use((req, res, next) => {
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = "fail";
  // err.statusCode = 404;

  const err = new CustomError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );

  next(err);
  /**
   * when we pass argument to next() express will automatically assume some error happened 
    so, it directly calls Global error handling middleware function, skips any other actions those are in middleware stack.
   */
});

//Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
