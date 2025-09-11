//Import package
const express = require("express"); //returns function
const fs = require("fs");
const morgan = require("morgan");

const app = express(); //returns object
const movies = JSON.parse(fs.readFileSync("./data/movies.json"));

//creating custom middleware
const logger = function (req, res, next) {
  // structure of middleware function
  console.log("custom middleware function is called");
  next(); //logger function will not be executed unless next() function is called.
};

app.use(express.json()); //middleware //returns middleware function
app.use(logger); // already in middleware function format so we didn't use'()'
app.use(morgan("dev"));

//another way creating custom middleware
app.use((req, res, next) => {
  //creating req property 'requestedAt'
  req.requestedAt = new Date().toISOString();
  next();
});

//Route = Http Req + URL
// app.get("/", (req, res) => {
//   // res.status(200).send("<h2>Hello from Express server</h2>"); //by default content type-text/html
//   res.status(200).json({ message: "Hello world", status: 200 }); //for json by default content type-application/json
// });

const getMovies = (req, res) => {
  res.status(200).json({
    status: "success",
    count: movies.length,
    requestedAt: req.requestedAt,
    data: {
      movies: movies,
    },
  });
};

const getMovie = (req, res) => {
  /* ex: "/api/v1/movies/:id/:name/:x" like this we can specify how many parameters we want  
  but client(postman or any other) has to set values for provided parameters ex: "/api/v1/movies/9/srk/12"
  to make parameter optional ex: "/api/v1/movies/:id/:name?/:x?" now client no need to set values for 'id and x'.
  */
  //console.log(req.params);

  //convert ID into number type
  const id = req.params.id * 1;
  //find movie based on parameter
  const movie = movies.find((el) => el.id === id);

  if (!movie) {
    return res.status(404).json({
      status: "fail",
      data: {
        movie: `Movie with ID ${id} is not found`,
      },
    });
  }

  //send movie in response
  res.status(200).json({
    status: "success",
    data: {
      movie: movie,
    },
  });
};

const addMovie = (req, res) => {
  //console.log(req.body);
  //add new Id to req.body
  const newId = movies[movies.length - 1].id + 1;

  //create new movie object
  const newMovie = Object.assign({ id: newId }, req.body);
  movies.push(newMovie);

  fs.writeFile("./data/movies.json", JSON.stringify(movies), (err) => {
    res.status(201).json({
      status: "success",
      data: {
        movie: newMovie,
      },
    });
  });
};

const updateMovie = (req, res) => {
  //convert ID into number type
  const id = req.params.id * 1;

  //find movie
  let movieToUpdate = movies.find((el) => el.id === id);

  if (!movieToUpdate) {
    return res.status(404).json({
      status: "fail",
      data: {
        movie: `Movie with ID ${id} is not found`,
      },
    });
  }

  //update movie
  Object.assign(movieToUpdate, req.body);
  let index = movies.indexOf(movieToUpdate);

  movies[index] = movieToUpdate;
  fs.writeFile("./data/movies.json", JSON.stringify(movies), (err) => {
    res.status(200).json({
      status: "success",
      data: {
        movie: movieToUpdate,
      },
    });
  });
};

const deleteMovie = (req, res) => {
  const id = req.params.id * 1;
  const movieToDelete = movies.find((el) => el.id === id);

  if (!movieToDelete) {
    return res.status(404).json({
      status: "fail",
      data: {
        movie: `Movie with ID ${id} is not found`,
      },
    });
  }

  const index = movies.indexOf(movieToDelete);

  movies.splice(index, 1);

  fs.writeFile("./data/movies.json", JSON.stringify(movies), (err) => {
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
};

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

//Route Handler
app.route("/api/v1/movies").get(getMovies).post(addMovie);

app
  .route("/api/v1/movies/:id")
  .get(getMovie)
  .patch(updateMovie)
  .delete(deleteMovie);

//Create Server
const port = 3000;
app.listen(port, () => {
  console.log("Server has started");
});
