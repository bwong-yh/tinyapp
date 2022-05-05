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

// check for exitsed urls in database
const checkExistedUrl = (shortURL, urlDatabase) => {
  for (let url in urlDatabase) {
    if (url === shortURL) return true;
  }

  return undefined;
};

// check if urls belong to userId (creator)
const checkIsOwner = (userId, shortURL, urlDatabase) => {
  if (urlDatabase[shortURL].userId === userId) return true;

  return undefined;
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

// check existing user in database (users object)
const checkExistedId = (userId, users) => {
  for (let user in users) {
    if (users[user].id === userId) return true;
  }

  return undefined;
};

// check existed registered email
const checkExistedEmail = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) return users[user].id;
  }

  return undefined;
};

// check if passowrd matches user
const checkExistedPassword = (password, users) => {
  for (let user in users) {
    if (bcrypt.compareSync(password, users[user].password)) return users[user].id;
  }

  return undefined;
};

// render error page with specific status and message
const renderErrorPage = (res, status, message) => {
  const templateVars = { status, message };
  res.status(status).render("error", templateVars);
};

module.exports = { urlsForUser, checkExistedUrl, checkIsOwner, generateRandomString, checkExistedId, checkExistedEmail, checkExistedPassword, renderErrorPage };
