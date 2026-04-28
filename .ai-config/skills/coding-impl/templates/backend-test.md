# 后端 Service 层测试骨架模板

> Step 5 对 Service 层每个公共方法生成本骨架。

```java
@ExtendWith(MockitoExtension.class)
class XxxServiceImplTest {

    @InjectMocks
    private XxxServiceImpl xxxService;

    @Mock
    private XxxMapper xxxMapper;

    /**
     * 正常场景：[方法名] - [预期行为描述]
     */
    @Test
    void testXxx_success() {
        // given
        // TODO: 准备测试数据和 Mock 行为

        // when
        // TODO: 调用被测方法

        // then
        // TODO: 验证结果
    }

    /**
     * 异常场景：[方法名] - [异常触发条件]
     */
    @Test
    void testXxx_throwsWhen_xxx() {
        // given
        // TODO: 准备触发异常的条件

        // when & then
        assertThrows(BusinessException.class, () -> xxxService.xxx(param));
    }
}
```

## 测试覆盖建议

- 每个公共方法至少 1 个正常场景 + 1 个异常场景
- 涉及事务的方法：补一个"中途异常需回滚"测试
- 涉及缓存的方法：补一个"缓存失效"测试
- 涉及权限的方法：补一个"无权限抛 AccessDenied"测试
