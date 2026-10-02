<template>
    <div
        :class="[
            theme.bg,
            'flex w-full items-center justify-center gap-3',
            fullScreen ? 'min-h-screen' : 'min-h-48'
        ]"
        role="status"
        aria-live="polite"
        aria-busy="true"
    >
        <span :class="[theme.primary, 'h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent']" aria-hidden="true"></span>
        <span :class="[theme.textMuted, 'text-sm']">{{ message }}</span>
    </div>
</template>

<script setup>
import useThemeStore from '@/stores/theme'
import { storeToRefs } from 'pinia'

defineProps({
    message: {
        type: String,
        default: 'Loading...'
    },
    fullScreen: {
        type: Boolean,
        default: true
    }
})

const { theme } = storeToRefs(useThemeStore())
</script>