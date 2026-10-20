
const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;

const public_users = express.Router();

// Register a new user
public_users.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({
        username: username,
        password: password
      });
      return res.status(200).json({
        message: 'User successfully registered. Now you can login'
      });
    }

    return res.status(404).json({
      message: 'Username already exists'
    });
  }

  return res.status(404).json({
    message: 'Unable to register user.'
  });
});

// Get all books
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});

// Get book details by ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  }

  return res.status(404).json({
    message: 'Book not found'
  });
});

// Get books by author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  const result = Object.values(books).filter(
    book => book.author.toLowerCase() === author.toLowerCase()
  );

  return res.status(200).json(result);
});

// Get books by title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  const result = Object.values(books).filter(
    book => book.title.toLowerCase().includes(title.toLowerCase())
  );

  return res.status(200).json(result);
});

// Get book reviews by ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  }

  return res.status(404).json({
    message: 'Book not found'
  });
});

module.exports.general = public_users;
