<template>
    <div :class="[theme.bg, theme.border, isCollapsed ? 'w-16 p-2' : 'w-full p-4 md:w-64', 'shrink-0 rounded-xl border transition-[width,padding] duration-200']">
            <div class="flex h-full flex-col">
                <div :class="['mb-8 flex gap-2', isCollapsed ? 'flex-col items-center' : 'items-start px-2']">
                    <div :class="isCollapsed ? '' : 'w-full'">
                        <label v-if="!isCollapsed" :class="[theme.textMuted, 'mb-2 block text-xs font-semibold uppercase']" for="workspace-select"></label>
                        <p v-if="!isCollapsed" :class="[theme.textMuted, 'mb-2 block text-xs font-semibold uppercase']">Workspace</p>
                        <button
                            type="button"
                            :disabled="props.isLoadingWorkspaces || workspaces.length === 0"
                            :aria-expanded="isWorkspacePickerOpen"
                            aria-haspopup="dialog"
                            :class="[theme.bg, theme.border, theme.text, 'flex items-center gap-3 rounded-md border py-2.5 text-left transition-colors hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60', isCollapsed ? 'justify-center px-2' : 'w-full px-3']"
                            :aria-label="isCollapsed ? `Switch workspace${currentWorkspace?.name ? `, current workspace ${currentWorkspace.name}` : ''}` : undefined"
                            :title="isCollapsed ? currentWorkspace?.name || 'Switch workspace' : undefined"
                            @click="openWorkspacePicker"
                        >
                            <span :class="[theme.primaryBg, 'grid h-8 w-8 shrink-0 place-items-center rounded-md']">
                                <Building2 :class="[theme.primaryText, 'h-4 w-4']" />
                            </span>
                            <span v-if="!isCollapsed" class="min-w-0 flex-1">
                                <span :class="[theme.text, 'block truncate text-sm font-medium']">
                                    {{ props.isLoadingWorkspaces ? 'Loading...' : currentWorkspace?.name ?? 'Choose workspace' }}
                                </span>
                            </span>
                            <ChevronDown v-if="!isCollapsed" :class="[theme.textMuted, 'h-4 w-4 shrink-0']" />
                        </button>
                        <p v-if="!isCollapsed && props.workspaceLoadError" class="mt-2 text-xs text-red-400" role="alert">
                            {{ props.workspaceLoadError }}
                        </p>
                    </div>
                    <button
                        type="button"
                        :class="[theme.textMuted, theme.primaryHover, 'shrink-0 rounded-md p-2 transition-colors']"
                        :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar to icons'"
                        :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar to icons'"
                        @click="emit('toggle-sidebar')"
                    >
                        <ChevronRight v-if="isCollapsed" class="h-4 w-4" />
                        <ChevronLeft v-else class="h-4 w-4" />
                    </button>
                </div>

                <p v-if="!isCollapsed" :class="[theme.textMuted, 'mb-2 px-2 text-xs font-semibold uppercase']">Workspace</p>
                <nav :class="isCollapsed ? 'space-y-2' : 'space-y-1'" aria-label="Workspace navigation">
                    <router-link
                        :to="{ name: 'workspace.main' }"
                        :class="[$route.name === 'workspace.main' ? theme.primaryBg : '', $route.name === 'workspace.main' ? theme.primaryText : theme.text, theme.primaryHover, 'flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors hover:bg-white/5', isCollapsed ? 'justify-center px-2' : 'gap-3 px-3']"
                        title="Overview"
                    >
                        <LayoutDashboard class="h-4 w-4" />
                        <span v-if="!isCollapsed">Overview</span>
                    </router-link>
                    <router-link
                        :to="{ name: 'workspace.members' }"
                        :class="[$route.name === 'workspace.members' ? theme.primaryBg : '', $route.name === 'workspace.members' ? theme.primaryText : theme.text, theme.primaryHover, 'flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors hover:bg-white/5', isCollapsed ? 'justify-center px-2' : 'gap-3 px-3']"
                        title="Members"
                    >
                        <Users class="h-4 w-4" />
                        <span v-if="!isCollapsed">Members</span>
                    </router-link>
                    <router-link
                        :to="{ name: 'workspace.invitations' }"
                        :class="[$route.name === 'workspace.invitations' ? theme.primaryBg : '', $route.name === 'workspace.invitations' ? theme.primaryText : theme.text, theme.primaryHover, 'flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors hover:bg-white/5', isCollapsed ? 'justify-center px-2' : 'gap-3 px-3']"
                        title="Invitations"
                    >
                        <Mail class="h-4 w-4" />
                        <span v-if="!isCollapsed">Invitations</span>
                    </router-link>
                    <router-link
                        :to="{ name: 'workspace.statuses' }"
                        :class="[$route.name === 'workspace.statuses' ? theme.primaryBg : '', $route.name === 'workspace.statuses' ? theme.primaryText : theme.text, theme.primaryHover, 'flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors hover:bg-white/5', isCollapsed ? 'justify-center px-2' : 'gap-3 px-3']"
                        title="Statuses"
                    >
                        <ListTodo class="h-4 w-4" />
                        <span v-if="!isCollapsed">Statuses</span>
                    </router-link>
                    <router-link
                        :to="{ name: 'workspace.priorities' }"
                        :class="[$route.name === 'workspace.priorities' ? theme.primaryBg : '', $route.name === 'workspace.priorities' ? theme.primaryText : theme.text, theme.primaryHover, 'flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors hover:bg-white/5', isCollapsed ? 'justify-center px-2' : 'gap-3 px-3']"
                        title="Priorities"
                    >
                        <Flag class="h-4 w-4" />
                        <span v-if="!isCollapsed">Priorities</span>
                    </router-link>
                    <router-link
                        :to="{ name: 'workspace.tags' }"
                        :class="[$route.name === 'workspace.tags' ? theme.primaryBg : '', $route.name === 'workspace.tags' ? theme.primaryText : theme.text, theme.primaryHover, 'flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors hover:bg-white/5', isCollapsed ? 'justify-center px-2' : 'gap-3 px-3']"
                        title="Tags"
                    >
                        <Tags class="h-4 w-4" />
                        <span v-if="!isCollapsed">Tags</span>
                    </router-link>
                    <router-link
                        :to="{ name: 'workspace.spaces' }"
                        :class="[$route.name === 'workspace.spaces' ? theme.primaryBg : '', $route.name === 'workspace.spaces' ? theme.primaryText : theme.text, theme.primaryHover, 'flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors hover:bg-white/5', isCollapsed ? 'justify-center px-2' : 'gap-3 px-3']"
                        title="Spaces"
                    >
                        <FolderKanban class="h-4 w-4" />
                        <span v-if="!isCollapsed">Spaces</span>
                    </router-link>
                    <!-- <div :class="[theme.text, 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm']">
                        <ListTodo class="h-4 w-4" />
                        My tasks
                    </div> -->
                    <div :class="[theme.text, 'flex items-center rounded-lg py-2.5 text-sm', isCollapsed ? 'justify-center px-2' : 'gap-3 px-3']" title="Inbox">
                        <Inbox class="h-4 w-4" />
                        <span v-if="!isCollapsed">Inbox</span>
                    </div>
                </nav>

                <!-- Spaces -->
                <div v-if="!isCollapsed" class="mt-8 flex items-center justify-between px-2">
                    <p :class="[theme.textMuted, 'text-xs font-semibold uppercase']">Spaces</p>
                    <FolderKanban :class="[theme.textMuted, 'h-4 w-4']" />
                </div>

                <div v-if="currentWorkspace?.spaces?.length" :class="isCollapsed ? 'mt-2 space-y-2' : 'mt-2 space-y-1'">
                    <router-link
                        v-for="space in currentWorkspace.spaces"
                        :key="space.id"
                        :to="{ name: 'workspace.space.show', params: { spaceId: space.id } }"
                        :class="[$route.params.spaceId === String(space.id) ? theme.elevated : '', theme.text, theme.primaryHover, 'flex items-center rounded-md py-1.5 text-sm transition-colors hover:bg-white/5', isCollapsed ? 'justify-center px-2' : 'gap-2 px-2']"
                        :title="space.name"
                    >
                        <span class="h-2 w-2 shrink-0 rounded-full" :style="{ backgroundColor: space.color || '#F59E0B' }"></span>
                        <span v-if="!isCollapsed" class="truncate">{{ space.name }}</span>
                    </router-link>
                </div>

                <div :class="[theme.border, 'mt-auto border-t pt-4']">
                    <button type="button" :class="[theme.text, 'flex w-full items-center rounded-lg py-2.5 text-sm cursor-pointer', isCollapsed ? 'justify-center px-2' : 'gap-3 px-3']" title="Log out" @click="logout">
                        <LogOut class="h-4 w-4" />
                        <span v-if="!isCollapsed">Log out</span>
                    </button>
                </div>
            </div>

            <div v-if="isWorkspacePickerOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeWorkspacePicker">
                <section
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="workspace-picker-title"
                    tabindex="-1"
                    :class="[theme.surface, theme.border, 'w-full max-w-md rounded-lg border p-5 shadow-2xl']"
                    @keydown.esc="closeWorkspacePicker"
                >
                    <div class="mb-4 flex items-start justify-between gap-4">
                        <div>
                            <h2 id="workspace-picker-title" :class="[theme.text, 'text-lg font-semibold']">Switch workspace</h2>
                            <p :class="[theme.textMuted, 'mt-1 text-sm']">Choose the workspace you want to work in.</p>
                        </div>
                        <button type="button" :class="[theme.textMuted, 'rounded p-1 transition-colors']" aria-label="Close workspace picker" @click="closeWorkspacePicker">
                            <X class="h-5 w-5" />
                        </button>
                    </div>

                    <p v-if="selectionError" class="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">
                        {{ selectionError }}
                    </p>

                    <div v-if="props.isLoadingWorkspaces" :class="[theme.textMuted, 'py-8 text-center text-sm']">Loading workspaces...</div>
                    <div v-else-if="workspaces.length" class="max-h-80 space-y-2 overflow-y-auto">
                        <button
                            v-for="workspace in workspaces"
                            :key="workspace.id"
                            type="button"
                            :disabled="isChangingWorkspace"
                            :class="[theme.border, isCurrentWorkspace(workspace.id) ? theme.elevated : theme.bg, theme.text, 'flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors hover:brightness-105 disabled:cursor-wait disabled:opacity-60']"
                            @click="changeWorkspace(workspace.id)"
                        >
                            <span :class="[theme.primaryBg, 'grid h-9 w-9 shrink-0 place-items-center rounded-md']">
                                <Building2 :class="[theme.primaryText, 'h-4 w-4']" />
                            </span>
                            <span class="min-w-0 flex-1">
                                <span :class="[theme.text, 'block truncate text-sm font-semibold']">{{ workspace.name }}</span>
                                <span :class="[theme.textMuted, 'mt-0.5 block truncate text-xs']">{{ workspace.description || 'No description' }}</span>
                            </span>
                            <span v-if="isCurrentWorkspace(workspace.id)" :class="[theme.primary, 'flex shrink-0 items-center gap-1 text-xs font-semibold']">
                                <Check class="h-4 w-4" /> Current
                            </span>
                            <span v-else-if="isChangingWorkspace && String(changingWorkspaceId) === String(workspace.id)" :class="[theme.primary, 'h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent']" aria-label="Switching workspace"></span>
                        </button>
                    </div>
                    <p v-else :class="[theme.textMuted, 'py-8 text-center text-sm']">No workspaces available.</p>
                </section>
            </div>
        </div>

</template>

<script setup>
import useAuthStore from '@/stores/auth'
import useThemeStore from '@/stores/theme'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import useWorkspaceStore from '@/stores/workspace'
import { Building2, Check, ChevronDown, ChevronLeft, ChevronRight, Flag, FolderKanban, Inbox, ListTodo, LogOut, LayoutDashboard, Mail, Tags, Users, X } from '@lucide/vue'


// Store
const auth = useAuthStore()
const themeStore = useThemeStore()
const workspaceStore = useWorkspaceStore()

// Store properties
const { theme } = storeToRefs(themeStore)
const { workspaces, currentWorkspace, currentWorkspaceId } = storeToRefs(workspaceStore)
const isWorkspacePickerOpen = ref(false)
const isChangingWorkspace = ref(false)
const changingWorkspaceId = ref(null)
const selectionError = ref('')

const router = useRouter()

const props = defineProps({
    isLoadingWorkspaces: {type: Boolean, required: true},
    workspaceLoadError: {type: String, required: true},
    isCollapsed: { type: Boolean, default: false },
})
const emit = defineEmits(['toggle-sidebar'])
const isCollapsed = computed(() => props.isCollapsed)

const isCurrentWorkspace = (workspaceId) => String(workspaceId) === String(currentWorkspaceId.value)

const openWorkspacePicker = () => {
    selectionError.value = ''
    isWorkspacePickerOpen.value = true
}

const closeWorkspacePicker = () => {
    if (!isChangingWorkspace.value) isWorkspacePickerOpen.value = false
}

const changeWorkspace = async (workspaceId) => {
    if (isCurrentWorkspace(workspaceId)) {
        closeWorkspacePicker()
        return
    }

    selectionError.value = ''
    changingWorkspaceId.value = workspaceId
    isChangingWorkspace.value = true
    try {
        await workspaceStore.selectWorkspace(workspaceId)
        isWorkspacePickerOpen.value = false
    } catch (error) {
        selectionError.value = error.message ?? 'Unable to switch workspace.'
    } finally {
        isChangingWorkspace.value = false
        changingWorkspaceId.value = null
    }
}

const logout = async () => {
    await auth.logout()
    workspaceStore.clearCurrentWorkspace()
    router.push({ name: 'login' })
}
</script>
