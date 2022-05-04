// database
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const express = require("express");

const app = express();
const PORT = 8080;

app.get("/", (req, res) => {
  res.send("hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
