<template>
    <div>
        <main class="mx-auto max-w-6xl space-y-8">
            <header class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p :class="[theme.primary, 'mb-2 text-xs font-semibold uppercase tracking-widest']">Workspace</p>
                    <h1 :class="[theme.text, 'text-3xl font-semibold']">Your workspaces</h1>
                    <p :class="[theme.textMuted, 'mt-2 max-w-xl text-sm']">Organize your teams and projects in one place.</p>
                </div>
                <button type="button" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors']" @click="openCreate">
                    <Plus class="h-4 w-4" /> New workspace
                </button>
            </header>

            <p v-if="pageError" :class="[theme.border, theme.text, 'rounded-md border px-4 py-3 text-sm']" role="alert">{{ pageError }}</p>

            <section v-if="workspaces.length" aria-label="Your workspaces">
                <div class="mb-3 flex items-center justify-between">
                    <h2 :class="[theme.text, 'text-sm font-semibold']">All workspaces</h2>
                    <span :class="[theme.textMuted, 'text-xs']">{{ workspaces.length }} total</span>
                </div>
                <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <article v-for="workspace in workspaces" :key="workspace.id" :class="[theme.border, theme.surface, 'rounded-lg border p-5 transition-colors']">
                        <button type="button" class="w-full text-left" :aria-label="`Open ${workspace.name}`" @click="openWorkspace(workspace.id)">
                            <div class="mb-4 flex items-start justify-between gap-3">
                                <span :class="[theme.primaryBg, 'grid h-10 w-10 shrink-0 place-items-center rounded-md']"><Building2 :class="[theme.primaryText, 'h-5 w-5']" /></span>
                                <span v-if="String(workspace.id) === String(currentWorkspaceId)" :class="[theme.primary, 'text-xs font-semibold']">Active</span>
                            </div>
                            <h3 :class="[theme.text, 'truncate text-base font-semibold']">{{ workspace.name }}</h3>
                            <p :class="[theme.textMuted, 'mt-2 line-clamp-2 min-h-10 text-sm']">{{ workspace.description || 'No description yet.' }}</p>
                        </button>
                        <div :class="[theme.border, 'mt-5 flex items-center justify-between border-t pt-4']">
                            <span :class="[theme.textMuted, 'text-xs']">{{ workspace.spaces?.length ?? (String(workspace.id) === String(currentWorkspaceId) ? currentWorkspace?.spaces?.length : 0) }} spaces</span>
                            <div class="flex items-center gap-1">
                                <button type="button" :class="[theme.textMuted, theme.primaryHover, 'rounded p-2 transition-colors']" :aria-label="`Edit ${workspace.name}`" title="Edit workspace" @click="openEdit(workspace)"><Pencil class="h-4 w-4" /></button>
                                <button type="button" :class="[theme.textMuted, 'rounded p-2 text-red-400 transition-colors hover:bg-red-500/10']" :aria-label="`Delete ${workspace.name}`" title="Delete workspace" @click="removeWorkspace(workspace)"><Trash2 class="h-4 w-4" /></button>
                            </div>
                        </div>
                    </article>
                </div>
            </section>

            <section v-else :class="[theme.border, theme.surface, 'flex min-h-64 flex-col items-center justify-center rounded-lg border px-6 py-12 text-center']">
                <span :class="[theme.elevated, 'mb-4 grid h-12 w-12 place-items-center rounded-lg']"><Building2 :class="[theme.primary, 'h-6 w-6']" /></span>
                <h2 :class="[theme.text, 'text-lg font-semibold']">Start with a workspace</h2>
                <p :class="[theme.textMuted, 'mt-2 max-w-sm text-sm']">Create a workspace to bring your team, spaces, and tasks together.</p>
                <button type="button" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'mt-5 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors']" @click="openCreate"><Plus class="h-4 w-4" /> Create workspace</button>
            </section>

            <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeModal">
                <section role="dialog" aria-modal="true" aria-labelledby="workspace-dialog-title" :class="[theme.surface, theme.border, 'w-full max-w-lg rounded-lg border p-6 shadow-2xl']">
                    <div class="mb-6 flex items-start justify-between gap-4">
                        <div>
                            <h2 id="workspace-dialog-title" :class="[theme.text, 'text-lg font-semibold']">{{ editingWorkspace ? 'Edit workspace' : 'Create workspace' }}</h2>
                            <p :class="[theme.textMuted, 'mt-1 text-sm']">Workspace details can be changed later.</p>
                        </div>
                        <button type="button" :class="[theme.textMuted, 'rounded p-1']" aria-label="Close dialog" @click="closeModal"><X class="h-5 w-5" /></button>
                    </div>
                    <form class="space-y-4" @submit.prevent="saveWorkspace">
                        <label class="block">
                            <span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Workspace name</span>
                            <input v-model="form.name" required maxlength="255" autofocus :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400']" placeholder="e.g. Product team" />
                            <span v-if="validationErrors.name" class="mt-1 block text-xs text-red-400">{{ validationErrors.name }}</span>
                        </label>
                        <label class="block">
                            <span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Description <span :class="theme.textMuted">(optional)</span></span>
                            <textarea v-model="form.description" rows="3" :class="[theme.bg, theme.text, theme.border, 'w-full resize-y rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400']" placeholder="What is this workspace for?" />
                            <span v-if="validationErrors.description" class="mt-1 block text-xs text-red-400">{{ validationErrors.description }}</span>
                        </label>
                        <p v-if="formError" class="text-sm text-red-400" role="alert">{{ formError }}</p>
                        <div :class="[theme.border, 'flex justify-end gap-2 border-t pt-4']">
                            <button type="button" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm font-medium']" :disabled="isSaving" @click="closeModal">Cancel</button>
                            <button type="submit" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'inline-flex min-w-28 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60']" :disabled="isSaving">
                                <span v-if="isSaving" :class="[theme.primaryText, 'h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent']" aria-hidden="true"></span>
                                {{ isSaving ? 'Saving...' : editingWorkspace ? 'Save changes' : 'Create workspace' }}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Building2, Pencil, Plus, Trash2, X } from '@lucide/vue'
import useThemeStore from '@/stores/theme'
import useWorkspaceStore from '@/stores/workspace'
import { createWorkspace as createWorkspaceRequest, deleteWorkspace as deleteWorkspaceRequest, updateWorkspace as updateWorkspaceRequest } from '@/services/workspaceService'

const themeStore = useThemeStore()
const workspaceStore = useWorkspaceStore()
const { theme } = storeToRefs(themeStore)
const { workspaces, currentWorkspace, currentWorkspaceId } = storeToRefs(workspaceStore)
const isModalOpen = ref(false)
const isSaving = ref(false)
const pageError = ref('')
const formError = ref('')
const validationErrors = ref({})
const editingWorkspace = ref(null)
const form = reactive({ name: '', description: '' })

const clearForm = () => {
    form.name = ''
    form.description = ''
    formError.value = ''
    validationErrors.value = {}
}

const openCreate = () => {
    editingWorkspace.value = null
    clearForm()
    isModalOpen.value = true
}

const openEdit = (workspace) => {
    editingWorkspace.value = workspace
    clearForm()
    form.name = workspace.name
    form.description = workspace.description ?? ''
    isModalOpen.value = true
}

const closeModal = () => {
    if (!isSaving.value) isModalOpen.value = false
}

const saveWorkspace = async () => {
    isSaving.value = true
    formError.value = ''
    validationErrors.value = {}
    const payload = { name: form.name.trim(), description: form.description.trim() }

    try {
        if (editingWorkspace.value) {
            workspaceStore.updateWorkspace(await updateWorkspaceRequest(editingWorkspace.value.id, payload))
        } else {
            const created = await createWorkspaceRequest(payload)
            workspaceStore.addWorkspace(created)
            await workspaceStore.selectWorkspace(created.id)
        }
        isModalOpen.value = false
    } catch (error) {
        validationErrors.value = Object.fromEntries(Object.entries(error.errors ?? {}).map(([field, messages]) => [field, messages[0]]))
        formError.value = error.message ?? 'Unable to save this workspace.'
    } finally {
        isSaving.value = false
    }
}

const openWorkspace = async (workspaceId) => {
    pageError.value = ''
    try {
        await workspaceStore.selectWorkspace(workspaceId)
    } catch (error) {
        pageError.value = error.message ?? 'Unable to open this workspace.'
    }
}

const removeWorkspace = async (workspace) => {
    if (!window.confirm(`Delete "${workspace.name}"? This action cannot be undone.`)) return
    pageError.value = ''
    try {
        await deleteWorkspaceRequest(workspace.id)
        await workspaceStore.removeWorkspace(workspace.id)
    } catch (error) {
        pageError.value = error.message ?? 'Unable to delete this workspace.'
    }
}
</script>