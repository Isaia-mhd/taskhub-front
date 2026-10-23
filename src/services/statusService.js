import apiV1Request from '@/api/apiV1Request'
import { handleError } from '@/handler/handleError'

export const getWorkspaceStatuses = async (workspaceId) => {
  try {
    const response = await apiV1Request('get', `workspaces/${workspaceId}/statuses`)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const createWorkspaceStatus = async (statusData) => {
  try {
    const response = await apiV1Request('post', 'statuses', statusData)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const updateWorkspaceStatus = async (statusId, statusData) => {
  try {
    const response = await apiV1Request('put', `statuses/${statusId}`, statusData)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const deleteWorkspaceStatus = async (statusId) => {
  try {
    return await apiV1Request('delete', `statuses/${statusId}`)
  } catch (error) {
    throw handleError(error)
  }
}

export const reorderWorkspaceStatuses = async (workspaceId, statuses) => {
  try {
    const response = await apiV1Request('patch', `workspaces/${workspaceId}/statuses/reorder`, { statuses })
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}
