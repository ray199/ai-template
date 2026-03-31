// write-plan 技能实现

/**
 * 生成开发计划
 * @param {string} input - 用户输入的需求
 * @returns {string} 生成的开发计划
 */
function generatePlan(input) {
  // 解析用户输入
  const parsedInput = parseInput(input);
  
  // 生成计划
  const plan = {
    phases: [
      {
        name: "阶段一：准备工作",
        tasks: [
          "环境搭建",
          "项目初始化",
          "技术选型确认"
        ],
        estimate: "1天"
      },
      {
        name: "阶段二：核心功能开发",
        tasks: parsedInput.features.map((feature, index) => `功能${index + 1}实现`),
        estimate: `${parsedInput.features.length * 2}天`
      },
      {
        name: "阶段三：测试与部署",
        tasks: [
          "单元测试",
          "集成测试",
          "部署上线"
        ],
        estimate: "2天"
      }
    ]
  };
  
  // 计算总时间
  const totalDays = 1 + (parsedInput.features.length * 2) + 2;
  
  // 生成输出
  return formatPlan(plan, totalDays);
}

/**
 * 解析用户输入
 * @param {string} input - 用户输入
 * @returns {Object} 解析结果
 */
function parseInput(input) {
  const lines = input.split('\n');
  const features = [];
  let inFeatures = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine === "项目需求：") {
      inFeatures = true;
      continue;
    }
    
    if (inFeatures && trimmedLine.startsWith('- ')) {
      features.push(trimmedLine.substring(2));
    }
    
    if (inFeatures && trimmedLine === "技术栈：") {
      break;
    }
  }
  
  return { features };
}

/**
 * 格式化计划输出
 * @param {Object} plan - 计划对象
 * @param {number} totalDays - 总天数
 * @returns {string} 格式化的计划
 */
function formatPlan(plan, totalDays) {
  let output = "# 开发计划\n\n";
  
  plan.phases.forEach(phase => {
    output += `## ${phase.name}\n`;
    phase.tasks.forEach((task, index) => {
      output += `${index + 1}. ${task}\n`;
    });
    output += `\n`;
  });
  
  output += "## 时间估计\n";
  plan.phases.forEach(phase => {
    output += `- ${phase.name.split('：')[0]}：${phase.estimate}\n`;
  });
  output += `- 总计：${totalDays}天`;
  
  return output;
}

// 导出技能
module.exports = {
  generatePlan,
  parseInput,
  formatPlan
};