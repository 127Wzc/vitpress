---
isTimeLine: true
title: 向量数据库pgvector基础介绍
description: 最近更新⏰ 2025-06-12：记录向量数据库使用
date: 2025-06-12
tags:
 - PostgreSQL
categories:
 - 数据库
 - pgvector
---
## 向量数据库pgvector基础介绍

pgvector是PostgreSQL的一个扩展，它为PostgreSQL数据库添加了向量存储和相似性搜索功能。随着人工智能和机器学习的快速发展，向量数据库变得越来越重要，特别是在处理嵌入向量（embeddings）方面。pgvector允许用户在PostgreSQL中存储和查询向量数据，支持多种相似度计算方法，如欧几里得距离、余弦相似度和内积等。

### 主要特点

- **向量数据类型**：提供专门的`vector`数据类型，支持高达16000维的向量
- **相似性搜索**：支持精确和近似最近邻（ANN）搜索
- **多种距离度量**：支持欧几里得距离（L2）、余弦相似度和内积等多种计算方式
- **索引支持**：提供HNSW和IVFFlat两种索引方法，用于加速向量查询
- **与PostgreSQL无缝集成**：利用PostgreSQL的所有功能，如事务、并发控制和备份等

## 激活扩展

在PostgreSQL数据库中，执行以下命令激活pgvector扩展：

```sql
CREATE EXTENSION vector;
```

## 基本使用

### 创建表和存储向量

```sql
-- 创建一个包含向量字段的表（这里使用3维向量作为示例）
CREATE TABLE items (
  id bigserial PRIMARY KEY,
  item text,
  embedding vector(3)
);

-- 插入向量数据
INSERT INTO items (item, embedding) VALUES 
  ('苹果', '[1, 1, 1]'),
  ('香蕉', '[1.2, 0.8, 0.9]'),
  ('猫', '[6, 0.4, 0.2]');
```

### 向量查询操作符

pgvector提供了多种向量操作符用于相似度计算：

| 操作符 | 描述 | 用途 |
|-------|------|------|
| `<->` | 欧几里得距离 | 计算两个向量间的直线距离 |
| `<=>` | 余弦距离 | 计算向量方向的相似度 |
| `<#>` | 负内积 | 计算向量内积的负值 |
| `<+>` | L1距离 | 计算曼哈顿距离 |
| `<~>` | 汉明距离 | 计算二进制向量的差异 |
| `<%>` | Jaccard相似度 | 计算集合的相似度 |

### 基本查询示例

```sql
-- 使用欧几里得距离查找最相似的向量
SELECT item, embedding <-> '[1, 1, 1]' AS distance
FROM items
ORDER BY distance
LIMIT 5;

-- 使用余弦相似度查找最相似的向量
SELECT item, 1 - (embedding <=> '[1, 1, 1]') AS cosine_similarity
FROM items
ORDER BY cosine_similarity DESC
LIMIT 5;
```

## 创建索引

为了提高查询性能，pgvector支持两种索引类型：IVFFlat和HNSW。

### IVFFlat索引

IVFFlat索引将向量空间分割成多个子集，适合大规模数据集。

```sql
-- 创建IVFFlat索引（余弦距离）
CREATE INDEX ON items USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 设置查询参数
SET ivfflat.probes = 10;
```

参数说明：
- `lists`：将数据集分割成的子集数量，通常为行数/1000（小于100万行）或行数开平方根（大于100万行）
- `ivfflat.probes`：查询时检查的子集数量，值越大，召回率越高，但查询速度越慢

### HNSW索引

HNSW（Hierarchical Navigable Small World）索引是一种基于图的索引结构，适合需要高查询性能的场景。

```sql
-- 创建HNSW索引（余弦距离）
CREATE INDEX ON items USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- 设置查询参数
SET hnsw.ef_search = 100;
```

参数说明：
- `m`：每个节点的最大连接数，默认16
- `ef_construction`：构建索引时的精度参数，默认64
- `hnsw.ef_search`：查询时的精度参数，默认40

## 应用场景

pgvector在多个领域有广泛应用：

1. **语义搜索**：根据文本、图像的语义内容进行相似度搜索
2. **推荐系统**：基于用户行为和偏好的相似度推荐内容
3. **图像识别**：存储和检索图像特征向量
4. **自然语言处理**：处理和分析文本嵌入向量
5. **异常检测**：识别与正常模式偏离的数据点
6. **RAG（检索增强生成）**：结合大语言模型，实现基于知识库的智能问答系统

## 性能优化建议

1. 根据数据规模选择合适的索引类型：小规模数据集可使用HNSW，大规模数据集可使用IVFFlat
2. 调整索引参数以平衡查询速度和召回率
3. 对于IVFFlat索引，数据量变化较大时需要定期重建索引
4. 根据实际需求选择合适的距离度量方式
5. 考虑使用子向量技术进行二次召回，提高查询精度

## 与其他向量数据库的比较

与专用向量数据库（如Pinecone、Milvus等）相比，pgvector的优势在于：

1. 与PostgreSQL无缝集成，可以同时处理结构化和向量数据
2. 利用PostgreSQL成熟的事务处理、备份恢复等功能
3. 不需要额外维护专门的向量数据库系统
4. 开源免费，持续更新迭代

劣势在于：
1. 在超大规模向量数据处理上，专用向量数据库可能有更好的性能
2. 索引类型和优化选项相对较少
