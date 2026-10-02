import api from "@/api/axios";
import { handleError } from "@/handler/handleError";

export const getToken = async () => {
    await api.get('/sanctum/csrf-cookie')
}

export const getUser = async () => {
    try {
        await getToken()
        const response = await api.get('api/v1/user')
        
        return response
    } catch (error) {
        throw handleError(error)
    }
}

export const authenticate = async (credentials) => {
    try {
        await getToken()
        return await api.post('/api/v1/login', credentials)
        
    } catch (error) {
        throw handleError(error)
    }
}

export const create = async(info) => {
    try {
        await getToken()
        return await api.post('/api/v1/register', info)
        
    } catch (error) {
        throw handleError(error)
    }
}
export const logout = async() => {
    try {
        await getToken()
        return await api.post('/api/v1/logout')
        
    } catch (error) {
        throw handleError(error)
    }
}
