<template>
    <div class="w-full flex justify-between  min-h-screen">
        <!-- asside -->
        <div class="bg-gray-700 w-[20%] p-4 border border-slate-800 rounded-xl m-2">
            aside
        </div>

        <div class="w-full flex flex-col gap-3 w-[80%] m-2">
            <!-- header -->
            <div class="bg-gray-700 rounded-xl p-4">
                <div class="flex justify-between items-center text-white">
                    <h1 class="text-xl text-amber-400 font-semibold">TaskHub</h1>
                    <div class="">
                        <p class="text-white">{{ user.name }}</p>
                        <p class="text-sm text-white">{{ user.email }}</p>
                    </div>
                </div>
            </div>

            <!-- main -->
            <div class="content flex-1 bg-gray-700  rounded-xl p-4">
                <router-view />
            </div>
        </div>
    </div>
</template>

<script setup>
import useAuthStore from '@/stores/auth'
import { storeToRefs } from 'pinia'
const auth = useAuthStore()
const { user } = storeToRefs(auth)

</script>
