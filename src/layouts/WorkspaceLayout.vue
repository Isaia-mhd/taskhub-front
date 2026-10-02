<template>
    <div class="w-full flex justify-between min-h-screen">
        <!-- asside -->
        <div :class="[theme.bg, theme.border, ' w-[20%] p-4 border rounded-xl m-2']">
            <div class="flex h-full flex-col">
                <div class="mb-8 flex items-center gap-3 px-2">
                    <div class="w-full">
                        <label :class="[theme.textMuted, 'mb-2 block text-xs font-semibold uppercase']" for="workspace-select">
                            Workspace
                        </label>
                        <select
                            id="workspace-select"
                            v-model="activeWorkspace"
                            :disabled="isLoadingWorkspaces || workspaces.length === 0"
                            :class="[theme.bg, theme.border, theme.text, 'w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400 disabled:cursor-not-allowed disabled:opacity-60']"
                        >
                            <option v-if="isLoadingWorkspaces" :value="null">Loading workspaces...</option>
                            <option v-else-if="workspaceLoadError" :value="null" disabled>Could not load workspaces</option>
                            <option v-else-if="workspaces.length === 0" :value="null" disabled>No workspace available</option>
                            <option v-for="workspace in workspaces" :key="workspace.id" :value="workspace.id">
                                {{ workspace.name }}
                            </option>
                        </select>
                    </div>
                </div>

                <p :class="[theme.textMuted, 'mb-2 px-2 text-xs font-semibold uppercase']">Workspace</p>
                <nav class="space-y-1" aria-label="Workspace navigation">
                    <router-link
                        :to="{ name: 'workspace.main' }"
                        :class="[theme.primaryBg, theme.primaryText, 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium']"
                    >
                        <LayoutDashboard class="h-4 w-4" />
                        Overview
                    </router-link>
                    <div :class="[theme.text, 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm']">
                        <ListTodo class="h-4 w-4" />
                        My tasks
                    </div>
                    <div :class="[theme.text, 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm']">
                        <Inbox class="h-4 w-4" />
                        Inbox
                    </div>
                </nav>

                <div class="mt-8 flex items-center justify-between px-2">
                    <p :class="[theme.textMuted, 'text-xs font-semibold uppercase']">Spaces</p>
                    <FolderKanban :class="[theme.textMuted, 'h-4 w-4']" />
                </div>
                <div :class="[theme.text, 'mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm']">
                    <span :class="[theme.primaryBg, 'h-2 w-2 rounded-full']"></span>
                    My workspace
                </div>

                <div :class="[theme.border, 'mt-auto border-t pt-4']">
                    <div :class="[theme.text, 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer']" @click="logout">
                        <LogOut class="h-4 w-4" />
                        Log out
                    </div>
                </div>
            </div>
        </div>

        <div class="w-full flex flex-col gap-3 w-[80%] m-2">
            <!-- header -->
            <div :class="[theme.bg, theme.border, 'border rounded-xl p-4']">
                <WorkspaceHeader />
            </div>

            <!-- main -->
            <div :class="[theme.bg, theme.border, 'border content min-h-0 flex-1 overflow-auto rounded-xl p-4']">
                <Loading v-if="isLoadingWorkspaces" :full-screen="false" message="Loading workspaces..." />
                <div v-else-if="workspaceLoadError" :class="['flex h-full min-h-48 flex-col items-center justify-center gap-3 text-center']" role="alert">
                    <p :class="[theme.text, 'text-base font-medium']">Workspaces could not be loaded.</p>
                    <p :class="[theme.textMuted, 'text-sm']">{{ workspaceLoadError }}</p>
                    <button
                        type="button"
                        :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'rounded-md px-4 py-2 text-sm font-medium transition-colors']"
                        @click="loadWorkspaces"
                    >
                        Try again
                    </button>
                </div>
                <router-view v-else-if="activeWorkspace !== null" />
                <div v-else-if="workspaces.length === 0" :class="['flex h-full min-h-48 flex-col items-center justify-center gap-2 text-center']">
                    <p :class="[theme.text, 'text-base font-medium']">No workspace available</p>
                    <p :class="[theme.textMuted, 'text-sm']">Create or join a workspace to get started.</p>
                </div>
                <div v-else :class="['flex h-full min-h-48 items-center justify-center']">
                    <p :class="[theme.textMuted, 'text-sm']">Select a workspace to view its content.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import useAuthStore from '@/stores/auth'
import useThemeStore from '@/stores/theme'
import { storeToRefs } from 'pinia'
import { FolderKanban, Inbox, LogOut,  LayoutDashboard, ListTodo, Settings } from '@lucide/vue'
import { onMounted, ref } from 'vue'
import { getWorkspaces } from '@/services/workspaceService'
import WorkspaceHeader from '@/components/WorkspaceHeader.vue'
import Loading from '@/components/Loading.vue'
import { useRouter } from 'vue-router'


const auth = useAuthStore()
const themeStore = useThemeStore()
const { user } = storeToRefs(auth)
const { theme } = storeToRefs(themeStore)
const router = useRouter()
const activeWorkspace = ref(null)
const workspaces = ref([])
const isLoadingWorkspaces = ref(true)
const workspaceLoadError = ref('')

const loadWorkspaces = async () => {
    isLoadingWorkspaces.value = true
    workspaceLoadError.value = ''

    try {
        const workspacesFetched = await getWorkspaces()
        workspaces.value = workspacesFetched
        activeWorkspace.value = workspaces.value[0]?.id ?? null
    } catch (error) {
        workspaceLoadError.value = error.message ?? 'Unable to load workspaces.'
    } finally {
        isLoadingWorkspaces.value = false
    }
}

onMounted(loadWorkspaces)


const logout = async () => {
    await auth.logout()
    router.push({ name: 'login' })
}

</script>
