import apiV1Request from '@/api/apiV1Request'
import { handleError } from '@/handler/handleError'

export const getSpaceTaskLists = async (spaceId) => {
  try {
    const response = await apiV1Request('get', `spaces/${spaceId}/task-lists`)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const createTaskList = async (taskListData) => {
  try {
    const response = await apiV1Request('post', 'task-lists', taskListData)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const updateTaskList = async (taskListId, taskListData) => {
  try {
    const response = await apiV1Request('put', `task-lists/${taskListId}`, taskListData)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const deleteTaskList = async (taskListId) => {
  try {
    return await apiV1Request('delete', `task-lists/${taskListId}`)
  } catch (error) {
    throw handleError(error)
  }
}
