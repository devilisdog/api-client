const axios = require('axios')
const FormData = require('form-data')
const { config } = require('./utils/globalConfig')

function createFormData(params) {
    let data = new FormData()
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            data.append(key, params[key])
        }
    }
    return data
}

function createConfig(data) {
    return {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${config.originUrl}/open/api/get`,
        headers: {
            ...data.getHeaders(),
        },
        data: data,
    }
}

function createRequest(params) {
    const data = createFormData(params)
    const config = createConfig(data)

    return axios
        .request(config)
        .then(response => {
            console.log(JSON.stringify(response.data))
            return response.data
        })
        .catch(error => {
            console.log(error)
            throw error
        })
}

module.exports = {
    createRequest,
}
