require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const expressLayouts = require("express-ejs-layouts");
const db = require("./config/mongoose");

// For creating session
const session = require("express-session");
const MongoStore = require("connect-mongo");

// Passport for Authentication
const passport = require("passport");
const localStrategy = require("./config/passport-local-strategy");
const GoogleStrategy = require("./config/passport-google-strategy");
const User = require("./models/user");

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static("./assets"));
app.use(expressLayouts);

// Extract styles and scripts from sub pages int layouts page
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

// Set the ejs view Engine
app.set("view engine", "ejs");
app.set("views", "./views");

//configure the session middleware
app.use(
  session({
    name: "Nodejs_Auth",
    secret: process.env.EXPRESS_SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 100,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      autoRemove: "native", // remove expired sessions automatically
      ttl: 7 * 24 * 60 * 60, // set session TTL to 7 days
      stringify: false,
    }),
  })
);

// Initialize Passport and use local Strategy
app.use(passport.initialize());
app.use(passport.session());
passport.use(localStrategy);

// Serializing the User to decide whichk key is to be kept in the Cookies
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializing the User from the key in the Cookies
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    return done(null, user);
  } catch (err) {
    console.log("Error in Finding User --> Passport");
    return done(err);
  }
});

// Use Router
app.use("/", require("./routes"));

app.listen(PORT, (err) => {
  if (err) {
    console.log(`Error in running on Port :: ${PORT}`, err);
    return;
  }

  console.log(`Server is Running on Port :: ${PORT}`);
});
