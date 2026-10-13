import { getWorkspace } from "@/services/workspaceService";
import { defineStore } from "pinia";

const useWorkspaceStore = defineStore('workspace', {
    state: () => ({
        workspaces: [],
        currentWorkspace: null,
        currentError: null
    }),
    actions: {
        async setWorkspaces(workspaces) {
            this.workspaces = workspaces;
            if (this.workspaces.length === 0) {
                this.currentWorkspace = null;
                this.currentError = null;
                localStorage.removeItem('currentWorkspaceId');
                return;
            }

            const savedId = localStorage.getItem('currentWorkspaceId');
            const desiredWorkspace = this.workspaces.find((workspace) =>
                String(workspace.id) === String(this.currentWorkspace?.id ?? savedId)
            ) ?? this.workspaces[0];

            try {
                await this.selectWorkspace(desiredWorkspace.id);
                this.currentError = null;
            } catch (error) {
                this.currentError = error.message;
                throw error;
            }
        },
        async selectWorkspace(workspaceId) {
            const workspace = await getWorkspace(workspaceId);
            this.currentWorkspace = workspace;
            this.currentError = null;
            localStorage.setItem('currentWorkspaceId', String(workspace.id));
        },
        addWorkspace(workspace) {
            this.workspaces = [workspace, ...this.workspaces];
        },
        updateWorkspace(workspace) {
            this.workspaces = this.workspaces.map((item) =>
                String(item.id) === String(workspace.id) ? { ...item, ...workspace } : item
            );
            if (String(this.currentWorkspace?.id) === String(workspace.id)) {
                this.currentWorkspace = { ...this.currentWorkspace, ...workspace };
            }
        },
        async removeWorkspace(workspaceId) {
            this.workspaces = this.workspaces.filter((workspace) =>
                String(workspace.id) !== String(workspaceId)
            );
            if (String(this.currentWorkspace?.id) !== String(workspaceId)) return;

            if (this.workspaces.length > 0) {
                await this.selectWorkspace(this.workspaces[0].id);
            } else {
                this.currentWorkspace = null;
                localStorage.removeItem('currentWorkspaceId');
            }
        },
        setCurrentWorkspace(workspace) {
            this.currentWorkspace = workspace;
        },
        setCurrentWorkspaceSpaces(spaces) {
            const orderedSpaces = [...spaces].sort((first, second) => Number(first.position) - Number(second.position));

            if (this.currentWorkspace) {
                this.currentWorkspace = { ...this.currentWorkspace, spaces: orderedSpaces };
            }

            this.workspaces = this.workspaces.map((workspace) =>
                String(workspace.id) === String(this.currentWorkspace?.id)
                    ? { ...workspace, spaces: orderedSpaces }
                    : workspace
            );
        },
        clearCurrentWorkspace() {
            this.currentWorkspace = null;
        }
    },
    getters: {
        currentWorkspaceId: (state) => state.currentWorkspace?.id ?? null,
    }
});

export default useWorkspaceStore;
