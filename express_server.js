// DATABASE
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userId: "9sm5xK" },
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

// FUNCTIONS
// match userId to urls & return urls that the userId owns
const urlsForUser = userId => {
  const urlsList = {};

  for (let url in urlDatabase) {
    if (urlDatabase[url].userId === userId) urlsList[url] = urlDatabase[url];
  }

  return urlsList;
};

// check for exitsed urls
const checkExistedUrls = shortURL => {
  for (let url in urlDatabase) {
    if (url === shortURL) return true;
  }

  return false;
};

// check if urls belong to userId
const checkIsOwner = (userId, shortURL) => {
  if (urlDatabase[shortURL].userId === userId) return true;

  return false;
};

// generate new shortURLs and userIds
const generateRandomString = (length = 6) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return randomString;
};

// check existing user
const checkExistedId = userId => {
  for (let user in users) {
    if (user === userId) return true;
  }

  return false;
};

// check existed registered email
const checkExistedEmail = email => {
  for (let user in users) {
    if (users[user].email === email) return user;
  }

  return false;
};

// check if passowrd matches user
const checkExistedPassword = password => {
  for (let user in users) {
    if (users[user].password === password) return user;
  }

  return false;
};

// render error page with specific status and message
const renderErrorPage = (res, status, message) => {
  const templateVars = { status, message };
  res.status(status).render("error", templateVars);
};

// SERVER ENDPOINTS
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  req.cookies.user_id ? res.redirect("/urls") : res.render("register");
});

app.get("/login", (req, res) => {
  req.cookies.user_id ? res.redirect("/urls") : res.render("login");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlsForUser(req.cookies.user_id), user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // allow only registered users (in users obj) to access
  if (!users[req.cookies.user_id]) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[req.cookies.user_id] };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies.user_id;
  const shortURL = req.params.shortURL;

  // allow access ONLY if shortURL is correct, user is logged in, and user is the owner of the URLs
  if (!userId) {
    renderErrorPage(res, 401, "Please log in to continue");
  } else if (!checkExistedUrls(shortURL)) {
    renderErrorPage(res, 400, "Please check ShortURL");
  } else if (!checkIsOwner(userId, shortURL)) {
    renderErrorPage(res, 403, "You are not the owner");
  } else {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies.user_id] };
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
  if (checkExistedEmail(email)) {
    renderErrorPage(res, 400, "Email is already registered");
  } else {
    users[id] = { id, email, password };
    res.cookie("user_id", id);
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!checkExistedEmail(email)) {
    renderErrorPage(res, 403, "Email cannot be found");
  }

  // allow logging in ONLY if both functions return the same userId
  if (checkExistedEmail(email) === checkExistedPassword(password)) {
    res.cookie("user_id", checkExistedEmail(email));
    res.redirect("/urls");
  } else {
    renderErrorPage(res, 403, "Email and password do not match");
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
    renderErrorPage(res, 401, "You are unauthorized!");
  }
});

// delete, edit, and update routes have the same logic; ONLY user that created the URLs can perform either action
app.post("/urls/delete/:shortURL", (req, res) => {
  if (checkIsOwner(req.cookies.user_id, req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    renderErrorPage(res, 403, "You are not the owner");
  }
});

app.post("/urls/edit/:shortURL", (req, res) => {
  if (checkIsOwner(req.cookies.user_id, req.params.shortURL)) {
    res.redirect(`/urls/${req.params.shortURL}`);
  } else {
    renderErrorPage(res, 403, "You are not the owner");
  }
});

app.post("/urls/update/:shortURL", (req, res) => {
  if (checkIsOwner(req.cookies.user_id, req.params.shortURL)) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    renderErrorPage(res, 403, "You are not the owner");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
