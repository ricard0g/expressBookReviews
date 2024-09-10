const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
};

const authenticatedUser = (username, password) => {
  const validusers = users.filter(
    (user) => user.username === username && user.password === password
  );
  return validusers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({ data: password }, "access", {
      expiresIn: 60 * 60,
    });

    // Store JWT access token and username in session
    req.session.authorization = {
      accessToken,
      username,
    };

    res.status(200).json({ message: "User successfully logged in!" });
  } else {
    res
      .status(208)
      .json({ message: "Invalid Login. Check your Username and Password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const username = req.session.authorization.username;
  if (Object.keys(books[isbn].reviews).includes(username)) {
    books[isbn].reviews[username] = review;
    return res
      .status(200)
      .json({ message: "Your review has been updated!", reviewGiven: review });
  } else {
    books[isbn].reviews = { ...books[isbn].reviews, [username]: review };
    return res
      .status(200)
      .json({ message: "Your review has been added!", reviewGiven: review });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
