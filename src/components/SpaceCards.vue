<template>
    <div>
        <div :class="[theme.border, 'border rounded-xl mb-2']" v-for="space in currentWorkspace.spaces" :key="space.id">
            <div :class="[theme.bg, theme.border, 'rounded-xl p-4 mb-4']">
                <p :class="[theme.text, 'text-sm font-thin mb-2 flex items-center gap-2']">
                    <span>{{ space.name }}</span>
                    <ChevronDown size="20"/>
                </p>
                
                <p :class="[theme.textMuted, 'text-lg']">{{ space.description }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { getSpaces } from '@/services/spaceService'
import useWorkspaceStore from '@/stores/workspace'
import { storeToRefs } from 'pinia'
import useThemeStore from '@/stores/theme'
import { ChevronDown } from '@lucide/vue'
const themeStore = useThemeStore()
const { theme } = storeToRefs(themeStore)
const workspaceStore = useWorkspaceStore()
const { currentWorkspace } = storeToRefs(workspaceStore)


</script>