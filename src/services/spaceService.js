import apiV1Request from "@/api/apiV1Request";
import { handleError } from "@/handler/handleError";

export const getSpaces = async (workspaceId) => {
  try {

    const response = await apiV1Request('get', `workspaces/${workspaceId}/spaces`);

    return response.data;

  } catch (error) {

    throw handleError(error);

  }
}
