/**
 * BLOCK - `InfoTooltip`: a hard word with its plain-language meaning attached.
 *
 * PORTED FROM THE LIVE PRODUCT, and this is the port that gives up the most. The original
 * wrapped any trigger in a vendor `Tooltip`, owned the whole hover card - inset, arrow, a
 * maximum width - and could take a fully composed body. The vendor is only reachable from the
 * atom tier here and there is no tooltip atom, so the hover card does not cross.
 *
 * WHAT DOES CROSS IS THE JOB, WHICH IS NOT THE CARD. The job is that a reader who does not know
 * what "league", "tier" or "streak" means on this product can find out without leaving the
 * sentence. `abbr` is the element that says exactly that - a term carrying its own expansion -
 * and it is delivered by the platform: it is announced by assistive technology, it survives
 * with styling off, and it costs nothing to render.
 *
 * WHAT IS MISSING, STATED PLAINLY. A native expansion does not appear on touch, cannot be
 * reached by keyboard alone, and cannot be styled - so a term whose meaning a reader NEEDS in
 * order to act should not rely on this. That is a real gap and it needs a tooltip atom rather
 * than a workaround here; a block that reached for the vendor itself would be the tier boundary
 * failing at the first component that found it inconvenient.
 *
 * NO RICH BODY. The original accepted arbitrary composed content, which is how a tooltip ends
 * up holding a table nobody on a phone can read. An explanation that needs more than a sentence
 * is not an explanation, it is a section.
 */

/** Props for {@link InfoTooltip}. */
export interface InfoTooltipProps {
    /** The already-resolved hard word itself, as it appears in the sentence. */
    term: string
    /**
     * The already-resolved plain-language meaning - one sentence. Copy is data, so both halves
     * arrive translated by whoever holds the locale.
     */
    explanation: string
}

/**
 * Draw a term that carries its own meaning.
 *
 * @param props - {@link InfoTooltipProps}
 */
export const InfoTooltip = ({ term, explanation }: InfoTooltipProps) => (
    <abbr data-tier="block" data-component="InfoTooltip" title={explanation}>
        {term}
    </abbr>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "block", name: "InfoTooltip" } as const
