const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    licenseNumber: { 
      type: String, 
      required: true, 
      unique: true, 
      match: /^[A-Z]{2}\d{2} \d{11}$/
    },
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^[A-Z]{2}\d{2} [A-Z]{2} \d{4}$/
    },
    vehicleType: { type: String, required: true },
    currentLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

driverSchema.index({ currentLocation: "2dsphere" });

module.exports = mongoose.model("Driver", driverSchema);