const express = require('express')
const multer = require('multer')
const Result = require('../Result')
const {UPLOAD_PATH} = require('../util/constant')
const boom = require('boom')
const Book = require('../Book')

const router = express.Router() 

router.post('/upload',
            multer({dest:`${UPLOAD_PATH}/book`}).single('file'),
            function(req,res,next){
                if(!req.file && req.file.length === 0){
                    new Result('上传电子书失败').fail(res)
                }else{
                    // 在这里解析电子书
                    console.log(req.file)
                    const book = new Book(req.file)
                    book.parse().then(book => {
                        new Result(book,'上传电子书成功').success(res)
                    })
                }
            })

router.post('/create',function(req,res,next){

})


module.exports = router