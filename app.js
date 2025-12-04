//Import package
const express = require("express"); //returns function
const morgan = require("morgan"); // to get request details
const qs = require("qs");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const sanitize = require("mongo-sanitize");
const sanitizeHtml = require("sanitize-html");
const hpp = require("hpp"); //http parameter pollution

const moviesRouter = require("./routes/moviesRoutes");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const CustomError = require("./utils/customError");
const globalErrorHandler = require("./controller/errorController");

const app = express(); //returns object

app.use(helmet()); //this will add some security header to response

const limiter = rateLimit({
  max: 10, //max requests
  windowMs: 60 * 60 * 1000, //1 hour
  message:
    "We have received too many requests from this IP. please try after one hour",
}); //middleware //returns middleware function

app.use("/api", limiter); //to all api which has '/api'.

app.use(express.json()); //middleware //returns middleware function
app.use(express.urlencoded({ extended: true }));

/*
app.use(express.json({ limit: "10kb" }));
now it will only accept max of '10kb' in the request body
*/

app.set("query parser", (str) => qs.parse(str));

app.use(
  hpp({
    whitelist: ["prize", "duration"], //not working for sort
  })
);

//sanitize
app.use((req, res, next) => {
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
});
//this is to send clean request data without any malicious characters and patterns before the data is used in your application

//app.use(xss()); //this will prevent any malicious html code from input(the package is outdated so,cannot use it with Express 5)
//sanitizeHtml
app.use((req, res, next) => {
  const clean = (value) => {
    if (typeof value === "string") {
      return sanitizeHtml(value);
    }
    if (typeof value === "object" && value !== null) {
      for (let key in value) {
        value[key] = clean(value[key]);
      }
    }
    return value;
  };

  req.body = clean(req.body);
  req.query = clean(req.query);
  req.params = clean(req.params);

  next();
});

//creating custom middleware
const logger = function (req, res, next) {
  // structure of middleware function
  console.log("custom middleware function is called");
  next(); //logger function will not be executed unless next() function is called.
};

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
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

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
