const express = require('express');
const controllerUser = require('../controllers/controllerUser');
const authenticateToken = require('../middleware/auth');
const upload = require('../config/configMulter');

const router = express.Router();

router.patch('/api/user/edit-profile', authenticateToken, upload.single('profilePicture'), controllerUser.editUser);
router.delete('/api/user/delete-profile', authenticateToken, controllerUser.deleteUser);
router.post('/api/user/verify-email', authenticateToken, controllerUser.requestEmailVerification);
router.post('/api/user/change-password', authenticateToken, controllerUser.changePassword);
module.exports = router;