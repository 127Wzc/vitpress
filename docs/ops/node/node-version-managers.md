---
isTimeLine: true
title: Node版本管理工具
description: '最近更新⏰ 2026-06-17：nvm与n的使用方式、差异和常见隐患'
date: 2026-06-17
tag:
 - Node
 - Ubuntu
 - Linux
 - nvm
 - n
---

# Node版本管理工具

Ubuntu服务器或开发机上，不建议长期依赖`apt install nodejs`管理Node版本。系统源里的Node版本通常滞后，升级和回退也不方便。更稳妥的做法是使用专门的版本管理工具，让多个Node版本可以同时存在，并按项目或按机器切换。

常用工具主要是`nvm`和`n`。两者都能安装多个Node版本，但管理模型不同：`nvm`偏向用户级、项目级切换；`n`偏向把某个版本安装为当前系统默认Node。

## 1. 安装前先确认环境

先看当前机器上是否已经存在Node，以及它来自哪里：

```bash
which node
node -v
which npm
npm -v
```

如果路径是`/usr/bin/node`，大概率来自系统包管理器；如果是`~/.nvm/...`，说明由`nvm`接管；如果是`/usr/local/bin/node`或自定义`N_PREFIX`目录，可能由`n`接管。

同一台机器上尽量只选一种工具接管Node路径。`apt`、`nvm`、`n`混用时，问题往往不是Node没装好，而是`PATH`里排在前面的那个`node`不是你以为的版本。

## 2. nvm

### 2.1 安装（Ubuntu）

```bash
sudo apt update
sudo apt install -y curl ca-certificates build-essential

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash

source ~/.bashrc
# 使用 zsh 时执行：
# source ~/.zshrc

nvm --version
```

如果执行后提示`nvm: command not found`，通常是当前shell还没有加载初始化脚本。重新打开终端，或手动`source ~/.bashrc`/`source ~/.zshrc`即可。

### 2.2 基本用法

```bash
nvm ls-remote

nvm install 20
nvm install 22

nvm use 20

nvm ls

nvm alias default 20

nvm uninstall 18
node -v
npm -v
```

项目根目录可以放一个`.nvmrc`：

```text
20
```

进入项目后执行：

```bash
nvm use
```

### 2.3 全局包迁移

`nvm`下每个Node版本都有独立的全局包目录。安装新版本时，可以把旧版本里的全局包重新安装到新版本：

```bash
nvm install 22 --reinstall-packages-from=20
```

这类迁移适合`pm2`、`yarn`、`pnpm`、`typescript`等命令行工具。项目依赖仍然应以`package.json`和锁文件为准，不要依赖全局包复现项目环境。

## 3. n

### 3.1 安装（Ubuntu）

`n`本身是一个npm包，前提是机器上已经有可用的`npm`：

```bash
sudo npm install -g n
n --version
```

`n`默认把Node安装到`/usr/local`，普通用户通常没有写权限。常见处理方式有两种：

```bash
# 方式一：执行 n 时使用 sudo
sudo n lts

# 方式二：改到用户目录，避免 sudo
mkdir -p ~/.n
echo 'export N_PREFIX=$HOME/.n' >> ~/.bashrc
echo 'export PATH=$N_PREFIX/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
n lts
```

服务器上如果只有一个运维用户，`sudo n lts`足够直接；多人共用机器或不希望改动`/usr/local`时，更建议配置`N_PREFIX`。

### 3.2 基本用法

```bash
sudo n 20
sudo n 22
sudo n lts
sudo n latest
sudo n
sudo n rm 18
sudo n prune
```

如果配置了`N_PREFIX`，命令前不需要`sudo`：

```bash
n 20
n lts
n
```

`n`也可以按项目文件选择版本：

```bash
n auto
```

`n auto`会向上查找`.n-node-version`、`.node-version`、`.nvmrc`或`package.json`中的`engines`字段。它不是自动切换shell环境，而是按文件内容安装并切换当前活动版本。

### 3.3 n的工作方式

`n`会下载Node预编译包，并把选中的版本安装到一个固定前缀目录，例如`/usr/local`或`$N_PREFIX`。这意味着同一时间只有一个路径上的`node`处于活动状态。已下载的版本会留在缓存里，后续切换更快。

安装后如果`node -v`没有变化，先开一个新终端，或检查`which node`。多数情况下是`PATH`顺序仍然指向旧位置。

## 4. nvm与n对比

| 维度 | nvm | n |
|------|-----|---|
| 安装入口 | 独立安装脚本 | npm包，或直接下载脚本引导 |
| 默认权限 | 用户目录，无需`sudo` | 默认写`/usr/local`，通常需要`sudo` |
| 切换范围 | 当前shell会话 | 当前Node安装前缀，通常影响整机命令路径 |
| 项目版本文件 | `.nvmrc` | `n auto`可读取`.nvmrc`等文件 |
| 多项目并行 | 更适合 | 可以用，但切换动作更偏全局 |
| 全局包迁移 | `--reinstall-packages-from` | 需要手动重装或自行脚本化 |
| 典型场景 | 开发机、多项目、CI脚本 | 单机服务、简单服务器环境 |

选型建议：

1. 开发机维护多个项目，优先用`nvm`。
2. 服务器只跑少量服务，且希望命令简单，可以用`n`。
3. 团队项目应提交`.nvmrc`或`.node-version`，同时在README里写明Node主版本。
4. 不要让`apt`、`nvm`、`n`同时竞争同一个`node`命令。

## 5. 常见隐患

### 5.1 切换版本后全局命令找不到

现象：

```bash
pm2 -v
# command not found
```

原因很简单：全局npm包跟随当前Node版本或安装前缀。旧版本里安装过`pm2`，不代表新版本里也有。

处理方式：

```bash
# 确认当前 Node 版本
node -v

# 在当前版本下重新安装
npm install -g pm2

# 让 pm2 daemon 切到当前环境
pm2 update
```

`pm2 update`用于刷新内存中的pm2 daemon，避免后台守护进程仍运行在旧Node环境下。进程列表一般不会因此丢失，但生产环境执行前仍建议先确认：

```bash
pm2 list
pm2 save
```

### 5.2 `sudo npm install -g`带来的权限问题

使用`nvm`时，不要用`sudo npm install -g`。`nvm`的全局包目录在用户目录下，使用`sudo`反而可能把包安装到系统目录，或者生成root拥有的文件，后续出现`EACCES`。

使用`n`时，如果默认写`/usr/local`，`sudo`是常见选择；如果想避免权限问题，就配置`N_PREFIX`到用户目录。

### 5.3 PATH指向旧Node

升级后先用下面几条命令确认实际生效路径：

```bash
which node
node -v
which npm
npm config get prefix
```

如果`which node`仍指向`/usr/bin/node`或旧目录，检查`~/.bashrc`、`~/.zshrc`里的`PATH`顺序。

### 5.4 pm2和systemd服务要一起检查

Node版本切换只影响命令路径，不会自动修改已经运行的进程。涉及线上服务时，至少确认三件事：

```bash
node -v
pm2 list
pm2 info <app-name>
```

如果服务由systemd管理，还要检查`ExecStart`里写死的Node路径：

```bash
systemctl cat <service-name>
```

## 6. 速查

### 6.1 nvm

```bash
nvm install 20
nvm use 20
nvm alias default 20
nvm ls
nvm install 22 --reinstall-packages-from=20
```

### 6.2 n

```bash
sudo n lts
sudo n 20
sudo n latest
sudo n
sudo n rm 18
sudo n prune
n auto
```

### 6.3 排障

```bash
which node
node -v
which npm
npm -v
npm config get prefix
```

## 7. 生产环境建议

生产环境不要只记录“已经安装Node”。至少记录Node主版本、管理工具、服务启动方式和升级回滚步骤。

较稳的流程：

1. 在测试环境验证目标Node版本。
2. 在项目中固定`.nvmrc`或`.node-version`。
3. 升级前确认`pm2 list`、`pm2 save`或systemd配置。
4. 升级后确认`which node`、`node -v`和应用健康检查。
5. 保留旧版本，确认稳定后再清理缓存。
