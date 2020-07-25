const express = require('express')
const Result = require('../Result')
const {body,validationResult} = require('express-validator')
const {login,findUser} = require("../service/user")
const {decode,md5} = require('../util/index.js')
const {PWD_SALT,PRIVATE_KEY,JWT_EXPIRED} = require('../util/constant.js')
const jwt = require('jsonwebtoken')

const router = express.Router() 

router.post('/login',
    [
        body('username').isString().withMessage('用户名必须为字符串'),
        body('password').isNumeric().withMessage('密码必须为数字')
    ],
    (req,res,next)=>{
        const err = validationResult(req) 
        // 如果err是[]，说明无错误
        if(!err.isEmpty()){
            const [{msg}] = err.errors 
            next(boom.badRequest(msg))
        }else{
            let {username,password} = req.body 
            // 对密码进行md5加密处理 
            password = md5(`${password}${PWD_SALT}`)
     
            // 进行查找
            login(username,password).then(user => {
                if(!user || user.length === 0){
                    //   找不到用户 
                    new Result('登录失败').fail(res)
                }else{
                    // 找到用户 根据用户名字设置一个token 返回给前端
                    const token = jwt.sign({username},PRIVATE_KEY,{expiresIn:JWT_EXPIRED})

                    new Result({token},'登录成功').success(res)
                }
            })
            
        }
    }
)

// 查找用户
router.get('/info',(req,res)=>{
    // 解析token
    const decodeToken = decode(req)
    console.log(decodeToken)
    if(decodeToken && decodeToken.username){
        //    查找关于这名用户的信息
        findUser(decodeToken.username).then(user => {
            if(user){
                user.roles = [user.role] 
                new Result(user,'用户信息查询成功').success(res) 
            }else{
                new Result('用户信息查询失败').fail(res)
            }
        })
    }else{
        new Result('用户信息查询失败').fail(res)
    }
})

router.post('/logout',(req,res)=>{
    new Result('退出成功').success(res)
})

module.exports = router