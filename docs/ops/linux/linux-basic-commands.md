---
isTimeLine: true
title: Linux常用指令
description: 最近更新⏰ 2025-01-05：grep介绍
date: 2025-01-05
tag: 
 - Linux
---

# Linux常用指令

## 1. 查找内容
### grep 查找包含指定内容的文件

```bash
# 当前路径下查找包含"关键字"的文件
grep -r "关键字" .
# 查找包含"关键字"的js文件
grep -r --include="*.js" "关键字" .
```

## 2. 磁盘文件相关指令
###  du
> 显示当前目录下所有一级子目录和文件的总大小。 -h 以易于阅读的格式（如 K, M, G）显示; max-depth=1 一级子目录; | sort -hr 倒序

```bash
du -h --max-depth=1 . | sort -hr
```

## 3. 清理目录、文件
> 已在要清理的目录，清空当前目录
```bash
rm -rf * .*
```
> 指定目录清理
```bash
find /path/to/my_stuff -mindepth 1 -delete
```
> 清空文件(以下4种常用的)
```bash
echo -n > logfile.log
> logfile.log
truncate -s 0 logfile.log
cat /dev/null > logfile.log
```
