const {
    queryProjectCode,
    uploadSubContractor,
    querySubContractor,
    uploadTeam,
    queryTeam,
    uploadTeamMember,
    uploadContract,
    uploadAttendance,
    queryAttendance,
} = require('./src/index.js')
const { generateAttendanceData } = require('./src/attendance.js')

// 所有可用的方法映射
const methods = {
    queryProjectCode, // 查询项目编码
    uploadSubContractor, // 上传参建单位基本信息
    querySubContractor, // 查询参建单位基本信息
    uploadTeam, // 上传班组基本信息
    queryTeam, // 查询班组基本信息
    uploadTeamMember, // 上传人员信息
    uploadContract, // 上传合同信息
    generateAttendanceData, // 生成考勤数据
    uploadAttendance, // 上传考勤数据
    queryAttendance, // 查询考勤基本信息
}

// 获取命令行参数
const methodName = process.argv[2]

async function main() {
    // 如果没有提供方法名或者提供的方法名不存在
    if (!methodName || !methods[methodName]) {
        console.log('请提供要执行的方法名。可用方法:')
        Object.keys(methods).forEach(name => {
            console.log(`- ${name}`)
        })
        return
    }

    console.log(`开始执行方法: ${methodName}`)

    try {
        // 执行指定的方法
        await methods[methodName]()
        console.log(`方法 ${methodName} 执行完成`)
    } catch (error) {
        console.error(`执行 ${methodName} 时发生错误:`, error)
    }
}

main()
