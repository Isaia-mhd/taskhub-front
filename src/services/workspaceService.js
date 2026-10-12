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

export const getWorkspace = async (workspaceId) => {
    try {
        
        const response = await apiV1Request('get', `workspaces/${workspaceId}`);        
        
        return response.data.data;

    } catch (error) {

        throw handleError(error);

    }
}

export const createWorkspace = async (workspaceData) => {
    try {
        const response = await apiV1Request('post', 'workspaces', workspaceData);
        return response.data.data;
    } catch (error) {
        throw handleError(error);
    }
}

export const updateWorkspace = async (workspaceId, workspaceData) => {
    try {
        const response = await apiV1Request('put', `workspaces/${workspaceId}`, workspaceData);
        return response.data.data;
    } catch (error) {
        throw handleError(error);
    }
}

export const deleteWorkspace = async (workspaceId) => {
    try {
        const response = await apiV1Request('delete', `workspaces/${workspaceId}`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
}