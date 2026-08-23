"use client"

import type { ReactNode } from "react"
import { Table } from "@heroui/react"

/**
 * BRANCH - `TableBranch`: the one owner of HeroUI `Table` in the component tier.
 *
 * WHY A BRANCH AND NOT A LEAF. A leaf's `props` must satisfy `ComponentData`, which is JSON to the
 * bottom. A table cell is not JSON: it carries a link mid-phrase, a path set in code, an emphasised
 * word. A leaf could only take cells already flattened to text, and flattening is the loss the table
 * exists to prevent - so `VENDOR-15` puts the vendor here, beside the SurfaceCard family, where the
 * caller may supply content.
 *
 * WHY THE CALLER NEVER TOUCHES A PART. `Table.Column` needs `isRowHeader` on the first column or
 * React Aria refuses to name the row; `Table.Header` needs its columns as DIRECT children, not
 * wrapped in a row. Both are vendor requirements a caller would have to remember, so neither is
 * asked of one: this branch takes cells and rebuilds the anatomy itself.
 *
 * A HEADERLESS TABLE STILL MOUNTS. Authored markdown can emit a table whose header row is empty.
 * The vendor still requires a header, and it requires the column count to MATCH the cell count -
 * react-aria throws otherwise, so a single stand-in column would crash every table but a
 * one-column one. The stand-in is therefore as wide as the widest row, and it is screen-reader-only
 * rather than promoted from the first body row: the source said it had no header, and turning a row
 * of data into one would put a claim in the document that its author did not make.
 */

/** One row of cells, already rendered by whoever owns the content. */
export type TableBranchRow = {
    /** Stable identity for the row, from the content model rather than the array index. */
    readonly id: string
    /** The row's cells, in column order. */
    readonly cells: ReadonlyArray<{ readonly id: string, readonly content: ReactNode }>
}

/** Props for {@link TableBranch}. */
export type TableBranchProps = {
    /** The accessible name; a table without one is unreachable by row. */
    readonly ariaLabel: string
    /** The header row's cells, in column order. Empty means the source had no header. */
    readonly columns: ReadonlyArray<{ readonly id: string, readonly content: ReactNode }>
    /** The body rows. */
    readonly rows: ReadonlyArray<TableBranchRow>
}

/**
 * Draw rows and columns through the vendor that owns tables.
 *
 * @param props - {@link TableBranchProps}
 */
export const TableBranch = ({ ariaLabel, columns, rows }: TableBranchProps) => {
    const widest = rows.reduce((count, row) => Math.max(count, row.cells.length), 0)
    const standIns = Array.from({ length: Math.max(widest, 1) }, (_unused, index) => `stand-in-${index}`)
    return (
        <Table variant="primary">
            <Table.ScrollContainer>
                <Table.Content aria-label={ariaLabel}>
                    <Table.Header>
                        {columns.length === 0
                            ? standIns.map((id, index) => (
                                <Table.Column key={id} isRowHeader={index === 0} className="sr-only">{" "}</Table.Column>
                            ))
                            : columns.map((column, index) => (
                                <Table.Column key={column.id} isRowHeader={index === 0}>{column.content}</Table.Column>
                            ))}
                    </Table.Header>
                    <Table.Body>
                        {rows.map((row) => (
                            <Table.Row key={row.id}>
                                {row.cells.map((cell) => <Table.Cell key={cell.id}>{cell.content}</Table.Cell>)}
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Content>
            </Table.ScrollContainer>
        </Table>
    )
}

/** Source-level tier marker. */
export const meta = { shape: "branch", world: "pure" } as const
