const crypto = require('crypto')

function formatDate(date) {
    const pad = num => String(num).padStart(2, '0')

    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    const hours = pad(date.getHours())
    const minutes = pad(date.getMinutes())
    const seconds = pad(date.getSeconds())

    return `${year}${month}${day}${hours}${minutes}${seconds}`
}

const KEY_ALGORITHM = 'aes-256-cbc' // 使用AES-256-CBC模式
const ENCODING = 'utf8'
const BASE64 = 'base64'

class CipherInstance {
    constructor() {
        this.cipher = null
    }

    getCipherInstance(key, initVector, mode) {
        if (mode === 'encrypt') {
            this.cipher = crypto.createCipheriv(KEY_ALGORITHM, Buffer.from(key), Buffer.from(initVector))
        } else if (mode === 'decrypt') {
            this.cipher = crypto.createDecipheriv(KEY_ALGORITHM, Buffer.from(key), Buffer.from(initVector))
        }
        return this.cipher
    }
}

const cipherInstance = new CipherInstance()

/**
 * 加密
 * @param {string} value - 待加密的字符串
 * @param {string} key - appid对应的密钥secret
 * @returns {string} - 加密后的字符串
 */
function encrypt(value, key) {
    try {
        const initVector = key.substring(0, 16)
        const cipher = cipherInstance.getCipherInstance(key, initVector, 'encrypt')
        let encrypted = cipher.update(value, ENCODING, BASE64)
        encrypted += cipher.final(BASE64)
        return encrypted
    } catch (error) {
        console.error(error)
        return 'UNKNOWN'
    }
}

/**
 * 解密
 * @param {string} encrypted - 加密后的字符串
 * @param {string} key - appid对应的密钥secret
 * @returns {string} - 解密后的字符串
 */
function decrypt(encrypted, key) {
    try {
        const initVector = key.substring(0, 16)
        const decipher = cipherInstance.getCipherInstance(key, initVector, 'decrypt')
        let decrypted = decipher.update(encrypted, BASE64, ENCODING)
        decrypted += decipher.final(ENCODING)
        return decrypted
    } catch (error) {
        console.error(error)
        return 'UNKNOWN'
    }
}

class SHA256Util {
    static getSHA256(str) {
        try {
            const hash = crypto.createHash('sha256')
            hash.update(str, 'utf8')
            return hash.digest('hex')
        } catch (error) {
            console.error('SHA256 calculation error:', error)
            return ''
        }
    }
}

class EncryptionUtil {
    /**
     * 生成签名
     * @param {string} appId - 应用ID
     * @param {string} secret - 密钥
     * @param {string} timestamp - 时间戳
     * @param {string} random - 随机字符串
     * @param {string} data - 数据
     * @param {string} method - 方法名
     * @param {string} version - 版本号
     * @param {string} format - 格式
     * @returns {string} 签名结果
     */
    static encryptSign(_data) {
        const { appId, secret, timestamp, random, data, method, version, format } = _data

        const str = [
            `appid=${appId}`,
            `data=${data}`,
            `format=${format}`,
            `method=${method}`,
            `nonce=${random}`,
            `timestamp=${timestamp}`,
            `version=${version}`,
            `appsecret=${secret}`,
        ].join('&')

        return SHA256Util.getSHA256(str.toLowerCase())
    }
}

class SignUtil {
    /**
     * 生成API签名
     * @param {Object} params - 请求参数对象
     * @param {string} appSecret - 密钥
     * @returns {string} 签名结果
     */
    static generateSign(params, appSecret) {
        try {
            // 1. 确保data是JSON字符串
            if (params.data && typeof params.data === 'object') {
                params.data = JSON.stringify(params.data)
            }

            // 2. 按字典序排序并拼接参数
            const sortedParams = Object.keys(params)
                .filter(key => key !== 'sign' && params[key] != null) // 排除sign和空值
                .sort()
                .map(key => `${key}=${params[key]}`)
                .join('&')

            // 3. 拼接appSecret
            const signStr = `${sortedParams}&appsecret=${appSecret}`

            // 4. 转小写并进行SHA256加密
            const hash = crypto.createHash('sha256')
            hash.update(signStr.toLowerCase(), 'utf8')
            return hash.digest('hex')
        } catch (error) {
            console.error('生成签名时发生错误:', error)
            throw error
        }
    }

    /**
     * 验证签名是否正确
     * @param {Object} params - 包含签名的请求参数
     * @param {string} appSecret - 密钥
     * @returns {boolean} 验证结果
     */
    static verifySign(params, appSecret) {
        try {
            const { sign, ...otherParams } = params
            const calculatedSign = this.generateSign(otherParams, appSecret)
            return sign.toLowerCase() === calculatedSign.toLowerCase()
        } catch (error) {
            console.error('验证签名时发生错误:', error)
            return false
        }
    }
}

// 将数组分成20个一组
const chunkArray = (array = [], size = 20) => {
    if (!Array.isArray(array)) {
        throw new Error('array must be an array')
    }

    const result = []
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size))
    }
    return result
}

function formatDateFromIDCard(idCard) {
    // 假设身份证号码为18位
    if (idCard.length === 18) {
        const birthDate = idCard.substring(6, 14) // 提取出生日期部分
        return `${birthDate.substring(0, 4)}-${birthDate.substring(4, 6)}-${birthDate.substring(6, 8)}` // 格式化为 YYYY-MM-DD
    }
    return null // 如果身份证号码不合法，返回 null
}

module.exports = {
    formatDate,
    SHA256Util,
    EncryptionUtil,
    encrypt,
    decrypt,
    chunkArray,
    SignUtil,
    formatDateFromIDCard,
}
