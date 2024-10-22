const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const authMiddleware = require("../middlewares/auth");

router.get("/:id/location", authMiddleware, driverController.getDriverLocation);
router.get("/isRegistered", authMiddleware, driverController.checkDriverRegistration);
router.put(
  "/:id/location",
  authMiddleware,
  driverController.updateDriverLocation
);
router.post("/register", authMiddleware, driverController.registerDriver);
router.put(
  "/:id/availability",
  authMiddleware,
  driverController.updateAvailability
);

module.exports = router;
