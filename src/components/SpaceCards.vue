<template>
    <main class="mx-auto max-w-7xl space-y-6">
        <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p :class="[theme.primary, 'mb-2 text-xs font-semibold uppercase tracking-widest']">Workspace structure</p>
                <h1 :class="[theme.text, 'text-3xl font-semibold']">Spaces</h1>
                <p :class="[theme.textMuted, 'mt-2 max-w-2xl text-sm']">Create a clear home for every team, project, or area of work.</p>
            </div>
            <button type="button" :disabled="!currentWorkspaceId" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50']" @click="openCreate">
                <Plus class="h-4 w-4" /> New space
            </button>
        </header>

        <div v-if="pageError" :class="[theme.border, 'flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3']" role="alert">
            <p class="text-sm text-red-400">{{ pageError }}</p>
            <button type="button" :class="[theme.text, theme.elevated, 'rounded-md px-3 py-1.5 text-xs font-medium']" @click="loadSpaces">Retry</button>
        </div>
        <p v-if="successMessage" :class="[theme.border, theme.text, 'rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm']" role="status">{{ successMessage }}</p>

        <section :class="[theme.border, theme.surface, 'overflow-hidden rounded-lg border']" aria-label="Workspace spaces">
            <div :class="[theme.border, 'flex items-center justify-between gap-4 border-b px-5 py-4']">
                <div>
                    <h2 :class="[theme.text, 'text-sm font-semibold']">All spaces</h2>
                    <p :class="[theme.textMuted, 'mt-1 text-xs']">Drag cards to arrange the order shown in your sidebar.</p>
                </div>
                <button type="button" :disabled="isLoading" :class="[theme.textMuted, theme.primaryHover, 'rounded-md p-2 transition-colors disabled:opacity-50']" aria-label="Refresh spaces" title="Refresh spaces" @click="loadSpaces">
                    <RefreshCw :class="['h-4 w-4', isLoading ? 'animate-spin' : '']" />
                </button>
            </div>

            <div v-if="isLoading" :class="[theme.textMuted, 'px-5 py-14 text-center text-sm']">Loading spaces...</div>
            <div v-else-if="spaces.length === 0" class="px-5 py-14 text-center">
                <span :class="[theme.elevated, 'mx-auto mb-4 grid h-12 w-12 place-items-center rounded-lg']"><FolderKanban :class="[theme.primary, 'h-6 w-6']" /></span>
                <p :class="[theme.text, 'text-sm font-semibold']">Create your first space</p>
                <p :class="[theme.textMuted, 'mt-1 text-xs']">Spaces keep related folders, lists, and tasks together.</p>
                <button type="button" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'mt-5 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors']" @click="openCreate"><Plus class="h-4 w-4" /> Create space</button>
            </div>
            <div v-else class="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                <article
                    v-for="(space, index) in spaces"
                    :key="space.id"
                    draggable="true"
                    :class="[theme.border, theme.bg, draggingId === space.id ? 'opacity-50' : '', 'group rounded-lg border p-5 transition-shadow hover:shadow-lg']"
                    @dragstart="startDrag(space.id)"
                    @dragover.prevent
                    @drop="dropSpace(space.id)"
                    @dragend="draggingId = null"
                >
                    <div class="mb-5 flex items-start justify-between gap-3">
                        <button type="button" class="flex min-w-0 items-center gap-3 text-left" :aria-label="`View ${space.name}`" @click="showSpace(space)">
                            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-md" :style="{ backgroundColor: space.color || '#F59E0B' }">
                                <component :is="spaceIcon(space.icon)" class="h-5 w-5 text-slate-950" />
                            </span>
                            <span class="min-w-0">
                                <span :class="[theme.text, 'block truncate text-base font-semibold']">{{ space.name }}</span>
                                <span :class="[theme.textMuted, 'mt-0.5 block text-xs']">Space {{ index + 1 }}</span>
                            </span>
                        </button>
                        <div class="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                            <button type="button" :disabled="index === 0 || isReordering" :class="[theme.textMuted, theme.primaryHover, 'rounded p-1.5 disabled:cursor-not-allowed disabled:opacity-30']" :aria-label="`Move ${space.name} up`" title="Move up" @click="moveSpace(index, index - 1)"><ChevronUp class="h-4 w-4" /></button>
                            <button type="button" :disabled="index === spaces.length - 1 || isReordering" :class="[theme.textMuted, theme.primaryHover, 'rounded p-1.5 disabled:cursor-not-allowed disabled:opacity-30']" :aria-label="`Move ${space.name} down`" title="Move down" @click="moveSpace(index, index + 1)"><ChevronDown class="h-4 w-4" /></button>
                        </div>
                    </div>
                    <button type="button" class="w-full text-left" :aria-label="`View ${space.name}`" @click="showSpace(space)">
                        <p :class="[theme.textMuted, 'line-clamp-3 min-h-15 text-sm leading-6']">{{ space.description || 'No description yet.' }}</p>
                    </button>
                    <div :class="[theme.border, 'mt-5 flex items-center justify-between border-t pt-4']">
                        <span :class="[theme.textMuted, 'text-xs']">{{ space.folders?.length ?? 0 }} {{ space.folders?.length === 1 ? 'folder' : 'folders' }}</span>
                        <div class="flex items-center gap-1">
                            <button type="button" :class="[theme.textMuted, theme.primaryHover, 'rounded p-2 transition-colors']" :aria-label="`Edit ${space.name}`" title="Edit space" @click="openEdit(space)"><Pencil class="h-4 w-4" /></button>
                            <button type="button" :class="[theme.textMuted, 'rounded p-2 text-red-400 transition-colors hover:bg-red-500/10']" :aria-label="`Delete ${space.name}`" title="Delete space" @click="pendingDeletion = space"><Trash2 class="h-4 w-4" /></button>
                        </div>
                    </div>
                </article>
            </div>
        </section>

        <div v-if="isFormOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeForm">
            <form role="dialog" aria-modal="true" aria-labelledby="space-form-title" :class="[theme.surface, theme.border, 'w-full max-w-lg rounded-lg border p-6 shadow-2xl']" @submit.prevent="saveSpace" @keydown.esc="closeForm">
                <div class="mb-6 flex items-start justify-between gap-4">
                    <div><h2 id="space-form-title" :class="[theme.text, 'text-lg font-semibold']">{{ editingSpace ? 'Edit space' : 'Create a space' }}</h2><p :class="[theme.textMuted, 'mt-1 text-sm']">{{ editingSpace ? 'Update this space’s name and description.' : 'Choose a name, description, and color for your new space.' }}</p></div>
                    <button type="button" :disabled="isSaving" :class="[theme.textMuted, 'rounded p-1 disabled:opacity-50']" aria-label="Close space form" @click="closeForm"><X class="h-5 w-5" /></button>
                </div>
                <p v-if="formError" class="mb-4 text-sm text-red-400" role="alert">{{ formError }}</p>
                <div class="space-y-4">
                    <label class="block"><span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Name</span><input v-model.trim="form.name" type="text" maxlength="255" required autofocus :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400 disabled:opacity-60']" placeholder="e.g. Product development" /><span v-if="validationErrors.name" class="mt-1 block text-xs text-red-400">{{ validationErrors.name }}</span></label>
                    <label class="block"><span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Description <span :class="[theme.textMuted, 'font-normal']">(optional)</span></span><textarea v-model.trim="form.description" rows="4" maxlength="1000" :class="[theme.bg, theme.text, theme.border, 'w-full resize-y rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400 disabled:opacity-60']" placeholder="What will this space be used for?"></textarea><span v-if="validationErrors.description" class="mt-1 block text-xs text-red-400">{{ validationErrors.description }}</span></label>
                    <label v-if="!editingSpace" class="block"><span :class="[theme.text, 'mb-2 block text-sm font-medium']">Color</span><span class="flex flex-wrap gap-2"><button v-for="color in colorOptions" :key="color" type="button" :aria-label="`Choose ${color}`" :aria-pressed="form.color === color" class="grid h-8 w-8 place-items-center rounded-full ring-offset-2 ring-offset-transparent transition-transform hover:scale-110" :class="form.color === color ? 'ring-2 ring-white' : ''" :style="{ backgroundColor: color }" @click="form.color = color"><Check v-if="form.color === color" class="h-4 w-4 text-slate-950" /></button></span></label>
                </div>
                <div :class="[theme.border, 'mt-6 flex justify-end gap-2 border-t pt-4']"><button type="button" :disabled="isSaving" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50']" @click="closeForm">Cancel</button><button type="submit" :disabled="isSaving" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'inline-flex min-w-28 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60']"><span v-if="isSaving" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>{{ isSaving ? 'Saving...' : editingSpace ? 'Save changes' : 'Create space' }}</button></div>
            </form>
        </div>

        <div v-if="selectedSpace" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="selectedSpace = null">
            <section role="dialog" aria-modal="true" aria-labelledby="space-details-title" :class="[theme.surface, theme.border, 'w-full max-w-xl rounded-lg border p-6 shadow-2xl']" @keydown.esc="selectedSpace = null">
                <div class="flex items-start justify-between gap-4"><div class="flex min-w-0 items-center gap-3"><span class="grid h-11 w-11 shrink-0 place-items-center rounded-md" :style="{ backgroundColor: selectedSpace.color || '#F59E0B' }"><component :is="spaceIcon(selectedSpace.icon)" class="h-5 w-5 text-slate-950" /></span><div class="min-w-0"><h2 id="space-details-title" :class="[theme.text, 'truncate text-lg font-semibold']">{{ selectedSpace.name }}</h2><p :class="[theme.textMuted, 'mt-0.5 text-xs']">Space details</p></div></div><button type="button" :class="[theme.textMuted, 'rounded p-1']" aria-label="Close space details" @click="selectedSpace = null"><X class="h-5 w-5" /></button></div>
                <p :class="[theme.textMuted, 'mt-5 text-sm leading-6']">{{ selectedSpace.description || 'No description yet.' }}</p>
                <div :class="[theme.border, 'mt-5 border-t pt-4']">
                    <div class="mb-3 flex items-center justify-between gap-3">
                        <h3 :class="[theme.text, 'text-sm font-semibold']">Folders</h3>
                        <button type="button" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors']" @click="openFolderCreate">
                            <Plus class="h-3.5 w-3.5" /> New folder
                        </button>
                    </div>

                    <div v-if="isFolderLoading" :class="[theme.textMuted, 'py-4 text-center text-xs']">Loading folders...</div>
                    <div v-else-if="folders.length === 0" class="rounded-md border border-dashed border-slate-500/30 px-3 py-5 text-center">
                        <p :class="[theme.text, 'text-sm font-medium']">No folders yet</p>
                        <p :class="[theme.textMuted, 'mt-1 text-xs']">Create a folder to organize related lists.</p>
                    </div>
                    <div v-else class="space-y-2">
                        <div v-for="(folder, index) in folders" :key="folder.id" draggable="true" :class="[theme.border, theme.bg, draggingFolderId === folder.id ? 'opacity-50' : '', 'rounded-md border p-3 transition-colors']" @dragstart="startFolderDrag(folder.id)" @dragover.prevent @drop="dropFolder(folder.id)" @dragend="draggingFolderId = null">
                            <div class="flex items-start justify-between gap-3">
                                <button type="button" class="min-w-0 flex-1 text-left" @click="showFolder(folder)">
                                    <div class="flex items-center gap-2">
                                        <span :class="[theme.elevated, 'grid h-7 w-7 place-items-center rounded-md']"><FolderKanban :class="[theme.primary, 'h-4 w-4']" /></span>
                                        <span :class="[theme.text, 'block truncate text-sm font-semibold']">{{ folder.name }}</span>
                                    </div>
                                    <p :class="[theme.textMuted, 'mt-1 line-clamp-2 text-xs leading-5']">{{ folder.description || 'No description yet.' }}</p>
                                </button>
                                <div class="flex items-center gap-1">
                                    <button type="button" :disabled="index === 0 || isFolderReordering" :class="[theme.textMuted, theme.primaryHover, 'rounded p-1.5 disabled:cursor-not-allowed disabled:opacity-30']" :aria-label="`Move ${folder.name} up`" title="Move up" @click="moveFolder(index, index - 1)"><ChevronUp class="h-3.5 w-3.5" /></button>
                                    <button type="button" :disabled="index === folders.length - 1 || isFolderReordering" :class="[theme.textMuted, theme.primaryHover, 'rounded p-1.5 disabled:cursor-not-allowed disabled:opacity-30']" :aria-label="`Move ${folder.name} down`" title="Move down" @click="moveFolder(index, index + 1)"><ChevronDown class="h-3.5 w-3.5" /></button>
                                </div>
                            </div>
                            <div :class="[theme.border, 'mt-3 flex items-center justify-between border-t pt-2']">
                                <span :class="[theme.textMuted, 'text-[10px]']">{{ folder.task_lists?.length ?? 0 }} {{ (folder.task_lists?.length ?? 0) === 1 ? 'list' : 'lists' }}</span>
                                <div class="flex items-center gap-1">
                                    <button type="button" :class="[theme.textMuted, theme.primaryHover, 'rounded p-1.5 transition-colors']" :aria-label="`Edit ${folder.name}`" title="Edit folder" @click="openFolderEdit(folder)"><Pencil class="h-3.5 w-3.5" /></button>
                                    <button type="button" :class="[theme.textMuted, 'rounded p-1.5 text-red-400 transition-colors hover:bg-red-500/10']" :aria-label="`Delete ${folder.name}`" title="Delete folder" @click="pendingFolderDeletion = folder"><Trash2 class="h-3.5 w-3.5" /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div :class="[theme.border, 'mt-5 flex justify-end gap-2 border-t pt-4']"><button type="button" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm font-medium']" @click="selectedSpace = null">Close</button><button type="button" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'rounded-md px-4 py-2 text-sm font-semibold']" @click="openEdit(selectedSpace)">Edit space</button></div>
            </section>
        </div>

        <div v-if="selectedFolder" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="selectedFolder = null">
            <section role="dialog" aria-modal="true" aria-labelledby="folder-details-title" :class="[theme.surface, theme.border, 'w-full max-w-md rounded-lg border p-6 shadow-2xl']" @keydown.esc="selectedFolder = null">
                <div class="flex items-start justify-between gap-4"><div class="flex min-w-0 items-center gap-3"><span :class="[theme.elevated, 'grid h-11 w-11 shrink-0 place-items-center rounded-md']"><FolderKanban :class="[theme.primary, 'h-5 w-5']" /></span><div class="min-w-0"><h2 id="folder-details-title" :class="[theme.text, 'truncate text-lg font-semibold']">{{ selectedFolder.name }}</h2><p :class="[theme.textMuted, 'mt-0.5 text-xs']">Folder details</p></div></div><button type="button" :class="[theme.textMuted, 'rounded p-1']" aria-label="Close folder details" @click="selectedFolder = null"><X class="h-5 w-5" /></button></div>
                <p :class="[theme.textMuted, 'mt-5 text-sm leading-6']">{{ selectedFolder.description || 'No description yet.' }}</p>
                <div :class="[theme.border, 'mt-5 border-t pt-4']">
                    <p :class="[theme.text, 'text-sm font-semibold']">Lists</p>
                    <p :class="[theme.textMuted, 'mt-1 text-xs']">{{ selectedFolder.task_lists?.length ?? 0 }} {{ (selectedFolder.task_lists?.length ?? 0) === 1 ? 'list' : 'lists' }} in this folder</p>
                    <ul v-if="selectedFolder.task_lists?.length" class="mt-3 space-y-2">
                        <li v-for="taskList in selectedFolder.task_lists" :key="taskList.id" :class="[theme.border, theme.bg, 'rounded-md border px-3 py-2 text-sm']">{{ taskList.name }}</li>
                    </ul>
                    <p v-else :class="[theme.textMuted, 'mt-3 text-sm']">No lists in this folder yet.</p>
                </div>
                <div :class="[theme.border, 'mt-5 flex justify-end gap-2 border-t pt-4']"><button type="button" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm font-medium']" @click="selectedFolder = null">Close</button><button type="button" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'rounded-md px-4 py-2 text-sm font-semibold']" @click="openFolderEdit(selectedFolder)">Edit folder</button></div>
            </section>
        </div>

        <div v-if="isFolderFormOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeFolderForm">
            <form role="dialog" aria-modal="true" aria-labelledby="folder-form-title" :class="[theme.surface, theme.border, 'w-full max-w-lg rounded-lg border p-6 shadow-2xl']" @submit.prevent="saveFolder" @keydown.esc="closeFolderForm">
                <div class="mb-6 flex items-start justify-between gap-4">
                    <div><h2 id="folder-form-title" :class="[theme.text, 'text-lg font-semibold']">{{ editingFolder ? 'Edit folder' : 'Create a folder' }}</h2><p :class="[theme.textMuted, 'mt-1 text-sm']">{{ editingFolder ? 'Update this folder name and description.' : 'Keep related lists grouped together in this space.' }}</p></div>
                    <button type="button" :disabled="isFolderSaving" :class="[theme.textMuted, 'rounded p-1 disabled:opacity-50']" aria-label="Close folder form" @click="closeFolderForm"><X class="h-5 w-5" /></button>
                </div>
                <p v-if="folderFormError" class="mb-4 text-sm text-red-400" role="alert">{{ folderFormError }}</p>
                <div class="space-y-4">
                    <label class="block"><span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Name</span><input v-model.trim="folderForm.name" type="text" maxlength="255" required autofocus :class="[theme.bg, theme.text, theme.border, 'w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400 disabled:opacity-60']" placeholder="e.g. Product backlog" /><span v-if="folderValidationErrors.name" class="mt-1 block text-xs text-red-400">{{ folderValidationErrors.name }}</span></label>
                    <label class="block"><span :class="[theme.text, 'mb-1.5 block text-sm font-medium']">Description <span :class="[theme.textMuted, 'font-normal']">(optional)</span></span><textarea v-model.trim="folderForm.description" rows="4" maxlength="1000" :class="[theme.bg, theme.text, theme.border, 'w-full resize-y rounded-md border px-3 py-2.5 text-sm outline-none focus:border-amber-400 disabled:opacity-60']" placeholder="What belongs in this folder?"></textarea><span v-if="folderValidationErrors.description" class="mt-1 block text-xs text-red-400">{{ folderValidationErrors.description }}</span></label>
                </div>
                <div :class="[theme.border, 'mt-6 flex justify-end gap-2 border-t pt-4']"><button type="button" :disabled="isFolderSaving" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50']" @click="closeFolderForm">Cancel</button><button type="submit" :disabled="isFolderSaving" :class="[theme.primaryBg, theme.primaryText, theme.primaryBgHover, 'inline-flex min-w-28 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60']"><span v-if="isFolderSaving" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>{{ isFolderSaving ? 'Saving...' : editingFolder ? 'Save changes' : 'Create folder' }}</button></div>
            </form>
        </div>

        <div v-if="pendingFolderDeletion" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeFolderDeletion">
            <section role="dialog" aria-modal="true" aria-labelledby="delete-folder-title" :class="[theme.surface, theme.border, 'w-full max-w-md rounded-lg border p-6 shadow-2xl']">
                <div class="mb-5 flex items-start justify-between gap-4"><div><h2 id="delete-folder-title" :class="[theme.text, 'text-lg font-semibold']">Delete folder?</h2><p :class="[theme.textMuted, 'mt-2 text-sm']">This permanently deletes <strong :class="theme.text">{{ pendingFolderDeletion.name }}</strong> and all lists inside it.</p></div><button type="button" :disabled="isFolderDeleting" :class="[theme.textMuted, 'rounded p-1']" aria-label="Close folder confirmation" @click="closeFolderDeletion"><X class="h-5 w-5" /></button></div>
                <p v-if="folderDeletionError" class="mb-4 text-sm text-red-400" role="alert">{{ folderDeletionError }}</p>
                <div :class="[theme.border, 'flex justify-end gap-2 border-t pt-4']"><button type="button" :disabled="isFolderDeleting" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50']" @click="closeFolderDeletion">Cancel</button><button type="button" :disabled="isFolderDeleting" class="inline-flex min-w-28 items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60" @click="removeFolder"><span v-if="isFolderDeleting" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>{{ isFolderDeleting ? 'Deleting...' : 'Delete folder' }}</button></div>
            </section>
        </div>

        <div v-if="pendingDeletion" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeDeletion">
            <section role="dialog" aria-modal="true" aria-labelledby="delete-space-title" :class="[theme.surface, theme.border, 'w-full max-w-md rounded-lg border p-6 shadow-2xl']">
                <div class="mb-5 flex items-start justify-between gap-4"><div><h2 id="delete-space-title" :class="[theme.text, 'text-lg font-semibold']">Delete space?</h2><p :class="[theme.textMuted, 'mt-2 text-sm']">This permanently deletes <strong :class="theme.text">{{ pendingDeletion.name }}</strong> and its contents.</p></div><button type="button" :disabled="isDeleting" :class="[theme.textMuted, 'rounded p-1']" aria-label="Close confirmation" @click="closeDeletion"><X class="h-5 w-5" /></button></div>
                <p v-if="deletionError" class="mb-4 text-sm text-red-400" role="alert">{{ deletionError }}</p>
                <div :class="[theme.border, 'flex justify-end gap-2 border-t pt-4']"><button type="button" :disabled="isDeleting" :class="[theme.text, theme.elevated, 'rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50']" @click="closeDeletion">Cancel</button><button type="button" :disabled="isDeleting" class="inline-flex min-w-28 items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60" @click="removeSpace"><span v-if="isDeleting" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>{{ isDeleting ? 'Deleting...' : 'Delete space' }}</button></div>
            </section>
        </div>
    </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { BriefcaseBusiness, Check, ChevronDown, ChevronUp, Code2, FolderKanban, Megaphone, Palette, Pencil, Plus, RefreshCw, Trash2, X } from '@lucide/vue'
import { useRouter } from 'vue-router'
import useThemeStore from '@/stores/theme'
import useWorkspaceStore from '@/stores/workspace'
import { createSpace, deleteSpace, getSpace, getSpaces, reorderSpaces, updateSpace } from '@/services/spaceService'
import { createFolder, deleteFolder, getFolder, getSpaceFolders, reorderFolders, updateFolder } from '@/services/folderService'

const themeStore = useThemeStore()
const workspaceStore = useWorkspaceStore()
const router = useRouter()
const { theme } = storeToRefs(themeStore)
const { currentWorkspaceId } = storeToRefs(workspaceStore)
const spaces = ref([])
const folders = ref([])
const isLoading = ref(true)
const isSaving = ref(false)
const isDeleting = ref(false)
const isReordering = ref(false)
const isFolderLoading = ref(false)
const isFolderSaving = ref(false)
const isFolderDeleting = ref(false)
const isFolderReordering = ref(false)
const isFormOpen = ref(false)
const isFolderFormOpen = ref(false)
const editingSpace = ref(null)
const editingFolder = ref(null)
const selectedSpace = ref(null)
const selectedFolder = ref(null)
const pendingDeletion = ref(null)
const pendingFolderDeletion = ref(null)
const draggingId = ref(null)
const draggingFolderId = ref(null)
const pageError = ref('')
const formError = ref('')
const folderFormError = ref('')
const deletionError = ref('')
const folderDeletionError = ref('')
const successMessage = ref('')
const validationErrors = ref({})
const folderValidationErrors = ref({})
const colorOptions = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F97316']
const iconMap = { folder: FolderKanban, briefcase: BriefcaseBusiness, code: Code2, announcement: Megaphone, palette: Palette }
const form = ref(defaultForm())
const folderForm = ref(defaultFolderForm())
let loadVersion = 0

function defaultForm() {
    return { name: '', description: '', color: colorOptions[0], icon: 'folder' }
}

function defaultFolderForm() {
    return { name: '', description: '' }
}

const normalizedSpaces = computed(() => [...spaces.value].sort((first, second) => Number(first.position) - Number(second.position)))
const normalizedFolders = computed(() => [...folders.value].sort((first, second) => Number(first.position) - Number(second.position)))
const spaceIcon = (icon) => iconMap[icon] ?? FolderKanban
const syncSpaces = (nextSpaces) => {
    spaces.value = [...nextSpaces].sort((first, second) => Number(first.position) - Number(second.position))
    workspaceStore.setCurrentWorkspaceSpaces(spaces.value)
}

const syncFolders = (nextFolders) => {
    folders.value = [...nextFolders].sort((first, second) => Number(first.position) - Number(second.position))
    if (selectedSpace.value) {
        selectedSpace.value = { ...selectedSpace.value, folders: folders.value }
    }
}

const loadSpaces = async () => {
    if (!currentWorkspaceId.value) {
        syncSpaces([])
        isLoading.value = false
        return
    }
    const requestVersion = ++loadVersion
    isLoading.value = true
    pageError.value = ''
    try {
        const result = await getSpaces(currentWorkspaceId.value)
        if (requestVersion === loadVersion) syncSpaces(result)
    } catch (error) {
        if (requestVersion === loadVersion) pageError.value = error.message ?? 'Unable to load spaces.'
    } finally {
        if (requestVersion === loadVersion) isLoading.value = false
    }
}

const loadFolders = async (spaceId) => {
    if (!spaceId) {
        folders.value = []
        return
    }

    isFolderLoading.value = true
    folderFormError.value = ''
    try {
        const result = await getSpaceFolders(spaceId)
        syncFolders(result)
    } catch (error) {
        folderFormError.value = error.message ?? 'Unable to load folders.'
    } finally {
        isFolderLoading.value = false
    }
}

const openCreate = () => {
    editingSpace.value = null
    form.value = defaultForm()
    validationErrors.value = {}
    formError.value = ''
    isFormOpen.value = true
}

const openEdit = (space) => {
    selectedSpace.value = null
    editingSpace.value = space
    form.value = { name: space.name, description: space.description ?? '', color: space.color ?? colorOptions[0], icon: space.icon ?? 'folder' }
    validationErrors.value = {}
    formError.value = ''
    isFormOpen.value = true
}

const closeForm = () => {
    if (!isSaving.value) isFormOpen.value = false
}

const saveSpace = async () => {
    if (!currentWorkspaceId.value) return
    isSaving.value = true
    formError.value = ''
    validationErrors.value = {}
    try {
        let saved
        if (editingSpace.value) {
            saved = await updateSpace(editingSpace.value.id, { name: form.value.name, description: form.value.description || null })
            syncSpaces(spaces.value.map((space) => space.id === saved.id ? { ...space, ...saved } : space))
            successMessage.value = `${saved.name} was updated.`
        } else {
            saved = await createSpace({ ...form.value, workspace_id: currentWorkspaceId.value, position: spaces.value.length })
            syncSpaces([...spaces.value, saved])
            successMessage.value = `${saved.name} was created.`
        }
        isFormOpen.value = false
    } catch (error) {
        validationErrors.value = Object.fromEntries(Object.entries(error.errors ?? {}).map(([field, messages]) => [field, messages[0]]))
        formError.value = error.message ?? 'Unable to save this space.'
    } finally {
        isSaving.value = false
    }
}

const showSpace = async (space) => {
    await router.push({ name: 'workspace.space.show', params: { spaceId: space.id } })
}

const openFolderCreate = () => {
    editingFolder.value = null
    folderForm.value = defaultFolderForm()
    folderValidationErrors.value = {}
    folderFormError.value = ''
    isFolderFormOpen.value = true
}

const openFolderEdit = (folder) => {
    selectedFolder.value = null
    editingFolder.value = folder
    folderForm.value = { name: folder.name, description: folder.description ?? '' }
    folderValidationErrors.value = {}
    folderFormError.value = ''
    isFolderFormOpen.value = true
}

const closeFolderForm = () => {
    if (!isFolderSaving.value) isFolderFormOpen.value = false
}

const saveFolder = async () => {
    if (!selectedSpace.value) return
    isFolderSaving.value = true
    folderFormError.value = ''
    folderValidationErrors.value = {}
    try {
        let saved
        if (editingFolder.value) {
            saved = await updateFolder(editingFolder.value.id, { name: folderForm.value.name, description: folderForm.value.description || null })
            syncFolders(folders.value.map((folder) => folder.id === saved.id ? { ...folder, ...saved } : folder))
            successMessage.value = `${saved.name} was updated.`
        } else {
            saved = await createFolder({ space_id: selectedSpace.value.id, name: folderForm.value.name, description: folderForm.value.description || null, position: folders.value.length })
            syncFolders([...folders.value, saved])
            successMessage.value = `${saved.name} was created.`
        }
        isFolderFormOpen.value = false
    } catch (error) {
        folderValidationErrors.value = Object.fromEntries(Object.entries(error.errors ?? {}).map(([field, messages]) => [field, messages[0]]))
        folderFormError.value = error.message ?? 'Unable to save this folder.'
    } finally {
        isFolderSaving.value = false
    }
}

const showFolder = async (folder) => {
    try {
        selectedFolder.value = await getFolder(folder.id)
    } catch (error) {
        pageError.value = error.message ?? 'Unable to load this folder.'
    }
}

const closeDeletion = () => {
    if (isDeleting.value) return
    pendingDeletion.value = null
    deletionError.value = ''
}

const removeSpace = async () => {
    const space = pendingDeletion.value
    if (!space) return
    isDeleting.value = true
    deletionError.value = ''
    try {
        await deleteSpace(space.id)
        syncSpaces(spaces.value.filter((item) => item.id !== space.id))
        pendingDeletion.value = null
        successMessage.value = `${space.name} was deleted.`
    } catch (error) {
        deletionError.value = error.message ?? 'Unable to delete this space.'
    } finally {
        isDeleting.value = false
    }
}

const closeFolderDeletion = () => {
    if (isFolderDeleting.value) return
    pendingFolderDeletion.value = null
    folderDeletionError.value = ''
}

const removeFolder = async () => {
    const folder = pendingFolderDeletion.value
    if (!folder) return
    isFolderDeleting.value = true
    folderDeletionError.value = ''
    try {
        await deleteFolder(folder.id)
        syncFolders(folders.value.filter((item) => item.id !== folder.id))
        pendingFolderDeletion.value = null
        successMessage.value = `${folder.name} was deleted.`
    } catch (error) {
        folderDeletionError.value = error.message ?? 'Unable to delete this folder.'
    } finally {
        isFolderDeleting.value = false
    }
}

const persistOrder = async (nextSpaces, previousSpaces) => {
    if (!currentWorkspaceId.value) return
    isReordering.value = true
    pageError.value = ''
    const positionedSpaces = nextSpaces.map((space, position) => ({ ...space, position }))
    syncSpaces(positionedSpaces)
    try {
        await reorderSpaces(currentWorkspaceId.value, positionedSpaces.map(({ id, position }) => ({ id, position })))
        successMessage.value = 'Space order was updated.'
    } catch (error) {
        syncSpaces(previousSpaces)
        pageError.value = error.message ?? 'Unable to reorder spaces.'
    } finally {
        isReordering.value = false
    }
}

const moveSpace = (fromIndex, toIndex) => {
    if (isReordering.value || toIndex < 0 || toIndex >= spaces.value.length) return
    const previousSpaces = [...normalizedSpaces.value]
    const nextSpaces = [...previousSpaces]
    const [space] = nextSpaces.splice(fromIndex, 1)
    nextSpaces.splice(toIndex, 0, space)
    persistOrder(nextSpaces, previousSpaces)
}

const persistFolderOrder = async (nextFolders, previousFolders) => {
    if (!selectedSpace.value) return
    isFolderReordering.value = true
    folderFormError.value = ''
    const positionedFolders = nextFolders.map((folder, position) => ({ ...folder, position }))
    syncFolders(positionedFolders)
    try {
        await reorderFolders(selectedSpace.value.id, positionedFolders.map(({ id, position }) => ({ id, position })))
        successMessage.value = 'Folder order was updated.'
    } catch (error) {
        syncFolders(previousFolders)
        folderFormError.value = error.message ?? 'Unable to reorder folders.'
    } finally {
        isFolderReordering.value = false
    }
}

const moveFolder = (fromIndex, toIndex) => {
    if (isFolderReordering.value || toIndex < 0 || toIndex >= folders.value.length) return
    const previousFolders = [...normalizedFolders.value]
    const nextFolders = [...previousFolders]
    const [folder] = nextFolders.splice(fromIndex, 1)
    nextFolders.splice(toIndex, 0, folder)
    persistFolderOrder(nextFolders, previousFolders)
}

const startDrag = (spaceId) => { draggingId.value = spaceId }
const dropSpace = (targetId) => {
    const sourceIndex = normalizedSpaces.value.findIndex((space) => space.id === draggingId.value)
    const targetIndex = normalizedSpaces.value.findIndex((space) => space.id === targetId)
    draggingId.value = null
    if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) moveSpace(sourceIndex, targetIndex)
}

const startFolderDrag = (folderId) => { draggingFolderId.value = folderId }
const dropFolder = (targetId) => {
    const sourceIndex = normalizedFolders.value.findIndex((folder) => folder.id === draggingFolderId.value)
    const targetIndex = normalizedFolders.value.findIndex((folder) => folder.id === targetId)
    draggingFolderId.value = null
    if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) moveFolder(sourceIndex, targetIndex)
}

watch(currentWorkspaceId, () => loadSpaces(), { immediate: true })
</script>
