const dotenv = require("dotenv"); //install dotenv
dotenv.config({ path: "./config.env" }); //set user defined env variables to environment

const app = require("./app");

//console.log(process.env);

//Create Server
const port = process.env.PORT || 3000; //accessing environment variables
app.listen(port, () => {
  console.log("Server has started");
});
