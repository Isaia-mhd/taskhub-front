<template>
  <div :class="['flex justify-between items-center']">
    <h1 :class="[theme.primary, 'text-xl font-semibold']">TaskHub</h1>
    <label
      :class="[
        theme.border,
        'relative hidden w-full max-w-md items-center md:flex',
      ]"
    >
      <Search
        :class="[
          theme.textMuted,
          'pointer-events-none absolute left-3 h-4 w-4',
        ]"
      />
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Search tasks, projects, and people"
        aria-label="Search tasks, projects, and people"
        :class="[
          theme.bg,
          theme.text,
          theme.border,
          'w-full rounded-lg border py-2 pl-10 pr-4 text-sm outline-none focus:border-amber-400',
        ]"
      />
    </label>
    <div class="flex items-center gap-4">
      <Moon v-if="isLight" @click="toggleTheme" :class="[theme.text]" />
      <Sun v-else @click="toggleTheme" :class="[theme.text]" />
      <button
        type="button"
        aria-label="Notifications"
        :class="[
          theme.text,
          theme.primaryHover,
          'rounded-lg p-2 transition-colors',
        ]"
      >
        <Bell class="h-5 w-5" />
      </button>
      <div v-if="user" class="">
        <p :class="[theme.text]">{{ user.name }}</p>
        <p :class="[theme.text, 'text-sm']">{{ user.email }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Bell, Inbox, Sun, Moon, Search } from '@lucide/vue'
import { ref } from 'vue'
import useAuthStore from '@/stores/auth'
import useThemeStore from '@/stores/theme'
import { storeToRefs } from 'pinia'
const auth = useAuthStore()
const themeStore = useThemeStore()
const { user } = storeToRefs(auth)
const { theme, isLight } = storeToRefs(themeStore)

const searchQuery = ref('')
const toggleTheme = () => {
    themeStore.changeTheme()
}
</script>