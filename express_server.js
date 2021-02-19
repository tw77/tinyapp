const bcrypt = require('bcryptjs');
const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'name',
  keys: ['key1', 'key2']
}));



const urlDatabase = {
  "b2xVn2": { longURL: "https://www.lighthouselabs.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "https://www.google.com", userID: "b24l7i" },
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const { getUserByEmail } = require('./helpers');

function urlsForUser(id) { // returns only the URLs added by a given user.
  let personalDatabase = {};
  for (const url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      personalDatabase[url] = urlDatabase[url];
    }
  }
  return personalDatabase;
} 

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}





// GET method routes:

// My URLs index
app.get("/urls", (req, res) => {
  if (!req.session["user_id"]) {
    res.status(400).send('You are not logged in. Please log in or register.');
  }
  const templateVars = { user: users[req.session["user_id"]], urls: urlsForUser(req.session["user_id"]) };
  res.render("urls_index", templateVars);
});


// Create New URL
app.get("/urls/new", (req, res) => {
  if (!req.session["user_id"]) {
    res.redirect("/login");
  }
  const templateVars = { user: users[req.session["user_id"]] };
  res.render("urls_new", templateVars);
});


// Show / Edit URL
app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(400).send('URL not found.');
  }
  const templateVars = { user: users[req.session["user_id"]], shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL};
  res.render("urls_show", templateVars);
});


// Register
app.get("/register", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect("/urls");
  }
  const templateVars = { user: users[req.session["user_id"]] };
  res.render("register", templateVars);
});


// Login
app.get("/login", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect("/urls");
  }
  const templateVars = { user: users[req.session["user_id"]] };
  res.render("login", templateVars);
});


// Redirect to URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


// /
app.get("/", (req, res) => {
  if (!req.session["user_id"]) {
    res.redirect("/login");
  }
  res.redirect("/urls");
});





// POST method routes:

// add a new URL to the index
app.post("/urls", (req, res) => {
  if (!req.session["user_id"]) {
    res.status(401).send('Please log in or register in order to create new short links.');
  }
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = { longURL: req.body.longURL, userID: req.session["user_id"] };
  res.redirect("/urls");
});


// update an existing URL in the index
app.post("/urls/:shortURL", (req, res) => {
  if (!req.session["user_id"]) {
    res.status(401).send('Please log in or register in order to edit URLs.');
  }
  if (!urlsForUser(req.session["user_id"]).hasOwnProperty(req.params.shortURL)) {
    res.status(403).send('URL not found.'); // If logged-in user's own URLs do not include the requested URL.
  }
  const newLongURL = req.body.newLongURL;
  urlDatabase[req.params.shortURL] = { longURL: newLongURL, userID: req.session["user_id"] };
  res.redirect("/urls");
});


// delete a URL from the index
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session["user_id"]) {
    res.status(401).send('Please log in or register in order to delete URLs.');
  }
  if (!urlsForUser(req.session["user_id"]).hasOwnProperty(req.params.shortURL)) {
    res.status(403).send('URL not found.'); // If logged-in user's own URLs do not include the requested URL.
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


// register
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Missing input, please try again.');
  }
  if (getUserByEmail(req.body.email, users)) {
    res.status(409).send('Email already registered.');
  }
  const newUserID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[newUserID] = { id: newUserID, email: req.body.email, password: hashedPassword };
  req.session.user_id = newUserID;
  res.redirect("/urls");
});


// login
app.post("/login", (req, res) => {
  const matchingUser = getUserByEmail(req.body.email, users);
  if (!getUserByEmail(req.body.email, users)) {
    res.status(403).send('Email or password not found.'); // Keeping this error message vague.
  }
  if ((getUserByEmail(req.body.email, users)) && (!bcrypt.compareSync(req.body.password, matchingUser.password))) {
    res.status(403).send('Email or password not found.'); // Same message if password is not found.
  }
  const id = matchingUser.id;
  req.session.user_id = id;
  res.redirect("/urls");
});


// logout
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});