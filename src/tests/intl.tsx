import { render } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import type { ReactElement } from "react"
import messages from "@/messages/en.json"

/**
 * Render a connected half with the REAL message catalogue above it.
 *
 * Every block is two halves: the presentational one takes resolved strings and is rendered
 * bare, and the connected one resolves them. So only the connected halves need this - and they
 * need it with `src/messages/en.json` rather than a fixture, deliberately.
 *
 * WHY THE REAL CATALOGUE. A fixture would let a test keep passing on a key nobody ships: rename
 * `streak.empty` and the fixture still answers, so the assertion goes on being green while the
 * product renders the raw key. Reading the file the app reads means a missing or renamed message
 * fails HERE, which is the only place it can fail cheaply.
 *
 * It also keeps the assertions readable: a test that expects "No streak yet" is expecting the
 * sentence a reader actually sees, not a stand-in that happens to match.
 *
 * @param ui - The element under test.
 */
export const renderWithIntl = (ui: ReactElement) =>
    render(<NextIntlClientProvider locale="en" messages={messages}>{ui}</NextIntlClientProvider>)
