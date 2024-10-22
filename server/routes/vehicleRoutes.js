const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");
const authMiddleware = require("../middlewares/auth");

router.post("/", authMiddleware, vehicleController.createVehicle);
router.get("/", authMiddleware, vehicleController.getAllVehicles);
router.get("/:id", authMiddleware, vehicleController.getVehicle);
router.put("/:id", authMiddleware, vehicleController.updateVehicle);
router.delete("/:id", authMiddleware, vehicleController.deleteVehicle);

module.exports = router;
