# 变更记录生命周期管理

## 目标

定义变更记录的状态模型，跟踪每个变更从提出到闭环的完整生命周期，确保无遗漏的变更追踪。

---

## 状态定义

### 状态机模型

```
               用户提交变更
                   ↓
        【Step 1】自动判级
                   ↓
          ┌─ 点(Point) → pending
          │
        判级结果
          │   ├─ 线(Line) → needs_confirm
          │
          │   └─ 面(Surface) → needs_reeval
          │       或
          │       体(Volume) → rejected
          │
          └─→ 分流处理...

点(Point)的状态转移：
pending → approved → completed
                        ↓
                （在阶段4验收时自动标记）

线(Line)的状态转移：
needs_confirm → user_choice
                    ├─ 确认变更 → approved → completed
                    └─ 分离为子需求 → separated

面(Surface)的状态转移：
needs_reeval → user_choice
                   ├─ 同意重评 → reevaluation → reeval_result
                   │              (重新执行/evaluate)
                   │              ├─ 确认新评估 → approved → completed
                   │              └─ 不同意 → rejected
                   │
                   ├─ 分离为子需求 → separated
                   │
                   └─ 接受风险 → approved_with_risk → completed

体(Volume)的状态转移：
rejected → user_choice
               ├─ 拆分处理 → separated
               └─ 重新接入 → new_intake
```

### 状态详解

| 状态 | 含义 | 持续时间 | 后续操作 | 角色 |
|---|---|---|---|---|
| `pending` | 变更已记录，待自动完成 | 开发到阶段4 | 无需人工干预，阶段4自动完成 | 系统 |
| `needs_confirm` | 变更需用户确认 | 1-2小时 | 用户选择：确认/分离 | 用户 |
| `approved` | 变更已批准，可以进行 | 开发到阶段4 | 继续开发，阶段4验收 | 开发 |
| `completed` | 变更已完成并验收 | - | 归档到历史 | 系统 |
| `needs_reeval` | 变更需重新评估 | 2-4小时 | 重新执行评估或拆分处理 | 用户/评估师 |
| `reevaluation` | 正在重新评估中 | 2-4小时 | 评估完成后输出新结果 | 评估师 |
| `reeval_result` | 重评完成，等待确认 | 1小时 | 用户确认新评估或拒绝 | 用户 |
| `approved_with_risk` | 已知风险下的批准 | 开发到阶段4 | 继续开发，风险记录 | 开发 |
| `rejected` | 变更被拒绝（体等级） | - | 建议拆分或新增需求 | 系统 |
| `separated` | 分离为子需求 | - | 子需求单独接入评估 | 系统 |

---

## 点(Point)的闭环处理

### 状态转移：pending → approved → completed

```
【点变更自动闭环流程】

1. 用户提交变更
   input: 修改字段 + 变更原因
   
2. 系统自动判级为"点"
   判断: 仅1-2个普通字段修改，无需代码/DB改动
   
3. 自动生成变更记录（ChangeLog）
   ├─ change_id: CHANGE-XXXXXXXX-001
   ├─ level: Point
   ├─ status: pending
   ├─ field_changes: [{from, to, reason}, ...]
   ├─ created_at: timestamp
   └─ need_id: 原需求ID
   
4. 更新原需求文档
   ├─ 版本号: v1.0 → v1.1
   ├─ 变更字段生效
   ├─ 保留原版本备份
   └─ 添加变更历史记录条目
   
5. 开发继续（无需等待）
   - 使用最新版需求文档
   - 变更已记录，无需重新评估
   
6. 进入阶段4（交付验收）
   ├─ 系统自动扫描所有 pending 的点变更
   ├─ 一次性验收所有点变更（无需逐个确认）
   ├─ 状态转移: pending → approved → completed
   └─ 输出变更验收清单
```

**输出示例**
```markdown
## ✅ 点变更已自动记录

**CHANGE-20240315-001**
| 字段 | 原值 | 新值 | 原因 |
|---|---|---|---|
| deadline | 2024-03-31 | 2024-04-15 | 产品方申请后延 |

**处理方式**：自动闭环
- 当前状态：pending（待验收）
- 预期完成：阶段4自动标记为 completed
- 无需任何人工确认

---

**下一步**：继续开发，变更会在交付阶段自动完成
```

### 点变更的验收清单（阶段4自动执行）

```
【阶段4：交付验收时的自动处理】

FOR EACH 点变更 IN pending状态 DO
  1. 验收项：变更的字段值是否已在代码中体现
     ├─ 若是 → status = completed ✓
     └─ 若否 → 标记为验收失败 ❌
  
  2. 备注：记录变更验收时间
  
  3. 生成变更验收摘要
     └─ 所有已变更的字段 + 最终值
```

---

## 线(Line)的用户确认处理

### 状态转移：needs_confirm → user_choice → approved/separated

```
【线变更用户选择流程】

1. 用户提交变更
   
2. 系统判级为"线"（影响 5-20%）
   output: 推荐方案 + 影响评估
   
3. 系统输出选项
   选项 A: 确认变更
   ├─ 后续: 更新需求 + 重新评估
   └─ 工作量: 预期增加 X 天
   
   选项 B: 分离为子需求
   ├─ 后续: 原需求不动，新需求独立接入
   └─ 工作量: 原需求继续，子需求另算
   
4. 用户选择后，自动转移状态
   ├─ 选A: needs_confirm → approved → completed
   │   (若有重评) → reevaluation → reeval_result → approved
   │
   └─ 选B: needs_confirm → separated → new_intake
   
5. 对应处理
   ├─ 若选A：继续当前需求开发 + 记录变更
   └─ 若选B：原需求继续，新需求独立处理
```

**状态转移条件**
| 用户输入 | 状态转移 | 说明 |
|---|---|---|
| 确认变更 | needs_confirm → approved | 若无需重评，直接批准 |
| 确认变更 + 需重评 | needs_confirm → reevaluation | 触发重新工作量评估 |
| 分离为子需求 | needs_confirm → separated | 原需求保持，新需求独立接入 |

---

## 面(Surface)的重新评估处理

### 状态转移：needs_reeval → reevaluation → reeval_result → approved

```
【面变更重新评估流程】

1. 用户提交变更，系统判级为"面"
   output: 强烈建议重评
   
2. 用户选择处理方案
   ├─ 方案A: 重新完整评估（推荐）
   │   └─ status: needs_reeval → reevaluation
   │       ↓
   │       触发 `/evaluate REQ-XXX` 命令
   │       ↓
   │       系统执行完整的工作量评估
   │       ├─ 需求分析师: 业务维度
   │       ├─ 架构师代理: 技术维度
   │       └─ 输出: 新的评估报告（v2.0）
   │       ↓
   │       status: reevaluation → reeval_result
   │       ↓
   │       对比原评估和新评估
   │       ├─ 工作量等级变化
   │       ├─ 工期估算变化
   │       └─ 风险等级变化
   │       ↓
   │       用户确认: 同意新评估 or 拒绝
   │       ├─ 同意 → status: reeval_result → approved → completed
   │       └─ 拒绝 → 讨论处理方案
   │
   ├─ 方案B: 拆分为多个子需求
   │   └─ status: needs_reeval → separated
   │
   └─ 方案C: 保持原评估，接受风险
       └─ status: needs_reeval → approved_with_risk → completed
           ├─ 风险记录: "已知工作量可能超出原评估50-100%"
           └─ 备注: 后续可能需要重新分配资源
```

**状态转移条件**
| 用户选择 | 状态转移 | 后续 |
|---|---|---|
| 重新评估 | needs_reeval → reevaluation | 执行完整评估 |
| 评估完成，同意新结果 | reeval_result → approved | 按新评估继续 |
| 评估完成，拒绝新结果 | reeval_result → rejected | 讨论其他方案 |
| 分离子需求 | needs_reeval → separated | 拆分处理 |
| 接受风险 | needs_reeval → approved_with_risk | 继续开发，风险记录 |

---

## 体(Volume)的拒绝和拆分处理

### 状态转移：rejected → separated/new_intake

```
【体变更直接拒绝流程】

1. 用户提交变更，系统判级为"体"
   判断: 核心业务逻辑改变 or 架构变更 or 影响 >50%
   
2. 系统自动拒绝
   status: rejected
   原因: 变更已超出"变更"范畴，建议重新规划
   
3. 系统建议处理方案
   ├─ 方案A: 拆分为"原需求 + 新需求"
   │   └─ 原需求: 保持不变，继续执行
   │       新需求: 单独接入、评估、规划
   │   └─ 状态: rejected → separated
   │
   └─ 方案B: 放弃原需求，重新规划整体方案
       └─ 原需求: 撤销
           新需求: 重新接入、完整规划
       └─ 状态: rejected → new_intake
```

**拆分处理示例**
```
【原需求】REQ-20240315-001
- 标题: 用户权限管理系统
- 工作量: M (3-5天)
- 状态: in_progress

【体变更申请】
- 新增: 部门权限 + 岗位权限 + 数据行权限
- 影响: 工作量翻倍
- 判级: 体

【拆分方案（推荐）】

┌─ 优先级1: REQ-20240315-001-v1 (保持原需求)
│  - 标题: 用户权限管理
│  - 工作量: M (不变)
│  - 状态: in_progress (继续)
│
├─ 优先级2: REQ-20240320-001 (新子需求)
│  - 标题: 部门权限管理
│  - 工作量: 待评估
│  - 状态: draft (新接入)
│
└─ 优先级3: REQ-20240320-002 (新子需求)
   - 标题: 权限系统重构（RBAC→RBAC+ABAC）
   - 工作量: 待评估
   - 状态: draft (新接入)

时间表:
- REQ-20240315-001: 按原计划继续，预计本周五交付
- REQ-20240320-001/002: 下周一开始接入评估
```

---

## 变更状态查询和统计

### 变更状态看板（Dashboard）

```markdown
# 需求变更看板 - REQ-XXXXXXXX

## 概览
- 总变更数: 5
- 已完成: 2 (40%)
- 进行中: 2 (40%)
- 待处理: 1 (20%)

## 按等级统计
| 等级 | 数量 | 自动 | 手工 | 完成度 |
|---|---|---|---|---|
| 点(Point) | 2 | 2 | 0 | 100% |
| 线(Line) | 2 | 0 | 2 | 50% |
| 面(Surface) | 1 | 0 | 1 | 0% |
| 体(Volume) | 0 | - | - | - |

## 详细变更记录
### ✅ 已完成
- CHANGE-20240310-001: deadline 延期 (Point) [2小时内]
- CHANGE-20240312-001: priority 调整 (Point) [1小时内]

### 🔄 进行中
- CHANGE-20240315-001: 导出功能扩展 (Line) [需确认: 确认/分离]
- CHANGE-20240316-001: 权限模块扩展 (Surface) [需重评: 同意/分离/接受风险]

### ⏳ 待处理
- CHANGE-20240318-001: 架构改造 (Volume) [拒绝: 建议拆分/重新接入]
```

---

## 完成标准

变更生命周期管理完成标准：

- [ ] 状态定义清晰，每个状态都有明确的含义和后续操作
- [ ] 状态转移路径完整（点/线/面/体各自的转移流程）
- [ ] 点变更的自动闭环流程可自动执行（无需人工干预）
- [ ] 线/面变更的用户选择和确认流程清晰
- [ ] 体变更的拒绝和拆分建议具体可行
- [ ] 变更状态可查询和统计
