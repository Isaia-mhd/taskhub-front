import apiV1Request from '@/api/apiV1Request'
import { handleError } from '@/handler/handleError'

export const getSpaceFolders = async (spaceId) => {
  try {
    const response = await apiV1Request('get', `spaces/${spaceId}/folders`)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const getFolder = async (folderId) => {
  try {
    const response = await apiV1Request('get', `folders/${folderId}`)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const createFolder = async (folderData) => {
  try {
    const response = await apiV1Request('post', 'folders', folderData)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const updateFolder = async (folderId, folderData) => {
  try {
    const response = await apiV1Request('put', `folders/${folderId}`, folderData)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const deleteFolder = async (folderId) => {
  try {
    return await apiV1Request('delete', `folders/${folderId}`)
  } catch (error) {
    throw handleError(error)
  }
}

export const reorderFolders = async (spaceId, folders) => {
  try {
    const response = await apiV1Request('patch', `spaces/${spaceId}/folders/reorder`, { folders })
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}
