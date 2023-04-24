require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const PORT = process.env.BASE_PORT;
const  verifyRouter = require("./routes/verifyRoutes");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// DEV CLIENT SIDE 
app.use(cors({
  origin: process.env.NETLIFY_URL || process.env.CLIENT_BASE_URL,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

mongoose.connect(process.env.MONGO_DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB Atlas');
})
.catch((error) => {
  console.error('Error connecting to MongoDB Atlas:', error);
});

// Email Verification
app.use("/api/auth", verifyRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
