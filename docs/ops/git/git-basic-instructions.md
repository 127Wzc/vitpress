---
isTimeLine: true
title: Git基础命令
description: 最近更新⏰ 2024-12-20：git stash
sticky: 10
date: 2024-12-20
tag: 
 - Git
---

# Git基础命令

## 仓库管理
### 克隆仓库
克隆远程仓库的命令示例：
```sh
# 克隆远程仓库
git clone https://github.com/user/repo.git

# 克隆远程仓库，并指定深度为1
git clone --depth=1 https://github.com/user/repo.git
```

### 克隆指定分支
```sh
git clone -b branch-name https://github.com/user/repo.git
```

### 检出远端分支
```sh
git checkout -b local-branch-name origin/remote-branch-name
```

### 推送本地分支到远端
```sh
git push origin local-branch-name:remote-branch-name
```
### 查看远端仓库
```sh
git remote -v
```
### 添加额外的远端仓库
```sh
git remote add origin-2 https://github.com/user/repo.git
```

### 重置关联仓库地址
```sh
git remote set-url origin https://github.com/user/repo.git
```

## git全局配置

### 设置全局用户名/邮箱
```sh
git config --global user.name 'your-name'
git config --global user.email 'your-email@qq.com'
``` 

### 查看设置
```sh
git config --list
``` 

## 提交规范
根据 [conventional-commit-types](https://github.com/commitizen/conventional-commit-types) 规范，commit message类型主要包含以下几种：
| 类型 | 说明 |
------|------|
 `feat` | 添加新功能 |
 `fix` | 修复bug |
 `docs` | 仅对文档进行修改 |
 `style` | 对代码语义无影响的格式修改（如去除无用空格、格式化等） |
 `refactor` | 代码重构（既不是新增功能，也不是修改bug的代码变动） |
 `perf` | 提高性能的代码修改 |
 `test` | 测试用例添加及修改 |
 `build` | 影响构建系统或外部依赖关系的更改 |
 `ci` | 更改CI配置文件和脚本 |
 `chore` | 其它不涉及源码以及测试的修改 |

:::details 提交示例
```sh 
git commit -m "feat: 添加新功能"
git commit -m "fix: 修复bug"
git commit -m "docs: 仅对文档进行修改"
```
:::

## git stash(暂存)
```sh
# 保存当前未commit的代码  
git stash  
  
# 保存当前未commit的代码并添加备注  
git stash save "备注的内容"  
  
# 列出stash的所有记录  
git stash list  
  
# 删除stash的所有记录  
git stash clear  
  
# 应用最近一次的stash  
git stash apply  
  
# 应用最近一次的stash，随后删除该记录  
git stash pop  
  
# 删除最近的一次stash  
git stash drop  

# 多条记录
git stash list  
stash@{0}: WIP on ...  
stash@{1}: WIP on ...  
stash@{2}: On ...  

#选择其中一条
git stash apply stash@{1}  
```
## git log
```sh
git log
# 格式化输出指定日期范围的commit，并显示提交者
git log --pretty=format:"%H - %an, %ad" --date=iso --since="2023-03-27 00:00:00" --before="2025-03-30 23:59:59" --no-merges
```


:::details pretty参数格式化
%H：输出完整的提交哈希(commit ID)

%an：输出提交者的姓名。

%ar：输出提交的相对日期，
:::

## git diff
1.比较两个commit的差异
```sh
git diff d2f4ebb 53bade4 --stat
```
结果：输出文件名及变更行信息
```sh
docs/.vitepress/blog-theme.ts | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```
2.比较两个文件的差异，并显示差异内容
```sh
git diff --name-only 5694319 8c27e8be4a --stat
```
结果：只输出文件名
```sh
docs/.vitepress/blog-theme.ts
```

