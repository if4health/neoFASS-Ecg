const express = require('express');
const app = express();
const session = require('express-session');
const bp = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const router = require('./router');

const mongoDB = require('./mongo');
const { checkScope } = require('./middleware/AuthMiddleware');

mongoDB.mongodb.once('open', (_) => {
  console.log('Mongo conectado');
});

app.use(session({
  secret: process.env.OAUTH_SECRET,
  resave: false,
  saveUninitialized: true,
}));

//  app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         formAction: '*',
//       },
//     },
//   })
// ); // Habilitar formAction e script-src-attr para que as views funcionem, ou mudar estrutura do front

app.use(cors());
app.use(express.static(path.join(__dirname, '../img')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use('/biofass/css', express.static(path.join(__dirname, 'views/css')));
app.use('/biofass/img', express.static(path.join(__dirname, 'views/img')));
app.locals.checkScope = checkScope;

app
  .use(bp.json())
  .use(bp.urlencoded({ extended: true }))
  .use('/biofass', router);

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Biosignal in FHIR inicializado no port ${process.env.SERVER_PORT}`);
});
