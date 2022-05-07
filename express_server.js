// DATABASE

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userId: "9sm5xK" },
  // "9sm5xK": "http://www.google.com",
};
const users = {};

// essential functions

const { urlsForUser, checkExistedUrl, checkIsOwner, generateRandomString, checkExistedId, checkExistedEmail, checkExistedPassword, renderErrorPage } = require("./helpers");

// server setup

const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { format } = require("date-fns");

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
  cookieSession({
    name: "session",
    keys: ["secretKey1", "secretKey2", "secretKey3"],
  })
);

// GET routes

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
  const uniqueVisitors = urlDatabase[shortURL].uniqueVisitorIds.size;
  const createdAt = format(urlDatabase[shortURL].created, "MMM d, yyyy");
  const { longURL, visits } = urlDatabase[shortURL];

  // format last visit date
  let lastVisit = urlDatabase[shortURL].visitHistory.slice(-1)[0];
  lastVisit = !lastVisit ? "---" : format(lastVisit, "MMM d, yyyy 'at' HH:mm");

  // allow access ONLY if shortURL is correct, user is logged in, and user is the owner of the URLs
  if (!userId) {
    renderErrorPage(res, 401, "Please log in to continue.");
  } else if (!checkExistedUrl(shortURL, urlDatabase)) {
    renderErrorPage(res, 404, "TinyURL does not exist.");
  } else if (!checkIsOwner(userId, shortURL, urlDatabase)) {
    renderErrorPage(res, 403, "You are authorized to access this page.");
  } else {
    const templateVars = { user: users[req.session.user_id], shortURL, longURL, visits, uniqueVisitors, lastVisit, createdAt };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;

  if (!checkExistedUrl(shortURL, urlDatabase)) {
    renderErrorPage(res, 400, "TinyURL does not exist.");
  } else if (!req.session.user_id) {
    // create id for unknown/new visitors
    req.session.user_id = generateRandomString();
  }

  urlDatabase[shortURL].visitorIds.push(userId);
  urlDatabase[shortURL].uniqueVisitorIds.add(userId);
  urlDatabase[shortURL].visitHistory.push(new Date());
  urlDatabase[shortURL].visits++;
  res.redirect(urlDatabase[shortURL].longURL);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    renderErrorPage(res, 400, "Please check your email and password.");
  }

  // allow registration if email is not in the databse (users obj)
  if (checkExistedEmail(email, users)) {
    renderErrorPage(res, 400, "Email is already registered.");
  } else {
    users[id] = { id, email, password: bcrypt.hashSync(password, 10) };
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

// POST routes

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!checkExistedEmail(email, users)) {
    renderErrorPage(res, 403, "Email cannot be found.");
  }

  // allow logging in ONLY if both functions return the same userId
  if (checkExistedEmail(email, users) !== checkExistedPassword(password, users)) {
    renderErrorPage(res, 403, "Email and password do not match.");
  } else {
    // res.cookie("user_id", checkExistedEmail(email, users));
    req.session.user_id = checkExistedEmail(email, users);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  // only registered userId can access to this endpoint
  if (!checkExistedId(req.session.user_id, users)) {
    renderErrorPage(res, 401, "You are unauthorized to perform this action!");
  } else {
    const userId = req.session.user_id;
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;

    urlDatabase[shortURL] = { longURL, userId, visits: 0, visitorIds: [], uniqueVisitorIds: new Set(), visitHistory: [], created: new Date() };
    res.redirect("/urls");
  }
});

// delete, edit, and update routes have the same logic; ONLY user that created the URLs can perform either action
app.delete("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;

  if (!checkIsOwner(userId, shortURL, urlDatabase)) {
    renderErrorPage(res, 403, "You are unauthorized to delete this URL.");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

app.put("/urls/:shortURL/edit", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;

  if (!checkIsOwner(userId, shortURL, urlDatabase)) {
    renderErrorPage(res, 403, "You are unauthorized to access this page.");
  } else {
    res.redirect(`/urls/${req.params.shortURL}`);
  }
});

app.put("/urls/:shortURL/update", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;

  if (!checkIsOwner(userId, shortURL, urlDatabase)) {
    renderErrorPage(res, 403, "You are unauthorized to update this URL.");
  } else {
    const shortURL = req.params.shortURL;

    // visits reset to 0 if longURL is changed
    urlDatabase[shortURL].visits = 0;
    urlDatabase[shortURL].visitorIds.length = 0;
    urlDatabase[shortURL].uniqueVisitorIds.clear();
    urlDatabase[shortURL].visitHistory.length = 0;
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
