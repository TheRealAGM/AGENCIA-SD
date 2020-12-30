'use strict'

const port = process.env.PORT || 3001;

const https = require('https');
const fs = require('fs');

const OPTIONS_HTTPS = {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem')
};

const express = require ('express');
const logger = require('morgan');
const mongojs = require ('mongojs');

const TokenService = require('./services/token.service');

const app = express();


var db = mongojs('mongodb+srv://dbAaron:conaman6@cluster0.5i3ll.mongodb.net/coches?retryWrites=true&w=majority');         //Conectamos con la DB 
var id = mongojs.ObjectID;                      //Puntero a funcion


//Declaramos los middleware
app.use(logger('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.param("colecciones", (req,res, next, colecciones) => {
    console.log('middleware param /api/:colecciones');
    req.collection = db.collection(colecciones);
    return next();
});


//Declaramos nuestro middleware de autorización
function auth(req, res, next) {
    if(!req.headers.authorization) {
        res.status(401).json({
            result: 'KO',
            mensaje: 'No se ha enviado el token en la cabecera token'
        });
        return next(new Error("Falta token de autorización"));
    };

    const queToken = req.headers.authorization.split(" ")[1];
    TokenService.decodificaToken(queToken).then(
        userID => {
            req.user={
                userId : userID,
                token : queToken
            }
            return next();
        }
    ).catch(err => {
        res.status(401).json({
            result: 'KO',
            mensaje: 'Acceso no autorizado'
        });
        return next(new Error("Acceso no autorizado"));
    })
}

// Declaramos nuestras rutas y nuestros controladores 
app.get('/api', (req,res, next) => {
    db.getCollectionNames((err, colecciones) => {
        if(err) return next(err);   // Propagamos el error 

        console.log(colecciones);
        res.json({
            result: 'ok',
            colecciones: colecciones
        });
    });
});

app.get('/api/:colecciones', (req, res, next) => {
        const queColeccion = req.params.colecciones;
    
            let param = req.query;
        
            if(JSON.stringify(param) == '{}'){
                req.collection.find((err, elementos) => {
                    if (err) return next(err);
            
                    console.log(elementos);
                    res.json({
                        result:'ok',
                        colecciones: queColeccion, 
                        elementos: elementos
                    });
                });
            }
            else{
                const queCiudad = req.query.Ciudad;
        
                req.collection.findOne({Ciudad: queCiudad},(err, elemento) => {
                    if (err) return next(err);
        
                    //console.log(elemento);
                    res.json({
                        result: 'OK',
                        colecciones: queColeccion,
                        elemento: elemento
                    });
                });
            }
});

app.get('/api/:colecciones/:id', (req, res, next) => {
    const queColeccion = req.params.colecciones;
    const queId = req.params.id;

    req.collection.findOne({ _id: id(queId)},(err, elemento) => {
        if (err) return next(err);

        console.log(elemento);
        res.json({
            result:'ok',
            colecciones: queColeccion, 
            elemento: elemento
        });
    });
});


app.post('/api/:colecciones', auth, (req,res, next) => {
    const nuevoElemento = req.body;
    const queColeccion = req.params.colecciones;

    db.collection(queColeccion).save(nuevoElemento, (err, elementoGuardado) => {
        if (err) return next(err);

        console.log(elementoGuardado);

        res.status(201).json({
            result:'ok',
            coleccion: queColeccion,
            elemento: elementoGuardado
        });
    });
});

app.put('/api/:colecciones/:id', auth, (req, res, next) => {
    const queColeccion = req.params.colecciones;
    const nuevosDatos = req.body;
    const queId = req.params.id;

    req.collection.update(
        { _id: id(queId) },
        { $set: nuevosDatos },
        { safe: true, multi: false},
        (err, resultado) => {
            if (err) return next(err);

            console.log(resultado);
            res.json({
                result: 'ok',
                coleccion: queColeccion,
                resultado: resultado
            });
        }
    );
});

app.delete('/api/:colecciones/:id', auth, (req, res, next) => {
    const queColeccion = req.params.colecciones;
    const queId = req.params.id;

    req.collection.remove(
        { _id: id(queId) },
        (err, resultado) => {
            if (err) return next(err);

            console.log(resultado);
            res.json({
                result: 'ok',
                coleccion: queColeccion,
                elemento: queId,
                resultado: resultado
            });
        }
    );
});

https.createServer( OPTIONS_HTTPS, app).listen(port, () => {
    console.log(`SECURE WS API REST Coches con DB ejecutandose en https://localhost:${port}/api/:colecciones/:id`);
});

// app.listen(port, () => {
//     console.log(`WS API REST CRUD con DB ejecutandose en http://localhost:${port}/api/:colecciones/:id`);
// });



