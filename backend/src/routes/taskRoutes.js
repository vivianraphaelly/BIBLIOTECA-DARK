const router = require('express').Router();
const taskController = require('../controllers/taskController');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

router.post('/', taskController.create);
router.get('/', taskController.getAll);
router.put('/:id', taskController.update);
router.delete('/:id', taskController.remove);

module.exports = router;
