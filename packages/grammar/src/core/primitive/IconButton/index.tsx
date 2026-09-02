import { Button as HeroButton, skeletonVariants } from "@heroui/react"
import { Icon, type IconSource } from "../Icon/index.js"

export type IconButtonProps = {
    readonly source: IconSource
    /** Required accessible name for the glyph-only action. */
    readonly label: string
    readonly isActive?: boolean
    readonly isDisabled?: boolean
    readonly isSkeleton?: boolean
    readonly onPress?: () => void
}

const SKELETON_CLASS_NAME = skeletonVariants({ animationType: "shimmer" }).base({
    className: "rounded-full",
})

/** Circular glyph-only action with a mandatory accessible name. */
export const IconButton = ({
    source,
    label,
    isActive = false,
    isDisabled = false,
    isSkeleton = false,
    onPress,
}: IconButtonProps) => (
    <HeroButton
        data-tier="atom"
        data-component="IconButton"
        data-active={isActive ? "true" : "false"}
        data-loading={isSkeleton ? "true" : "false"}
        type="button"
        variant="tertiary"
        className={isSkeleton ? SKELETON_CLASS_NAME : "rounded-full"}
        isIconOnly
        isDisabled={isDisabled || isSkeleton}
        aria-label={label}
        {...(isDisabled || isSkeleton || onPress === undefined ? {} : { onPress })}
    >
        {isSkeleton ? null : <Icon source={source} usage="leading" />}
    </HeroButton>
)
