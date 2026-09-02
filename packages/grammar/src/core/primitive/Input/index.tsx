"use client"

import { useState, type ComponentType, type ReactNode } from "react"
import {
    Description as HeroDescription,
    ErrorMessage as HeroErrorMessage,
    Input as HeroInput,
    Label as HeroLabel,
    Skeleton as HeroSkeleton,
    TextField as HeroTextField,
    cn,
} from "@heroui/react"

export type InputKind = "email" | "password" | "newPassword" | "code" | "text"
export type InputVariant = "primary" | "secondary"

type InputIcon = ComponentType<{ readonly className?: string }>

export type InputProps = {
    readonly id: string
    readonly name: string
    readonly label: ReactNode
    readonly kind?: InputKind
    readonly variant?: InputVariant
    readonly placeholder?: string
    readonly defaultValue?: string
    readonly value?: string
    readonly hint?: ReactNode
    readonly errorMessage?: ReactNode
    readonly isError?: boolean
    readonly isDisabled?: boolean
    readonly isRequired?: boolean
    readonly isSkeleton?: boolean
    readonly revealLabel?: string
    readonly hideLabel?: string
    readonly revealIcon?: InputIcon
    readonly hideIcon?: InputIcon
    readonly onValueChange?: (value: string) => void
}

const KINDS = {
    email: { type: "email", autoComplete: "email", inputMode: "email" },
    password: { type: "password", autoComplete: "current-password", inputMode: "text" },
    newPassword: { type: "password", autoComplete: "new-password", inputMode: "text" },
    code: { type: "text", autoComplete: "one-time-code", inputMode: "numeric" },
    text: { type: "text", autoComplete: "off", inputMode: "text" },
} as const

/** Core ownership boundary for label, guidance, control state, and validation copy. */
export const Input = ({
    id,
    name,
    label,
    kind: kindName = "text",
    variant = "primary",
    placeholder,
    defaultValue,
    value,
    hint,
    errorMessage,
    isError = false,
    isDisabled = false,
    isRequired = false,
    isSkeleton = false,
    revealLabel,
    hideLabel,
    revealIcon: RevealIcon,
    hideIcon: HideIcon,
    onValueChange,
}: InputProps) => {
    const [isRevealed, setIsRevealed] = useState(false)
    const kind = KINDS[kindName]
    const isSecret = kindName === "password" || kindName === "newPassword"
    const invalid = isError || errorMessage != null
    const toggleLabel = isRevealed ? hideLabel : revealLabel
    const ToggleIcon = isRevealed ? HideIcon : RevealIcon

    if (isSkeleton) {
        return (
            <div data-tier="atom" data-component="Input" data-state="skeleton" className="grid gap-2">
                <HeroSkeleton className="h-4 w-1/3 rounded-md" />
                <HeroSkeleton className="h-10 w-full rounded-field" />
            </div>
        )
    }

    return (
        <HeroTextField
            data-tier="atom"
            data-component="Input"
            fullWidth
            variant={variant}
            isInvalid={invalid}
            isDisabled={isDisabled}
            isRequired={isRequired}
            className="grid gap-2"
        >
            <HeroLabel>{label}</HeroLabel>
            {hint == null ? null : <HeroDescription>{hint}</HeroDescription>}
            <div className="relative flex items-center">
                <HeroInput
                    id={id}
                    name={name}
                    type={isSecret && isRevealed ? "text" : kind.type}
                    autoComplete={kind.autoComplete}
                    inputMode={kind.inputMode}
                    {...(placeholder === undefined ? {} : { placeholder })}
                    {...(value === undefined
                        ? defaultValue === undefined ? {} : { defaultValue }
                        : { value })}
                    fullWidth
                    className={cn(isSecret && toggleLabel !== undefined ? "pr-9" : undefined) ?? ""}
                    onChange={(event) => onValueChange?.(event.target.value)}
                />
                {!isSecret || toggleLabel === undefined ? null : (
                    <button
                        type="button"
                        aria-label={toggleLabel}
                        disabled={isDisabled}
                        className="text-muted absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer disabled:cursor-default [&_svg]:size-4"
                        onClick={() => setIsRevealed((current) => !current)}
                    >
                        {ToggleIcon === undefined ? <span className="text-xs">{toggleLabel}</span> : <ToggleIcon className="size-4" />}
                    </button>
                )}
            </div>
            {errorMessage == null ? null : <HeroErrorMessage>{errorMessage}</HeroErrorMessage>}
        </HeroTextField>
    )
}
