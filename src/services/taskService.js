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

export const getTask = async (taskId) => {
  try {
    const response = await apiV1Request('get', `tasks/${taskId}`)
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

export const moveTask = async (taskId, listId) => {
  try {
    const response = await apiV1Request('patch', `tasks/${taskId}/move`, { list_id: listId })
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const updateTaskStartDate = async (taskId, date) => {
  try {
    const response = await apiV1Request('patch', `tasks/${taskId}/start-date`, { date })
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const updateTaskDueDate = async (taskId, date) => {
  try {
    const response = await apiV1Request('patch', `tasks/${taskId}/due-date`, { date })
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const toggleTaskCompletion = async (taskId) => {
  try {
    const response = await apiV1Request('patch', `tasks/${taskId}/complete`)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const reorderTaskListTasks = async (taskListId, tasks) => {
  try {
    const response = await apiV1Request('patch', `task-lists/${taskListId}/tasks/reorder`, {
      tasks: tasks.map((task, position) => ({ id: task.id, position })),
    })
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const getTaskSubtasks = async (taskId) => {
  try {
    const response = await apiV1Request('get', `tasks/${taskId}/subtasks`)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const createTaskSubtask = async (taskId, subtaskData) => {
  try {
    const response = await apiV1Request('post', `tasks/${taskId}/subtasks`, subtaskData)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const updateTaskSubtask = async (taskId, subtaskId, subtaskData) => {
  try {
    const response = await apiV1Request('put', `tasks/${taskId}/subtasks/${subtaskId}`, subtaskData)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const deleteTaskSubtask = async (taskId, subtaskId) => {
  try {
    return await apiV1Request('delete', `tasks/${taskId}/subtasks/${subtaskId}`)
  } catch (error) {
    throw handleError(error)
  }
}

export const getTaskAssignees = async (taskId) => {
  try {
    const response = await apiV1Request('get', `tasks/${taskId}/assignees`)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const getTaskAssigneeOptions = async (taskId) => {
  try {
    const response = await apiV1Request('get', `tasks/${taskId}/assignee-options`)
    return response.data.data
  } catch (error) {
    throw handleError(error)
  }
}

export const assignTaskUsers = async (taskId, userIds) => {
  try {
    return await apiV1Request('post', `tasks/${taskId}/assignees/bulk`, { user_ids: userIds })
  } catch (error) {
    throw handleError(error)
  }
}

export const removeTaskAssignee = async (taskId, userId) => {
  try {
    return await apiV1Request('delete', `tasks/${taskId}/assignees/${userId}`)
  } catch (error) {
    throw handleError(error)
  }
}
