import { notFound } from "next/navigation"
import { RenderState } from "~candidate/RenderState"
import { STATES } from "~candidate/states"

/**
 * Every state gets its own route so headless Chrome can capture them one at a time.
 *
 * @returns One params object per state.
 */
export const generateStaticParams = () => STATES.map((state) => ({ id: state.id }))

/**
 * Draw one state by id.
 *
 * @param props - The route params.
 * @returns The rendered state.
 */
const StatePage = async (props: { readonly params: Promise<{ readonly id: string }> }) => {
    const { id } = await props.params
    const state = STATES.find((candidate) => candidate.id === id)
    if (state === undefined) notFound()
    return <RenderState state={state} />
}

export default StatePage
