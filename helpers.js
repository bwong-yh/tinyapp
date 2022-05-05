const bcrypt = require("bcryptjs/dist/bcrypt");

// FUNCTIONS
// match userId to urls & return urls that the userId owns
const urlsForUser = (userId, urlDatabase) => {
  const urlsList = {};

  for (let url in urlDatabase) {
    if (urlDatabase[url].userId === userId) urlsList[url] = urlDatabase[url];
  }

  return urlsList;
};

// check for exitsed urls
const checkExistedUrls = (shortURL, urlDatabase) => {
  for (let url in urlDatabase) {
    if (url === shortURL) return true;
  }

  return false;
};

// check if urls belong to userId
const checkIsOwner = (userId, shortURL, urlDatabase) => {
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
const checkExistedId = (userId, users) => {
  for (let user in users) {
    if (user === userId) return true;
  }

  return false;
};

// check existed registered email
const checkExistedEmail = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) return user;
  }

  return false;
};

// check if passowrd matches user
const checkExistedPassword = (password, users) => {
  for (let user in users) {
    if (bcrypt.compareSync(password, users[user].hashedPassword)) return user;
  }

  return false;
};

// render error page with specific status and message
const renderErrorPage = (res, status, message) => {
  const templateVars = { status, message };
  res.status(status).render("error", templateVars);
};

module.exports = { urlsForUser, checkExistedUrls, checkIsOwner, generateRandomString, checkExistedId, checkExistedEmail, checkExistedPassword, renderErrorPage };
