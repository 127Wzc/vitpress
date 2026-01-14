---
isTimeLine: true
title: 小程序逆向工具
description: 微信小程序 wxapkg 反编译工具对比与使用指南
date: 2026-01-14
tag:
 - WeChat
 - 逆向
---

# 小程序逆向工具

本文介绍两款常用的微信小程序 `.wxapkg` 反编译工具，帮助进行小程序源码分析与安全审计。

## 工具对比

| 特性 | KillWxapkg | wedecode |
|------|------------|----------|
| 语言 | Go | Node.js |
| 仓库 | [GitHub](https://github.com/Ackites/KillWxapkg) | [GitHub](https://github.com/biggerstar/wedecode) |
| 维护状态 | ⚠️ 停更 2 年，部分包仍可用 | ✅ 持续更新中 |
| 自动解密 | ✅ | ✅ |
| 小游戏支持 | ❌ | ✅ |
| 可视化 UI | ❌ | ✅ |
| Hook 调试 | ✅ (仅 Windows) | ❌ |
| 重新打包 | ✅ | ❌ |

---

## 获取小程序包

::: info 以下路径适用于微信 4.0+ 版本
:::

### Windows
```
C:\Users\{用户名}\AppData\Roaming\Tencent\xwechat\radium\Applet\packages\
```

### macOS
```
~/Library/Containers/com.tencent.xinWeChat/Data/Documents/app_data/radium/Applet/packages/
```

> 文件夹名即为小程序 AppID

---

## KillWxapkg

> 纯 Golang 实现，支持自动解密、解包、还原工程目录，支持微信开发者工具运行

### 主要功能

- 小程序自动解密 / 解包
- 代码美化输出 (JSON/JS/HTML)
- 还原源代码工程目录结构
- Hook 小程序，动态调试，开启 F12
- 重新打包 wxapkg
- 敏感数据导出

### 安装

从 [Releases](https://github.com/Ackites/KillWxapkg/releases) 下载对应平台的可执行文件，或自行编译：

```bash
git clone https://github.com/Ackites/KillWxapkg.git
cd KillWxapkg
go mod tidy && go build
```

### 基础用法

```bash
# 解包并还原目录结构
./KillWxapkg -in=/path/to/packages -restore

# 美化输出
./KillWxapkg -in=/path/to/packages -restore -pretty

# Hook 开启 F12（仅 Windows，建议小号）
./KillWxapkg -hook

# 重新打包
./KillWxapkg -repack=/path/to/source -out=/path/to/output.wxapkg
```

### 常用参数

| 参数 | 说明 |
|------|------|
| `-in` | 输入文件/目录路径 |
| `-out` | 输出目录路径 |
| `-id` | 小程序 AppID（已解密包可不指定） |
| `-restore` | 还原源代码工程目录结构 |
| `-pretty` | 美化输出代码 |
| `-hook` | Hook 小程序，开启 F12 |
| `-repack` | 重新打包目录路径 |
| `-sensitive` | 导出敏感数据 |

---

## wedecode

> 纯 JavaScript 实现，支持小程序和小游戏完美还原，跨平台支持

### 主要功能

- 支持小程序 + 小游戏还原
- 支持分包代码和插件代码还原
- 完美还原目录结构 (JS/WXML/WXSS/WXS/JSON)
- 所有代码美化输出
- 可视化 UI 操作
- 小程序自动解密

### 安装

```bash
# 全局安装
npm i wedecode -g

# macOS
sudo npm i wedecode -g
```

### 基础用法

```bash
# 可视化操作页面（推荐）
wedecode ui

# 交互式引导
wedecode

# 直接指定路径
wedecode ./name.wxapkg
wedecode ./packages_dir

# 指定输出目录
wedecode ./ --out ./output
```

### 常用参数

| 参数 | 说明 |
|------|------|
| `ui` | 启动本地可视化操作页面 |
| `<packages...>` | 包所在路径（文件或目录） |
| `-o, --out <path>` | 输出路径，默认同级目录下的 OUTPUT |
| `--open-dir` | 编译后打开产物目录 |
| `--clear` | 清空旧产物 |
| `--unpack-only` | 仅解包，不反编译 |

---

## 使用建议

::: tip 选择建议
- 需要 **Hook 调试 / 重新打包** → 选择 KillWxapkg
- 需要 **小游戏 / 可视化操作 / 持续支持** → 选择 wedecode
- 两者都无法解密时，可尝试另一个
:::

---

## 免责声明

::: warning
本文介绍的工具仅供学习研究和安全审计使用。请遵守《中华人民共和国网络安全法》，勿将此工具用于非授权的测试，使用者需自行承担相关法律责任。
:::
