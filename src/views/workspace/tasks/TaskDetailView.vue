<template>
    <main class="mx-auto max-w-8xl space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <button type="button" :class="[theme.textMuted, theme.primaryHover, 'inline-flex items-center gap-2 text-sm transition-colors']" @click="goBack">
                <ArrowLeft class="h-4 w-4" /> {{ task?.task_list?.space?.name || 'Back to tasks' }}
            </button>
            <div class="flex items-center gap-2">
                <button v-if="task" type="button" :disabled="isDeleting" :class="[theme.textMuted, 'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50']" @click="showDeleteConfirmation = true">
                    <Trash2 class="h-4 w-4" /> Delete
                </button>
                <button type="button" :disabled="isLoading" :class="[theme.textMuted, theme.primaryHover, 'rounded-md p-2 transition-colors disabled:opacity-50']" aria-label="Refresh task" title="Refresh task" @click="loadTask">
                    <RefreshCw :class="['h-4 w-4', isLoading ? 'animate-spin' : '']" />
                </button>
            </div>
        </div>

        <div v-if="pageError" :class="[theme.border, 'flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3']" role="alert">
            <p class="text-sm text-red-400">{{ pageError }}</p>
            <button type="button" :class="[theme.text, theme.elevated, 'rounded-md px-3 py-1.5 text-xs font-medium']" @click="loadTask">Retry</button>
        </div>
        <p v-if="successMessage" :class="[theme.border, theme.text, 'rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm']" role="status">{{ successMessage }}</p>

        <div v-if="isLoading && !task" :class="[theme.textMuted, 'py-16 text-center text-sm']">Loading task...</div>
        <section v-else-if="task" :class="[theme.border, theme.surface, 'overflow-hidden rounded-xl border']">
            <header :class="[theme.border, 'flex flex-col gap-4 border-b px-5 py-5 sm:flex-row sm:items-start']">
                <button
                    type="button"
                    :class="['mt-1 shrink-0 rounded-full', task.completed_at ? 'text-emerald-400' : theme.textMuted]"
                    :aria-label="task.completed_at ? 'Reopen task' : 'Complete task'"
                    :title="task.completed_at ? 'Reopen task' : 'Complete task'"
                    @click="toggleCompletion"
                >
                    <CheckCircle2 v-if="task.completed_at" class="h-6 w-6" />
                    <Circle v-else class="h-6 w-6" />
                </button>
                <div class="min-w-0 flex-1">
                    <nav :class="[theme.textMuted, 'mb-3 flex flex-wrap items-center gap-1 text-xs']" aria-label="Task breadcrumbs">
                        <span>{{ currentWorkspace?.name || 'Workspace' }}</span><span>/</span>
                        <span>{{ task.task_list?.space?.name || 'Space' }}</span><span>/</span>
                        <span>{{ task.task_list?.name || 'Task list' }}</span>
                    </nav>
                    <input v-model.trim="editForm.title" maxlength="255" :class="[theme.text, theme.bg, 'w-full rounded-md border border-transparent px-1 py-1 text-2xl font-semibold outline-none focus:border-amber-400']" aria-label="Task title" />
                    <textarea v-model.trim="editForm.description" rows="4" :class="[theme.textMuted, theme.bg, theme.border, 'mt-3 w-full resize-y rounded-md border px-3 py-2 text-sm outline-none focus:border-amber-400']" placeholder="Add a description..." aria-label="Task description"></textarea>
                    <div class="mt-3 flex flex-wrap items-center gap-2">
                        <button type="button" :disabled="isSavingDetails" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'rounded-md px-3 py-1.5 text-xs font-semibold disabled:opacity-50']" @click="saveDetails">{{ isSavingDetails ? 'Saving...' : 'Save details' }}</button>
                    </div>
                </div>
            </header>

            <div class="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                <section class="space-y-6" aria-label="Task information">
                    <section :class="[theme.border, 'rounded-lg border p-4']" aria-labelledby="subtasks-heading">
                        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                            <button
                                type="button"
                                class="flex min-w-0 flex-1 items-center gap-2 text-left"
                                :aria-expanded="!subtasksCollapsed"
                                aria-controls="task-subtasks-content"
                                @click="subtasksCollapsed = !subtasksCollapsed"
                            >
                                <ChevronRight v-if="subtasksCollapsed" :class="[theme.textMuted, 'h-4 w-4 shrink-0']" />
                                <ChevronDown v-else :class="[theme.textMuted, 'h-4 w-4 shrink-0']" />
                                <span class="min-w-0 flex items-center justify-center gap-2">
                                    <span id="subtasks-heading" :class="[theme.text, 'block text-sm font-semibold']">Subtasks</span>
                                    <span :class="[theme.textMuted, 'block text-xs']">({{ completedSubtaskCount }} of {{ subtasks.length }} completed)</span>
                                </span>
                            </button>
                            <button type="button" :class="[theme.textMuted, theme.primaryHover, 'inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs']" @click="openSubtaskForm()"><Plus class="h-3.5 w-3.5" /> Add subtask</button>
                        </div>
                        <div v-if="!subtasksCollapsed" id="task-subtasks-content">
                            <div v-if="subtasks.length" class="space-y-1">
                                <div v-for="subtask in subtasks" :key="subtask.id" :class="[theme.primaryHover, 'flex items-center gap-2 rounded-md px-2 py-2']">
                                    <button type="button" :disabled="savingSubtaskId === subtask.id" :class="['shrink-0 rounded-full disabled:opacity-50', subtask.completed_at ? 'text-emerald-400' : theme.textMuted]" :aria-label="subtask.completed_at ? `Reopen ${subtask.title}` : `Complete ${subtask.title}`" @click="toggleSubtaskCompletion(subtask)">
                                        <CheckCircle2 v-if="subtask.completed_at" class="h-4 w-4" />
                                        <Circle v-else class="h-4 w-4" />
                                    </button>
                                    <button type="button" :class="[theme.text, 'min-w-0 flex-1 truncate text-left text-sm']" @click="openSubtask(subtask)">{{ subtask.title }}</button>
                                    <button type="button" :class="[theme.textMuted, theme.primaryHover, 'rounded p-1']" :aria-label="`Edit ${subtask.title}`" title="Edit subtask" @click="openSubtaskForm(subtask)"><Pencil class="h-3.5 w-3.5" /></button>
                                    <button type="button" :class="[theme.textMuted, 'rounded p-1 text-red-400 hover:bg-red-500/10']" :aria-label="`Delete ${subtask.title}`" title="Delete subtask" @click="pendingSubtaskDeletion = subtask"><Trash2 class="h-3.5 w-3.5" /></button>
                                </div>
                            </div>
                            <p v-else :class="[theme.textMuted, 'py-2 text-xs']">Break this task into smaller steps.</p>

                            <form v-if="isSubtaskFormOpen" :class="[theme.border, 'mt-3 space-y-3 border-t pt-3']" @submit.prevent="saveSubtask">
                                <p v-if="subtaskFormError" class="text-xs text-red-400" role="alert">{{ subtaskFormError }}</p>
                                <input v-model.trim="subtaskForm.title" type="text" maxlength="255" required autofocus :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-amber-400']" :placeholder="editingSubtask ? 'Subtask title' : 'What needs to be done?'" aria-label="Subtask title" />
                                <textarea v-model.trim="subtaskForm.description" rows="2" :class="[theme.bg, theme.text, theme.border, 'w-full resize-y rounded-md border px-3 py-2 text-sm outline-none focus:border-amber-400']" placeholder="Description (optional)" aria-label="Subtask description"></textarea>
                                <div class="flex justify-end gap-2">
                                    <button type="button" :disabled="isSavingSubtask" :class="[theme.textMuted, 'rounded-md px-3 py-1.5 text-xs']" @click="closeSubtaskForm">Cancel</button>
                                    <button type="submit" :disabled="isSavingSubtask" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'rounded-md px-3 py-1.5 text-xs font-semibold disabled:opacity-50']">{{ isSavingSubtask ? 'Saving...' : editingSubtask ? 'Save subtask' : 'Create subtask' }}</button>
                                </div>
                            </form>
                        </div>
                    </section>

                    <div>
                        <h2 :class="[theme.text, 'mb-3 text-sm font-semibold']">Tags</h2>
                        <div v-if="tags.length" class="flex flex-wrap gap-2">
                            <label v-for="tag in tags" :key="tag.id" class="inline-flex cursor-pointer items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium" :style="{ backgroundColor: tag.color, color: '#0f172a' }">
                                <input type="checkbox" :checked="task.tags?.some((item) => String(item.id) === String(tag.id))" :disabled="savingTagId === tag.id" class="accent-slate-900" @change="toggleTag(tag, $event.target.checked)" />
                                {{ tag.name }}
                            </label>
                        </div>
                        <p v-else :class="[theme.textMuted, 'text-xs']">No workspace tags are available yet.</p>
                    </div>

                    <div :class="[theme.border, 'rounded-lg border p-4']">
                        <h2 :class="[theme.text, 'mb-3 text-sm font-semibold']">Dates &amp; estimate</h2>
                        <div class="grid gap-4 sm:grid-cols-3">
                            <label class="block">
                                <span :class="[theme.textMuted, 'mb-1.5 block text-xs font-medium']">Start date</span>
                                <input type="date" :value="dateValue(task.start_at)" :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-2.5 py-2 text-sm outline-none focus:border-amber-400']" @change="saveDate('start_at', $event.target.value)" />
                            </label>
                            <label class="block">
                                <span :class="[theme.textMuted, 'mb-1.5 block text-xs font-medium']">Due date</span>
                                <input type="date" :value="dateValue(task.due_at)" :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-2.5 py-2 text-sm outline-none focus:border-amber-400']" @change="saveDate('due_at', $event.target.value)" />
                            </label>
                            <label class="block">
                                <span :class="[theme.textMuted, 'mb-1.5 block text-xs font-medium']">Estimate (minutes)</span>
                                <input v-model.number="editForm.estimate_minutes" type="number" min="0" :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-2.5 py-2 text-sm outline-none focus:border-amber-400']" @change="saveDetails" />
                            </label>
                        </div>
                    </div>
                </section>

                <aside :class="[theme.border, 'h-fit space-y-4 rounded-lg border p-4']" aria-label="Task properties">
                    <h2 :class="[theme.text, 'text-sm font-semibold']">Properties</h2>
                    <section :class="[theme.border, 'space-y-3 border-b pb-4']" aria-labelledby="assignees-heading">
                        <div class="flex items-center justify-between gap-2">
                            <h3 id="assignees-heading" :class="[theme.text, 'text-xs font-semibold']">Assignees</h3>
                            <span :class="[theme.textMuted, 'text-[10px]']">{{ assignees.length }} assigned</span>
                        </div>
                        <div v-if="assignees.length" class="flex flex-wrap gap-2">
                            <span v-for="assignee in assignees" :key="assignee.id" :class="[theme.elevated, 'inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-1.5']">
                                <span :class="[theme.primaryBg, theme.primaryText, 'relative grid h-6 w-6 place-items-center overflow-hidden rounded-full text-[9px] font-semibold']">
                                    <img v-if="assignee.avatar" :src="assignee.avatar" alt="" class="absolute inset-0 h-full w-full object-cover" @error="$event.target.hidden = true" />
                                    <span>{{ initials(assignee.name) }}</span>
                                </span>
                                <span :class="[theme.text, 'max-w-24 truncate text-[11px]']">{{ assignee.name }}</span>
                                <button type="button" :disabled="savingAssigneeId === assignee.id" :class="[theme.textMuted, 'rounded-full p-0.5 hover:text-red-400 disabled:opacity-50']" :aria-label="`Remove ${assignee.name}`" @click="toggleAssignee(assignee, false)"><X class="h-3 w-3" /></button>
                            </span>
                        </div>
                        <p v-else :class="[theme.textMuted, 'text-xs']">No one assigned yet.</p>
                        <details v-if="assignableUsers.length" :class="[theme.border, 'rounded-md border']">
                            <summary :class="[theme.textMuted, 'cursor-pointer list-none px-2.5 py-2 text-xs']"><Users class="mr-1 inline h-3.5 w-3.5" /> Assign people</summary>
                            <div :class="[theme.border, 'max-h-48 space-y-1 overflow-y-auto border-t p-2']">
                                <label v-for="member in assignableUsers" :key="member.id" :class="[theme.primaryHover, 'flex cursor-pointer items-center gap-2 rounded px-1.5 py-1.5']">
                                    <input type="checkbox" :checked="assignees.some((item) => String(item.id) === String(member.id))" :disabled="savingAssigneeId !== null" class="accent-amber-500" @change="toggleAssignee(member, $event.target.checked)" />
                                    <span :class="[theme.primaryBg, theme.primaryText, 'relative grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-full text-[9px] font-semibold']">
                                        <img v-if="member.avatar" :src="member.avatar" alt="" class="absolute inset-0 h-full w-full object-cover" @error="$event.target.hidden = true" />
                                        <span>{{ initials(member.name) }}</span>
                                    </span>
                                    <span :class="[theme.text, 'min-w-0 flex-1 truncate text-xs']">{{ member.name }}</span>
                                </label>
                            </div>
                        </details>
                    </section>
                    <label class="block">
                        <span :class="[theme.textMuted, 'mb-1.5 block text-xs font-medium']">Status</span>
                        <select :value="task.status_id" :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-2.5 py-2 text-sm outline-none focus:border-amber-400']" @change="saveStatus($event.target.value)">
                            <option v-for="status in statuses" :key="status.id" :value="status.id">{{ status.name }}</option>
                        </select>
                    </label>
                    <label class="block">
                        <span :class="[theme.textMuted, 'mb-1.5 block text-xs font-medium']">Priority</span>
                        <select :value="task.priority_id" :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-2.5 py-2 text-sm outline-none focus:border-amber-400']" @change="savePriority($event.target.value)">
                            <option v-for="priority in priorities" :key="priority.id" :value="priority.id">{{ priority.name }}</option>
                        </select>
                    </label>
                    <label class="block">
                        <span :class="[theme.textMuted, 'mb-1.5 block text-xs font-medium']">Task list</span>
                        <select :value="task.list_id" :disabled="isMoving || !lists.length" :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-2.5 py-2 text-sm outline-none focus:border-amber-400 disabled:opacity-50']" @change="moveToList($event.target.value)">
                            <option v-for="list in lists" :key="list.id" :value="list.id">{{ list.space?.name ? `${list.space.name} / ${list.name}` : list.name }}</option>
                        </select>
                        <span v-if="isMoving" :class="[theme.textMuted, 'mt-1 block text-[10px]']">Moving task...</span>
                    </label>
                    <div :class="[theme.border, 'border-t pt-3']">
                        <p :class="[theme.textMuted, 'text-xs']">Created by <span :class="theme.text">{{ task.creator?.name || 'Unknown' }}</span></p>
                    </div>
                </aside>
            </div>
        </section>

        <div v-if="showDeleteConfirmation && task" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="showDeleteConfirmation = false">
            <section role="dialog" aria-modal="true" aria-labelledby="delete-task-title" :class="[theme.surface, theme.border, 'w-full max-w-md rounded-lg border p-6 shadow-2xl']">
                <h2 id="delete-task-title" :class="[theme.text, 'text-lg font-semibold']">Delete task?</h2>
                <p :class="[theme.textMuted, 'mt-2 text-sm']">This will permanently delete <strong :class="theme.text">{{ task.title }}</strong>.</p>
                <p v-if="deleteError" class="mt-3 text-sm text-red-400" role="alert">{{ deleteError }}</p>
                <div :class="[theme.border, 'mt-6 flex justify-end gap-2 border-t pt-4']">
                    <button type="button" :disabled="isDeleting" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm']" @click="showDeleteConfirmation = false">Cancel</button>
                    <button type="button" :disabled="isDeleting" class="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" @click="deleteCurrentTask">{{ isDeleting ? 'Deleting...' : 'Delete task' }}</button>
                </div>

            </section>
        </div>
        <div v-if="pendingSubtaskDeletion" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeSubtaskDeleteConfirmation">
            <section role="dialog" aria-modal="true" aria-labelledby="delete-subtask-title" :class="[theme.surface, theme.border, 'w-full max-w-md rounded-lg border p-6 shadow-2xl']">
                <h2 id="delete-subtask-title" :class="[theme.text, 'text-lg font-semibold']">Delete subtask?</h2>
                <p :class="[theme.textMuted, 'mt-2 text-sm']">This will permanently delete <strong :class="theme.text">{{ pendingSubtaskDeletion.title }}</strong>.</p>
                <p v-if="subtaskDeleteError" class="mt-3 text-sm text-red-400" role="alert">{{ subtaskDeleteError }}</p>
                <div :class="[theme.border, 'mt-6 flex justify-end gap-2 border-t pt-4']">
                    <button type="button" :disabled="isDeletingSubtask" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm']" @click="closeSubtaskDeleteConfirmation">Cancel</button>
                    <button type="button" :disabled="isDeletingSubtask" class="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" @click="deleteCurrentSubtask">{{ isDeletingSubtask ? 'Deleting...' : 'Delete subtask' }}</button>
                </div>
            </section>
        </div>
    </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronRight, Circle, Pencil, Plus, RefreshCw, Trash2, Users, X } from '@lucide/vue'
import useThemeStore from '@/stores/theme'
import useWorkspaceStore from '@/stores/workspace'
import { assignTaskUsers, changeTaskPriority, changeTaskStatus, createTaskSubtask, deleteTask, deleteTaskSubtask, getTask, getTaskAssigneeOptions, getTaskAssignees, getTaskSubtasks, moveTask, removeTaskAssignee, toggleTaskCompletion, updateTask, updateTaskDueDate, updateTaskStartDate, updateTaskSubtask } from '@/services/taskService'
import { getSpaceTaskLists } from '@/services/taskListService'
import { getWorkspaceStatuses } from '@/services/statusService'
import { getWorkspacePriorities } from '@/services/priorityService'
import { attachTaskTags, getWorkspaceTags, removeTaskTag } from '@/services/tagService'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const workspaceStore = useWorkspaceStore()
const { theme } = storeToRefs(themeStore)
const { currentWorkspace } = storeToRefs(workspaceStore)
const task = ref(null)
const statuses = ref([])
const priorities = ref([])
const tags = ref([])
const lists = ref([])
const subtasks = ref([])
const assignees = ref([])
const assignableUsers = ref([])
const isLoading = ref(true)
const isSavingDetails = ref(false)
const isSavingSubtask = ref(false)
const isDeletingSubtask = ref(false)
const isMoving = ref(false)
const isDeleting = ref(false)
const savingTagId = ref(null)
const savingSubtaskId = ref(null)
const savingAssigneeId = ref(null)
const subtasksCollapsed = ref(false)
const isSubtaskFormOpen = ref(false)
const editingSubtask = ref(null)
const pendingSubtaskDeletion = ref(null)
const showDeleteConfirmation = ref(false)
const pageError = ref('')
const deleteError = ref('')
const subtaskFormError = ref('')
const subtaskDeleteError = ref('')
const successMessage = ref('')
const editForm = ref({ title: '', description: '', estimate_minutes: null })
const subtaskForm = ref({ title: '', description: '' })
let requestId = 0

const completedSubtaskCount = computed(() => subtasks.value.filter((subtask) => Boolean(subtask.completed_at)).length)
const initials = (name) => name?.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() ?? '?'

const loadTask = async () => {
    const currentRequest = ++requestId
    if (String(task.value?.id) !== String(route.params.taskId)) task.value = null
    isLoading.value = true
    pageError.value = ''
    successMessage.value = ''
    try {
        const taskData = await getTask(route.params.taskId)
        if (currentRequest !== requestId) return
        const workspaceId = taskData.workspace_id
        const [statusData, priorityData, tagData, listGroups, subtaskData, assigneeData, assignableUserData] = await Promise.all([
            getWorkspaceStatuses(workspaceId),
            getWorkspacePriorities(workspaceId),
            getWorkspaceTags(workspaceId),
            Promise.all((currentWorkspace.value?.spaces || []).map(async (space) => {
                const spaceLists = await getSpaceTaskLists(space.id)
                return spaceLists.map((list) => ({ ...list, space: { id: space.id, name: space.name } }))
            })),
            getTaskSubtasks(route.params.taskId),
            getTaskAssignees(route.params.taskId),
            getTaskAssigneeOptions(route.params.taskId),
        ])
        if (currentRequest !== requestId) return
        task.value = taskData
        statuses.value = statusData
        priorities.value = priorityData
        tags.value = tagData
        lists.value = listGroups.flat()
        subtasks.value = subtaskData
        assignees.value = assigneeData
        assignableUsers.value = assignableUserData
        if (taskData.task_list && !lists.value.some((list) => String(list.id) === String(taskData.list_id))) {
            lists.value.push({ ...taskData.task_list, space: taskData.task_list.space ?? null })
        }
        editForm.value = {
            title: taskData.title,
            description: taskData.description ?? '',
            estimate_minutes: taskData.estimate_minutes ?? null,
        }
    } catch (error) {
        if (currentRequest === requestId) pageError.value = error.message ?? 'Unable to load task details.'
    } finally {
        if (currentRequest === requestId) isLoading.value = false
    }
}

const dateValue = (value) => value ? String(value).slice(0, 10) : ''

const mergeTaskData = (saved) => {
    const current = task.value
    task.value = {
        ...current,
        ...saved,
        task_list: saved.task_list?.space ? saved.task_list : current.task_list,
        tags: saved.tags ?? current.tags,
    }
}

const goBack = () => {
    if (task.value?.parent_id) {
        router.push({ name: 'workspace.task.show', params: { taskId: task.value.parent_id } })
        return
    }
    const spaceId = task.value?.task_list?.space?.id
    if (spaceId) {
        router.push({ name: 'workspace.space.show', params: { spaceId } })
    } else {
        router.push({ name: 'workspace.spaces' })
    }
}

const openSubtask = (subtask) => {
    router.push({ name: 'workspace.task.show', params: { taskId: subtask.id } })
}

const openSubtaskForm = (subtask = null) => {
    subtasksCollapsed.value = false
    editingSubtask.value = subtask
    subtaskForm.value = { title: subtask?.title ?? '', description: subtask?.description ?? '' }
    subtaskFormError.value = ''
    isSubtaskFormOpen.value = true
}

const closeSubtaskForm = () => {
    if (isSavingSubtask.value) return
    isSubtaskFormOpen.value = false
    editingSubtask.value = null
}

const closeSubtaskDeleteConfirmation = () => {
    if (isDeletingSubtask.value) return
    pendingSubtaskDeletion.value = null
    subtaskDeleteError.value = ''
}

const saveSubtask = async () => {
    if (!task.value) return
    isSavingSubtask.value = true
    subtaskFormError.value = ''
    try {
        const data = {
            title: subtaskForm.value.title,
            description: subtaskForm.value.description || null,
        }
        if (editingSubtask.value) {
            const saved = await updateTaskSubtask(task.value.id, editingSubtask.value.id, data)
            subtasks.value = subtasks.value.map((item) => String(item.id) === String(saved.id) ? { ...item, ...saved } : item)
            successMessage.value = `${saved.title} was updated.`
        } else {
            const saved = await createTaskSubtask(task.value.id, { ...data, position: subtasks.value.length })
            subtasks.value = [...subtasks.value, saved]
            successMessage.value = `${saved.title} was created.`
        }
        isSubtaskFormOpen.value = false
        editingSubtask.value = null
    } catch (error) {
        subtaskFormError.value = error.message ?? 'Unable to save this subtask.'
    } finally {
        isSavingSubtask.value = false
    }
}

const toggleSubtaskCompletion = async (subtask) => {
    savingSubtaskId.value = subtask.id
    pageError.value = ''
    try {
        const saved = await toggleTaskCompletion(subtask.id)
        subtasks.value = subtasks.value.map((item) => String(item.id) === String(subtask.id) ? { ...item, ...saved } : item)
    } catch (error) {
        pageError.value = error.message ?? 'Unable to update subtask completion.'
    } finally {
        savingSubtaskId.value = null
    }
}

const deleteCurrentSubtask = async () => {
    if (!task.value || !pendingSubtaskDeletion.value) return
    isDeletingSubtask.value = true
    subtaskDeleteError.value = ''
    try {
        const deleted = pendingSubtaskDeletion.value
        await deleteTaskSubtask(task.value.id, deleted.id)
        subtasks.value = subtasks.value.filter((item) => String(item.id) !== String(deleted.id))
        pendingSubtaskDeletion.value = null
        successMessage.value = `${deleted.title} was deleted.`
    } catch (error) {
        subtaskDeleteError.value = error.message ?? 'Unable to delete this subtask.'
    } finally {
        isDeletingSubtask.value = false
    }
}

const toggleAssignee = async (member, shouldAssign) => {
    if (!task.value) return
    savingAssigneeId.value = member.id
    pageError.value = ''
    try {
        if (shouldAssign) {
            await assignTaskUsers(task.value.id, [member.id])
            if (!assignees.value.some((item) => String(item.id) === String(member.id))) {
                assignees.value = [...assignees.value, member]
            }
        } else {
            await removeTaskAssignee(task.value.id, member.id)
            assignees.value = assignees.value.filter((item) => String(item.id) !== String(member.id))
        }
    } catch (error) {
        pageError.value = error.message ?? `Unable to ${shouldAssign ? 'assign' : 'remove'} this person.`
    } finally {
        savingAssigneeId.value = null
    }
}

const saveDetails = async () => {
    if (!task.value) return
    isSavingDetails.value = true
    pageError.value = ''
    try {
        const saved = await updateTask(task.value.id, {
            title: editForm.value.title,
            description: editForm.value.description || null,
            estimate_minutes: editForm.value.estimate_minutes === '' ? null : editForm.value.estimate_minutes,
        })
        mergeTaskData(saved)
        successMessage.value = 'Task details were saved.'
    } catch (error) {
        pageError.value = error.message ?? 'Unable to save task details.'
    } finally {
        isSavingDetails.value = false
    }
}

const saveStatus = async (statusId) => {
    if (!task.value || String(statusId) === String(task.value.status_id)) return
    pageError.value = ''
    try {
        const saved = await changeTaskStatus(task.value.id, Number(statusId))
        mergeTaskData(saved)
    } catch (error) {
        pageError.value = error.message ?? 'Unable to update task status.'
    }
}

const savePriority = async (priorityId) => {
    if (!task.value || String(priorityId) === String(task.value.priority_id)) return
    pageError.value = ''
    try {
        const saved = await changeTaskPriority(task.value.id, Number(priorityId))
        mergeTaskData(saved)
    } catch (error) {
        pageError.value = error.message ?? 'Unable to update task priority.'
    }
}

const saveDate = async (field, value) => {
    if (!task.value) return
    pageError.value = ''
    try {
        const saved = field === 'start_at'
            ? await updateTaskStartDate(task.value.id, value || null)
            : await updateTaskDueDate(task.value.id, value || null)
        mergeTaskData(saved)
        successMessage.value = field === 'start_at' ? 'Start date was updated.' : 'Due date was updated.'
    } catch (error) {
        pageError.value = error.message ?? 'Unable to update task date.'
    }
}

const moveToList = async (listId) => {
    if (!task.value || String(listId) === String(task.value.list_id)) return
    isMoving.value = true
    pageError.value = ''
    try {
        const saved = await moveTask(task.value.id, listId)
        const destination = lists.value.find((list) => String(list.id) === String(listId))
        task.value = {
            ...task.value,
            ...saved,
            list_id: saved.list_id ?? destination.id,
            task_list: {
                id: destination.id,
                name: destination.name,
                space: destination.space ?? null,
            },
        }
        successMessage.value = `Task moved to ${destination.name}.`
    } catch (error) {
        pageError.value = error.message ?? 'Unable to move task.'
    } finally {
        isMoving.value = false
    }
}

const toggleCompletion = async () => {
    if (!task.value) return
    pageError.value = ''
    try {
        const saved = await toggleTaskCompletion(task.value.id)
        mergeTaskData(saved)
        successMessage.value = task.value.completed_at ? 'Task completed.' : 'Task reopened.'
    } catch (error) {
        pageError.value = error.message ?? 'Unable to update task completion.'
    }
}

const toggleTag = async (tag, shouldAttach) => {
    if (!task.value) return
    savingTagId.value = tag.id
    pageError.value = ''
    try {
        if (shouldAttach) {
            await attachTaskTags(task.value.id, [tag.id])
            task.value = { ...task.value, tags: [...(task.value.tags ?? []), tag] }
        } else {
            await removeTaskTag(task.value.id, tag.id)
            task.value = { ...task.value, tags: (task.value.tags ?? []).filter((item) => String(item.id) !== String(tag.id)) }
        }
    } catch (error) {
        pageError.value = error.message ?? 'Unable to update task tags.'
    } finally {
        savingTagId.value = null
    }
}

const deleteCurrentTask = async () => {
    if (!task.value) return
    isDeleting.value = true
    deleteError.value = ''
    try {
        await deleteTask(task.value.id)
        goBack()
    } catch (error) {
        deleteError.value = error.message ?? 'Unable to delete task.'
    } finally {
        isDeleting.value = false
    }
}

onMounted(loadTask)
watch(() => route.params.taskId, loadTask)
</script>
