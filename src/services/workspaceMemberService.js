import apiV1Request from '@/api/apiV1Request'
import { handleError } from '@/handler/handleError'

export const getWorkspaceMembers = async (workspaceId, page = 1) => {
    try {
        const response = await apiV1Request('get', `workspace-members/${workspaceId}/members`, { params: { page } })
        const result = response.data.data

        if (Array.isArray(result)) {
            return { members: result, currentPage: page, lastPage: page, total: result.length }
        }

        return {
            members: result?.data ?? [],
            currentPage: result?.meta?.current_page ?? page,
            lastPage: result?.meta?.last_page ?? page,
            total: result?.meta?.total ?? result?.data?.length ?? 0,
        }
    } catch (error) {
        throw handleError(error)
    }
}

export const getWorkspaceMember = async (workspaceId, memberId) => {
    try {
        const response = await apiV1Request('get', `workspace-members/${workspaceId}/members/${memberId}`)
        return response.data.data
    } catch (error) {
        throw handleError(error)
    }
}

export const changeWorkspaceMemberRole = async (workspaceId, memberId, role) => {
    try {
        const response = await apiV1Request(
            'put',
            `workspace-members/${workspaceId}/members/${memberId}/role`,
            { role }
        )
        return response.data
    } catch (error) {
        throw handleError(error)
    }
}

export const removeWorkspaceMember = async (workspaceId, memberId) => {
    try {
        const response = await apiV1Request('delete', `workspace-members/${workspaceId}`, {
            data: { user_id: memberId },
        })
        return response.data
    } catch (error) {
        throw handleError(error)
    }
}
