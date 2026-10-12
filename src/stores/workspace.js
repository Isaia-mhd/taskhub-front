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

            try {

                // set the current workspace to the first one in the list if available
                if(this.workspaces.length > 0){
                    const workspace = await getWorkspace(this.workspaces[0].id);
    
                    this.currentWorkspace = workspace;

                    return
                }

                return

            } catch (error) {

                this.currentError = error.message;                
                
            }
            
            // this.currentWorkspace = workspaces.length > 0 ? workspaces[0] : null;
        },
        setCurrentWorkspace(workspace) {
            this.currentWorkspace = workspace;
        },
        clearCurrentWorkspace(){
            this.currentWorkspace = null
        }
    },
    getters: {
        currentWorkspaceId: (state) => state.currentWorkspace?.id ?? null,
    }
});

export default useWorkspaceStore;