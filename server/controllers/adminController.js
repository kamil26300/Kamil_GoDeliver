const User = require("../models/User");
const Driver = require("../models/Driver");
const Booking = require("../models/Booking");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");

    const usersWithBookingStats = await Promise.all(
      users.map(async (user) => {
        const bookingStats = await Booking.aggregate([
          { $match: { user: user._id, status: "completed" } },
          {
            $group: {
              _id: null,
              totalBookings: { $sum: 1 },
              totalPayment: { $sum: "$price" },
            },
          },
        ]);

        return {
          ...user.toObject(),
          totalBookings: bookingStats[0]?.totalBookings || 0,
          totalPayment: bookingStats[0]?.totalPayment || 0,
        };
      })
    );

    res.json(usersWithBookingStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate("user", "-password");
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name")
      .populate("driver", "name")
      .populate("vehicle", "type");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalDrivers = await Driver.countDocuments();
    const totalBookings = await Booking.countDocuments();

    const totalRevenue = await Booking.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    const tripTimes = await Booking.aggregate([
      { $match: { status: "completed" } },
      {
        $project: {
          tripDurationInMinutes: {
            $divide: [{ $subtract: ["$endTime", "$startTime"] }, 1000 * 60],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgTripTime: { $avg: "$tripDurationInMinutes" },
        },
      },
    ]);

    res.json({
      totalUsers,
      totalDrivers,
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      avgTripTime: Math.round(tripTimes[0]?.avgTripTime) || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
