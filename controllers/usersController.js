const User = require("../models/user");
const bcrypt = require("bcrypt");

module.exports.signIn = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  }
  return res.render("sign_in", { title: "Sign In" });
};

module.exports.signUp = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  }
  return res.render("sign_up", { title: "Sign Up" });
};

// Home Controller
module.exports.home = function (req, res) {
  return res.render("home", {
    title: "Home Page",
    user: req.user,
  });
};

// Reset password Controller
module.exports.resetPassword = function (req, res) {
  return res.render("reset_password", {
    title: "Reset Password",
    user: req.user,
  });
};

// Upadte password : matching previous password then update password
module.exports.updatePassword = async function (req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!passwordMatch) {
      console.log("Current password is Invalid, try again!");
      return res.redirect("back");
    }

    const newPassword = req.body.new_password;
    const saltRounds = 10;
    const hash = await bcrypt.hash(newPassword, saltRounds);
    user.password = hash;
    await user.save();

    return res.redirect("/destroy-session");
  } catch (err) {
    console.log("Error in Reseting Password", err);
    return;
  }
};

// Create account Controller
module.exports.create = async function (req, res) {
  try {
    if (req.body.password != req.body.confirm_password) {
      return res.redirect("back");
    }

    // Chcek if User is already exist
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      console.log("User is already exist");
      return res.redirect("back");
    }

    const newPassword = req.body.password;
    const saltRounds = 10;

    const hash = await bcrypt.hash(newPassword, saltRounds);

    const newUser = await new User({
      name: req.body.name,
      email: req.body.email,
      password: hash,
    });

    await newUser.save();

    res.status(200);

    return res.redirect("/");
  } catch (err) {
    console.log("Error in Creating Account", err);
    return res.redirect("back");
  }
};

// Create-Session
module.exports.createSession = (req, res) => {
  return res.redirect("/home");
};

// Destroy Session
module.exports.destroySession = (req, res) => {
  req.logout((err) => {
    if (err) console.log("Error in Logging Out", err);
  });

  return res.redirect("/");
};
