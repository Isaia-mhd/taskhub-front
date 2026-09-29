export const handleError = (error) => {

    if (error.response) {

        const status = error.response.status
        const data = error.response.data

        switch (status) {

            case 400:
                return {
                    type: 'bad_request',
                    message: data?.message ?? 'Bad request.',
                    status
                }

            case 401:
                return {
                    type: 'unauthorized',
                    message: data?.message ?? 'You are not authenticated.',
                    status
                }

            case 403:
                return {
                    type: 'forbidden',
                    message: data?.message ?? 'You do not have permission.',
                    status
                }

            case 404:
                return {
                    type: 'not_found',
                    message: data?.message ?? 'Resource not found.',
                    status
                }

            case 422:
                return {
                    type: 'validation',
                    message: data?.message ?? 'Validation failed.',
                    errors: data?.errors ?? {},
                    status
                }

            case 500:
                return {
                    type: 'server_error',
                    message: 'Internal server error.',
                    status
                }

            default:
                return {
                    type: 'http_error',
                    message: data?.message ?? 'An HTTP error occurred.',
                    status
                }
        }
    }

    if (error.request) {

        return {
            type: 'network_error',
            message: 'Unable to connect to the server.'
        }
    }

    return {
        type: 'unknown_error',
        message: error.message ?? 'An unexpected error occurred.'
    }
}