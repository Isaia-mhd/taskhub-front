import apiV1Request from '@/api/apiV1Request'
import { handleError } from '@/handler/handleError'

export const getWorkspacePriorities = async (workspaceId) => {
  try {
    const response = await apiV1Request('get', `workspaces/${workspaceId}/priorities`)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const getPriority = async (priorityId) => {
  try {
    const response = await apiV1Request('get', `priorities/${priorityId}`)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const createWorkspacePriority = async (priorityData) => {
  try {
    const response = await apiV1Request('post', 'priorities', priorityData)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const updateWorkspacePriority = async (priorityId, priorityData) => {
  try {
    const response = await apiV1Request('put', `priorities/${priorityId}`, priorityData)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const deleteWorkspacePriority = async (priorityId) => {
  try {
    return await apiV1Request('delete', `priorities/${priorityId}`)
  } catch (error) {
    throw handleError(error)
  }
}

export const reorderWorkspacePriorities = async (workspaceId, priorities) => {
  try {
    const response = await apiV1Request('patch', `workspaces/${workspaceId}/priorities/reorder`, { priorities })
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}
