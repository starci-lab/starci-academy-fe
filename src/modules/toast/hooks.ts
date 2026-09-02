"use client"

import { useCallback, useMemo } from "react"
import { useTranslations } from "next-intl"
import { runGraphQLWithToast, type RunGraphQLWithToastOptions, type ToastMessages } from "./api"
import { type GraphQLResponse } from "@/modules/api/graphql/types"

/** Legacy-compatible GraphQL write boundary with localized feedback. */
export const useGraphQLWithToast = () => {
    const t = useTranslations("toast")
    const messages = useMemo<ToastMessages>(() => ({
        successTitle: t("successTitle"),
        errorTitle: t("errorTitle"),
        unauthorizedTitle: t("unauthorizedTitle"),
        unauthorizedDescription: t("unauthorizedDescription"),
        defaultSuccess: t("defaultSuccess"),
        defaultError: t("defaultError"),
    }), [t])
    return useCallback(
        <T>(action: () => Promise<GraphQLResponse<T>>, options?: RunGraphQLWithToastOptions) =>
            runGraphQLWithToast(action, { ...options, messages }),
        [messages],
    )
}
