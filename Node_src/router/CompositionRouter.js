const router = require('express').Router();
const CompositionController = require('../controller/CompositionController');

router.post('/', CompositionController.createComposition);
router.get('/:id', CompositionController.getCompositionById);
router.get('/', CompositionController.getComposition);
router.put('/:id', CompositionController.updateComposition);
router.delete('/:id', CompositionController.deleteComposition);

module.exports = router;
