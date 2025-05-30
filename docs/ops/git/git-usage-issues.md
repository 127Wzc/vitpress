---
isTimeLine: true
title: Git使用问题汇总
description: 最近更新⏰ 2024-02-25：多Host密钥配置
date: 2024-12-20
tag: 
 - Git
---

# Git使用问题汇总

## OpenSSL SSL_read: Connection was aborted, errno 10053

### 报错原因
1. 网速太差
2. 无效的代理
3. 一次性推送的代码量过大

### 解决办法
1. 大多数情况下，网有问题，可以多提交几次，或过一段时间再提交，直接了断解决挂上`梯子`即可。
2. Git默认限制推送的大小，运行命令更改限制大小即可增加缓冲：
   ```bash
   git config --global http.postBuffer 524288000
   ```
3. 更改网络认证设置：
   ```bash
   git config http.sslVerify "false"
   ```
## 大文件清理(bfg)
:::tip 简介
bfg是一个用于清理Git仓库的开源工具，可以清理掉一些不必要的、大文件、大对象、大引用等。

bfg仓库地址：https://github.com/rtyley/bfg-repo-cleaner

bfg文档地址: https://rtyley.github.io/bfg-repo-cleaner
:::

:::details 一个迁移仓库瘦身的操作示例
```bash
# 下载BFG工具的jar包
1）在本地代码仓库上一级目录，下载jar包：curl -O https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
# 进入本地仓库，进行垃圾回收并统计对象数量
2）cd <本地代码仓库,如:test.git> && git gc && git count-objects -vH && cd ..
# 使用BFG工具清理大于64MB的blob
3）java -jar bfg-1.14.0.jar --strip-blobs-bigger-than 64M --no-blob-protection --private <本地代码仓库,如:test.git>
# 清理引用日志并进行强制垃圾回收
4）cd <本地代码仓库,如:test.git> && git reflog expire --expire=now --all && git gc --prune=now --aggressive
# 再次统计对象数量，确认清理效果
5）git count-objects -vH
# 添加目标远程仓库
6）git remote add target <目标代码仓库url>
# 推送所有分支到目标仓库
7）git push target --all
# 推送所有标签到目标仓库
8）git push target --tags
```
:::


:::details 针对文件清理
```bash
# 下载BFG工具的jar包
1）在本地代码仓库上一级目录，下载jar包：curl -O https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# 注意delete-files会把最新一次附带上该文件 需要自己先在最新的提交上收到删除对应的文件再执行(记得备份)
# 使用BFG工具清理大于64MB的blob
2）java -jar bfg-1.14.0.jar --delete-files init-minio.zip xxx\.git\
# 清理引用日志并进行强制垃圾回收
3）git reflog expire --expire=now --all && git gc --prune=now --aggressive
# 检查即可
```
:::

## 多Host密钥配置
> 例如，将密钥 A 用于 example.com，将密钥 B 用于 stevenharman.net。

简化的 ~/.ssh/config 可能看起来像这样：
```bash
Host example.com
  IdentityFile ~/.ssh/github

Host stevenharman.net
  IdentityFile ~/.ssh/gitlab
```
:::tip 扩展同Host多账号配置
https://stevenharman.net/configure-ssh-keys-for-multiple-github-accounts
:::


