# Logistics Platform System Documentation

## Table of Contents
1. System Overview
2. Technical Architecture
3. Core Features
4. Database Schema
5. API Documentation
6. Frontend Components
7. Deployment Guide
8. Security Measures
9. Performance Optimization
10. Scalability Considerations
11. Future Improvements

## 1. System Overview

### 1.1 Purpose
The Logistics Platform is a real-time transportation booking system designed for the Indian market. It connects users who need to transport goods with available drivers, providing seamless booking, tracking, and management capabilities.

## 2. Technical Architecture

### 2.1 Technology Stack
- Frontend: React.js with Ant Design
- Backend: Node.js with Express
- Database: MongoDB
- Maps Integration: Google Maps API
- Authentication: JWT

### 2.2 System Components
```
Frontend (React.js)
├── User Interface
├── Real-time Tracking
└── Booking Management

Backend (Node.js)
├── API Server
├── Authentication Service
├── Booking Service
├── Location Service
└── Analytics Service

Database (MongoDB)
├── User Collection
├── Driver Collection
├── Booking Collection
└── Vehicle Collection
```

## 3. Core Features

### 3.1 User Features
- Real-time booking system
- Location selection via Google Maps
- Price estimation
- Live tracking
- Booking history

### 3.2 Driver Features
- Real-time job notifications
- Route optimization
- Booking Status updates

### 3.3 Admin Features
- Analytics dashboard
- Driver management
- Booking management
- User management
- Earning management
- Average Trip Time Display

## 4. Database Schema

### 4.1 User Schema
```javascript
{
  name: String,
  email: String,
  password: String,
  phone: String,
  role: String
}
```

### 4.2 Driver Schema
```javascript
{
  user: ObjectId,
  licenseNumber: String,
  vehicleNumber: String,
  vehicleType: String,
  currentLocation: {
    type: String,
    coordinates: [Number]
  },
  isAvailable: Boolean,
  rating: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 4.3 Booking Schema
```javascript
{
  user: ObjectId,
  driver: ObjectId,
  vehicle: ObjectId,
  pickupLocation: {
    address: String,
    coordinates: [Number]
  },
  dropoffLocation: {
    address: String,
    coordinates: [Number]
  },
  status: String,
  price: Number,
  distance: Number,
  estimatedDuration: Number,
  startTime: Date,
  endTime: Date
}
```

### 4.4 Vehicle Schema
```javascript
{
  type: String,
  basePrice: Number,
  pricePerKm: Number
}
```

## 5. API Documentation

### 5.1 User Endpoints
```
POST /api/users/register
POST /api/users/login
GET /api/users/profile
```

### 5.2 Booking Endpoints
```
GET /api/bookings/user/pending
GET /api/bookings/user/active
GET /api/bookings/user/completed

GET /api/bookings/driver/active
GET /api/bookings/driver/completed

POST /api/bookings/:id/accept
PUT /api/bookings/:id/status
GET /api/bookings/:id

POST /api/bookings/:bookingId/start-otp
POST /api/bookings/:bookingId/validate-start-otp
POST /api/bookings/:bookingId/end-otp
POST /api/bookings/:bookingId/validate-end-otp
```

### 5.3 Driver Endpoints
```
GET /api/drivers/:id/location
GET /api/drivers/isRegistered
PUT /api/drivers/:id/location
POST /api/drivers/register
PUT /api/drivers/:id/availability
```

### 5.4 Vehicle Endpoints
```
POAT /api/vehicles/
GET /api/vehicles/
GET /api/vehicles/:id
PUT /api/vehicles/:id
DELETE /api/vehicles/:id
```

### 5.5 Admin Endpoints
```
GET /api/admin/users
GET /api/admin/drivers
GET /api/admin/bookings
GET /api/admin/stats
```

## 6. Frontend Components

### 6.1 Core Components
- BookingForm
- TrackingView
- Map
- PriceEstimation

### 6.2 Pages
- Home
- Login/Register
- UserDashboard
- DriverDashboard
- AdminDashboard

## 7. Deployment Guide

### 7.1 Prerequisites
- Node.js v14+
- MongoDB v4.4+
- Google Maps API Key
- Environment Variables Setup

### 7.2 Environment Variables
#### 7.2.1 Front-End
```
REACT_APP_GOOGLE_MAPS_API_KEY=
```
#### 7.2.2 Back-End
```
MONGODB_URI=
PORT=
JWT_SECRET=
EMAIL_ADMIN=
EMAIL_PASS=
```

### 7.3 Deployment Steps
1. Clone repository
2. Install dependencies
3. Configure environment variables
4. Build and start frontend
5. Start server

## 8. Security Measures

### 8.1 Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control

### 8.2 API Security
- Request validation
- CORS configuration
- Helmet security headers

### 8.3 Data Security
- MongoDB encryption at rest
- Input sanitization
- Secure password policies

## 9. Performance Optimization

### 9.1 Backend Optimization
- Database indexing
- Query optimization

### 9.2 Frontend Optimization
- Code splitting

## 10. Scalability Considerations

### 10.1 Database Scaling
- Sharding strategy
- Replication
- Index optimization
- Query optimization

### 10.2 Application Scaling
- Horizontal scaling
- Vertical scaling
- Microservices architecture
- Caching strategy

## 11. Future Improvements

### 11.1 Planned Features
- Multi-language support
- Advanced analytics
- ML-based price optimization
- Enhanced route optimization

### 11.2 Technical Improvements
- GraphQL implementation
- Kubernetes deployment
- Enhanced monitoring
- Performance optimizations
