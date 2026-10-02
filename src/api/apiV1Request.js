import api from "./axios";

const apiV1Request = async (method, endpoints, options = {}) => {
    switch (method) {
        case 'get':
            return await api.get('api/v1/' + endpoints, options)
            break;
        case 'post':
            return await api.post('api/v1/' + endpoints, options)
            break;
        case 'put':
            return await api.put('api/v1/' + endpoints, options)
            break;
        case 'delete':
            return await api.delete('api/v1/' + endpoints, options)
            break;
    
        default:
            break;
    }
}
export default apiV1Request