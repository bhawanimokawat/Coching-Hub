
const express = require("express");
const { body } = require("express-validator");

const {
  registerUser,
  loginUser,
  logoutUser
} = require("../controllers/authControllers");

const { validateRequest } = require("../middleware/validationMiddleware");
const  {authLimiter} = require("../middleware/rateLimitMiddleware");
const { protect } = require("../middleware/authmiddleware");

const router = express.Router();

const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters."),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email.")
    .normalizeEmail(),

  body("password")
    .isString()
    .withMessage("Password must be a string.")
    .isLength({ min: 8, max: 72 })
    .withMessage("Password must be between 8 and 72 characters.")
];


router.post(
  "/register",
  authLimiter,
  registerValidation,
  validateRequest,
  registerUser
);



const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email.")
    .normalizeEmail(),

  body("password")
    .isString()
    .withMessage("Password must be a string.")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ max: 72 })
    .withMessage("Password cannot exceed 72 characters."),
];



router.post(
  "/login",
  authLimiter,
  loginValidation,
  validateRequest,
  loginUser
);


router.post("/logout", protect, logoutUser);

module.exports = router;
