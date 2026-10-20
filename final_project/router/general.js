const express = require('express');
const axios = require('axios');

const books = require('./booksdb.js');
const isValid = require('./auth_users.js').isValid;
const users = require('./auth_users.js').users;

const public_users = express.Router();
const API_BASE = 'http://127.0.0.1:5000';

// Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: 'Username already exists'
    });
  }

  users.push({ username, password });

  return res.status(200).json({
    message: 'User successfully registered. Now you can login'
  });
});

// Internal data endpoint used by Axios
public_users.get('/_internal/books', (req, res) => {
  return res.status(200).json(books);
});

// Get all books using Axios and async/await
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE}/_internal/books`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to retrieve books',
      error: error.message
    });
  }
});

// Get book details by ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE}/_internal/books`);
    const book = response.data[req.params.isbn];

    if (!book) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to retrieve book',
      error: error.message
    });
  }
});

// Get books by author
public_users.get('/author/:author', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE}/_internal/books`);
    const author = req.params.author.toLowerCase();

    const result = Object.values(response.data).filter(
      book => book.author.toLowerCase() === author
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: 'No books found for this author'
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to retrieve books by author',
      error: error.message
    });
  }
});

// Get books by title
public_users.get('/title/:title', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE}/_internal/books`);
    const title = req.params.title.toLowerCase();

    const result = Object.values(response.data).filter(
      book => book.title.toLowerCase().includes(title)
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: 'No books found for this title'
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to retrieve books by title',
      error: error.message
    });
  }
});

// Get book reviews by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;