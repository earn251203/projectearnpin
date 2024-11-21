const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors")

const app = express();
const port = 3000;



// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname+"/public"));
app.use("/profile",express.static(__dirname + "/profile"));

app.use(cors())
// Database Connection
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "0012",
  database: "soical_media",
});

const uploadFormData = multer().none();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "profile/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${file.fieldname}-${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueSuffix);
  },
});

// File Filter for Images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG and PNG are allowed."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).single("profileImage");

// Register Route
app.post("/register", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const { username, password } = req.body;
      const profileImage = req.file ? req.file.filename : null;

      // Check if username already exists
      const [existingUsers] = await pool.execute(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );

      if (existingUsers.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Username already exists" });
      }

      // Insert user
      const [result] = await pool.execute(
        "INSERT INTO users (username, password, profile_image) VALUES (?, ?, ?)",
        [username, password, profileImage]
      );

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        username: username,
        profileImage: profileImage,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({
          success: false,
          message: "Registration failed",
          error: error.message,
        });
    }
  });
});

app.post("/login", uploadFormData, async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);

    // ตรวจสอบว่า username และ password มีค่าหรือไม่
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Find user
    const [users] = await pool.execute(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = users[0];

    res.status(200).json({
      success: true,
      message: "Login successful",
      username: user.username,
      profileImage: user.profile_image,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Login failed", error: error.message });
  }
});


// Home Route (Verify Login)
app.get("/home", async (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const [users] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = users[0];
    res.status(200).json({
      success: true,
      username: user.username,
      profileImage: user.profile_image,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error retrieving user",
        error: error.message,
      });
  }
});

app.listen(port, () => {
    console.log(__dirname);

  console.log(`Server running on http://localhost:${port}`);
});
