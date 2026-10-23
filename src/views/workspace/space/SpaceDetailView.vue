<template>
    <main class="mx-auto max-w-7xl space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <button type="button" :class="[theme.textMuted, theme.primaryHover, 'inline-flex items-center gap-2 text-sm transition-colors']" @click="router.push({ name: 'workspace.spaces' })">
                <ArrowLeft class="h-4 w-4" /> All spaces
            </button>
            <button type="button" :disabled="isLoading" :class="[theme.textMuted, theme.primaryHover, 'rounded-md p-2 transition-colors disabled:opacity-50']" aria-label="Refresh space" title="Refresh space" @click="loadSpace">
                <RefreshCw :class="['h-4 w-4', isLoading ? 'animate-spin' : '']" />
            </button>
        </div>

        <div v-if="pageError" :class="[theme.border, 'flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3']" role="alert">
            <p class="text-sm text-red-400">{{ pageError }}</p>
            <button type="button" :class="[theme.text, theme.elevated, 'rounded-md px-3 py-1.5 text-xs font-medium']" @click="loadSpace">Retry</button>
        </div>
        <p v-if="successMessage" :class="[theme.border, theme.text, 'rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm']" role="status">{{ successMessage }}</p>

        <template v-if="space">
            <header :class="[theme.border, theme.surface, 'flex flex-col gap-5 rounded-xl border p-6 sm:flex-row sm:items-center']">
                <span class="grid h-14 w-14 shrink-0 place-items-center rounded-xl" :style="{ backgroundColor: space.color || '#F59E0B' }"><FolderKanban class="h-7 w-7 text-slate-950" /></span>
                <div class="min-w-0 flex-1">
                    <p :class="[theme.primary, 'text-xs font-semibold uppercase tracking-widest']">{{ currentWorkspace?.name || 'Workspace' }} / Space</p>
                    <h1 :class="[theme.text, 'mt-1 truncate text-3xl font-semibold']">{{ space.name }}</h1>
                    <p :class="[theme.textMuted, 'mt-2 text-sm']">{{ space.description || 'Organize folders, task lists, and work in this space.' }}</p>
                </div>
                <div :class="[theme.border, theme.bg, 'flex shrink-0 items-center gap-5 rounded-lg border px-4 py-3']">
                    <div><p :class="[theme.text, 'text-sm font-semibold']">{{ folders.length }}</p><p :class="[theme.textMuted, 'text-xs']">Folders</p></div>
                    <div><p :class="[theme.text, 'text-sm font-semibold']">{{ taskLists.length }}</p><p :class="[theme.textMuted, 'text-xs']">Lists</p></div>
                    <div><p :class="[theme.text, 'text-sm font-semibold']">{{ totalTasks }}</p><p :class="[theme.textMuted, 'text-xs']">Tasks</p></div>
                </div>
            </header>

            <section :class="[theme.border, theme.surface, 'overflow-hidden rounded-xl border']" aria-label="Space folders and task lists">
                <div :class="[theme.border, 'flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4']">
                    <div><h2 :class="[theme.text, 'text-base font-semibold']">Folders &amp; task lists</h2><p :class="[theme.textMuted, 'mt-1 text-xs']">Work in {{ space.name }}, grouped by status.</p></div>
                    <span :class="[theme.textMuted, 'text-xs']">{{ totalTasks }} {{ totalTasks === 1 ? 'task' : 'tasks' }}</span>
                </div>

                <div v-if="isLoading" :class="[theme.textMuted, 'px-5 py-16 text-center text-sm']">Loading space and tasks...</div>
                <div v-else-if="folders.length === 0 && ungroupedLists.length === 0" class="px-5 py-16 text-center">
                    <span :class="[theme.elevated, 'mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl']"><FolderKanban :class="[theme.primary, 'h-6 w-6']" /></span>
                    <p :class="[theme.text, 'text-sm font-semibold']">This space is empty</p>
                    <p :class="[theme.textMuted, 'mt-1 text-xs']">Create a task list to start organizing work.</p>
                    <button type="button" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold']" @click="openListForm()"><Plus class="h-4 w-4" /> New task list</button>
                </div>
                <div v-else class="space-y-6 p-5">
                    <section v-for="folder in folders" :key="folder.id" :class="[theme.border, theme.bg, 'overflow-hidden rounded-lg border']">
                        <div :class="[theme.border, 'flex items-center gap-3 border-b px-4 py-3']">
                            <span :class="[theme.elevated, 'grid h-8 w-8 place-items-center rounded-md']"><FolderKanban :class="[theme.primary, 'h-4 w-4']" /></span>
                            <div class="min-w-0 flex-1"><h3 :class="[theme.text, 'truncate text-sm font-semibold']">{{ folder.name }}</h3><p v-if="folder.description" :class="[theme.textMuted, 'mt-0.5 truncate text-xs']">{{ folder.description }}</p></div>
                            <span :class="[theme.textMuted, 'shrink-0 text-xs']">{{ folderLists(folder.id).length }} {{ folderLists(folder.id).length === 1 ? 'list' : 'lists' }}</span>
                            <button type="button" :class="[theme.textMuted, theme.primaryHover, 'rounded-md p-1.5']" :aria-label="`Add list to ${folder.name}`" title="Add list" @click="openListForm(folder)"><Plus class="h-4 w-4" /></button>
                        </div>
                        <div v-if="folderLists(folder.id).length" class="divide-y divide-slate-500/10">
                            <TaskListPanel v-for="list in folderLists(folder.id)" :key="list.id" :list="list" :statuses="statuses" :tasks="tasksByList[list.id] || []" :theme="theme" :collapsed-sections="collapsedSections" :saving-status-id="savingStatusId" @toggle-section="toggleSection" @add-task="openTaskForm(list)" @edit-list="openListForm(null, list)" @delete-list="pendingListDeletion = list" @edit-task="openTaskForm(list, $event)" @delete-task="pendingTaskDeletion = $event" @change-status="changeStatus" />
                        </div>
                        <p v-else :class="[theme.textMuted, 'px-4 py-4 text-xs']">No task lists in this folder yet.</p>
                    </section>

                    <section v-if="ungroupedLists.length" :class="[theme.border, theme.bg, 'overflow-hidden rounded-lg border']">
                        <div :class="[theme.border, 'flex items-center gap-3 border-b px-4 py-3']">
                            <span :class="[theme.elevated, 'grid h-8 w-8 place-items-center rounded-md']"><ListTodo :class="[theme.primary, 'h-4 w-4']" /></span>
                            <h3 :class="[theme.text, 'text-sm font-semibold']">Lists</h3>
                            <span :class="[theme.textMuted, 'ml-auto text-xs']">Not in a folder</span>
                            <button type="button" :class="[theme.textMuted, theme.primaryHover, 'rounded-md p-1.5']" aria-label="Add task list" title="Add task list" @click="openListForm()"><Plus class="h-4 w-4" /></button>
                        </div>
                        <div class="divide-y divide-slate-500/10">
                            <TaskListPanel v-for="list in ungroupedLists" :key="list.id" :list="list" :statuses="statuses" :tasks="tasksByList[list.id] || []" :theme="theme" :collapsed-sections="collapsedSections" :saving-status-id="savingStatusId" @toggle-section="toggleSection" @add-task="openTaskForm(list)" @edit-list="openListForm(null, list)" @delete-list="pendingListDeletion = list" @edit-task="openTaskForm(list, $event)" @delete-task="pendingTaskDeletion = $event" @change-status="changeStatus" />
                        </div>
                    </section>

                    <button v-if="folders.length && !ungroupedLists.length" type="button" :class="[theme.textMuted, theme.primaryHover, 'inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm']" @click="openListForm()"><Plus class="h-4 w-4" /> Add a list outside folders</button>
                    <p v-if="!statuses.length" :class="[theme.border, 'rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300']">Configure workspace statuses before creating tasks. Existing lists and tasks remain available.</p>
                </div>
            </section>
        </template>
        <div v-else-if="!isLoading && !pageError" :class="[theme.textMuted, 'py-16 text-center text-sm']">Space not found.</div>

        <div v-if="isListFormOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeListForm">
            <form role="dialog" aria-modal="true" aria-labelledby="task-list-form-title" :class="[theme.surface, theme.border, 'w-full max-w-lg rounded-lg border p-6 shadow-2xl']" @submit.prevent="saveList" @keydown.esc="closeListForm">
                <div class="mb-5 flex items-start justify-between gap-4"><div><h2 id="task-list-form-title" :class="[theme.text, 'text-lg font-semibold']">{{ editingList ? 'Edit task list' : 'Create a task list' }}</h2><p :class="[theme.textMuted, 'mt-1 text-sm']">{{ listFolder ? `In ${listFolder.name}` : 'Add an organized list to this space.' }}</p></div><button type="button" :disabled="isSavingList" :class="[theme.textMuted, 'rounded p-1']" aria-label="Close list form" @click="closeListForm"><X class="h-5 w-5" /></button></div>
                <p v-if="listFormError" class="mb-4 text-sm text-red-400" role="alert">{{ listFormError }}</p>
                <label class="block"><span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Name</span><input v-model.trim="listForm.name" type="text" maxlength="255" required autofocus :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400']" placeholder="e.g. Product backlog" /></label>
                <label class="mt-4 block"><span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Description <span :class="[theme.textMuted, 'font-normal']">(optional)</span></span><textarea v-model.trim="listForm.description" rows="3" :class="[theme.bg, theme.text, theme.border, 'w-full resize-y rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400']" placeholder="What is this list for?"></textarea></label>
                <div :class="[theme.border, 'mt-6 flex justify-end gap-2 border-t pt-4']"><button type="button" :disabled="isSavingList" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm']" @click="closeListForm">Cancel</button><button type="submit" :disabled="isSavingList" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'min-w-32 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60']">{{ isSavingList ? 'Saving...' : editingList ? 'Save changes' : 'Create list' }}</button></div>
            </form>
        </div>

        <div v-if="isTaskFormOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeTaskForm">
            <form role="dialog" aria-modal="true" aria-labelledby="task-form-title" :class="[theme.surface, theme.border, 'w-full max-w-lg rounded-lg border p-6 shadow-2xl']" @submit.prevent="saveTask" @keydown.esc="closeTaskForm">
                <div class="mb-5 flex items-start justify-between gap-4"><div><h2 id="task-form-title" :class="[theme.text, 'text-lg font-semibold']">{{ editingTask ? 'Edit task' : 'Create a task' }}</h2><p :class="[theme.textMuted, 'mt-1 text-sm']">In {{ taskFormList?.name }}</p></div><button type="button" :disabled="isSavingTask" :class="[theme.textMuted, 'rounded p-1']" aria-label="Close task form" @click="closeTaskForm"><X class="h-5 w-5" /></button></div>
                <p v-if="taskFormError" class="mb-4 text-sm text-red-400" role="alert">{{ taskFormError }}</p>
                <div class="space-y-4">
                    <label class="block"><span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Task name</span><input v-model.trim="taskForm.title" type="text" maxlength="255" required autofocus :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400']" placeholder="What needs to be done?" /></label>
                    <label class="block"><span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Description <span :class="[theme.textMuted, 'font-normal']">(optional)</span></span><textarea v-model.trim="taskForm.description" rows="3" :class="[theme.bg, theme.text, theme.border, 'w-full resize-y rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400']"></textarea></label>
                    <div class="grid gap-4 sm:grid-cols-2">
                        <label class="block"><span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Status</span><select v-model="taskForm.status_id" required :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400']"><option v-for="status in statuses" :key="status.id" :value="status.id">{{ status.name }}</option></select></label>
                        <label class="block"><span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Priority</span><select v-model="taskForm.priority_id" required :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400']"><option v-for="priority in priorities" :key="priority.id" :value="priority.id">{{ priority.name }}</option></select></label>
                        <label class="block"><span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Due date <span :class="[theme.textMuted, 'font-normal']">(optional)</span></span><input v-model="taskForm.due_at" type="date" :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400']" /></label>
                        <label class="block"><span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Estimate (minutes)</span><input v-model.number="taskForm.estimate_minutes" type="number" min="0" :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400']" placeholder="0" /></label>
                    </div>
                </div>
                <div :class="[theme.border, 'mt-6 flex justify-end gap-2 border-t pt-4']"><button type="button" :disabled="isSavingTask" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm']" @click="closeTaskForm">Cancel</button><button type="submit" :disabled="isSavingTask || !statuses.length || !priorities.length" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'min-w-32 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60']">{{ isSavingTask ? 'Saving...' : editingTask ? 'Save changes' : 'Create task' }}</button></div>
            </form>
        </div>

        <div v-if="pendingListDeletion || pendingTaskDeletion" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeDeleteConfirmation">
            <section role="dialog" aria-modal="true" aria-labelledby="delete-item-title" :class="[theme.surface, theme.border, 'w-full max-w-md rounded-lg border p-6 shadow-2xl']">
                <h2 id="delete-item-title" :class="[theme.text, 'text-lg font-semibold']">Delete {{ pendingListDeletion ? 'task list' : 'task' }}?</h2>
                <p :class="[theme.textMuted, 'mt-2 text-sm']">This will permanently delete <strong :class="theme.text">{{ pendingListDeletion?.name || pendingTaskDeletion?.title }}</strong>.</p>
                <p v-if="deleteError" class="mt-3 text-sm text-red-400" role="alert">{{ deleteError }}</p>
                <div :class="[theme.border, 'mt-6 flex justify-end gap-2 border-t pt-4']"><button type="button" :disabled="isDeletingItem" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm']" @click="closeDeleteConfirmation">Cancel</button><button type="button" :disabled="isDeletingItem" class="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" @click="deletePendingItem">{{ isDeletingItem ? 'Deleting...' : 'Delete' }}</button></div>
            </section>
        </div>
    </main>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronRight, Circle, FolderKanban, ListTodo, Pencil, Plus, RefreshCw, Trash2, X } from '@lucide/vue'
import useThemeStore from '@/stores/theme'
import useWorkspaceStore from '@/stores/workspace'
import { getSpace } from '@/services/spaceService'
import { getSpaceFolders } from '@/services/folderService'
import { createTaskList, deleteTaskList, getSpaceTaskLists, updateTaskList } from '@/services/taskListService'
import { changeTaskPriority, changeTaskStatus, createTask, deleteTask, getTaskListTasks, updateTask } from '@/services/taskService'
import { getWorkspaceStatuses } from '@/services/statusService'
import { getWorkspacePriorities } from '@/services/priorityService'

const TaskListPanel = defineComponent({
    props: {
        list: { type: Object, required: true },
        statuses: { type: Array, default: () => [] },
        tasks: { type: Array, default: () => [] },
        theme: { type: Object, required: true },
        collapsedSections: { type: Object, required: true },
        savingStatusId: { type: [String, Number], default: null },
    },
    emits: ['toggle-section', 'add-task', 'edit-list', 'delete-list', 'edit-task', 'delete-task', 'change-status'],
    setup(props, { emit }) {
        const groupedTasks = computed(() => props.statuses.map((status) => ({
            status,
            tasks: props.tasks.filter((task) => String(task.status?.id ?? task.status_id) === String(status.id)),
        })))
        const hiddenTasks = computed(() => props.tasks.filter((task) => !props.statuses.some((status) => String(status.id) === String(task.status?.id ?? task.status_id))))
        const groups = computed(() => hiddenTasks.value.length
            ? [...groupedTasks.value, { status: { id: 'unassigned', name: 'Other' }, tasks: hiddenTasks.value }]
            : groupedTasks.value)
        const sectionKey = (statusId) => `${props.list.id}:${statusId}`
        const sectionCollapsed = (statusId) => Boolean(props.collapsedSections[sectionKey(statusId)])

        return () => h('section', { class: 'px-4 py-3' }, [
            h('div', { class: 'mb-3 flex flex-wrap items-center gap-2' }, [
                h(ListTodo, { class: `${props.theme.primary} h-4 w-4 shrink-0` }),
                h('h4', { class: `min-w-0 flex-1 truncate text-sm font-semibold ${props.theme.text}` }, props.list.name),
                h('span', { class: `text-xs ${props.theme.textMuted}` }, `${props.tasks.length}`),
                h('button', { type: 'button', class: `rounded-md p-1.5 ${props.theme.textMuted} ${props.theme.primaryHover}`, title: 'Add task', 'aria-label': `Add task to ${props.list.name}`, onClick: () => emit('add-task') }, [h(Plus, { class: 'h-4 w-4' })]),
                h('button', { type: 'button', class: `rounded-md p-1.5 ${props.theme.textMuted} ${props.theme.primaryHover}`, title: 'Edit list', 'aria-label': `Edit ${props.list.name}`, onClick: () => emit('edit-list') }, [h(Pencil, { class: 'h-4 w-4' })]),
                h('button', { type: 'button', class: 'rounded-md p-1.5 text-red-400 hover:bg-red-500/10', title: 'Delete list', 'aria-label': `Delete ${props.list.name}`, onClick: () => emit('delete-list') }, [h(Trash2, { class: 'h-4 w-4' })]),
            ]),
            groups.value.length
                ? h('div', { class: 'space-y-3' }, groups.value.map(({ status, tasks }) => {
                    const collapsed = sectionCollapsed(status.id)
                    return h('section', { key: sectionKey(status.id), class: `overflow-hidden rounded-md border ${props.theme.border}` }, [
                        h('button', {
                            type: 'button',
                            class: `flex w-full items-center gap-2 px-3 py-2 text-left ${props.theme.elevated} ${props.theme.primaryHover}`,
                            'aria-expanded': String(!collapsed),
                            onClick: () => emit('toggle-section', sectionKey(status.id)),
                        }, [
                            h(collapsed ? ChevronRight : ChevronDown, { class: `h-4 w-4 ${props.theme.textMuted}` }),
                            h('span', { class: `text-xs font-semibold ${props.theme.text}` }, status.name),
                            h('span', { class: `text-[10px] ${props.theme.textMuted}` }, String(tasks.length)),
                        ]),
                        !collapsed
                            ? tasks.length
                                ? h('div', { class: 'overflow-x-auto' }, [
                                    h('table', { class: 'w-full min-w-[640px] text-left' }, [
                                        h('thead', {}, [h('tr', { class: `border-t ${props.theme.border}` }, [
                                            h('th', { class: `px-3 py-2 text-[10px] font-medium uppercase tracking-wide ${props.theme.textMuted}` }, 'Task'),
                                            h('th', { class: `px-3 py-2 text-[10px] font-medium uppercase tracking-wide ${props.theme.textMuted}` }, 'Status'),
                                            h('th', { class: `px-3 py-2 text-[10px] font-medium uppercase tracking-wide ${props.theme.textMuted}` }, 'Priority'),
                                            h('th', { class: `px-3 py-2 text-[10px] font-medium uppercase tracking-wide ${props.theme.textMuted}` }, 'Due date'),
                                            h('th', { class: `w-20 px-3 py-2 text-[10px] font-medium uppercase tracking-wide ${props.theme.textMuted}` }, 'Actions'),
                                        ])]),
                                        h('tbody', {}, tasks.map((task) => h('tr', { key: task.id, class: `border-t ${props.theme.border} ${props.theme.primaryHover}` }, [
                                            h('td', { class: 'max-w-0 px-3 py-2' }, [
                                                h('button', { type: 'button', class: `flex max-w-full items-center gap-2 text-left text-sm ${props.theme.text}`, onClick: () => emit('edit-task', task) }, [
                                                    h(task.completed_at || status.type === 'closed' ? CheckCircle2 : Circle, { class: `h-4 w-4 shrink-0 ${task.completed_at || status.type === 'closed' ? 'text-emerald-400' : props.theme.textMuted}` }),
                                                    h('span', { class: 'truncate' }, task.title),
                                                ]),
                                            ]),
                                            h('td', { class: 'px-3 py-2' }, [
                                                h('select', {
                                                    value: task.status?.id ?? task.status_id ?? status.id,
                                                    disabled: props.savingStatusId === task.id,
                                                    class: `max-w-36 rounded-md border px-2 py-1 text-xs ${props.theme.border} ${props.theme.bg} ${props.theme.text} disabled:opacity-50`,
                                                    'aria-label': `Status for ${task.title}`,
                                                    onChange: (event) => emit('change-status', task, event.target.value),
                                                }, props.statuses.map((item) => h('option', { key: item.id, value: item.id }, item.name))),
                                            ]),
                                            h('td', { class: `px-3 py-2 text-xs ${props.theme.textMuted}` }, task.priority?.name || '—'),
                                            h('td', { class: `px-3 py-2 text-xs ${props.theme.textMuted}` }, task.due_at ? new Date(task.due_at).toLocaleDateString() : '—'),
                                            h('td', { class: 'px-3 py-2' }, [
                                                h('div', { class: 'flex items-center gap-1' }, [
                                                    h('button', { type: 'button', class: `rounded p-1 ${props.theme.textMuted} ${props.theme.primaryHover}`, title: 'Edit task', 'aria-label': `Edit ${task.title}`, onClick: () => emit('edit-task', task) }, [h(Pencil, { class: 'h-3.5 w-3.5' })]),
                                                    h('button', { type: 'button', class: 'rounded p-1 text-red-400 hover:bg-red-500/10', title: 'Delete task', 'aria-label': `Delete ${task.title}`, onClick: () => emit('delete-task', task) }, [h(Trash2, { class: 'h-3.5 w-3.5' })]),
                                                ]),
                                            ]),
                                        ]))),
                                    ]),
                                ])
                                : h('p', { class: `border-t px-3 py-3 text-xs ${props.theme.border} ${props.theme.textMuted}` }, 'No tasks in this section.')
                            : null,
                    ])
                }))
                : h('p', { class: `rounded-md px-2 py-3 text-xs ${props.theme.textMuted}` }, 'Add workspace statuses to group tasks into sections.'),
        ])
    },
})

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const workspaceStore = useWorkspaceStore()
const { theme } = storeToRefs(themeStore)
const { currentWorkspace } = storeToRefs(workspaceStore)
const space = ref(null)
const folders = ref([])
const taskLists = ref([])
const tasksByList = ref({})
const statuses = ref([])
const priorities = ref([])
const isLoading = ref(true)
const pageError = ref('')
const successMessage = ref('')
const collapsedSections = ref({})
const savingStatusId = ref(null)
const isListFormOpen = ref(false)
const isTaskFormOpen = ref(false)
const isSavingList = ref(false)
const isSavingTask = ref(false)
const isDeletingItem = ref(false)
const editingList = ref(null)
const listFolder = ref(null)
const taskFormList = ref(null)
const editingTask = ref(null)
const pendingListDeletion = ref(null)
const pendingTaskDeletion = ref(null)
const listFormError = ref('')
const taskFormError = ref('')
const deleteError = ref('')
const listForm = ref({ name: '', description: '' })
const taskForm = ref(emptyTaskForm())
let requestId = 0

function emptyTaskForm() {
    return { title: '', description: '', status_id: '', priority_id: '', due_at: '', estimate_minutes: null }
}

const folderLists = (folderId) => taskLists.value.filter((list) => String(list.folder?.id) === String(folderId))
const ungroupedLists = computed(() => taskLists.value.filter((list) => !list.folder?.id))
const totalTasks = computed(() => Object.values(tasksByList.value).reduce((total, tasks) => total + tasks.length, 0))

const loadSpace = async () => {
    const currentRequest = ++requestId
    isLoading.value = true
    pageError.value = ''
    space.value = null
    folders.value = []
    taskLists.value = []
    tasksByList.value = {}
    try {
        const [spaceData, folderData, listData] = await Promise.all([
            getSpace(route.params.spaceId),
            getSpaceFolders(route.params.spaceId),
            getSpaceTaskLists(route.params.spaceId),
        ])
        if (currentRequest !== requestId) return
        space.value = spaceData
        folders.value = [...folderData].sort((first, second) => Number(first.position) - Number(second.position))
        taskLists.value = [...listData].sort((first, second) => Number(first.position) - Number(second.position))
        const workspaceId = spaceData.workspace?.id ?? currentWorkspace.value?.id
        const [statusData, priorityData] = workspaceId
            ? await Promise.all([getWorkspaceStatuses(workspaceId), getWorkspacePriorities(workspaceId)])
            : [[], []]
        if (currentRequest !== requestId) return
        statuses.value = [...statusData].sort((first, second) => Number(first.position) - Number(second.position))
        priorities.value = [...priorityData].sort((first, second) => Number(first.level) - Number(second.level))
        const taskEntries = await Promise.all(taskLists.value.map(async (list) => [
            list.id,
            await getTaskListTasks(list.id),
        ]))
        if (currentRequest === requestId) tasksByList.value = Object.fromEntries(taskEntries)
    } catch (error) {
        if (currentRequest === requestId) pageError.value = error.message ?? 'Unable to load this space.'
    } finally {
        if (currentRequest === requestId) isLoading.value = false
    }
}

const refreshListTasks = async (listId) => {
    const tasks = await getTaskListTasks(listId)
    tasksByList.value = { ...tasksByList.value, [listId]: tasks }
}

const toggleSection = (key) => {
    collapsedSections.value = { ...collapsedSections.value, [key]: !collapsedSections.value[key] }
}

const openListForm = (folder = null, list = null) => {
    listFolder.value = folder
    editingList.value = list
    listForm.value = { name: list?.name ?? '', description: list?.description ?? '' }
    listFormError.value = ''
    isListFormOpen.value = true
}

const closeListForm = () => {
    if (!isSavingList.value) isListFormOpen.value = false
}

const saveList = async () => {
    if (!space.value) return
    isSavingList.value = true
    listFormError.value = ''
    try {
        const data = {
            name: listForm.value.name,
            description: listForm.value.description || null,
            space_id: space.value.id,
            folder_id: listFolder.value?.id ?? editingList.value?.folder?.id ?? null,
            position: editingList.value?.position ?? taskLists.value.length,
        }
        const saved = editingList.value
            ? await updateTaskList(editingList.value.id, data)
            : await createTaskList(data)
        taskLists.value = editingList.value
            ? taskLists.value.map((list) => list.id === saved.id ? { ...list, ...saved, folder: listFolder.value ? { id: listFolder.value.id, name: listFolder.value.name } : saved.folder ?? list.folder } : list)
            : [...taskLists.value, { ...saved, folder: listFolder.value ? { id: listFolder.value.id, name: listFolder.value.name } : saved.folder ?? null }]
        if (!editingList.value) tasksByList.value = { ...tasksByList.value, [saved.id]: [] }
        successMessage.value = `${saved.name} ${editingList.value ? 'was updated' : 'was created'}.`
        isListFormOpen.value = false
    } catch (error) {
        listFormError.value = error.message ?? 'Unable to save this task list.'
    } finally {
        isSavingList.value = false
    }
}

const openTaskForm = (list, task = null) => {
    taskFormList.value = list
    editingTask.value = task
    taskForm.value = task ? {
        title: task.title,
        description: task.description ?? '',
        status_id: task.status?.id ?? task.status_id ?? statuses.value[0]?.id ?? '',
        priority_id: task.priority?.id ?? task.priority_id ?? priorities.value[0]?.id ?? '',
        due_at: task.due_at ? task.due_at.slice(0, 10) : '',
        estimate_minutes: task.estimate_minutes ?? null,
    } : {
        ...emptyTaskForm(),
        status_id: statuses.value[0]?.id ?? '',
        priority_id: priorities.value[0]?.id ?? '',
    }
    taskFormError.value = ''
    isTaskFormOpen.value = true
}

const closeTaskForm = () => {
    if (!isSavingTask.value) isTaskFormOpen.value = false
}

const saveTask = async () => {
    const list = taskFormList.value
    if (!list) return
    isSavingTask.value = true
    taskFormError.value = ''
    try {
        const data = {
            title: taskForm.value.title,
            description: taskForm.value.description || null,
            due_at: taskForm.value.due_at || null,
            estimate_minutes: taskForm.value.estimate_minutes === '' ? null : taskForm.value.estimate_minutes,
        }
        if (editingTask.value) {
            await updateTask(editingTask.value.id, data)
            const previousStatusId = editingTask.value.status?.id ?? editingTask.value.status_id
            const previousPriorityId = editingTask.value.priority?.id ?? editingTask.value.priority_id
            if (String(previousStatusId) !== String(taskForm.value.status_id)) {
                await changeTaskStatus(editingTask.value.id, Number(taskForm.value.status_id))
            }
            if (String(previousPriorityId) !== String(taskForm.value.priority_id)) {
                await changeTaskPriority(editingTask.value.id, Number(taskForm.value.priority_id))
            }
            successMessage.value = `${data.title} was updated.`
        } else {
            await createTask({
                ...data,
                status_id: Number(taskForm.value.status_id),
                priority_id: Number(taskForm.value.priority_id),
                list_id: list.id,
                position: (tasksByList.value[list.id] || []).length,
            })
            successMessage.value = `${data.title} was created.`
        }
        await refreshListTasks(list.id)
        isTaskFormOpen.value = false
    } catch (error) {
        taskFormError.value = error.message ?? 'Unable to save this task.'
    } finally {
        isSavingTask.value = false
    }
}

const changeStatus = async (task, statusId) => {
    if (String(task.status?.id ?? task.status_id) === String(statusId)) return
    savingStatusId.value = task.id
    pageError.value = ''
    const previousStatus = task.status
    try {
        await changeTaskStatus(task.id, statusId)
        const status = statuses.value.find((item) => String(item.id) === String(statusId))
        const listId = task.list_id ?? task.task_list?.id
        if (listId && status) {
            tasksByList.value = {
                ...tasksByList.value,
                [listId]: (tasksByList.value[listId] || []).map((item) => item.id === task.id ? { ...item, status, status_id: status.id } : item),
            }
        }
        successMessage.value = 'Task status was updated.'
    } catch (error) {
        pageError.value = error.message ?? 'Unable to update task status.'
        if (previousStatus) await refreshListTasks(task.list_id ?? task.task_list?.id)
    } finally {
        savingStatusId.value = null
    }
}

const closeDeleteConfirmation = () => {
    if (isDeletingItem.value) return
    pendingListDeletion.value = null
    pendingTaskDeletion.value = null
    deleteError.value = ''
}

const deletePendingItem = async () => {
    isDeletingItem.value = true
    deleteError.value = ''
    try {
        if (pendingListDeletion.value) {
            const list = pendingListDeletion.value
            await deleteTaskList(list.id)
            taskLists.value = taskLists.value.filter((item) => item.id !== list.id)
            const nextTasks = { ...tasksByList.value }
            delete nextTasks[list.id]
            tasksByList.value = nextTasks
            successMessage.value = `${list.name} was deleted.`
        } else if (pendingTaskDeletion.value) {
            const task = pendingTaskDeletion.value
            await deleteTask(task.id)
            const listId = task.list_id ?? task.task_list?.id
            if (listId) tasksByList.value = { ...tasksByList.value, [listId]: (tasksByList.value[listId] || []).filter((item) => item.id !== task.id) }
            successMessage.value = `${task.title} was deleted.`
        }
        closeDeleteConfirmation()
    } catch (error) {
        deleteError.value = error.message ?? 'Unable to delete this item.'
    } finally {
        isDeletingItem.value = false
    }
}

onMounted(loadSpace)
watch(() => route.params.spaceId, loadSpace)
</script>
