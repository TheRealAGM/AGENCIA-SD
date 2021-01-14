'use strict'

const port = process.env.PORT || 3100;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const URL_coches = 'https://localhost:3001/api/Coches';
const URL_VUELOS = 'https://localhost:3002/api/Vuelos'; 
const URL_HOTELES = 'https://localhost:3003/api/Hoteles'; 
const URL_TRANSACCIONES = 'https://localhost:3004/api/Transacciones';
const URL_USUARIOS = 'https://localhost:3009/api/Usuarios';

const https = require('https');
const fs = require('fs');

const TokenService = require('./services/token.service');
const PassService = require('./services/pass.service');
const moment = require ('moment');

const OPTIONS_HTTPS = {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem')
};

const express = require('express');  
const logger = require('morgan');
const fetch = require('node-fetch');
const app = express();


//Declaracion de los Middlewares
app.use(logger('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());


//Middleware para la autorización (seguridad)
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
//Declaramos rutas y controladores
//Devuelve las colecciones(tablas) de la BD
/*app.get('/api', (req, res, next) => {
    const queURL = `${URL_WS}`;
    
    fetch(queURL)
        .then(resp => resp.json())
            .then(json => {
            //LOGICA DE NEGOCIO
            res.json({
                result: json.result,
                colecciones: json.colecciones
            });
    });
});*/

//Mostrar todos los elementos de una determinada tabla
//al crear un elemento por primera vez en una tabla la 
//tabla se crea automáticamente sin necesidad de haberla
//creado antes
app.get('/api/coches', (req, res, next) => {
    const queCiudad = req.query.Ciudad;
    const parametros = req.query;
    let queURL;
    if(JSON.stringify(parametros) == '{}'){
         queURL = `${URL_coches}`;
    }else{
        queURL = `${URL_coches}?Ciudad=${queCiudad}`;
    }

    fetch(queURL)
        .then(resp => resp.json())
            .then(json => {
            //LOGICA DE NEGOCIO
            res.json({
                result: json.result,
                colecciones: 'coches',
                elementos: json.elementos
            });
    });
});

app.get('/api/vuelos', (req, res, next) => {
    const queOrigen = req.query.Origen;
    const queDestino = req.query.Destino;
    const parametros = req.query;
    let queURL;
    if(JSON.stringify(parametros) == '{}'){
         queURL = `${URL_VUELOS}`;
    }else{
        queURL = `${URL_VUELOS}?Origen=${queOrigen}&Destino=${queDestino}`;
    }

    fetch(queURL)
        .then(resp => resp.json())
            .then(json => {
            //LOGICA DE NEGOCIO
            res.json({
                result: json.result,
                colecciones: 'vuelos',
                elementos: json.elementos
            });
    });
});

app.get('/api/hoteles', (req, res, next) => {
    const queCiudad = req.query.Ciudad;
    const parametros = req.query;
    let queURL;
    if(JSON.stringify(parametros) == '{}'){
         queURL = `${URL_HOTELES}`;
    }else{
        queURL = `${URL_HOTELES}?Ciudad=${queCiudad}`;
    }
    

    fetch(queURL)
        .then(resp => resp.json())
            .then(json => {
            //LOGICA DE NEGOCIO
            res.json({
                result: json.result,
                colecciones: 'hoteles',
                elementos: json.elementos
            });
    });
});



//Devolver un elemento concreto de una tabla concreta
app.get('/api/coches/:id', (req, res, next) => {
    const queId = req.params.id
    const queURL = `${URL_coches}/${queId}`;
    console.log(queId);
    fetch(queURL)
        .then(resp => resp.json())
            .then(json => {
            //LOGICA DE NEGOCIO
            res.json({
                result: json.result,
                coleccion: 'coches',
                elementos: json.elemento
            });
    });
});

app.get('/api/vuelos/:id', (req, res, next) => {
    const queId = req.params.id
    const queURL = `${URL_VUELOS}/${queId}`;

    fetch(queURL)
        .then(resp => resp.json())
            .then(json => {
            //LOGICA DE NEGOCIO
            res.json({
                result: json.result,
                coleccion: 'vuelos',
                elementos: json.elemento
            });
    });
});

app.get('/api/hoteles/:id', (req, res, next) => {
    const queId = req.params.id
    const queURL = `${URL_HOTELES}/${queId}`;

    fetch(queURL)
        .then(resp => resp.json())
            .then(json => {
            //LOGICA DE NEGOCIO
            res.json({
                result: json.result,
                coleccion: coches,
                elementos: json.elemento
            });
    });
});


app.post('/api/coches', auth, (req, res, next) => {
    const nuevoElemento = req.body;
    const queToken = req.headers.authorization.split(" ")[1];;
    const queURL = `${URL_coches}`;

    fetch(queURL,{
            method: 'POST',
            body: JSON.stringify(nuevoElemento),
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${queToken}`
            }
        })
        .then(resp => resp.json())
            .then(json => {
            //LOGICA DE NEGOCIO
            res.json({
                result: json.result,
                coleccion: 'coches',
                elementos: json.elemento
            });
    });
});

app.post('/api/vuelos', auth, (req, res, next) => {
    const nuevoElemento = req.body;
    const queToken = req.headers.authorization.split(" ")[1];;
    const queURL = `${URL_VUELOS}`;

    fetch(queURL,{
            method: 'POST',
            body: JSON.stringify(nuevoElemento),
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${queToken}`
            }
        })
        .then(resp => resp.json())
            .then(json => {
            //LOGICA DE NEGOCIO
            res.json({
                result: json.result,
                coleccion: json.coleccion,
                elementos: json.elemento
            });
    });
});

app.post('/api/hoteles', auth, (req, res, next) => {
    const nuevoElemento = req.body;
    const queToken = req.headers.authorization.split(" ")[1];;
    const queURL = `${URL_HOTELES}`;

    fetch(queURL,{
            method: 'POST',
            body: JSON.stringify(nuevoElemento),
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${queToken}`
            }
        })
        .then(resp => resp.json())
            .then(json => {
            //LOGICA DE NEGOCIO
            res.json({
                result: json.result,
                coleccion: 'hoteles',
                elementos: json.elemento
            });
    });
});

app.post('/api/Registro', (req, res, next) => {
    const nuevoElemento = req.body;
    //const queToken = req.params.token;
    const queURL = `${URL_USUARIOS}`;

    fetch(queURL,{
            method: 'POST',
            body: JSON.stringify(nuevoElemento),
            headers: {
                'Content-Type' : 'application/json',
            }
        })
        .then(resp => resp.json())
            .then(json => {
            //LOGICA DE NEGOCIO
            res.json({
                result: json.result,
                coleccion: 'usuarios',
                elementos: json.elemento,
            });
    });
});

app.post('/api/transacciones/reservarCoche/:id', auth, (req, res, next) => {
    const queID = req.params.id;
    const queToken = req.headers.authorization.split(" ")[1];;
    let queURL = `${URL_TRANSACCIONES}/comenzarTransaccion`;
    const elemento = {
        Estado_Transaccion: 'Inicio',
        Inicio: moment().unix(),
        Elemento: queID
    }

    console.log(queID)
    fetch(queURL,{
            method: 'POST',
            body: JSON.stringify(elemento),
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${queToken}`
            }
        })
        .then(resp => resp.json())
            .then(eljson => {
                console.log(eljson)
                queURL = `${URL_TRANSACCIONES}/prereservarCoche`;
                fetch(queURL, {
                            method: 'PUT',
                            body: JSON.stringify(eljson.result),
                            headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${queToken}`                                   
                                    }
                            })
                .then(res => res.json())
                .then(mijson => {
                    queURL = `${URL_TRANSACCIONES}/pagarCoche`;
        
                    fetch(queURL, {
                                    method: 'PUT',
                                    body: JSON.stringify(mijson.result),
                                    headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${queToken}`                                   
                                            }
        
                                   })
                    .then(res => res.json())
                    .then (mijson => {
                        if(mijson.result.Estado_Final == 'Coche Reservado')
                        {
                            res.status(200).json(
                                {
                                    result: 'Reserva realizada correctamente',
                                    transaccion: mijson.result
                                }
                            )
                        }
                        else
                        {
                            res.status(400).json(
                                {
                                    result: 'Error al realizar la reserva',
                                    transaccion: mijson.result
                                }
                            )
                        }
                    });
                });
            });
});

app.post('/api/transacciones/reservarVuelo/:id', auth, (req, res, next) => {
    const queID = req.params.id;
    const queToken = req.headers.authorization.split(" ")[1];;
    let queURL = `${URL_TRANSACCIONES}/comenzarTransaccion`;
    const elemento = {
        Estado_Transaccion: 'Inicio',
        Inicio: moment().unix(),
        Elemento: queID
    }


    fetch(queURL,{
            method: 'POST',
            body: JSON.stringify(elemento),
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${queToken}`
            }
        })
        .then(resp => resp.json())
            .then(eljson => {
                queURL = `${URL_TRANSACCIONES}/prereservarVuelo`;
                fetch(queURL, {
                            method: 'PUT',
                            body: JSON.stringify(eljson.result),
                            headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${queToken}`                                   
                                    }
                            })
                .then(res => res.json())
                .then(mijson => {
                    queURL = `${URL_TRANSACCIONES}/pagarVuelo`;
        
                    fetch(queURL, {
                                    method: 'PUT',
                                    body: JSON.stringify(mijson.result),
                                    headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${queToken}`                                   
                                            }
        
                                   })
                    .then(res => res.json())
                    .then (mijson => {
                        if(mijson.result.Estado_Final == 'Vuelo Reservado')
                        {
                            res.status(200).json(
                                {
                                    result: 'Reserva realizada correctamente',
                                    transaccion: mijson.result
                                }
                            )
                        }
                        else
                        {
                            res.status(400).json(
                                {
                                    result: 'Error al realizar la reserva',
                                    transaccion: mijson.result
                                }
                            )
                        }
                    });
                });
            });
});

app.post('/api/transacciones/reservarHotel/:id', auth, (req, res, next) => {
    const queID = req.params.id;
    const queToken = req.headers.authorization.split(" ")[1];;
    let queURL = `${URL_TRANSACCIONES}/comenzarTransaccion`;
    const elemento = {
        Estado_Transaccion: 'Inicio',
        Inicio: moment().unix(),
        Elemento: queID
    }


    fetch(queURL,{
            method: 'POST',
            body: JSON.stringify(elemento),
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${queToken}`
            }
        })
        .then(resp => resp.json())
            .then(eljson => {
                queURL = `${URL_TRANSACCIONES}/prereservarHotel`;
                fetch(queURL, {
                            method: 'PUT',
                            body: JSON.stringify(eljson.result),
                            headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${queToken}`                                   
                                    }
                            })
                .then(res => res.json())
                .then(mijson => {
                    queURL = `${URL_TRANSACCIONES}/pagarHotel`;
        
                    fetch(queURL, {
                                    method: 'PUT',
                                    body: JSON.stringify(mijson.result),
                                    headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${queToken}`                                   
                                            }
        
                                   })
                    .then(res => res.json())
                    .then (mijson => {
                        if(mijson.result.Estado_Final == 'Hotel Reservado')
                        {
                            res.status(200).json(
                                {
                                    result: 'Reserva realizada correctamente',
                                    transaccion: mijson.result
                                }
                            )
                        }
                        else
                        {
                            res.status(400).json(
                                {
                                    result: 'Error al realizar la reserva',
                                    transaccion: mijson.result
                                }
                            )
                        }
                    });
                });
            });
});

app.put('/api/coches/:id', auth, (req, res, next) => {
    const nuevosDatos = req.body;
    const queId = req.params.id;
    const queURL = `${URL_coches}/${queId}`;
    const queToken = req.headers.authorization.split(" ")[1];

    fetch(queURL, {
        method: 'PUT',
        body: JSON.stringify(nuevosDatos),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${queToken}`
        }
    }).then(resp => resp.json()).then(json => {
        res.json({
            result: 'OK',
            colecciones: 'coches',
            resultados: json.result
        });
    });
});

app.put('/api/vuelos/:id', auth, (req, res, next) => {
    const nuevosDatos = req.body;
    const queId = req.params.id;
    const queURL = `${URL_VUELOS}/${queId}`;
    const queToken = req.headers.authorization.split(" ")[1];;

    fetch(queURL, {
        method: 'PUT',
        body: JSON.stringify(nuevosDatos),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${queToken}`
        }
    }).then(resp => resp.json()).then(json => {
        res.json({
            result: 'OK',
            colecciones: 'vuelos',
            resultados: json.result
        });
    });
});

app.put('/api/hoteles/:id', auth, (req, res, next) => {
    const nuevosDatos = req.body;
    const queId = req.params.id;
    const queURL = `${URL_HOTELES}/${queId}`;
    const queToken = req.headers.authorization.split(" ")[1];;

    fetch(queURL, {
        method: 'PUT',
        body: JSON.stringify(nuevosDatos),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${queToken}`
        }
    }).then(resp => resp.json()).then(json => {
        res.json({
            result: 'OK',
            colecciones: 'hoteles',
            resultados: json.result
        });
    });
});

app.put('/api/usuarios', (req, res, next) => {
    const queURL = `${URL_USUARIOS}?email=${req.body.email}`;

    fetch(queURL)
    .then( res => res.json() )
    .then( mijson => {

        if(mijson.Elemento == null)
        {
            res.status(400).json({
                result: 'Error en el inicio de sesion'
            })
        }
        else
        {
            
            let elemento = 
                {
                    email: mijson.Elemento.email,
                    password: mijson.Elemento.password,
                    token: mijson.Elemento.token,
                    lastLogin: moment().unix()
                }

                //console.log(elemento);
                const queToken = mijson.Elemento.token;
                const queURL2 = `${URL_USUARIOS}`;
            PassService.comparaPassword(req.body.password, elemento.password)
            .then(isOk => {
                if(isOk) {
                    fetch(queURL2, {
                        method: 'PUT',
                        body: JSON.stringify(elemento),
                        headers: {
                            'Content-Type': 'application/json',
                                }

                        })
                    .then( resp => resp.json() )
                    .then( otrojson => {
                                res.json({
                                result: 'OK',
                                token: queToken
                                });
                    });

                }
                else{
                    res.status(400).json({
                        result: 'Error en el incio de sesion'
                    })
                }
            });
        }
    });
    // const queURL = `${URL_USUARIOS}`;
    // const elemento = req.body;

    // fetch(queURL,{
    //     method: 'PUT',
    //     body: JSON.stringify(elemento),
    //     headers: {
    //         'Content-Type' : 'application/json',
    //     }
    // })
    //     .then(resp => resp.json())
    //         .then(json => {
    //         //LOGICA DE NEGOCIO
    //         res.json({
    //             result: json.result,
    //             colecciones: json.colecciones,
    //             elementos: json.resultado
    //         });
    // });
});


app.delete('/api/coches/:id', auth, (req, res, next) => {
    const queToken = req.headers.authorization.split(" ")[1];;
    const queId = req.params.id;
    const queURL = `${URL_coches}/${queId}`;

    fetch(queURL, {
            method: 'DELETE',
            body: queId,
            headers: {
                'Authorization' : `Bearer ${queToken}`
            }
        })
        .then(resp => resp.json())
            .then(json => {
            //LOGICA DE NEGOCIO
            res.json({
                result: json.result,
                coleccion: 'coches',
                elementos: json.elemento
            });
    });
});

app.delete('/api/vuelos/:id', auth, (req, res, next) => {
    const queToken = req.headers.authorization.split(" ")[1];;
    const queId = req.params.id;
    const queURL = `${URL_VUELOS}/${queId}`;

    fetch(queURL, {
            method: 'DELETE',
            body: queId,
            headers: {
                'Authorization' : `Bearer ${queToken}`
            }
        })
        .then(resp => resp.json())
            .then(json => {
            //LOGICA DE NEGOCIO
            res.json({
                result: json.result,
                coleccion: 'vuelos',
                elementos: json.elemento
            });
    });
});

app.delete('/api/hoteles/:id', auth, (req, res, next) => {
    const queToken = req.headers.authorization.split(" ")[1];;
    const queId = req.params.id;
    const queURL = `${URL_HOTELES}/${queId}`;

    fetch(queURL, {
            method: 'DELETE',
            body: queId,
            headers: {
                'Authorization' : `Bearer ${queToken}`
            }
        })
        .then(resp => resp.json())
            .then(json => {
            //LOGICA DE NEGOCIO
            res.json({
                result: json.result,
                coleccion: 'hoteles',
                elementos: json.elemento
            });
    });
});

https.createServer(OPTIONS_HTTPS, app).listen(port, () => {
    console.log(`WS API-GW ejecutándose en https://localhost:${port}/api/:colecciones/:id`);
});