import apiV1Request from '@/api/apiV1Request'
import { handleError } from '@/handler/handleError'

export const getTaskListTasks = async (taskListId) => {
  try {
    const response = await apiV1Request('get', `task-lists/${taskListId}/tasks`)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const createTask = async (taskData) => {
  try {
    const response = await apiV1Request('post', 'tasks', taskData)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const updateTask = async (taskId, taskData) => {
  try {
    const response = await apiV1Request('put', `tasks/${taskId}`, taskData)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const deleteTask = async (taskId) => {
  try {
    return await apiV1Request('delete', `tasks/${taskId}`)
  } catch (error) {
    throw handleError(error)
  }
}

export const changeTaskStatus = async (taskId, statusId) => {
  try {
    const response = await apiV1Request('patch', `tasks/${taskId}/status`, { status_id: statusId })
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const changeTaskPriority = async (taskId, priorityId) => {
  try {
    const response = await apiV1Request('patch', `tasks/${taskId}/priority`, { priority_id: priorityId })
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}
