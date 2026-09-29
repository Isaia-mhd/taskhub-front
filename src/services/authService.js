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
        const res = await api.post('/api/v1/login', credentials)
        return res
        
    } catch (error) {
        throw handleError(error)
    }
}
