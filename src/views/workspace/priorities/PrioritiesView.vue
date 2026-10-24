<template>
    <main class="mx-auto max-w-8xl space-y-6">
        <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p :class="[theme.primary, 'mb-2 text-xs font-semibold uppercase tracking-widest']">Workspace settings</p>
                <h1 :class="[theme.text, 'text-3xl font-semibold']">Priorities</h1>
                <p :class="[theme.textMuted, 'mt-2 max-w-2xl text-sm']">Define how urgent work is and the order used by task priority selectors.</p>
            </div>
            <button type="button" :disabled="!currentWorkspaceId" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50']" @click="openCreate">
                <Plus class="h-4 w-4" /> New priority
            </button>
        </header>

        <div v-if="pageError" :class="[theme.border, 'flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3']" role="alert">
            <p class="text-sm text-red-400">{{ pageError }}</p>
            <button type="button" :class="[theme.text, theme.elevated, 'rounded-md px-3 py-1.5 text-xs font-medium']" @click="loadPriorities">Retry</button>
        </div>
        <p v-if="successMessage" :class="[theme.border, theme.text, 'rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm']" role="status">{{ successMessage }}</p>

        <section :class="[theme.border, theme.surface, 'overflow-hidden rounded-lg border']" aria-label="Workspace priorities">
            <div :class="[theme.border, 'flex items-center justify-between gap-4 border-b px-5 py-4']">
                <div><h2 :class="[theme.text, 'text-sm font-semibold']">Priority levels</h2><p :class="[theme.textMuted, 'mt-1 text-xs']">Drag priorities or use the arrows to set their order in task lists.</p></div>
                <button type="button" :disabled="isLoading" :class="[theme.textMuted, theme.primaryHover, 'rounded-md p-2 transition-colors disabled:opacity-50']" aria-label="Refresh priorities" title="Refresh priorities" @click="loadPriorities">
                    <RefreshCw :class="['h-4 w-4', isLoading ? 'animate-spin' : '']" />
                </button>
            </div>

            <div v-if="isLoading" :class="[theme.textMuted, 'px-5 py-12 text-center text-sm']">Loading priorities...</div>
            <div v-else-if="priorities.length === 0" class="px-5 py-12 text-center">
                <span :class="[theme.elevated, 'mx-auto mb-4 grid h-11 w-11 place-items-center rounded-lg']"><Flag :class="[theme.primary, 'h-5 w-5']" /></span>
                <p :class="[theme.text, 'text-sm font-semibold']">No priorities yet</p>
                <p :class="[theme.textMuted, 'mt-1 text-xs']">Add levels such as Low, Normal, High, and Urgent.</p>
                <button type="button" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'mt-5 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold']" @click="openCreate"><Plus class="h-4 w-4" /> Create first priority</button>
            </div>
            <ul v-else :class="[theme.border, 'divide-y']">
                <li
                    v-for="(priority, index) in priorities"
                    :key="priority.id"
                    draggable="true"
                    :class="[theme.bg, draggingId === priority.id ? 'opacity-50' : '', 'group flex flex-col gap-3 px-5 py-4 transition-colors sm:flex-row sm:items-center']"
                    @dragstart="startDrag(priority.id)"
                    @dragover.prevent
                    @drop="dropPriority(priority.id)"
                    @dragend="draggingId = null"
                >
                    <button type="button" class="flex min-w-0 flex-1 items-center gap-3 text-left" :aria-label="`View ${priority.name} priority`" @click="showPriority(priority)">
                        <GripVertical :class="[theme.textMuted, 'h-4 w-4 shrink-0 cursor-grab']" aria-hidden="true" />
                        <span class="grid h-8 w-8 shrink-0 place-items-center rounded-md" :style="{ backgroundColor: priority.color }">
                            <Flag class="h-4 w-4 text-slate-950" />
                        </span>
                        <span :class="[theme.text, 'min-w-0 truncate text-sm font-semibold']">{{ priority.name }}</span>
                        <span :class="[theme.textMuted, 'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', theme.elevated]">Level {{ priority.level }}</span>
                        <span v-if="priority.icon" :class="[theme.textMuted, 'hidden text-xs sm:inline']">Icon: {{ priority.icon }}</span>
                    </button>
                    <div class="flex items-center justify-end gap-1">
                        <button type="button" :disabled="index === 0 || isReordering" :class="[theme.textMuted, theme.primaryHover, 'rounded p-1.5 disabled:cursor-not-allowed disabled:opacity-30']" :aria-label="`Move ${priority.name} up`" title="Move up" @click="movePriority(index, index - 1)"><ChevronUp class="h-4 w-4" /></button>
                        <button type="button" :disabled="index === priorities.length - 1 || isReordering" :class="[theme.textMuted, theme.primaryHover, 'rounded p-1.5 disabled:cursor-not-allowed disabled:opacity-30']" :aria-label="`Move ${priority.name} down`" title="Move down" @click="movePriority(index, index + 1)"><ChevronDown class="h-4 w-4" /></button>
                        <button type="button" :class="[theme.textMuted, theme.primaryHover, 'rounded p-2 transition-colors']" :aria-label="`Edit ${priority.name}`" title="Edit priority" @click="openEdit(priority)"><Pencil class="h-4 w-4" /></button>
                        <button type="button" :class="[theme.textMuted, 'rounded p-2 text-red-400 transition-colors hover:bg-red-500/10']" :aria-label="`Delete ${priority.name}`" title="Delete priority" @click="pendingDeletion = priority"><Trash2 class="h-4 w-4" /></button>
                    </div>
                </li>
            </ul>
            <div v-if="priorities.length" :class="[theme.border, 'border-t px-5 py-3']">
                <p :class="[theme.textMuted, 'text-xs']">Click a priority to view its details. The order here is used in task priority selectors.</p>
            </div>
        </section>

        <div v-if="selectedPriority" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="selectedPriority = null">
            <section role="dialog" aria-modal="true" aria-labelledby="priority-details-title" :class="[theme.surface, theme.border, 'w-full max-w-md rounded-lg border p-6 shadow-2xl']" @keydown.esc="selectedPriority = null">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex min-w-0 items-center gap-3">
                        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-md" :style="{ backgroundColor: selectedPriority.color }"><Flag class="h-5 w-5 text-slate-950" /></span>
                        <div><h2 id="priority-details-title" :class="[theme.text, 'text-lg font-semibold']">{{ selectedPriority.name }}</h2><p :class="[theme.textMuted, 'mt-0.5 text-xs']">Priority details</p></div>
                    </div>
                    <button type="button" :class="[theme.textMuted, 'rounded p-1']" aria-label="Close priority details" @click="selectedPriority = null"><X class="h-5 w-5" /></button>
                </div>
                <dl :class="[theme.border, 'mt-5 space-y-3 border-y py-4 text-sm']">
                    <div class="flex justify-between gap-4"><dt :class="theme.textMuted">Name</dt><dd :class="theme.text">{{ selectedPriority.name }}</dd></div>
                    <div class="flex justify-between gap-4"><dt :class="theme.textMuted">Level</dt><dd :class="theme.text">{{ selectedPriority.level }}</dd></div>
                    <div class="flex justify-between gap-4"><dt :class="theme.textMuted">Color</dt><dd class="flex items-center gap-2"><span class="h-3 w-3 rounded-full" :style="{ backgroundColor: selectedPriority.color }"></span><span :class="theme.text">{{ selectedPriority.color }}</span></dd></div>
                    <div class="flex justify-between gap-4"><dt :class="theme.textMuted">Icon</dt><dd :class="theme.text">{{ selectedPriority.icon || 'Default flag' }}</dd></div>
                </dl>
                <div class="mt-5 flex justify-end gap-2"><button type="button" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm font-medium']" @click="selectedPriority = null">Close</button><button type="button" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'rounded-md px-4 py-2 text-sm font-semibold']" @click="openEdit(selectedPriority)">Edit priority</button></div>
            </section>
        </div>

        <div v-if="isFormOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeForm">
            <form role="dialog" aria-modal="true" aria-labelledby="priority-form-title" :class="[theme.surface, theme.border, 'w-full max-w-lg rounded-lg border p-6 shadow-2xl']" @submit.prevent="savePriority" @keydown.esc="closeForm">
                <div class="mb-6 flex items-start justify-between gap-4">
                    <div><h2 id="priority-form-title" :class="[theme.text, 'text-lg font-semibold']">{{ editingPriority ? 'Edit priority' : 'Create a priority' }}</h2><p :class="[theme.textMuted, 'mt-1 text-sm']">Set the label, importance level, color, and optional icon.</p></div>
                    <button type="button" :disabled="isSaving" :class="[theme.textMuted, 'rounded p-1 disabled:opacity-50']" aria-label="Close priority form" @click="closeForm"><X class="h-5 w-5" /></button>
                </div>
                <p v-if="formError" class="mb-4 text-sm text-red-400" role="alert">{{ formError }}</p>
                <div class="space-y-4">
                    <label class="block"><span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Name</span><input v-model.trim="form.name" type="text" maxlength="255" required autofocus :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400']" placeholder="e.g. Urgent" /></label>
                    <label class="block"><span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Importance level</span><input v-model.number="form.level" type="number" min="0" step="1" required :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400']" /><span :class="[theme.textMuted, 'mt-1 block text-xs']">Higher numbers represent more urgent work.</span></label>
                    <label class="block"><span :class="[theme.text, 'mb-2 block text-sm font-medium']">Color</span><span class="flex flex-wrap items-center gap-2"><button v-for="color in colorOptions" :key="color" type="button" :aria-label="`Choose ${color}`" :aria-pressed="form.color === color" class="grid h-8 w-8 place-items-center rounded-full ring-offset-2 ring-offset-transparent transition-transform hover:scale-110" :class="form.color === color ? 'ring-2 ring-white' : ''" :style="{ backgroundColor: color }" @click="form.color = color"><Check v-if="form.color === color" class="h-4 w-4 text-slate-950" /></button><input v-model="form.color" type="color" aria-label="Choose custom priority color" class="h-8 w-9 cursor-pointer rounded border-0 bg-transparent p-0" /></span></label>
                    <label class="block"><span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Icon <span :class="[theme.textMuted, 'font-normal']">(optional)</span></span><input v-model.trim="form.icon" type="text" maxlength="255" :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400']" placeholder="e.g. flag" /></label>
                </div>
                <div :class="[theme.border, 'mt-6 flex justify-end gap-2 border-t pt-4']"><button type="button" :disabled="isSaving" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50']" @click="closeForm">Cancel</button><button type="submit" :disabled="isSaving" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'inline-flex min-w-32 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60']"><span v-if="isSaving" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>{{ isSaving ? 'Saving...' : editingPriority ? 'Save changes' : 'Create priority' }}</button></div>
            </form>
        </div>

        <div v-if="pendingDeletion" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeDeletion">
            <section role="dialog" aria-modal="true" aria-labelledby="delete-priority-title" :class="[theme.surface, theme.border, 'w-full max-w-md rounded-lg border p-6 shadow-2xl']">
                <div class="mb-5 flex items-start justify-between gap-4"><div><h2 id="delete-priority-title" :class="[theme.text, 'text-lg font-semibold']">Delete priority?</h2><p :class="[theme.textMuted, 'mt-2 text-sm']">Delete <strong :class="theme.text">{{ pendingDeletion.name }}</strong>? If tasks still use it, the server may reject the deletion.</p></div><button type="button" :disabled="isDeleting" :class="[theme.textMuted, 'rounded p-1']" aria-label="Close confirmation" @click="closeDeletion"><X class="h-5 w-5" /></button></div>
                <p v-if="deletionError" class="mb-4 text-sm text-red-400" role="alert">{{ deletionError }}</p>
                <div :class="[theme.border, 'flex justify-end gap-2 border-t pt-4']"><button type="button" :disabled="isDeleting" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50']" @click="closeDeletion">Cancel</button><button type="button" :disabled="isDeleting" class="inline-flex min-w-32 items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60" @click="removePriority"><span v-if="isDeleting" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>{{ isDeleting ? 'Deleting...' : 'Delete priority' }}</button></div>
            </section>
        </div>
    </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Check, ChevronDown, ChevronUp, Flag, GripVertical, Pencil, Plus, RefreshCw, Trash2, X } from '@lucide/vue'
import useThemeStore from '@/stores/theme'
import useWorkspaceStore from '@/stores/workspace'
import { createWorkspacePriority, deleteWorkspacePriority, getPriority, getWorkspacePriorities, reorderWorkspacePriorities, updateWorkspacePriority } from '@/services/priorityService'

const themeStore = useThemeStore()
const workspaceStore = useWorkspaceStore()
const { theme } = storeToRefs(themeStore)
const { currentWorkspaceId } = storeToRefs(workspaceStore)
const priorities = ref([])
const isLoading = ref(true)
const isSaving = ref(false)
const isDeleting = ref(false)
const isReordering = ref(false)
const isFormOpen = ref(false)
const editingPriority = ref(null)
const selectedPriority = ref(null)
const pendingDeletion = ref(null)
const draggingId = ref(null)
const pageError = ref('')
const formError = ref('')
const deletionError = ref('')
const successMessage = ref('')
const colorOptions = ['#64748B', '#3B82F6', '#8B5CF6', '#F59E0B', '#F97316', '#EF4444', '#EC4899', '#10B981']
const form = ref(defaultForm())
const normalizedPriorities = computed(() => [...priorities.value].sort((first, second) => Number(first.level) - Number(second.level)))
let requestVersion = 0

function defaultForm() {
    return { name: '', level: priorities.value.length, color: colorOptions[0], icon: '' }
}

const loadPriorities = async () => {
    if (!currentWorkspaceId.value) {
        priorities.value = []
        isLoading.value = false
        return
    }
    const version = ++requestVersion
    isLoading.value = true
    pageError.value = ''
    try {
        const result = await getWorkspacePriorities(currentWorkspaceId.value)
        if (version === requestVersion) priorities.value = [...result].sort((first, second) => Number(first.level) - Number(second.level))
    } catch (error) {
        if (version === requestVersion) pageError.value = error.message ?? 'Unable to load workspace priorities.'
    } finally {
        if (version === requestVersion) isLoading.value = false
    }
}

const openCreate = () => {
    editingPriority.value = null
    form.value = defaultForm()
    formError.value = ''
    isFormOpen.value = true
}

const openEdit = (priority) => {
    selectedPriority.value = null
    editingPriority.value = priority
    form.value = { name: priority.name, level: Number(priority.level), color: priority.color, icon: priority.icon ?? '' }
    formError.value = ''
    isFormOpen.value = true
}

const closeForm = () => {
    if (!isSaving.value) isFormOpen.value = false
}

const savePriority = async () => {
    if (!currentWorkspaceId.value) return
    isSaving.value = true
    formError.value = ''
    try {
        const data = {
            name: form.value.name,
            level: Number(form.value.level),
            color: form.value.color,
            icon: form.value.icon || null,
            ...(!editingPriority.value ? { workspace_id: currentWorkspaceId.value } : {}),
        }
        const saved = editingPriority.value
            ? await updateWorkspacePriority(editingPriority.value.id, data)
            : await createWorkspacePriority(data)
        priorities.value = editingPriority.value
            ? priorities.value.map((priority) => String(priority.id) === String(saved.id) ? { ...priority, ...saved } : priority)
            : [...priorities.value, saved]
        priorities.value = [...priorities.value].sort((first, second) => Number(first.level) - Number(second.level))
        successMessage.value = `${saved.name} ${editingPriority.value ? 'was updated' : 'was created'}.`
        isFormOpen.value = false
    } catch (error) {
        formError.value = error.message ?? 'Unable to save this priority.'
    } finally {
        isSaving.value = false
    }
}

const showPriority = async (priority) => {
    pageError.value = ''
    try {
        selectedPriority.value = await getPriority(priority.id)
    } catch (error) {
        pageError.value = error.message ?? 'Unable to load this priority.'
    }
}

const closeDeletion = () => {
    if (isDeleting.value) return
    pendingDeletion.value = null
    deletionError.value = ''
}

const removePriority = async () => {
    const priority = pendingDeletion.value
    if (!priority) return
    isDeleting.value = true
    deletionError.value = ''
    try {
        await deleteWorkspacePriority(priority.id)
        priorities.value = priorities.value.filter((item) => String(item.id) !== String(priority.id))
        pendingDeletion.value = null
        successMessage.value = `${priority.name} was deleted.`
    } catch (error) {
        deletionError.value = error.message ?? 'Unable to delete this priority.'
    } finally {
        isDeleting.value = false
    }
}

const persistOrder = async (nextPriorities, previousPriorities) => {
    if (!currentWorkspaceId.value) return
    isReordering.value = true
    pageError.value = ''
    const leveledPriorities = nextPriorities.map((priority, level) => ({ ...priority, level }))
    priorities.value = leveledPriorities
    try {
        await reorderWorkspacePriorities(currentWorkspaceId.value, leveledPriorities.map(({ id, level }) => ({ id, level })))
        successMessage.value = 'Priority order was updated.'
    } catch (error) {
        priorities.value = previousPriorities
        pageError.value = error.message ?? 'Unable to reorder priorities.'
    } finally {
        isReordering.value = false
    }
}

const movePriority = (fromIndex, toIndex) => {
    if (isReordering.value || toIndex < 0 || toIndex >= priorities.value.length) return
    const previousPriorities = [...normalizedPriorities.value]
    const nextPriorities = [...previousPriorities]
    const [priority] = nextPriorities.splice(fromIndex, 1)
    nextPriorities.splice(toIndex, 0, priority)
    persistOrder(nextPriorities, previousPriorities)
}

const startDrag = (priorityId) => { draggingId.value = priorityId }
const dropPriority = (targetId) => {
    const sourceIndex = normalizedPriorities.value.findIndex((priority) => String(priority.id) === String(draggingId.value))
    const targetIndex = normalizedPriorities.value.findIndex((priority) => String(priority.id) === String(targetId))
    draggingId.value = null
    if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) movePriority(sourceIndex, targetIndex)
}

watch(currentWorkspaceId, loadPriorities, { immediate: true })
</script>
