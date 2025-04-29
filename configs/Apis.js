import axios from "axios"

const BASE_URL = 'https://copcopne.pythonanywhere.com/'
export const endpoints = {
    login: 'api/login/',
    register: 'api/register/',
    getUser: 'api/user/',
}

export default axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})