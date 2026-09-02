import type { ReactNode } from "react"
import { Dropdown, Header } from "@heroui/react"
import { Icon, iconSourceFor, type IconName } from "@/components/leaves/Icon"
import { dropdownDangerItemClassName, dropdownHeaderClassName, dropdownTriggerClassName } from "./classNames"

/** Placement choices exposed without leaking the vendor vocabulary beyond the branch. */
export type DropdownBranchPlacement = "bottom left" | "bottom right" | "top left" | "top right"

/** One menu item described by its caller without exposing HeroUI anatomy. */
export type DropdownBranchItemData<I extends string> = {
    readonly id: I
    readonly label: string
    readonly icon?: IconName
    readonly isDisabled?: boolean
    readonly tone?: "default" | "danger"
    readonly showsIndicator?: boolean
}

/** One semantic section in a menu. */
export type DropdownBranchSectionData<I extends string> = {
    readonly items: ReadonlyArray<DropdownBranchItemData<I>>
}

/** Data the branch projects into complete vendor dropdown anatomy. */
export type DropdownBranchData<I extends string> = {
    readonly label: string
    readonly placement?: DropdownBranchPlacement
    readonly sections: ReadonlyArray<DropdownBranchSectionData<I>>
    readonly selectionMode?: "single"
    readonly selectedId?: I
}

/** Menu selection reported without putting functions in item data. */
export type DropdownBranchActions<I extends string> = {
    readonly action?: (id: I) => void
}

/** Props for the content-agnostic dropdown mechanics. */
export type DropdownBranchProps<I extends string> = {
    readonly props: DropdownBranchData<I>
    readonly on?: DropdownBranchActions<I>
    /** One closed atomic control rendered by the vendor trigger. */
    readonly trigger: ReactNode
    /** Optional checked content node rendered before the menu. */
    readonly header?: ReactNode
}

/**
 * BRANCH - the vendor's trigger, popover, focus, keyboard, section and item mechanics.
 *
 * Callers decide item meaning and grouping as data. This branch alone expands that data into the
 * complete HeroUI compound structure, while every injected visual is a typed child.
 */
export const DropdownBranch = <const I extends string>(props: DropdownBranchProps<I>) => (
    <Dropdown>
        <Dropdown.Trigger
            aria-label={props.props.label}
            className={dropdownTriggerClassName}
        >
            {props.trigger}
        </Dropdown.Trigger>
        <Dropdown.Popover placement={props.props.placement ?? "bottom right"}>
            {props.header === undefined ? null : (
                <Header className={dropdownHeaderClassName}>
                    {props.header}
                </Header>
            )}
            <Dropdown.Menu
                aria-label={props.props.label}
                selectionMode={props.props.selectionMode}
                selectedKeys={props.props.selectedId === undefined ? undefined : new Set([props.props.selectedId])}
            >
                {props.props.sections.map((section, sectionIndex) => (
                    <Dropdown.Section key={"section-" + sectionIndex}>
                        {section.items.map((item) => (
                            <Dropdown.Item
                                key={item.id}
                                id={item.id}
                                textValue={item.label}
                                isDisabled={item.isDisabled}
                                className={item.tone === "danger" ? dropdownDangerItemClassName : undefined}
                                onAction={() => props.on?.action?.(item.id)}
                            >
                                {item.showsIndicator === true ? <Dropdown.ItemIndicator /> : null}
                                {item.icon === undefined ? null : <Icon source={iconSourceFor(item.icon, "leading")} usage={"leading"} />}
                                {item.label}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Section>
                ))}
            </Dropdown.Menu>
        </Dropdown.Popover>
    </Dropdown>
)
