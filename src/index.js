const path = require('path')
const { createRequest } = require('./createRequest.js')
const { formatDate, EncryptionUtil, encrypt, chunkArray, formatDateFromIDCard } = require('./utils/index.js')
const { headImage } = require('./constant.js')
const { readExcelFile } = require('./attendance.js')
const { config } = require('./utils/globalConfig.js')

/**
 * 将上一步的获得的字符串全部转换为小写。再进行 SHA256 （64 位）加密，生成的字符串就是验签数据 sign。
 * 注意：SHA256 加密哈希值请转换为 16 进制表示。OpenAPI 对验签数据 sign 进行校验时不区分大小写
 */
const generateSign = (data, method, currentBaseParams = baseParams) =>
    EncryptionUtil.encryptSign({
        ...currentBaseParams,
        method,
        data: JSON.stringify(data),
    })

/**
 * 固定配置
 */
const version = '3.0'
const format = 'json'
const secret = config.secret
const appId = config.appId

const projectCode = config.projectCode
const projectCompanyCode = config.projectCompanyCode
const teamSysNo = config.teamSysNo

/**
 * 生成当前时间的基础参数
 */
function getBaseParams() {
    const currentTimestamp = formatDate(new Date())
    const currentRandom = currentTimestamp.slice(8, 14) // 当前时间的时分秒 hhmmss

    return {
        appId: appId,
        secret,
        version,
        timestamp: currentTimestamp,
        format,
        // 6 位随机数
        nonce: currentRandom,
        random: currentRandom,
    }
}

// 为了兼容现有代码，保留一个静态版本的baseParams
const baseParams = getBaseParams()

// 添加休眠函数
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 3.3. 查询项目编码信息（监管平台新建的，查询得到projectCode）
 */
async function queryProjectCode() {
    const METHOD = 'Project.Info'
    const otherParams = {
        name: config.projectName,
        contractorCorpCode: config.contractorCorpCode,
    }

    const params = {
        ...baseParams,
        method: METHOD,
        data: JSON.stringify(otherParams),
        sign: generateSign(otherParams, METHOD),
    }

    try {
        const { code, data } = await createRequest(params)
        console.log('结果：', data)
    } catch (error) {
        console.error('查询失败：', error)
    }
}

/**
 * 3.4 上传项目基本信息
 */
async function uploadProject() {
    const METHOD = 'Project.Upload'
    const otherParams = {
        contractorCorpCode: '911100001017004524', //施工方统一社会信用代码
        contractorCorpName: '施工方有限建设公司', //施工方名称
        name: '项目名称', //项目名称
        buildCorpName: '建设方有限建设公司', //建设方名称
        buildCorpCode: '911100001017004526', //建设方统一社会信用代码
        areaCode: '110101', //所属区域。参考行政区划字典表
        invest: 1000000, //工程造价，单位：（元）
        startDate: '2024-01-01', //开工日期
        timeLimit: 100, //建设周期，单位：（天）
        linkMan: '张三', //项目办理人姓名
        linkTel: '13277022072', //项目办理人联系方式
        prjStatus: 'NOT_STARTED', //项目状态。参考项目状态字典表
        lat: 116.407413, //纬度
        lng: 39.90872, //经度
        address: '北京市海淀区', //项目地址
        type: '01', //项目类型。参考项目类型字典表
        investment: 'GOV',
        industry: '01', //行业类型。参考行业类型字典表
    }

    const params = {
        ...baseParams,
        method: METHOD,
        data: JSON.stringify(otherParams),
        sign: generateSign(otherParams, METHOD),
    }

    try {
        console.log(params)
        const { code, message, data } = await createRequest(params)
        console.log('结果：', data)
    } catch (error) {
        console.error('上传失败：', error)
    }
}

/**
 * 3.5. 上传参建单位基本信息（获取projectCompanyCode）
 */
async function uploadSubContractor() {
    const METHOD = 'ProjectSubContractor.Upload'
    const otherParams = {
        projectCode,
        corpCode: '911100001017004524',
        corpName: '中交一公局集团有限建设公司',
        corpType: '0',
        manager: '张三',
        managerTel: '13277022072',
    }

    const params = {
        ...baseParams,
        method: METHOD,
        data: JSON.stringify(otherParams),
        sign: generateSign(otherParams, METHOD),
    }

    try {
        const { code, message, data } = await createRequest(params)
        console.log('结果：', data)
    } catch (error) {
        console.error('上传失败：', error)
    }
}

/**
 * 3.6. 查询参建单位基本信息
 */
async function querySubContractor() {
    const METHOD = 'ProjectSubContractor.Query'
    const otherParams = {
        pageIndex: 1,
        pageSize: 20,
        projectCode,
    }

    const params = {
        ...baseParams,
        method: METHOD,
        data: JSON.stringify(otherParams),
        sign: generateSign(otherParams, METHOD),
    }

    try {
        const { code, message, data } = await createRequest(params)
        console.log('结果：', data)
    } catch (error) {
        console.error('查询失败：', error)
    }
}

/**
 * 3.7. 查询项目基本信息
 */
async function queryProject() {
    const METHOD = 'Project.Query'
    const otherParams = {
        pageIndex: 1,
        pageSize: 50,
        projectCode,
        buildCorpName: '建设方有限建设公司', //buildCorpName与buildCorpCode必须传一个
        // buildCorpCode: '911100001017004526', //buildCorpName与buildCorpCode必须传一个
    }

    const params = {
        ...baseParams,
        method: METHOD,
        data: JSON.stringify(otherParams),
        sign: generateSign(otherParams, METHOD),
    }

    try {
        const { code, message, data } = await createRequest(params)
        console.log('结果：', data)
    } catch (error) {
        console.error('查询失败：', error)
    }
}

/**
 * 3.8. 上传班组基本信息
 */
async function uploadTeam() {
    const METHOD = 'Team.Upload'
    const otherParams = {
        projectCode,
        projectCompanyCode,
        corpName: '武汉城建建设工程有限公司',
        teamName: '综合班组',
        type: '1000', //其他
        remark: '上传班组的信息',
    }

    const params = {
        ...baseParams,
        method: METHOD,
        data: JSON.stringify(otherParams),
        sign: generateSign(otherParams, METHOD),
    }

    try {
        const { code, message, data } = await createRequest(params)
        console.log('结果：', data)
    } catch (error) {
        console.error('上传失败：', error)
    }
}

/**
 * 3.9. 查询班组基本信息
 */
async function queryTeam() {
    const METHOD = 'Team.Query'
    const otherParams = {
        pageIndex: 1,
        pageSize: 50,
        projectCode,
    }

    const params = {
        ...baseParams,
        method: METHOD,
        data: JSON.stringify(otherParams),
        sign: generateSign(otherParams, METHOD),
    }

    try {
        const { code, message, data } = await createRequest(params)
        console.log('结果：', data)
    } catch (error) {
        console.error('查询失败：', error)
    }
}

/**
 * 3.10. 上传人员基本信息
 */
async function uploadTeamMember() {
    const METHOD = 'ProjectWorker.Upload'

    // 读取人员数据
    const inputFile = path.join(__dirname, '../data/input.xlsx')

    const { sheetThreeData = [] } = readExcelFile(inputFile)

    const _list = sheetThreeData.map(i => {
        return {
            workerName: i['工人姓名'],
            idcard: encrypt(i['身份证号码'], secret),
            sex: i['性别(男:1,女:2)'],
            birthday: formatDateFromIDCard(i['身份证号码']),
            nation: i['民族'],
            address: i['地址'],
            tel: i['联系电话'],
            headImage, //头像
        }
    })

    const chunkedList = chunkArray(_list, 1)

    try {
        for (let i = 0; i < chunkedList.length; i++) {
            const chunk = chunkedList[i]
            console.log(`正在处理第 ${i + 1}/${chunkedList.length} 批数据`)

            // 为每个请求生成新的基础参数（包含新的时间戳和随机数）
            const currentBaseParams = getBaseParams()

            const otherParams = {
                projectCode,
                //人员列表数据,JSON 数组，数量不能超过 5
                employeeList: chunk,
            }

            const params = {
                ...currentBaseParams,
                method: METHOD,
                data: JSON.stringify(otherParams),
                sign: generateSign(otherParams, METHOD, currentBaseParams),
            }

            try {
                const { code, message, data } = await createRequest(params)
                console.log('结果：', data)

                // 如果不是最后一个批次，等待1秒
                if (i < chunkedList.length - 1) {
                    console.log('等待1秒后处理下一批...')
                    await sleep(1000)
                }
            } catch (error) {
                console.error('上传失败：', error)
                console.error('失败的数据：', JSON.stringify(chunk, null, 2))
                break // 失败时中止循环
            }
        }
    } catch (error) {
        console.error('批量处理失败：', error)
    }
}

/**
 * 3.11. 上传合同基本信息
 */
async function uploadContract() {
    const METHOD = 'WorkerContract.Upload'

    // 读取人员数据
    const inputFile = path.join(__dirname, '../data/input.xlsx')

    const { sheetThreeData = [] } = readExcelFile(inputFile)

    const _list = sheetThreeData.map(i => {
        return {
            workerName: i['工人姓名'],
            idcard: encrypt(i['身份证号码'], secret),
            startDate: i['雇佣日期'],
            endDate: i['雇佣结束日期'],
            status: i['合同状态'], //合同状态  ON_JOB在职  DISMISSED离职
            workType: i['当前工种'], //当前工种
            workRole: i['工人类型'], //工人类型
        }
    })

    const chunkedList = chunkArray(_list, 1)

    try {
        for (let i = 0; i < chunkedList.length; i++) {
            const chunk = chunkedList[i]
            console.log(`正在处理第 ${i + 1}/${chunkedList.length} 批数据`)

            // 为每个请求生成新的基础参数（包含新的时间戳和随机数）
            const currentBaseParams = getBaseParams()

            const otherParams = {
                projectCode,
                projectCompanyCode,
                teamSysNo,
                //人员列表数据,JSON 数组，数量不能超过 5
                contractList: chunk,
            }

            const params = {
                ...currentBaseParams,
                method: METHOD,
                data: JSON.stringify(otherParams),
                sign: generateSign(otherParams, METHOD, currentBaseParams),
            }

            try {
                const { code, message, data } = await createRequest(params)
                console.log('结果：', data)

                // 如果不是最后一个批次，等待1秒
                if (i < chunkedList.length - 1) {
                    console.log('等待1秒后处理下一批...')
                    await sleep(1000)
                }
            } catch (error) {
                console.error('上传失败：', error)
                console.error('失败的数据：', JSON.stringify(chunk, null, 2))
                break // 失败时中止循环
            }
        }
    } catch (error) {
        console.error('批量处理失败：', error)
    }
}

/**
 * 3.14. 上传考勤基本信息
 */
async function uploadAttendance() {
    const METHOD = 'WorkerAttendance.Upload'

    // 读取考勤数据
    const outputFile = path.join(__dirname, '../data/output.xlsx')

    const { sheetOneData = [] } = readExcelFile(outputFile)

    const _list = sheetOneData.map(i => {
        return {
            idcard: encrypt(i['身份证号码'], secret),
            date: i['考勤时间(精确到时分秒)'],
            direction: i['进出方向进出方向(1:入场0:出场-1:无方向)'],
        }
    })

    const chunkedList = chunkArray(_list, 1)

    try {
        for (let i = 0; i < chunkedList.length; i++) {
            const chunk = chunkedList[i]
            console.log(`正在处理第 ${i + 1}/${chunkedList.length} 批数据`)

            // 为每个请求生成新的基础参数（包含新的时间戳和随机数）
            const currentBaseParams = getBaseParams()

            const otherParams = {
                projectCode,
                teamSysNo,
                dataList: chunk, //数组长度不超过 20
            }

            const params = {
                ...currentBaseParams,
                method: METHOD,
                data: JSON.stringify(otherParams),
                sign: generateSign(otherParams, METHOD, currentBaseParams),
            }

            try {
                const { code, message, data } = await createRequest(params)
                console.log('结果：', data)

                // 如果不是最后一个批次，等待1秒
                if (i < chunkedList.length - 1) {
                    console.log('等待1秒后处理下一批...')
                    await sleep(1000)
                }
            } catch (error) {
                console.error('上传失败：', error)
                console.error('失败的数据：', JSON.stringify(chunk, null, 2))
                break // 失败时中止循环
            }
        }
    } catch (error) {
        console.error('批量处理失败：', error)
    }
}

/**
 * 3.15. 查询考勤基本信息
 */
async function queryAttendance() {
    const METHOD = 'WorkerAttendance.Query'
    const otherParams = {
        projectCode,
        teamSysNo,
        pageIndex: 1,
        pageSize: 50,
    }

    const params = {
        ...baseParams,
        method: METHOD,
        data: JSON.stringify(otherParams),
        sign: generateSign(otherParams, METHOD),
    }

    try {
        const { code, message, data } = await createRequest(params)
        console.log('结果：', data)
    } catch (error) {
        console.error('查询失败：', error)
    }
}

module.exports = {
    queryProjectCode,
    uploadProject,
    uploadSubContractor,
    querySubContractor,
    queryProject,
    uploadTeam,
    queryTeam,
    uploadTeamMember,
    uploadContract,
    uploadAttendance,
    queryAttendance,
}
