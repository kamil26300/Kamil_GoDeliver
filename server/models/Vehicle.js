const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    basePrice: { type: Number, required: true },
    pricePerKm: { type: Number, required: true },
  },
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
