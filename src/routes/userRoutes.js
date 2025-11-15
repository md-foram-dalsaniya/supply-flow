const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getMe,
  uploadProfileImage,
  updateProfile,
  getProfileInfo,
} = require('../controllers/userController');

router.use(protect);

router.get('/me', getMe);
router.get('/profile-info', getProfileInfo);
router.post('/upload-profile-image', upload.single('image'), uploadProfileImage);
router.put('/profile', updateProfile);

module.exports = router;

