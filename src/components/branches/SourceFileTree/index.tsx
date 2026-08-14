"use client"

import { useMemo, useState } from "react"
import { Tree } from "@/components/branches/Tree"
import { IconButton } from "@/components/leaves/IconButton"
import { StatusDot } from "@/components/leaves/StatusDot"
import { Text } from "@/components/leaves/Text"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import { normalizeSandboxPath } from "@/modules/code/sandbox-repo"

/** One supported text file in the synchronized source explorer. */
export type SourceFileTreeFile = {
    readonly path: string
    readonly isEdited?: boolean
}

/** Closed data carried by the source explorer branch. */
export type SourceFileTreeData = {
    readonly label: string
    readonly files: ReadonlyArray<SourceFileTreeFile>
    readonly activePath?: string
    readonly editedLabel?: string
}

/** File activation is the only business action reported by the explorer. */
export type SourceFileTreeActions = {
    readonly activate?: (path: string) => void
}

/** Props for {@link SourceFileTree}. */
export type SourceFileTreeProps = {
    readonly props: SourceFileTreeData
    readonly on?: SourceFileTreeActions
    readonly isLoading?: boolean
}

type SourceTreeNode = {
    readonly id: string
    readonly label: string
    readonly kind: "folder" | "file"
    readonly path: string
    readonly ancestors: ReadonlyArray<string>
    readonly isEdited: boolean
}

const sourceTreeNodes = (files: ReadonlyArray<SourceFileTreeFile>): ReadonlyArray<SourceTreeNode> => {
    const folders = new Set<string>()
    const normalizedFiles = files.map((file) => ({ ...file, path: normalizeSandboxPath(file.path) }))

    for (const file of normalizedFiles) {
        const segments = file.path.slice(1).split("/")
        for (let index = 1; index < segments.length; index += 1) {
            folders.add(`/${segments.slice(0, index).join("/")}`)
        }
    }

    const folderNodes = Array.from(folders).map((path): SourceTreeNode => {
        const segments = path.slice(1).split("/")
        return {
            id: `folder:${path}`,
            label: segments.at(-1) ?? path,
            kind: "folder",
            path,
            ancestors: segments.slice(0, -1).map((_, index) => `/${segments.slice(0, index + 1).join("/")}`),
            isEdited: normalizedFiles.some((file) => file.isEdited === true && file.path.startsWith(`${path}/`)),
        }
    })
    const fileNodes = normalizedFiles.map((file): SourceTreeNode => {
        const segments = file.path.slice(1).split("/")
        return {
            id: `file:${file.path}`,
            label: segments.at(-1) ?? file.path,
            kind: "file",
            path: file.path,
            ancestors: segments.slice(0, -1).map((_, index) => `/${segments.slice(0, index + 1).join("/")}`),
            isEdited: file.isEdited === true,
        }
    })

    return [...folderNodes, ...fileNodes].sort((left, right) => {
        const pathOrder = left.path.localeCompare(right.path)
        if (pathOrder !== 0) return pathOrder
        return left.kind === "folder" ? -1 : 1
    })
}

/** Draw a keyboard-traversable file explorer from stable snapshot paths. */
export const SourceFileTree = (input: SourceFileTreeProps) => {
    const data = input.props
    const on = input.on
    const isLoading = input.isLoading ?? false
    const [closedFolders, setClosedFolders] = useState<ReadonlySet<string>>(() => new Set())
    const nodes = useMemo(() => sourceTreeNodes(data.files), [data.files])
    const visibleNodes = nodes.filter((node) => node.ancestors.every((path) => !closedFolders.has(path)))

    const toggleFolder = (path: string) => setClosedFolders((current) => {
        const next = new Set(current)
        if (next.has(path)) next.delete(path)
        else next.add(path)
        return next
    })

    return (
        <Tree
            contract="source-file-navigation"
            render={defineContractComponent("source-file-navigation", {
                label: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                    <Text props={{ content: data.label, size: "sm", weight: "semibold" }} />
                )),
                files: defineContractComponent("source-file-list", {
                    file: visibleNodes.map((node) => {
                        const isFolderOpen = node.kind === "folder" && !closedFolders.has(node.path)
                        const isActive = node.kind === "file" && normalizeSandboxPath(data.activePath ?? "") === node.path
                        const controlLabel = node.kind === "folder"
                            ? `${isFolderOpen ? "Collapse" : "Expand"} ${node.path}`
                            : `Open ${node.path}`
                        return defineContractComponent("source-file-row", {
                            disclosure: defineLeafComponent("icon-button", {}, () => (
                                <IconButton
                                    props={{
                                        icon: node.kind === "folder" ? "disclosure" : "code",
                                        label: controlLabel,
                                        isActive,
                                    }}
                                    on={{
                                        press: node.kind === "folder"
                                            ? () => toggleFolder(node.path)
                                            : () => on?.activate?.(node.path),
                                    }}
                                    isLoading={isLoading}
                                />
                            )),
                            name: defineLeafComponent("text", { size: "sm" }, () => (
                                <Text
                                    props={{
                                        content: node.label,
                                        size: "sm",
                                        tone: isActive ? "accent" : "default",
                                        weight: isActive ? "semibold" : "normal",
                                    }}
                                    isLoading={isLoading}
                                />
                            )),
                            ...(node.isEdited ? {
                                status: defineLeafComponent("status-dot", {}, () => (
                                    <StatusDot
                                        props={{ tone: "warning", label: data.editedLabel ?? "Locally edited" }}
                                        isLoading={isLoading}
                                    />
                                )),
                            } : {}),
                        })
                    }),
                }),
            })}
        />
    )
}

/** Source-level tier marker for the source explorer branch. */
export const meta = { shape: "branch", world: "pure" } as const
