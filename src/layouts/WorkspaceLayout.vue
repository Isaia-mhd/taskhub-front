<template>
    <div class="w-full flex justify-between min-h-screen">
        <!-- asside -->
        <div :class="[theme.bg, theme.border, ' w-[20%] p-4 border rounded-xl m-2']">
            <div class="flex h-full flex-col">
                <div class="mb-8 flex items-center gap-3 px-2">
                    <div :class="[theme.primaryBg, 'flex h-9 w-9 items-center justify-center rounded-lg']">
                        <LayoutDashboard :class="[theme.primaryText, 'h-5 w-5']" />
                    </div>
                    <div>
                        <p :class="[theme.text, 'font-semibold']">TaskHub</p>
                        <p :class="[theme.textMuted, 'text-xs']">Workspace</p>
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

                <div class="mt-auto border-t border-inherit pt-4">
                    <div :class="[theme.text, 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm']">
                        <Settings class="h-4 w-4" />
                        Settings
                    </div>
                </div>
            </div>
        </div>

        <div class="w-full flex flex-col gap-3 w-[80%] m-2">
            <!-- header -->
            <div :class="[theme.bg, theme.border, 'border rounded-xl p-4']">
                <div :class="['flex justify-between items-center']">
                    <h1 :class="[theme.primary, 'text-xl font-semibold']">TaskHub</h1>
                    <label :class="[theme.border, 'relative hidden w-full max-w-md items-center md:flex']">
                        <Search :class="[theme.textMuted, 'pointer-events-none absolute left-3 h-4 w-4']" />
                        <input
                            v-model="searchQuery"
                            type="search"
                            placeholder="Search tasks, projects, and people"
                            aria-label="Search tasks, projects, and people"
                            :class="[theme.bg, theme.text, theme.border, 'w-full rounded-lg border py-2 pl-10 pr-4 text-sm outline-none focus:border-amber-400']"
                        />
                    </label>
                    <div class="flex items-center gap-4">
                        <Moon v-if="isLight" @click="toggleTheme"/>
                        <Sun v-else @click="toggleTheme"/>
                        <button
                            type="button"
                            aria-label="Notifications"
                            :class="[theme.text, theme.primaryHover, 'rounded-lg p-2 transition-colors']"
                        >
                            <Bell class="h-5 w-5" />
                        </button>
                        <div class="">
                            <p :class="[theme.text]">{{ user.name }}</p>
                            <p :class="[theme.text, 'text-sm']">{{ user.email }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- main -->
            <div :class="[theme.bg, theme.border, 'border content flex-1 rounded-xl p-4']">
                <router-view />
            </div>
        </div>
    </div>
</template>

<script setup>
import useAuthStore from '@/stores/auth'
import useThemeStore from '@/stores/theme'
import { storeToRefs } from 'pinia'
import { Bell, FolderKanban, Inbox, Sun, Moon, LayoutDashboard, ListTodo, Search, Settings } from '@lucide/vue'
import { ref } from 'vue'

const auth = useAuthStore()
const themeStore = useThemeStore()
const { user } = storeToRefs(auth)
const { theme, isLight } = storeToRefs(themeStore)
const searchQuery = ref('')
const toggleTheme = () => {
    themeStore.changeTheme()
    console.log(theme.value);
    
}

</script>
