import { notFound } from "next/navigation"
import { RenderState } from "~candidate/RenderState"
import { STATES } from "~candidate/states"

/**
 * ONE STATIC ROUTE PER RENDERED STATE.
 *
 * The review chrome frames each of these in its own iframe, which is what keeps a screenshot
 * comparable: one document, one main landmark, one settled situation, one URL that reproduces it.
 */

/** Emit one route per entry in the inventory - the inventory is the source, not a parallel list. */
export const generateStaticParams = () => STATES.map((state) => ({ stateId: state.id }))

/** Props Next hands a dynamic segment. */
interface StateRouteProps {
    /** The resolved route parameters. */
    params: Promise<{ stateId: string }>
}

const StateRoute = async (props: StateRouteProps) => {
    const { stateId } = await props.params
    const state = STATES.find((candidate) => candidate.id === stateId)
    if (state === undefined) notFound()
    return <RenderState state={state} />
}

export default StateRoute
