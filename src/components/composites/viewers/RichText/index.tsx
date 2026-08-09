import { Heading, type HeadingLevel } from "@/components/atoms/Heading"
import { Text } from "@/components/atoms/Text"
import { Tree } from "@/components/frames/Tree"
import type { ContractSlotProps } from "@/components/contracts"

/**
 * COMPOSITE - `RichText`: prose that arrives as content rather than as markup.
 *
 * PORTED FROM THE LIVE PRODUCT WITH ONE DELIBERATE REDUCTION, and the reduction is the whole
 * note worth reading. The original parses MARKDOWN at render time and hands the result to a
 * prose stylesheet: it pulls in a parser, a sanitiser and a highlighter, and it produces a tree
 * of raw tags that no registry key describes and no atom owns - `<h2>` written by a library,
 * `<p>` styled by a descendant selector. Both of those are exactly what this spine refuses.
 *
 * SO THE CONTENT ARRIVES ALREADY PARSED. A caller hands over a list of BLOCKS - a heading, a
 * paragraph - and each block is drawn by the atom that owns that kind of text. The result is
 * prose whose every line is a component this tree can see, at the price of not accepting a
 * markdown string. Where the string genuinely has to be parsed, the parsing belongs upstream of
 * the component tier, and it needs a dependency this repository does not have yet.
 *
 * THE HEADINGS ARE REAL HEADINGS. A block typed `heading` is drawn by the `Heading` atom at a
 * level the caller names, so a long document stays navigable by heading rather than being one
 * flat wall of paragraphs with big text in it.
 */

/** One block of resolved prose. */
export type RichTextBlock =
    /** A paragraph. The commonest block, and the reason the type has a default at all. */
    | { kind: "paragraph", text: string }
    /** A heading, at a level the caller names because only the caller knows the document. */
    | { kind: "heading", text: string, level: HeadingLevel }

/** Props for {@link RichText}. */
export interface RichTextProps {
    /** The blocks, in reading order, already resolved and already translated. */
    blocks: ReadonlyArray<RichTextBlock>
    /** Nothing to show YET - the whole passage rests, because it arrives as one payload. */
    isLoading?: boolean
}

/**
 * Draw resolved prose.
 *
 * @param props - {@link RichTextProps}
 */
export const RichText = ({ blocks, isLoading = false }: RichTextProps) => {
    /** The `body` role of the `stack` key: one atom per block, in reading order. */
    const Blocks = ({ isLoading: resting }: ContractSlotProps) => (
        <>
            {blocks.map((block, index) => {
                const key = `${block.kind}-${index}`
                if (block.kind === "heading") {
                    return (
                        <Heading key={key} level={block.level} isLoading={resting}>
                            {block.text}
                        </Heading>
                    )
                }
                return (
                    <Text key={key} isLoading={resting}>
                        {block.text}
                    </Text>
                )
            })}
        </>
    )

    return <Tree contract="stack" isLoading={isLoading} slots={{ body: Blocks }} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "composite", name: "RichText" } as const
