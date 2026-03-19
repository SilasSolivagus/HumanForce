#!/usr/bin/env node
/**
 * Scout Agent - Web3 专项需求矿工
 * 
 * 专注挖掘:
 * - Web3/区块链相关的热门仓库
 * - DeFi、NFT、DAO、智能合约相关项目
 * - Web3 开发者工具需求
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const MEMORY_DIR = path.join(__dirname, '..', 'memory');
const OPPORTUNITIES_FILE = path.join(MEMORY_DIR, 'web3-opportunities.json');

if (!fs.existsSync(MEMORY_DIR)) {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

let opportunities = [];
if (fs.existsSync(OPPORTUNITIES_FILE)) {
  opportunities = JSON.parse(fs.readFileSync(OPPORTUNITIES_FILE, 'utf8'));
}

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
 * Web3 关键词分类
 */
const WEB3_CATEGORIES = {
  'defi': ['defi', 'dex', 'amm', 'yield', 'staking', 'lending', 'borrow', 'vault', 'liquidity', 'sushi', 'curve', 'aave', 'compound'],
  'nft': ['nft', 'erc721', 'erc1155', 'marketplace', 'mint', 'collection', 'opensea', 'blur'],
  'dao': ['dao', 'governance', 'proposal', 'voting', 'snapshot', 'treasury'],
  'wallet': ['wallet', 'metamask', 'rainbow', 'connect', 'signer', 'private key', 'seed phrase'],
  'smart-contract': ['smart contract', 'solidity', 'vyper', 'hardhat', 'foundry', 'truffle', 'slither', 'openzeppelin'],
  'bridge': ['bridge', 'cross-chain', 'interoperability', 'layerzero', 'wormhole', 'axelar'],
  'infra': ['rpc', 'node', 'indexer', 'thegraph', 'subgraph', 'ipfs', 'arweave', 'storage'],
  'security': ['audit', 'exploit', 'flash loan', 'sandwich', 'mev', 'security'],
  'analytics': ['dashboard', 'portfolio', 'tracking', 'analytics', 'defillama', 'dune'],
  'identity': ['did', 'soulbound', 'identity', 'verifiable credential', 'ens', 'lens']
};

function categorizeWeb3(text) {
  const lower = text.toLowerCase();
  const categories = [];
  
  for (const [cat, keywords] of Object.entries(WEB3_CATEGORIES)) {
    if (keywords.some(k => lower.includes(k))) {
      categories.push(cat);
    }
  }
  
  return categories.length > 0 ? categories : ['general'];
}

/**
 * 扫描 Web3 热门仓库
 */
async function scanWeb3Repos() {
  console.log('🔍 扫描 Web3 热门仓库...');
  const results = [];
  
  const web3Topics = ['web3', 'ethereum', 'solidity', 'defi', 'nft', 'blockchain', 'smart-contracts', 'cryptocurrency'];
  
  for (const topic of web3Topics) {
    try {
      const url = `https://api.github.com/search/repositories?q=topic:${topic}+stars:>100+created:>2024-01-01&sort=stars&order=desc&per_page=20`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AutoFactory-Scout-Web3',
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (response.status === 200) {
        const data = JSON.parse(response.body);
        for (const repo of data.items || []) {
          const categories = categorizeWeb3(repo.description + ' ' + repo.topics.join(' '));
          
          results.push({
            source: 'github',
            type: 'web3_repo',
            title: repo.name,
            description: repo.description || '',
            url: repo.html_url,
            stars: repo.stargazers_count,
            language: repo.language,
            web3_categories: categories,
            topics: repo.topics,
            created_at: repo.created_at,
            raw_data: repo
          });
        }
      }
    } catch (err) {
      console.error(`扫描 ${topic} 失败:`, err.message);
    }
  }
  
  // 去重
  const unique = new Map();
  results.forEach(r => unique.set(r.url, r));
  
  console.log(`  ✅ 发现 ${unique.size} 个 Web3 项目`);
  return Array.from(unique.values());
}

/**
 * 扫描 Web3 Good First Issues
 */
async function scanWeb3Issues() {
  console.log('🔍 扫描 Web3 Good First Issues...');
  const results = [];
  
  const web3Labels = ['good first issue', 'help wanted', 'beginner friendly'];
  const web3Repos = [
    'ethereum/go-ethereum',
    'metamask/metamask-extension',
    'Uniswap/v3-core',
    'aave/aave-v3-core',
    'OpenZeppelin/openzeppelin-contracts',
    'hardhat/hardhat',
    'foundry-rs/foundry',
    'wagmi-dev/wagmi',
    'rainbow-me/rainbowkit',
    'ethers-io/ethers.js',
    'web3/web3.js'
  ];
  
  for (const repo of web3Repos.slice(0, 5)) {
    for (const label of web3Labels.slice(0, 2)) {
      try {
        const url = `https://api.github.com/repos/${repo}/issues?state=open&labels=${encodeURIComponent(label)}&per_page=10`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'AutoFactory-Scout-Web3',
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (response.status === 200) {
          const issues = JSON.parse(response.body);
          for (const issue of issues) {
            if (issue.pull_request) continue;
            
            const categories = categorizeWeb3(issue.title + ' ' + (issue.body || ''));
            
            results.push({
              source: 'github',
              type: 'web3_issue',
              title: issue.title,
              description: issue.body ? issue.body.substring(0, 500) : '',
              url: issue.html_url,
              repo: repo,
              labels: issue.labels.map(l => l.name),
              web3_categories: categories,
              created_at: issue.created_at,
              raw_data: issue
            });
          }
        }
      } catch (err) {
        // 静默失败，继续下一个
      }
    }
  }
  
  console.log(`  ✅ 发现 ${results.length} 个 Web3 issues`);
  return results;
}

/**
 * Web3 专项评估
 */
function assessWeb3Opportunity(opp) {
  const scores = {
    community_interest: 0,
    implementation_scope: 0,
    market_gap: 0,
    web3_fit: 0,
    innovation: 0
  };
  
  // 社区关注度
  if (opp.stars) {
    scores.community_interest = Math.min(opp.stars / 500, 10);
  } else {
    scores.community_interest = 5;
  }
  
  // Web3 领域匹配度
  const catCount = opp.web3_categories?.length || 0;
  scores.web3_fit = Math.min(5 + catCount * 1.5, 10);
  
  // 实现复杂度（Web3 项目通常更复杂）
  const desc = (opp.description || '').toLowerCase();
  const complexKeywords = ['protocol', 'consensus', 'cryptography', 'zero knowledge', 'zk', 'rollup'];
  const simpleKeywords = ['tool', 'cli', 'utility', 'automation', 'script', 'converter'];
  
  let complexity = 5;
  complexKeywords.forEach(word => {
    if (desc.includes(word)) complexity += 1.5;
  });
  simpleKeywords.forEach(word => {
    if (desc.includes(word)) complexity -= 2;
  });
  scores.implementation_scope = Math.max(0, Math.min(10, 10 - complexity));
  
  // 市场空白度（基于类别独特性）
  const uniqueCats = opp.web3_categories || [];
  if (uniqueCats.includes('infrastructure') || uniqueCats.includes('security')) {
    scores.market_gap = 8;
  } else if (uniqueCats.includes('analytics') || uniqueCats.includes('identity')) {
    scores.market_gap = 8.5;
  } else {
    scores.market_gap = 6.5;
  }
  
  // 创新性
  const innovative = ['ai', 'agent', 'automation', 'cross-chain', 'modular', 'intent'];
  if (innovative.some(k => desc.includes(k))) {
    scores.innovation = 9;
  } else {
    scores.innovation = 6;
  }
  
  // 计算总分（Web3 权重调整）
  const weights = {
    community_interest: 0.25,
    implementation_scope: 0.2,
    market_gap: 0.2,
    web3_fit: 0.25,
    innovation: 0.1
  };
  
  const totalScore = (
    scores.community_interest * weights.community_interest +
    scores.implementation_scope * weights.implementation_scope +
    scores.market_gap * weights.market_gap +
    scores.web3_fit * weights.web3_fit +
    scores.innovation * weights.innovation
  );
  
  return {
    ...opp,
    scores,
    total_score: Math.round(totalScore * 10) / 10,
    assessed_at: new Date().toISOString()
  };
}

function filterNewOpportunities(newOpps) {
  const existingUrls = new Set(opportunities.map(o => o.url));
  return newOpps.filter(o => !existingUrls.has(o.url));
}

function saveOpportunities() {
  fs.writeFileSync(OPPORTUNITIES_FILE, JSON.stringify(opportunities, null, 2));
}

/**
 * 主运行函数
 */
async function run() {
  console.log('🚀 Web3 Scout Agent 启动');
  console.log(`📊 已有 ${opportunities.length} 个 Web3 机会在库中\n`);
  
  const allNewOpportunities = [];
  
  const [web3Repos, web3Issues] = await Promise.all([
    scanWeb3Repos(),
    scanWeb3Issues()
  ]);
  
  allNewOpportunities.push(...web3Repos, ...web3Issues);
  
  const newOpps = filterNewOpportunities(allNewOpportunities);
  console.log(`\n🆕 发现 ${newOpps.length} 个新 Web3 机会`);
  
  const assessedOpps = newOpps.map(assessWeb3Opportunity);
  assessedOpps.sort((a, b) => b.total_score - a.total_score);
  
  opportunities.push(...assessedOpps);
  saveOpportunities();
  
  console.log('\n📋 Web3 评估结果（按分数排序）：');
  console.log('=' .repeat(80));
  
  assessedOpps.forEach((opp, i) => {
    const passThreshold = opp.total_score >= 7.0;
    const status = passThreshold ? '✅ 推荐' : '⏸️  观察';
    const catBadge = opp.web3_categories?.slice(0, 3).map(c => `[${c}]`).join(' ') || '';
    
    console.log(`\n${i + 1}. [${status}] ${opp.title} ${catBadge}`);
    console.log(`   📎 ${opp.url}`);
    console.log(`   📝 ${opp.description?.substring(0, 100) || 'No description'}...`);
    console.log(`   📊 分数: ${opp.total_score}/10`);
    console.log(`      - 社区关注度: ${opp.scores.community_interest.toFixed(1)}`);
    console.log(`      - Web3 匹配度: ${opp.scores.web3_fit.toFixed(1)}`);
    console.log(`      - 实现难度: ${opp.scores.implementation_scope.toFixed(1)} (越高越简单)`);
    console.log(`      - 市场空白: ${opp.scores.market_gap.toFixed(1)}`);
  });
  
  const recommended = assessedOpps.filter(o => o.total_score >= 7.0);
  console.log(`\n🎯 推荐进入开发流水线: ${recommended.length} 个`);
  
  // 按类别汇总
  const catCount = {};
  assessedOpps.forEach(o => {
    (o.web3_categories || []).forEach(c => {
      catCount[c] = (catCount[c] || 0) + 1;
    });
  });
  
  console.log('\n📊 类别分布:');
  Object.entries(catCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} 个`);
    });
  
  return recommended;
}

if (require.main === module) {
  run().catch(console.error);
}

module.exports = { run, assessWeb3Opportunity };
