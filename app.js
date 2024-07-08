const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const userModel = require("./models/user");
const postModel = require("./models/post");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", async (req, res) => {
  let { email, password, name, age, username } = req.body;
  let user = await userModel.findOne({ email });

  if (user) return res.status(409).send("Email already exists");

  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, async function (err, hash) {
      let newUser = await userModel.create({
        username,
        name,
        age,
        email,
        password: hash,
      });
      let token = jwt.sign({ email: email, userid: newUser._id }, "Shahwaiz");
      res.cookie("token", token);
      res.send("Registration successful");
    });
  });
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });

  if (!user) return res.status(409).send("No user found with that email");

  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      let token = jwt.sign({ email: email, userid: newUser._id }, "Shahwaiz");
      res.cookie("token", token);
      res.status(200).send("Login successful");
    } else res.redirect("/");
  });
});
app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

function isLoggedIn(req, res, next) {
  if (req.cookies.token === "") res.send("You are not logged in");
  else {
    let data = jwt.verify(req.cookies.token, "Shahwaiz");
    req.user = data;

    next();
  }
}
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
