---
isTimeLine: true
title: MySQL布尔类型存储
date: 2022-01-11
tags:
 - MySQL
categories:
 - 数据库
---

MYSQL数据库无法直接存储true跟false，set属性为true，数据库字段自动保存为1，set属性为false，数据库字段自动保存为0
## 解决方法
将mysq字段设置为tinyint，长度设置为1

## 资料：

 - MySQL有四个常量：true，false，TRUE，FALSE，它们代表1,0,1,0
 - MySQL数据库将字段的数据类型BOOL/BOOLEAN默认地转换成TINYINT(1)

>  [!WARNING]
> 注：tinyint只占用一个字节，0会表现为false，其他的1，2，3…….,将会表现为true
