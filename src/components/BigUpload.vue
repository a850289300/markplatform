<script setup lang="ts">
import { ref } from 'vue';
// props
const props = defineProps({
  // 切片大小
  chunkSize: {
    type: Number,
    default: 1 * 1024 * 1024
  }
})
const file = ref();

// 手动触发input的click
const upload = ()=> {
    file.value.click()
}

// 选择文件
const selectFile = async (e)=> {
    const files = e.target.files;
    if (!files) return;
    const list = createFileChunk(files[0]); // 暂时仅支持单个上传
    await uploadChunk(files[0], list)
}

// 文件切片
const createFileChunk = (file) => {
    const fileChunkList = []; // 切片数据
    const size = props.chunkSize; // 单个切片大小
    let cur = 0; // 当前位置
    let index = 0;
    while( cur < file.size) {
        fileChunkList.push({
            file: file.slice(cur, cur + size),
            hash: `${file.name}-${index}`,
            index: index
        })
        cur += size;
        index++;
    }
    return fileChunkList;
}
// 切片上传
const uploadChunk = async (fileInfo: any, list: Array<any>)=> {
    const requestMap = list.map(({file, hash, index}: { file: any, hash: string, index: string })=> {
        const formData = new FormData();
        formData.append(`${fileInfo.name}*${index}`, file); // 用 * 是特殊符号，方式文件名本身自带
        formData.append("hash", hash);
        formData.append("index", index);
        formData.append("fileName", fileInfo.name);
        return request('/upload', formData, 'post')
    })
    await Promise.all(requestMap).then(()=> {
        request('/merge', JSON.stringify({
            fileName: fileInfo.name,
            size: props.chunkSize
        }), 'post')
    })
}

// 通用的 xhr 方法
const request = (url: string, data?: any, method = "post", headers?: any) => {
    return new Promise((resolve)=> {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        headers && Object.keys(headers).forEach((key) => {
            const header = headers[key];
            xhr.setRequestHeader(key, header);
        });
        xhr.send(data);
        xhr.onload = (e:any)=> {
            resolve({
                data: e.target.response
            })
        }
    })
}
</script>

<template>
  <div class="big-upload">
    <button class="upload-btn" @click="upload">上传数据</button>
    <input type="file" ref="file" @change="selectFile"/>
  </div>
</template>
<style lang="less" scoped>
.big-upload {
    display: inline-block;
    input {
        display: none;
    }
    .upload-btn {
        display: inline-block;
        margin-right: 10px;
        line-height: 1;
        height: 32px;
        white-space: nowrap;
        cursor: pointer;
        color: #606266;
        text-align: center;
        box-sizing: border-box;
        outline: 0;
        transition: .1s;
        font-weight: 500;
        user-select: none;
        vertical-align: middle;
        -webkit-appearance: none;
        background-color: #fff;
        border:1px solid #dcdfe6;
        border-color: #dcdfe6;
        padding: 8px 15px;
        font-size: 14px;
        border-radius: 4px;
        &:hover {
            border-color: #c6e2ff;
            color: #409eff;
            background-color: #ecf5ff;
            outline: 0;
        }
    }
}
</style>