const {
    SUCCESS_CODE,
    ERROR_CODE,
    TOKENERROR_CODE
    } = require('./util/constant.js')
// 导入CODE 

class Result{
    constructor(data,msg,options){
        this.data = null;
        if(arguments.length === 0){
            // 只有一个参数
            this.msg = '操作成功' 
        }else if(arguments.length === 1){
            this.msg = data 
        }else {
            this.data = data 
            this.msg = msg 
            if(options){
                this.options = options
            }
        }
    }

    createResult(){
        if(!this.code){
            this.code = SUCCESS_CODE
        }
        let base = {
            code:this.code,
            msg:this.msg 
        } 
        if(this.data){
            base.data = this.data
        }
        if(this.options){
            base = {...base,...this.options}
        }
        // console.log(base) 
        return base 
    }

    json(res){
        res.json(this.createResult())
    }

    success(res){
        this.code = SUCCESS_CODE
        this.json(res)
    }
    
    fail(res){
        this.code = ERROR_CODE 
        this.json(res)
    }

    jwtError(res){
        this.code = TOKENERROR_CODE
        this.json(res)
    }
}

module.exports = Result 