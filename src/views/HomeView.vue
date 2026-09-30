<template>
  <div>
    <div
      class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-75 bg-amber-400/10 blur-[120px] rounded-full pointer-events-none"
    />

    <section
      class="w-full max-w-4xl mx-auto min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 relative z-10"
    >
      <div class="w-full flex flex-col items-center text-center">
        <h1
          class="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight"
        >
          <span :class="[theme.text, 'block']">
            Organize Your Work With Us.
          </span>
          <span :class="[theme.primary, 'bg-linear-to-r from-amber-300 to-amber-500 bg-clip-text']" >
            Achieve Your Goals.
          </span>
        </h1>

        <p
          :class="[theme.text, 'text-base sm:text-lg max-w-2xl mb-10 leading-relaxed font-normal']"
        >
          TaskHub helps you centralize your projects, organize your tasks, and
          collaborate efficiently with your team, all in one intuitive
          workspace.
        </p>

        <div
          class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <router-link
            to=""
            :class="[theme.primaryBg, theme.primaryBgHover, theme.primaryText, 'w-full sm:w-auto font-medium text-sm rounded-full px-8 py-3.5 transition-all shadow-lg shadow-amber-400/20 hover:shadow-amber-400/30 hover:-translate-y-0.5 text-center']"
          >
            Get Started for Free
          </router-link>

          <router-link v-if="user"
            :to="{name: 'workspace'}"
            :class="[theme.bg, theme.text, 'w-full sm:w-auto border border-slate-700 hover:border-amber-400/50 text-sm font-medium rounded-full px-8 py-3.5 transition-all text-center']"
          >
            Go to Workspace
          </router-link>

          <router-link v-if="!user"
            :to="{name: 'login'}"
            :class="[theme.bg, theme.text, 'w-full sm:w-auto border border-slate-700 hover:border-amber-400/50 text-sm font-medium rounded-full px-8 py-3.5 transition-all text-center']"
          >
            Sign In
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import useAuthStore from '@/stores/auth'
import useThemeStore from '@/stores/theme'

import { storeToRefs } from 'pinia'
const auth = useAuthStore()
const { user } = storeToRefs(auth)
const { theme } = storeToRefs(useThemeStore())

</script>
