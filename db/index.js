const mysql = require('mysql2')
const config = require('./config') 



// 查询
function querySql(sql){
    const connection = mysql.createConnection(config) 
    return new Promise((resolve,reject)=>{
        try{
            connection.query(sql,(err,result)=>{
                if(err){
                    console.log('查询失败，原因:' + JSON.stringify(err))
                    reject(err)
                }else{
                    console.log('查询成功', JSON.stringify(result))
                    resolve(result)
                }
            })
        }catch(e){
            reject(e)
        }finally{
            connection.end()
        }
    })
}

// 只查询一个
function queryOne(sql){
    const connection = mysql.createConnection(config) 
    return new Promise((resolve,reject)=>{
        querySql(sql).then(result=>{
            console.log(result)
            if(result && result.length > 0){
                resolve(result[0])
            }else{
                resolve(null)
            }
        }).catch(err => {
            reject(err)
        })
    })
}

module.exports = {
    querySql,
    queryOne
}