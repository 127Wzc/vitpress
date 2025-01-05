---
isTimeLine: true
title: Linux常用指令
date: 2025-01-05
tag: 
 - Linux
---

# Linux常用指令

## 1. grep
### grep 查找包含指定内容的文件

```bash
# 当前路径下查找包含"关键字"的文件
grep -r "关键字" .
# 查找包含"关键字"的js文件
grep -r --include="*.js" "关键字" .
```
