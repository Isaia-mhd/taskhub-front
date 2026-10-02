import  apiV1Request  from "@/api/apiV1Request";
import { handleError } from "@/handler/handleError";

export const getWorkspaces = async () => {
    try {
        const response = await apiV1Request('get', 'workspaces');
        
        return response.data.data;
    } catch (error) {
        throw handleError(error);
    }
}