#!/usr/bin/env node
/**
 * Orchestrator - 调度中心
 * 
 * 职责：
 * 1. 协调各代理之间的工作流
 * 2. 管理任务队列和状态
 * 3. 处理代理之间的数据传递
 * 4. 监控整个生产流程
 */

const fs = require('fs');
const path = require('path');

// 导入各代理
const Scout = require('./agents/scout');
const Architect = require('./agents/architect');
const Developer = require('./agents/developer');

// 目录配置
const ROOT_DIR = __dirname;
const MEMORY_DIR = path.join(ROOT_DIR, 'memory');
const OUTPUTS_DIR = path.join(ROOT_DIR, 'outputs');

// 确保目录存在
[MEMORY_DIR, OUTPUTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 状态文件
const STATE_FILE = path.join(MEMORY_DIR, 'factory_state.json');

/**
 * 加载工厂状态
 */
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
  return {
    version: '1.0.0',
    created_at: new Date().toISOString(),
    runs: [],
    stats: {
      total_opportunities: 0,
      total_prds: 0,
      total_projects: 0,
      total_deployments: 0
    }
  };
}

/**
 * 保存工厂状态
 */
function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/**
 * 打印 banner
 */
function printBanner() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           🏭 AutoFactory - 自主软件生产工厂 🏭               ║
║                                                              ║
║     全自动: 需求挖掘 → 产品设计 → 开发 → 测试 → 部署        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
}

/**
 * 运行完整流水线
 */
async function runPipeline(options = {}) {
  const state = loadState();
  const runId = Date.now().toString(36);
  const runStartTime = Date.now();
  
  const runRecord = {
    id: runId,
    started_at: new Date().toISOString(),
    mode: options.mode || 'full',
    stages: {}
  };
  
  console.log(`\n🚀 启动流水线运行 #${runId}`);
  console.log(`📅 ${new Date().toLocaleString()}`);
  console.log(`⚙️  模式: ${runRecord.mode}\n`);
  
  try {
    // ===== Stage 1: Scout (需求挖掘) =====
    if (!options.skip_scout) {
      console.log('\n' + '='.repeat(60));
      console.log('📡 Stage 1: 需求挖掘 (Scout)');
      console.log('='.repeat(60));
      
      const recommendedOpportunities = await Scout.run();
      runRecord.stages.scout = {
        opportunities_found: recommendedOpportunities.length,
        opportunities: recommendedOpportunities.map(o => ({
          title: o.title,
          score: o.total_score,
          url: o.url
        }))
      };
      
      if (recommendedOpportunities.length === 0) {
        console.log('\n⏸️  未发现符合条件的需求，流水线暂停');
        runRecord.status = 'paused_no_opportunities';
        state.runs.push(runRecord);
        saveState(state);
        return runRecord;
      }
      
      // 继续到下一阶段
      var opportunitiesForArchitect = recommendedOpportunities;
    } else {
      console.log('\n⏭️  跳过 Scout 阶段');
      // 从已有机会中加载
      const oppFile = path.join(MEMORY_DIR, 'opportunities.json');
      if (fs.existsSync(oppFile)) {
        const allOpps = JSON.parse(fs.readFileSync(oppFile, 'utf8'));
        var opportunitiesForArchitect = allOpps.filter(o => o.total_score >= 7.0).slice(0, options.limit || 3);
      } else {
        console.error('❌ 没有找到机会数据，请先运行 Scout');
        process.exit(1);
      }
    }
    
    // ===== Stage 2: Architect (PRD设计) =====
    if (!options.skip_architect && opportunitiesForArchitect.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('🏗️  Stage 2: PRD设计 (Architect)');
      console.log('='.repeat(60));
      
      const prds = await Architect.run(opportunitiesForArchitect.slice(0, options.limit || 3));
      runRecord.stages.architect = {
        prds_created: prds.length,
        prd_ids: prds.map(p => p.metadata.id)
      };
      
      var prdsForDeveloper = prds;
    } else {
      console.log('\n⏭️  跳过 Architect 阶段');
    }
    
    // ===== Stage 3: Developer (开发) =====
    if (!options.skip_developer && prdsForDeveloper && prdsForDeveloper.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('💻 Stage 3: 开发 (Developer)');
      console.log('='.repeat(60));
      
      const projects = await Developer.run(prdsForDeveloper);
      runRecord.stages.developer = {
        projects_created: projects.length,
        project_dirs: projects.map(p => p.project_dir)
      };
      
      console.log('\n📦 项目已准备就绪：');
      projects.forEach((p, i) => {
        console.log(`\n  ${i + 1}. ${p.prd.metadata.title}`);
        console.log(`     📁 ${p.project_dir}`);
        console.log(`     🚀 运行: ${p.script_path}`);
      });
    } else {
      console.log('\n⏭️  跳过 Developer 阶段');
    }
    
    // ===== 完成 =====
    runRecord.status = 'completed';
    runRecord.completed_at = new Date().toISOString();
    runRecord.duration_ms = Date.now() - runStartTime;
    
  } catch (error) {
    console.error('\n❌ 流水线执行失败:', error.message);
    runRecord.status = 'failed';
    runRecord.error = error.message;
    runRecord.completed_at = new Date().toISOString();
    throw error;
  } finally {
    state.runs.push(runRecord);
    saveState(state);
  }
  
  // 打印总结
  printSummary(runRecord);
  
  return runRecord;
}

/**
 * 打印运行总结
 */
function printSummary(run) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 流水线运行总结');
  console.log('='.repeat(60));
  console.log(`运行 ID: ${run.id}`);
  console.log(`状态: ${run.status === 'completed' ? '✅ 完成' : '❌ 失败'}`);
  console.log(`耗时: ${(run.duration_ms / 1000).toFixed(1)} 秒`);
  console.log('\n各阶段结果:');
  
  if (run.stages.scout) {
    console.log(`  📡 Scout: 发现 ${run.stages.scout.opportunities_found} 个机会`);
  }
  if (run.stages.architect) {
    console.log(`  🏗️  Architect: 生成 ${run.stages.architect.prds_created} 个 PRD`);
  }
  if (run.stages.developer) {
    console.log(`  💻 Developer: 准备 ${run.stages.developer.projects_created} 个项目`);
  }
  
  console.log('\n下一步:');
  if (run.stages.developer?.project_dirs?.length > 0) {
    console.log('  1. 查看项目目录下的 CODING_PROMPT.txt');
    console.log('  2. 使用 codex/claude 执行开发');
    console.log('  3. 完成后提交代码并部署');
  } else {
    console.log('  等待下次运行或手动触发开发');
  }
}

/**
 * 打印帮助信息
 */
function printHelp() {
  console.log(`
用法: node orchestrator.js [命令] [选项]

命令:
  run          运行完整流水线 (默认)
  scout        仅运行需求挖掘
  architect    仅运行 PRD 设计（需要已有机会数据）
  develop      仅运行开发（需要已有 PRD）
  status       查看工厂状态
  help         显示此帮助

选项:
  --limit N    限制处理数量（默认: 3）
  --skip-scout      跳过 Scout 阶段
  --skip-architect  跳过 Architect 阶段
  --skip-developer  跳过 Developer 阶段

示例:
  node orchestrator.js run                    # 运行完整流水线
  node orchestrator.js scout                  # 仅挖掘需求
  node orchestrator.js run --limit 5          # 处理最多 5 个需求
  node orchestrator.js develop                # 开发已有 PRD
`);
}

/**
 * 打印状态
 */
function printStatus() {
  const state = loadState();
  
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🏭 AutoFactory 状态                       ║
╚══════════════════════════════════════════════════════════════╝

📊 统计:
  - 总运行次数: ${state.runs.length}
  - 总发现机会: ${state.stats.total_opportunities}
  - 总生成 PRD: ${state.stats.total_prds}
  - 总创建项目: ${state.stats.total_projects}

📜 最近运行:
`);
  
  const recentRuns = state.runs.slice(-5).reverse();
  recentRuns.forEach(run => {
    const statusIcon = run.status === 'completed' ? '✅' : 
                       run.status === 'failed' ? '❌' : '⏸️';
    console.log(`  ${statusIcon} ${run.id} - ${run.started_at} (${run.mode})`);
  });
  
  console.log('');
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'run';
  
  // 解析选项
  const options = {
    limit: 3
  };
  
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      options.limit = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--skip-scout') {
      options.skip_scout = true;
    } else if (args[i] === '--skip-architect') {
      options.skip_architect = true;
    } else if (args[i] === '--skip-developer') {
      options.skip_developer = true;
    }
  }
  
  switch (command) {
    case 'run':
      printBanner();
      await runPipeline(options);
      break;
      
    case 'scout':
      console.log('🔍 仅运行 Scout 阶段');
      await Scout.run();
      break;
      
    case 'architect':
      console.log('🏗️  仅运行 Architect 阶段');
      options.skip_scout = true;
      options.skip_developer = true;
      await runPipeline(options);
      break;
      
    case 'develop':
      console.log('💻 仅运行 Developer 阶段');
      options.skip_scout = true;
      options.skip_architect = true;
      await runPipeline(options);
      break;
      
    case 'status':
      printStatus();
      break;
      
    case 'help':
    case '-h':
    case '--help':
      printHelp();
      break;
      
    default:
      console.error(`❌ 未知命令: ${command}`);
      printHelp();
      process.exit(1);
  }
}

// 运行
main().catch(err => {
  console.error('❌ 错误:', err);
  process.exit(1);
});
