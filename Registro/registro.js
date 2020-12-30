'use strict'

const port = process.env.PORT || 3009;

const https = require('https');
const fs = require('fs');

const PassService = require('./services/pass.service');
const TokenService = require('./services/token.service');
const moment = require('moment');

const OPTIONS_HTTPS = {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem')
};

const express = require ('express');
const logger = require('morgan');
const mongojs = require ('mongojs');


const app = express();

const usuario = {
    nombre: ' ',
    email: ' ',
    password: ' '
};

var db = mongojs('mongodb+srv://dbAaron:conaman6@cluster0.5i3ll.mongodb.net/usuarios?retryWrites=true&w=majority');         //Conectamos con la DB 
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
const coleccion = db.collection("Usuarios");
//Declaramos nuestro middleware de autorización
function auth (req, res, next) {
    if (!req.headers.authorization) {
        res.status(401).json({
            result: 'KO',
            mensaje: "No se ha enviado el token  tipo Bearer en la cabecera Authorization."
        });
        return next(new Error("Falta token de autorización"));
    }

    console.log(req.headers.authorization);
    if(req.headers.authorization.split(" ")[1] === "MITOKEN123456789") {
        return next();
    }

    res.status(401).json({
        result:'KO',
        mensaje: "Acceso no autorizado a este servicio."
    });

    return next(new Error("Acceso no autorizado."));
}


// app.put('/api/:colecciones', (req, res, next) => {
//     const queColeccion = req.params.colecciones;
//     let Datos = req.body;
//     const miPass = req.body.password;
    
//     const nuevosDatos ={
//         email: req.body.email,
//         password: req.body.password,
//         UltimoLogin: moment().unix()
//     }
//     PassService.encriptaPassword( Datos.password )
//         .then( hash => {
//             Datos.password = hash;
//             console.log(miPass);
//             console.log(hash);
//             //Verificamos el password
//             PassService.comparaPassword(miPass, hash)
//                 .then( isOk => {
//                     if (isOk) {
//                         req.collection.update(
//                             { email:  Datos.email},
//                             { $set: nuevosDatos },
//                             { safe: true, multi: false},
//                             (err, resultado) => {
//                                 if (err) return next(err);
                    
//                                 //console.log(resultado);
//                                 res.json({
//                                     result: 'ok',
//                                     coleccion: queColeccion,
//                                     resultado: resultado
//                                 });
//                             }
//                         );
//                     }
//                     else{
//                         res.status(401).json({
//                             result: 'KO',
//                             mensaje: 'inicio de sesion incorrecto, comprobar valores'
//                         });
//                     }
//                 })
//                 .catch(err => console.log (err));
//         });
//     });


app.post('/api/:colecciones', (req,res, next) => {
    const nuevoElemento = req.body;
    const queColeccion = req.params.colecciones;
    let usuario = {
        nombre: req.body.nombre,
        email: req.body.email,
        password: req.body.password,
        token: ''
    };
    usuario.token = TokenService.creaToken(usuario);
    usuario.password = PassService.encriptaPassword( nuevoElemento.password )
    .then( hash => {
        usuario.password = hash;
    });

    db.collection(queColeccion).save(usuario, (err, elementoGuardado) => {
        if (err) return next(err);

        console.log(elementoGuardado);

        res.status(201).json({
            result:'ok',
            coleccion: queColeccion,
            elemento: usuario,
            token: usuario.token
        });
        
    });
});

app.get('/api/Usuarios', (req, res, next) => {

    const queEmail = req.query.email;

        coleccion.findOne({email: queEmail},(err, elemento) => {
            if (err) return next(err);

            res.json({
                Elemento: elemento
            });
        });
});

app.put('/api/Usuarios', (req, res, next) => {

    let elementoNuevo = req.body;

    coleccion.update(
            {email: elementoNuevo.email}, 
            {$set: elementoNuevo}, 
            {safe: true, multi: false}, 
            (err, elementoModif) => {
                if(err) return next(err);

                res.json({
                    result: 'OK',
                    coleccion: 'Usuarios',
                    resultado: elementoModif
                });
        });

});


https.createServer( OPTIONS_HTTPS, app).listen(port, () => {
    console.log(`SECURE WS API REST Registro con DB ejecutandose en https://localhost:${port}/api/:colecciones/:id`);
});