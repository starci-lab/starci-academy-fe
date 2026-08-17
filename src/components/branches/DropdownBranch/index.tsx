import { Dropdown, Header } from "@heroui/react"
import { Tree } from "@/components/branches/Tree"
import type { ContractKey, ContractPropValue } from "@/components/contracts"
import type { BoundContractComponent, LeafComponent } from "@/components/contracts/props"
import { Icon, type IconName } from "@/components/leaves/Icon"

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
    readonly trigger: LeafComponent<string, Readonly<Record<string, ContractPropValue>>>
    /** Optional checked content node rendered before the menu. */
    readonly header?: LeafComponent<string, Readonly<Record<string, ContractPropValue>>> | BoundContractComponent<ContractKey>
}

/** Render one closed leaf or contract without accepting arbitrary markup. */
const renderTypedContent = (
    content: LeafComponent<string, Readonly<Record<string, ContractPropValue>>> | BoundContractComponent<ContractKey>,
) => {
    if (!("kind" in content)) return content()
    return <Tree contract={content.meta.contract} render={content} />
}

/**
 * BRANCH - the vendor's trigger, popover, focus, keyboard, section and item mechanics.
 *
 * Callers decide item meaning and grouping as data. This branch alone expands that data into the
 * complete HeroUI compound structure, while every injected visual is a typed leaf or contract.
 */
export const DropdownBranch = <const I extends string>(input: DropdownBranchProps<I>) => (
    <Dropdown>
        <Dropdown.Trigger
            aria-label={input.props.label}
            className="button button--md button--tertiary button--icon-only rounded-full"
        >
            {input.trigger()}
        </Dropdown.Trigger>
        <Dropdown.Popover placement={input.props.placement ?? "bottom right"}>
            {input.header === undefined ? null : (
                <Header className="border-b border-separator">
                    {renderTypedContent(input.header)}
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
export const meta = { shape: "branch", mechanics: true, world: "pure" } as const
