import { toast } from "./toast"
import { type GraphQLResponse } from "@/modules/api/graphql/types"

/** Localized language shared by all write-feedback toasts. */
export type ToastMessages = {
    readonly successTitle: string
    readonly errorTitle: string
    readonly unauthorizedTitle: string
    readonly unauthorizedDescription: string
    readonly defaultSuccess: string
    readonly defaultError: string
}

const DEFAULT_MESSAGES: ToastMessages = {
    successTitle: "Success",
    errorTitle: "Error",
    unauthorizedTitle: "Unauthorized",
    unauthorizedDescription: "You are not authorized to access this resource.",
    defaultSuccess: "Operation completed.",
    defaultError: "Something went wrong.",
}

/** Visibility and copy controls for one toasted GraphQL write. */
export type RunGraphQLWithToastOptions = {
    readonly showSuccessToast?: boolean
    readonly showErrorToast?: boolean
    readonly successMessage?: string
    readonly messages?: ToastMessages
}

/** Execute one GraphQL write and surface both transport and typed-envelope failures. */
export const runGraphQLWithToast = async <T>(
    action: () => Promise<GraphQLResponse<T>>,
    options: RunGraphQLWithToastOptions = {},
): Promise<boolean> => {
    const {
        showSuccessToast = true,
        showErrorToast = true,
        successMessage,
        messages = DEFAULT_MESSAGES,
    } = options
    try {
        const response = await action()
        if (!response.success) {
            if (showErrorToast) toast.danger(messages.errorTitle, { description: response.message || messages.defaultError })
            return false
        }
        if (showSuccessToast) toast.success(messages.successTitle, { description: successMessage ?? response.message ?? messages.defaultSuccess })
        return true
    } catch (error) {
        const message = error instanceof Error ? error.message : messages.defaultError
        const unauthorized = message.toLowerCase().includes("unauthorized")
        if (showErrorToast) {
            toast.danger(
                unauthorized ? messages.unauthorizedTitle : messages.errorTitle,
                { description: unauthorized ? messages.unauthorizedDescription : message },
            )
        }
        return false
    }
}
