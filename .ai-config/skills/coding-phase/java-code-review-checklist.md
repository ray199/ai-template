# Java编码规范与Code Review检查表

## 目标

定义Java项目的编码规范、代码审查标准，确保所有Java代码都符合企业级质量标准。

---

## Java编码规范

### 1. 包结构和命名

```
项目根包：com.company.project
  
com.company.project
├── entity/                  # JPA Entity / DO（Data Object）
│  └── UserDO.java          # 命名：模型名 + DO
├── dto/                     # Data Transfer Object
│  ├── UserDTO.java         # 入站DTO（接收前端数据）
│  └── UserVO.java          # 出站VO（返回给前端）
├── mapper/                  # MyBatis / JPA Repository
│  └── UserMapper.java      # 命名：模型名 + Mapper
├── service/                 # 业务逻辑
│  ├── UserService.java     # 接口：模型名 + Service
│  └── impl/
│     └── UserServiceImpl.java # 实现：模型名 + ServiceImpl
├── controller/              # HTTP入口
│  └── UserController.java  # 命名：模型名 + Controller
├── config/                  # 配置类
├── util/                    # 工具类
├── exception/               # 自定义异常
└── constant/                # 常量定义
```

### 2. 命名规范

| 类型 | 规范 | 示例 |
|---|---|---|
| 类名 | PascalCase | UserController, OrderService |
| 方法名 | camelCase | getUserById, createOrder |
| 常量 | UPPER_SNAKE_CASE | MAX_PAGE_SIZE, DEFAULT_TIMEOUT |
| 变量 | camelCase | userName, totalAmount |
| 包名 | lowercase | com.company.project.service |
| 接口名 | I开头或Service | IUserService 或 UserService |

### 3. 方法定义规范

```java
/**
 * 用户创建（业务：注册）
 * 
 * @param dto 用户创建请求
 * @return 创建后的用户ID
 * @throws BusinessException 用户名已存在时抛出 USER_NAME_DUPLICATE
 */
@Transactional(rollbackFor = Exception.class)
public Long createUser(UserCreateDTO dto) {
    // 1. 参数校验（@Valid已在Controller层）
    if (userMapper.selectByUsername(dto.getUsername()) != null) {
        throw new BusinessException("USER_NAME_DUPLICATE", "用户名已存在");
    }
    
    // 2. 业务逻辑
    UserDO user = new UserDO();
    user.setUsername(dto.getUsername());
    user.setPassword(passwordEncoder.encode(dto.getPassword()));
    user.setEmail(dto.getEmail());
    
    // 3. 数据持久化
    userMapper.insert(user);
    
    // 4. 返回结果
    return user.getId();
}
```

### 4. 异常处理规范

```java
【定义自定义异常】
public class BusinessException extends RuntimeException {
    private String code;      // 错误码：USER_NOT_FOUND, PERMISSION_DENIED
    private String message;   // 用户友好的错误信息
    
    public BusinessException(String code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }
}

【在Service层抛出】
public User getUserById(Long id) {
    User user = userMapper.selectById(id);
    if (user == null) {
        throw new BusinessException("USER_NOT_FOUND", "用户不存在");
    }
    return user;
}

【在Controller层捕获并转换】
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        return ResponseEntity.badRequest().body(
            new ErrorResponse(e.getCode(), e.getMessage())
        );
    }
}
```

### 5. 事务管理规范

```java
【写操作必须加@Transactional】
@Transactional(rollbackFor = Exception.class)
public void updateUser(Long id, UserUpdateDTO dto) {
    UserDO user = userMapper.selectById(id);
    user.setName(dto.getName());
    user.setEmail(dto.getEmail());
    userMapper.update(user);
}

【配置规范】
@Transactional(
    rollbackFor = Exception.class,    // 捕获所有异常并回滚
    isolation = Isolation.READ_COMMITTED,  // 事务隔离级别
    timeout = 30                      // 超时时间（秒）
)

【读操作可不加（或使用readOnly=true）】
@Transactional(readOnly = true)
public User getUserById(Long id) {
    return userMapper.selectById(id);
}
```

### 6. 日志规范

```java
【使用@Slf4j注解】
@Slf4j
@Service
public class UserService {
    
    public void createUser(UserCreateDTO dto) {
        log.info("创建用户 - username: {}", dto.getUsername());
        
        try {
            // 业务逻辑
        } catch (Exception e) {
            log.error("创建用户失败 - username: {}", dto.getUsername(), e);
            throw new BusinessException("USER_CREATE_FAILED", "创建用户失败");
        }
    }
}

【禁止使用System.out.println】
❌ System.out.println("user: " + user);
✅ log.info("user: {}", user);

【日志级别选择】
DEBUG: 开发调试信息
INFO:  重要业务操作（创建、修改、删除）
WARN:  警告信息（即将过期、参数不规范）
ERROR: 错误信息（异常、业务失败）
```

### 7. 数据库操作规范

```java
【使用预编译语句，避免SQL注入】
❌ String sql = "SELECT * FROM user WHERE id = " + id;
✅ userMapper.selectById(id);  // MyBatis自动处理

【避免N+1查询问题】
❌ 
List<User> users = userMapper.selectAll();  // 1次查询
for (User user : users) {
    user.setDepartment(departmentMapper.selectById(user.getDeptId()));  // N次查询
}

✅
// 使用关联查询或批量查询
List<User> users = userMapper.selectAllWithDepartment();

【查询优化】
✅ 使用索引
✅ 避免 SELECT *
✅ 合理使用分页
✅ 考虑缓存（Redis）
```

### 8. 并发控制规范

```java
【读多写少的场景 - 使用ReadWriteLock】
private final ReadWriteLock lock = new ReentrantReadWriteLock();

public User getUser(Long id) {
    lock.readLock().lock();
    try {
        return cache.get(id);
    } finally {
        lock.readLock().unlock();
    }
}

【写操作 - 使用synchronized或Lock】
public void updateUser(Long id, UserDTO dto) {
    synchronized (this) {
        UserDO user = userMapper.selectById(id);
        // 修改
        userMapper.update(user);
    }
}

【原子操作 - 使用AtomicInteger等】
private AtomicInteger counter = new AtomicInteger(0);
public int getAndIncrement() {
    return counter.getAndIncrement();
}
```

---

## Code Review检查表（按优先级）

### 🔴 P0 - 阻断性问题（必须修复）

这些问题会导致代码无法合并或产生严重后果。

```
【功能正确性】
- [ ] 是否实现了需求文档中的所有功能点
- [ ] 是否正确处理了所有验收标准中的场景
- [ ] 是否覆盖了所有业务异常分支

【安全性】
- [ ] 是否有SQL注入风险（使用了字符串拼接SQL）
- [ ] 是否有权限校验漏洞（是否所有需要权限的接口都有校验）
- [ ] 是否正确处理了敏感数据（密码不能明文存储）
- [ ] 是否有任何硬编码的凭证（API Key、密码等）

【异常处理】
- [ ] 是否存在未捕获的异常
- [ ] 是否存在空指针异常(NPE)的风险
- [ ] 是否正确使用了@Transactional的rollbackFor

【数据一致性】
- [ ] 并发修改时是否有race condition
- [ ] 事务边界是否正确（关键业务操作是否在事务内）
- [ ] 是否正确处理了幂等性（同一请求多次调用结果应相同）

【Controller层必查】
- [ ] 所有HTTP状态码正确（200/400/401/403/404/500等）
- [ ] 所有异常都被正确转换为HTTP响应
- [ ] 请求参数是否都进行了@Valid校验
```

### 🟠 P1 - 重要问题（强烈建议修复）

这些问题不会导致功能失败，但会影响代码质量或性能。

```
【代码规范】
- [ ] 是否遵循了命名规范（类名PascalCase, 方法名camelCase）
- [ ] 是否遵循了包结构规范（entity/service/controller分离）
- [ ] 是否存在超长方法（>50行）或超大类（>300行）
- [ ] 是否有重复代码，是否应该提取为工具方法

【性能】
- [ ] 是否有明显的N+1查询问题
- [ ] 是否使用了不必要的全表扫描（应该使用索引）
- [ ] 是否在循环内执行了数据库查询（应该批量查询）
- [ ] 是否有潜在的内存泄漏（如未关闭的资源）
- [ ] 是否使用了适当的数据结构（HashMap vs TreeMap vs LinkedHashMap）

【日志】
- [ ] 是否使用了System.out.println（应该使用@Slf4j）
- [ ] 关键操作是否有适当的日志记录（INFO级别）
- [ ] 异常是否都被正确记录（ERROR级别 + 堆栈跟踪）

【单元测试】
- [ ] 是否为关键业务逻辑编写了单元测试
- [ ] 是否为异常路径编写了测试
- [ ] Controller测试覆盖率是否≥90%
```

### 🟡 P2 - 建议问题（可后续改进）

这些问题涉及代码风格或可维护性。

```
【可维护性】
- [ ] 注释是否清晰（特别是复杂逻辑）
- [ ] 方法签名是否清晰（参数名是否有意义）
- [ ] 是否有TODO或FIXME注释，是否需要处理

【最佳实践】
- [ ] 是否使用了Stream API处理集合
- [ ] 是否使用了Optional处理空值
- [ ] 字符串比较是否使用了equals（而不是==）
- [ ] 是否避免了大对象的频繁创建（使用对象池）

【文档】
- [ ] 是否为公开方法添加了JavaDoc
- [ ] 是否为复杂逻辑添加了注释
- [ ] 是否为参数和返回值进行了说明
```

### ✅ 检查通过条件

```
合并PR的前置条件：
✅ P0问题：0个（必须全部修复）
✅ P1问题：≤2个（可接受但应后续改进）
✅ P2问题：任意数量（鼓励改进但不强制）
✅ 测试覆盖率：Service≥70%, Controller≥90%
✅ CI/CD通过：编译、单元测试、代码扫描
```

---

## Controller层测试必填项

### 测试场景清单

对于每一个Controller方法，必须编写以下测试：

```java
@WebMvcTest(UserController.class)
@ExtendWith(MockitoExtension.class)
public class UserControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UserService userService;
    
    /**
     * 测试1：正常创建用户 - 200 OK
     */
    @Test
    public void testCreateUser_Success() throws Exception {
        // Given
        UserCreateDTO dto = new UserCreateDTO("john_doe", "password123");
        given(userService.createUser(any())).willReturn(1L);
        
        // When
        mockMvc.perform(post("/api/v1/user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            
            // Then
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data").value(1L));
    }
    
    /**
     * 测试2：参数校验失败 - 400 Bad Request
     */
    @Test
    public void testCreateUser_InvalidParam() throws Exception {
        // Given：缺少必填字段
        UserCreateDTO dto = new UserCreateDTO();
        dto.setUsername(null);
        
        // When & Then
        mockMvc.perform(post("/api/v1/user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isBadRequest());
    }
    
    /**
     * 测试3：业务异常 - 400 with error code
     */
    @Test
    public void testCreateUser_UsernameDuplicate() throws Exception {
        // Given
        UserCreateDTO dto = new UserCreateDTO("existing_user", "password");
        given(userService.createUser(any()))
            .willThrow(new BusinessException("USER_NAME_DUPLICATE", "用户名已存在"));
        
        // When & Then
        mockMvc.perform(post("/api/v1/user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("USER_NAME_DUPLICATE"));
    }
    
    /**
     * 测试4：认证失败 - 401 Unauthorized
     */
    @Test
    public void testGetUser_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/user/1"))
            .andExpect(status().isUnauthorized());
    }
    
    /**
     * 测试5：权限不足 - 403 Forbidden
     */
    @Test
    @WithMockUser(authorities = "ROLE_USER")
    public void testDeleteUser_Forbidden() throws Exception {
        mockMvc.perform(delete("/api/v1/user/1"))
            .andExpect(status().isForbidden());
    }
    
    /**
     * 测试6：资源不存在 - 404 Not Found
     */
    @Test
    @WithMockUser
    public void testGetUser_NotFound() throws Exception {
        // Given
        given(userService.getUserById(99L))
            .willThrow(new BusinessException("USER_NOT_FOUND", "用户不存在"));
        
        // When & Then
        mockMvc.perform(get("/api/v1/user/99"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("USER_NOT_FOUND"));
    }
}
```

---

## 完成标准

Java编码规范与Code Review检查表完成标准：

- [ ] 包结构和命名规范清晰
- [ ] 所有常见代码模式都有规范示例
- [ ] P0/P1/P2问题的判定标准明确
- [ ] Controller层测试的6个必填场景都定义了
- [ ] 异常处理规范完整
- [ ] 性能优化建议清晰
- [ ] 与项目现有规范（02_code_style.mdc）的集成方式清楚
