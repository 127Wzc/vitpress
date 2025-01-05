---
isTimeLine: true
title: 批量查找文件内容并做替换
date: 2024-12-23
tags:
 - Shell
 - Ubuntu
categories:
 - Linux
 - Shell
---

#示例
此处示例一个 替换/.git/config 文件中代理地址的示例
```bash
#!/bin/bash

# 定义一个函数来执行替换操作
replace_ghp_ci() {
    local files_to_modify=$1
    echo "以下文件将被修改："
    cat "$files_to_modify"
    while true; do
        read -p "是否确认修改这些文件？(y/n): " confirm
        case "$confirm" in
            [Yy]* )
                while read -r file; do
                    sed -i 's|https://ghp.ci|https://ghgo.xyz|g' "$file"
                done < "$files_to_modify"
                break
                ;;
            [Nn]* )
                echo "操作已取消。"
                exit
                ;;
            * )
                echo "请输入 y 以确认修改，或输入 n 以取消操作。"
                ;;
        esac
    done
}

# 查找所有.git/config文件，并将路径保存到临时文件
tmp_file=$(mktemp)
find /home/cc/trss/TRSS-Yunzai/plugins/ -type f -wholename "*/.git/config" -exec grep -l "https://ghp.ci" {} + > "$tmp_file"

# 调用函数执行替换操作
replace_ghp_ci "$tmp_file"

# 清理临时文件
rm "$tmp_file"
```