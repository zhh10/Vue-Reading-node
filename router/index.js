const express = require('express')
const boom = require('boom')
const jwtAuth = require('./jwtAuth')
const Result = require('../Result')
const userRouter = require('./useRouter')
const bookRouter = require('./bookRouter')
// 注册路由
const router = express.Router() 
// 对所有路由进行token认证 除了白名单


router.use(jwtAuth)
// router.get('/',(req,res,next)=>{
//     res.send("欢迎光临")
// })

router.use('/user',userRouter)

router.use('/book',bookRouter)

// 处理404请求的中间件
router.use((req,res,next)=>{
    console.log(req.path)
    next(boom.notFound('接口不存在'))
})

router.use((err,req,res,next)=>{
    console.log(err) 
    if(err.name && err.name === 'UnauthorizedError'){
        //   token认证失败
        const {status=401,message} = err 
        new Result(null,'token失效',{
            error:status,
            errMsg:message 
        }).jwtError(res.status(status))
    }else{
        const msg = (err && err.message) || '系统错误'
        const statusCode = (err.output && err.output.statusCode) || 500 
        const errorMsg = (err.output && err.output.payload && err.output.payload.error) || err.message 
        new Result(null,msg,{
            error:statusCode,
            errMsg:errorMsg
        }).fail(res.status(statusCode))
    }
})

module.exports = router 
