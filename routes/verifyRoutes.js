const express = require("express");
const router = express.Router();
const verifyController = require("../controllers/verifyController.js");

router.route("/verify-email").post(verifyController.verifyEmail);
router
  .route("/verify-user")
  .post(verifyController.verifyUser);

module.exports = router;
