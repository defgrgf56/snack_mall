# 📦 Git使用指南

## GitHub仓库信息

- **仓库地址**: https://github.com/defgrgf56/snack_mall.git
- **项目名称**: snack_mall
- **小程序AppID**: wxdca249674206beb2

---

## 🚀 首次提交代码

### 步骤1: 初始化Git仓库

```bash
cd c:\Users\刘刘\Desktop\小程序商城

# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/defgrgf56/snack_mall.git
```

### 步骤2: 配置Git用户信息

```bash
# 配置用户名
git config user.name "Your Name"

# 配置邮箱
git config user.email "your.email@example.com"
```

### 步骤3: 提交代码

```bash
# 查看文件状态
git status

# 添加所有文件
git add .

# 提交
git commit -m "初始提交：零食商城小程序完整项目"

# 推送到GitHub
git push -u origin main
```

如果默认分支是master:
```bash
git push -u origin master
```

---

## 📝 常用Git命令

### 查看状态和日志

```bash
# 查看文件状态
git status

# 查看提交日志
git log

# 查看简洁日志
git log --oneline

# 查看分支
git branch
```

### 提交代码

```bash
# 添加指定文件
git add 文件名

# 添加所有修改的文件
git add .

# 提交
git commit -m "提交说明"

# 推送到远程
git push
```

### 拉取代码

```bash
# 拉取远程最新代码
git pull

# 拉取指定分支
git pull origin main
```

### 分支管理

```bash
# 创建新分支
git branch 分支名

# 切换分支
git checkout 分支名

# 创建并切换到新分支
git checkout -b 分支名

# 合并分支
git merge 分支名

# 删除分支
git branch -d 分支名
```

---

## 🔒 保护敏感信息

### .gitignore 已配置

以下文件/目录不会被提交:

```
✅ .env                    # 环境变量（包含AppSecret等敏感信息）
✅ node_modules/           # 依赖包
✅ *.log                   # 日志文件
✅ .vscode/                # 编辑器配置
```

### 检查敏感信息

**提交前务必检查**:

```bash
# 查看即将提交的文件
git status

# 查看文件差异
git diff
```

**确保以下信息不会被提交**:
- ❌ `后端API/.env` 文件
- ❌ `WX_SECRET`（AppSecret）
- ❌ `JWT_SECRET`
- ❌ 数据库密码

---

## 📋 提交规范

### 提交信息格式

```
类型: 简短描述

详细说明（可选）
```

### 提交类型

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构代码
- `test`: 测试相关
- `chore`: 构建/工具相关

### 示例

```bash
git commit -m "feat: 添加商品搜索功能"

git commit -m "fix: 修复购物车数量显示错误"

git commit -m "docs: 更新README文档"

git commit -m "refactor: 优化登录逻辑"
```

---

## 🌿 分支策略

### 推荐分支

```
main/master     ← 主分支（稳定版本）
    ↓
develop         ← 开发分支
    ↓
feature/xxx     ← 功能分支
```

### 功能开发流程

1. **创建功能分支**
   ```bash
   git checkout -b feature/payment
   ```

2. **开发功能**
   ```bash
   # 修改代码...
   git add .
   git commit -m "feat: 添加支付功能"
   ```

3. **合并到开发分支**
   ```bash
   git checkout develop
   git merge feature/payment
   ```

4. **推送到远程**
   ```bash
   git push origin develop
   ```

---

## 🔧 常见场景

### 场景1: 首次克隆项目

```bash
# 克隆仓库
git clone https://github.com/defgrgf56/snack_mall.git

# 进入目录
cd snack_mall

# 安装后端依赖
cd 后端API
npm install

# 配置环境变量
copy .env.example .env
notepad .env
```

### 场景2: 每日开发流程

```bash
# 1. 拉取最新代码
git pull

# 2. 创建功能分支
git checkout -b feature/xxx

# 3. 开发功能
# ... 修改代码 ...

# 4. 提交代码
git add .
git commit -m "feat: xxx功能"

# 5. 推送到远程
git push origin feature/xxx
```

### 场景3: 撤销修改

```bash
# 撤销未暂存的修改
git checkout -- 文件名

# 撤销已暂存的修改
git reset HEAD 文件名

# 撤销最后一次提交（保留修改）
git reset --soft HEAD^

# 撤销最后一次提交（丢弃修改）
git reset --hard HEAD^
```

### 场景4: 修复紧急bug

```bash
# 1. 创建修复分支
git checkout -b hotfix/bug-name

# 2. 修复bug
# ... 修改代码 ...

# 3. 提交
git add .
git commit -m "fix: 修复xxx问题"

# 4. 合并到主分支
git checkout main
git merge hotfix/bug-name

# 5. 推送
git push origin main

# 6. 删除修复分支
git branch -d hotfix/bug-name
```

---

## 🆘 常见问题

### 问题1: push被拒绝

**错误信息**:
```
! [rejected] main -> main (fetch first)
```

**解决方案**:
```bash
# 先拉取远程代码
git pull origin main

# 解决冲突（如果有）
# 然后再推送
git push origin main
```

### 问题2: 合并冲突

**解决步骤**:

1. 查看冲突文件:
   ```bash
   git status
   ```

2. 打开冲突文件，找到冲突标记:
   ```
   <<<<<<< HEAD
   你的修改
   =======
   别人的修改
   >>>>>>> branch-name
   ```

3. 手动解决冲突，删除标记

4. 提交解决结果:
   ```bash
   git add .
   git commit -m "fix: 解决合并冲突"
   ```

### 问题3: 误提交敏感信息

**如果已提交但未推送**:
```bash
# 撤销提交
git reset --soft HEAD^

# 删除敏感文件
git reset HEAD 敏感文件

# 重新提交
git commit -m "提交说明"
```

**如果已推送到远程**:
```bash
# 需要强制删除提交历史（谨慎使用）
git reset --hard HEAD^
git push -f origin main

# 或者创建新提交覆盖
git rm --cached 敏感文件
git commit -m "移除敏感信息"
git push
```

### 问题4: 账号认证

**HTTPS方式**:
```bash
# 第一次push会要求输入用户名和密码
# 用户名: GitHub用户名
# 密码: Personal Access Token（不是GitHub密码）
```

**生成Personal Access Token**:
1. GitHub → Settings → Developer settings
2. Personal access tokens → Generate new token
3. 勾选 `repo` 权限
4. 生成并复制token
5. 使用token作为密码

**SSH方式**:
```bash
# 生成SSH密钥
ssh-keygen -t rsa -b 4096 -C "your.email@example.com"

# 查看公钥
cat ~/.ssh/id_rsa.pub

# 添加到GitHub: Settings → SSH keys → Add SSH key

# 修改远程地址为SSH
git remote set-url origin git@github.com:defgrgf56/snack_mall.git
```

---

## 📊 项目维护

### 定期更新

```bash
# 每天开始工作前
git pull

# 每次功能完成后
git push
```

### 版本标签

```bash
# 创建标签
git tag -a v1.0.0 -m "版本1.0.0"

# 推送标签
git push origin v1.0.0

# 查看所有标签
git tag
```

### 清理历史

```bash
# 查看大文件
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | sort -k3 -n

# 删除大文件
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch path/to/file" --prune-empty --tag-name-filter cat -- --all
```

---

## ✅ 提交检查清单

提交前检查:

- [ ] 代码已测试
- [ ] 无敏感信息（.env、密码等）
- [ ] 代码格式规范
- [ ] 提交信息清晰
- [ ] 文件已添加到暂存区
- [ ] 已拉取最新代码

---

## 🔗 相关资源

- **Git官方文档**: https://git-scm.com/doc
- **GitHub帮助**: https://docs.github.com/
- **Git教程**: https://www.runoob.com/git/git-tutorial.html

---

**仓库地址**: https://github.com/defgrgf56/snack_mall.git  
**创建时间**: 2026年8月14日  
**维护建议**: 定期提交，保持代码同步
