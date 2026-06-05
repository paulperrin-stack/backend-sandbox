const { Router } = require('express');
const ctrl = require('../controllers/author.controller');
const { validateName, validateId } = require('../middleware/validate');

const router = Router();

router.get('/',                         ctrl.getAll);
router.get('/:id',      validateId,     ctrl.getOne);
router.post('/',        validateName,   ctrl.create);
router.delete('/:id',   validateId,     ctrl.remove);

module.exports = router;