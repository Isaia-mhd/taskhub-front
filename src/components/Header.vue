<script setup>
import useAuthStore from '@/stores/auth'
import { storeToRefs } from 'pinia'

const { user } = storeToRefs(useAuthStore())

const menus = [
  { name: "Home", path: "/" },
  { name: "Features", path: "/" },
  { name: "About", path: "/" },
  { name: "Contact", path: "/" },
];
</script>

<template>
    <header class="w-full max-w-6xl mx-auto rounded-full h-[80px] border-b border-amber-400/30 bg-slate-800/40 backdrop-blur-md px-8 flex items-center justify-between mb-6">
      
      <nav>
        <ul class="flex items-center gap-8">
          
            <li v-for="menu in menus" :key="menu.name">
              <router-link
                :to="menu.path"
                class="text-white hover:text-amber-400 text-sm font-medium transition-colors"
              >
                {{ menu.name }}
              </router-link>
            </li>
        </ul>
          
      </nav>

      
      <div>
          <router-link v-if="!user"
            :to="{name: 'login'}"
            class="bg-slate-800 border-2 border-amber-400 text-amber-400 text-sm font-medium rounded-full px-8 py-2.5 hover:bg-amber-400 hover:text-white transition-all inline-block"
          >
            Sign In
          </router-link>
          <router-link v-if="!!user"
            :to="{name: 'login'}"
            class="bg-slate-800 border-2 border-amber-400 text-amber-400 text-sm font-medium rounded-full px-8 py-2.5 hover:bg-amber-400 hover:text-white transition-all inline-block"
          >
            Workspaces
          </router-link>
      </div>
    </header>
</template>
