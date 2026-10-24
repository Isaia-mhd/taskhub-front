<template>
    <main class="mx-auto max-w-7xl space-y-6">
        <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p :class="[theme.primary, 'mb-2 text-xs font-semibold uppercase tracking-widest']">Workspace settings</p>
                <h1 :class="[theme.text, 'text-3xl font-semibold']">Tags</h1>
                <p :class="[theme.textMuted, 'mt-2 max-w-2xl text-sm']">Create and manage labels to organize tasks across this workspace.</p>
            </div>
            <button type="button" :disabled="!currentWorkspaceId" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50']" @click="openCreate">
                <Plus class="h-4 w-4" /> New tag
            </button>
        </header>

        <div v-if="pageError" :class="[theme.border, 'flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3']" role="alert">
            <p class="text-sm text-red-400">{{ pageError }}</p>
            <button type="button" :class="[theme.text, theme.elevated, 'rounded-md px-3 py-1.5 text-xs font-medium']" @click="loadTags">Retry</button>
        </div>
        <p v-if="successMessage" :class="[theme.border, theme.text, 'rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm']" role="status">{{ successMessage }}</p>

        <section :class="[theme.border, theme.surface, 'overflow-hidden rounded-lg border']" aria-label="Workspace tags">
            <div :class="[theme.border, 'flex items-center justify-between gap-4 border-b px-5 py-4']">
                <div><h2 :class="[theme.text, 'text-sm font-semibold']">Workspace tags</h2><p :class="[theme.textMuted, 'mt-1 text-xs']">Tags can be applied to tasks in any space.</p></div>
                <button type="button" :disabled="isLoading" :class="[theme.textMuted, theme.primaryHover, 'rounded-md p-2 transition-colors disabled:opacity-50']" aria-label="Refresh tags" title="Refresh tags" @click="loadTags">
                    <RefreshCw :class="['h-4 w-4', isLoading ? 'animate-spin' : '']" />
                </button>
            </div>
            <div v-if="isLoading" :class="[theme.textMuted, 'px-5 py-12 text-center text-sm']">Loading tags...</div>
            <div v-else-if="tags.length === 0" class="px-5 py-12 text-center">
                <span :class="[theme.elevated, 'mx-auto mb-4 grid h-11 w-11 place-items-center rounded-lg']"><Tags :class="[theme.primary, 'h-5 w-5']" /></span>
                <p :class="[theme.text, 'text-sm font-semibold']">No tags yet</p>
                <p :class="[theme.textMuted, 'mt-1 text-xs']">Create your first tag to start labeling tasks.</p>
                <button type="button" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'mt-5 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold']" @click="openCreate"><Plus class="h-4 w-4" /> Create first tag</button>
            </div>
            <ul v-else :class="[theme.border, 'divide-y']">
                <li v-for="tag in tags" :key="tag.id" :class="[theme.bg, 'flex flex-wrap items-center gap-3 px-5 py-4 transition-colors']">
                    <button type="button" class="flex min-w-0 flex-1 items-center gap-3 text-left" :aria-label="`View ${tag.name} tag`" @click="selectedTag = tag">
                        <span class="grid h-8 w-8 shrink-0 place-items-center rounded-md" :style="{ backgroundColor: tag.color, color: '#0f172a' }"><Tags class="h-4 w-4" /></span>
                        <span :class="[theme.text, 'min-w-0 truncate text-sm font-semibold']">{{ tag.name }}</span>
                    </button>
                    <div class="flex items-center gap-1">
                        <button type="button" :class="[theme.textMuted, theme.primaryHover, 'rounded p-2 transition-colors']" :aria-label="`Edit ${tag.name}`" title="Edit tag" @click="openEdit(tag)"><Pencil class="h-4 w-4" /></button>
                        <button type="button" :class="[theme.textMuted, 'rounded p-2 text-red-400 transition-colors hover:bg-red-500/10']" :aria-label="`Delete ${tag.name}`" title="Delete tag" @click="pendingDeletion = tag"><Trash2 class="h-4 w-4" /></button>
                    </div>
                </li>
            </ul>
        </section>

        <div v-if="isFormOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeForm">
            <form role="dialog" aria-modal="true" aria-labelledby="tag-form-title" :class="[theme.surface, theme.border, 'w-full max-w-md rounded-lg border p-6 shadow-2xl']" @submit.prevent="saveTag" @keydown.esc="closeForm">
                <div class="mb-5 flex items-start justify-between gap-4">
                    <div><h2 id="tag-form-title" :class="[theme.text, 'text-lg font-semibold']">{{ editingTag ? 'Edit tag' : 'Create a tag' }}</h2><p :class="[theme.textMuted, 'mt-1 text-sm']">Tag details are shared across this workspace.</p></div>
                    <button type="button" :disabled="isSaving" :class="[theme.textMuted, 'rounded p-1']" aria-label="Close tag form" @click="closeForm"><X class="h-5 w-5" /></button>
                </div>
                <p v-if="formError" class="mb-4 text-sm text-red-400" role="alert">{{ formError }}</p>
                <label class="block"><span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Name</span><input v-model.trim="form.name" type="text" maxlength="255" required autofocus :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400']" placeholder="e.g. Bug" /></label>
                <label class="mt-4 block"><span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Color</span><span class="flex items-center gap-3"><input v-model="form.color" type="color" :class="[theme.border, 'h-10 w-14 cursor-pointer rounded border bg-transparent p-1']" aria-label="Tag color" /><span :class="[theme.textMuted, 'text-sm']">{{ form.color }}</span></span></label>
                <div :class="[theme.border, 'mt-6 flex justify-end gap-2 border-t pt-4']">
                    <button type="button" :disabled="isSaving" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm']" @click="closeForm">Cancel</button>
                    <button type="submit" :disabled="isSaving" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'min-w-32 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60']">{{ isSaving ? 'Saving...' : editingTag ? 'Save changes' : 'Create tag' }}</button>
                </div>
            </form>
        </div>

        <div v-if="selectedTag" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="selectedTag = null">
            <section role="dialog" aria-modal="true" aria-labelledby="tag-details-title" :class="[theme.surface, theme.border, 'w-full max-w-md rounded-lg border p-6 shadow-2xl']" @keydown.esc="selectedTag = null">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex min-w-0 items-center gap-3">
                        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-md" :style="{ backgroundColor: selectedTag.color, color: '#0f172a' }"><Tags class="h-5 w-5" /></span>
                        <div><h2 id="tag-details-title" :class="[theme.text, 'text-lg font-semibold']">{{ selectedTag.name }}</h2><p :class="[theme.textMuted, 'mt-0.5 text-xs']">Tag details</p></div>
                    </div>
                    <button type="button" :class="[theme.textMuted, 'rounded p-1']" aria-label="Close tag details" @click="selectedTag = null"><X class="h-5 w-5" /></button>
                </div>
                <dl :class="[theme.border, 'mt-5 space-y-3 border-y py-4 text-sm']">
                    <div class="flex justify-between gap-4"><dt :class="theme.textMuted">Name</dt><dd :class="theme.text">{{ selectedTag.name }}</dd></div>
                    <div class="flex justify-between gap-4"><dt :class="theme.textMuted">Color</dt><dd class="flex items-center gap-2"><span class="h-4 w-4 rounded" :style="{ backgroundColor: selectedTag.color }"></span><span :class="theme.text">{{ selectedTag.color }}</span></dd></div>
                </dl>
            </section>
        </div>

        <div v-if="pendingDeletion" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeDeleteConfirmation">
            <section role="dialog" aria-modal="true" aria-labelledby="delete-tag-title" :class="[theme.surface, theme.border, 'w-full max-w-md rounded-lg border p-6 shadow-2xl']">
                <h2 id="delete-tag-title" :class="[theme.text, 'text-lg font-semibold']">Delete tag?</h2>
                <p :class="[theme.textMuted, 'mt-2 text-sm']">This will permanently delete <strong :class="theme.text">{{ pendingDeletion.name }}</strong> and remove it from associated tasks.</p>
                <p v-if="deleteError" class="mt-3 text-sm text-red-400" role="alert">{{ deleteError }}</p>
                <div :class="[theme.border, 'mt-6 flex justify-end gap-2 border-t pt-4']">
                    <button type="button" :disabled="isDeleting" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm']" @click="closeDeleteConfirmation">Cancel</button>
                    <button type="button" :disabled="isDeleting" class="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" @click="confirmDelete">{{ isDeleting ? 'Deleting...' : 'Delete tag' }}</button>
                </div>
            </section>
        </div>
    </main>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Plus, Pencil, RefreshCw, Tags, Trash2, X } from '@lucide/vue'
import useThemeStore from '@/stores/theme'
import useWorkspaceStore from '@/stores/workspace'
import { createTag, deleteTag, getWorkspaceTags, updateTag } from '@/services/tagService'

const themeStore = useThemeStore()
const workspaceStore = useWorkspaceStore()
const { theme } = storeToRefs(themeStore)
const { currentWorkspaceId } = storeToRefs(workspaceStore)
const tags = ref([])
const isLoading = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const isFormOpen = ref(false)
const editingTag = ref(null)
const selectedTag = ref(null)
const pendingDeletion = ref(null)
const pageError = ref('')
const formError = ref('')
const deleteError = ref('')
const successMessage = ref('')
const form = ref({ name: '', color: '#F59E0B' })
let requestId = 0

const loadTags = async () => {
    const currentRequest = ++requestId
    if (!currentWorkspaceId.value) {
        tags.value = []
        isLoading.value = false
        pageError.value = 'Choose a workspace to manage its tags.'
        return
    }
    isLoading.value = true
    pageError.value = ''
    try {
        const result = await getWorkspaceTags(currentWorkspaceId.value)
        if (currentRequest === requestId) tags.value = result
    } catch (error) {
        if (currentRequest === requestId) pageError.value = error.message ?? 'Unable to load workspace tags.'
    } finally {
        if (currentRequest === requestId) isLoading.value = false
    }
}

const openCreate = () => {
    editingTag.value = null
    form.value = { name: '', color: '#F59E0B' }
    formError.value = ''
    isFormOpen.value = true
}

const openEdit = (tag) => {
    editingTag.value = tag
    form.value = { name: tag.name, color: tag.color }
    formError.value = ''
    isFormOpen.value = true
}

const closeForm = () => {
    if (!isSaving.value) isFormOpen.value = false
}

const saveTag = async () => {
    if (!currentWorkspaceId.value) return
    isSaving.value = true
    formError.value = ''
    try {
        const data = { name: form.value.name, color: form.value.color }
        const saved = editingTag.value
            ? await updateTag(editingTag.value.id, data)
            : await createTag({ ...data, workspace_id: currentWorkspaceId.value })
        tags.value = editingTag.value
            ? tags.value.map((tag) => String(tag.id) === String(saved.id) ? { ...tag, ...saved } : tag)
            : [...tags.value, saved]
        if (selectedTag.value && String(selectedTag.value.id) === String(saved.id)) selectedTag.value = { ...selectedTag.value, ...saved }
        successMessage.value = `${saved.name} ${editingTag.value ? 'was updated' : 'was created'}.`
        isFormOpen.value = false
    } catch (error) {
        formError.value = error.message ?? 'Unable to save this tag.'
    } finally {
        isSaving.value = false
    }
}

const closeDeleteConfirmation = () => {
    if (isDeleting.value) return
    pendingDeletion.value = null
    deleteError.value = ''
}

const confirmDelete = async () => {
    if (!pendingDeletion.value) return
    isDeleting.value = true
    deleteError.value = ''
    try {
        const tag = pendingDeletion.value
        await deleteTag(tag.id)
        tags.value = tags.value.filter((item) => String(item.id) !== String(tag.id))
        if (String(selectedTag.value?.id) === String(tag.id)) selectedTag.value = null
        successMessage.value = `${tag.name} was deleted.`
        closeDeleteConfirmation()
    } catch (error) {
        deleteError.value = error.message ?? 'Unable to delete this tag.'
    } finally {
        isDeleting.value = false
    }
}

onMounted(loadTags)
watch(currentWorkspaceId, loadTags)
</script>
