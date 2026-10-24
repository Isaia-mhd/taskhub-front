import apiV1Request from '@/api/apiV1Request'
import { handleError } from '@/handler/handleError'

export const getWorkspaceTags = async (workspaceId) => {
  try {
    const response = await apiV1Request('get', `workspaces/${workspaceId}/tags`)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const createTag = async (tagData) => {
  try {
    const response = await apiV1Request('post', 'tags', tagData)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const updateTag = async (tagId, tagData) => {
  try {
    const response = await apiV1Request('put', `tags/${tagId}`, tagData)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const deleteTag = async (tagId) => {
  try {
    return await apiV1Request('delete', `tags/${tagId}`)
  } catch (error) {
    throw handleError(error)
  }
}

export const attachTaskTags = async (taskId, tagIds) => {
  try {
    return await apiV1Request('post', `tasks/${taskId}/tags/bulk`, { tag_ids: tagIds })
  } catch (error) {
    throw handleError(error)
  }
}

export const removeTaskTag = async (taskId, tagId) => {
  try {
    return await apiV1Request('delete', `tasks/${taskId}/tags/${tagId}`)
  } catch (error) {
    throw handleError(error)
  }
}
