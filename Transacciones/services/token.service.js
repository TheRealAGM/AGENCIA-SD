'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');


const SECRET = require('../config').secret;
const EXP_TIME = require('../config').tokenExpTmp;

// creaToken
//
// Devuelve un token tipo JWT
// Formato JWT:
//      HEADER.PAYLOAD.VERIFY.SIGNATURE
// 
// Donde: 
//      HEADER ( Objeto JSON con el al....)
//          {
//              alg: ...
// ...
//      VERIFY_SIGNATURE = HMACHSHA256( base64UrlEncode(HEAD)+ "."+base64UrlEncode(PAYLOAD), SECRET)
//
function creaToken( user) {
    const payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(EXP_TIME, 'minutes').unix()
    };
    return jwt.encode( payload, SECRET );
}

// decodificaToken ( token )
// 
// devuelve el identificador del usuario
// 
function decodificaToken( token ){
    return new Promise ( (resolve, reject )  => {
        try{
            const payload = jwt.decode( token, SECRET, true);
            if (payload.exp <= moment().unix() ){
                reject( {
                    status: 401,
                    message: 'El token ha caducado'
                });
            }
            console.log ( payload );
            resolve (payload.sub);
        
        }catch {
            reject( {
                status: 500,
                message: 'El token no es válido'
            });
        }
    });
}

module.exports = {
    creaToken,
    decodificaToken
};