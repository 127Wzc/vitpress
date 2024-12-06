---
isTimeLine: true
title: MySQL子查询OrderBy失效
date: 2022-05-13
tags:
 - MySQL
categories:
 - 数据库
---
## 需求背景

获取分组后，组内排名第一或最后的数据行(完整信息)。
1.`利用子查询`，desc 或者asc，然后GROUP BY 某个维度例如userId，
再select，会`默认取分组后的排序的第一条数据`。
2.利用子查询，然后在外层查询进行GROUP BY排序，再使用DISTINCT 某关键字去重。

## 失效原因

:::tip order by在子查询中被忽略优化了
A "table" (and subquery in the FROM clause too) is - according to the SQL standard - an unordered set of rows. Rows in a table (or in a subquery in the FROM clause) do not come in any specific order. That's why the optimizer can ignore the ORDER BY clause that you have specified. In fact, SQL standard does not even allow the ORDER BY clause to appear in this subquery (we allow it, because ORDER BY ... LIMIT ... changes the result, the set of rows, not only their order). You need to treat the subquery in the FROM clause, as a set of rows in some unspecified and undefined order, and put the ORDER BY on the top-level SELECT.
大致意思：SQL标准中，table的定义是一个未排序的数据集合，而一个SQL子查询是一个临时的table，根据这个定义，子查询中的order by会被忽略。同时，官方回复也给出了解决方案：将子查询的order by移动到最外层的select语句中。
:::


## 解决方案
### 1.Order By从子查询中移至到外层查询

### 2.采用 row_number()  over + partition by去排序分组，可以保留数据完整信息
``` mysql [mysql]
SELECT  *,row_number() over (PARTITION BY sex ORDER BY id DESC ) AS od
 FROM people;
```
**示例结果(按sex分组后按id排序)**
| id | name | age | sex | od |
|----|------|-----|-----|----|
| 3  | 王3  | 21  | 男  | 1  |
| 2  | 王2  | 20  | 男  | 2  |
| 1  | 王1  | 19  | 男  | 3  |
| 5  | 女2  | 16  | 女  | 1  |
| 4  | 女1  | 15  | 女  | 2  |

### 3.使用limit 10000000 ，limit+大数 强行排序

网上都说Mysql5.7，在子查询的ORDER BY子句后面，必须加上LIMIT 10000000，实测不加LIMIT 结果确实会有问题
**未加Limit，没有排序效果**
``` mysql [mysql]
SELECT * FROM (
  SELECT 
    tccs.application_id,
    tccs.application_name,
    INNULL(report.problem_medium, 0) AS problem_medium,
    INNULL(report.problem_highest, 0) AS problem_highest,
    INNULL(report.problem_lower, 0) AS problem_lower,
    INNULL(report.problem_lowest, 0) AS problem_lowest
  FROM task_config_code_scan tccs
  LEFT JOIN task ON tccs.task_id = task.id
  LEFT JOIN report ON task.last_report_id = report.id
  WHERE task.security_type = '1'
  AND report.status = '2'
  ORDER BY report.create_time DESC
) AS a
GROUP BY a.application_id
ORDER BY problem_highest DESC, problem_medium DESC, problem_lower DESC, problem_lowest DESC 
LIMIT 0, 10;
```
**未加Limit结果**
| application_id       | application_name | problem_highest | problem_medium | problem_lower | problem_lowest |
|----------------------|------------------|------------------|----------------|----------------|-----------------|
| 256275510231875584   | 安全              | 0                | 213            | 0              | 0               |
| 25042162426252040    | 题目02           | 0                | 215            | 14             | 14              |
| 265173915478207240    | a                | 0                | 0              | 0              | 0               |
| 272175740395716800   | recruit-web      | 7                | 47             | 24             | 24              |
| 333444884844165800   | vue              | 0                | 0              | 0              | 0               |


**加上limit 10000000后跟预期正常**
``` mysql [mysql]
SELECT * FROM (
  SELECT 
    tccs.application_id,
    tccs.application_name,
    INNULL(report.problem_highest, 0) AS problem_highest,
    INNULL(report.problem_medium, 0) AS problem_medium,
    INNULL(report.problem_lower, 0) AS problem_lower,
    INNULL(report.problem_lowest, 0) AS problem_lowest
  FROM task_config_code_scan tccs
  LEFT JOIN task ON tccs.task_id = task.id
  LEFT JOIN report ON task.last_report_id = report.id
  WHERE task.security_type = '1'
  AND report.status = '2'
  ORDER BY report.create_time DESC LIMIT 10000000
) AS aa
GROUP BY aa.application_id
ORDER BY problem_highest DESC, problem_medium DESC, problem_lower DESC, problem_lowest DESC 
LIMIT 0, 10;
```
**加上limit结果**
| application_id       | application_name | problem_highest | problem_medium | problem_lower | problem_lowest |
|----------------------|------------------|------------------|----------------|----------------|-----------------|
| 333444884844165800   | vue              | 0                | 0              | 0              | 0               |
| 26517954874220736    | a                | 0                | 0              | 0              | 0               |
| 25042162426252040    | 题目02           | 0                | 215            | 14             | 14              |
| 256275510231875584   | 安全              | 0                | 27             | 0              | 0               |
| 27217574039574528    | recruit-web      | 7                | 47             | 24             | 24              |



