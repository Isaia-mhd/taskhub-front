<template>
    <main class="mx-auto max-w-8xl space-y-6">
        <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p :class="[theme.primary, 'mb-2 text-xs font-semibold uppercase tracking-widest']">Workspace settings</p>
                <h1 :class="[theme.text, 'text-3xl font-semibold']">Members</h1>
                <p :class="[theme.textMuted, 'mt-2 text-sm']">
                    People in {{ currentWorkspace?.name ?? 'this workspace' }}
                </p>
            </div>
            <div :class="[theme.border, theme.surface, 'flex items-center gap-3 rounded-md border px-4 py-2.5']">
                <Users :class="[theme.primary, 'h-4 w-4']" />
                <span :class="[theme.text, 'text-sm font-semibold']">{{ totalMembers }}</span>
                <span :class="[theme.textMuted, 'text-xs']">{{ totalMembers === 1 ? 'member' : 'members' }}</span>
            </div>
        </header>

        <div v-if="pageError" :class="[theme.border, 'flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3']" role="alert">
            <p class="text-sm text-red-400">{{ pageError }}</p>
            <button type="button" :class="[theme.text, theme.elevated, 'rounded-md px-3 py-1.5 text-xs font-medium']" @click="loadMembers(currentPage)">Retry</button>
        </div>
        <p v-if="successMessage" :class="[theme.border, theme.text, 'rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm']" role="status">
            {{ successMessage }}
        </p>

        <section :class="[theme.border, theme.surface, 'overflow-hidden rounded-lg border']" aria-label="Workspace members">
            <div :class="[theme.border, 'flex items-center justify-between gap-4 border-b px-5 py-4']">
                <div>
                    <h2 :class="[theme.text, 'text-sm font-semibold']">People</h2>
                    <p :class="[theme.textMuted, 'mt-1 text-xs']">Manage access and workspace roles.</p>
                </div>
                <button
                    type="button"
                    :disabled="isLoading"
                    :class="[theme.textMuted, theme.primaryHover, 'rounded-md p-2 transition-colors disabled:opacity-50']"
                    aria-label="Refresh members"
                    title="Refresh members"
                    @click="loadMembers(currentPage)"
                >
                    <RefreshCw :class="['h-4 w-4', isLoading ? 'animate-spin' : '']" />
                </button>
            </div>

            <div v-if="isLoading" :class="[theme.textMuted, 'px-5 py-12 text-center text-sm']">Loading members...</div>
            <div v-else-if="members.length === 0" class="px-5 py-12 text-center">
                <span :class="[theme.elevated, 'mx-auto mb-4 grid h-11 w-11 place-items-center rounded-md']"><Users :class="[theme.primary, 'h-5 w-5']" /></span>
                <p :class="[theme.text, 'text-sm font-semibold']">No members found</p>
                <p :class="[theme.textMuted, 'mt-1 text-xs']">Workspace members will appear here.</p>
            </div>
            <ul v-else :class="[theme.border, 'divide-y']">
                <li v-for="member in members" :key="member.id" class="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
                    <div class="flex min-w-0 flex-1 items-center gap-3">
                        <button type="button" :class="[theme.elevated, theme.text, theme.primaryHover, 'relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full text-xs font-semibold transition-colors']" :aria-label="`View ${member.name}'s profile`" @click="openMemberProfile(member)">
                            {{ initials(member.name) }}
                            <img v-if="member.avatar" :src="member.avatar" :alt="''" class="absolute inset-0 h-full w-full object-cover" @error="$event.target.hidden = true" />
                        </button>
                        <div class="min-w-0">
                            <button type="button" :class="[theme.text, theme.primaryHover, 'block max-w-full truncate text-left text-sm font-semibold transition-colors']" @click="openMemberProfile(member)">{{ member.name }}</button>
                            <p :class="[theme.textMuted, 'truncate text-xs']">{{ member.email }}</p>
                            <div class="mt-1 flex flex-wrap items-center gap-2">
                                <span :class="[roleClass(member.role), 'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide']">{{ roleLabel(member.role) }}</span>
                                <span :class="[theme.textMuted, 'text-[11px]']">{{ member.joined_at ? `Joined ${formatDate(member.joined_at)}` : 'Workspace member' }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between gap-3 sm:justify-end">
                        <button type="button" :class="[theme.textMuted, theme.primaryHover, 'rounded-md p-2 transition-colors']" :aria-label="`View ${member.name}'s profile`" title="View profile" @click="openMemberProfile(member)"><Eye class="h-4 w-4" /></button>
                        <label class="flex items-center gap-2">
                            <span :class="[theme.textMuted, 'text-xs']">Role</span>
                            <select
                                :value="member.role ?? 'member'"
                                :disabled="changingMemberId === member.id || removingMemberId === member.id"
                                :class="[theme.bg, theme.text, theme.border, 'min-w-32 rounded-md border px-3 py-2 text-sm outline-none focus:border-amber-400 disabled:opacity-60']"
                                :aria-label="`Role for ${member.name}`"
                                @change="changeRole(member, $event.target.value)"
                            >
                                <option v-for="role in roleOptions" :key="role.value" :value="role.value">{{ role.label }}</option>
                            </select>
                        </label>
                        <button
                            type="button"
                            :disabled="changingMemberId === member.id || removingMemberId === member.id"
                            :class="[theme.textMuted, 'rounded-md p-2 text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40']"
                            :aria-label="`Remove ${member.name}`"
                            title="Remove member"
                            @click="pendingRemoval = member"
                        >
                            <Trash2 class="h-4 w-4" />
                        </button>
                    </div>
                </li>
            </ul>

            <footer v-if="lastPage > 1" :class="[theme.border, 'flex items-center justify-between gap-3 border-t px-5 py-3']">
                <p :class="[theme.textMuted, 'text-xs']">Page {{ currentPage }} of {{ lastPage }}</p>
                <div class="flex items-center gap-2">
                    <button type="button" :disabled="currentPage <= 1 || isLoading" :class="[theme.border, theme.text, 'rounded-md border p-2 disabled:cursor-not-allowed disabled:opacity-40']" aria-label="Previous page" @click="loadMembers(currentPage - 1)">
                        <ChevronLeft class="h-4 w-4" />
                    </button>
                    <button type="button" :disabled="currentPage >= lastPage || isLoading" :class="[theme.border, theme.text, 'rounded-md border p-2 disabled:cursor-not-allowed disabled:opacity-40']" aria-label="Next page" @click="loadMembers(currentPage + 1)">
                        <ChevronRight class="h-4 w-4" />
                    </button>
                </div>
            </footer>
        </section>

        <div v-if="selectedMember || isLoadingMember" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeMemberProfile">
            <section role="dialog" aria-modal="true" aria-labelledby="member-profile-title" :class="[theme.surface, theme.border, 'w-full max-w-md rounded-lg border p-6 shadow-2xl']" @keydown.esc="closeMemberProfile">
                <div v-if="isLoadingMember" :class="[theme.textMuted, 'py-12 text-center text-sm']">Loading member profile...</div>
                <template v-else-if="selectedMember">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex min-w-0 items-center gap-3">
                            <span :class="[theme.elevated, theme.text, 'relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full text-sm font-semibold']">
                                {{ initials(selectedMember.name) }}
                                <img v-if="selectedMember.avatar" :src="selectedMember.avatar" :alt="''" class="absolute inset-0 h-full w-full object-cover" @error="$event.target.hidden = true" />
                            </span>
                            <div class="min-w-0">
                                <h2 id="member-profile-title" :class="[theme.text, 'truncate text-lg font-semibold']">{{ selectedMember.name }}</h2>
                                <p :class="[theme.textMuted, 'truncate text-sm']">{{ selectedMember.email }}</p>
                            </div>
                        </div>
                        <button type="button" :class="[theme.textMuted, 'rounded p-1']" aria-label="Close member profile" @click="closeMemberProfile"><X class="h-5 w-5" /></button>
                    </div>
                    <dl :class="[theme.border, 'mt-6 space-y-4 border-y py-4 text-sm']">
                        <div class="flex items-center justify-between gap-4"><dt :class="theme.textMuted">Workspace role</dt><dd><span :class="[roleClass(selectedMember.role), 'rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide']">{{ roleLabel(selectedMember.role) }}</span></dd></div>
                        <div class="flex items-center justify-between gap-4"><dt :class="theme.textMuted">Joined workspace</dt><dd :class="[theme.text, 'text-right']">{{ selectedMember.joined_at ? formatDate(selectedMember.joined_at) : 'Not available' }}</dd></div>
                        <div class="flex items-center justify-between gap-4"><dt :class="theme.textMuted">Account created</dt><dd :class="[theme.text, 'text-right']">{{ selectedMember.created_at ? formatDate(selectedMember.created_at) : 'Not available' }}</dd></div>
                    </dl>
                    <div class="mt-5 flex justify-end"><button type="button" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm font-medium']" @click="closeMemberProfile">Close</button></div>
                </template>
            </section>
        </div>

        <div v-if="pendingRemoval" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeRemovalDialog">
            <section role="dialog" aria-modal="true" aria-labelledby="remove-member-title" :class="[theme.surface, theme.border, 'w-full max-w-md rounded-lg border p-6 shadow-2xl']">
                <div class="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <h2 id="remove-member-title" :class="[theme.text, 'text-lg font-semibold']">Remove member?</h2>
                        <p :class="[theme.textMuted, 'mt-2 text-sm']">{{ pendingRemoval.name }} will lose access to this workspace.</p>
                    </div>
                    <button type="button" :class="[theme.textMuted, 'rounded p-1']" aria-label="Close confirmation" :disabled="removingMemberId !== null" @click="closeRemovalDialog"><X class="h-5 w-5" /></button>
                </div>
                <p v-if="removalError" class="mb-4 text-sm text-red-400" role="alert">{{ removalError }}</p>
                <div :class="[theme.border, 'flex justify-end gap-2 border-t pt-4']">
                    <button type="button" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm font-medium']" :disabled="removingMemberId !== null" @click="closeRemovalDialog">Cancel</button>
                    <button type="button" class="inline-flex min-w-32 items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60" :disabled="removingMemberId !== null" @click="confirmRemoval">
                        <span v-if="removingMemberId !== null" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true"></span>
                        {{ removingMemberId !== null ? 'Removing...' : 'Remove member' }}
                    </button>
                </div>
            </section>
        </div>
    </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ChevronLeft, ChevronRight, Eye, RefreshCw, Trash2, Users, X } from '@lucide/vue'
import useThemeStore from '@/stores/theme'
import useWorkspaceStore from '@/stores/workspace'
import { changeWorkspaceMemberRole, getWorkspaceMember, getWorkspaceMembers, removeWorkspaceMember } from '@/services/workspaceMemberService'

const themeStore = useThemeStore()
const workspaceStore = useWorkspaceStore()
const { theme } = storeToRefs(themeStore)
const { currentWorkspace, currentWorkspaceId } = storeToRefs(workspaceStore)
const members = ref([])
const isLoading = ref(true)
const changingMemberId = ref(null)
const removingMemberId = ref(null)
const currentPage = ref(1)
const lastPage = ref(1)
const totalMembers = ref(0)
const pageError = ref('')
const removalError = ref('')
const successMessage = ref('')
const pendingRemoval = ref(null)
const selectedMember = ref(null)
const isLoadingMember = ref(false)
const roleOptions = [
    { value: 'owner', label: 'Owner' },
    { value: 'admin', label: 'Admin' },
    { value: 'member', label: 'Member' },
    { value: 'guest', label: 'Guest' },
]

const initials = (name) => name?.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() ?? '?'
const formatDate = (value) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
const roleLabel = (role) => roleOptions.find((option) => option.value === role)?.label ?? 'Member'
const roleClass = (role) => ({
    owner: 'bg-amber-400/15 text-amber-400',
    admin: 'bg-violet-500/15 text-violet-400',
    guest: 'bg-sky-500/15 text-sky-400',
    member: 'bg-emerald-500/15 text-emerald-400',
}[role] ?? 'bg-slate-500/15 text-slate-400')

const loadMembers = async (page = 1) => {
    if (!currentWorkspaceId.value) return
    isLoading.value = true
    pageError.value = ''
    successMessage.value = ''
    try {
        const result = await getWorkspaceMembers(currentWorkspaceId.value, page)
        members.value = result.members
        currentPage.value = result.currentPage
        lastPage.value = result.lastPage
        totalMembers.value = result.total
    } catch (error) {
        pageError.value = error.message ?? 'Unable to load workspace members.'
    } finally {
        isLoading.value = false
    }
}

const changeRole = async (member, role) => {
    if (member.role === role) return
    changingMemberId.value = member.id
    pageError.value = ''
    successMessage.value = ''
    try {
        await changeWorkspaceMemberRole(currentWorkspaceId.value, member.id, role)
        members.value = members.value.map((item) => item.id === member.id ? { ...item, role } : item)
        if (selectedMember.value?.id === member.id) selectedMember.value = { ...selectedMember.value, role }
        successMessage.value = `${member.name}'s role was updated.`
    } catch (error) {
        pageError.value = error.message ?? 'Unable to update this member role.'
    } finally {
        changingMemberId.value = null
    }
}

const openMemberProfile = async (member) => {
    if (!currentWorkspaceId.value || isLoadingMember.value) return
    isLoadingMember.value = true
    pageError.value = ''
    try {
        selectedMember.value = await getWorkspaceMember(currentWorkspaceId.value, member.id)
    } catch (error) {
        pageError.value = error.message ?? 'Unable to load this member profile.'
    } finally {
        isLoadingMember.value = false
    }
}

const closeMemberProfile = () => {
    if (isLoadingMember.value) return
    selectedMember.value = null
}

const closeRemovalDialog = () => {
    if (removingMemberId.value !== null) return
    pendingRemoval.value = null
    removalError.value = ''
}

const confirmRemoval = async () => {
    const member = pendingRemoval.value
    if (!member || !currentWorkspaceId.value) return
    removingMemberId.value = member.id
    removalError.value = ''
    try {
        await removeWorkspaceMember(currentWorkspaceId.value, member.id)
        members.value = members.value.filter((item) => item.id !== member.id)
        if (selectedMember.value?.id === member.id) selectedMember.value = null
        totalMembers.value = Math.max(0, totalMembers.value - 1)
        successMessage.value = `${member.name} was removed from the workspace.`
        pendingRemoval.value = null
        if (members.value.length === 0 && currentPage.value > 1) await loadMembers(currentPage.value - 1)
    } catch (error) {
        removalError.value = error.message ?? 'Unable to remove this member.'
    } finally {
        removingMemberId.value = null
    }
}

watch(currentWorkspaceId, () => loadMembers(1), { immediate: true })
</script>
