const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Room title is required'],
    trim: true,
    maxlength: [100, 'Room title cannot be more than 100 characters']
  },
  roomNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // This allows the field to be optional while maintaining uniqueness
  },
  type: {
    type: String,
    enum: ['standard', 'deluxe', 'suite', 'executive', 'family'],
    default: 'standard'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  fullDescription: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  imageUrl: {
    type: String,
    default: '/images/room-placeholder.jpg'
  },
  images: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    default: 'Taguig, Metro Manila'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['standard-room', 'deluxe-room', 'executive-suite', 'presidential-suite', 'honeymoon-suite', 'family-room']
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    default: 4.5
  },
  reviews: {
    type: Number,
    default: 0,
    min: 0
  },
  capacity: {
    type: Number,
    default: 1,
    min: [1, 'Capacity must be at least 1']
  },
  maxOccupancy: {
    type: Number,
    default: 2,
    min: [1, 'Max occupancy must be at least 1']
  },
  bedType: {
    type: String,
    enum: ['Single', 'Double', 'Queen', 'King', 'Twin', 'Various'],
    default: 'Queen'
  },
  roomSize: {
    type: String,
    default: '30 sq m'
  },
  viewType: {
    type: String,
    default: 'City view'
  },
  amenities: {
    type: [String],
    default: []
  },
  additionalAmenities: {
    type: [String],
    default: ['WiFi', 'Air conditioning', 'Daily housekeeping', 'Mini bar']
  },
  features: {
    type: [String],
    default: []
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  href: {
    type: String,
    default: function() {
      return `/hotelRoomDetails/${this.category}/${this.title.toLowerCase().replace(/ /g, '-')}`;
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug when saving
roomSchema.pre('save', function(next) {
  if (!this.href) {
    this.href = `/hotelRoomDetails/${this.category}/${this.title.toLowerCase().replace(/ /g, '-')}`;
  }
  next();
});

// Create a text index for searching
roomSchema.index({ 
  title: 'text', 
  description: 'text', 
  fullDescription: 'text',
  category: 'text'
});

module.exports = mongoose.model('Room', roomSchema); 
 