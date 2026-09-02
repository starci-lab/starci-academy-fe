"use client"

import { useMemo, useState } from "react"
import { iconSourceFor } from "@/components/leaves/Icon"
import { IconButton } from "@starci/grammar/common"
import { StatusDot } from "@/components/leaves/StatusDot"
import { Text } from "@starci/grammar/common"
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
            label: path.slice(path.lastIndexOf("/") + 1),
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
            label: file.path.slice(file.path.lastIndexOf("/") + 1),
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
export const SourceFileTree = (props: SourceFileTreeProps) => {
    const data = props.props
    const on = props.on
    const isLoading = props.isLoading ?? false
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
        <nav aria-label={data.label}>
            <Text size={"sm"} weight={"semibold"}>{data.label}</Text>
            <ul>
                {visibleNodes.map((node) => {
                    const isFolderOpen = node.kind === "folder" && !closedFolders.has(node.path)
                    const isActive = node.kind === "file" && normalizeSandboxPath(data.activePath ?? "") === node.path
                    const controlLabel = node.kind === "folder"
                        ? `${isFolderOpen ? "Collapse" : "Expand"} ${node.path}`
                        : `Open ${node.path}`
                    return <li key={node.id}>
                        <IconButton source={iconSourceFor(node.kind === "folder" ? "disclosure" : "code", "leading")} label={controlLabel} isActive={isActive} isSkeleton={isLoading} onPress={({
                            press: node.kind === "folder"
                                ? () => toggleFolder(node.path)
                                : () => on?.activate?.(node.path),
                        })?.press} />
                        <Text size={"sm"} tone={isActive ? "accent" : "default"} weight={isActive ? "semibold" : "normal"} isSkeleton={isLoading}>{node.label}</Text>
                        {node.isEdited ? <StatusDot
                            props={{ tone: "warning", label: data.editedLabel ?? "Locally edited" }}
                            isLoading={isLoading}
                        /> : null}
                    </li>
                })}
            </ul>
        </nav>
    )
}
