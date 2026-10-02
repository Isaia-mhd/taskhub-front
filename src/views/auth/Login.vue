<template>
  <div class="w-full max-w-md mx-auto text-white space-y-6 my-6">
    <div class="text-center md:text-left space-y-2">
      <h2 :class="[theme.text, 'text-2xl font-bold']">Connect to your workspace</h2>

      <p :class="[theme.text]">
        Access your workspace and manage your projects and tasks with ease.
      </p>
    </div>

    <ErrorMessage :error="error" v-if="error"/>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Email -->
      <div class="space-y-1.5">
        <label :class="[theme.text, 'font-medium']"> E-mail Address </label>

        <div class="relative">
          <Mail
            :class="[theme.text, 'w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2']"
          />

          <input
            type="email"
            v-model="credentials.email"
            placeholder="alexandre@exemple.com"
            :class="[theme.text, 'w-full border rounded-xl pl-9 pr-4 py-2.5 placeholder-slate-500 focus:outline-none focus:border-amber-400']"
          />
        </div>
      </div>

      <!-- Password -->
      <div class="space-y-1.5">
        <div class="flex justify-between items-center">
          <label :class="[theme.text, 'font-medium']"> Password </label>

          <a href="#" :class="[theme.primary, ' hover:underline']">
            Forgot ?
          </a>
        </div>

        <div class="relative">
          <Lock
            :class="[theme.text,'w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2']"
          />

          <Eye v-if="showPass" @click="toggleShowPass"
            :class="[theme.text, 'w-4 h-4 cursor-pointer absolute right-3 top-1/2 -translate-y-1/2']"
          />
          <EyeOff v-else @click="toggleShowPass"
            :class="[theme.text, 'w-4 h-4 cursor-pointer absolute right-3 top-1/2 -translate-y-1/2']"
          />

          <input
            :type="showPass ? 'text' : 'password'"
            v-model="credentials.password"
            placeholder="password"
            :class="[ theme.text, 'w-full border rounded-xl pl-9 pr-10 py-2.5 placeholder-slate-500 focus:outline-none focus:border-amber-400']"
          />
        </div>
      </div>

      <!-- Remember me -->
      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            class="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500/20"
          />
          <span :class="[theme.text, 'font-medium']">Remember me</span>
        </label>
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :class="[theme.primaryBg, theme.primaryBgHover, theme.primaryText, 'w-full py-3 px-4 text-sm cursor-pointer font-medium rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-400/10']"
      >
        {{ loading ? 'Connection...' : 'Sign In' }}
      </button>
    </form>

    <!-- Register -->
    <p :class="[theme.text, 'text-center']">
      Don't have account ?

      <router-link :to="{name: 'register'}" :class="[theme.primary, 'hover:underline font-medium']">
        Create an account
      </router-link>
    </p>
  </div>
</template>

<script setup>
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "@lucide/vue";
import { ref, toRefs } from 'vue'
import useAuthStore from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
const auth = useAuthStore()
const router = useRouter()
import useThemeStore from '@/stores/theme'
import ErrorMessage from '@/components/ErrorMessage.vue'

const { theme } = storeToRefs(useThemeStore())

const credentials = ref({
  email: 'test@example.com',
  password: 'password'
})

const error = ref(null)
const loading = ref(false)

const showPass = ref(false)

const toggleShowPass = () => {
  showPass.value = !showPass.value
}

const handleSubmit = async () => {
  loading.value = true
  try {
    await auth.login(credentials.value)
    router.push({name: 'workspace'})

  } catch (err) {
    error.value = err?.message;

  } finally{
    loading.value = false

  }
  
}
</script>
