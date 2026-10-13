import apiV1Request from "@/api/apiV1Request";
import { handleError } from "@/handler/handleError";

export const getSpaces = async (workspaceId) => {
  try {
    const response = await apiV1Request('get', `workspaces/${workspaceId}/spaces`);
    return response.data.data;
  } catch (error) {
    throw handleError(error);
  }
}

export const getSpace = async (spaceId) => {
  try {
    const response = await apiV1Request('get', `spaces/${spaceId}`)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const createSpace = async (spaceData) => {
  try {
    const response = await apiV1Request('post', 'spaces', spaceData)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const updateSpace = async (spaceId, spaceData) => {
  try {
    const response = await apiV1Request('put', `spaces/${spaceId}`, spaceData)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const deleteSpace = async (spaceId) => {
  try {
    return await apiV1Request('delete', `spaces/${spaceId}`)
  } catch (error) {
    throw handleError(error)
  }
}

export const reorderSpaces = async (workspaceId, spaces) => {
  try {
    const response = await apiV1Request('patch', `workspaces/${workspaceId}/spaces/reorder`, { spaces })
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}
