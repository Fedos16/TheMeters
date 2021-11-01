const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const staticAsset = require('static-asset');

const mongoose = require('mongoose');

const config = require('./config');
const routes = require('./routes');
const models = require('./models');

const {GoogleSheets} = require('./utils');

const fs = require('fs'); 
const parse = require('csv-parser');

// database
mongoose.Promise = global.Promise;
const options = {
  socketTimeoutMS: 30000,
  keepAlive: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
}
mongoose.set('debug', config.IS_PRODUCTION);
mongoose.connection
  .on('error', error => console.log(error))
  .on('close', () => console.log('Database connection closed.'))
  .once('open', async () => {
    const info = mongoose.connections[0];
    console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
  });

mongoose.connect(config.MONGO_URL, options);

// express
const app = express();

// sets and uses
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(staticAsset(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/fonts', express.static(path.join(__dirname, 'fonts')));

// Routes
app.use('/', routes.page_routes);

app.use('/api/savedata', routes.savedata);
app.use('/api/finddata', routes.finddata);

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.render('error', {
    message: error.message,
    error: !config.IS_PRODUCTION ? error : {}
  });
});

app.listen(config.PORT, () =>
  console.log(`Example app listening on port ${config.PORT}!`)
);

// Функция парсинга CSV
async function parseCSV() {

  let start = new Date();
  let startTen = new Date();

  const schemaData = models.DataBase.schema.obj;
  const naming = {
    'carwash': 'Автомойки',
    'pharmacy': 'Аптеки',
    'atelier': 'Ателье',
    'bar': 'Бары',
    'pool': 'Бассейны',
    'fastfood': 'Быстрое питание',
    'vet': 'Ветеринарные клиники',
    'gaming': 'Игровые клубы',
    'hookah': 'Кальян-бары ',
    'beauty': 'Салоны красоты',
    'coffee': 'Кофейни',
    'flowers': 'Магазины цветов',
    'smoking': 'Магазины табака',
    'barbershop': 'Парикмахерские',
    'supermarket': 'Продуктовые магазины',
    'shoerepair': 'Ремонт обуви',
    'restaurant': 'Рестораны',
    'phone': 'Салоны связи',
    'sexshop': 'Секс-шопы',
    'sports': 'Спортзалы',
    'dentist': 'Стоматология',
    'laundry': 'Химчистки',
    'kindergarten': 'Детские сады',
  }


  await models.DataBase.remove();
  let i = 0;

  let file = path.join(__dirname, 'uploads/file.csv');
  fs.createReadStream(file)
      .pipe(parse({delimiter: ','}))
      .on('data', async function(csvrow) {
        let rowDb = {};
        let unique = {};
        let orgs = [];

        let keys = Object.keys(csvrow);
        for (let row of keys) {
          row = String(row).toLowerCase();
          if (row in schemaData) {
            rowDb[row] = csvrow[row];
          } else {
            let arrs = row.split('_');
            if (arrs.length > 1) row = arrs[1];
            if (row in naming && !(row in unique)) {
              let row_org = {};
              let estimate = `org_${row}_estimate`;
              if (estimate in csvrow) row_org[estimate] = csvrow[estimate];
              let claster_score = `org_${row}_medium_cluster_score`;
              if (claster_score in csvrow) row_org[claster_score] = csvrow[claster_score];
              let score = `org_${row}_score`;
              if (score in csvrow) row_org[score] = csvrow[score];
              let near = `org_${row}_near`;
              if (near in csvrow) row_org[near] = csvrow[near];
              let name = naming[row];
              row_org['name'] = name;
              unique[row] = 1;

              orgs.push(row_org);
              
            }
          }

        }

        if (orgs.length > 0) rowDb['organizations'] = orgs;

        await models.DataBase.create(rowDb);

        if (i % 10000 == 0) {
          console.log(`Обработано строк ${i}: ${new Date() - startTen} ms`);
          startTen = new Date();
        }
        i++

      })
      .on('end', async function() {

        console.log(`-- Полное чтение за: ${new Date() - start} ms`);
      })

  
}