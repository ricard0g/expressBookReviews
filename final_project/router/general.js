const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");
const http = require("http");

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

// For the task 10. A simulated API endpoint to make the request and then return the books DB
const mockApiUrl = "http://localhost:5000/api/books";

public_users.get("/api/books", (req, res) => {
  res.json(books);
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    const response = await axios.get(mockApiUrl);
    if (response) {
      return res.status(200).json(response.data);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const { isbn } = req.params;
  const getBooksByIsbn = (url) => {
    return new Promise((resolve, reject) => {
      http
        .get(url, (response) => {
          let data = "";

          response.on("data", (chunk) => {
            data += chunk;
          });

          response.on("end", () => {
            resolve(JSON.parse(data));
          });
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  };

  // We make the request to the mockUrl to get the books object. Parsed into an objct from the JSON response we get on the promise
  getBooksByIsbn(`${mockApiUrl}`)
    .then((data) => {
      return res.status(200).send(data[isbn]);
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ message: "Error fetching book data" });
    });
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
