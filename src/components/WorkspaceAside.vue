<template>
    <div :class="[theme.bg, theme.border, ' w-[20%] p-4 border rounded-xl m-2']">
            <div class="flex h-full flex-col">
                <div class="mb-8 flex items-center gap-3 px-2">
                    <div class="w-full">
                        <label :class="[theme.textMuted, 'mb-2 block text-xs font-semibold uppercase']" for="workspace-select">
                            Workspace
                        </label>
                        <select
                            id="workspace-select"
                            v-model="currentWorkspaceId"
                            :disabled="props.isLoadingWorkspaces || workspaces.length === 0"
                            :class="[theme.bg, theme.border, theme.text, 'w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400 disabled:cursor-not-allowed disabled:opacity-60']"
                        >
                            <option v-if="props.isLoadingWorkspaces" :value="null">Loading workspaces...</option>
                            <option v-else-if="props.workspaceLoadError" :value="null" disabled>Could not load workspaces</option>
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

                <!-- Spaces -->
                <div class="mt-8 flex items-center justify-between px-2">
                    <p :class="[theme.textMuted, 'text-xs font-semibold uppercase']">Spaces</p>
                    <FolderKanban :class="[theme.textMuted, 'h-4 w-4']" />
                </div>

                <div class="" v-if="currentWorkspace && currentWorkspace.spaces">
                    <div v-for="space in currentWorkspace.spaces" :key="space.id" :class="[theme.text, 'text-sm font-thin px-2 py-1 my-2 flex items-center gap-2 cursor-pointer']">
                        <span :class="[ `bg-[${space.color}]`,'w-2 h-2 rounded-full px-1']"></span>
                        <p>{{ space.name }}</p>
                    </div>
                </div>

                <div :class="[theme.border, 'mt-auto border-t pt-4']">
                    <div :class="[theme.text, 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer']" @click="logout">
                        <LogOut class="h-4 w-4" />
                        Log out
                    </div>
                </div>
            </div>
        </div>

</template>

<script setup>
import useAuthStore from '@/stores/auth'
import useThemeStore from '@/stores/theme'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { ref, defineProps } from 'vue'
import useWorkspaceStore from '@/stores/workspace'
import { FolderKanban, Inbox, LogOut,  LayoutDashboard, ListTodo, Settings } from '@lucide/vue'


// Store
const auth = useAuthStore()
const themeStore = useThemeStore()
const workspaceStore = useWorkspaceStore()

// Store properties
const { theme } = storeToRefs(themeStore)
const { workspaces, currentWorkspace, currentWorkspaceId } = storeToRefs(workspaceStore)

const router = useRouter()

const props = defineProps({
    isLoadingWorkspaces: {type: Boolean, required: true},
    workspaceLoadError: {type: String, required: true}
})

const logout = async () => {
    await auth.logout()
    router.push({ name: 'login' })
}
</script>
