<template>
    <main class="mx-auto max-w-8xl space-y-6">
        <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p :class="[theme.primary, 'mb-2 text-xs font-semibold uppercase tracking-widest']">Workspace settings</p>
                <h1 :class="[theme.text, 'text-3xl font-semibold']">Statuses</h1>
                <p :class="[theme.textMuted, 'mt-2 max-w-2xl text-sm']">Define the workflow sections used to organize tasks in every list.</p>
            </div>
            <button type="button" :disabled="!currentWorkspaceId" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50']" @click="openCreate">
                <Plus class="h-4 w-4" /> New status
            </button>
        </header>

        <div v-if="pageError" :class="[theme.border, 'flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3']" role="alert">
            <p class="text-sm text-red-400">{{ pageError }}</p>
            <button type="button" :class="[theme.text, theme.elevated, 'rounded-md px-3 py-1.5 text-xs font-medium']" @click="loadStatuses">Retry</button>
        </div>
        <p v-if="successMessage" :class="[theme.border, theme.text, 'rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm']" role="status">{{ successMessage }}</p>

        <section :class="[theme.border, theme.surface, 'overflow-hidden rounded-lg border']" aria-label="Workspace statuses">
            <div :class="[theme.border, 'flex items-center justify-between gap-4 border-b px-5 py-4']">
                <div><h2 :class="[theme.text, 'text-sm font-semibold']">Task workflow</h2><p :class="[theme.textMuted, 'mt-1 text-xs']">Drag statuses or use the arrows to change their order in task lists.</p></div>
                <button type="button" :disabled="isLoading" :class="[theme.textMuted, theme.primaryHover, 'rounded-md p-2 transition-colors disabled:opacity-50']" aria-label="Refresh statuses" title="Refresh statuses" @click="loadStatuses">
                    <RefreshCw :class="['h-4 w-4', isLoading ? 'animate-spin' : '']" />
                </button>
            </div>

            <div v-if="isLoading" :class="[theme.textMuted, 'px-5 py-12 text-center text-sm']">Loading statuses...</div>
            <div v-else-if="statuses.length === 0" class="px-5 py-12 text-center">
                <span :class="[theme.elevated, 'mx-auto mb-4 grid h-11 w-11 place-items-center rounded-lg']"><ListTodo :class="[theme.primary, 'h-5 w-5']" /></span>
                <p :class="[theme.text, 'text-sm font-semibold']">No statuses yet</p>
                <p :class="[theme.textMuted, 'mt-1 text-xs']">Add statuses like To do, In progress, and Done to build your workflow.</p>
                <button type="button" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'mt-5 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold']" @click="openCreate"><Plus class="h-4 w-4" /> Create first status</button>
            </div>
            <ul v-else :class="[theme.border, 'divide-y']">
                <li
                    v-for="(status, index) in statuses"
                    :key="status.id"
                    draggable="true"
                    :class="[theme.bg, draggingId === status.id ? 'opacity-50' : '', 'group flex flex-col gap-3 px-5 py-4 transition-colors sm:flex-row sm:items-center']"
                    @dragstart="startDrag(status.id)"
                    @dragover.prevent
                    @drop="dropStatus(status.id)"
                    @dragend="draggingId = null"
                >
                    <div class="flex min-w-0 flex-1 items-center gap-3">
                        <GripVertical :class="[theme.textMuted, 'h-4 w-4 shrink-0 cursor-grab']" aria-hidden="true" />
                        <span class="h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: status.color }"></span>
                        <span :class="[theme.text, 'min-w-0 truncate text-sm font-semibold']">{{ status.name }}</span>
                        <span :class="[status.type === 'closed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400', 'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide']">{{ status.type === 'closed' ? 'Completed' : 'Active' }}</span>
                        <span :class="[theme.textMuted, 'hidden text-xs sm:inline']">Status {{ index + 1 }}</span>
                    </div>
                    <div class="flex items-center justify-end gap-1">
                        <button type="button" :disabled="index === 0 || isReordering" :class="[theme.textMuted, theme.primaryHover, 'rounded p-1.5 disabled:cursor-not-allowed disabled:opacity-30']" :aria-label="`Move ${status.name} up`" title="Move up" @click="moveStatus(index, index - 1)"><ChevronUp class="h-4 w-4" /></button>
                        <button type="button" :disabled="index === statuses.length - 1 || isReordering" :class="[theme.textMuted, theme.primaryHover, 'rounded p-1.5 disabled:cursor-not-allowed disabled:opacity-30']" :aria-label="`Move ${status.name} down`" title="Move down" @click="moveStatus(index, index + 1)"><ChevronDown class="h-4 w-4" /></button>
                        <button type="button" :class="[theme.textMuted, theme.primaryHover, 'rounded p-2 transition-colors']" :aria-label="`Edit ${status.name}`" title="Edit status" @click="openEdit(status)"><Pencil class="h-4 w-4" /></button>
                        <button type="button" :class="[theme.textMuted, 'rounded p-2 text-red-400 transition-colors hover:bg-red-500/10']" :aria-label="`Delete ${status.name}`" title="Delete status" @click="pendingDeletion = status"><Trash2 class="h-4 w-4" /></button>
                    </div>
                </li>
            </ul>
            <div v-if="statuses.length" :class="[theme.border, 'border-t px-5 py-3']">
                <p :class="[theme.textMuted, 'text-xs']">Active statuses create open task sections. Completed statuses create completed sections in each list.</p>
            </div>
        </section>

        <div v-if="isFormOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeForm">
            <form role="dialog" aria-modal="true" aria-labelledby="status-form-title" :class="[theme.surface, theme.border, 'w-full max-w-lg rounded-lg border p-6 shadow-2xl']" @submit.prevent="saveStatus" @keydown.esc="closeForm">
                <div class="mb-6 flex items-start justify-between gap-4">
                    <div><h2 id="status-form-title" :class="[theme.text, 'text-lg font-semibold']">{{ editingStatus ? 'Edit status' : 'Create a status' }}</h2><p :class="[theme.textMuted, 'mt-1 text-sm']">Set a label, color, and whether this status is active or completed.</p></div>
                    <button type="button" :disabled="isSaving" :class="[theme.textMuted, 'rounded p-1 disabled:opacity-50']" aria-label="Close status form" @click="closeForm"><X class="h-5 w-5" /></button>
                </div>
                <p v-if="formError" class="mb-4 text-sm text-red-400" role="alert">{{ formError }}</p>
                <div class="space-y-4">
                    <label class="block"><span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Name</span><input v-model.trim="form.name" type="text" maxlength="255" required autofocus :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400']" placeholder="e.g. In review" /></label>
                    <label class="block"><span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Workflow type</span><select v-model="form.type" :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400']"><option value="open">Active — tasks are still in progress</option><option value="closed">Completed — tasks are done</option></select></label>
                    <label class="block"><span :class="[theme.text, 'mb-2 block text-sm font-medium']">Color</span><span class="flex flex-wrap items-center gap-2"><button v-for="color in colorOptions" :key="color" type="button" :aria-label="`Choose ${color}`" :aria-pressed="form.color === color" class="grid h-8 w-8 place-items-center rounded-full ring-offset-2 ring-offset-transparent transition-transform hover:scale-110" :class="form.color === color ? 'ring-2 ring-white' : ''" :style="{ backgroundColor: color }" @click="form.color = color"><Check v-if="form.color === color" class="h-4 w-4 text-slate-950" /></button><input v-model="form.color" type="color" aria-label="Choose custom status color" class="h-8 w-9 cursor-pointer rounded border-0 bg-transparent p-0" /></span></label>
                </div>
                <div :class="[theme.border, 'mt-6 flex justify-end gap-2 border-t pt-4']"><button type="button" :disabled="isSaving" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50']" @click="closeForm">Cancel</button><button type="submit" :disabled="isSaving" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'inline-flex min-w-28 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60']"><span v-if="isSaving" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>{{ isSaving ? 'Saving...' : editingStatus ? 'Save changes' : 'Create status' }}</button></div>
            </form>
        </div>

        <div v-if="pendingDeletion" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeDeletion">
            <section role="dialog" aria-modal="true" aria-labelledby="delete-status-title" :class="[theme.surface, theme.border, 'w-full max-w-md rounded-lg border p-6 shadow-2xl']">
                <div class="mb-5 flex items-start justify-between gap-4"><div><h2 id="delete-status-title" :class="[theme.text, 'text-lg font-semibold']">Delete status?</h2><p :class="[theme.textMuted, 'mt-2 text-sm']">Delete <strong :class="theme.text">{{ pendingDeletion.name }}</strong>? If tasks still use this status, the server may reject the deletion.</p></div><button type="button" :disabled="isDeleting" :class="[theme.textMuted, 'rounded p-1']" aria-label="Close confirmation" @click="closeDeletion"><X class="h-5 w-5" /></button></div>
                <p v-if="deletionError" class="mb-4 text-sm text-red-400" role="alert">{{ deletionError }}</p>
                <div :class="[theme.border, 'flex justify-end gap-2 border-t pt-4']"><button type="button" :disabled="isDeleting" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50']" @click="closeDeletion">Cancel</button><button type="button" :disabled="isDeleting" class="inline-flex min-w-28 items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60" @click="removeStatus"><span v-if="isDeleting" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>{{ isDeleting ? 'Deleting...' : 'Delete status' }}</button></div>
            </section>
        </div>
    </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Check, ChevronDown, ChevronUp, GripVertical, ListTodo, Pencil, Plus, RefreshCw, Trash2, X } from '@lucide/vue'
import useThemeStore from '@/stores/theme'
import useWorkspaceStore from '@/stores/workspace'
import { createWorkspaceStatus, deleteWorkspaceStatus, getWorkspaceStatuses, reorderWorkspaceStatuses, updateWorkspaceStatus } from '@/services/statusService'

const themeStore = useThemeStore()
const workspaceStore = useWorkspaceStore()
const { theme } = storeToRefs(themeStore)
const { currentWorkspaceId } = storeToRefs(workspaceStore)
const statuses = ref([])
const isLoading = ref(true)
const isSaving = ref(false)
const isDeleting = ref(false)
const isReordering = ref(false)
const isFormOpen = ref(false)
const editingStatus = ref(null)
const pendingDeletion = ref(null)
const draggingId = ref(null)
const pageError = ref('')
const formError = ref('')
const deletionError = ref('')
const successMessage = ref('')
const colorOptions = ['#64748B', '#3B82F6', '#8B5CF6', '#F59E0B', '#F97316', '#EF4444', '#EC4899', '#10B981']
const form = ref(defaultForm())
const normalizedStatuses = computed(() => [...statuses.value].sort((first, second) => Number(first.position) - Number(second.position)))
let requestVersion = 0

function defaultForm() {
    return { name: '', color: colorOptions[0], type: 'open' }
}

const loadStatuses = async () => {
    if (!currentWorkspaceId.value) {
        statuses.value = []
        isLoading.value = false
        return
    }
    const version = ++requestVersion
    isLoading.value = true
    pageError.value = ''
    try {
        const result = await getWorkspaceStatuses(currentWorkspaceId.value)
        if (version === requestVersion) statuses.value = [...result].sort((first, second) => Number(first.position) - Number(second.position))
    } catch (error) {
        if (version === requestVersion) pageError.value = error.message ?? 'Unable to load workspace statuses.'
    } finally {
        if (version === requestVersion) isLoading.value = false
    }
}

const openCreate = () => {
    editingStatus.value = null
    form.value = defaultForm()
    formError.value = ''
    isFormOpen.value = true
}

const openEdit = (status) => {
    editingStatus.value = status
    form.value = { name: status.name, color: status.color, type: status.type }
    formError.value = ''
    isFormOpen.value = true
}

const closeForm = () => {
    if (!isSaving.value) isFormOpen.value = false
}

const saveStatus = async () => {
    if (!currentWorkspaceId.value) return
    isSaving.value = true
    formError.value = ''
    try {
        const data = {
            ...form.value,
            position: editingStatus.value?.position ?? statuses.value.length,
            ...(!editingStatus.value ? { workspace_id: currentWorkspaceId.value } : {}),
        }
        const saved = editingStatus.value
            ? await updateWorkspaceStatus(editingStatus.value.id, data)
            : await createWorkspaceStatus(data)
        statuses.value = editingStatus.value
            ? statuses.value.map((status) => String(status.id) === String(saved.id) ? { ...status, ...saved } : status)
            : [...statuses.value, saved]
        statuses.value = [...statuses.value].sort((first, second) => Number(first.position) - Number(second.position))
        successMessage.value = `${saved.name} ${editingStatus.value ? 'was updated' : 'was created'}.`
        isFormOpen.value = false
    } catch (error) {
        formError.value = error.message ?? 'Unable to save this status.'
    } finally {
        isSaving.value = false
    }
}

const closeDeletion = () => {
    if (isDeleting.value) return
    pendingDeletion.value = null
    deletionError.value = ''
}

const removeStatus = async () => {
    const status = pendingDeletion.value
    if (!status) return
    isDeleting.value = true
    deletionError.value = ''
    try {
        await deleteWorkspaceStatus(status.id)
        statuses.value = statuses.value.filter((item) => String(item.id) !== String(status.id))
        pendingDeletion.value = null
        successMessage.value = `${status.name} was deleted.`
    } catch (error) {
        deletionError.value = error.message ?? 'Unable to delete this status.'
    } finally {
        isDeleting.value = false
    }
}

const persistOrder = async (nextStatuses, previousStatuses) => {
    if (!currentWorkspaceId.value) return
    isReordering.value = true
    pageError.value = ''
    const positionedStatuses = nextStatuses.map((status, position) => ({ ...status, position }))
    statuses.value = positionedStatuses
    try {
        await reorderWorkspaceStatuses(currentWorkspaceId.value, positionedStatuses.map(({ id, position }) => ({ id, position })))
        successMessage.value = 'Status order was updated.'
    } catch (error) {
        statuses.value = previousStatuses
        pageError.value = error.message ?? 'Unable to reorder statuses.'
    } finally {
        isReordering.value = false
    }
}

const moveStatus = (fromIndex, toIndex) => {
    if (isReordering.value || toIndex < 0 || toIndex >= statuses.value.length) return
    const previousStatuses = [...normalizedStatuses.value]
    const nextStatuses = [...previousStatuses]
    const [status] = nextStatuses.splice(fromIndex, 1)
    nextStatuses.splice(toIndex, 0, status)
    persistOrder(nextStatuses, previousStatuses)
}

const startDrag = (statusId) => { draggingId.value = statusId }
const dropStatus = (targetId) => {
    const sourceIndex = normalizedStatuses.value.findIndex((status) => String(status.id) === String(draggingId.value))
    const targetIndex = normalizedStatuses.value.findIndex((status) => String(status.id) === String(targetId))
    draggingId.value = null
    if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) moveStatus(sourceIndex, targetIndex)
}

watch(currentWorkspaceId, loadStatuses, { immediate: true })
</script>
