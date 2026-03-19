#!/usr/bin/env node
/**
 * Scout Agent - 需求矿工
 * 
 * 职责：
 * 1. 持续扫描多个平台（GitHub、Reddit、Product Hunt、HN）
 * 2. 识别潜在软件需求
 * 3. 评估可行性并打分
 * 4. 将高分需求推送到开发流水线
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 配置文件路径
const CONFIG_PATH = path.join(__dirname, 'config.yaml');
const MEMORY_DIR = path.join(__dirname, 'memory');
const OPPORTUNITIES_FILE = path.join(MEMORY_DIR, 'opportunities.json');

// 确保目录存在
if (!fs.existsSync(MEMORY_DIR)) {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

// 确保目录存在
if (!fs.existsSync(MEMORY_DIR)) {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

// 加载已有机会
let opportunities = [];
if (fs.existsSync(OPPORTUNITIES_FILE)) {
  opportunities = JSON.parse(fs.readFileSync(OPPORTUNITIES_FILE, 'utf8'));
}

/**
 * 发送 HTTP 请求
 */
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { ...options, timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * GitHub Trending 抓取
 */
async function scanGitHubTrending() {
  console.log('🔍 扫描 GitHub Trending...');
  const results = [];
  
  const languages = ['typescript', 'python', 'rust', 'go', 'javascript'];
  
  for (const lang of languages) {
    try {
      // 使用 GitHub 搜索 API 找最近热门的项目
      const url = `https://api.github.com/search/repositories?q=language:${lang}+created:>2024-01-01&sort=stars&order=desc&per_page=10`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AutoFactory-Scout',
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (response.status === 200) {
        const data = JSON.parse(response.body);
        for (const repo of data.items || []) {
          results.push({
            source: 'github',
            type: 'trending_repo',
            title: repo.name,
            description: repo.description || '',
            url: repo.html_url,
            stars: repo.stargazers_count,
            language: repo.language,
            created_at: repo.created_at,
            raw_data: repo
          });
        }
      }
    } catch (err) {
      console.error(`GitHub ${lang} 扫描失败:`, err.message);
    }
  }
  
  console.log(`  ✅ 发现 ${results.length} 个热门项目`);
  return results;
}

/**
 * GitHub Good First Issues 扫描
 */
async function scanGitHubIssues() {
  console.log('🔍 扫描 GitHub Good First Issues...');
  const results = [];
  
  const labels = ['good first issue', 'help wanted'];
  
  for (const label of labels) {
    try {
      // 搜索带有特定标签的 issues
      const url = `https://api.github.com/search/issues?q=label:"${encodeURIComponent(label)}"+state:open+created:>2024-01-01&sort=created&order=desc&per_page=10`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AutoFactory-Scout',
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (response.status === 200) {
        const data = JSON.parse(response.body);
        for (const issue of data.items || []) {
          // 解析仓库信息
          const repoMatch = issue.html_url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
          if (repoMatch) {
            results.push({
              source: 'github',
              type: 'good_first_issue',
              title: issue.title,
              description: issue.body ? issue.body.substring(0, 500) : '',
              url: issue.html_url,
              repo: `${repoMatch[1]}/${repoMatch[2]}`,
              labels: issue.labels.map(l => l.name),
              created_at: issue.created_at,
              raw_data: issue
            });
          }
        }
      }
    } catch (err) {
      console.error(`GitHub issues 扫描失败:`, err.message);
    }
  }
  
  console.log(`  ✅ 发现 ${results.length} 个 good first issues`);
  return results;
}

/**
 * Reddit 扫描（模拟 - 需要 Reddit API）
 */
async function scanReddit() {
  console.log('🔍 扫描 Reddit...');
  // Reddit 需要 OAuth，这里先返回占位
  // 实际实现需要 Reddit API 认证
  return [];
}

/**
 * 需求可行性评估
 */
function assessOpportunity(opp) {
  const scores = {
    community_interest: 0,
    implementation_scope: 0,
    market_gap: 0,
    tech_fit: 0
  };
  
  // 社区关注度评分（基于 stars、comments 等）
  if (opp.stars) {
    scores.community_interest = Math.min(opp.stars / 1000, 10);
  } else {
    scores.community_interest = 5; // 默认中等
  }
  
  // 实现复杂度评分（反向 - 越简单分数越高）
  const desc = opp.description || '';
  const complexityIndicators = [
    'microservice', 'distributed', 'blockchain', 'AI', 'machine learning',
    'complex', 'enterprise', 'scalable', 'architecture'
  ];
  const simpleIndicators = [
    'simple', 'tool', 'utility', 'cli', 'script', 'automation',
    'converter', 'generator', 'checker', 'formatter'
  ];
  
  let complexity = 5;
  complexityIndicators.forEach(word => {
    if (desc.toLowerCase().includes(word)) complexity += 1;
  });
  simpleIndicators.forEach(word => {
    if (desc.toLowerCase().includes(word)) complexity -= 1;
  });
  scores.implementation_scope = Math.max(0, Math.min(10, 10 - complexity));
  
  // 市场空白度（基于标题关键词独特性）
  scores.market_gap = 7; // 默认假设有一定空间
  
  // 技术栈匹配度
  const preferredLangs = ['typescript', 'javascript', 'python', 'rust', 'go'];
  if (opp.language && preferredLangs.includes(opp.language.toLowerCase())) {
    scores.tech_fit = 9;
  } else {
    scores.tech_fit = 6;
  }
  
  // 计算总分（加权平均）
  const weights = {
    community_interest: 0.3,
    implementation_scope: 0.25,
    market_gap: 0.25,
    tech_fit: 0.2
  };
  
  const totalScore = (
    scores.community_interest * weights.community_interest +
    scores.implementation_scope * weights.implementation_scope +
    scores.market_gap * weights.market_gap +
    scores.tech_fit * weights.tech_fit
  );
  
  return {
    ...opp,
    scores,
    total_score: Math.round(totalScore * 10) / 10,
    assessed_at: new Date().toISOString()
  };
}

/**
 * 过滤已存在的机会
 */
function filterNewOpportunities(newOpps) {
  const existingUrls = new Set(opportunities.map(o => o.url));
  return newOpps.filter(o => !existingUrls.has(o.url));
}

/**
 * 保存机会到文件
 */
function saveOpportunities() {
  fs.writeFileSync(OPPORTUNITIES_FILE, JSON.stringify(opportunities, null, 2));
}

/**
 * 主运行函数
 */
async function run() {
  console.log('🚀 Scout Agent 启动');
  console.log(`📊 已有 ${opportunities.length} 个机会在库中\n`);
  
  const allNewOpportunities = [];
  
  // 并行扫描多个源
  const [githubTrending, githubIssues] = await Promise.all([
    scanGitHubTrending(),
    scanGitHubIssues()
  ]);
  
  allNewOpportunities.push(...githubTrending, ...githubIssues);
  
  // 过滤已存在的
  const newOpps = filterNewOpportunities(allNewOpportunities);
  console.log(`\n🆕 发现 ${newOpps.length} 个新机会`);
  
  // 评估每个机会
  const assessedOpps = newOpps.map(assessOpportunity);
  
  // 按分数排序
  assessedOpps.sort((a, b) => b.total_score - a.total_score);
  
  // 添加到库
  opportunities.push(...assessedOpps);
  saveOpportunities();
  
  // 输出结果
  console.log('\n📋 评估结果（按分数排序）：');
  console.log('=' .repeat(80));
  
  assessedOpps.forEach((opp, i) => {
    const passThreshold = opp.total_score >= 7.0;
    const status = passThreshold ? '✅ 推荐' : '⏸️  观察';
    console.log(`\n${i + 1}. [${status}] ${opp.title}`);
    console.log(`   📎 ${opp.url}`);
    console.log(`   📝 ${opp.description?.substring(0, 100) || 'No description'}...`);
    console.log(`   📊 分数: ${opp.total_score}/10`);
    console.log(`      - 社区关注度: ${opp.scores.community_interest.toFixed(1)}`);
    console.log(`      - 实现难度: ${opp.scores.implementation_scope.toFixed(1)} (越高越简单)`);
    console.log(`      - 市场空白: ${opp.scores.market_gap.toFixed(1)}`);
    console.log(`      - 技术匹配: ${opp.scores.tech_fit.toFixed(1)}`);
  });
  
  // 推荐进入流水线的机会
  const recommended = assessedOpps.filter(o => o.total_score >= 7.0);
  console.log(`\n🎯 推荐进入开发流水线: ${recommended.length} 个`);
  
  if (recommended.length > 0) {
    console.log('\n下一步：启动 Architect 代理进行 PRD 设计');
    // 这里可以触发 Architect 代理
  }
  
  return recommended;
}

// 如果直接运行此文件
if (require.main === module) {
  run().catch(console.error);
}

module.exports = { run, assessOpportunity };
