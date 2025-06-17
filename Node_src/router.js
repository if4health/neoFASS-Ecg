const router = require('express').Router();
const jose = require('jose');
const set_data = require('./class');

const patientRouter = require('./router/PatientRouter');
const observationRouter = require('./router/ObservationRouter');
const practitionerRouter = require('./router/PractitionerRouter');
const bundleRouter = require('./router/BundleRouter');

const authRouter = require('./router/AuthRouter');

const { verifyJWT } = require('./middleware/AuthMiddleware');

const wellKnown = require('./utils/wellKnown');
const openId = require('./utils/openId');
const metadata = require('./utils/metadata');
const { getPublicKey } = require('./utils/keys');

const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

router.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

router.use('/auth', authRouter);

router.use('/Patient', verifyJWT, patientRouter);
router.use('/Observation', verifyJWT, observationRouter);
router.use('/Practitioner', verifyJWT, practitionerRouter);
router.use('/Bundle', verifyJWT, bundleRouter);

router.get('/render', (req, res) => {
  const data = new set_data(req.query['id']);

  res.json({ res: JSON.parse(data.getShaHead()) });
});

router.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

router.get('/message', (req, res) => {
  const flash = req.session.flash;
  delete req.session.flash;

  if (!flash) {
    return res.redirect('/dashboard');
  }

  res.render('message', flash);
});

router.get('/.well-known/smart-configuration', (req, res) => {
  res.json(wellKnown);
});

router.get('/.well-known/openid-configuration', (req, res) => {
  res.json(openId);
});

router.get('/key', async (req, res) => {
  const file = await getPublicKey();
  const key = await jose.importSPKI(file.toString(), 'RS256');
  res.json(await jose.exportJWK(key));
});

router.get('/metadata', (req, res) => {
  res.json(metadata);
});

router.get('/', (req, res) => {
  res.json({ res: res.statusCode });
});

module.exports = router;
