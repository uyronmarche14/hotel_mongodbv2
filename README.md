# Hotel Booking System - Backend

This is the backend API for a hotel booking system.

## Major Changes

- Removed all admin-specific functionality
- Moved room management routes to public hotel routes
- Added protected user routes for user management

## API Routes

### Hotel Routes
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/:id` - Get a single hotel
- `POST /api/hotels` - Create a new hotel
- `PUT /api/hotels/:id` - Update a hotel
- `DELETE /api/hotels/:id` - Delete a hotel

### Room Routes
- `GET /api/hotels/rooms` - Get all rooms
- `GET /api/hotels/rooms/:id` - Get a single room
- `POST /api/hotels/rooms` - Create a new room
- `PUT /api/hotels/rooms/:id` - Update a room
- `DELETE /api/hotels/rooms/:id` - Delete a room

### User Routes (Protected)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a single user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

### Auth Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Booking Routes
- Various booking-related routes

## Running the Server

```bash
npm install
npm start
``` 