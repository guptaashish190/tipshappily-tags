const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser')
const tagRouter = require('./routes/tag');
const paymentRouter = require('./routes/payments');
const puppeteer = require('puppeteer');

const app = express();
const port = 8345;

app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('tiny'));

app.use('/tag', tagRouter);
app.use('/payments', paymentRouter);

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
