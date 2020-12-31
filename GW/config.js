module.exports = {
    db:process.env.MONGODB||'mongodb://localhost:3100/Usuarios',
    port: process.env.PORT||3009,
    secret: 'mipalabrasecreta',
    tokenExpTmp: 7*24*60                  // 7 dias expresados en minutos
}