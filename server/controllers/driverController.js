const Booking = require("../models/Booking");
const Driver = require("../models/Driver");

exports.registerDriver = async (req, res) => {
  try {
    const { licenseNumber, vehicleNumber, vehicleType, currentLocation } =
      req.body;
    user = req.user._id;

    // Check if user already registered as a driver
    const existingDriver = await Driver.findOne({ user });
    if (existingDriver) {
      return res
        .status(400)
        .json({ message: "User already registered as a driver" });
    }

    // Create new driver
    const newDriver = new Driver({
      user,
      licenseNumber,
      vehicleType,
      vehicleNumber,
      currentLocation,
      isAvailable: true,
      rating: 0,
    });

    await newDriver.save();

    res
      .status(201)
      .json({ message: "Driver registered successfully", driver: newDriver });
  } catch (error) {
    console.error("Error in registerDriver:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.checkDriverRegistration = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver)
      return res
        .status(400)
        .send({ registered: false, message: "Driver is not Registered ❌" });

    return res
      .status(201)
      .send({ registered: true, message: "Driver is Registered ✔" });
  } catch (error) {}
};

exports.getDriverLocation = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).select(
      "status driver"
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const driver = await Driver.findOne({ user: booking.driver }).select(
      "currentLocation"
    );
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.json({
      bookingStatus: booking.status,
      driverCurrentLocation: driver.currentLocation.coordinates,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDriverLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const driver = await Driver.findOneAndUpdate(
      { user: req.params.id },
      {
        currentLocation: { type: "Point", coordinates: [longitude, latitude] },
      },
      { new: true }
    );
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.json(driver.currentLocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const driver = await Driver.findOneAndUpdate(
      { user: req.params.id },
      { isAvailable },
      { new: true }
    );
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
