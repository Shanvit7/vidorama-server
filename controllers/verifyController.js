const nodemailer = require("nodemailer");
const { v4: uuid } = require("uuid");
const ejs = require("ejs");
const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.verifyEmail = async (req, res) => {
  console.log("Request received for verifying email");
  try {
    const { email } = req.body;
    if (email) {
      const magicToken = uuid();
      const verificationData = {
        link: `${process.env.CLIENT_BASE_URL}/verify-user/${magicToken}`,
      };
      ejs.renderFile(
        "./views/verify-email.ejs",
        verificationData,
        async (err, html) => {
          if (err) {
            console.log(err);
            res
              .status(500)
              .json({ message: "Something went wrong!!", error: err });
          } else {
            const mailOptions = {
              from: process.env.EMAIL_USERNAME,
              to: email,
              subject: "Vidorama: Start Streaming",
              html: html,
            };
            const result = await User.updateOne(
              { email },
              { $set: { magicToken } },
              { upsert: true }
            );

            if (result.matchedCount === 1) {
              console.log("Existing user being verified");
              await transporter.sendMail(mailOptions);
              console.log("Email sent successfully");
              return res
                .status(200)
                .json({ message: "Magic link sent successfully" });
            } else {
              console.log("New user being verified");
              await transporter.sendMail(mailOptions);
              console.log("Email sent successfully");
              return res
                .status(200)
                .json({ message: "Magic link sent successfully" });
            }
          }
        }
      );
    } else {
      res.status(400).json({ message: "Please provide your email addresss" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!!", error: err });
  }
};

exports.verifyUser = async (req, res) => {
  console.log('User being verified');
  const { magicToken } = req.body;
  if (!magicToken) {
    return res.status(400).json({ message: "Please provide token" });
  }
  const result = await User.findOne({ magicToken });
  try {
    if (result) {
      console.log('User identified');
      if(result?.userAuthId){
        console.log('Existing user logging in');
        const secureToken = jwt.sign(
          { userAuthId: result?.userAuthId },
          process.env.JWT_SECRET_KEY
        );
        return res.status(200).json({ message: "Existing user verified successfully",
        userAuthId: secureToken});
      } else {
        const userAuthId = uuid();
        const result = await User.updateOne(
          { magicToken },
          { $set: { userAuthId } }
        );
        if(result){
          console.log('New user logging in');
          const secureToken = jwt.sign(
            { userAuthId: userAuthId },
            process.env.JWT_SECRET_KEY
          );
          return res.status(201).json({ message: "User is verified successfully.",
          userAuthId: secureToken});
        }
    } 
    }
    return res.status(403).json({message: 'No such user found.'});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
