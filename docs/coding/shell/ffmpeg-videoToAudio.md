---
isTimeLine: true
title: MP4批量音频提取
date: 2022-03-15
tags:
 - ffmpeg
categories:
 - 编程
---
# [FFmpeg安装](https://www.jianshu.com/p/2b609afb9800)

# MP4视频转音频：

## 1.新建文件，编写批量转换脚本

:::code-group

``` sh [java]
@echo off & title
 

cd /d %~dp0
 
for %%a in (*.mp4) do (
 
 ffmpeg -i "%%~sa" -codec:a libmp3lame -q:a 3 "%%~na.mp3"
 
)
 
pause
```
:::


具体参数含义可参考如下或者FFmpeg官网帮助

https://zh.codepre.com/how-to-3465.html

2、把文件后缀修改为bat 。

3、把后缀为bat的文件放到要批量处理的视频文件夹里面。

4、双击bat文件执行即可。