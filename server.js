const dotenv = require("dotenv"); //install dotenv
dotenv.config({ path: "./config.env" }); //set user defined env variables to environment

const mongoose = require("mongoose");
const app = require("./app");

//console.log(process.env);

mongoose
  .connect(process.env.CONN_STR, { useNewUrlParser: true })
  .then((conn) => {
    //console.log(conn);
    console.log("DB Connection Successful");
  })
  .catch((error) => {
    console.log("Some Error has Occured");
  });

//Create Server
const port = process.env.PORT || 3000; //accessing environment variables
app.listen(port, () => {
  console.log("Server has started");
});

//const port = process.env.PORT || 3000;

//app.listen(port, "10.3.1.143", () => {
//  console.log(`Server has started on http://10.3.1.143:${port}`);
//});
