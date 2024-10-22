const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    pickupLocation: {
      address: { type: String, required: true },
      coordinates: pointSchema,
    },
    dropoffLocation: {
      address: { type: String, required: true },
      coordinates: pointSchema,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    price: { type: Number, required: true },
    distance: { type: Number, required: true },
    estimatedDuration: { type: Number, required: true },
    startDeliveryOTP: {
      code: String,
      expiresAt: Date,
    },
    endDeliveryOTP: {
      code: String,
      expiresAt: Date,
    },
    startTime: { type: Date },
    endTime: { type: Date },
  },
);

bookingSchema.index({ "pickupLocation.coordinates": "2dsphere" });
bookingSchema.index({ "dropoffLocation.coordinates": "2dsphere" });

module.exports = mongoose.model("Booking", bookingSchema);
