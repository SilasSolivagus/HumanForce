# 🏭 AutoFactory - 自主软件生产工厂

一个完全开放的、自我驱动的软件开发系统。代理团队自主挖掘需求、设计、开发、测试、部署。

## 系统架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                      调度中心 (Factory Orchestrator)                  │
│                  - 任务调度、状态监控、资源协调                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
        ┌──────────┬───────────────┼───────────────┬──────────┐
        ▼          ▼               ▼               ▼          ▼
   ┌─────────┐ ┌─────────┐   ┌─────────┐     ┌─────────┐ ┌─────────┐
   │需求矿工 │ │PRD架构师│   │ 开发者  │     │ 测试员  │ │ 部署员  │
   │(Scout)  │ │(Arch)   │   │(Dev)    │     │(QA)     │ │(Ops)    │
   └─────────┘ └─────────┘   └─────────┘     └─────────┘ └─────────┘
        │           │             │               │           │
        ▼           ▼             ▼               ▼           ▼
   挖掘需求 →  设计PRD    →   编码实现    →   测试验证   →  部署上线
```

## 工作流程

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Scout   │───→│ Architect│───→│ Developer│───→│   QA     │───→│   Ops    │
│ 需求挖掘 │    │ PRD设计  │    │ 编码开发 │    │ 测试验证 │    │ 部署上线 │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
      │               │               │               │               │
      ▼               ▼               ▼               ▼               ▼
  全网扫描        需求分析        项目初始化       自动化测试      云平台部署
  评分筛选        技术设计        Coding Agent    质量门禁        监控告警
  机会发现        架构规划        代码实现        Bug修复         自动发布
```

## 代理职责

| 代理 | 职责 | 输入 | 输出 | 技术实现 |
|------|------|------|------|----------|
| **Scout** | 全网挖掘软件需求 | GitHub/Reddit/HN 数据 | 需求清单（优先级排序）| Node.js + GitHub API |
| **Architect** | 需求分析与技术设计 | 需求文档 | PRD + 技术方案 | 结构化生成 |
| **Developer** | 编码实现 | PRD | 可运行代码 + PR | Coding Agent (Codex/Claude) |
| **QA** | 测试与质量保障 | 代码 + PRD | 测试报告 | 自动化测试框架 |
| **Ops** | 部署与运维 | 通过测试的代码 | 线上服务 | Vercel/Railway/Docker |

## 需求挖掘源

- **GitHub**: 
  - Trending repos (各语言热门仓库)
  - Good First Issues (适合新手的 issue)
  - 热门议题讨论
  
- **Reddit**: 
  - r/webdev, r/programming
  - r/SideProject, r/web_design
  
- **Product Hunt**: 新产品趋势
- **Hacker News**: Show HN, Ask HN

## 评估算法

```
总分 = 社区关注度×0.3 + 实现难度×0.25 + 市场空白×0.25 + 技术匹配×0.2

- 社区关注度: 基于 stars、comments 等
- 实现难度: 反向评分（越简单分数越高）
- 市场空白: 关键词独特性分析
- 技术匹配: 与偏好技术栈的匹配度

阈值: >= 7.0 进入开发流水线
```

## 快速开始

### 1. 运行完整流水线

```bash
cd autofactory
node orchestrator.js run
```

### 2. 仅运行需求挖掘

```bash
node orchestrator.js scout
```

### 3. 查看状态

```bash
node orchestrator.js status
```

### 4. 获取更多帮助

```bash
node orchestrator.js help
```

## 项目结构

```
autofactory/
├── README.md                 # 本文档
├── config.yaml              # 配置文件
├── orchestrator.js          # 主调度器
├── agents/                  # 代理目录
│   ├── scout.js            # 需求矿工
│   ├── architect.js        # PRD架构师
│   ├── developer.js        # 开发者
│   ├── qa.js               # 测试员 (待实现)
│   └── ops.js              # 部署员 (待实现)
├── memory/                  # 状态存储
│   ├── opportunities.json  # 需求库
│   └── factory_state.json  # 工厂状态
└── outputs/                 # 输出目录
    ├── prd/                # PRD文档
    └── projects/           # 生成的项目
```

## 配置文件

```yaml
# config.yaml
scoring:
  min_score_threshold: 7.0  # 进入流水线的最低分数

development:
  max_dev_time: 120         # 最大开发时间（分钟）
  min_test_coverage: 60     # 最小测试覆盖率

deployment:
  targets:
    - vercel      # 前端项目
    - railway     # 全栈项目
    - docker      # 容器化
```

## 示例输出

### Scout 输出示例

```
🚀 Scout Agent 启动

🔍 扫描 GitHub Trending...
  ✅ 发现 50 个热门项目
🔍 扫描 GitHub Good First Issues...
  ✅ 发现 20 个 good first issues

🆕 发现 70 个新机会

📋 评估结果（按分数排序）：

1. [✅ 推荐] browser-use
   📎 https://github.com/browser-use/browser-use
   📝 Make websites accessible for AI agents...
   📊 分数: 7.8/10
      - 社区关注度: 10.0
      - 实现难度: 5.0 (越高越简单)
      - 市场空白: 7.0
      - 技术匹配: 9.0

🎯 推荐进入开发流水线: 50 个
```

### Architect 输出示例

生成 PRD 文档，包含：
- 产品概述（问题陈述、目标用户、价值主张）
- 功能需求（P0/P1/P2 分级）
- 技术设计（架构、技术栈、数据模型、API）
- 实现计划（阶段划分、工作量估算）
- 成功标准（测试标准、性能目标）

### Developer 输出示例

```
💻 开始开发项目: browser-use
  📄 开发指令已保存: .../DEV_INSTRUCTIONS.md
  📁 项目目录: .../projects/xxxxx
  🤖 启动 Coding Agent...
  ✅ 开发脚本已生成: .../start_dev.sh
  📝 Coding Prompt 已保存: .../CODING_PROMPT.txt
```

## 开发流程

1. **Scout** 挖掘需求 → 评估分数 → 推荐机会
2. **Orchestrator** 调度 → 传递高分需求给 Architect
3. **Architect** 分析需求 → 生成 PRD 文档
4. **Orchestrator** 调度 → 传递 PRD 给 Developer
5. **Developer** 准备项目 → 生成开发指令 → 启动 Coding Agent
6. **Coding Agent** (Codex/Claude) 实际编写代码
7. **QA** 运行测试 → 质量验证
8. **Ops** 部署上线 → 监控运行

## 扩展计划

- [x] Scout 需求挖掘
- [x] Architect PRD设计
- [x] Developer 项目准备
- [ ] QA 自动化测试
- [ ] Ops 自动部署
- [ ] 集成更多数据源 (Twitter, Discord)
- [ ] 机器学习需求预测
- [ ] 自动代码审查
- [ ] 多语言支持

## 技术栈

- **调度器**: Node.js
- **需求挖掘**: GitHub API, Reddit API
- **PRD生成**: 结构化模板生成
- **代码开发**: Codex / Claude Code
- **部署**: Vercel, Railway, Docker

---

*🏭 AutoFactory - 让软件自己写自己*
