const express = require('express')
const multer = require('multer')
const Result = require('../Result')
const {UPLOAD_PATH} = require('../util/constant')
const boom = require('boom')
const Book = require('../Book')
const {createBook} = require('../service/book')
const {decode} = require('../util')

const router = express.Router() 

router.post('/upload',
            multer({dest:`${UPLOAD_PATH}/book`}).single('file'),
            function(req,res,next){
                if(!req.file && req.file.length === 0){
                    new Result('上传电子书失败').fail(res)
                }else{
                    // 在这里解析电子书
                    // console.log(req.file)
                    const book = new Book(req.file)
                    book.parse().then(book => {
                        new Result(book,'上传电子书成功').success(res)
                    })
                }
            })

router.post('/create',function(req,res,next){
    const decodeToken = decode(req)
    if(decodeToken && decodeToken.username){
        req.body.username = decodeToken.username
    }
    const book = new Book(null,req.body) 
    // 在这里新增电子书
    
    new Result('新增电子书成功').success(res)
})


module.exports = router