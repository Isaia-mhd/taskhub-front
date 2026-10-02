
<template>
  <div :class="theme.bg">
    <router-view v-if="authChecked"/>
    <Loading v-else/>
  </div>
</template>

<script setup>
import PublicLayout from '@/layouts/PublicLayout.vue'
import { onMounted } from 'vue'
import  useAuthStore from '@/stores/auth'
import  useThemeStore from '@/stores/theme'
import { storeToRefs } from 'pinia'
import Loading from '@/components/Loading.vue'
const auth = useAuthStore()

const { authChecked } = storeToRefs(auth)
const { theme } = storeToRefs(useThemeStore())

onMounted(async() => {
  await auth.getUser()
})

</script>

