import { createNavigation } from "next-intl/navigation"
import { routing } from "./routing"

/**
 * NAVIGATION THAT KNOWS WHICH LANGUAGE THE READER IS IN.
 *
 * Every `push("/league")` in this codebase used to mean exactly `/league`. With the locale in the
 * path it has to mean `/vi/league` for a Vietnamese reader and `/en/league` for an English one, and
 * the difference cannot be left to each call site: one forgotten prefix drops a reader out of their
 * language mid-journey, and it is invisible until somebody browsing in Vietnamese clicks that one
 * link.
 *
 * So the prefixing happens HERE, once. Call sites keep writing the locale-free path they always
 * wrote - `/league`, `/dashboard`, `/profile/${name}` - and import these helpers instead of
 * `next/navigation`. The import is the only thing that changes, which is also what makes the
 * migration reviewable: a file still importing from `next/navigation` is a file that was missed.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
