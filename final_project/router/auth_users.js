
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');

const regd_users = express.Router();
let users = [];

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

// Login registered users
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: 'Invalid username or password'
    });
  }

  const accessToken = jwt.sign(
    { username: username },
    'access',
    { expiresIn: '1h' }
  );

  req.session.authorization = {
    accessToken: accessToken,
    username: username
  };

  return res.status(200).json({
    message: 'Login successful',
    token: accessToken
  });
});

// Add or update a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const username = req.session.authorization?.username;
  const isbn = req.params.isbn;
  const review = req.body.review;

  if (!username) {
    return res.status(401).json({
      message: 'Please login first'
    });
  }

  if (!books[isbn]) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({
      message: 'Please provide a review'
    });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: 'Review added successfully',
    reviews: books[isbn].reviews
  });
});

// Delete the logged-in user's review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const username = req.session.authorization?.username;
  const isbn = req.params.isbn;

  if (!username) {
    return res.status(401).json({
      message: 'Please login first'
    });
  }

  if (!books[isbn]) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  if (!Object.prototype.hasOwnProperty.call(books[isbn].reviews, username)) {
    return res.status(404).json({
      message: 'No review found to delete'
    });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: 'Review deleted successfully',
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
