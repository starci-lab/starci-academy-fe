import type { ReactNode } from "react"
import { Dropdown, Header } from "@heroui/react"
import { Icon, type IconName } from "@/components/leaves/Icon"

/** Placement choices exposed without leaking the vendor vocabulary beyond the shell. */
export type DropdownShellPlacement = "bottom left" | "bottom right" | "top left" | "top right"

/** One menu item described by its caller without exposing HeroUI anatomy. */
export type DropdownShellItemData<I extends string> = {
    readonly id: I
    readonly label: string
    readonly icon?: IconName
    readonly isDisabled?: boolean
    readonly tone?: "default" | "danger"
    readonly showsIndicator?: boolean
}

/** One semantic section in a menu. */
export type DropdownShellSectionData<I extends string> = {
    readonly items: ReadonlyArray<DropdownShellItemData<I>>
}

/** Data the shell projects into complete vendor dropdown anatomy. */
export type DropdownShellData<I extends string> = {
    readonly label: string
    readonly placement?: DropdownShellPlacement
    readonly sections: ReadonlyArray<DropdownShellSectionData<I>>
    readonly selectionMode?: "single"
    readonly selectedId?: I
}

/** Menu selection reported without putting functions in item data. */
export type DropdownShellActions<I extends string> = {
    readonly action?: (id: I) => void
}

/** Props for the content-agnostic dropdown mechanics. */
export type DropdownShellProps<I extends string> = {
    readonly props: DropdownShellData<I>
    readonly on?: DropdownShellActions<I>
    readonly trigger: ReactNode
    readonly header?: ReactNode
}

/**
 * SHELL - the vendor's trigger, popover, focus, keyboard, section and item mechanics.
 *
 * Callers decide item meaning and grouping as data. This shell alone expands that data into the
 * complete HeroUI compound structure, so no block has to know that Section and Item exist.
 */
export const DropdownShell = <const I extends string>(input: DropdownShellProps<I>) => (
    <Dropdown>
        <Dropdown.Trigger
            aria-label={input.props.label}
            className="button button--md button--tertiary button--icon-only rounded-full"
        >
            {input.trigger}
        </Dropdown.Trigger>
        <Dropdown.Popover placement={input.props.placement ?? "bottom right"}>
            {input.header === undefined ? null : (
                <Header className="border-b border-separator">
                    {input.header}
                </Header>
            )}
            <Dropdown.Menu
                aria-label={input.props.label}
                selectionMode={input.props.selectionMode}
                selectedKeys={input.props.selectedId === undefined ? undefined : new Set([input.props.selectedId])}
            >
                {input.props.sections.map((section, sectionIndex) => (
                    <Dropdown.Section key={"section-" + sectionIndex}>
                        {section.items.map((item) => (
                            <Dropdown.Item
                                key={item.id}
                                id={item.id}
                                textValue={item.label}
                                isDisabled={item.isDisabled}
                                className={item.tone === "danger" ? "text-danger-soft-foreground" : undefined}
                                onAction={() => input.on?.action?.(item.id)}
                            >
                                {item.showsIndicator === true ? <Dropdown.ItemIndicator /> : null}
                                {item.icon === undefined ? null : <Icon props={{ name: item.icon, role: "leading" }} />}
                                {item.label}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Section>
                ))}
            </Dropdown.Menu>
        </Dropdown.Popover>
    </Dropdown>
)

/** Source-level tier marker for the content-agnostic dropdown mechanics. */
export const meta = { shape: "shell", mechanics: true, world: "pure" } as const
