const crypto = require("crypto")
const jwt = require('jsonwebtoken')
const {PRIVATE_KEY} = require('./constant.js')

// 进行md5加密
function md5(pwd){
    return crypto.createHash('md5').update(String(pwd)).digest('hex')
}
// 进行jwt解析
function decode(req){
    let token = req.get('Authorization')
    
    if(token.indexOf('Bearer') === 0){
        token = token.replace('Bearer ','')
    }
    // 根据密钥解析token，获取用户名

    return jwt.verify(token,PRIVATE_KEY)
}

module.exports = {
    md5,
    decode
}