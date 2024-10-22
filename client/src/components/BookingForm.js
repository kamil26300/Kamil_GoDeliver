import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, message } from "antd";
import {
  GoogleMap,
  LoadScript,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import axios from "axios";

const { Option } = Select;

const libraries = ["places"];

const BookingForm = ({ setActiveTab }) => {
  const [form] = Form.useForm();
  const [pickup, setPickup] = useState({ lat: null, lng: null, address: "" });
  const [dropoff, setDropoff] = useState({ lat: null, lng: null, address: "" });
  const [pickupAutocomplete, setPickupAutocomplete] = useState(null);
  const [dropoffAutocomplete, setDropoffAutocomplete] = useState(null);
  const [vehicles, setVehicles] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [price, setPrice] = useState({ min: null, max: null });

  const onFinish = async (values) => {
    try {
      const response = await axios.post("/api/bookings", {
        pickupLocation: {
          address: values.pickup,
          coordinates: [pickup.lng, pickup.lat],
        },
        dropoffLocation: {
          address: values.dropoff,
          coordinates: [dropoff.lng, dropoff.lat],
        },
        vehicleType: values.vehicleType,
        distance,
        estimatedDuration: duration
      });
      message.success("Booking created successfully");
      setActiveTab("2");
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to create booking"
      );
    }
  };

  const handlePickupSelect = () => {
    if (pickupAutocomplete !== null) {
      const place = pickupAutocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || place.name;

        setPickup({ lat, lng, address });
        form.setFieldsValue({
          pickup: address
        })
      }
    }
  };

  const handleDropoffSelect = () => {
    if (dropoffAutocomplete !== null) {
      const place = dropoffAutocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || place.name;

        setDropoff({ lat, lng, address });
        form.setFieldsValue({
          dropoff: address
        })
      }
    }
  };

  const updateRoute = (pickup, dropoff) => {
    if (pickup && dropoff) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: { lat: pickup.lat, lng: pickup.lng },
          destination: { lat: dropoff.lat, lng: dropoff.lng },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            const route = result.routes[0];
            setDistance((route.legs[0].distance.value / 1000).toFixed(2));
            setDuration((route.legs[0].duration.value / 60).toFixed(2));
          }
        }
      );
    }
  };

  const handlePickupChange = (e) => {
    const value = e.target.value;
    setPickup({ address: value });
    form.setFieldsValue({
      pickup: value
    })
  };

  const handleDropoffChange = (e) => {
    const value = e.target.value;
    setDropoff({ address: value });
    form.setFieldsValue({
      dropoff: value
    })
  };

  useEffect(() => {
    if (vehicle && distance) {
      const fare = vehicle.basePrice + (vehicle.pricePerKm * distance)
      setPrice({min: Math.floor(fare), max: Math.ceil(fare * 1.5)})
    }
  }, [vehicle, distance])

  useEffect(() => {
    if (pickup.lat && dropoff.lat) {
      updateRoute(pickup, dropoff);
    }
  }, [pickup, dropoff]);

  useEffect(() => {
    const fetchAllVehicles = async () => {
      const response = await axios.get("/api/vehicles");
      setVehicles(response.data);
    };
    fetchAllVehicles();
  }, []);

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <Form form={form} onFinish={onFinish} layout="vertical">
        <div className="grid grid-cols-5 gap-12">
          <div className="col-span-4">
            <Form.Item
              name="pickup"
              label="Pickup Location"
              rules={[{ required: true }]}
            >
              <Autocomplete
                onLoad={(autocomplete) => setPickupAutocomplete(autocomplete)}
                onPlaceChanged={handlePickupSelect}
              >
                <Input value={pickup.address} onChange={handlePickupChange} />
              </Autocomplete>
            </Form.Item>

            <Form.Item
              name="dropoff"
              label="Dropoff Location"
              rules={[{ required: true }]}
            >
              <Autocomplete
                onLoad={(autocomplete) => setDropoffAutocomplete(autocomplete)}
                onPlaceChanged={handleDropoffSelect}
              >
                <Input onChange={handleDropoffChange} value={dropoff.address} />
              </Autocomplete>
            </Form.Item>

            <Form.Item
              name="vehicleType"
              label="Vehicle Type"
              rules={[{ required: true }]}
            >
              <Select
                value={vehicle?.type}
                onChange={(value) => {
                  const selectedVehicle = vehicles.find(
                    (v) => v.type === value
                  );
                  setVehicle(selectedVehicle);
                }}
              >
                {vehicles?.map((vehicle, id) => (
                  <Option key={id} value={vehicle.type}>
                    {vehicle.type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          {distance && duration && (
            <div className="col-span-1 flex flex-col justify-center text-base">
              <p className="flex gap-2">
                Distance: <span className="font-bold">{distance} KM</span>
              </p>
              <p className="flex gap-2">
                Estimated Duration:
                <span className="font-bold">{duration} mins</span>
              </p>
              {price.min && (
                <p className="flex gap-2">
                  Estimated Price:
                  <span className="font-bold">
                    ₹{price.min} - {price.max}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        {pickup && dropoff && (
          <div className="mb-4">
            <GoogleMap
              mapContainerStyle={{ height: "400px", width: "100%" }}
              center={pickup || dropoff}
              options={{
                streetViewControl: false,
                zoomControl: false,
                scaleControl: false,
                fullscreenControl: false,
                cameraControl: false,
                mapTypeControl: false,
              }}
              zoom={12}
            >
              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          </div>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Book Now
          </Button>
        </Form.Item>
      </Form>
    </LoadScript>
  );
};

export default BookingForm;
