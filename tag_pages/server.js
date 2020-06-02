var express = require('express');
var app = express();
const port = 5000;
//setting middleware
app.use(express.static(__dirname + '/public')); //Serves resources from public folder

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
