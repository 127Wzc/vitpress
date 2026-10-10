---
isTimeLine: true
title: Node版本管理工具
description: 'nvm、n 与 fnm 的使用方式、跨平台支持、项目自动切换和常见隐患'
date: 2026-06-17
tag:
 - Node
 - Ubuntu
 - Linux
 - nvm
 - n
 - fnm
---

# Node版本管理工具

Node可以通过系统包管理器安装，也可以通过版本管理工具安装。需要同时维护多个版本、按项目切换或保留旧版本回退时，可以使用专门的版本管理工具。

本文对比`nvm`、`n`和`fnm`：`nvm`通过shell函数管理当前会话，`n`把选中版本安装到固定前缀，`fnm`通过可执行文件与shell初始化配置管理当前会话。选择时主要看平台、切换范围和现有工作流。

## 1. 安装前先确认环境

先看当前机器上是否已经存在Node，以及它来自哪里：

```bash
which node
node -v
which npm
npm -v
```

如果路径是`/usr/bin/node`，大概率来自系统包管理器；如果是`~/.nvm/...`，说明由`nvm`接管；如果是`/usr/local/bin/node`或自定义`N_PREFIX`目录，可能由`n`接管。

同一个shell环境中尽量只选一种工具接管Node路径。`apt`、`nvm`、`n`、`fnm`混用时，问题往往不是Node没装好，而是`PATH`里排在前面的那个`node`不是你以为的版本。

## 2. nvm

`nvm`在当前shell中切换Node，不同终端可以使用不同版本，并提供全局包迁移命令。使用时需要加载初始化脚本；进入项目自动切换需要额外配置钩子，原生Windows需另选工具。

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

`n`把选中的Node版本安装到固定前缀，切换活动版本无须加载shell函数。同一前缀由多个终端共享，切换会影响使用该路径启动的新进程；权限由前缀目录决定。

### 3.1 安装（Ubuntu）

下面采用npm安装方式，前提是机器上已经有可用的`npm`；也可以使用 [官方提供的其他安装方式](https://github.com/tj/n#installation)：

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

写入`/usr/local`需要相应权限；配置用户级`N_PREFIX`可以避免修改共享目录。选择哪种方式取决于机器的权限和服务部署约定。

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

## 4. fnm（Fast Node Manager）

`fnm`用Rust编写，以单个可执行文件分发，支持macOS、Linux和Windows。使用时需要按shell配置环境；不同平台的初始化语法不同。平台和安装方式见 [fnm官方说明](https://github.com/Schniz/fnm#installation)。

### 4.1 安装与shell初始化

按系统选择一种安装方式：

```bash
# macOS（已安装 Homebrew）
brew install fnm

# Ubuntu / Linux（先安装 curl、unzip）
sudo apt install -y curl unzip
curl -fsSL https://fnm.vercel.app/install | bash
```

```powershell
# Windows
winget install Schniz.fnm
```

按实际使用的shell添加初始化配置，**不要把三种配置都加入**；安装脚本若已写入，则无须重复添加：

```bash
# Bash：写入 ~/.bashrc
eval "$(fnm env --use-on-cd --shell bash)"
```

```zsh
# Zsh：写入 ~/.zshrc
eval "$(fnm env --use-on-cd --shell zsh)"
```

```powershell
# PowerShell：写入 $PROFILE 指向的配置文件
fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
```

保存后重新打开终端，执行`fnm --version`确认。`--use-on-cd`用于进入目录时按版本文件切换Node。配置来源见 [官方Shell Setup](https://github.com/Schniz/fnm#shell-setup)。

### 4.2 常用命令与项目版本

```bash
fnm install 22
fnm install 24
fnm use 24
fnm default 24
fnm list

# 把当前验证通过的完整版本记录到项目根目录
node --version > .node-version

# 另一台机器进入项目后，按版本文件安装并使用
fnm install
fnm use
```

`fnm`也能读取已有`.nvmrc`，通常保留一种版本文件即可。自动切换前，目标版本需要先安装；`fnm default`设置的是默认值，项目版本文件用于固定项目环境。命令细节见 [fnm命令参考](https://github.com/Schniz/fnm/blob/master/docs/commands.md)。

## 5. nvm、n与fnm对比

| 维度 | nvm | n | fnm |
|------|-----|---|-----|
| 实现方式 | 加载到shell的脚本 / 函数 | Bash脚本 | Rust原生可执行文件 |
| 平台 | macOS、Linux、WSL | macOS、Linux、WSL等 | macOS、Linux、原生Windows |
| 安装入口 | 独立安装脚本 | npm包或脚本 | Homebrew、Winget、安装脚本等 |
| 默认权限 | 用户级Node安装，无需`sudo` | 默认写`/usr/local`；可用`N_PREFIX`改到用户目录 | 用户级Node安装，无需`sudo` |
| 切换范围 | 当前shell会话，可多终端并行 | 同一安装前缀共享活动版本 | 当前shell会话，可多终端并行 |
| 项目版本文件 | `.nvmrc` | `n auto`读取`.nvmrc`等 | `.node-version`、`.nvmrc` |
| 进入目录自动切换 | 需额外配置shell钩子 | 内置`n auto`为手动触发 | 初始化时配置`--use-on-cd` |
| 全局包迁移 | `--reinstall-packages-from` | 按安装前缀管理 | 按Node版本管理，切换后检查并重装所需工具 |
| 主要便利 | 会话隔离、`.nvmrc`和全局包迁移 | 固定命令路径、交互选版、可自定义前缀 | 原生跨平台、兼容两种版本文件、内置目录切换钩子 |
| 使用成本 | shell初始化；原生Windows不适用 | 前缀权限管理；共享路径不按会话隔离 | shell初始化；各平台配置不同；全局工具需随版本检查 |

这里的`nvm`指 [nvm-sh/nvm](https://github.com/nvm-sh/nvm)，原生Windows上的nvm-windows是独立项目；`n`也不支持原生PowerShell，参见 [n支持的平台](https://github.com/tj/n#supported-platforms)。

三者都能完成多版本管理，没有统一的优先顺序：

- 需要多个终端分别运行不同版本时，比较`nvm`与`fnm`的shell集成、版本文件和全局工具管理方式。
- 希望多个终端使用同一固定前缀时，评估`n`，同时明确权限及切换影响范围。
- **同时使用Ubuntu、macOS和Windows，希望统一多系统体验时，fnm更合适。** 三端可以使用同一套安装Node、切换版本和设置默认版本的命令，并共用项目中的`.node-version`或`.nvmrc`；各系统只需分别配置对应shell的初始化。相比之下，`nvm-sh`在原生Windows下需要另选工具，`n`也不支持原生PowerShell。

本文未做统一环境下的性能和体积测试，不按“轻量”“更快”给工具排名。版本管理器也不会提高Node应用本身的运行速度。团队应提交版本文件，并单独固定包管理器及依赖；已有环境是否迁移，需结合实际收益与迁移成本判断。

## 6. 常见隐患

### 6.1 切换版本后全局命令找不到

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

### 6.2 `sudo npm install -g`带来的权限问题

使用`nvm`或`fnm`时，不要用`sudo npm install -g`。它们的Node安装在用户目录下，使用`sudo`反而可能把包安装到系统目录，或者生成root拥有的文件，后续出现`EACCES`。

使用`n`时，如果默认写`/usr/local`，`sudo`是常见选择；如果想避免权限问题，就配置`N_PREFIX`到用户目录。

### 6.3 PATH指向旧Node

升级后先用下面几条命令确认实际生效路径：

```bash
which node
node -v
which npm
npm config get prefix
```

如果`which node`仍指向`/usr/bin/node`或旧目录，检查`~/.bashrc`、`~/.zshrc`里的`PATH`顺序。

### 6.4 pm2和systemd服务要一起检查

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

systemd不会自动执行交互终端里的shell初始化和目录切换钩子。无论使用哪种工具，服务都应使用明确的Node路径，或在启动脚本中显式设置所需环境。

## 7. 速查

### 7.1 nvm

```bash
nvm install 20
nvm use 20
nvm alias default 20
nvm ls
nvm install 22 --reinstall-packages-from=20
```

### 7.2 n

```bash
sudo n lts
sudo n 20
sudo n latest
sudo n
sudo n rm 18
sudo n prune
n auto
```

### 7.3 fnm

```bash
fnm install 24
fnm use 24
fnm default 24
fnm list
fnm current
```

### 7.4 排障

```bash
which node
node -v
which npm
npm -v
npm config get prefix
```

## 8. 生产环境建议

生产环境不要只记录“已经安装Node”。至少记录Node主版本、管理工具、服务启动方式和升级回滚步骤。

较稳的流程：

1. 在测试环境验证目标Node版本。
2. 在项目中固定`.nvmrc`或`.node-version`。
3. 升级前确认`pm2 list`、`pm2 save`或systemd配置。
4. 升级后确认`which node`、`node -v`和应用健康检查。
5. 保留旧版本，确认稳定后再清理缓存。
