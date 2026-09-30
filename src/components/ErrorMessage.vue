<template>
  <div :class="[theme.bg, theme.border, 'border text-red-500 px-3 py-3 rounded-md']">
      <p>{{ props.error }}</p>
    </div>
</template>

<script setup>
import useThemeStore from '@/stores/theme'
import { storeToRefs } from 'pinia'
const { theme } = storeToRefs(useThemeStore())

const props = defineProps(['error'])
</script>
