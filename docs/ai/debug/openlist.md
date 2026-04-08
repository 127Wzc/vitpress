---
isTimeLine: true
title: AI Debug实录:OpenList + RustFS 上传cors,403
description: 解决 OpenList 链接 RustFS S3 端点后无法上传文件的问题，涉及 Nginx 反代配置
author: Warden·Cusp
date: 2025-12-25
tag:
  - RustFS
  - OpenList
  - Nginx
  - S3
  - Debug
readingTime: true
recommend: 1
---

# OpenList + RustFS 上传问题排查

## 问题描述

OpenList链接RustFS s3端点后无法通过OpenList上传文件

### 控制台出现cors或者403等导致无法通过OpenList上传文件

![e4e3061f5efc958f02c4e9408765120c]({{PIC_URL}}/blog/content/2025/12/e4e3061f5efc958f02c4e9408765120c.jpg)

**环境信息：** (问ai前最好提前说明相关服务环境信息)

- RustFS 服务运行在 `localhost:9000` (HTTP)
- Nginx 反向代理在 `9002` 端口提供 HTTPS 访问
- 端点地址：`https://RustFS.example.com:9002`
- OpenList在别的机器：`https://alist.example.com`



## 省流总结: 

   Nginx对RustFS的反代缺少一个关键配置 proxy_redirect off
   反代实现https的时候端口冲突导致301重定向循环

> [!TIP]
>
> 问ai前最好提前说明相关服务环境信息，复盘流程会发现，如果知道Nginx做了反代可以提前让ai检查Nginx加快问题排查流程。本次排查时间主要消耗在梳理朋友机器网络环境上，ai debug还是很快的



## 问题排查流程(省略了一部分内容+信息脱敏)

> [!NOTE]
>
> 本次排查在Antigravity +  Claude Opus 4.5(Thinking) 工具下

1.先直接通过RustFS页面上传，确认RustFS服务正常。 **--确认服务正常**

2.接下来让ai编写s3端点上传，验证s3端点上传是否正常。 **--问题初显**

- **初始尝试**：使用 boto3 默认配置连接，返回 301 错误

  ```
  ~/…/github/rustf $ uv run test_upload.py
  
  Installed 7 packages in 52ms                      
  ==================================================
  🚀 RustFS S3 上传测试                                                                                    
  ==================================================                                                  
  ⚠️  未指定文件，将创建测试文件...
  📝 已创建测试文件: /tmp/RustFS_test.txt
  📦 正在上传: /tmp/RustFS_test.txt
  📍 目标: s3://ccc/RustFS_test.txt
  🔗 端点: https://RustFS.example.com:9002
  ❌ 上传失败: Failed to upload /tmp/RustFS_test.txt to ccc/RustFS_test.txt: An error occurred (301) when calling the PutObject operation: Moved Permanently
  ```

- **尝试添加路径风格访问**：仍然失败 301

```
config=Config(
    signature_version="s3v4",
    s3={"addressing_style": "path"}
)
```

- **添加 region 配置**：仍然失败 301

```
region_name="us-east-1"
```

- **禁用ssl**：上传成功，但后面又失败了，上传成功后的ListObjectsV2操作也出现 301 

继续curl检查端点响应信息

![image-20251225100416627]({{PIC_URL}}/blog/content/2025/12/64942f87791fa9d99604c0d75130f870.png)

- **得出问题在Nginx**
  接下来把Nginx完整信息发送并解析，得出关键信息，缺少proxy_buffering off;

  ![image-20251225102638853]({{PIC_URL}}/blog/content/2025/12/3e06a98e5c6654f7b32f394e86b7fc8d.png)

- **重载Nginx配置后，上传100%成功，但ListObjectsV2操作出现 301**

  继续让ai检查Nginx配置，发现一处端口冲突导致的重定向循环。。。

  删除后重载Nginx配置，ListObjectsV2也正常了。OpenList端也恢复正常使用了。

  ![image-20251225103546933]({{PIC_URL}}/blog/content/2025/12/a21e2e02d8a141598793f1692662a5b0.png)
