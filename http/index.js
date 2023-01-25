import Koa from 'Koa';
import Static from 'koa-static';
import Router from 'koa-router';
import { koaBody } from 'koa-body';
import path from 'path';
import fs from 'fs';
// esm 模式不会自动注入
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = new Koa();
const router = new Router();

//中间件：设置允许跨域
app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    await next();
});
// 支持格式
app.use(koaBody({
    // 支持文件格式
    multipart: true,
    formidable: {
      multipart: true,
      // 保留文件扩展名
      keepExtensions: true,
      onFileBegin: (name, file) => {
        const [fileName, index] = name.split('*');// formData的第一个参数
        const dir = path.join(__dirname, fileName);
        const staticDir = path.join(__dirname, 'static'); // 用来存放静态文件的
        if (!fs.existsSync(dir)) { // 检查文件夹是否存在，不存在新建
            fs.mkdirSync(dir);
        }
        if (!fs.existsSync(staticDir)) {
            fs.mkdirSync(staticDir);
        }
        file.filepath = `${dir}/${index}`; // 修改上传路径
      }
    }
}));

// koa-router  通过koa-body已经写入文件
router.post('/upload', (ctx)=> {
    // const { file } = ctx.request.files;
    const { hash, fileName, index } = ctx.request.body;
    // const fileReader = fs.createReadStream(file.filepath); // 读取文件流;
    // const chunksPath = path.join(__dirname) + `/${fileName}`; // 存放切片地址的目录
    // if (!fs.existsSync(chunksPath)) { // 不存在新建
    //     fs.mkdirSync(chunksPath)
    // }
    // let filePath = path.join(__dirname) + `/${fileName}/${index}`;
    // const upStream = fs.createWriteStream(filePath);
    // // 可读流通过管道写入可写流
    // fileReader.pipe(upStream);
    ctx.body = {
        status: 200,
        index
    }
})

// 合并所有上传的内容
router.post('/merge', async (ctx) => {
    const { fileName, size } = JSON.parse(ctx.request.body);
    const dir = path.join(__dirname, fileName); // 获取到当前文件的切片目录
    const chunkPaths = fs.readdirSync(dir); // 读取切片目录，获取到所以文件
    const filePath = path.join(__dirname, `static/${fileName}`); // 写入的文件地址
    if (chunkPaths.length) {
        chunkPaths.sort((a, b) => a - b); // 排序，防止错位
        // 并联模式
        // await Promise.all(
        //     chunkPaths.map((chunkPath, index) =>
        //       {
        //         return pipeStream(
        //             path.resolve(dir, chunkPath), // 单个文件路径
        //             // 指定位置创建可写流
        //             fs.createWriteStream(filePath, {
        //               start: index * size,
        //               end: (index + 1) * size
        //             })
        //         )
        //       }
        //     )
        // );
        // 串行模式
        await new Promise((resolve) => {
           strandStream(chunkPaths, fs.createWriteStream(filePath), dir, ()=> {
              resolve()
           })
        })
        // 合并后删除保存切片的目录
        fs.rmdirSync(dir); // 需要优化，如果内部文件没有删除完毕
    };
    // 返回值
    ctx.body = {
        status: 200,
        message: '合并成功'
    }
})

// 串行模式 chunkPaths 所有文件  writeStream写入流 
const strandStream = (chunkPaths, writeStream, dir, fn) => {
    if (!chunkPaths.length) {
        fn();
        return writeStream.close(); // 最后关闭可写流，防止内存泄漏
    }
    const filePath = path.resolve(dir, chunkPaths.shift())
    const currentReadStream = fs.createReadStream(filePath); // 获取当前的可读流
    currentReadStream.pipe(writeStream, { end: false });
    currentReadStream.on('end', ()=> {
        fs.unlinkSync(filePath); // fs.unlinkSync()方法用于从文件系统中同步删除文件或符号链接
        strandStream(chunkPaths, writeStream, dir, fn); // 递归
    });
    currentReadStream.on('error', (error)=> { // 监听错误事件，关闭可写流，防止内存泄漏
        writeStream.close();
    });
}

// 通过管道处理流 并发模式 Stream 合并
const pipeStream = (path, writeStream) => {
  return new Promise(resolve => {
    const readStream = fs.createReadStream(path); // 读取到chunk的文件内容
    readStream.pipe(writeStream); // 并写入到 filePath中，指定位置
    readStream.on("end", () => {
      fs.unlinkSync(path); // fs.unlinkSync()方法用于从文件系统中同步删除文件或符号链接
    });
    readStream.on('error', (error) => {
      console.log('读取错误', error.message);
    })
    writeStream.on('error', (error) => {
      console.log('写入错误', error.message);
    })
    writeStream.on("finish", ()=> {
        resolve();
    })
  });
}

// router.get('/home',(ctx,next)=>{ 
//     ctx.body = 'home'
//     next();
//   });

// 无 koa-router
// app.use((ctx, next) => {
//     if (ctx.path === '/home' && ctx.method === 'GET') {
//         ctx.body = 'home'
//    } else {
//         next();
//    }
// })



app.listen(3000, function () {
    console.log('======================================================================');
    console.log('======================================================================');
});

// app.use(Static('./'));
app.use(router.routes());
app.use(router.allowedMethods());