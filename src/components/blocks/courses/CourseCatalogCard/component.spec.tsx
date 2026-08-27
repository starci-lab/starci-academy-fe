import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CourseCatalogCardBase } from "./component"
describe("CourseCatalogCardBase", () => { it("renders course identity and pricing", () => { render(<CourseCatalogCardBase state="ready" props={{ id: "c", title: "React", price: "$10", viewLabel: "View" }} />); expect(screen.getByRole("heading", { name: "React" })).toBeInTheDocument(); expect(screen.getByText("$10")).toBeInTheDocument() }) })
