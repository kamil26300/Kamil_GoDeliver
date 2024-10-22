const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middlewares/auth");

router.post("/", authMiddleware, bookingController.createBooking);
// User routes
router.get(
  "/user/pending",
  authMiddleware,
  bookingController.getUserPendingBookings
);
router.get(
  "/user/active",
  authMiddleware,
  bookingController.getUserActiveBookings
);
router.get(
  "/user/completed",
  authMiddleware,
  bookingController.getUserCompletedBookings
);

// Driver routes
router.get(
  "/driver/pending",
  authMiddleware,
  bookingController.getDriverPendingBookings
);
router.get(
  "/driver/active",
  authMiddleware,
  bookingController.getDriverActiveBookings
);

router.post("/:id/accept", authMiddleware, bookingController.acceptBooking);
router.put(
  "/:id/status",
  authMiddleware,
  bookingController.updateBookingStatus
);
router.get("/:id", authMiddleware, bookingController.getBooking);

router.post('/:bookingId/start-otp', bookingController.sendStartDeliveryOTP);
router.post('/:bookingId/validate-start-otp', bookingController.validateStartDeliveryOTP);
router.post('/:bookingId/end-otp', bookingController.sendEndDeliveryOTP);
router.post('/:bookingId/validate-end-otp', bookingController.validateEndDeliveryOTP);

module.exports = router;
