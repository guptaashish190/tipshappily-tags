const express = require('express');
const morgan = require('morgan');
var cors = require('cors')
const bodyParser = require('body-parser')
const tagRouter = require('./routes/tag');
const paymentRouter = require('./routes/payments');
const userRouter = require('./routes/user');
var admin = require("firebase-admin");



const app = express();
const port = 8345;

app.use(bodyParser.json());
app.use(cors())
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('tiny'));



admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://tipshappily-b0541.firebaseio.com"
});

app.use('/tag', tagRouter);
app.use('/payments', paymentRouter);
app.use('/user', userRouter);


app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
