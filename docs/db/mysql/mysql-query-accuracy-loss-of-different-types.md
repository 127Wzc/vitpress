---
isTimeLine: true
title: MySQL不同类型字段查询/联表时精度丢失
date: 2025-02-24
tags:
 - MySQL
categories:
 - 数据库
---

## 问题描述
当在MySQL中比较不同类型的字段时，可能会出现精度丢失的问题。特别是在处理大数值的varchar字段时，需要特别注意。
## 问题原因
Mysql在比较字符串和数值时，会将两者都转换成双精度浮点型数进行比较，因为精度丢失，导致比较结果为true.
## 示例场景
比如下面order_info表有一个存储为varchar类型的ID字段，值为 `1671041482747756548`。order_detail表中order_id为BIGINT与order_info关联。
### 表结构示例
```sql
-- 表1：使用varchar存储ID
CREATE TABLE order_info (
id VARCHAR(20) PRIMARY KEY,
order_name VARCHAR(100)
);
-- 表2：使用bigint存储ID
CREATE TABLE order_detail (
id BIGINT PRIMARY KEY,
order_id BIGINT,
product_name VARCHAR(100)
);
```
### 数据示例
**order_info表：**

| id | order_name |
|----|------------|
| '1671041482747756548' | '订单A' |
| '1671041482747756549' | '订单B' |

**order_detail表：**

| id | order_id | product_name |
|----|----------|--------------|
| 1  | 1671041482747756548 | '商品1' |
| 2  | 1671041482747756548 | '商品2' |

### 查询匹配丢精度
#### 错误查询
```sql
-- 错误的查询方式（varchar不加引号）
SELECT FROM order_info WHERE id = 1671041482747756548;
```
结果：
```
| id | order_name |
|----|------------|
| '1671041482747756548' | '订单A' |
| '1671041482747756549' | '订单B' | <!-- 错误匹配 -->
```
#### 正确查询
```sql
-- 正确的查询方式（加引号）
SELECT FROM order_info WHERE id = '1671041482747756548';
```
结果:
```
| id | order_name |
|----|------------|
| '1671041482747756548' | '订单A' |
```
### 联表查询丢精度
#### 错误查询
```sql
-- 错误的联表查询（类型不一致）
SELECT a.*, b.product_name
FROM order_info a
LEFT JOIN order_detail b ON a.id = b.order_id;
```
结果：
```
| id | order_name | product_name |
|----|------------|--------------|
| '1671041482747756548' | '订单A' | '商品1' |
| '1671041482747756548' | '订单A' | '商品2' |
| '1671041482747756549' | '订单B' | '商品1' |  <!-- 错误匹配 -->
| '1671041482747756549' | '订单B' | '商品2' |  <!-- 错误匹配 -->
```
#### 正确查询
```sql
-- 正确的联表查询（使用CAST函数）
SELECT a.*, b.product_name
FROM order_info a
LEFT JOIN order_detail b ON CAST(a.id AS BIGINT) = b.order_id;
```

结果：
```
| id | order_name | product_name |
|----|------------|--------------|
| '1671041482747756548' | '订单A' | '商品1' |
| '1671041482747756548' | '订单A' | '商品2' |
| '1671041482747756549' | '订单B' | NULL |    <!-- 正确的结果 -->
```
> 注意：由于类型不一致导致的隐式转换，错误的查询方式会导致：
> 1. 精度丢失，造成错误的数据匹配
> 2. 索引失效，导致全表扫描
> 3. 查询性能显著下降
> 4. 在某些情况下，甚至可能返回错误的业务数据

## 解决方案：

1.统一字段类型，用bigint就都用bigint，用varchar都用varchar。这样不仅规范，而且可以避免两表联查时索引失效

2、查询语句的条件中严格按照字段的类型写查询值。避免mysql进行隐式转换。也同时可以避免索引失效

3、使用mysql提供的CAST()或者CONVERT()函数。
:::warning
- 类型不一致可能导致索引失效
- 隐式转换会影响查询性能
- 使用CAST函数可能影响索引使用
- 在分布式系统中，建议统一使用字符串类型存储大数值ID
:::