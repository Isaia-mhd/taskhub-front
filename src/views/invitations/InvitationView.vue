<template>
    <main class="mx-auto flex w-full max-w-xl items-center px-4 py-12 sm:py-20">
        <section :class="[theme.surface, theme.border, 'w-full rounded-xl border p-6 shadow-xl sm:p-8']">
            <div v-if="isLoading" :class="[theme.textMuted, 'py-16 text-center text-sm']">Loading invitation...</div>
            <div v-else-if="error" class="py-10 text-center">
                <span class="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-red-500/10 text-red-400"><CircleAlert class="h-6 w-6" /></span>
                <h1 :class="[theme.text, 'text-xl font-semibold']">Invitation unavailable</h1>
                <p :class="[theme.textMuted, 'mt-2 text-sm']">{{ error }}</p>
                <router-link :to="{ name: 'home' }" :class="[theme.primary, 'mt-5 inline-block text-sm font-semibold hover:underline']">Go to TaskHub</router-link>
            </div>
            <template v-else-if="invitation">
                <div class="text-center"><span :class="[theme.primaryBg, 'mx-auto grid h-12 w-12 place-items-center rounded-xl']"><Mail class="h-6 w-6" :class="theme.primaryText" /></span><p :class="[theme.primary, 'mt-5 text-xs font-semibold uppercase tracking-widest']">Workspace invitation</p><h1 :class="[theme.text, 'mt-2 text-2xl font-semibold']">Join {{ invitation.workspace?.name ?? 'a workspace' }}</h1><p :class="[theme.textMuted, 'mt-3 text-sm leading-6']">{{ invitation.inviter?.name ?? 'A teammate' }} invited <strong :class="theme.text">{{ invitation.email }}</strong> to collaborate as a <strong :class="theme.text">{{ invitation.role }}</strong>.</p></div>
                <div :class="[theme.border, 'mt-6 space-y-3 border-y py-4 text-sm']"><div class="flex justify-between gap-4"><span :class="theme.textMuted">Status</span><span :class="[statusClass, 'rounded-full px-2 py-0.5 text-xs font-semibold capitalize']">{{ invitation.status }}</span></div><div class="flex justify-between gap-4"><span :class="theme.textMuted">Expires</span><span :class="[theme.text, 'text-right']">{{ formatDateTime(invitation.expires_at) }}</span></div></div>
                <p v-if="actionError" class="mt-4 text-sm text-red-400" role="alert">{{ actionError }}</p>
                <p v-if="successMessage" class="mt-4 text-sm text-emerald-400" role="status">{{ successMessage }}</p>
                <div v-if="invitation.status === 'pending'" class="mt-6">
                    <div v-if="!auth.isAuthenticated" :class="[theme.elevated, 'rounded-lg p-4 text-center']"><p :class="[theme.text, 'text-sm font-medium']">Sign in to respond to this invitation.</p><p :class="[theme.textMuted, 'mt-1 text-xs']">Use the account for {{ invitation.email }}.</p><div class="mt-4 flex justify-center gap-3"><router-link :to="{ name: 'login', query: { redirect: $route.fullPath } }" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'rounded-md px-4 py-2 text-sm font-semibold']">Sign in</router-link><router-link :to="{ name: 'register', query: { redirect: $route.fullPath } }" :class="[theme.text, theme.border, 'rounded-md border px-4 py-2 text-sm font-semibold']">Create account</router-link></div></div>
                    <div v-else class="flex flex-col-reverse gap-3 sm:flex-row"><button type="button" :disabled="isResponding" :class="[theme.text, theme.elevated, 'flex-1 rounded-md px-4 py-2.5 text-sm font-semibold disabled:opacity-50']" @click="respond('reject')"><span v-if="isResponding && responseAction === 'reject'">Declining...</span><span v-else>Decline</span></button><button type="button" :disabled="isResponding" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold disabled:opacity-50']" @click="respond('accept')"><span v-if="isResponding && responseAction === 'accept'" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span><Check v-else class="h-4 w-4" />{{ isResponding && responseAction === 'accept' ? 'Joining...' : 'Accept invitation' }}</button></div>
                </div>
                <div v-else class="mt-6 text-center"><router-link :to="{ name: 'home' }" :class="[theme.primary, 'text-sm font-semibold hover:underline']">Go to TaskHub</router-link></div>
            </template>
        </section>
    </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Check, CircleAlert, Mail } from '@lucide/vue'
import { useRouter } from 'vue-router'
import useThemeStore from '@/stores/theme'
import useAuthStore from '@/stores/auth'
import { acceptInvitation, getInvitation, rejectInvitation } from '@/services/workspaceInvitationService'

const props = defineProps({ token: { type: String, required: true } })
const router = useRouter()
const themeStore = useThemeStore()
const auth = useAuthStore()
const { theme } = storeToRefs(themeStore)
const invitation = ref(null)
const isLoading = ref(true)
const isResponding = ref(false)
const responseAction = ref('')
const error = ref('')
const actionError = ref('')
const successMessage = ref('')

const formatDateTime = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not available'
const statusClass = computed(() => ({ pending: 'bg-sky-500/15 text-sky-400', accepted: 'bg-emerald-500/15 text-emerald-400', rejected: 'bg-red-500/15 text-red-400', cancelled: 'bg-slate-500/15 text-slate-400', expired: 'bg-amber-500/15 text-amber-400' }[invitation.value?.status] ?? 'bg-slate-500/15 text-slate-400'))

const loadInvitation = async () => {
    isLoading.value = true
    error.value = ''
    actionError.value = ''
    try {
        invitation.value = await getInvitation(props.token)
    } catch (requestError) {
        error.value = requestError.message ?? 'This invitation could not be found.'
    } finally {
        isLoading.value = false
    }
}

const respond = async (action) => {
    if (!auth.isAuthenticated || !invitation.value) return
    isResponding.value = true
    responseAction.value = action
    actionError.value = ''
    try {
        if (action === 'accept') await acceptInvitation(props.token)
        else await rejectInvitation(props.token)
        invitation.value = { ...invitation.value, status: action === 'accept' ? 'accepted' : 'rejected' }
        successMessage.value = action === 'accept' ? 'Invitation accepted. Redirecting to your workspace...' : 'Invitation declined.'
        if (action === 'accept') setTimeout(() => router.push({ name: 'workspace' }), 900)
    } catch (requestError) {
        actionError.value = requestError.message ?? 'Unable to respond to this invitation.'
    } finally {
        isResponding.value = false
        responseAction.value = ''
    }
}

onMounted(loadInvitation)
watch(() => props.token, loadInvitation)
</script>
