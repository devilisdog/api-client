const XLSX = require('xlsx')
const path = require('path')

// 读取Excel文件
function readExcelFile(filePath) {
    try {
        const workbook = XLSX.readFile(filePath)
        const sheetOne = workbook.Sheets[workbook.SheetNames[0]]
        const sheetTwo = workbook.Sheets[workbook.SheetNames[1]]
        const sheetThree = workbook.Sheets[workbook.SheetNames[2]]

        // 将表格数据转换为JSON格式
        const sheetOneData = XLSX.utils.sheet_to_json(sheetOne)
        const sheetTwoData = XLSX.utils.sheet_to_json(sheetTwo)
        const sheetThreeData = XLSX.utils.sheet_to_json(sheetThree)

        return {
            sheetOneData,
            sheetTwoData,
            sheetThreeData,
        }
    } catch (error) {
        console.error('读取Excel文件时发生错误:', error)
        throw error
    }
}

// 更新考勤数据
function updateAttendanceData(directoryData) {
    let record2 = []
    directoryData.forEach(directory => {
        //项目名称
        const projectName = directory['项目名称']
        //参建单位名称
        const companyName = directory['参建单位名称']
        //参建单位统一信用代码
        const companyCode = directory['参建单位统一信用代码']
        //班组名字
        const teamName = directory['班组名字']
        const employeeName = directory['工人姓名']
        //身份证号码
        const idCard = directory['身份证号码']
        //考勤起点时间
        const entryTime = directory['考勤起点时间']
        const exitTime = directory['考勤截至时间']
        const days = directory['考勤天数']

        //根据以上信息生成日期数组，数组的长度为考勤天数，开始日期为考勤起点时间，结束日期为考勤截至时间
        const record = []
        for (let i = 0; i < days; i++) {
            const date = new Date(entryTime)
            date.setDate(date.getDate() + i + 1)
            record.push(date.toISOString().split('T')[0].trim())
        }

        //record的每一项复制一次
        const list = record.map(item => [
            {
                项目名称: projectName,
                参建单位名称: companyName,
                参建单位统一信用代码: companyCode,
                班组名字: teamName,
                工人姓名: employeeName,
                身份证号码: idCard,
                '进出方向进出方向(1:入场0:出场-1:无方向)': '1',
                //item为日期字符串，格式为YYYY-MM-DD，需要将其转换为YYYY-MM-DD HH:mm:ss格式 HH:mm:ss的规则是06:00:00到08:00:00随机生成
                考勤年份: item.split('-')[0],
                考勤月份: item.split('-')[1],
                考勤日: item.split('-')[2],
                '考勤时间(精确到时分秒)': `${item} ${String(Math.floor(Math.random() * (8 - 6) + 6)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(
                    2,
                    '0'
                )}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
                创建时间: item,
                创建人: '王亮-13360630999',
            },
            {
                项目名称: projectName,
                参建单位名称: companyName,
                参建单位统一信用代码: companyCode,
                班组名字: teamName,
                工人姓名: employeeName,
                身份证号码: idCard,
                '进出方向进出方向(1:入场0:出场-1:无方向)': '0',
                考勤年份: item.split('-')[0],
                考勤月份: item.split('-')[1],
                考勤日: item.split('-')[2],
                //item为日期字符串，格式为YYYY-MM-DD，需要将其转换为YYYY-MM-DD HH:mm:ss格式 HH:mm:ss的规则是18:00:00到21:00:00随机生成
                '考勤时间(精确到时分秒)': `${item} ${String(Math.floor(Math.random() * (21 - 18) + 18)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(
                    2,
                    '0'
                )}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
                创建时间: item,
                创建人: '王亮-13360630999',
            },
        ])

        record2.push(...list)
    })

    return record2.flat() // 返回展平后的数组
}

// 保存更新后的Excel文件
function saveExcelFile(data, outputPath) {
    try {
        const newWorkbook = XLSX.utils.book_new()
        const newSheet = XLSX.utils.json_to_sheet(data)
        XLSX.utils.book_append_sheet(newWorkbook, newSheet, '更新后的考勤数据')
        XLSX.writeFile(newWorkbook, outputPath)
        console.log('文件已成功保存至:', outputPath)
    } catch (error) {
        console.error('保存Excel文件时发生错误:', error)
        throw error
    }
}

// 生成考勤数据
function generateAttendanceData() {
    const inputFile = path.join(__dirname, '../data/input.xlsx')
    const outputFile = path.join(__dirname, '../data/output.xlsx')

    try {
        // 读取Excel文件
        const { sheetOneData } = readExcelFile(inputFile)

        // 更新考勤数据
        const updatedData = updateAttendanceData(sheetOneData)

        // 保存更新后的文件
        saveExcelFile(updatedData, outputFile)
    } catch (error) {
        console.error('处理过程中发生错误:', error)
    }
}

module.exports = {
    generateAttendanceData,
    readExcelFile,
}
