const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
  let usersWithSameName = users.filter((user) => user.username === username);
  return usersWithSameName.length > 0;
};

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    // Check if user exists already
    if (!doesExist(username)) {
      users.push({ username, password });
      return res
        .status(200)
        .json({ message: `Users ${username} added successfully!` });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  //Write your code here
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const { isbn } = req.params;
  return res.status(200).send(JSON.stringify(books[isbn], null, 4));
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const { author } = req.params;
  let counter = 1;
  while (counter <= Object.keys(books).length) {
    if (Object.values(books[counter]).includes(author)) {
      return res.status(200).send(JSON.stringify(books[counter], null, 4));
    }
    counter++;
  }
  return res
    .status(404)
    .json({ message: `Book written by ${author} not found.` });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const { title } = req.params;
  let counter = 1;
  while (counter <= Object.keys(books).length) {
    if (Object.values(books[counter]).includes(title)) {
      return res.status(200).send(JSON.stringify(books[counter], null, 4));
    }
    counter++;
  }
  return res.status(404).json({ message: `Book called ${title} not found.` });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const { isbn } = req.params;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews));
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
