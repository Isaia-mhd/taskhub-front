<template>
  <div class="w-full max-w-md mx-auto text-white space-y-6 my-6">

    <div class="text-center md:text-left space-y-2">
      <h2 class="text-2xl font-bold">
        Create your account TaskHub
      </h2>

      <p class="text-sm">
        Join TaskHub and empower your team to work smarter, together.
      </p>
    </div>

    <form class="space-y-4">

      <!-- Full name -->
      <div class="space-y-1.5">
        <label class="text-xs font-medium">
          Full name
        </label>

        <div class="relative">
          <User class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />

          <input
            type="text"
            placeholder="Alexandre Martin"
            class="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      <!-- Email -->
      <div class="space-y-1.5">
        <label class="text-xs font-medium">
          E-mail Address
        </label>

        <div class="relative">
          <Mail class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />

          <input
            type="email"
            placeholder="alexandre@exemple.com"
            class="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      <!-- Password -->
      <div class="space-y-1.5">
        <label class="text-xs font-medium">
          Password
        </label>

        <div class="relative">
          <Lock class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />

          <Eye class="w-4 h-4 cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />

          <input
            type="password"
            placeholder="password"
            class="w-full border rounded-xl pl-9 pr-10 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      <!-- Confirm password -->
      <div class="space-y-1.5">
        <label class="text-xs font-medium">
          Confirm password
        </label>

        <div class="relative">
          <ShieldCheck class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />

          <Eye class="w-4 h-4 cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />

          <input
            type="password"
            placeholder="password"
            class="w-full border rounded-xl pl-9 pr-10 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      <!-- Submit -->
      <button
        type="button"
        class="w-full py-3 px-4 bg-amber-400 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-400/10 cursor-pointer"
      >
        Create my account

        <ArrowRight class="w-4 h-4" />
      </button>

    </form>

    <!-- Login -->
    <p class="text-center text-xs">
      Have an account ?

      <router-link :to="{name: 'login'}" class="text-amber-400 hover:underline font-medium">
        Sign In
      </router-link>
    </p>

  </div>
</template>

<script setup>
import { User, Mail,  Lock, Eye, ShieldCheck, ArrowRight } from '@lucide/vue'
</script>