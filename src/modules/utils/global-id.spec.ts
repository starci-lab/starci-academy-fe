import { describe, expect, it } from "vitest"
import { fromGlobalId } from "./global-id"

describe("fromGlobalId", () => {
    it("decodes an entity name and colon-safe raw id", () => {
        expect(fromGlobalId(btoa("UserEntity:part:two"))).toEqual({ entityName: "UserEntity", id: "part:two" })
    })

    it("rejects malformed values without returning the opaque input", () => {
        expect(fromGlobalId("not-base64!" )).toBeNull()
        expect(fromGlobalId(btoa("missing-separator"))).toBeNull()
    })
})
