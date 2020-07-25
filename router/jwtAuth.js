const expressJwt = require('express-jwt')
const {PRIVATE_KEY} = require('../util/constant')

const jwtAuth = expressJwt({
    secret:PRIVATE_KEY,
    algorithms:['HS256'],
    credentialsRequired:true // false就不进行校验了
}).unless({
    path:[
        '/',
        '/user/login'
    ]
    // 设置jwt白名单 白名单不需要进行token认证
})

module.exports = jwtAuth