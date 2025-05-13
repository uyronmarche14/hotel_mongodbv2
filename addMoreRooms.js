const mongoose = require('mongoose');
const Room = require('./models/roomModel');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
}).then(() => {
  console.log('MongoDB Connected...');
  addMoreRooms();
}).catch(err => console.log(err));

// Additional room data to add variety
const additionalRooms = [
  // More Standard Rooms
  {
    title: 'Standard Room - City View',
    roomNumber: 'STD-102',
    description: 'Standard room with city view',
    fullDescription: 'Our standard rooms with city view offer comfortable accommodations with a beautiful view of the cityscape. Each room features modern furnishings, a private bathroom, and a work area.',
    price: 3200,
    imageUrl: '/images/room-placeholder.jpg',
    location: 'Taguig, Metro Manila',
    category: 'standard-room',
    rating: 4.1,
    reviews: 18,
    maxOccupancy: 2,
    bedType: 'Queen',
    roomSize: '24 sq m',
    viewType: 'City view',
    amenities: ['Free WiFi', 'TV', 'Air conditioning', 'Desk']
  },
  {
    title: 'Standard Room - Twin Beds',
    roomNumber: 'STD-103',
    description: 'Standard room with twin beds',
    fullDescription: 'Our standard twin rooms offer comfortable accommodations with two single beds. Perfect for friends or colleagues traveling together. Each room features modern furnishings, a private bathroom, and a work area.',
    price: 3100,
    imageUrl: '/images/room-placeholder.jpg',
    location: 'Taguig, Metro Manila',
    category: 'standard-room',
    rating: 4.3,
    reviews: 22,
    maxOccupancy: 2,
    bedType: 'Twin',
    roomSize: '24 sq m',
    viewType: 'Garden view',
    amenities: ['Free WiFi', 'TV', 'Air conditioning', 'Coffee maker']
  },
  
  // More Deluxe Rooms
  {
    title: 'Deluxe Room - High Floor',
    roomNumber: 'DLX-202',
    description: 'Deluxe room on a high floor with city views',
    fullDescription: 'Our high floor deluxe rooms offer breathtaking views of the city. These rooms feature upgraded furnishings, a seating area, and premium toiletries.',
    price: 5200,
    imageUrl: '/images/room-placeholder.jpg',
    location: 'Taguig, Metro Manila',
    category: 'deluxe-room',
    rating: 4.6,
    reviews: 32,
    maxOccupancy: 3,
    bedType: 'King',
    roomSize: '32 sq m',
    viewType: 'City skyline',
    amenities: ['Free WiFi', 'LED TV', 'Air conditioning', 'Mini bar', 'Coffee maker']
  },
  {
    title: 'Deluxe Room - Corner Unit',
    roomNumber: 'DLX-203',
    description: 'Spacious corner deluxe room with panoramic views',
    fullDescription: 'Our corner deluxe rooms offer extra space and panoramic views. These special units feature upgraded furnishings, a larger seating area, and premium toiletries.',
    price: 5500,
    imageUrl: '/images/room-placeholder.jpg',
    location: 'Taguig, Metro Manila',
    category: 'deluxe-room',
    rating: 4.7,
    reviews: 29,
    maxOccupancy: 3,
    bedType: 'King',
    roomSize: '35 sq m',
    viewType: 'Panoramic city view',
    amenities: ['Free WiFi', 'LED TV', 'Air conditioning', 'Mini bar', 'Coffee maker', 'Desk']
  },
  
  // More Executive Suites
  {
    title: 'Executive Suite - Business',
    roomNumber: 'ES-302',
    description: 'Executive suite with business amenities',
    fullDescription: 'Our business executive suites cater to corporate travelers with a separate work area, ergonomic chair, and business amenities. These suites feature premium furnishings, a dining area, and exclusive access to the executive lounge.',
    price: 8200,
    imageUrl: '/images/room-placeholder.jpg',
    location: 'Taguig, Metro Manila',
    category: 'executive-suite',
    rating: 4.8,
    reviews: 16,
    maxOccupancy: 2,
    bedType: 'King',
    roomSize: '48 sq m',
    viewType: 'City skyline',
    amenities: ['Free WiFi', 'Smart TV', 'Air conditioning', 'Mini bar', 'Coffee machine', 'Business desk']
  },
  
  // More Family Rooms
  {
    title: 'Family Room - Connecting Rooms',
    roomNumber: 'FR-602',
    description: 'Two connecting rooms perfect for families',
    fullDescription: 'Our connecting family rooms offer the perfect solution for families wanting both togetherness and privacy. One room features a king-size bed, while the connecting room has two single beds. Both rooms have their own bathroom.',
    price: 7500,
    imageUrl: '/images/room-placeholder.jpg',
    location: 'Taguig, Metro Manila',
    category: 'family-room',
    rating: 4.7,
    reviews: 34,
    maxOccupancy: 6,
    bedType: 'Various',
    roomSize: '65 sq m',
    viewType: 'Garden view',
    amenities: ['Free WiFi', 'LED TV', 'Air conditioning', 'Mini fridge', 'Game console']
  },
  
  // Another Honeymoon Suite
  {
    title: 'Honeymoon Suite - Anniversary Package',
    roomNumber: 'HS-502',
    description: 'Special suite with anniversary celebration package',
    fullDescription: 'Our anniversary honeymoon suite celebrates special milestones with a king-size bed, private spa bath, and a balcony with romantic views. The anniversary package includes champagne, chocolate-covered strawberries, and a romantic dinner for two.',
    price: 12500,
    imageUrl: '/images/room-placeholder.jpg',
    location: 'Taguig, Metro Manila',
    category: 'honeymoon-suite',
    rating: 5.0,
    reviews: 21,
    maxOccupancy: 2,
    bedType: 'King',
    roomSize: '60 sq m',
    viewType: 'City skyline',
    amenities: ['Free WiFi', 'Smart TV', 'Air conditioning', 'Mini bar', 'Spa bath', 'Private balcony']
  },
  
  // Additional Presidential Suite
  {
    title: 'Presidential Suite - Diplomat',
    roomNumber: 'PS-402',
    description: 'Distinguished presidential suite for dignitaries',
    fullDescription: 'Our diplomat presidential suite offers the pinnacle of luxury with enhanced security features. The suite includes a spacious living room, dining area, and a master bedroom with a king-size bed. Includes a study, a fully stocked bar, and 24-hour butler service.',
    price: 16000,
    imageUrl: '/images/room-placeholder.jpg',
    location: 'Taguig, Metro Manila',
    category: 'presidential-suite',
    rating: 4.9,
    reviews: 8,
    maxOccupancy: 4,
    bedType: 'King',
    roomSize: '85 sq m',
    viewType: 'Panoramic city view',
    amenities: ['Free WiFi', 'Smart TV', 'Air conditioning', 'Mini bar', 'Coffee machine', 'Jacuzzi', 'Private study']
  }
];

// Seed function to add more rooms
const addMoreRooms = async () => {
  try {
    console.log('Starting to add more rooms...');
    
    // Check existing rooms
    const existingCount = await Room.countDocuments();
    console.log(`Found ${existingCount} existing rooms in the database`);
    
    // Insert additional rooms
    const rooms = await Room.insertMany(additionalRooms);
    console.log(`Successfully added ${rooms.length} more rooms`);
    
    // Report new total
    const newTotal = await Room.countDocuments();
    console.log(`New total: ${newTotal} rooms in the database`);
    
    // Close the connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error adding more rooms:', error);
    process.exit(1);
  }
};

// Handle errors and exit signals
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  mongoose.connection.close();
  process.exit(1);
});

process.on('SIGINT', () => {
  mongoose.connection.close();
  process.exit(0);
}); 