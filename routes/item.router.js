const { Router } = require('express');
const ctrl = require('../controllers/item.controller');
const { validateName, validateId } = require('../middleware/validate');

const router = Router();

router.get('/',                                     ctrl.getAll);
router.get('/:id',      validateId,                 ctrl.getOne);
router.post('/',        validateName,               ctrl.create);
router.put('/:id',      validateId, validateName,   ctrl.update);
router.delete('/:id',   validateId,                 ctrl.remove);

module.exports = router;