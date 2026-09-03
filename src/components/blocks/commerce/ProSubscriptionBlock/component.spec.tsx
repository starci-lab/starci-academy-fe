import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ProSubscriptionBlockBase, type ProSubscriptionBlockLabels } from "./component"

const labels: ProSubscriptionBlockLabels = {
    breadcrumbLabel: "Pro path",
    breadcrumbHome: "Home",
    breadcrumbCurrent: "StarCi Pro",
    title: "Mở toàn bộ hành trình học với StarCi Pro",
    description: "Full learner access.",
    benefitsTitle: "Bạn nhận được gì",
    benefitsDescription: "Một quyền truy cập.",
    journeyAlt: "Hành trình StarCi Pro từ học tập đến mục tiêu nghề nghiệp",
    disclosuresTitle: "Thông tin cần biết",
    benefits: [
        { title: "Học tập", description: "Toàn bộ khóa học" },
        { title: "Luyện tập", description: "Coding và phỏng vấn thử" },
        { title: "Cộng đồng", description: "Global Chat" },
        { title: "Nghề nghiệp", description: "Dự án cá nhân" },
    ],
    aiTitle: "AI được tính như thế nào?",
    aiDescription: "AI có hạn mức và không phải không giới hạn.",
    activationTitle: "Thanh toán và kích hoạt",
    activationDescription: "Chỉ mở quyền sau khi backend xác minh.",
    planBadge: "Full access",
    period: "cho 1 tháng",
    renewalNote: "Mỗi lần gia hạn cần xác nhận.",
    signedOutAction: "Đăng nhập để mua StarCi Pro",
    signedOutHelper: "Bạn cần đăng nhập.",
    purchaseAction: "Mua StarCi Pro – 229.000 ₫",
    pendingTitle: "Đang xác minh thanh toán",
    pendingDescription: "Không mua thêm.",
    activeTitle: "StarCi Pro đang hoạt động",
    activeDescription: "Bạn đang có quyền Pro.",
    cancelledMessage: "Đã quay lại",
    failedTitle: "Chưa thể tải thông tin gói",
    failedDescription: "Vui lòng thử lại.",
    retry: "Thử lại",
}

describe("ProSubscriptionBlockBase", () => {
    it("keeps the offer content ahead of the decision rail in one primary-rail layout", () => {
        const { container } = render(<ProSubscriptionBlockBase blockState="ready" data={{ labels, planName: "StarCi Pro", price: "229.000 ₫", purchaseState: "eligible", isSignedOut: true }} />)
        const primaryRegion = container.querySelector("[data-grammar-primary-region='true']")
        const railRegion = container.querySelector("[data-grammar-rail-region='true']")
        expect(primaryRegion).toBeInTheDocument()
        expect(railRegion).toBeInTheDocument()
        // The decision leads once the container collapses; Grammar owns the reflow, the block only names the order.
        expect(container.querySelector("[data-grammar-layout-collapsed-order]")).toHaveAttribute("data-grammar-layout-collapsed-order", "rail-first")
        expect(
            (primaryRegion?.compareDocumentPosition(railRegion as Node) ?? 0) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy()
    })

    it("renders one signed-out offer with flush benefit bands and one joined disclosure surface", () => {
        const purchase = vi.fn()
        const goHome = vi.fn()
        const { container } = render(<ProSubscriptionBlockBase blockState="ready" data={{ labels, planName: "StarCi Pro", price: "229.000 ₫", purchaseState: "eligible", isSignedOut: true }} on={{ purchase, goHome }} />)
        expect(screen.getByRole("heading", { level: 1, name: labels.title })).toBeInTheDocument()
        expect(screen.getByLabelText(labels.breadcrumbLabel)).toBeInTheDocument()
        fireEvent.click(screen.getByText(labels.breadcrumbHome))
        expect(goHome).toHaveBeenCalledOnce()
        expect(screen.getByLabelText(labels.breadcrumbLabel).querySelector("[aria-current='page']")).toHaveTextContent(labels.breadcrumbCurrent)
        const journeyImage = screen.getByRole("img", { name: labels.journeyAlt })
        expect(journeyImage).toHaveClass("block", "h-auto", "w-full")
        expect(journeyImage.parentElement).toHaveClass("border-t", "border-separator", "bg-surface-secondary")
        expect(screen.getByText(labels.benefitsTitle)).toHaveAttribute("data-grammar-label", "true")
        expect(screen.getByText(labels.benefitsDescription).parentElement).toHaveClass("bg-surface-secondary", "px-4", "py-3")
        expect(screen.getByText(labels.benefitsDescription).closest("[data-grammar-surface-content='true']")).toHaveAttribute("data-grammar-surface-composition", "joined")
        expect(screen.getByText(labels.benefits[3]!.title)).toHaveAttribute("data-weight", "semibold")
        expect(screen.getByText(labels.benefits[3]!.title)).toHaveAttribute("data-size", "sm")
        expect(screen.getByText(labels.benefits[3]!.title)).toHaveAttribute("data-tone", "default")
        expect(screen.getByText(labels.benefits[3]!.description)).toHaveAttribute("data-size", "xs")
        expect(screen.getByText(labels.benefits[3]!.description)).toHaveAttribute("data-weight", "normal")
        expect(screen.getByText(labels.benefits[3]!.description)).toHaveAttribute("data-tone", "muted")
        expect(screen.getByText(labels.benefits[3]!.description)).toHaveClass("starci-core-text")
        const disclosureSurface = container.querySelector("[data-grammar-surface-accordion-card='true']")
        expect(disclosureSurface).toBeInTheDocument()
        expect(disclosureSurface?.closest("[data-grammar-surface-card='true']")).toBeNull()
        expect(screen.getByRole("heading", { level: 3, name: labels.disclosuresTitle })).toHaveAttribute("data-grammar-label", "true")
        expect(container.querySelector("[data-grammar-accordion-shell='true']")).toHaveClass("starci-core-surface")
        expect(container.querySelector("[data-grammar-accordion-shell='true']")).toHaveAttribute("data-grammar-frame", "bounded")
        expect(container.querySelectorAll("[data-grammar-accordion-row='true']")).toHaveLength(2)
        const purchaseButton = screen.getByRole("button", { name: labels.signedOutAction })
        // A long localized purchase label fills the action band and wraps inside it; that is
        // Grammar's `width="fill"`, not a descendant width utility reaching through the boundary.
        expect(purchaseButton).toHaveAttribute("data-width", "fill")
        expect(purchaseButton.parentElement).toBeInTheDocument()
        expect(purchaseButton.parentElement?.previousElementSibling).toHaveAttribute("data-has-actions", "true")
        const aiTrigger = screen.getByRole("button", { name: labels.aiTitle })
        expect(screen.getByText(labels.aiTitle)).toHaveAttribute("data-size", "sm")
        expect(screen.getByText(labels.aiTitle)).toHaveAttribute("data-weight", "semibold")
        expect(screen.getByText(labels.aiTitle)).toHaveClass("starci-core-text")
        expect(aiTrigger.closest("[data-grammar-accordion-row='true']")).toHaveAttribute("data-grammar-disclosure-state", "closed")
        fireEvent.click(aiTrigger)
        expect(aiTrigger.closest("[data-grammar-accordion-row='true']")).toHaveAttribute("data-grammar-disclosure-state", "open")
        expect(screen.getByText(labels.aiDescription)).toBeVisible()
        expect(screen.getByText(labels.aiDescription)).toHaveAttribute("data-weight", "normal")
        expect(screen.getByText(labels.aiDescription)).toHaveAttribute("data-tone", "default")
        expect(screen.getByText(labels.aiDescription)).toHaveClass("starci-core-text")
        fireEvent.click(purchaseButton)
        expect(purchase).toHaveBeenCalledOnce()
    })

    it("suppresses duplicate purchase while payment is being verified", () => {
        render(<ProSubscriptionBlockBase blockState="ready" data={{ labels, planName: "StarCi Pro", price: "229.000 ₫", purchaseState: "verification-pending", isSignedOut: false }} />)
        expect(screen.getByRole("status")).toHaveTextContent(labels.pendingTitle)
        expect(screen.queryByRole("button", { name: labels.purchaseAction })).not.toBeInTheDocument()
    })

    it("suppresses checkout for an active subscriber", () => {
        render(<ProSubscriptionBlockBase blockState="ready" data={{ labels, planName: "StarCi Pro", price: "229.000 ₫", purchaseState: "active", isSignedOut: false }} />)
        expect(screen.getByRole("status")).toHaveTextContent(labels.activeTitle)
        expect(screen.queryByRole("button", { name: labels.purchaseAction })).not.toBeInTheDocument()
    })

    it("exposes a retry action when the offer cannot load", () => {
        const retry = vi.fn()
        render(<ProSubscriptionBlockBase blockState="failed" data={{ labels, purchaseState: "eligible", isSignedOut: true }} on={{ retry }} />)
        fireEvent.click(screen.getByRole("button", { name: labels.retry }))
        expect(retry).toHaveBeenCalledOnce()
    })
})
