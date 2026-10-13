<template>
    <div :class="[theme.bg, theme.border, ' w-[20%] p-4 border rounded-xl m-2']">
            <div class="flex h-full flex-col">
                <div class="mb-8 flex items-center gap-3 px-2">
                    <div class="w-full">
                        <label :class="[theme.textMuted, 'mb-2 block text-xs font-semibold uppercase']" for="workspace-select"></label>
                        <p :class="[theme.textMuted, 'mb-2 block text-xs font-semibold uppercase']">Workspace</p>
                        <button
                            type="button"
                            :disabled="props.isLoadingWorkspaces || workspaces.length === 0"
                            :aria-expanded="isWorkspacePickerOpen"
                            aria-haspopup="dialog"
                            :class="[theme.bg, theme.border, theme.text, 'flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60']"
                            @click="openWorkspacePicker"
                        >
                            <span :class="[theme.primaryBg, 'grid h-8 w-8 shrink-0 place-items-center rounded-md']">
                                <Building2 :class="[theme.primaryText, 'h-4 w-4']" />
                            </span>
                            <span class="min-w-0 flex-1">
                                <span :class="[theme.text, 'block truncate text-sm font-medium']">
                                    {{ props.isLoadingWorkspaces ? 'Loading...' : currentWorkspace?.name ?? 'Choose workspace' }}
                                </span>
                            </span>
                            <ChevronDown :class="[theme.textMuted, 'h-4 w-4 shrink-0']" />
                        </button>
                        <p v-if="props.workspaceLoadError" class="mt-2 text-xs text-red-400" role="alert">
                            {{ props.workspaceLoadError }}
                        </p>
                    </div>
                </div>

                <p :class="[theme.textMuted, 'mb-2 px-2 text-xs font-semibold uppercase']">Workspace</p>
                <nav class="space-y-1" aria-label="Workspace navigation">
                    <router-link
                        :to="{ name: 'workspace.main' }"
                        :class="[$route.name === 'workspace.main' ? theme.primaryBg : '', $route.name === 'workspace.main' ? theme.primaryText : theme.text, theme.primaryHover, 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5']"
                    >
                        <LayoutDashboard class="h-4 w-4" />
                        Overview
                    </router-link>
                    <router-link
                        :to="{ name: 'workspace.members' }"
                        :class="[$route.name === 'workspace.members' ? theme.primaryBg : '', $route.name === 'workspace.members' ? theme.primaryText : theme.text, theme.primaryHover, 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5']"
                    >
                        <Users class="h-4 w-4" />
                        Members
                    </router-link>
                    <router-link
                        :to="{ name: 'workspace.spaces' }"
                        :class="[$route.name === 'workspace.spaces' ? theme.primaryBg : '', $route.name === 'workspace.spaces' ? theme.primaryText : theme.text, theme.primaryHover, 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5']"
                    >
                        <FolderKanban class="h-4 w-4" />
                        Spaces
                    </router-link>
                    <!-- <div :class="[theme.text, 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm']">
                        <ListTodo class="h-4 w-4" />
                        My tasks
                    </div> -->
                    <div :class="[theme.text, 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm']">
                        <Inbox class="h-4 w-4" />
                        Inbox
                    </div>
                </nav>

                <!-- Spaces -->
                <div class="mt-8 flex items-center justify-between px-2">
                    <p :class="[theme.textMuted, 'text-xs font-semibold uppercase']">Spaces</p>
                    <FolderKanban :class="[theme.textMuted, 'h-4 w-4']" />
                </div>

                <div v-if="currentWorkspace?.spaces?.length" class="mt-2 space-y-1">
                    <router-link
                        v-for="space in currentWorkspace.spaces"
                        :key="space.id"
                        :to="{ name: 'workspace.spaces' }"
                        :class="[theme.text, theme.primaryHover, 'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-white/5']"
                    >
                        <span class="h-2 w-2 shrink-0 rounded-full" :style="{ backgroundColor: space.color || '#F59E0B' }"></span>
                        <span class="truncate">{{ space.name }}</span>
                    </router-link>
                </div>

                <div :class="[theme.border, 'mt-auto border-t pt-4']">
                    <div :class="[theme.text, 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer']" @click="logout">
                        <LogOut class="h-4 w-4" />
                        Log out
                    </div>
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
import { ref } from 'vue'
import useWorkspaceStore from '@/stores/workspace'
import { Building2, Check, ChevronDown, FolderKanban, Inbox, LogOut, LayoutDashboard, Users, X } from '@lucide/vue'


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
    workspaceLoadError: {type: String, required: true}
})

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
