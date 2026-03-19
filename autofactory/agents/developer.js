#!/usr/bin/env node
/**
 * Developer Agent - 开发者
 * 
 * 职责：
 * 1. 根据 PRD 编写代码
 * 2. 使用 coding-agent 技能（Codex/Claude）实现功能
 * 3. 运行测试确保代码质量
 * 4. 提交代码到仓库
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PRD_DIR = path.join(__dirname, '..', 'outputs', 'prd');
const PROJECTS_DIR = path.join(__dirname, '..', 'outputs', 'projects');

// 确保目录存在
if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

/**
 * 基于 PRD 创建项目
 */
async function developProject(prd) {
  console.log(`💻 开始开发项目: ${prd.metadata.title}`);
  
  const projectDir = path.join(PROJECTS_DIR, prd.metadata.id);
  
  // 创建项目目录
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }
  
  // 生成开发指令
  const devInstructions = generateDevInstructions(prd, projectDir);
  
  // 保存开发指令
  const instructionsPath = path.join(projectDir, 'DEV_INSTRUCTIONS.md');
  fs.writeFileSync(instructionsPath, devInstructions);
  
  console.log(`  📄 开发指令已保存: ${instructionsPath}`);
  console.log(`  📁 项目目录: ${projectDir}`);
  
  // 返回开发任务信息
  return {
    prd,
    project_dir: projectDir,
    instructions_path: instructionsPath,
    ready_for_coding: true
  };
}

/**
 * 生成开发指令
 */
function generateDevInstructions(prd, projectDir) {
  const tech = prd.technical_design.tech_stack;
  const arch = prd.technical_design.architecture;
  
  return `# 开发指令: ${prd.metadata.title}

## 项目信息
- **ID**: ${prd.metadata.id}
- **目录**: ${projectDir}
- **技术栈**: ${tech.language} / ${tech.runtime} / ${tech.framework}
- **复杂度**: ${prd.implementation_plan.estimated_effort.days} 天

## 初始化步骤

### 1. 项目初始化
\`\`\`bash
cd ${projectDir}

# 初始化 Git
git init

# 创建基础目录结构
mkdir -p src tests docs

# 创建 .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
build/
*.log
.env
.env.local
.DS_Store
coverage/
EOF
\`\`\`

### 2. 技术栈配置

${generateTechSetup(prd)}

### 3. 实现计划

${prd.implementation_plan.phases.map(p => `
#### 阶段 ${p.phase}: ${p.name} (${p.duration})
${p.tasks.map(t => `- [ ] ${t}`).join('\n')}
`).join('\n')}

## 功能需求实现

${prd.requirements.functional.map(f => `
### ${f.id}: ${f.title} (${f.priority})

**描述**: ${f.description}

**验收标准**:
${f.acceptance_criteria.map(c => `- [ ] ${c}`).join('\n')}
`).join('\n')}

## 代码规范

1. **命名规范**: 使用有意义的变量名和函数名
2. **注释**: 复杂逻辑需要注释说明
3. **错误处理**: 所有异步操作需要 try/catch
4. **测试**: 每个功能模块需要有单元测试
5. **类型**: 使用 TypeScript 时确保类型完整

## 提交规范

\`\`\`
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
\`\`\`

## 成功标准

- [ ] 所有 P0 功能完成
- [ ] 单元测试覆盖率 > 60%
- [ ] 代码通过 Lint 检查
- [ ] 手动测试通过

---

**开始开发**:
使用 coding-agent 在此目录执行开发任务。
`;
}

/**
 * 生成技术栈配置指南
 */
function generateTechSetup(prd) {
  const tech = prd.technical_design.tech_stack;
  const lang = tech.language.toLowerCase();
  
  const setups = {
    'typescript': `\`\`\`bash
# 初始化 package.json
npm init -y

# 安装 TypeScript
npm install -D typescript @types/node ts-node

# 初始化 TypeScript 配置
npx tsc --init

# 安装框架和工具
${tech.framework.includes('Next') ? 'npm install next react react-dom' : 'npm install express'}
npm install -D jest @types/jest eslint prettier

# 配置 ESLint
cat > .eslintrc.json << 'EOF'
{
  "extends": ["eslint:recommended", "@typescript-eslint/recommended"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"]
}
EOF
\`\`\``,

    'javascript': `\`\`\`bash
# 初始化 package.json
npm init -y

# 安装依赖
${tech.framework.includes('Express') ? 'npm install express' : 'npm install commander'}
npm install -D jest eslint

# 配置 package.json 脚本
cat > package.json << 'EOF'
{
  "name": "${prd.metadata.id}",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/index.js",
    "test": "jest",
    "lint": "eslint src/"
  }
}
EOF
\`\`\``,

    'python': `\`\`\`bash
# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 创建 requirements.txt
cat > requirements.txt << 'EOF'
${tech.framework.includes('FastAPI') ? 'fastapi\nuvicorn' : 'flask'}
pytest
black
flake8
EOF

# 安装依赖
pip install -r requirements.txt

# 创建 pyproject.toml
cat > pyproject.toml << 'EOF'
[tool.black]
line-length = 88

[tool.pytest.ini_options]
testpaths = ["tests"]
EOF
\`\`\``,

    'rust': `\`\`\`bash
# 初始化 Cargo 项目
cargo init --name ${prd.metadata.id.replace(/-/g, '_')}

# 添加依赖（根据需要在 Cargo.toml 中添加）
${tech.framework.includes('clap') ? '# CLI 工具 - clap 已包含在标准模板中' : ''}

# 配置项目
cat >> Cargo.toml << 'EOF'

[profile.release]
opt-level = 3
EOF
\`\`\``,

    'go': `\`\`\`bash
# 初始化 Go 模块
go mod init ${prd.metadata.id}

# 安装依赖
${tech.framework.includes('Gin') ? 'go get -u github.com/gin-gonic/gin' : ''}
${tech.framework.includes('cobra') ? 'go get -u github.com/spf13/cobra' : ''}
\`\`\``
  };
  
  return setups[lang] || setups['typescript'];
}

/**
 * 生成给 coding-agent 的提示词
 */
function generateCodingPrompt(project) {
  const prd = project.prd;
  
  return `你是一个专业的软件开发者。请根据以下 PRD 开发一个完整的项目。

## 项目概述
- **名称**: ${prd.metadata.title}
- **技术栈**: ${prd.technical_design.tech_stack.language}
- **类型**: ${prd.technical_design.architecture.pattern}

## 工作目录
${project.project_dir}

## 开发步骤

1. **初始化项目**
   - 按照 DEV_INSTRUCTIONS.md 中的步骤初始化项目
   - 设置好所有配置文件

2. **实现核心功能**
   ${prd.requirements.functional.filter(f => f.priority === 'P0').map(f => `- ${f.title}: ${f.description}`).join('\n   ')}

3. **编写测试**
   - 为每个主要功能编写单元测试
   - 确保测试覆盖率 > 60%

4. **完善项目**
   - 添加 README.md
   - 添加必要的文档
   - 确保代码通过 lint 检查

## 要求
- 代码质量高，结构清晰
- 遵循 PRD 中的技术设计
- 所有 P0 功能必须完成
- 包含基础测试

开始开发吧！`;
}

/**
 * 启动 coding agent 进行开发
 */
async function startCodingAgent(project) {
  console.log(`  🤖 启动 Coding Agent...`);
  
  const prompt = generateCodingPrompt(project);
  
  // 生成启动脚本
  const scriptPath = path.join(project.project_dir, 'start_dev.sh');
  const scriptContent = `#!/bin/bash
# 开发启动脚本 - 由 AutoFactory 生成

cd "${project.project_dir}"

# 使用 Codex 进行开发
# 注意：需要手动运行以下命令
echo "请在项目目录运行:"
echo "  codex exec --full-auto '$(echo "${prompt.replace(/'/g, "'\"'\"'")}"'"
`;
  
  fs.writeFileSync(scriptPath, scriptContent);
  fs.chmodSync(scriptPath, 0o755);
  
  // 同时保存 prompt 文件
  const promptPath = path.join(project.project_dir, 'CODING_PROMPT.txt');
  fs.writeFileSync(promptPath, prompt);
  
  console.log(`  ✅ 开发脚本已生成: ${scriptPath}`);
  console.log(`  📝 Coding Prompt 已保存: ${promptPath}`);
  
  return {
    ...project,
    prompt,
    script_path: scriptPath,
    prompt_path: promptPath
  };
}

/**
 * 主运行函数
 */
async function run(prds) {
  console.log('💻 Developer Agent 启动');
  console.log(`📋 处理 ${prds.length} 个 PRD\n`);
  
  const projects = [];
  for (const prd of prds) {
    const project = await developProject(prd);
    const projectWithAgent = await startCodingAgent(project);
    projects.push(projectWithAgent);
  }
  
  console.log(`\n✅ 准备了 ${projects.length} 个项目`);
  console.log('\n下一步：');
  console.log('1. 运行各项目目录下的 start_dev.sh');
  console.log('2. 或使用 codex/claude 在对应目录执行开发');
  
  return projects;
}

// 如果直接运行
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('用法: node developer.js <prd-json-file>');
    process.exit(1);
  }
  
  const prds = args.map(arg => JSON.parse(fs.readFileSync(arg, 'utf8')));
  run(prds).catch(console.error);
}

module.exports = { run, developProject, startCodingAgent };
