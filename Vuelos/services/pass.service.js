'use strict'

const bcrypt = require('bcrypt');


// encriptaPassword
//
// Devuelve un hash con Salt incluido en formato: 
//      $2b$10$4ETs85JgZsVgxbS5C0gl4O9xNETQRmWAWxnRv4enAhVT1/AzAn0da
//      ****-- **********************+++++++++++++++++++++++++++++++
//      Alg Cost        Salt                  Hash
//
function encriptaPassword( password ){
    return bcrypt.hash(password, 10);
}

// comparaPassword
//
// Devolver verdadero o falso si coincide o no el password y el hash
//
function comparaPassword( password, hash){
    return bcrypt.compare( password, hash );
}

module.exports = {
    encriptaPassword,
    comparaPassword
};

