<template>
    <div class="min-h-screen flex flex-col">
        <Header/>
        <div class="flex-1">
            <router-view />
        </div>
        <Footer/>
    </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

</script>
