import { defineStore } from "pinia";

const useThemeStore = defineStore('theme', {
    state: () => ({
        isLight: localStorage.getItem('isLight') || true,
        dark: {
            bg: 'bg-slate-900',

            surface: 'bg-slate-800',
            elevated: 'bg-slate-700',

            border: 'border-slate-600',

            text: 'text-slate-100',
            textMuted: 'text-slate-400',

            primary: 'text-amber-400',
            primaryHover: 'hover:text-amber-300',

            primaryBg: 'bg-amber-400',
            primaryBgHover: 'hover:bg-amber-300',
            primaryText: 'text-slate-900',

        },
        light: {
            bg: 'bg-slate-100',

            surface: 'bg-white',
            elevated: 'bg-slate-50',

            border: 'border-slate-300',

            text: 'text-slate-800',
            textMuted: 'text-slate-500',

            primary: 'text-amber-500',
            primaryHover: 'hover:text-amber-600',

            primaryBg: 'bg-amber-400',
            primaryBgHover: 'hover:bg-amber-500',
            primaryText: 'text-slate-900',
        },
    }),

    actions: {
        changeTheme()
        {
            this.isLight = !this.isLight
            localStorage.setItem('isLight', this.isLight)
        }
    },
    getters: {
        theme: (state) => state.isLight ? state.light : state.dark
    }
})

export default useThemeStore