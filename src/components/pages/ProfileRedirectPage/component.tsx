import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Text } from "@/components/leaves/Text"
import { profileRedirectStateClassName } from "./classNames"

/** Visible lifecycle while the canonical self-profile destination resolves. */
export type ProfileRedirectPageProps = {
    readonly state: "pending" | "error"
    readonly retryPending: boolean
    readonly on: { readonly retry: () => void }
}

/** Keep Profile entry observable instead of handing the host an unexplained blank body. */
export const ProfileRedirectPageBase = (props: ProfileRedirectPageProps) => {
    if (props.state === "error") {
        return <div className={profileRedirectStateClassName}><SurfaceCard><EmptyNotice props={{ icon: "retry", message: "Chưa mở được hồ sơ của bạn.", description: "Kiểm tra kết nối rồi thử lại. Dữ liệu hồ sơ đã lưu không bị thay đổi.", actionLabel: "Thử lại", actionIcon: "retry", isPending: props.retryPending }} on={{ act: props.on.retry }} /></SurfaceCard></div> // vn-ok: localized Profile-entry recovery state.
    }
    return <div className={profileRedirectStateClassName} role="status" aria-live="polite" aria-busy="true"><SurfaceCard isLoading><Text props={{ content: "Đang mở hồ sơ của bạn…", tone: "muted", live: "polite" }} isLoading /></SurfaceCard></div> // vn-ok: localized Profile-entry pending state.
}
