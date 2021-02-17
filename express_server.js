const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



// Gets:

// My URLs index page
app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Create New URL page
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

// Show / Edit URL page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

// Register page
app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("register", templateVars);
});



// Posts:

// add a new URL to the index
app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect('/urls'); 
});

// update the long URL of an existing URL in the index
app.post("/urls/:shortURL", (req, res) => {
  const newLongURL = req.body.newLongURL;
  urlDatabase[req.params.shortURL] = newLongURL;
  res.redirect("/urls");  
});

// delete a URL from the index
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


// login
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

// logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});