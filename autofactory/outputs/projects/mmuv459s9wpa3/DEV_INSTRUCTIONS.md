# 开发指令: browser-use

## 项目信息
- **ID**: mmuv459s9wpa3
- **目录**: /Users/silas/.openclaw/workspace/autofactory/outputs/projects/mmuv459s9wpa3
- **技术栈**: Python / Python 3.10+ / FastAPI/Flask
- **复杂度**: 5-10 天

## 初始化步骤

### 1. 项目初始化
```bash
cd /Users/silas/.openclaw/workspace/autofactory/outputs/projects/mmuv459s9wpa3

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
```

### 2. 技术栈配置

```bash
# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 创建 requirements.txt
cat > requirements.txt << 'EOF'
fastapi
uvicorn
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
```

### 3. 实现计划


#### 阶段 1: 基础架构 (1-2天)
- [ ] 项目初始化
- [ ] 目录结构
- [ ] 基础配置


#### 阶段 2: 核心功能 (2-3天)
- [ ] 实现主要业务逻辑
- [ ] 编写单元测试


#### 阶段 3: 用户界面 (1-2天)
- [ ] CLI命令/GUI/API
- [ ] 交互优化


#### 阶段 4: 完善和发布 (1天)
- [ ] 文档编写
- [ ] 发布准备


## 功能需求实现


### F1: 核心功能 (P0)

**描述**: 实现主要业务逻辑

**验收标准**:
- [ ] 用户可以使用核心功能完成主要任务
- [ ] 功能稳定，无明显bug


### F2: 用户界面 (P0)

**描述**: 提供直观的用户界面

**验收标准**:
- [ ] 界面清晰易懂
- [ ] 响应式设计（如适用）


### F3: 配置选项 (P1)

**描述**: 允许用户自定义行为

**验收标准**:
- [ ] 提供合理的默认配置
- [ ] 配置简单明了


## 代码规范

1. **命名规范**: 使用有意义的变量名和函数名
2. **注释**: 复杂逻辑需要注释说明
3. **错误处理**: 所有异步操作需要 try/catch
4. **测试**: 每个功能模块需要有单元测试
5. **类型**: 使用 TypeScript 时确保类型完整

## 提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

## 成功标准

- [ ] 所有 P0 功能完成
- [ ] 单元测试覆盖率 > 60%
- [ ] 代码通过 Lint 检查
- [ ] 手动测试通过

---

**开始开发**:
使用 coding-agent 在此目录执行开发任务。
