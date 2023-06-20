const express = require("express");
const connection = require("../connection");
const router = express.Router();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { route } = require("..");
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');
require("dotenv").config();

// signup api
router.post("/signup", (req, res) => {
  let user = req.body;
  query = "select email,password,role,status from user where email = ?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        query =
          "insert into user(name,contactNumber,email,password,status,role)values(?,?,?,?,'false','user')";
        connection.query(
          query,
          [user.name, user.contactNumber, user.email, user.password],
          (err, results) => {
            if (!err) {
              return res
                .status(200)
                .json({ message: "Successfully Registered" });
            } else {
              return res.status(500).json(err);
            }
          }
        );
      } else {
        return res.status(400).json({ message: "Email Already Exist." });
      }
    }
  });
});

//login
router.post("/login", (req, res) => {
  let user = req.body;
  query =
    "select email,contactNumber,password,role,status from user where email = ?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0 || results[0].password != user.password) {
        return res
          .status(401)
          .json({ message: "Incorrect Username Or Password" });
      } else if (results[0].status === "false") {
        return res.status(400).json({ message: "Wait For Admin Approval" });
      } else if (results[0].password === user.password) {
        const response = { email: results[0].email, role: results[0].role };
        const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {
          expiresIn: "8h",
        });
        res.status(200).json({ token: accessToken });
      } else {
        return res.status(400).json({ message: "Something Went Wrong" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

//email authenctication
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

router.post("/forgotPassword", (req, res) => {
  const user = req.body;
  query = "select email,password from user where email = ?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return res
          .status(200)
          .json({ message: "Password Sent Successfully To Your Email" });
      } else {
        var mailOptions = {
          form: process.env.EMAIL,
          to: results[0].email,
          subject: "Password By Cafe Management System",
          html:
            `<p>your login details form cafe management system 
                            </b><br></b> Email:` +
            results[0].email +
            `<br><b>Password:` +
            results[0].password +
            `<br>
                            <a href = 'http://localhost:4200/'>C    lick herer to login</a></p>`,
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent : " + info.response);
          }
        });
        return res
          .status(200)
          .json({ message: "Password Sent Successfully To Your Email" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

router.get("/get",auth.authencticateToken,checkRole.checkRole, (req, res) => {
  var query ="SELECT id, name, contactNumber, email, password, status FROM user WHERE role = 'user'";
  connection.query(query, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json(err);
    }
  });
});

router.patch("/update",auth.authencticateToken,checkRole.checkRole, (req, res) => {
  let user = req.body;
  query = "update user set status = ? where id = ?";
  connection.query(query, [user.status, user.id], (err, results) => {
    if (!err) {
      if (results.affectedRows == 0) {
        return res.status(404).json({ message: "User does not exist" });
      }
      return res.status(200).json({ message: "User updated successfully" });
    } else {
      return res.status(500).json(err);
    }
  });
});

router.get("/checkToken",auth.authencticateToken,checkRole.checkRole,(req, res) => {
  return res.status(200).json({ message: "true" });
});

router.post("/changePassword", (req, res) => {});

module.exports = router;
