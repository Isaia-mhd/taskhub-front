<template>
  <div class="w-full max-w-md mx-auto text-white space-y-6 my-6">
    <div class="text-center md:text-left space-y-2">
      <h2 class="text-2xl font-bold">Connect to your workspace</h2>

      <p class="text-sm text-slate-300">
        Access your workspace and manage your projects and tasks with ease.
      </p>
    </div>

    <ErrorMessage :error="error" v-if="error"/>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Email -->
      <div class="space-y-1.5">
        <label class="text-xs font-medium"> E-mail Address </label>

        <div class="relative">
          <Mail
            class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="email"
            v-model="credentials.email"
            placeholder="alexandre@exemple.com"
            class="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      <!-- Password -->
      <div class="space-y-1.5">
        <div class="flex justify-between items-center">
          <label class="text-xs font-medium"> Password </label>

          <a href="#" class="text-xs text-amber-400 hover:underline">
            Forgot ?
          </a>
        </div>

        <div class="relative">
          <Lock
            class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <Eye v-if="showPass" @click="toggleShowPass"
            class="w-4 h-4 cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <EyeOff v-else @click="toggleShowPass"
            class="w-4 h-4 cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            :type="showPass ? 'text' : 'password'"
            v-model="credentials.password"
            placeholder="password"
            class="w-full border rounded-xl pl-9 pr-10 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      <!-- Remember me -->
      <div class="flex items-center justify-between text-xs">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            class="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500/20"
          />
          <span>Remember me</span>
        </label>
      </div>

      <!-- Submit -->
      <button
        type="submit"
        class="w-full py-3 px-4 bg-amber-400 hover:bg-amber-600 text-white text-sm cursor-pointer font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-400/10"
      >
        {{ loading ? 'Connection...' : 'Sign In' }}
      </button>
    </form>

    <!-- Register -->
    <p class="text-center text-xs">
      Don't have account ?

      <router-link :to="{name: 'register'}" class="text-amber-400 hover:underline font-medium">
        Create an account
      </router-link>
    </p>
  </div>
</template>

<script setup>
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "@lucide/vue";
import { ref, toRefs } from 'vue'
import useAuthStore from '@/stores/auth'
import { useRouter } from 'vue-router'
const auth = useAuthStore()
const router = useRouter()


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
    router.push({name: 'home'})

  } catch (err) {
    error.value = err?.message;

  } finally{
    loading.value = false

  }
  
}
</script>
