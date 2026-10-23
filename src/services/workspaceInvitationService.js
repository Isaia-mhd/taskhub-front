import apiV1Request from '@/api/apiV1Request'
import { handleError } from '@/handler/handleError'

export const getWorkspaceInvitations = async (workspaceId, page = 1) => {
    try {
        const response = await apiV1Request('get', `workspaces/${workspaceId}/invitations`, { params: { page } })
        const result = response.data.data

        console.log(result);
        

        return {
            invitations: result?.data ?? [],
            currentPage: result?.meta?.current_page ?? page,
            lastPage: result?.meta?.last_page ?? page,
            total: result?.meta?.total ?? result?.data?.length ?? 0,
        }
    } catch (error) {
        throw handleError(error)
    }
}

export const createWorkspaceInvitation = async (workspaceId, invitationData) => {
    try {
        const response = await apiV1Request('post', `workspaces/${workspaceId}/invitations`, invitationData)
        return response.data.data
    } catch (error) {
        throw handleError(error)
    }
}

export const getInvitation = async (token) => {
    try {
        const response = await apiV1Request('get', `invitations/${token}`)
        return response.data.data
    } catch (error) {
        throw handleError(error)
    }
}

export const acceptInvitation = async (token) => {
    try {
        return await apiV1Request('post', `invitations/${token}/accept`)
    } catch (error) {
        throw handleError(error)
    }
}

export const rejectInvitation = async (token) => {
    try {
        return await apiV1Request('post', `invitations/${token}/reject`)
    } catch (error) {
        throw handleError(error)
    }
}

export const cancelInvitation = async (invitationId) => {
    try {
        return await apiV1Request('post', `invitations/${invitationId}/cancel`)
    } catch (error) {
        throw handleError(error)
    }
}

export const resendInvitation = async (invitationId) => {
    try {
        const response = await apiV1Request('post', `invitations/${invitationId}/resend`)
        return response.data.data
    } catch (error) {
        throw handleError(error)
    }
}
