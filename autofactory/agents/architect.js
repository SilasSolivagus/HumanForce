#!/usr/bin/env node
/**
 * Architect Agent - PRD架构师
 * 
 * 职责：
 * 1. 分析需求，设计产品功能
 * 2. 输出详细的 PRD（产品需求文档）
 * 3. 设计技术架构和实现方案
 * 4. 制定开发计划和里程碑
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(__dirname, '..', 'memory');
const PRD_DIR = path.join(__dirname, '..', 'outputs', 'prd');

// 确保目录存在
if (!fs.existsSync(PRD_DIR)) {
  fs.mkdirSync(PRD_DIR, { recursive: true });
}

/**
 * 基于需求生成 PRD
 */
async function generatePRD(opportunity) {
  console.log(`📝 为 "${opportunity.title}" 生成 PRD...`);
  
  // 分析需求类型，推断功能范围
  const requirement = analyzeRequirement(opportunity);
  
  // 生成 PRD
  const prd = {
    metadata: {
      id: generateId(),
      title: opportunity.title,
      source: opportunity.url,
      created_at: new Date().toISOString(),
      version: '1.0.0'
    },
    
    overview: {
      problem_statement: generateProblemStatement(opportunity),
      target_users: inferTargetUsers(opportunity),
      value_proposition: generateValueProposition(opportunity)
    },
    
    requirements: {
      functional: generateFunctionalRequirements(requirement),
      non_functional: generateNonFunctionalRequirements(requirement)
    },
    
    technical_design: {
      architecture: recommendArchitecture(requirement),
      tech_stack: recommendTechStack(requirement, opportunity),
      data_model: generateDataModel(requirement),
      api_design: generateAPIDesign(requirement)
    },
    
    implementation_plan: {
      phases: generateImplementationPhases(requirement),
      estimated_effort: estimateEffort(requirement),
      milestones: generateMilestones(requirement)
    },
    
    success_criteria: {
      functional_tests: generateTestCriteria(requirement),
      performance_targets: generatePerformanceTargets(requirement)
    }
  };
  
  // 保存 PRD
  const prdPath = path.join(PRD_DIR, `${prd.metadata.id}.json`);
  fs.writeFileSync(prdPath, JSON.stringify(prd, null, 2));
  
  // 同时生成 Markdown 版本便于阅读
  const mdPath = path.join(PRD_DIR, `${prd.metadata.id}.md`);
  fs.writeFileSync(mdPath, generateMarkdownPRD(prd));
  
  console.log(`  ✅ PRD 已保存: ${prdPath}`);
  console.log(`  📄 Markdown 版本: ${mdPath}`);
  
  return prd;
}

/**
 * 分析需求类型
 */
function analyzeRequirement(opp) {
  const desc = (opp.description || '').toLowerCase();
  const title = (opp.title || '').toLowerCase();
  
  // 推断应用类型
  let appType = 'web_app';
  if (title.includes('cli') || title.includes('command') || desc.includes('command line')) {
    appType = 'cli_tool';
  } else if (title.includes('api') || desc.includes('api') || desc.includes('rest')) {
    appType = 'api_service';
  } else if (title.includes('extension') || title.includes('plugin') || desc.includes('browser extension')) {
    appType = 'browser_extension';
  } else if (title.includes('mobile') || desc.includes('ios') || desc.includes('android')) {
    appType = 'mobile_app';
  }
  
  // 推断复杂度
  let complexity = 'medium';
  const simpleKeywords = ['simple', 'basic', 'minimal', 'tiny'];
  const complexKeywords = ['complex', 'enterprise', 'scalable', 'distributed', 'platform'];
  
  if (simpleKeywords.some(k => desc.includes(k) || title.includes(k))) {
    complexity = 'low';
  } else if (complexKeywords.some(k => desc.includes(k) || title.includes(k))) {
    complexity = 'high';
  }
  
  return {
    app_type: appType,
    complexity: complexity,
    source_data: opp
  };
}

/**
 * 生成问题陈述
 */
function generateProblemStatement(opp) {
  return `用户需要一个${opp.title}的解决方案。当前存在的问题包括：
1. 现有方案不够完善或不存在
2. 用户在该场景下效率低下
3. 需要一个更专业、更聚焦的工具

通过构建${opp.title}，我们可以解决这些痛点。`;
}

/**
 * 推断目标用户
 */
function inferTargetUsers(opp) {
  const users = ['开发者', '技术从业者'];
  
  const desc = (opp.description || '').toLowerCase();
  if (desc.includes('design') || desc.includes('ui') || desc.includes('css')) {
    users.push('设计师');
  }
  if (desc.includes('data') || desc.includes('analytics')) {
    users.push('数据分析师');
  }
  if (desc.includes('product') || desc.includes('manager')) {
    users.push('产品经理');
  }
  
  return users;
}

/**
 * 生成价值主张
 */
function generateValueProposition(opp) {
  return `${opp.title} 提供了一个简单、高效的解决方案，帮助用户：
- 节省时间，提高效率
- 减少重复性工作
- 获得更好的结果`;
}

/**
 * 生成功能需求
 */
function generateFunctionalRequirements(req) {
  const baseFeatures = [
    {
      id: 'F1',
      priority: 'P0',
      title: '核心功能',
      description: '实现主要业务逻辑',
      acceptance_criteria: [
        '用户可以使用核心功能完成主要任务',
        '功能稳定，无明显bug'
      ]
    },
    {
      id: 'F2',
      priority: 'P0',
      title: '用户界面',
      description: '提供直观的用户界面',
      acceptance_criteria: [
        '界面清晰易懂',
        '响应式设计（如适用）'
      ]
    },
    {
      id: 'F3',
      priority: 'P1',
      title: '配置选项',
      description: '允许用户自定义行为',
      acceptance_criteria: [
        '提供合理的默认配置',
        '配置简单明了'
      ]
    }
  ];
  
  // 根据应用类型添加特定功能
  if (req.app_type === 'cli_tool') {
    baseFeatures.push({
      id: 'F4',
      priority: 'P1',
      title: '命令行参数',
      description: '支持丰富的命令行参数',
      acceptance_criteria: ['支持 --help', '参数解析正确']
    });
  }
  
  if (req.app_type === 'api_service') {
    baseFeatures.push({
      id: 'F4',
      priority: 'P0',
      title: 'REST API',
      description: '提供标准的REST接口',
      acceptance_criteria: ['符合RESTful设计', '返回JSON格式']
    });
  }
  
  return baseFeatures;
}

/**
 * 生成非功能需求
 */
function generateNonFunctionalRequirements(req) {
  return [
    {
      category: '性能',
      requirements: [
        '响应时间 < 1秒（简单操作）',
        '支持并发用户访问（如适用）'
      ]
    },
    {
      category: '可靠性',
      requirements: [
        '错误处理完善',
        '提供有意义的错误信息'
      ]
    },
    {
      category: '可维护性',
      requirements: [
        '代码结构清晰',
        '适当的注释和文档'
      ]
    },
    {
      category: '安全性',
      requirements: [
        '输入验证',
        '防止常见安全漏洞'
      ]
    }
  ];
}

/**
 * 推荐架构
 */
function recommendArchitecture(req) {
  const architectures = {
    'cli_tool': '单文件/模块化CLI架构',
    'web_app': '前后端分离（SPA + API）',
    'api_service': '微服务或单体API架构',
    'browser_extension': 'Manifest V3 扩展架构'
  };
  
  return {
    pattern: architectures[req.app_type] || '模块化架构',
    description: '采用清晰的分层设计，便于维护和扩展',
    components: [
      { name: '核心逻辑层', responsibility: '业务逻辑处理' },
      { name: '接口层', responsibility: '用户交互（CLI/GUI/API）' },
      { name: '数据层', responsibility: '数据存储和读取' }
    ]
  };
}

/**
 * 推荐技术栈
 */
function recommendTechStack(req, opp) {
  const language = opp.language?.toLowerCase() || 'typescript';
  
  const stacks = {
    'typescript': {
      language: 'TypeScript',
      runtime: 'Node.js',
      framework: req.app_type === 'cli_tool' ? 'oclif/commander' : 'Next.js/Express',
      testing: 'Jest/Vitest',
      linting: 'ESLint + Prettier'
    },
    'javascript': {
      language: 'JavaScript',
      runtime: 'Node.js',
      framework: req.app_type === 'cli_tool' ? 'commander' : 'Express',
      testing: 'Jest',
      linting: 'ESLint'
    },
    'python': {
      language: 'Python',
      runtime: 'Python 3.10+',
      framework: req.app_type === 'cli_tool' ? 'Click/Typer' : 'FastAPI/Flask',
      testing: 'pytest',
      linting: 'ruff/black'
    },
    'rust': {
      language: 'Rust',
      runtime: 'Native',
      framework: req.app_type === 'cli_tool' ? 'clap' : 'Actix-web/Axum',
      testing: 'cargo test',
      linting: 'clippy'
    },
    'go': {
      language: 'Go',
      runtime: 'Native',
      framework: req.app_type === 'cli_tool' ? 'cobra' : 'Gin/Echo',
      testing: 'go test',
      linting: 'golangci-lint'
    }
  };
  
  return stacks[language] || stacks['typescript'];
}

/**
 * 生成数据模型
 */
function generateDataModel(req) {
  // 基础数据模型
  return {
    entities: [
      {
        name: 'UserConfig',
        fields: [
          { name: 'id', type: 'string', description: '唯一标识' },
          { name: 'settings', type: 'object', description: '用户配置' },
          { name: 'created_at', type: 'datetime', description: '创建时间' }
        ]
      },
      {
        name: 'DataRecord',
        fields: [
          { name: 'id', type: 'string', description: '唯一标识' },
          { name: 'data', type: 'object', description: '业务数据' },
          { name: 'updated_at', type: 'datetime', description: '更新时间' }
        ]
      }
    ]
  };
}

/**
 * 生成API设计
 */
function generateAPIDesign(req) {
  if (req.app_type === 'cli_tool') {
    return {
      type: 'CLI',
      commands: [
        { command: 'create', description: '创建新项', args: ['name'] },
        { command: 'list', description: '列出所有项', args: [] },
        { command: 'delete', description: '删除项', args: ['id'] }
      ]
    };
  }
  
  return {
    type: 'REST',
    endpoints: [
      { method: 'GET', path: '/api/items', description: '获取列表' },
      { method: 'POST', path: '/api/items', description: '创建项' },
      { method: 'GET', path: '/api/items/:id', description: '获取详情' },
      { method: 'PUT', path: '/api/items/:id', description: '更新项' },
      { method: 'DELETE', path: '/api/items/:id', description: '删除项' }
    ]
  };
}

/**
 * 生成实现阶段
 */
function generateImplementationPhases(req) {
  return [
    {
      phase: 1,
      name: '基础架构',
      duration: '1-2天',
      tasks: ['项目初始化', '目录结构', '基础配置']
    },
    {
      phase: 2,
      name: '核心功能',
      duration: '2-3天',
      tasks: ['实现主要业务逻辑', '编写单元测试']
    },
    {
      phase: 3,
      name: '用户界面',
      duration: '1-2天',
      tasks: ['CLI命令/GUI/API', '交互优化']
    },
    {
      phase: 4,
      name: '完善和发布',
      duration: '1天',
      tasks: ['文档编写', '发布准备']
    }
  ];
}

/**
 * 估算工作量
 */
function estimateEffort(req) {
  const efforts = {
    'low': { days: '3-5', story_points: '8-13' },
    'medium': { days: '5-10', story_points: '13-21' },
    'high': { days: '10-20', story_points: '21-40' }
  };
  
  return efforts[req.complexity] || efforts['medium'];
}

/**
 * 生成里程碑
 */
function generateMilestones(req) {
  return [
    { name: 'MVP完成', description: '核心功能可用', criteria: ['功能完整', '基础测试通过'] },
    { name: 'Beta发布', description: '可对外测试', criteria: ['文档完整', '已知问题修复'] },
    { name: '正式版', description: '生产就绪', criteria: ['所有测试通过', '性能达标'] }
  ];
}

/**
 * 生成测试标准
 */
function generateTestCriteria(req) {
  return [
    '所有功能需求都有对应的测试用例',
    '单元测试覆盖率 > 60%',
    '关键路径有集成测试',
    '手动测试通过验收标准'
  ];
}

/**
 * 生成性能目标
 */
function generatePerformanceTargets(req) {
  return [
    '启动时间 < 3秒（如适用）',
    '简单操作响应 < 1秒',
    '内存占用合理',
    '无内存泄漏'
  ];
}

/**
 * 生成 Markdown 格式的 PRD
 */
function generateMarkdownPRD(prd) {
  return `# ${prd.metadata.title} - 产品需求文档

**版本**: ${prd.metadata.version}  
**创建时间**: ${prd.metadata.created_at}  
**来源**: ${prd.metadata.source}

---

## 1. 产品概述

### 1.1 问题陈述
${prd.overview.problem_statement}

### 1.2 目标用户
${prd.overview.target_users.join('、')}

### 1.3 价值主张
${prd.overview.value_proposition}

---

## 2. 功能需求

${prd.requirements.functional.map(f => `
### ${f.id}: ${f.title} (${f.priority})

**描述**: ${f.description}

**验收标准**:
${f.acceptance_criteria.map(c => `- ${c}`).join('\n')}
`).join('\n')}

---

## 3. 非功能需求

${prd.requirements.non_functional.map(nf => `
### ${nf.category}
${nf.requirements.map(r => `- ${r}`).join('\n')}
`).join('\n')}

---

## 4. 技术设计

### 4.1 架构
**模式**: ${prd.technical_design.architecture.pattern}

**组件**:
${prd.technical_design.architecture.components.map(c => `- **${c.name}**: ${c.responsibility}`).join('\n')}

### 4.2 技术栈
${Object.entries(prd.technical_design.tech_stack).map(([k, v]) => `- **${k}**: ${v}`).join('\n')}

### 4.3 数据模型
${prd.technical_design.data_model.entities.map(e => `
**${e.name}**:
${e.fields.map(f => `- ${f.name} (${f.type}): ${f.description}`).join('\n')}
`).join('\n')}

### 4.4 API设计
**类型**: ${prd.technical_design.api_design.type}

${prd.technical_design.api_design.type === 'CLI' 
  ? prd.technical_design.api_design.commands.map(c => `- \`${c.command}\`: ${c.description}`).join('\n')
  : prd.technical_design.api_design.endpoints.map(e => `- \`${e.method} ${e.path}\`: ${e.description}`).join('\n')
}

---

## 5. 实现计划

### 5.1 阶段划分
${prd.implementation_plan.phases.map(p => `
**阶段 ${p.phase}: ${p.name}** (${p.duration})
${p.tasks.map(t => `- ${t}`).join('\n')}
`).join('\n')}

### 5.2 工作量估算
- **预计天数**: ${prd.implementation_plan.estimated_effort.days}
- **故事点**: ${prd.implementation_plan.estimated_effort.story_points}

### 5.3 里程碑
${prd.implementation_plan.milestones.map(m => `
**${m.name}**: ${m.description}
完成标准:
${m.criteria.map(c => `- ${c}`).join('\n')}
`).join('\n')}

---

## 6. 成功标准

### 6.1 功能测试
${prd.success_criteria.functional_tests.map(t => `- ${t}`).join('\n')}

### 6.2 性能目标
${prd.success_criteria.performance_targets.map(t => `- ${t}`).join('\n')}

---

*文档由 AutoFactory Architect Agent 自动生成*
`;
}

/**
 * 生成唯一ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * 主运行函数
 */
async function run(opportunities) {
  console.log('🏗️  Architect Agent 启动');
  console.log(`📋 处理 ${opportunities.length} 个需求\n`);
  
  const prds = [];
  for (const opp of opportunities) {
    const prd = await generatePRD(opp);
    prds.push(prd);
  }
  
  console.log(`\n✅ 完成 ${prds.length} 个 PRD 设计`);
  console.log('下一步：启动 Developer 代理开始编码');
  
  return prds;
}

// 如果直接运行
if (require.main === module) {
  // 从命令行参数读取需求
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('用法: node architect.js \u003copportunity-json\u003e');
    process.exit(1);
  }
  
  const opportunities = args.map(arg => JSON.parse(arg));
  run(opportunities).catch(console.error);
}

module.exports = { run, generatePRD };
