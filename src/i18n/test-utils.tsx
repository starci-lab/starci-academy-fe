import { render } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import type { ReactElement } from "react"
import messages from "@/messages/en.json"

/** Render connected UI with the real English message catalogue. */
export const renderWithIntl = (ui: ReactElement) =>
    render(<NextIntlClientProvider locale="en" messages={messages}>{ui}</NextIntlClientProvider>)
