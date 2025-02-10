---
isTimeLine: true
title: Docker使用问题汇总
date: 2025-02-10
tag: 
 - Docker
---
# Docker使用问题汇总

## 减小并控制Docker日志大小
:::tip 简介
请务必了解，只有在删除并重新创建Docker容器时，才会重置Docker日志。仅停止和启动容器不会重置日志。`systemctl restart docker`也不会重置已创建过的旧容器的日志。
:::
### 日志位置
Docker日志通常保存在主机上的以下位置（如果您尚未明确更改Docker的默认数据目录）：
```sh
/var/lib/docker/containers/<container-id>/<container-id>-json.log
```
### 查看所有日志文件
```sh
find /var/lib/docker/containers/ -name "*json.log" | xargs du -h | sort -hr
```
### 确认日志文件所属容器
```sh
# 查看容器名称
docker inspect --format='{{.Name}}' <container_id>
# 查看容器详细信息
docker inspect <container_name>
# 查看容器日志路径
docker inspect --format='{{.LogPath}}' <container_name>
```
### 清理日志文件
您可以使用该`truncate`命令清除单个日志文件的所有内容。只需提供要作为参数清除的日志文件的完整路径。例如：
```sh
# 清理日志文件
truncate -s 0 /var/lib/docker/containers/d2e9228f92b66ac09fa35dcab36abba2eb4a7f46baa1d03b65d71ed8d42de977/d2e9228f92b66ac09fa35dcab36abba2eb4a7f46baa1d03b65d71ed8d42de977-json.log

# 激进的清理所有日志文件
truncate -s 0 /var/lib/docker/containers/*/*-json.log
```
### 全局设置Docker日志限制
上述方法为管理大型Docker日志文件和释放磁盘空间提供了临时修复。但是，它需要定期使用某些命令，这可能会很不方便。

一种更好、更持久的解决方案是限制 Docker 日志文件的最大大小。达到此大小后，Docker 守护程序将自动轮换这些日志文件，并按照命名约定（如 “<container_id>-json.log.1”,“<container_id>-json.log.2” 等）将其存档，具体取决于下面显示的选项。


要将日志轮换设置全局应用于Docker守护程序运行的所有容器，您可以编辑 Docker 守护程序配置文件，通常位于 “/etc/docker/daemon.json”。如果该文件不存在，您可以通过执行类似于以下内容的命令来创建它：

```sh
sudo nano /etc/docker/daemon.json
```
然后，将以下内容粘贴到文件中，保存并退出：
简而言之，它将日志驱动程序设置为“json-file”，将单个Docker日志文件的最大允许大小设置为 10 MB，并允许最多存档文件的 3 个版本。
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

接下来，要应用更改，只需重新启动Docker服务：
```sh
sudo systemctl restart docker
```

:::warning 
请务必记住，这些更改只会影响`新创建的Docker容器`，而不会影响已经运行的容器。要将更改应用于现有更改，必须先删除它们，然后再次创建它们。
:::




