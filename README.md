# Vue-Reading-node
Vue电子书管理后台——node后端

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

### Nginx服务器搭建
1. 添加当前登录用户为owner
```
user smlz owner;
```
2. 在结尾打括号之前添加：
```
include /Users/smlz/upload/upload.conf;
```
3. 添加`/Users/smlz/upload/upload.conf`
```
server
{ 
  charset utf-8;
  listen 8089;
  server_name myhost;
  root /Users/sam/upload/;
  autoindex on;
  add_header Cache-Control "no-cache, must-revalidate";
  location / { 
    add_header Access-Control-Allow-Origin *;
  }
}
```
4. 下载`switchHosts!`，进行设置
```
# SwitchHosts!

# My hosts
127.0.0.1	myhost
```
