const express = require('express');
const app = express();
const router = require('./router');
const bp = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoDB = require('./mongo');
const { checkScope } = require('./middleware/AuthMiddleware');

mongoDB.mongodb.once('open', (_) => {
  console.log('Mongo Conectado');
});

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
app.locals.checkScope = checkScope;

app
  .use(bp.json())
  .use(bp.urlencoded({ extended: true }))
  .use(router);

app.listen(process.env.SERVER_PORT, () => {
  console.log('server started');
});