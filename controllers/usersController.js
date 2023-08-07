const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET;

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
      req.flash("error", `Current password is Invalid, try again!`);
      console.log("Current password is Invalid, try again!");
      return res.redirect("back");
    }

    const newPassword = req.body.new_password;
    const saltRounds = 10;
    const hash = await bcrypt.hash(newPassword, saltRounds);
    user.password = hash;
    await user.save();

    req.flash("success", "Your Password is Update, login to continue!👍");
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
      req.flash("error", `Passwords doesn't not match😭`);
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
    req.flash("success", "You have signed up, login to continue!👍");

    return res.redirect("/");
  } catch (err) {
    req.flash("error", err);
    console.log("Error in Creating Account", err);
    return res.redirect("back");
  }
};

// Create-Session
module.exports.createSession = (req, res) => {
  req.flash("success", "Loggin Successfully!👍");
  return res.redirect("/home");
};

// Destroy Session
module.exports.destroySession = (req, res) => {
  req.logout((err) => {
    if (err) {
      req.flash("error", err);
      console.log("Error in Logging Out", err);
      return;
    }
  });

  req.flash("success", "You have logged out!😝");
  return res.redirect("/");
};

////--------- Forgot Password Link through Gmail and Set new password ---------///
module.exports.forgotPage = (req, res) => {
  return res.render("forgot", { title: "forgot page" });
};
// Forgot Password
module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const olduser = await User.findOne({ email });
    if (!olduser) {
      console.log("User Not Exists!!");
      return res.redirect("back");
    }

    const secret = JWT_SECRET + olduser.password;

    const token = jwt.sign({ email: olduser.email, id: olduser._id }, secret, {
      expiresIn: "10m",
    });

    const link = `https://nodejs-authentication-ovjt.onrender.com/reset-password/${olduser._id}/${token}`;

    // Using NODEMAILER sending Email for new Password set
    let transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: "mrrobot683013@gmail.com",
        pass: "ykgxjckypxndsyau",
      },
    });

    let mailOptions = {
      from: "mrrobot683013@gmail.com",
      to: email,
      subject: "Password Reset",
      html: `<h1>Password Update Link</h1> <p>${link}</p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    return res.redirect("/");
  } catch (err) {
    req.flash("error", err);
    console.log("Error in forgot password", err);
    return res.redirect("back");
  }
};

// getting link from email and shown reset password page for update new password
module.exports.forgotResetPassword = async (req, res) => {
  const { id, token } = req.params;

  const oldUser = await User.findOne({ _id: id });

  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }

  const secret = JWT_SECRET + oldUser.password;

  try {
    const verify = jwt.verify(token, secret);
    res.render("reset_password", {
      title: "Reset Password",
      user: req.user,
      id: id,
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.send("Not Verified");
  }
};

// this controller using post method for upadating password in DB
module.exports.forgotResetPasswordPost = async (req, res) => {
  const { id, token } = req.params;
  const { new_password } = req.body;

  const oldUser = await User.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = JWT_SECRET + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);

    const encryptedPassword = await bcrypt.hash(new_password, 10);

    oldUser.password = encryptedPassword;

    await oldUser.save();
    req.flash("success", "Password Updated!👍");

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.json({ status: "Something Went Wrong" });
  }
};
