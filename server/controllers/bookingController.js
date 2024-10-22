const Booking = require("../models/Booking");
const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");
const { calculatePrice } = require("../utils/pricingModel");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

// TODO: check if user already has a booking in progress
exports.createBooking = async (req, res) => {
  try {
    const {
      pickupLocation,
      dropoffLocation,
      vehicleType,
      distance,
      estimatedDuration,
    } = req.body;
    const alreadyBooked = (
      await Booking.find({
        user: req.user._id,
        status: { $in: ["pending", "accepted", "in-progress"] },
      })
    )[0];

    console.log(
      pickupLocation,
      dropoffLocation,
      vehicleType,
      distance,
      estimatedDuration
    );

    if (alreadyBooked) {
      return res.status(400).json({
        message: `You already have a booking ${alreadyBooked.status}`,
      });
    }
    // Find the nearest available driver
    const driver = await Driver.findOne({
      isAvailable: true,
      vehicleType,
      currentLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: pickupLocation.coordinates,
          },
          $maxDistance: 10000, // 10km radius
        },
      },
    });

    if (!driver) {
      return res.status(404).json({ message: "No available drivers found" });
    }

    const vehicle = await Vehicle.findOne({ type: vehicleType });
    const price = calculatePrice(distance, vehicle);

    console.log(driver);

    const booking = await Booking.create({
      user: req.user._id,
      driver: driver.user,
      vehicle: vehicle._id,
      pickupLocation: {
        address: pickupLocation.address,
        coordinates: {
          type: "Point",
          coordinates: pickupLocation.coordinates,
        },
      },
      dropoffLocation: {
        address: dropoffLocation.address,
        coordinates: {
          type: "Point",
          coordinates: dropoffLocation.coordinates,
        },
      },
      status: "pending",
      price,
      distance,
      estimatedDuration,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUserPendingBookings = async (req, res) => {
  try {
    const pendingBookings = (
      await Booking.find({
        user: req.user._id,
        status: "pending",
      }).populate("vehicle")
    )[0];
    res.json(pendingBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserCompletedBookings = async (req, res) => {
  try {
    const completedBookings = await Booking.find({
      user: req.user._id,
      status: "completed",
    })
      .populate("driver", "name email")
      .populate("vehicle");

    const bookingsWithTripTime = completedBookings.map((booking) => {
      const startDate = new Date(booking.startTime);
      const endDate = new Date(booking.endTime);
      const tripTime = (endDate - startDate) / (1000 * 60);
      return {
        ...booking._doc,
        tripTime: Math.round(tripTime),
      };
    });

    res.json(bookingsWithTripTime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserActiveBookings = async (req, res) => {
  try {
    let activeBookings = (
      await Booking.find({
        user: req.user._id,
        status: { $in: ["accepted", "in-progress"] },
      })
        .populate("driver", "name phone")
        .populate("vehicle")
    )[0];
    res.json(activeBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDriverPendingBookings = async (req, res) => {
  try {
    const pendingBookings = await Booking.find({
      driver: req.user._id,
      status: "pending",
    })
      .populate("user", "name")
      .populate("vehicle");
    res.json(pendingBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDriverActiveBookings = async (req, res) => {
  try {
    const activeBookings = (
      await Booking.find({
        driver: req.user._id,
        status: { $in: ["accepted", "in-progress"] },
      })
        .populate("user", "name phone")
        .populate("vehicle")
    )[0];
    res.json(activeBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name")
      .populate("driver", "name")
      .populate("vehicle", "type");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const updateData = { status };

    if (status === "in-progress") {
      updateData.startTime = new Date();
    } else if (status === "completed") {
      updateData.endTime = new Date();
      await Driver.findOneAndUpdate(
        { user: booking.driver },
        { isAvailable: true }
      );
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedBooking);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
};

exports.acceptBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const driverId = req.user._id;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This booking is no longer available" });
    }

    const driver = await Driver.findOne({ user: driverId });
    if (!driver || !driver.isAvailable) {
      console.log("Driver not available");
      return res
        .status(400)
        .json({ message: "Driver is not available to accept bookings" });
    }

    // Update the booking status
    booking.status = "accepted";
    booking.driver = driverId;
    await booking.save();

    // Update driver availability
    driver.isAvailable = false;
    await driver.save();

    res.status(200).json({ message: "Booking accepted successfully", booking });
  } catch (error) {
    console.error("Error in acceptBooking:", error);
    res
      .status(500)
      .json({ message: "An error occurred while accepting the booking" });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ADMIN,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOTP = () => {
  return otpGenerator.generate(4, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
};

exports.sendStartDeliveryOTP = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate("user", "email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const otp = generateOTP();
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    booking.startDeliveryOTP = {
      code: otp,
      expiresAt: expirationTime,
    };
    await booking.save();

    // Send email to user
    await transporter.sendMail({
      from: process.env.EMAIL_ADMIN,
      to: booking.user.email,
      subject: "Start Delivery OTP",
      text: `Your OTP to start the delivery is: ${otp}. This OTP will expire in 5 minutes.`,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.validateStartDeliveryOTP = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { otp } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!booking.startDeliveryOTP || !booking.startDeliveryOTP.code) {
      return res
        .status(400)
        .json({ message: "No OTP was generated for this booking" });
    }

    if (new Date() > booking.startDeliveryOTP.expiresAt) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (otp !== booking.startDeliveryOTP.code) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    booking.status = "in-progress";
    booking.startDeliveryOTP = undefined;
    await booking.save();

    res.json({ message: "Delivery started successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendEndDeliveryOTP = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate("user", "email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const otp = generateOTP();
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    booking.endDeliveryOTP = {
      code: otp,
      expiresAt: expirationTime,
    };
    await booking.save();

    // Send email to user
    await transporter.sendMail({
      from: process.env.EMAIL_ADMIN,
      to: booking.user.email,
      subject: "End Delivery OTP",
      text: `Your OTP to end the delivery is: ${otp}. This OTP will expire in 5 minutes.`,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.validateEndDeliveryOTP = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { otp } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!booking.endDeliveryOTP || !booking.endDeliveryOTP.code) {
      return res
        .status(400)
        .json({ message: "No OTP was generated for this booking" });
    }

    if (new Date() > booking.endDeliveryOTP.expiresAt) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (otp !== booking.endDeliveryOTP.code) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    booking.status = "completed";
    booking.endDeliveryOTP = undefined;
    await booking.save();

    res.json({ message: "Delivery completed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
