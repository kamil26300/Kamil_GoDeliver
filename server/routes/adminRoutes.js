const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/auth");
const adminMiddleware = require("../middlewares/admin");

router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  adminController.getAllUsers
);
router.get(
  "/drivers",
  authMiddleware,
  adminMiddleware,
  adminController.getAllDrivers
);
router.get(
  "/bookings",
  authMiddleware,
  adminMiddleware,
  adminController.getAllBookings
);
router.get("/stats", authMiddleware, adminMiddleware, adminController.getStats);

module.exports = router;
