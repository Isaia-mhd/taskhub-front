<template>
  <div :class="[theme.text, 'w-full max-w-md mx-auto space-y-6 my-6']">

    <div class="text-center md:text-left space-y-2">
      <h2 class="text-2xl font-bold">
        Create your account TaskHub
      </h2>

      <p class="text-sm">
        Join TaskHub and empower your team to work smarter, together.
      </p>
    </div>

    <ErrorMessage :error="error" v-if="error"/>

    <form class="space-y-4" @submit.prevent="handleSubmit">

      <!-- Full name -->
      <div class="space-y-1.5">
        <label class="font-medium">
          Full name
        </label>

        <div class="relative">
          <User :class="[theme.text, 'w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2']" />

          <input
            type="text"
            v-model="account.name"
            placeholder="John Doe"
            :class="[theme.text, 'w-full border rounded-xl pl-9 pr-4 py-2.5 placeholder-slate-500 focus:outline-none focus:border-amber-400']"
          />
        </div>
      </div>

      <!-- Email -->
      <div class="space-y-1.5">
        <label class="font-medium">
          E-mail Address
        </label>

        <div class="relative">
          <Mail :class="[theme.text, 'w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2']" />

          <input
            type="email"
            v-model="account.email"
            placeholder="johndoe@exemple.com"
            :class="[theme.text, 'w-full border rounded-xl pl-9 pr-4 py-2.5 placeholder-slate-500 focus:outline-none focus:border-amber-400']"
          />
        </div>
      </div>

      <!-- Password -->
      <div class="space-y-1.5">
        <label class="font-medium">
          Password
        </label>

        <div class="relative">
          <Lock :class="[theme.text, 'w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2']" />

          <Eye v-if="showPass.password" @click="toggleShowPass" :class="[theme.text, 'w-4 h-4 cursor-pointer absolute right-3 top-1/2 -translate-y-1/2']" />
          <EyeOff v-else @click="toggleShowPass" :class="[theme.text, 'w-4 h-4 cursor-pointer absolute right-3 top-1/2 -translate-y-1/2']" />
          <input
            :type="showPass.password ? 'text' : 'password'"
            v-model="account.password"
            placeholder="password"
            :class="[ theme.text, 'w-full border rounded-xl pl-9 pr-10 py-2.5 placeholder-slate-500 focus:outline-none focus:border-amber-400']"
          />
        </div>
      </div>

      <!-- Confirm password -->
      <div class="space-y-1.5">
        <label class="font-medium">
          Confirm password
        </label>

        <div class="relative">
          <ShieldCheck :class="[theme.text, 'w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2']" />

          <Eye v-if="showPass.password_confirmation" @click="toggleShowPassConfirm" :class="[theme.text, 'w-4 h-4 cursor-pointer absolute right-3 top-1/2 -translate-y-1/2']" />
          <EyeOff v-else @click="toggleShowPassConfirm" :class="[theme.text, 'w-4 h-4 cursor-pointer absolute right-3 top-1/2 -translate-y-1/2']" />
          <input
            :type="showPass.password_confirmation ? 'text' : 'password'"
            v-model="account.password_confirmation"
            placeholder="password confirmation"
            :class="[ theme.text, 'w-full border rounded-xl pl-9 pr-10 py-2.5 placeholder-slate-500 focus:outline-none focus:border-amber-400']"
          />
        </div>
      </div>

      <!-- Submit -->
      <button
        type="submit"
        class="w-full py-3 px-4 bg-amber-400 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-400/10 cursor-pointer"
      >
        {{ loading ? 'Creating...' : 'Create my account' }}
      </button>

    </form>

    <!-- Login -->
    <p class="text-center">
      Have an account ?

      <router-link :to="{name: 'login'}" class="text-amber-400 hover:underline font-medium">
        Sign In
      </router-link>
    </p>

  </div>
</template>

<script setup>
import { User, Mail,  Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from '@lucide/vue'
import useAuthStore from '@/stores/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ErrorMessage from '@/components/ErrorMessage.vue'
import useThemeStore from '@/stores/theme'
import { storeToRefs } from 'pinia'
const { theme } = storeToRefs(useThemeStore())
const auth = useAuthStore()
const router = useRouter()
const error = ref(null)
const account = ref({
  name: null,
  email: null,
  password: null,
  password_confirmation: null
})

const loading = ref(false)
const showPass = ref({
  password: false,
  password_confirmation: false
})

const toggleShowPass = () => {
  showPass.value.password = !showPass.value.password
}
const toggleShowPassConfirm = () => {
  showPass.value.password_confirmation = !showPass.value.password_confirmation
}

const handleSubmit = async() => {
  loading.value = true
  try {
    await auth.register(account.value)
    router.push({name: 'login'})

  } catch (err) {
    error.value = err?.message
    
  } finally {
    loading.value = false
  }
}
</script>