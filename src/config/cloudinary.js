/**
 * CLOUDINARY.JS - Image Storage Configuration
 * 
 * This file sets up Cloudinary to store images.
 * Cloudinary is like a photo storage service in the cloud.
 * When users upload images, they go to Cloudinary and we get back a URL.
 */

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with credentials from .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Your Cloudinary account name
  api_key: process.env.CLOUDINARY_API_KEY, // Your API key
  api_secret: process.env.CLOUDINARY_API_SECRET, // Your secret key
});

module.exports = cloudinary;

