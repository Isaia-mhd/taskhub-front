<template>
    <div class="w-full flex justify-between min-h-screen">
        <!-- asside -->
        <WorkspaceAside :isLoadingWorkspaces="isLoadingWorkspaces" :workspaceLoadError="workspaceLoadError"/>

        <div class="w-full flex flex-col gap-3 w-[80%] m-2">
            <!-- header -->
            <div :class="[theme.bg, theme.border, 'border rounded-xl p-4']">
                <WorkspaceHeader />
            </div>

            <!-- Message -->
            <div v-if="currentError" :class="[theme.border, 'border rounded-md px-4 py-2 text-red-400']" role="alert">
                <p :class="['']">{{ currentError }}</p>
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
                <router-view v-else-if="currentWorkspaceId !== null" />
                                <router-view v-else-if="currentWorkspaceId !== null || $route.name === 'workspace.main'" />
                <div v-else-if="workspaces.length === 0" :class="['flex h-full min-h-48 flex-col items-center justify-center gap-2 text-center']">
                    <p :class="[theme.text, 'text-base font-medium']">No workspace available</p>
                    <p :class="[theme.textMuted, 'text-sm']">Create or join a workspace to get started.</p>
                    <button
                        type="button"
                        :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'rounded-md px-4 py-2 text-sm font-medium transition-colors']"
                        
                    >
                        Create Workspace
                    </button>
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
// import { FolderKanban, Inbox, LogOut,  LayoutDashboard, ListTodo, Settings } from '@lucide/vue'
import { onMounted, ref } from 'vue'
import { getWorkspaces } from '@/services/workspaceService'
import WorkspaceHeader from '@/components/WorkspaceHeader.vue'
import WorkspaceAside from '@/components/WorkspaceAside.vue'

import Loading from '@/components/Loading.vue'
import { useRouter } from 'vue-router'
import useWorkspaceStore from '@/stores/workspace'


const auth = useAuthStore()
const themeStore = useThemeStore()
const workspaceStore = useWorkspaceStore()
const { user } = storeToRefs(auth)
const { theme } = storeToRefs(themeStore)
const { workspaces, currentWorkspace, currentWorkspaceId, currentError } = storeToRefs(workspaceStore)
const router = useRouter()

const isLoadingWorkspaces = ref(true)

const workspaceLoadError = ref('')

const loadWorkspaces = async () => {

    isLoadingWorkspaces.value = true

    workspaceLoadError.value = ''

    try {
        const workspacesFetched = await getWorkspaces()
    await workspaceStore.setWorkspaces(workspacesFetched)

    } catch (error) {

        workspaceLoadError.value = error.message ?? 'Unable to load workspaces.'

    } finally {

        isLoadingWorkspaces.value = false

    }
}

onMounted(loadWorkspaces)


</script>
