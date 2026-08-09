import { describe, expect, it } from "vitest"
import {
    DASHBOARD_SECTION_CHAIN_NAMES,
    type DashboardSectionChain,
} from "@/components/contracts/chains/dashboard"
import { _IdentityStats, identityStatsChain } from "@/components/blocks/dashboard/IdentityStats/component"
import { _MyCoursesProgress, myCoursesProgressChain } from "@/components/blocks/dashboard/MyCoursesProgress/component"
import { _StreakStrip, streakStripChain } from "@/components/blocks/dashboard/StreakStrip/component"

/**
 * What these tests guard: that the dashboard chain is WIRED rather than described. Each block
 * declares its own entry, so the pairing of a composition name to a component is real code the
 * type checker walks - and the negative controls below prove the pin actually bites.
 *
 * The `@ts-expect-error` cases are the heart of this file. A chain that accepted the wrong body
 * would still pass every runtime assertion here, so the constraint is tested the only way a type
 * constraint can be: by writing the mistake and requiring the compiler to refuse it. `tsc
 * --noEmit` covers this file, so a pin that stopped biting fails the gate rather than this test.
 *
 * A twin test is allowed the value imports the rest of this folder is not - see
 * `starci-fe/contracts-type-imports-only`, which exempts twins for exactly this reason.
 */

/** Accepts a well-formed entry and nothing else - the one place a wrong pairing is offered. */
const asDashboardChain = (entry: DashboardSectionChain): DashboardSectionChain => entry

describe("DASHBOARD_SECTION_CHAIN_NAMES", () => {
    it("lists every composition the dashboard actually has", () => {
        expect([...DASHBOARD_SECTION_CHAIN_NAMES]).toEqual([
            "identity-stats",
            "courses-progress",
            "streak-strip",
        ])
    })

    it("names each composition once", () => {
        expect(new Set(DASHBOARD_SECTION_CHAIN_NAMES).size).toBe(DASHBOARD_SECTION_CHAIN_NAMES.length)
    })
})

describe("the blocks consume their chain", () => {
    it("pins the rail to the stat stack", () => {
        expect(identityStatsChain.name).toBe("identity-stats")
        expect(identityStatsChain.body).toBe(_IdentityStats)
    })

    it("pins the progress region to the course list", () => {
        expect(myCoursesProgressChain.name).toBe("courses-progress")
        expect(myCoursesProgressChain.body).toBe(_MyCoursesProgress)
    })

    it("pins the week region to the streak strip", () => {
        expect(streakStripChain.name).toBe("streak-strip")
        expect(streakStripChain.body).toBe(_StreakStrip)
    })

    it("covers every listed name with a declared entry", () => {
        const declared = [identityStatsChain, myCoursesProgressChain, streakStripChain].map((entry) => entry.name)
        expect(declared.sort()).toEqual([...DASHBOARD_SECTION_CHAIN_NAMES].sort())
    })
})

describe("a wrong body does not compile", () => {
    it("refuses the course list where the stat stack belongs", () => {
        // @ts-expect-error `_MyCoursesProgress` asks for a `count` label the stat stack never resolves, so it cannot fill the rail.
        const rejected = asDashboardChain({ name: "identity-stats", body: _MyCoursesProgress })
        expect(rejected.name).toBe("identity-stats")
    })

    it("refuses the stat stack where the course list belongs", () => {
        // @ts-expect-error `_IdentityStats` asks for a `rows` list the progress region never has, so it cannot fill that body.
        const rejected = asDashboardChain({ name: "courses-progress", body: _IdentityStats })
        expect(rejected.name).toBe("courses-progress")
    })

    it("refuses the streak strip where the course list belongs", () => {
        // @ts-expect-error `_StreakStrip` asks for `current` and `longest` labels the progress region never resolves.
        const rejected = asDashboardChain({ name: "courses-progress", body: _StreakStrip })
        expect(rejected.name).toBe("courses-progress")
    })

    it("refuses the course list where the streak strip belongs", () => {
        // @ts-expect-error `_MyCoursesProgress` asks for a `count` label the week region never resolves.
        const rejected = asDashboardChain({ name: "streak-strip", body: _MyCoursesProgress })
        expect(rejected.name).toBe("streak-strip")
    })

    it("refuses a name that no composition carries", () => {
        // @ts-expect-error `platform-stats` is not a dashboard composition; a chain entry names one that exists.
        const rejected = asDashboardChain({ name: "platform-stats", body: _IdentityStats })
        expect(rejected.name).toBe("platform-stats")
    })
})
