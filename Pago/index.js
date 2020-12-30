'use strict'

const port = process.env.PORT || 3008;

const https = require('https');
const fs = require('fs');

const OPTIONS_HTTPS = {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem')
};

const express = require ('express');
const logger = require('morgan');
//const mongojs = require ('mongojs');

//const TokenService = require('./services/token.service');

const app = express();


//Declaramos los middleware
app.use(logger('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());


app.get('/api/Pago', (req,res, next) => {

    const porcentaje = Math.random(1,100);
    if(porcentaje > 80){
        res.json({
            result:'KO',
            operacion: 'Pago incorrecto'
        });
    }else{
        res.json({
            result: 'ok',
            operacion: 'Pago correcto'
        });
    }
});

https.createServer( OPTIONS_HTTPS, app).listen(port, () => {
    console.log(`SECURE WS API REST Pago con DB ejecutandose en https://localhost:${port}/api/:colecciones/:id`);
});

// app.listen(port, () => {
//     console.log(`WS API REST CRUD con DB ejecutandose en http://localhost:${port}/api/:colecciones/:id`);
// });



