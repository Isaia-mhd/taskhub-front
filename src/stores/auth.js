import axios from "axios";
import { defineStore } from "pinia";
import { getUser, authenticate, create, logout } from '@/services/authService'
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
            try {
                const res = await logout()
                if(res) this.user = null
            
            } catch (error) {
                throw error
            }
        },
        async register(info)
        {
            return await create(info)

        },

    },
    getters: {
        isAuthenticated: (state) => !!state.user
    }
})

export default useAuthStore