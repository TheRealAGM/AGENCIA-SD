'use strict'

const port = process.env.PORT || 3004;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const https = require('https');
const fs = require('fs');

const OPTIONS_HTTPS = {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem')
};

const express = require ('express');
const logger = require('morgan');
const mongojs = require ('mongojs');
const fetch = require('node-fetch');

const app = express();

const TokenService = require('./services/token.service');

const URL_coches = 'https://localhost:3001/api/Coches';
const URL_VUELOS = 'https://localhost:3002/api/Vuelos'; 
const URL_HOTELES = 'https://localhost:3003/api/Hoteles'; 
const URL_PAGOS = 'https://localhost:3008/api/Pago'

var db = mongojs('mongodb+srv://dbAaron:conaman6@cluster0.5i3ll.mongodb.net/transacciones?retryWrites=true&w=majority');         //Conectamos con la DB 
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

const coleccion = db.collection("Transacciones");

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


app.get('/api/:colecciones', (req, res, next) => {
    const queColeccion = req.params.colecciones;

    req.collection.find((err, elementos) => {
        if (err) return next(err);

        console.log(elementos);
        res.json({
            result:'ok',
            colecciones: queColeccion, 
            elementos: elementos
        });
    });
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


// app.post('/api/:colecciones/reservarCoche/:id', auth, (req,res, next) => {
//     const idElemento = req.params.id;
//     const queColeccion = req.params.colecciones;
//     let elemento = 
//     {
//         Estado_Transaccion: 'Comienzo',
//         Inicio: momento().Unix(),
//         Elemento: idElemento,
//         EstadoElemento: 'prereserva',
//         Pago: 'Pendiente'

//     };

//     db.collection(queColeccion).save(elemento, (err, elementoGuardado) =>{
//         if(err) return next(err);
//     });

//     const elemento2 = 
//     {
//         Estado: 'prereserva'
//     }
//     let queURL = `${URL_coches}/${idElemento}`;
//     fetch(queURL, {
//                     method: 'PUT',
//                     body: JSON.stringify(elemento2),
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': Bearer `${queToken}`
//                     }

//                     }).then(resp => resp.json()).then(json => {
//                         res.json({
//                             result: json.result,
//                             coleccion: json.coleccion,
//                             elemento: json.elemento
//                         });
//                     });

// });

app.post('/api/Transacciones/comenzarTransaccion', auth, (req, res, next) => {
    let elemento = 
    { 
        Estado_Transaccion: req.body.Estado_Transaccion,
        Inicio: req.body.Inicio,
        Elemento: req.body.Elemento
    };

    //GUARDAMOS EL INICIO DE LA TRANSACCION
    coleccion.save(elemento, (err, elementoGuardado) =>{
        if(err) return next(err);
        
        elemento = req.body
        res.json({
            result: elemento
        });
    });

});

app.put('/api/Transacciones/prereservarCoche', auth, (req, res, next) => {
    let elemento = req.body;
    const idElemento = elemento.Elemento;
    console.log(elemento);
    console.log(idElemento);
    let reservado = { estado : 'prereservado'};
    let URLCoche = `${URL_coches}/${idElemento}`;
    console.log(URLCoche);
    const queToken = req.headers.authorization.split(" ")[1];

    fetch(URLCoche, {
                            method: 'PUT',
                            body: JSON.stringify(reservado),
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${queToken}`                                   
                            }

                        })
    .then( resp => resp.json() )
    elemento = {
            Estado_elemento:'El vuelo ' + idElemento +' esta en prereserva',
            Pago: 'Pendiente'
    }

    coleccion.update(
        {Inicio: req.body.Inicio}, 
        {$set: elemento}, 
        {safe: true, multi: false}, 
        (err, elementoModif) => {
            if(err) return next(err);
            
            elemento = 
            {
                Estado_Transaccion: req.body.Estado_Transaccion,
                Inicio: req.body.Inicio,
                Elemento: req.body.Elemento,
                Estado_elemento:'El vehiculo ' + idElemento +' esta en prereserva',
                Pago: 'Pendiente de pago'
            };
            res.json({
                result: elemento
            });
    });

});

app.put('/api/Transacciones/prereservarVuelo', auth, (req, res, next) => {
    let elemento = req.body;
    const idElemento = elemento.Elemento;
    let reservado = { Estado : 'prereservado'};
    let URLVuelo = `${URL_VUELOS}/${idElemento}`;
    const queToken = req.headers.authorization.split(" ")[1];

    fetch(URLVuelo, {
                            method: 'PUT',
                            body: JSON.stringify(reservado),
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${queToken}`                                   
                            }

                        })
    .then( resp => resp.json() )
    elemento = {
            Estado_elemento:'El vuelo ' + idElemento +' esta en prereserva',
            Pago: 'Pendiente'
    }

    coleccion.update(
        {Inicio: req.body.Inicio}, 
        {$set: elemento}, 
        {safe: true, multi: false}, 
        (err, elementoModif) => {
            if(err) return next(err);
            
            elemento = 
            {
                Estado_Transaccion: req.body.Estado_Transaccion,
                Inicio: req.body.Inicio,
                Elemento: req.body.Elemento,
                Estado_elemento:'El vuelo ' + idElemento +' esta en prereserva',
                Pago: 'Pendiente'
            };
            res.json({
                result: elemento
            });
    });

});

app.put('/api/Transacciones/prereservarHotel', auth, (req, res, next) => {
    let elemento = req.body;
    const idElemento = elemento.Elemento;
    let reservado = { Estado : 'prereservado'};
    let URLHotel = `${URL_HOTELES}/${idElemento}`;
    const queToken = req.headers.authorization.split(" ")[1];

    fetch(URLHotel, {
                            method: 'PUT',
                            body: JSON.stringify(reservado),
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${queToken}`                                   
                            }

                        })
    .then( resp => resp.json() )
    elemento = {
            Estado_elemento:'El hotel ' + idElemento +' esta en prereserva',
            Pago: 'Pendiente'
    }

    coleccion.update(
        {Inicio: req.body.Inicio}, 
        {$set: elemento}, 
        {safe: true, multi: false}, 
        (err, elementoModif) => {
            if(err) return next(err);
            
            elemento = 
            {
                Estado_Transaccion: req.body.Estado_Transaccion,
                Inicio: req.body.Inicio,
                Elemento: req.body.Elemento,
                Estado_elemento:'El hotel ' + idElemento +' esta en prereserva',
                Pago: 'Pendiente'
            };
            res.json({
                result: elemento
            });
    });

});

app.put('/api/Transacciones/pagarCoche', auth, (req, res, next) => {
    let elemento = req.body;
    const idElemento = req.body.Elemento;
    let reservado = { Estado : 'prereservado'};
    let URLVehiculo = `${URL_coches}/${idElemento}`;
    let URLPago = `${URL_PAGOS}`;
    const queToken = req.headers.authorization.split(" ")[1];
    

//PAGAMOS LA RESERVA
    fetch(URLPago)
    .then( resp => resp.json() )
    .then(mijson =>
    {

    console.log(req.body);
    console.log(mijson);
        if(mijson.operacion == 'Pago correcto')
        {
            reservado = { Estado : 'reservado'};
            fetch(URLVehiculo ,{ 
                        method: 'PUT',
                        body: JSON.stringify(reservado),
                        headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${queToken}`                                   
                        }
    
            })
            .then( resp => resp.json() )

            
            elemento = {
                Pago: 'Completado',
                Estado_Final: 'Coche Reservado'
            };

            coleccion.update(
                {Inicio: req.body.Inicio}, 
                {$set: elemento}, 
                {safe: true, multi: false}, 
                (err, elementoModif) => {
                    if(err) return next(err);
                    
                    elemento = {
                        Estado_Transaccion: 'Fin',
                        Inicio: req.body.Inicio,
                        Estado_elemento:  req.body.Estado_elemento,
                        Pago: 'Completado',
                        Estado_Final: 'Coche Reservado'
                    }

                    res.json({
                        result: elemento
                    });
            });
        }
        else
        {
            reservado = { Estado: 'no reservado'};

            fetch(URLVehiculo ,{ 
                        method: 'PUT',
                        body: JSON.stringify(reservado),
                        headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${queToken}`                                   
                        }
    
            })
            .then( resp => resp.json() )

            
            elemento = {
                Pago: 'Erróneo',
                Estado_Final: 'Coche Liberado'
            };

            coleccion.update(
                {InicioTiempo: req.body.InicioTiempo}, 
                {$set: elemento}, 
                {safe: true, multi: false}, 
                (err, elementoModif) => {
                    if(err) return next(err);
                    
                    elemento = {
                        Estado_Transaccion: 'Fin',
                        Inicio: req.body.Inicio,
                        Estado_elemento:  req.body.Estado_elemento,
                        Pago: 'Erróneo',
                        Estado_Final: 'Coche liberado'
                    }

                    res.json({
                        result: elemento
                    });
            });
        }
    });
});

app.put('/api/Transacciones/pagarVuelo', auth, (req, res, next) => {
    let elemento = req.body;
    const idElemento = req.body.Elemento;
    let reservado = { Estado : 'prereservado'};
    let URLVUELO = `${URL_VUELOS}/${idElemento}`;
    let URLPago = `${URL_PAGOS}`;
    const queToken = req.headers.authorization.split(" ")[1];
    

//PAGAMOS LA RESERVA
    fetch(URLPago)
    .then( resp => resp.json() )
    .then(mijson =>
    {

    console.log(req.body);
    console.log(mijson);
        if(mijson.operacion == 'Pago correcto')
        {
            reservado = { Estado : 'reservado'};
            fetch(URLVUELO ,{ 
                        method: 'PUT',
                        body: JSON.stringify(reservado),
                        headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${queToken}`                                   
                        }
    
            })
            .then( resp => resp.json() )

            
            elemento = {
                Pago: 'Completado',
                Estado_Final: 'Vuelo Reservado'
            };

            coleccion.update(
                {Inicio: req.body.Inicio}, 
                {$set: elemento}, 
                {safe: true, multi: false}, 
                (err, elementoModif) => {
                    if(err) return next(err);
                    
                    elemento = {
                        Estado_Transaccion: 'Fin',
                        Inicio: req.body.Inicio,
                        Estado_elemento:  req.body.Estado_elemento,
                        Pago: 'Completado',
                        Estado_Final: 'Vuelo Reservado'
                    }

                    res.json({
                        result: elemento
                    });
            });
        }
        else
        {
            reservado = { Estado: 'no reservado'};

            fetch(URLVehiculo ,{ 
                        method: 'PUT',
                        body: JSON.stringify(reservado),
                        headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${queToken}`                                   
                        }
    
            })
            .then( resp => resp.json() )

            
            elemento = {
                Pago: 'Erróneo',
                Estado_Final: 'Vuelo Liberado'
            };

            coleccion.update(
                {Inicio: req.body.Inicio}, 
                {$set: elemento}, 
                {safe: true, multi: false}, 
                (err, elementoModif) => {
                    if(err) return next(err);
                    
                    elemento = {
                        Estado_Transaccion: req.body.Estado_Transaccion,
                        Inicio: req.body.Inicio,
                        Estado_elemento:  req.body.Estado_elemento,
                        Pago: 'Erróneo',
                        Estado_Final: 'Vuelo liberado'
                    }

                    res.json({
                        result: elemento
                    });
            });
        }
    });
});

app.put('/api/Transacciones/pagarHotel', auth, (req, res, next) => {
    let elemento = req.body;
    const idElemento = req.body.Elemento;
    let reservado = { Estado : 'prereservado'};
    let URLHOTEL = `${URL_HOTELES}/${idElemento}`;
    let URLPago = `${URL_PAGOS}`;
    const queToken = req.headers.authorization.split(" ")[1];
    

//PAGAMOS LA RESERVA
    fetch(URLPago)
    .then( resp => resp.json() )
    .then(mijson =>
    {
        if(mijson.operacion == 'Pago correcto')
        {
            reservado = { Estado : 'reservado'};
            fetch(URLHOTEL ,{ 
                        method: 'PUT',
                        body: JSON.stringify(reservado),
                        headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${queToken}`                                   
                        }
    
            })
            .then( resp => resp.json() )

            
            elemento = {
                Pago: 'Completado',
                Estado_Final: 'Hotel Reservado'
            };

            coleccion.update(
                {Inicio: req.body.Inicio}, 
                {$set: elemento}, 
                {safe: true, multi: false}, 
                (err, elementoModif) => {
                    if(err) return next(err);
                    
                    elemento = {
                        Estado_Transaccion: 'Fin',
                        Inicio: req.body.Inicio,
                        Estado_elemento:  req.body.Estado_elemento,
                        Pago: 'Completado',
                        Estado_Final: 'Hotel Reservado'
                    }

                    res.json({
                        result: elemento
                    });
            });
        }
        else
        {
            reservado = { Estado: 'no reservado'};

            fetch(URLVehiculo ,{ 
                        method: 'PUT',
                        body: JSON.stringify(reservado),
                        headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${queToken}`                                   
                        }
    
            })
            .then( resp => resp.json() )

            
            elemento = {
                Pago: 'Erróneo',
                Estado_Final: 'Hotel Liberado'
            };

            coleccion.update(
                {Inicio: req.body.Inicio}, 
                {$set: elemento}, 
                {safe: true, multi: false}, 
                (err, elementoModif) => {
                    if(err) return next(err);
                    
                    elemento = {
                        Estado_Transaccion: req.body.Estado_Transaccion,
                        Inicio: req.body.Inicio,
                        Estado_elemento:  req.body.Estado_elemento,
                        Pago: 'Erróneo',
                        Estado_Final: 'Hotel liberado'
                    }

                    res.json({
                        result: elemento
                    });
            });
        }
    });
});

https.createServer( OPTIONS_HTTPS, app).listen(port, () => {
    console.log(`SECURE WS API REST Transacciones con DB ejecutandose en https://localhost:${port}/api/:colecciones/:id`);
});

// app.listen(port, () => {
//     console.log(`WS API REST CRUD con DB ejecutandose en http://localhost:${port}/api/:colecciones/:id`);
// });



