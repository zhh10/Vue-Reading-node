const {
    MIME_TYPE_EPUB,
    UPLOAD_PATH,
    UPLOAD_URL
} = require('./util/constant')

const fs = require('fs')
const path = require('path')
const Epub = require('./util/epub')
const xml2js = require('xml2js').parseString 

class Book{
    constructor(file,data){
        if(file){
            this.createBookFromFile(file)
        }
        else{
            this.createBookFromData(data)
        }
    }

    createBookFromFile(file){
        const {
            // 相对路径
            destination,
            // 文件名
            filename,
            // 默认值
            mimetype = MIME_TYPE_EPUB, 
            // 相对路径+文件名
            path,
            // 文件名+后缀
            originalname
        } = file
        // 后缀名 如果是application/epub+zip 后缀名就是.epub
        const suffix = mimetype === MIME_TYPE_EPUB ? '.epub':''
        // 电子书的原路径
        const oldBookPath = path 
        // 电子书的下载url
        const url = `${UPLOAD_URL}/book/${filename}${suffix}`
        // 电子书解压后的文件夹路径
        const unzipPath = `${UPLOAD_PATH}/unzip/${filename}`
        // 电子书解压后的文件夹url 
        const unzipUrl = `${UPLOAD_URL}/unzip/${filename}`
        
        if(!fs.existsSync(unzipPath)){
            // 如果不存在  新建一个文件夹
            fs.mkdirSync(unzipPath,{recursive:true})
        }
        this.filename = filename // 文件名
        this.path = `/book/${filename}${suffix}`//文件相对路径
        this.filePath = this.path 
        this.unzipPath = `/unzip/${filename}`
        this.url = url // epub文件下载连接
        this.title = '' // 书名
        this.author = '' //作者
        this.publisher = '' // 出版社
        this.contents = [] //目录
        this.contentsTree = [] // 树状目录结构
        this.cover = '' //封面图片URL 
        this.coverPath = '' //封面图片路径
        this.category = -1 //分类ID 
        this.categoryText = '' //分类名称
        this.language = '' //语言
        this.unzipUrl = unzipUrl //解压后的文件夹连接
        this.originalName = originalname //电子书文件的原名
    }

    createBookFromData(data){
        console.log(data)
    }

    parse(){
        return new Promise((resolve,reject)=>{
            // book文件链接
            const bookName = `${UPLOAD_PATH}/book/${this.filename}`
            const bookPath = `${UPLOAD_PATH}${this.filePath}`
            if(!fs.existsSync(bookName)){
                reject(new Error('电子书不存在'))
            }else{
                fs.renameSync(bookName,bookPath)
            }
            const epub = new Epub(bookPath)
            epub.on('error',err=>{
                reject(err)
            })
            epub.on('end',err=>{
                if(err){
                    reject(err)
                }else{
                    const {
                        language,
                        creator,
                        creatorFileAs,
                        title, 
                        cover,
                        publisher
                    } = epub.metadata
                    if(!title){
                        reject(new Error("图书标题为空"))
                    }else{
                        this.title = title 
                        this.language = language || 'en'
                        this.author = creator || creatorFileAs || 'unknown'
                        this.publisher = publisher || 'unknown'
                        this.rootFile = epub.rootFile
                        const handleGetImage = (err,file,mimeType)=>{
                            if(err){
                                reject(err)
                            }else{
                                const suffix = mimeType.split('/')[1]
                                const coverPath = `${UPLOAD_PATH}/img/${this.fileName}.${suffix}`
                                const coverUrl = `${UPLOAD_URL}/img/${this.fileName}.${suffix}`
                                fs.writeFileSync(coverPath,file,'binary')
                                this.coverPath = `/img/${this.fileName}.${suffix}`
                                this.cover = coverUrl
                                resolve(this)
                            }
                        }
                        try{
                            epub.getImage(cover,handleGetImage)
                        }catch(e){
                            reject(e)
                        }
                    }
                }
            })
            epub.parse()
        })
    }
}

module.exports = Book