# Vue 编码规范与 Code Review 检查表（Vue 2 / Vue 3 自适应）

## 目标

定义 Vue 项目的编码规范和代码审查标准。**版本由 Step 0 自动检测**，规范随版本自动适配，不硬编码 Vue 2 或 Vue 3。

---

## Vue 2（Options API）编码规范

> 仅当 Step 0 检测到 `vue@^2.x` 时适用。

### 1. 项目结构（Vue 2）

```
src/
  assets/
  components/        # 可复用组件（PascalCase）
  views/             # 页面级组件
  router/            # Vue Router 3（index.js）
  store/             # Vuex（index.js + modules/）
  api/               # 请求封装
  utils/
  mixins/            # 谨慎使用
  filters/           # 注意：Vue 3 已废弃，维护期代码标注迁移计划
```

### 2. Options API 规范

```javascript
export default {
  name: 'UserForm',         // 必须写 name，方便调试

  props: {
    userId: { type: Number, default: null },
    mode: {
      type: String,
      default: 'create',
      validator: (v) => ['create', 'edit'].includes(v)
    }
  },

  data() {                  // data 必须是函数
    return {
      form: { username: '', email: '' },
      isSubmitting: false
    };
  },

  computed: { /* 衍生状态，禁止在 computed 中产生副作用 */ },
  watch: { /* 监听外部变化 */ },

  created() { /* 初始化数据 */ },
  beforeDestroy() { /* 清理定时器、事件监听 */ },

  methods: { /* 所有方法 */ }
};
```

### 3. Vue 2 专项规范

```
响应式约束：
- [ ] 新增对象属性使用 this.$set(obj, key, val)，禁止直接赋值
- [ ] 数组变更使用变异方法（push/pop/splice 等）或 this.$set
- [ ] 禁止通过索引直接修改数组元素（arr[0] = x）

组件通信：
- [ ] 禁止直接修改 Props，通过 $emit 通知父组件
- [ ] 禁止新增 EventBus（new Vue()），使用 Vuex 或组件通信替代
- [ ] Mixin 非必要不使用，优先组件化

Vuex 规范：
- [ ] state 必须是函数形式（() => ({})）
- [ ] mutations 同步且命名 UPPER_SNAKE_CASE
- [ ] actions 异步，不直接操作 state（通过 commit）
- [ ] 必须开启 namespaced: true

其他：
- [ ] 过滤器（filter）不新增，现有维护时标注迁移计划
- [ ] $nextTick 正确使用（DOM 更新后执行）
```

---

## Vue 3（Composition API）编码规范

> 仅当 Step 0 检测到 `vue@^3.x` 时适用。

### 1. 项目结构（Vue 3）

```
src/
├── components/           # 可复用组件
│  ├── UserForm.vue      # 命名：业务名 + 类型名
│  ├── Button.vue
│  └── Dialog/
│     └── UserDialog.vue
├── views/               # 页面级组件（路由对应）
│  ├── UserList.vue
│  └── UserDetail.vue
├── hooks/               # Composition API hooks（逻辑复用）
│  ├── useUser.js       # 命名：use + 业务名
│  └── useFetch.js
├── stores/              # Pinia状态管理
│  ├── userStore.js
│  └── commonStore.js
├── api/                 # 后端接口调用层
│  └── user.js          # 命名：模块名
├── utils/               # 工具函数
│  ├── formatters.js    # 格式化
│  ├── validators.js    # 校验
│  └── helpers.js       # 辅助函数
├── types/               # TypeScript类型定义
│  └── user.ts
├── constants/           # 常量
│  └── userConstants.js
└── styles/              # 全局样式
   ├── variables.scss   # Design tokens
   └── index.scss
```

### 2. 命名规范

| 类型 | 规范 | 示例 |
|---|---|---|
| 组件文件 | PascalCase | UserForm.vue, Button.vue |
| 组件名 | PascalCase | \<UserForm \> |
| Hook函数 | use + PascalCase | useUser, useFetch |
| Store模块 | camelCase | userStore, commonStore |
| 方法/变量 | camelCase | getUserList, userName |
| 常量 | UPPER_SNAKE_CASE | MAX_PAGE_SIZE |
| 事件名 | on + PascalCase | onUserUpdate |
| Props | camelCase | userName, isLoading |

### 3. Composition API规范

```vue
<template>
  <div class="user-form">
    <form @submit.prevent="handleSubmit">
      <input v-model="form.username" placeholder="用户名">
      <input v-model="form.email" placeholder="邮箱">
      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? '提交中...' : '提交' }}
      </button>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { User } from '@/types/user';
import { useUser } from '@/hooks/useUser';
import { validateEmail } from '@/utils/validators';

// Props
interface Props {
  userId?: number;
  mode?: 'create' | 'edit';
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
});

// Emits
const emit = defineEmits<{
  (e: 'update:user', user: User): void;
  (e: 'close'): void;
}>();

// Reactive Data
const form = ref<Omit<User, 'id'>>({
  username: '',
  email: ''
});

const isSubmitting = ref(false);
const error = ref<string | null>(null);

// Hooks（复用逻辑）
const { getUserById, createUser, updateUser } = useUser();

// Computed（衍生状态）
const isFormValid = computed(() => {
  return form.value.username.length >= 3 && validateEmail(form.value.email);
});

// Methods
const handleSubmit = async () => {
  if (!isFormValid.value) return;
  
  isSubmitting.value = true;
  error.value = null;
  
  try {
    let result;
    if (props.mode === 'create') {
      result = await createUser(form.value);
    } else {
      result = await updateUser(props.userId!, form.value);
    }
    
    emit('update:user', result);
    emit('close');
  } catch (e) {
    error.value = e instanceof Error ? e.message : '操作失败';
  } finally {
    isSubmitting.value = false;
  }
};

const loadUser = async () => {
  if (props.mode === 'edit' && props.userId) {
    try {
      const user = await getUserById(props.userId);
      form.value = {
        username: user.username,
        email: user.email
      };
    } catch (e) {
      error.value = '加载用户信息失败';
    }
  }
};

// Lifecycle
onMounted(() => {
  loadUser();
});

// Watch（监听变化）
watch(
  () => props.userId,
  (newId) => {
    if (newId) {
      loadUser();
    }
  }
);
</script>

<style scoped lang="scss">
.user-form {
  padding: 20px;
  
  form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  input {
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
  }
  
  button {
    padding: 8px 16px;
    background: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  
  .error {
    color: #ff4d4f;
    font-size: 14px;
  }
}
</style>
```

### 4. 响应式数据规范

```javascript
【✅ 推荐：使用ref和computed】
const count = ref(0);
const doubled = computed(() => count.value * 2);

【❌ 避免：reactive过度使用】
// reactive适合对象，但不如ref清晰
const state = reactive({ count: 0 });

【✅ 推荐：Props + Emits】
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

【❌ 避免：v-model + props + emits混乱】
```

### 5. 组件通信规范

```javascript
【Props - 父传子】
interface Props {
  title: string;
  isActive?: boolean;
  items?: Array<Item>;
}
withDefaults(defineProps<Props>(), {
  isActive: false,
  items: () => []
});

【Emits - 子传父】
const emit = defineEmits<{
  (e: 'click'): void;
  (e: 'update', data: string): void;
}>();

【Provide/Inject - 深层传递】
// Parent
provide('theme', 'dark');

// Child
const theme = inject<string>('theme', 'light');
```

### 6. Hook函数规范

```javascript
// hooks/useUser.ts
import { ref, computed } from 'vue';
import { getUserById, createUser, updateUser } from '@/api/user';
import type { User, UserCreateDTO } from '@/types/user';

export function useUser() {
  // State
  const users = ref<User[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Methods
  const fetchUsers = async () => {
    loading.value = true;
    try {
      const response = await getUserList();
      users.value = response.data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载失败';
    } finally {
      loading.value = false;
    }
  };
  
  const create = async (dto: UserCreateDTO) => {
    loading.value = true;
    try {
      const result = await createUser(dto);
      users.value.push(result);
      return result;
    } finally {
      loading.value = false;
    }
  };
  
  // Return
  return {
    users: readonly(users),    // 只读，防止直接修改
    loading: readonly(loading),
    error: readonly(error),
    fetchUsers,
    create
  };
}
```

### 7. 样式规范（Design Tokens）

```scss
// styles/variables.scss

// 颜色系统
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #faad14;
$error-color: #ff4d4f;

$text-primary: rgba(0, 0, 0, 0.85);
$text-secondary: rgba(0, 0, 0, 0.65);
$text-disabled: rgba(0, 0, 0, 0.25);

$border-color: #d9d9d9;
$bg-color: #ffffff;
$bg-light: #f5f5f5;

// 间距系统
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 12px;
$spacing-lg: 16px;
$spacing-xl: 20px;

// 圆角
$border-radius-sm: 2px;
$border-radius-md: 4px;
$border-radius-lg: 8px;

// 字体
$font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
$font-size-sm: 12px;
$font-size-base: 14px;
$font-size-lg: 16px;
$font-size-xl: 18px;

// 阴影
$box-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
$box-shadow-md: 0 2px 12px rgba(0, 0, 0, 0.1);

// 过渡
$transition-duration: 0.3s;
```

---

## Code Review 检查表

> **前提**：必须先完成 Step 0 版本扫描，再按对应版本执行检查。

### 版本适配检查（首先执行）

```
【版本识别确认】
- [ ] 已通过 package.json 确认 Vue 版本（2.x / 3.x）
- [ ] 已确认构建工具（Vue CLI / Vite / Webpack）
- [ ] 已确认状态管理（Vuex / Pinia）
- [ ] 已确认 TypeScript 是否引入

【Vue 2 专项（vue@^2.x 时执行）】
- [ ] 无直接对象属性新增（必须用 $set）
- [ ] 无数组索引直接赋值
- [ ] Vuex 模块已开启 namespaced
- [ ] 无新增 EventBus / 全局过滤器
- [ ] Mixin 使用有充分理由

【Vue 3 专项（vue@^3.x 时执行）】
- [ ] 新组件全部使用 <script setup>，无 Options API 混用
- [ ] Composables 以 use 开头，返回值用 readonly 包装
- [ ] Pinia store 使用 setup 风格定义
- [ ] 已迁移旧 Vuex 逻辑（若从 Vue 2 升级）
- [ ] 无 deprecated API 使用（$children / $listeners / filters 等）

【通用（两个版本均执行）】
- [ ] 列表渲染有 :key，且不使用 index 作为 key（动态列表）
- [ ] 组件样式有 scoped，无全局污染
- [ ] 颜色/间距使用 CSS 变量或 SCSS 变量，无硬编码 hex
- [ ] v-html 未注入不可信内容
- [ ] API 层统一封装，组件内无裸露 URL 拼接
```

### 🔴 P0 - 阻断性问题

```
【功能正确性】
- [ ] 是否实现了所有需求的功能点
- [ ] 是否正确处理了所有业务场景
- [ ] 是否有明显的逻辑错误

【响应式数据】
- [ ] 是否正确使用了ref和computed
- [ ] 是否有响应式数据丢失问题（.value遗漏）
- [ ] 是否避免了在computed中修改状态

【生命周期】
- [ ] 是否正确清理了事件监听和定时器（onUnmounted）
- [ ] 是否避免了内存泄漏（未取消的watch/computed）
- [ ] 是否在正确的生命周期阶段初始化数据

【组件通信】
- [ ] Props是否都有类型定义和默认值
- [ ] 是否正确使用了emit（而不是直接修改父组件数据）
- [ ] 是否避免了Props修改（直接赋值给响应式变量）

【无障碍 (a11y)】
- [ ] 表单标签是否有正确的for属性
- [ ] 按钮是否可以通过键盘操作（Tab键）
- [ ] 是否为图片添加了alt文本
- [ ] 色彩对比度是否符合WCAG标准

【原型对齐】（如果有原型）
- [ ] UI样式是否与原型高度一致
- [ ] 颜色、字体、间距是否使用了Design Tokens
- [ ] 是否存在明显的像素偏差
```

### 🟠 P1 - 重要问题

```
【代码质量】
- [ ] 是否遵循了命名规范（PascalCase for components）
- [ ] 是否避免了超长组件（>300行应该拆分）
- [ ] 是否避免了过深的嵌套（>3层应该拆分）
- [ ] 是否有重复代码应该提取为通用组件或Hook

【性能】
- [ ] 是否在列表中使用了key属性
- [ ] 是否避免了在模板中创建函数（应该提取到methods/hooks）
- [ ] 是否避免了不必要的渲染（考虑v-if vs v-show）
- [ ] 是否正确使用了computed和watch的依赖（避免过度订阅）
- [ ] 大列表是否使用了虚拟滚动

【API调用】
- [ ] 是否正确处理了异步操作（loading, error状态）
- [ ] 是否避免了竞态条件（请求返回顺序问题）
- [ ] 是否使用了适当的错误处理和用户提示
- [ ] 是否避免了内存泄漏（取消未完成的请求）

【样式】
- [ ] 是否使用了Design Tokens（而不是硬编码颜色）
- [ ] 是否遵循了BEM或其他命名约定
- [ ] 是否避免了全局样式污染（使用scoped）
- [ ] 是否考虑了响应式设计（媒体查询）
```

### 🟡 P2 - 建议问题

```
【可维护性】
- [ ] 是否添加了JSDoc注释（特别是复杂的Hook）
- [ ] Props的类型定义是否清晰
- [ ] 是否避免了魔法值（应该定义为常量）

【最佳实践】
- [ ] 是否使用了TypeScript进行类型检查
- [ ] 是否为所有事件处理器添加了类型
- [ ] 是否正确处理了null/undefined值
- [ ] 是否使用了可选链运算符（?.）和空值合并（??）

【测试】
- [ ] 关键业务逻辑是否有单元测试
- [ ] 是否为Hook编写了测试
- [ ] 组件交互是否有集成测试
```

---

## 测试规范

### 单元测试（useUser Hook）

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { useUser } from '@/hooks/useUser';
import * as userApi from '@/api/user';

describe('useUser Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功获取用户列表', async () => {
    const { fetchUsers, users, loading } = useUser();
    
    // Mock API
    vi.spyOn(userApi, 'getUserList').mockResolvedValue({
      data: [{ id: 1, name: 'John' }]
    });
    
    await fetchUsers();
    
    expect(users.value).toHaveLength(1);
    expect(users.value[0].name).toBe('John');
  });

  it('应该正确处理加载状态', async () => {
    const { fetchUsers, loading } = useUser();
    
    expect(loading.value).toBe(false);
    
    const promise = fetchUsers();
    expect(loading.value).toBe(true);
    
    await promise;
    expect(loading.value).toBe(false);
  });
});
```

### 组件集成测试

```javascript
import { mount } from '@vue/test-utils';
import UserForm from '@/components/UserForm.vue';

describe('UserForm Component', () => {
  it('应该正确提交表单', async () => {
    const wrapper = mount(UserForm, {
      props: { mode: 'create' }
    });
    
    // 填充表单
    await wrapper.find('input[name="username"]').setValue('john_doe');
    await wrapper.find('input[name="email"]').setValue('john@example.com');
    
    // 提交
    await wrapper.find('form').trigger('submit');
    
    // 验证事件
    expect(wrapper.emitted('update:user')).toBeTruthy();
  });

  it('应该验证必填字段', async () => {
    const wrapper = mount(UserForm);
    
    // 提交空表单
    await wrapper.find('button').trigger('click');
    
    // 按钮应该被禁用
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });
});
```

---

## 完成标准

Vue编码规范与Code Review检查表完成标准：

- [ ] 项目结构和命名规范清晰
- [ ] Composition API的最佳实践覆盖
- [ ] P0/P1/P2问题的判定标准明确
- [ ] 原型对齐检查清单完整
- [ ] 无障碍(a11y)检查项明确
- [ ] Design Tokens系统完善
- [ ] 测试规范覆盖单元测试和集成测试
- [ ] 性能优化建议清晰
