# Vue-Reading-node
Vue读书管理后台后端node

### API
#### 1. /user/login
- method:POST
- params:
  - userName
  - password
  
对密码进行md5加密，并根据用户名设置token,返回给前端

#### 2. /user/info
- method:GET 

根据请求头中的token查找用户信息

#### 3. /user/logout
- method:POST 

用户退出登录

#### 4. /book/upload
- method:POST 

上传电子书，将电子书文件存储在服务器中，并对文件进行解析，解析后的内容返回给前端，以供前端预览或修改。

#### 5. /book/create 
- method:POST 

新增电子书
