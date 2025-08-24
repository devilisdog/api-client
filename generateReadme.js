const fs = require('fs')
const path = require('path')

// README 内容
const readmeContent = `# 工程项目信息管理系统

## 项目简介

本项目是一个工程项目信息管理系统的接口客户端，主要用于与工程管理平台进行数据交互，包括项目信息、参建单位、班组、人员和考勤等数据的上传和查询功能。

## 功能特点

- 项目基本信息的上传和查询
- 参建单位信息的管理
- 班组信息的上传和查询
- 工人基本信息的批量上传
- 合同信息的批量上传
- 考勤数据的生成和批量上传
- 数据加密传输，保障安全

## 安装指南

### 系统要求
- Node.js 14.x 或更高版本
- npm 6.x 或更高版本

### 安装步骤

1. 克隆或下载项目代码
\`\`\`
git clone <项目仓库地址>
cd idcard-ocr
\`\`\`

2. 安装依赖
\`\`\`
npm install
\`\`\`

3. 创建必要的目录和文件
\`\`\`
mkdir -p data/input data/output
\`\`\`

## 配置说明

1. 在项目根目录下创建 \`src/utils/globalConfig.js\` 文件，内容如下：

\`\`\`
const config = {
    // API配置
    appId: '您的appId',
    secret: '您的secret',
    
    // 项目信息
    projectCode: '项目编码',
    projectName: '项目名称',
    contractorCorpCode: '施工方统一社会信用代码',
    projectCompanyCode: '项目参建单位编码',
    teamSysNo: '班组系统编号'
}

module.exports = { config }
\`\`\`

2. 准备数据文件：
   - 在 \`data\` 目录下放置 \`input.xlsx\` 文件，包含工人信息
   - 参考项目中的数据格式要求

## 使用方法

本项目提供了多种功能方法，可以通过命令行方式调用：

\`\`\`
# 查看所有可用方法
node test.js

# 执行特定方法
node test.js <方法名>

# 例如：查询项目编码
node test.js queryProjectCode

# 例如：上传参建单位信息
node test.js uploadSubContractor

# 或者使用npm脚本
npm run method <方法名>
\`\`\`

## 功能方法详细说明

### 1. queryProjectCode - 查询项目编码
通过项目名称和施工方统一社会信用代码查询项目编码信息。

**用途**：获取项目的唯一标识符 projectCode，该值用于后续其他接口的调用。

**数据要求**：需在 globalConfig.js 中配置 projectName 和 contractorCorpCode。

**运行命令**：
\`\`\`
node test.js queryProjectCode
\`\`\`

**执行结果**：控制台输出项目编码信息。

### 2. uploadSubContractor - 上传参建单位信息
向系统提交参建单位的基本信息。

**用途**：注册新的参建单位，获取参建单位编码 projectCompanyCode。

**数据要求**：需在 globalConfig.js 中配置 projectCode。

**运行命令**：
\`\`\`
node test.js uploadSubContractor
\`\`\`

**执行结果**：控制台输出参建单位上传结果，包含 projectCompanyCode。

### 3. querySubContractor - 查询参建单位信息
查询已上传的参建单位信息列表。

**用途**：检索当前项目下所有参建单位的信息。

**数据要求**：需在 globalConfig.js 中配置 projectCode。

**运行命令**：
\`\`\`
node test.js querySubContractor
\`\`\`

**执行结果**：控制台输出参建单位列表信息。

### 4. uploadTeam - 上传班组信息
向系统提交班组基本信息。

**用途**：创建新的班组，获取班组系统编号 teamSysNo。

**数据要求**：需在 globalConfig.js 中配置 projectCode 和 projectCompanyCode。

**运行命令**：
\`\`\`
node test.js uploadTeam
\`\`\`

**执行结果**：控制台输出班组上传结果，包含 teamSysNo。

### 5. queryTeam - 查询班组信息
查询已上传的班组信息列表。

**用途**：检索当前项目下所有班组的信息。

**数据要求**：需在 globalConfig.js 中配置 projectCode。

**运行命令**：
\`\`\`
node test.js queryTeam
\`\`\`

**执行结果**：控制台输出班组列表信息。

### 6. uploadTeamMember - 上传人员信息
批量上传工人基本信息。

**用途**：向系统添加工人信息，为后续考勤管理做准备。

**数据要求**：
- 需在 data 目录下放置 input.xlsx 文件
- Excel 中需包含：工人姓名、身份证号码、性别、民族、地址、联系电话等信息
- 需在 globalConfig.js 中配置 projectCode

**运行命令**：
\`\`\`
node test.js uploadTeamMember
\`\`\`

**执行结果**：控制台输出每批次上传结果，显示成功/失败信息。

### 7. uploadContract - 上传合同信息
批量上传工人合同信息。

**用途**：向系统添加工人的雇佣合同信息。

**数据要求**：
- 需在 data 目录下放置 input.xlsx 文件
- Excel 中需包含：工人姓名、身份证号码、雇佣日期、雇佣结束日期、合同状态、当前工种、工人类型等信息
- 需在 globalConfig.js 中配置 projectCode、projectCompanyCode 和 teamSysNo

**运行命令**：
\`\`\`
node test.js uploadContract
\`\`\`

**执行结果**：控制台输出每批次上传结果，显示成功/失败信息。

### 8. generateAttendanceData - 生成考勤数据
根据工人信息自动生成模拟考勤数据。

**用途**：生成测试用的考勤数据，用于测试考勤上传功能。

**数据要求**：需在 data 目录下放置 input.xlsx 文件，包含工人身份证号码信息。

**运行命令**：
\`\`\`
node test.js generateAttendanceData
\`\`\`

**执行结果**：在 data 目录下生成 output.xlsx 文件，包含生成的考勤数据。

### 9. uploadAttendance - 上传考勤数据
批量上传工人考勤数据。

**用途**：向系统提交工人的进出场记录。

**数据要求**：
- 需在 data 目录下存在 output.xlsx 文件
- Excel 中需包含：身份证号码、考勤时间、进出方向等信息
- 需在 globalConfig.js 中配置 projectCode 和 teamSysNo

**运行命令**：
\`\`\`
node test.js uploadAttendance
\`\`\`

**执行结果**：控制台输出每批次上传结果，显示成功/失败信息。

### 10. queryAttendance - 查询考勤信息
查询已上传的考勤记录。

**用途**：检索工人的考勤记录。

**数据要求**：需在 globalConfig.js 中配置 projectCode 和 teamSysNo。

**运行命令**：
\`\`\`
node test.js queryAttendance
\`\`\`

**执行结果**：控制台输出考勤记录列表。

## 数据文件格式说明

### input.xlsx 文件格式
包含以下字段的Excel表格：
- 工人姓名
- 身份证号码
- 性别(男:1,女:2)
- 民族
- 地址
- 联系电话
- 雇佣日期
- 雇佣结束日期
- 合同状态
- 当前工种
- 工人类型

### output.xlsx 文件格式
包含以下字段的Excel表格：
- 身份证号码
- 考勤时间(精确到时分秒)
- 进出方向进出方向(1:入场0:出场-1:无方向)

## 数据处理流程

1. **批量处理优化**：
   - 所有批量上传功能都实现了数据分批处理
   - 每批数据处理完成后有1秒延迟，避免请求过于频繁
   - 自动处理错误，当某批数据处理失败时会中止流程并显示失败数据

2. **数据加密**：
   - 敏感信息如身份证号码会自动加密处理
   - 每次请求会生成新的时间戳和随机数，确保安全

## 常见问题

### 如何查看项目编码？
使用 \`node test.js queryProjectCode\` 命令查询项目编码。

### 如何批量上传人员信息？
1. 准备好符合格式的 \`input.xlsx\` 文件
2. 将文件放在 \`data\` 目录下
3. 运行 \`node test.js uploadTeamMember\` 命令

### 如何生成考勤数据？
运行 \`node test.js generateAttendanceData\` 命令，系统会自动生成考勤数据并保存到 \`data/output.xlsx\` 文件中。

### 请求失败怎么办？
1. 检查网络连接
2. 检查配置参数是否正确
3. 检查 \`globalConfig.js\` 中的 appId 和 secret 是否有效
4. 查看控制台输出的错误信息进行排查

## 技术支持

如有问题，请联系项目管理员或提交 issue。
`

// 写入README.md文件
fs.writeFileSync(path.join(__dirname, 'README.md'), readmeContent, 'utf8')

console.log('README.md 文件已成功生成！')
