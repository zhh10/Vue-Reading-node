const { querySql,queryOne } = require('../db/index.js')


// 登录 看看数据库中有没有同样的用户名和密码
function login(userName,passWord){
    // 返回的是一个Promise
    const sql = `select * from admin_user where username='${userName}' and password = '${passWord}'`
    return querySql(sql)
}

function findUser(userName){
    const sql = `select id,username,nickname,role,avatar from admin_user where username = '${userName}'`
    return queryOne(sql)
}

module.exports = {
    login,
    findUser,
}
