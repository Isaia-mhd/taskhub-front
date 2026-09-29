import axios from "axios";
import { defineStore } from "pinia";
import { getUser, authenticate, test } from '@/services/authService'
import { computed } from "vue";
const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        authChecked: false
    }),
    actions: {
        async getUser()
        {
            try {
                const res = await getUser()
                
                this.user = res.data.user
                
            } catch (error) {
                this.user = null
                
            } finally {
                this.authChecked = true
            }
        },
        async login(credentials)
        {
            const res = await authenticate(credentials)

            this.user = res?.data.data
            return res
            
        },
        async logout()
        {
            
        },
        async register()
        {

        },

    },
    getters: {
        isAuthenticated: (state) => !!state.user
    }
})

export default useAuthStore