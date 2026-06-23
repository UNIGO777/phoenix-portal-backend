const router = require('express').Router();
const bulkController = require('../controllers/bulkController');
const { authenticate, adminOnly } = require('../middleware/auth');
const { uploadExcel } = require('../middleware/upload');

// All bulk routes are admin only
router.use(authenticate, adminOnly);

router.get('/template', bulkController.downloadTemplate);
router.post('/import', uploadExcel.single('file'), bulkController.importBusinesses);
router.put('/update', bulkController.bulkUpdate);
router.delete('/delete', bulkController.bulkDelete);
router.patch('/activate', bulkController.bulkActivate);
router.patch('/deactivate', bulkController.bulkDeactivate);
router.patch('/featured', bulkController.bulkFeatured);

module.exports = router;
