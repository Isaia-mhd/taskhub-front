<template>
    <main class="mx-auto max-w-7xl space-y-6">
        <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p :class="[theme.primary, 'mb-2 text-xs font-semibold uppercase tracking-widest']">Workspace access</p>
                <h1 :class="[theme.text, 'text-3xl font-semibold']">Invitations</h1>
                <p :class="[theme.textMuted, 'mt-2 text-sm']">Invite people to {{ currentWorkspace?.name ?? 'this workspace' }} and manage pending access.</p>
            </div>
            <div :class="[theme.border, theme.surface, 'flex items-center gap-3 rounded-md border px-4 py-2.5']"><Mail :class="[theme.primary, 'h-4 w-4']" /><span :class="[theme.text, 'text-sm font-semibold']">{{ totalInvitations }}</span><span :class="[theme.textMuted, 'text-xs']">pending</span></div>
        </header>

        <div v-if="pageError" :class="[theme.border, 'flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3']" role="alert"><p class="text-sm text-red-400">{{ pageError }}</p><button type="button" :class="[theme.text, theme.elevated, 'rounded-md px-3 py-1.5 text-xs font-medium']" @click="loadInvitations(currentPage)">Retry</button></div>
        <p v-if="successMessage" :class="[theme.border, theme.text, 'rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm']" role="status">{{ successMessage }}</p>

        <section :class="[theme.border, theme.surface, 'rounded-lg border p-5']" aria-labelledby="invite-member-title">
            <div class="mb-5 flex items-start gap-3"><span :class="[theme.elevated, 'grid h-10 w-10 shrink-0 place-items-center rounded-md']"><UserPlus :class="[theme.primary, 'h-5 w-5']" /></span><div><h2 id="invite-member-title" :class="[theme.text, 'text-sm font-semibold']">Invite a teammate</h2><p :class="[theme.textMuted, 'mt-1 text-xs']">They will receive an email with a secure link that expires in seven days.</p></div></div>
            <form class="grid gap-3 md:grid-cols-[minmax(0,1fr)_10rem_auto] md:items-start" @submit.prevent="sendInvitation">
                <label><span class="sr-only">Email address</span><input v-model.trim="form.email" type="email" required placeholder="teammate@example.com" :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400 disabled:opacity-60']" :disabled="isSending" /><span v-if="validationErrors.email" class="mt-1 block text-xs text-red-400">{{ validationErrors.email }}</span></label>
                <label><span class="sr-only">Role</span><select v-model="form.role" :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400 disabled:opacity-60']" :disabled="isSending"><option value="member">Member</option><option value="admin">Admin</option></select></label>
                <button type="submit" :disabled="isSending" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'inline-flex min-w-30 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60']">
                    <span v-if="isSending" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>
                    <Send v-else class="h-4 w-4" />
                    {{ isSending ? 'Sending...' : 'Send invite' }}
                </button>
            </form>
        </section>

        <section :class="[theme.border, theme.surface, 'overflow-hidden rounded-lg border']" aria-label="Pending workspace invitations">
            <div :class="[theme.border, 'flex items-center justify-between gap-4 border-b px-5 py-4']"><div><h2 :class="[theme.text, 'text-sm font-semibold']">Pending invitations</h2><p :class="[theme.textMuted, 'mt-1 text-xs']">Cancel an invitation or send a fresh email when needed.</p></div><button type="button" :disabled="isLoading" :class="[theme.textMuted, theme.primaryHover, 'rounded-md p-2 transition-colors disabled:opacity-50']" aria-label="Refresh invitations" title="Refresh invitations" @click="loadInvitations(currentPage)"><RefreshCw :class="['h-4 w-4', isLoading ? 'animate-spin' : '']" /></button></div>
            <div v-if="isLoading" :class="[theme.textMuted, 'px-5 py-12 text-center text-sm']">Loading invitations...</div>
            <div v-else-if="invitations.length === 0" class="px-5 py-12 text-center"><span :class="[theme.elevated, 'mx-auto mb-4 grid h-11 w-11 place-items-center rounded-md']"><MailPlus :class="[theme.primary, 'h-5 w-5']" /></span><p :class="[theme.text, 'text-sm font-semibold']">No pending invitations</p><p :class="[theme.textMuted, 'mt-1 text-xs']">Use the form above to invite your first teammate.</p></div>
            <ul v-else :class="[theme.border, 'divide-y']">
                <li v-for="invitation in invitations" :key="invitation.id" class="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center">
                    <button type="button" class="flex min-w-0 flex-1 items-center gap-3 text-left" :aria-label="`View invitation for ${invitation.email}`" @click="showInvitation(invitation)"><span :class="[theme.elevated, theme.text, 'grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-semibold']">{{ initials(invitation.email) }}</span><span class="min-w-0"><span :class="[theme.text, theme.primaryHover, 'block truncate text-sm font-semibold transition-colors']">{{ invitation.email }}</span><span :class="[theme.textMuted, 'mt-0.5 block text-xs']">Invited {{ formatDateTime(invitation.created_at) }}</span></span></button>
                    <div class="flex flex-wrap items-center gap-3 lg:justify-end"><span :class="[roleClass(invitation.role), 'rounded-full px-2 py-1 text-xs font-semibold capitalize']">{{ invitation.role }}</span><span class="inline-flex items-center gap-1 text-xs" :class="expirationClass(invitation.expires_at)"><Clock class="h-3.5 w-3.5" />Expires {{ formatDateTime(invitation.expires_at) }}</span><span class="rounded-full bg-sky-500/15 px-2 py-1 text-xs font-semibold text-sky-400">{{ invitation.status }}</span><button type="button" :disabled="processingId === invitation.id" :class="[theme.textMuted, theme.primaryHover, 'rounded-md p-2 transition-colors disabled:opacity-50']" :aria-label="`Resend invitation to ${invitation.email}`" title="Resend invitation" @click="resend(invitation)"><RotateCw :class="['h-4 w-4', processingId === invitation.id && processingAction === 'resend' ? 'animate-spin' : '']" /></button><button type="button" :disabled="processingId === invitation.id" :class="[theme.textMuted, 'rounded-md p-2 text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50']" :aria-label="`Cancel invitation to ${invitation.email}`" title="Cancel invitation" @click="pendingCancellation = invitation"><X class="h-4 w-4" /></button></div>
                </li>
            </ul>
            <footer v-if="lastPage > 1" :class="[theme.border, 'flex flex-col gap-3 border-t px-5 py-3 sm:flex-row sm:items-center sm:justify-between']">
                <p :class="[theme.textMuted, 'text-xs']">Page {{ currentPage }} of {{ lastPage }}</p>
                <nav class="flex items-center gap-1" aria-label="Invitation pages">
                    <button type="button" :disabled="currentPage <= 1 || isLoading" :class="[theme.border, theme.text, 'rounded-md border p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40']" aria-label="Previous page" @click="goToPage(currentPage - 1)"><ChevronLeft class="h-4 w-4" /></button>
                    <div v-for="(item, index) in paginationItems" :key="`${item}-${index}`">
                        <span v-if="item === 'ellipsis'" :class="[theme.textMuted, 'px-1 text-sm']" aria-hidden="true">…</span>
                        <button v-else type="button" :disabled="isLoading" :aria-current="item === currentPage ? 'page' : undefined" :class="[item === currentPage ? theme.primaryBg : theme.elevated, item === currentPage ? theme.primaryText : theme.text, 'min-w-9 rounded-md px-2 py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60']" @click="goToPage(item)">{{ item }}</button>
                    </div>
                    <button type="button" :disabled="currentPage >= lastPage || isLoading" :class="[theme.border, theme.text, 'rounded-md border p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40']" aria-label="Next page" @click="goToPage(currentPage + 1)"><ChevronRight class="h-4 w-4" /></button>
                </nav>
            </footer>
        </section>

        <div v-if="selectedInvitation || isLoadingDetails" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeDetails">
            <section role="dialog" aria-modal="true" aria-labelledby="invitation-details-title" :class="[theme.surface, theme.border, 'w-full max-w-md rounded-lg border p-6 shadow-2xl']" @keydown.esc="closeDetails"><div v-if="isLoadingDetails" :class="[theme.textMuted, 'py-12 text-center text-sm']">Loading invitation details...</div><template v-else-if="selectedInvitation"><div class="flex items-start justify-between gap-4"><div><h2 id="invitation-details-title" :class="[theme.text, 'text-lg font-semibold']">Invitation details</h2><p :class="[theme.textMuted, 'mt-1 text-sm']">{{ selectedInvitation.email }}</p></div><button type="button" :class="[theme.textMuted, 'rounded p-1']" aria-label="Close invitation details" @click="closeDetails"><X class="h-5 w-5" /></button></div><dl :class="[theme.border, 'mt-6 space-y-4 border-y py-4 text-sm']"><div class="flex justify-between gap-4"><dt :class="theme.textMuted">Role</dt><dd :class="[theme.text, 'capitalize']">{{ selectedInvitation.role }}</dd></div><div class="flex justify-between gap-4"><dt :class="theme.textMuted">Status</dt><dd :class="[theme.text, 'capitalize']">{{ selectedInvitation.status }}</dd></div><div class="flex justify-between gap-4"><dt :class="theme.textMuted">Expires</dt><dd :class="[theme.text, 'text-right']">{{ formatDateTime(selectedInvitation.expires_at) }}</dd></div><div class="flex justify-between gap-4"><dt :class="theme.textMuted">Invited by</dt><dd :class="[theme.text, 'text-right']">{{ selectedInvitation.inviter?.name ?? 'Workspace owner' }}</dd></div></dl><div class="mt-5 flex justify-end"><button type="button" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm font-medium']" @click="closeDetails">Close</button></div></template></section>
        </div>

        <div v-if="pendingCancellation" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeCancellation">
            <section role="dialog" aria-modal="true" aria-labelledby="cancel-invitation-title" :class="[theme.surface, theme.border, 'w-full max-w-md rounded-lg border p-6 shadow-2xl']"><div class="mb-5 flex items-start justify-between gap-4"><div><h2 id="cancel-invitation-title" :class="[theme.text, 'text-lg font-semibold']">Cancel invitation?</h2><p :class="[theme.textMuted, 'mt-2 text-sm']">{{ pendingCancellation.email }} will no longer be able to use this invitation link.</p></div><button type="button" :disabled="processingId !== null" :class="[theme.textMuted, 'rounded p-1']" aria-label="Close confirmation" @click="closeCancellation"><X class="h-5 w-5" /></button></div><p v-if="actionError" class="mb-4 text-sm text-red-400" role="alert">{{ actionError }}</p><div :class="[theme.border, 'flex justify-end gap-2 border-t pt-4']"><button type="button" :disabled="processingId !== null" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50']" @click="closeCancellation">Keep invitation</button><button type="button" :disabled="processingId !== null" class="inline-flex min-w-28 items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60" @click="cancel"><span v-if="processingAction === 'cancel'" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>{{ processingAction === 'cancel' ? 'Cancelling...' : 'Cancel invite' }}</button></div></section>
        </div>
    </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ChevronLeft, ChevronRight, Clock, Mail, MailPlus, RefreshCw, RotateCw, Send, UserPlus, X } from '@lucide/vue'
import useThemeStore from '@/stores/theme'
import useWorkspaceStore from '@/stores/workspace'
import { cancelInvitation, createWorkspaceInvitation, getInvitation, getWorkspaceInvitations, resendInvitation } from '@/services/workspaceInvitationService'

const themeStore = useThemeStore()
const workspaceStore = useWorkspaceStore()
const { theme } = storeToRefs(themeStore)
const { currentWorkspace, currentWorkspaceId } = storeToRefs(workspaceStore)
const invitations = ref([])
const isLoading = ref(true)
const isSending = ref(false)
const isLoadingDetails = ref(false)
const processingId = ref(null)
const processingAction = ref('')
const currentPage = ref(1)
const lastPage = ref(1)
const totalInvitations = ref(0)
const pageError = ref('')
const formError = ref('')
const actionError = ref('')
const successMessage = ref('')
const validationErrors = ref({})
const selectedInvitation = ref(null)
const pendingCancellation = ref(null)
const form = ref({ email: '', role: 'member' })

const initials = (email) => email?.slice(0, 2).toUpperCase() ?? '?'
const formatDateTime = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not available'
const roleClass = (role) => role === 'admin' ? 'bg-violet-500/15 text-violet-400' : 'bg-emerald-500/15 text-emerald-400'
const expirationClass = (value) => new Date(value).getTime() - Date.now() < 86_400_000 ? 'text-amber-400' : theme.value.textMuted
const paginationItems = computed(() => {
    if (lastPage.value <= 7) return Array.from({ length: lastPage.value }, (_, index) => index + 1)

    const pages = [1]
    const start = Math.max(2, currentPage.value - 1)
    const end = Math.min(lastPage.value - 1, currentPage.value + 1)

    if (start > 2) pages.push('ellipsis')
    for (let page = start; page <= end; page += 1) pages.push(page)
    if (end < lastPage.value - 1) pages.push('ellipsis')
    pages.push(lastPage.value)

    return pages
})

const loadInvitations = async (page = 1) => {
    if (!currentWorkspaceId.value) return
    isLoading.value = true
    pageError.value = ''
    try {
        const result = await getWorkspaceInvitations(currentWorkspaceId.value, page)
        
        invitations.value = result.invitations
        currentPage.value = result.currentPage
        lastPage.value = result.lastPage
        totalInvitations.value = result.total
    } catch (error) {
        pageError.value = error.message ?? 'Unable to load invitations.'
    } finally {
        isLoading.value = false
    }
}

const goToPage = (page) => {
    if (isLoading.value || page === currentPage.value || page < 1 || page > lastPage.value) return
    loadInvitations(page)
}

const sendInvitation = async () => {
    if (!currentWorkspaceId.value) return
    isSending.value = true
    formError.value = ''
    validationErrors.value = {}
    try {
        const invitation = await createWorkspaceInvitation(currentWorkspaceId.value, form.value)
        invitations.value = [invitation, ...invitations.value]
        totalInvitations.value += 1
        form.value = { email: '', role: 'member' }
        successMessage.value = `Invitation sent to ${invitation.email}.`
    } catch (error) {
        validationErrors.value = Object.fromEntries(Object.entries(error.errors ?? {}).map(([field, messages]) => [field, messages[0]]))
        formError.value = error.message ?? 'Unable to send the invitation.'
    } finally {
        isSending.value = false
    }
}

const showInvitation = async (invitation) => {
    isLoadingDetails.value = true
    pageError.value = ''
    try {
        selectedInvitation.value = await getInvitation(invitation.token)
    } catch (error) {
        pageError.value = error.message ?? 'Unable to load invitation details.'
    } finally {
        isLoadingDetails.value = false
    }
}

const closeDetails = () => {
    if (!isLoadingDetails.value) selectedInvitation.value = null
}
const closeCancellation = () => {
    if (processingId.value === null) {
        pendingCancellation.value = null
        actionError.value = ''
    }
}

const resend = async (invitation) => {
    processingId.value = invitation.id
    processingAction.value = 'resend'
    pageError.value = ''
    try {
        const resent = await resendInvitation(invitation.id)
        invitations.value = invitations.value.map((item) => item.id === resent.id ? resent : item)
        successMessage.value = `A new invitation email was sent to ${resent.email}.`
    } catch (error) {
        pageError.value = error.message ?? 'Unable to resend this invitation.'
    } finally {
        processingId.value = null
        processingAction.value = ''
    }
}

const cancel = async () => {
    const invitation = pendingCancellation.value
    if (!invitation) return
    processingId.value = invitation.id
    processingAction.value = 'cancel'
    actionError.value = ''
    try {
        await cancelInvitation(invitation.id)
        invitations.value = invitations.value.filter((item) => item.id !== invitation.id)
        totalInvitations.value = Math.max(0, totalInvitations.value - 1)
        pendingCancellation.value = null
        successMessage.value = `Invitation to ${invitation.email} was cancelled.`
        if (invitations.value.length === 0 && currentPage.value > 1) await loadInvitations(currentPage.value - 1)
    } catch (error) {
        actionError.value = error.message ?? 'Unable to cancel this invitation.'
    } finally {
        processingId.value = null
        processingAction.value = ''
    }
}

watch(currentWorkspaceId, () => loadInvitations(1), { immediate: true })
</script>
