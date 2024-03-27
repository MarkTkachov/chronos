const express = require('express');
const controllerAuthentication = require('../controllers/controllerAuthentication');
const validateRegistrationFields = require('../middleware/validateRegistrationFields');

const router = express.Router();

router.post('/api/auth/register', validateRegistrationFields, controllerAuthentication.register);
router.get('/api/auth/verify-email', controllerAuthentication.verifyEmail);
router.post('/api/auth/refresh-token', controllerAuthentication.updateAccessToken);
router.post('/api/auth/login', controllerAuthentication.login);
router.post('/api/auth/request-password-reset', controllerAuthentication.requestPasswordReset);
router.post('/api/auth/reset-password', controllerAuthentication.resetPassword);
router.post('/api/auth/logout', controllerAuthentication.logout);
router.get('/api/auth/data-user', controllerAuthentication.getUserByAccessToken);


module.exports = router;