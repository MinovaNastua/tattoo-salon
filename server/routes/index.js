const Router = require('express').Router;
const router = new Router();

router.use('/admins', require('./adminRouter'));
router.use('/blogposts', require('./blogPostRouter'));
router.use('/bookings', require('./bookingRouter'));
router.use('/masters', require('./masterRouter'));
router.use('/notifications', require('./notificationRouter'));
router.use('/portfolioPhotos', require('./portfolioPhotoRouter'));
router.use('/reviews', require('./reviewRouter'));
router.use('/sketches', require('./sketchRouter'));
router.use('/users', require('./userRouter'));

module.exports = router;