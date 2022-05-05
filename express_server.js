// database
const urlDatabase = {
  // b2xVn2: "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com",
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

const urlsForUser = userId => {
  const urlsList = {};

  for (let url in urlDatabase) {
    if (urlDatabase[url].userId === userId) urlsList[url] = urlDatabase[url];
  }

  return urlsList;
};

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  if (req.cookies.user_id) res.redirect("/urls");

  res.render("register");
});

app.get("/login", (req, res) => {
  if (req.cookies.user_id) res.redirect("/urls");

  res.render("login");
});

app.get("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    const templateVars = { statusCode: "401 Unauthorized", message: "Please log in to continue" };
    res.status(401).render("error", templateVars);
  } else {
    const templateVars = { urls: urlsForUser(req.cookies.user_id), user: users[req.cookies.user_id] };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (!users[req.cookies.user_id]) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[req.cookies.user_id] };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.cookies.user_id) {
    const templateVars = { statusCode: "401 Unauthorized", message: "Please log in to continue" };
    res.status(401).render("error", templateVars);
  } else {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies.user_id] };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
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

// functions to check existing email & password
const checkExistedId = userId => {
  for (let user in users) {
    if (user === userId) return true;
  }

  return false;
};

const checkExistedEmail = email => {
  for (let user in users) {
    if (users[user].email === email) return user;
  }

  return false;
};

const checkExistedPassword = password => {
  for (let user in users) {
    if (users[user].password === password) return user;
  }

  return false;
};

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    const templateVars = { statusCode: "400 Bad Request", message: "Please check your email and password =(" };
    res.status(400).render("error", templateVars);
  }

  if (checkExistedEmail(email)) {
    const templateVars = { statusCode: "400 Bad Request", message: "Email is already registered =(" };
    res.status(400).render("error", templateVars);
  }

  users[id] = { id, email, password };
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!checkExistedEmail(email)) {
    const templateVars = { statusCode: "403 Forbidden", message: "Email cannot be found =(" };
    res.status(403).render("error", templateVars);
  }

  if (checkExistedEmail(email) !== checkExistedPassword(password)) {
    const templateVars = { statusCode: "403 Forbidden", message: "Email and password do not match =(" };
    res.status(403).render("error", templateVars);
  } else if (checkExistedEmail(email) === checkExistedPassword(password)) {
    res.cookie("user_id", checkExistedEmail(email));
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  if (checkExistedId(req.cookies.user_id)) {
    const userId = req.cookies.user_id;
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;

    urlDatabase[shortURL] = { longURL, userId };
    res.redirect("/urls");
  } else {
    const templateVars = { statusCode: "401 Unauthorized", message: "You are not authorized!" };
    res.status(401).render("error", templateVars);
  }
});

const checkIsOwner = (userId, shortURL) => {
  if (urlDatabase[shortURL].userId === userId) return true;

  return false;
};

app.post("/urls/delete/:shortURL", (req, res) => {
  if (checkIsOwner(req.cookies.user_id, req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    const templateVars = { statusCode: "403 Forbidden", message: "You are not the owner!" };
    res.status(403).render("error", templateVars);
  }
});

app.post("/urls/edit/:shortURL", (req, res) => {
  if (checkIsOwner(req.cookies.user_id, req.params.shortURL)) {
    res.redirect(`/urls/${req.params.shortURL}`);
  } else {
    const templateVars = { statusCode: "403 Forbidden", message: "You are not the owner!" };
    res.status(403).render("error", templateVars);
  }
});

app.post("/urls/update/:shortURL", (req, res) => {
  if (checkIsOwner(req.cookies.user_id, req.params.shortURL)) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    const templateVars = { statusCode: "403 Forbidden", message: "You are not the owner!" };
    res.status(403).render("error", templateVars);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
