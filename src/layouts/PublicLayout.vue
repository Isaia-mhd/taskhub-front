<template>
    <div>
        <Header/>
        <div class="main">
            <router-view />
        </div>
        <Footer/>
    </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

</script>
