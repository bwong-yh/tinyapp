const bcryptjs = require("bcryptjs");
const bcrypt = require("bcryptjs/dist/bcrypt");
const { assert } = require("chai");
const { checkExistedId, checkExistedEmail, checkExistedPassword } = require("../helpers");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const testUrls = {
  shortURL1: {
    longURL: "http://www.facebook.com",
    userId: "userRandomID",
  },
  shortURL2: {
    longURL: "http://www.google.com",
    userId: "user2RandomID",
  },
};

describe("checkExistedId", () => {
  it("should return true with a registered user", () => {
    const actual = checkExistedId("userRandomID", testUsers);
    const expected = true;
    assert.strictEqual(actual, expected);
  });

  it("should return undefined with unregistered user", () => {
    const actual = checkExistedId("user99@example.com", testUsers);
    const expected = undefined;
    assert.strictEqual(actual, expected);
  });
});

describe("checkExistedEmail", () => {
  it("should return a user with valid email", () => {
    const user = checkExistedEmail("user@example.com", testUsers);
    const expectedUserId = "userRandomID";
    assert.strictEqual(user, expectedUserId);
  });

  it("should return undefined with non-existent email", () => {
    const user = checkExistedEmail("user99@example.com", testUsers);
    const expectedUserId = undefined;
    assert.strictEqual(user, expectedUserId);
  });
});

describe("checkExistedPassword", () => {
  it("should return a user with valid password", () => {
    testUsers.user2RandomID.password = bcryptjs.hashSync("dishwasher-funk", 10);
    const user = checkExistedPassword("dishwasher-funk", testUsers);
    const expectedUserId = "user2RandomID";
    assert.strictEqual(user, expectedUserId);
  });

  it("should return undefined with unknown password", () => {
    const user = checkExistedPassword("awesomepassword", testUsers);
    const expectedUserId = undefined;
    assert.strictEqual(user, expectedUserId);
  });
});
