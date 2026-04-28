# 前端代码生成模板（Vue 项目）

> Step 3.5 按本模板生成前端代码。版本（Vue 2 / Vue 3）由 `references/version-detection.md` 的扫描结果决定。

## 生成文件清单（前后端分离项目）

| 文件 | 说明 |
|---|---|
| `src/api/xxx.js` | API 调用层，封装所有后端接口调用（axios） |
| `src/views/xxx/XxxList.vue` | 列表页（页面级组件，含搜索/表格/分页） |
| `src/views/xxx/XxxDetail.vue` | 详情页（若需求包含详情查看） |
| `src/components/xxx/XxxEditDialog.vue` | 新增/编辑弹窗（可复用业务组件） |
| `src/stores/xxxStore.js` | Pinia Store（Vue 3，仅需要全局状态时生成） |
| `src/store/modules/xxx.js` | Vuex 模块（Vue 2，仅需要全局状态时生成） |
| `src/router/modules/xxx.js` | 路由配置（新增路由时生成） |

---

## API 层模板

```javascript
// src/api/xxx.js
import request from '@/utils/request'

/**
 * 获取XXX列表
 * @param {Object} params - 查询参数
 */
export function getXxxList(params) {
  return request({
    url: '/api/v1/xxx/list',
    method: 'get',
    params
  })
}

/**
 * 创建XXX
 * @param {Object} data - 创建数据
 */
export function createXxx(data) {
  return request({
    url: '/api/v1/xxx',
    method: 'post',
    data
  })
}

export function updateXxx(id, data) {
  return request({ url: `/api/v1/xxx/${id}`, method: 'put', data })
}

export function deleteXxx(id) {
  return request({ url: `/api/v1/xxx/${id}`, method: 'delete' })
}
```

---

## 页面组件模板（Vue 3 + `<script setup>`）

```vue
<template>
  <div class="xxx-list">
    <!-- 搜索栏 -->
    <el-form :model="searchForm" inline>
      <el-form-item label="名称">
        <el-input v-model="searchForm.name" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleCreate">新增</el-button>
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData" v-loading="loading" border>
      <el-table-column prop="name" label="名称" />
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button link @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      @change="fetchList"
    />

    <!-- 编辑弹窗 -->
    <XxxEditDialog v-model="dialogVisible" :row="currentRow" @success="fetchList" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getXxxList, deleteXxx } from '@/api/xxx'
import XxxEditDialog from '@/components/xxx/XxxEditDialog.vue'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const currentRow = ref(null)
const searchForm = ref({ name: '' })
const pagination = ref({ page: 1, size: 20, total: 0 })

const fetchList = async () => {
  loading.value = true
  try {
    const { data } = await getXxxList({ ...searchForm.value, ...pagination.value })
    tableData.value = data.records
    pagination.value.total = data.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.value.page = 1; fetchList() }
const handleReset = () => { searchForm.value = { name: '' }; handleSearch() }

const handleCreate = () => { currentRow.value = null; dialogVisible.value = true }
const handleEdit = (row) => { currentRow.value = row; dialogVisible.value = true }

const handleDelete = async (row) => {
  await ElMessageBox.confirm(`确认删除「${row.name}」？`, '提示', { type: 'warning' })
  await deleteXxx(row.id)
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(fetchList)
</script>
```

---

## Vue 2（Options API）生成规则

- `data()` 函数返回响应式数据
- `methods` 中定义所有方法
- `created()` 生命周期初始化数据
- 使用 `this.$message` / `this.$confirm`（Element UI）
- 使用 `this.$store.dispatch` 操作 Vuex

---

## 前端测试骨架（Step 5 生成）

```javascript
// src/hooks/__tests__/useXxx.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useXxx } from '@/hooks/useXxx'
import * as xxxApi from '@/api/xxx'

describe('useXxx Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch list on init', async () => {
    vi.spyOn(xxxApi, 'getXxxList').mockResolvedValue({
      data: { records: [{ id: 1, name: 'test' }], total: 1 }
    })

    const { list, fetchList } = useXxx()
    await fetchList()

    expect(list.value).toHaveLength(1)
    expect(list.value[0].name).toBe('test')
  })

  it('should handle api error gracefully', async () => {
    vi.spyOn(xxxApi, 'getXxxList').mockRejectedValue(new Error('Network Error'))

    const { fetchList, error } = useXxx()
    await fetchList()

    expect(error.value).toBeTruthy()
  })
})
```
