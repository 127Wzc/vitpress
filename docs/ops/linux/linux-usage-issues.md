---
isTimeLine: true
title: Linux使用问题汇总
date: 2025-01-05
tag: 
 - Linux
 - Ubuntu
---

# Linux使用问题汇总

## 1. 运行shell命令出现`bash: /dev/fd/63:`
### 解决方案

原指令：
```bash
sudo bash <(curl -sSLk https://xxxx)
```

修改后指令：
```bash
sudo bash -c "$(curl -sSLk https://xxxx)"
```
