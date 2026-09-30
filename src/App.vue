
<template>
  <div :class="theme.bg">
    <router-view v-if="authChecked"/>
    <div class="w-full h-screen flex items-center justify-center text-2xl text-white" v-else>Loading...</div>
  </div>
</template>

<script setup>
import PublicLayout from '@/layouts/PublicLayout.vue'
import { onMounted } from 'vue'
import  useAuthStore from '@/stores/auth'
import  useThemeStore from '@/stores/theme'
import { storeToRefs } from 'pinia'
const auth = useAuthStore()

const { authChecked } = storeToRefs(auth)
const { theme } = storeToRefs(useThemeStore())

onMounted(async() => {
  await auth.getUser()
})

</script>

