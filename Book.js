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
        this.fileName = data.filename 
        this.cover = data.cover 
        this.title = data.title 
        this.author = data.author 
        this.publisher = data.publisher 
        this.bookId = data.fileName 
        this.language = data.language 
        this.rootFile = data.rootFile 
        this.originalName = data.originalName 
        this.path = data.path || data.filePath 
        this.filePath = data.path || data.filePath
        this.unzipPath = data.unzipPath 
        this.coverPath = data.coverPath 
        this.createUser = data.username 
        this.createDt = new Date().getTime() 
        this.updateDt = new Date().getTime() 
        this.updateType = data.updateType === 0?data.updateType : 1 
        this.category = data.category || 99 
        this.categoryText = data.categoryText || '自定义'
        this.contents = data.contents || []   
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
                                const coverPath = `${UPLOAD_PATH}/img/${this.filename}.${suffix}`
                                const coverUrl = `${UPLOAD_URL}/img/${this.filename}.${suffix}`
                                fs.writeFileSync(coverPath,file,'binary')
                                this.coverPath = `/img/${this.filename}.${suffix}`
                                this.cover = coverUrl
                                resolve(this)
                            }
                        }
                        try{
                            this.unzip()
                            this.parseContents(epub).then(({chapters,chapterTree}) => {
                                this.contents = chapters
                                this.contentsTree = chapterTree
                                epub.getImage(cover,handleGetImage)
                            })
                        }catch(e){
                            reject(e)
                        }
                    }
                }
            })
            epub.parse()
        })
    }

    unzip(){
        const AdmZip = require('adm-zip')
        const zip = new AdmZip(Book.genPath(this.path))
        zip.extractAllTo(Book.genPath(this.unzipPath),true)
    }

    parseContents(epub){
        // getNcxFilePath 
        function getNcxFilePath(){
            const spine = epub && epub.spine 
            const manifest = epub && epub.manifest
            const ncx = spine.toc && spine.toc.href 
            const id = spine.toc && spine.toc.id 
            if(ncx){
                return ncx 
            }else{
                return manifest[id].href
            }
        }
        /*
        / findParent
        */
        function findParent(array,level = 0,pid = ''){
            return array.map(item => {
                item.level = level 
                item.pid = pid 
                if(item.navPoint && item.navPoint.length > 0){
                    item.navPoint = findParent(item.navPoint,level + 1,item['$'].id)
                }else if(item.navPoint){
                    item.navPoint.level = level + 1 
                    item.navPoint.pid = item['$'].id 
                }
                return item 
            })
        }

        // flatten 
        function flatten(array){
            return [].concat(...array.map(item => {
                if(item.navPoint && item.navPoint.length > 0){
                    return [].concat(item,...flatten(item.navPoint))
                }else if(item.navPoint){
                    return [].concat(item,item.navPoint)
                }
                return item 
            }))
        }

        const ncxFilePath = Book.genPath(`${this.unzipPath}/${getNcxFilePath()}`)
        if(fs.existsSync(ncxFilePath)){
            return new Promise((resolve,reject)=>{
                const xml = fs.readFileSync(ncxFilePath,'utf-8')
                const dir = path.dirname(ncxFilePath).replace(UPLOAD_PATH,'')
                const fileName = this.filename
                const unzipPath = this.unzipPath
                xml2js(xml,{
                    explicitArray:false,
                    ignoreAttrs:false
                },function(err,json){
                    if(err){
                        reject(err)
                    }else{
                        const navMap = json.ncx.navMap 
                        if(navMap.navPoint && navMap.navPoint.length > 0){
                            
                            navMap.navPoint = findParent(navMap.navPoint)
                            
                            const newNavMap = flatten(navMap.navPoint)
                            
                             const chapters = [] 
                            newNavMap.forEach((chapter,index)=>{
                                const src = chapter.content['$'].src 
                                chapter.id = `${src}`
                                chapter.href = `${dir}/${src}`.replace(unzipPath,'')
                                chapter.text = `${UPLOAD_URL}${dir}/${src}`
                                chapter.label = chapter.navLabel.text || '' 
                                chapter.navId = chapter['$'].id 
                                chapter.fileName = fileName 
                                chapter.order = index + 1 
                                
                                chapters.push(chapter)
                            })
                    
                            const chapterTree = Book.getContentsTree(chapters)
                            
                            resolve({chapters,chapterTree})
                        }else{
                            reject(new Error("目录解析失败"))
                            }
                        }
                    })
            })
        }else{
            throw new Error("目录文件不存在")
        }
    }

    static genPath(path){
        if(!path.startsWith('/')){
            path = `/${path}`
        }
        return `${UPLOAD_PATH}${path}`
    }
    static getContentsTree(contents){
        if(contents){
            const contentsTree = [] 
            contents.forEach(c => {
                c.children = [] 
                if(c.pid === ''){
                    contentsTree.push(c)
                }else{
                    const parent = contents.find(_ => _.navId === c.pid)
                    parent.children.push(c)
                }
            })
            return contentsTree
        }
    }
}

module.exports = Book