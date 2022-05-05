// DATABASE
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userId: "9sm5xK" },
  // "9sm5xK": "http://www.google.com",
};

const users = {};

// essential functions
const { urlsForUser, checkExistedUrl, checkIsOwner, generateRandomString, checkExistedId, checkExistedEmail, checkExistedPassword, renderErrorPage } = require("./helpers");

const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["secretKey1", "secretKey2", "secretKey3"],
    signed: false,
  })
);

// SERVER ENDPOINTS
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  req.session.user_id ? res.redirect("/urls") : res.render("register");
});

app.get("/login", (req, res) => {
  req.session.user_id ? res.redirect("/urls") : res.render("login");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlsForUser(req.session.user_id, urlDatabase), user: users[req.session.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // allow only registered users (in users obj) to access
  if (!users[req.session.user_id]) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;

  // allow access ONLY if shortURL is correct, user is logged in, and user is the owner of the URLs
  if (!userId) {
    renderErrorPage(res, 401, "Please log in to continue");
  } else if (!checkExistedUrl(shortURL, urlDatabase)) {
    renderErrorPage(res, 400, "Please check ShortURL");
  } else if (!checkIsOwner(userId, shortURL, urlDatabase)) {
    renderErrorPage(res, 403, "You are not the owner");
  } else {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id] };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    renderErrorPage(res, 400, "Please check your email and password");
  }

  // allow registration if email is not in the databse (users obj)
  if (checkExistedEmail(email, users)) {
    renderErrorPage(res, 400, "Email is already registered");
  } else {
    users[id] = { id, email, password: bcrypt.hashSync(password, 10) };
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!checkExistedEmail(email, users)) {
    renderErrorPage(res, 403, "Email cannot be found");
  }

  // allow logging in ONLY if both functions return the same userId
  if (checkExistedEmail(email, users) === checkExistedPassword(password, users)) {
    // res.cookie("user_id", checkExistedEmail(email, users));
    req.session.user_id = checkExistedEmail(email, users);
    res.redirect("/urls");
  } else {
    renderErrorPage(res, 403, "Email and password do not match");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  // only registered userId can access to this endpoint
  if (checkExistedId(req.session.user_id, users)) {
    const userId = req.session.user_id;
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;

    urlDatabase[shortURL] = { longURL, userId };
    res.redirect("/urls");
  } else {
    renderErrorPage(res, 401, "You are unauthorized!");
  }
});

// delete, edit, and update routes have the same logic; ONLY user that created the URLs can perform either action
app.post("/urls/delete/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;

  if (checkIsOwner(userId, shortURL, urlDatabase)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    renderErrorPage(res, 403, "You are not the owner");
  }
});

app.post("/urls/edit/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;

  if (checkIsOwner(userId, shortURL, urlDatabase)) {
    res.redirect(`/urls/${req.params.shortURL}`);
  } else {
    renderErrorPage(res, 403, "You are not the owner");
  }
});

app.post("/urls/update/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;

  if (checkIsOwner(userId, shortURL, urlDatabase)) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    renderErrorPage(res, 403, "You are not the owner");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
