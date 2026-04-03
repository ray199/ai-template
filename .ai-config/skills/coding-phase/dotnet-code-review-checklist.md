# .NET编码规范与Code Review检查表

## 目标

定义.NET (C#)项目的编码规范和代码审查标准，确保后端代码的质量和企业级标准。

---

## .NET编码规范

### 1. 项目结构和命名

```
Project.csproj (或 .sln)
├── Models/
│  ├── User.cs           # Domain Model / Entity
│  └── UserDto.cs        # Data Transfer Object
├── Controllers/
│  └── UserController.cs # API Controller
├── Services/
│  ├── IUserService.cs   # 接口（I前缀）
│  └── UserService.cs    # 实现
├── Repositories/
│  ├── IUserRepository.cs
│  └── UserRepository.cs
├── Exceptions/
│  └── BusinessException.cs
├── Utilities/
│  └── ValidationHelper.cs
├── Extensions/
│  └── StringExtensions.cs
├── Migrations/          # EF Core迁移
├── Configuration/
│  └── ServiceConfiguration.cs
└── Program.cs           # 启动配置
```

### 2. 命名规范

| 类型 | 规范 | 示例 |
|---|---|---|
| 类名 | PascalCase | UserController, UserService |
| 接口名 | I + PascalCase | IUserService, IRepository |
| 方法名 | PascalCase | GetUserById, CreateUser |
| 属性 | PascalCase | UserName, IsActive |
| 私有字段 | _camelCase | _userRepository, _logger |
| 常量 | PascalCase | MaxPageSize |
| 本地变量 | camelCase | userName, totalAmount |
| 异步方法 | 带Async后缀 | GetUserAsync, CreateUserAsync |

### 3. 类定义规范

```csharp
/// <summary>
/// 用户服务接口
/// </summary>
public interface IUserService
{
    /// <summary>
    /// 根据ID获取用户
    /// </summary>
    /// <param name="id">用户ID</param>
    /// <returns>用户对象，如果不存在返回null</returns>
    Task<User?> GetUserByIdAsync(long id);
    
    /// <summary>
    /// 创建用户
    /// </summary>
    Task<User> CreateUserAsync(CreateUserDto dto);
    
    /// <summary>
    /// 更新用户
    /// </summary>
    Task<bool> UpdateUserAsync(long id, UpdateUserDto dto);
}

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserService> _logger;
    private readonly IPasswordHasher<User> _passwordHasher;

    public UserService(
        IUserRepository userRepository,
        ILogger<UserService> logger,
        IPasswordHasher<User> passwordHasher)
    {
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _passwordHasher = passwordHasher;
    }

    public async Task<User?> GetUserByIdAsync(long id)
    {
        _logger.LogInformation("获取用户 - ID: {UserId}", id);
        return await _userRepository.GetByIdAsync(id);
    }

    public async Task<User> CreateUserAsync(CreateUserDto dto)
    {
        // 1. 验证
        var existingUser = await _userRepository.GetByUsernameAsync(dto.Username);
        if (existingUser != null)
        {
            _logger.LogWarning("用户名已存在 - Username: {Username}", dto.Username);
            throw new BusinessException("USER_NAME_DUPLICATE", "用户名已存在");
        }

        // 2. 创建实体
        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            Password = _passwordHasher.HashPassword(null, dto.Password),
            CreatedAt = DateTime.UtcNow
        };

        // 3. 保存
        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        _logger.LogInformation("用户创建成功 - UserID: {UserId}", user.Id);
        return user;
    }

    public async Task<bool> UpdateUserAsync(long id, UpdateUserDto dto)
    {
        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new BusinessException("USER_NOT_FOUND", "用户不存在");

        user.Email = dto.Email;
        user.UpdatedAt = DateTime.UtcNow;

        _userRepository.Update(user);
        var result = await _userRepository.SaveChangesAsync();

        return result > 0;
    }
}
```

### 4. 异常处理规范

```csharp
【自定义异常】
public class BusinessException : Exception
{
    public string Code { get; }
    public string UserMessage { get; }

    public BusinessException(string code, string message)
        : base(message)
    {
        Code = code;
        UserMessage = message;
    }
}

【在Service层抛出】
public async Task<User> GetUserByIdAsync(long id)
{
    var user = await _userRepository.GetByIdAsync(id);
    
    if (user == null)
    {
        throw new BusinessException("USER_NOT_FOUND", "用户不存在");
    }

    return user;
}

【在Controller层捕获】
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(long id)
    {
        try
        {
            var user = await _userService.GetUserByIdAsync(id);
            return Ok(new { data = user });
        }
        catch (BusinessException ex)
        {
            return BadRequest(new { code = ex.Code, message = ex.UserMessage });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "获取用户失败");
            return StatusCode(500, new { code = "INTERNAL_ERROR", message = "服务器错误" });
        }
    }
}

【或使用全局异常处理中间件】
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.ContentType = "application/json";
        var ex = context.Features.Get<IExceptionHandlerFeature>()?.Error;

        var response = ex switch
        {
            BusinessException be => new { code = be.Code, message = be.UserMessage },
            _ => new { code = "INTERNAL_ERROR", message = "服务器错误" }
        };

        await context.Response.WriteAsJsonAsync(response);
    });
});
```

### 5. 异步/等待规范

```csharp
【✅ 正确使用async/await】
public async Task<User> GetUserAsync(long id)
{
    return await _userRepository.GetByIdAsync(id);
}

【❌ 避免：同步包装异步】
public User GetUser(long id)
{
    return _userRepository.GetByIdAsync(id).Result;  // 会导致死锁！
}

【✅ 异步操作不能省略await】
public async Task CreateMultipleUsersAsync(List<UserDto> dtos)
{
    foreach (var dto in dtos)
    {
        await _userRepository.AddAsync(MapToUser(dto));
    }
    await _userRepository.SaveChangesAsync();
}

【⚠️ 避免：fire and forget】
_ = SendEmailAsync(email);  // 不建议，无法捕获异常
```

### 6. Entity Framework Core规范

```csharp
【Model配置】
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // 用户实体
    modelBuilder.Entity<User>(entity =>
    {
        entity.ToTable("users");
        entity.HasKey(e => e.Id);

        entity.Property(e => e.Username)
            .IsRequired()
            .HasMaxLength(50);
        
        entity.Property(e => e.Email)
            .IsRequired()
            .HasMaxLength(100);

        entity.HasIndex(e => e.Username).IsUnique();
        entity.HasIndex(e => e.Email).IsUnique();

        entity.Property(e => e.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
    });

    // 关系配置
    modelBuilder.Entity<User>()
        .HasMany(u => u.Orders)
        .WithOne(o => o.User)
        .HasForeignKey(o => o.UserId)
        .OnDelete(DeleteBehavior.Cascade);
}

【避免N+1查询】
❌ 
var users = await _context.Users.ToListAsync();
foreach (var user in users)
{
    user.Orders = await _context.Orders
        .Where(o => o.UserId == user.Id)
        .ToListAsync();  // N+1查询！
}

✅ 
var users = await _context.Users
    .Include(u => u.Orders)
    .ToListAsync();
```

### 7. 日志规范

```csharp
【使用ILogger】
public class UserService
{
    private readonly ILogger<UserService> _logger;

    public async Task<User> GetUserByIdAsync(long id)
    {
        _logger.LogInformation("获取用户 - UserId: {UserId}", id);
        
        try
        {
            var user = await _userRepository.GetByIdAsync(id);
            return user ?? throw new BusinessException("USER_NOT_FOUND", "用户不存在");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "获取用户失败 - UserId: {UserId}", id);
            throw;
        }
    }
}

【日志级别】
LogTrace: 最详细的诊断信息
LogDebug: 开发调试信息
LogInformation: 重要业务操作
LogWarning: 警告（即将过期、参数不规范）
LogError: 错误（异常、业务失败）
LogCritical: 严重错误（系统无法继续）
```

---

## Code Review检查表

### 🔴 P0 - 阻断性问题

```
【功能和业务】
- [ ] 是否实现了所有需求功能
- [ ] 异常处理是否正确（BusinessException vs 系统异常）
- [ ] 是否正确处理了并发（乐观锁/悲观锁）
- [ ] 是否有race condition或死锁风险

【安全性】
- [ ] 是否有SQL注入风险（应使用参数化查询）
- [ ] 敏感数据是否正确加密（密码使用IPasswordHasher）
- [ ] 是否检查了权限（[Authorize]属性）
- [ ] 是否有硬编码的凭证

【异步操作】
- [ ] 是否避免了.Result（会导致死锁）
- [ ] 是否避免了同步包装异步
- [ ] 是否正确处理了异步异常
- [ ] 是否避免了fire and forget（未捕获的异常）

【数据库】
- [ ] 是否避免了N+1查询（缺少Include）
- [ ] 是否正确配置了关系和外键
- [ ] DbContext是否被正确释放（using或DI）
- [ ] 变更跟踪是否关闭（AsNoTracking）

【Controller】
- [ ] HTTP状态码是否正确（200/400/401/403/404/500）
- [ ] 是否验证了请求参数（[Required]、[EmailAddress]等）
- [ ] 是否返回了正确的DTO（不能返回内部Entity）
- [ ] 错误响应格式是否一致
```

### 🟠 P1 - 重要问题

```
【代码规范】
- [ ] 命名是否遵循PascalCase/camelCase规范
- [ ] 接口是否都有I前缀
- [ ] 异步方法是否都有Async后缀
- [ ] 是否有超长方法（>30行）或超大类（>300行）

【依赖注入】
- [ ] 是否使用了构造函数注入（避免Service Locator）
- [ ] 是否有循环依赖
- [ ] 生命周期是否正确（Transient/Scoped/Singleton）
- [ ] 是否检查了null参数（ArgumentNullException）

【LINQ查询】
- [ ] 是否避免了投影到内存再过滤
- [ ] 是否正确使用了lazy loading
- [ ] 是否考虑了性能（.Count() vs .Any()）

【日志】
- [ ] 关键操作是否有日志（创建、更新、删除）
- [ ] 异常是否被记录（包括堆栈跟踪）
- [ ] 日志级别是否正确使用

【单元测试】
- [ ] 关键业务逻辑是否有测试
- [ ] Controller是否有集成测试
- [ ] 测试覆盖率是否≥80%
```

### 🟡 P2 - 建议问题

```
【可维护性】
- [ ] 是否添加了XML文档注释（///）
- [ ] 复杂逻辑是否有说明注释
- [ ] 是否避免了魔法值

【最佳实践】
- [ ] 是否使用了nullable reference types（C# 8+）
- [ ] 是否使用了记录类型（C# 9+）
- [ ] 是否使用了模式匹配简化代码
- [ ] 是否考虑了性能（缓存、预加载）
```

---

## Controller层测试规范

```csharp
[ApiControllerTests]
public class UserControllerTests
{
    private readonly Mock<IUserService> _userServiceMock;
    private readonly UserController _controller;

    public UserControllerTests()
    {
        _userServiceMock = new Mock<IUserService>();
        _controller = new UserController(_userServiceMock.Object);
    }

    // 1. 正常场景 - 200 OK
    [Fact]
    public async Task GetUser_WithValidId_Returns200Ok()
    {
        // Arrange
        var userId = 1L;
        var user = new User { Id = userId, Username = "john_doe" };
        _userServiceMock.Setup(s => s.GetUserByIdAsync(userId))
            .ReturnsAsync(user);

        // Act
        var result = await _controller.GetUser(userId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(200, okResult.StatusCode);
    }

    // 2. 参数校验失败 - 400 Bad Request
    [Fact]
    public async Task CreateUser_WithInvalidEmail_Returns400()
    {
        // Arrange
        var dto = new CreateUserDto { Username = "john", Email = "invalid" };
        // ModelState会被验证

        // Act & Assert
        // ASP.NET Core会自动返回400
    }

    // 3. 业务异常 - 400 with error code
    [Fact]
    public async Task CreateUser_WithDuplicateUsername_Returns400WithCode()
    {
        // Arrange
        var dto = new CreateUserDto { Username = "existing", Email = "new@example.com" };
        _userServiceMock.Setup(s => s.CreateUserAsync(dto))
            .ThrowsAsync(new BusinessException("USER_NAME_DUPLICATE", "用户名已存在"));

        // Act
        var result = await _controller.CreateUser(dto);

        // Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal(400, badResult.StatusCode);
    }

    // 4. 资源不存在 - 404
    [Fact]
    public async Task GetUser_WithNonExistentId_Returns404()
    {
        _userServiceMock.Setup(s => s.GetUserByIdAsync(99L))
            .ThrowsAsync(new BusinessException("USER_NOT_FOUND", "用户不存在"));

        var result = await _controller.GetUser(99L);

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
        Assert.Equal(404, notFoundResult.StatusCode);
    }

    // 5. 权限不足 - 403
    // 使用[Authorize]属性在Controller上，测试框架会验证

    // 6. 服务异常 - 500
    [Fact]
    public async Task GetUser_WhenServiceThrows_Returns500()
    {
        _userServiceMock.Setup(s => s.GetUserByIdAsync(It.IsAny<long>()))
            .ThrowsAsync(new Exception("Database error"));

        var result = await _controller.GetUser(1L);

        var statusResult = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(500, statusResult.StatusCode);
    }
}
```

---

## 完成标准

.NET编码规范与Code Review检查表完成标准：

- [ ] 类结构和命名规范清晰
- [ ] async/await最佳实践覆盖
- [ ] EF Core规范完整
- [ ] P0/P1/P2问题判定标准明确
- [ ] 异常处理规范清晰
- [ ] Controller层测试6个必填场景定义完整
- [ ] 与项目现有规范的集成方式清楚
