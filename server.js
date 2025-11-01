const dotenv = require("dotenv"); //install dotenv
dotenv.config({ path: "./config.env" }); //set user defined env variables to environment

const mongoose = require("mongoose");

//handel unCaught error
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Un-Caught error occurred, shutting down");

  process.exit(1);
});

//note: reason for placing it before "app" to liston Un-Caught error widely, need to listen before they occurred

const app = require("./app");

//console.log(process.env);

mongoose
  .connect(process.env.CONN_STR, { useNewUrlParser: true })
  .then((conn) => {
    //console.log(conn);
    console.log("DB Connection Successful");
  });

//Create Server
const port = process.env.PORT || 3000; //accessing environment variables
const server = app.listen(port, () => {
  console.log("Server has started");
});

//const port = process.env.PORT || 3000;

//app.listen(port, "10.3.1.143", () => {
//  console.log(`Server has started on http://10.3.1.143:${port}`);
//});

//console.log(x);

//handel rejection error
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled rejection error occurred, shutting down");

  server.close(() => {
    process.exit(1);
  });
});
