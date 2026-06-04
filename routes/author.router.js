const { Router } = require('express');
const ctrl = require('../controllers/author.controller');

const router = Router();

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.delete('/:id', ctrl.remove);

module.exports = router;