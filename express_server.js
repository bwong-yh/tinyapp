// database
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {};

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/", (req, res) => {
  res.send("hello!");
});

// function to generate new shortURLs and userIds
const generateRandomString = (length = 6) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return randomString;
};

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  users[id] = { id, email, password };
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.post("/urls/delete/:shortURL", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/edit/:shortURL", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/update/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
