const bcrypt = require('bcryptjs');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'feb01',
  keys: ['anything', 'you want']
}));

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

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

const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
};

function urlsForUser(id) {
  let personalDatabase = {};
  for (const url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      personalDatabase[url] = urlDatabase[url];
    }
  }
  return personalDatabase;
}



// Gets:

// My URLs index page
app.get("/urls", (req, res) => {
  if (!req.session["user_id"]) {
    res.status(400).send('You are not logged in. Please log in or register.')
  } else {
    const personalDatabase = urlsForUser(req.session["user_id"])
    const templateVars = { user: users[req.session["user_id"]], urls: personalDatabase };
    res.render("urls_index", templateVars);
  }
});

// Create New URL page
app.get("/urls/new", (req, res) => {
  if (!req.session["user_id"]) {
    res.redirect("/login")
  } else {
    const templateVars = { user: users[req.session["user_id"]] };
    res.render("urls_new", templateVars);
  }
});

// Show / Edit URL page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]], shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL};
  res.render("urls_show", templateVars);
});

// Register page
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };
  res.render("register", templateVars);
});

// Login page
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };
  res.render("login", templateVars);
});

// Redirect to URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
}); 



// Posts:

// add a new URL to the index
app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = { longURL: req.body.longURL, userID: req.session["user_id"] };
  res.redirect("/urls"); 
});

// update the long URL of an existing URL in the index
app.post("/urls/:shortURL", (req, res) => {
  if (!req.session["user_id"]) {
    res.status(400).send('Please log in or register in order to edit URLs.')
  } else {
    const newLongURL = req.body.newLongURL;
    urlDatabase[req.params.shortURL] = { longURL: newLongURL, userID: req.session["user_id"] };
    res.redirect("/urls");  
  }
});

// delete a URL from the index
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session["user_id"]) {
    res.status(400).send('Please log in or register in order to delete URLs.')
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});



// register
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Missing input')
  } else if (getUserByEmail(req.body.email, users)) {
    res.status(400).send('Email already registered')
  } else {
    let newUserID = generateRandomString();
    let hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[newUserID] = { id: newUserID, email: req.body.email, password: hashedPassword };
    req.session.user_id = newUserID;
    res.redirect("/urls");
  }
});

// login
app.post("/login", (req, res) => {
  let matchingUser = getUserByEmail(req.body.email, users);
  if (!getUserByEmail(req.body.email, users)) {
    res.status(403).send('Email or password not found')
  } else if ((getUserByEmail(req.body.email, users)) && (!bcrypt.compareSync(req.body.password, matchingUser.password))) {
      res.status(403).send('Email or password not found')
  } else {
    const id = matchingUser.id;
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

// logout
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});






