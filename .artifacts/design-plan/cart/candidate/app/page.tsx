import Link from "next/link"
import { STATES } from "~candidate/states"

/**
 * THE CANDIDATE INDEX.
 *
 * Review chrome, not candidate source: nothing here is ported. It exists so the candidate can be
 * opened without the lab and so every rendered state is reachable from one place - including a
 * state the manifest forgot to list, which is the failure this page makes visible.
 */
const CandidateIndex = () => (
    <div className="mx-auto flex w-full max-w-app-lg flex-col gap-4 p-6">
        <h1 className="text-lg font-semibold text-foreground">cart · direction-legacy-full-default · revision 1.0</h1>
        <ul className="flex flex-col gap-3">
            {STATES.map((state) => (
                <li key={state.id} className="flex flex-col gap-1">
                    <Link href={`/state/${state.id}`} className="text-sm font-semibold text-accent underline">{state.id}</Link>
                    <span className="text-xs text-muted">{state.note}</span>
                </li>
            ))}
        </ul>
    </div>
)

export default CandidateIndex
