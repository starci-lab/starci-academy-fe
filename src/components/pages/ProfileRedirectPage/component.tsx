import { SurfaceCard } from "@starci/grammar/common"
import { Icon } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
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
        return <div className={profileRedirectStateClassName}><SurfaceCard composition="joined"><EmptyNotice message={"Chưa mở được hồ sơ của bạn."} description={"Kiểm tra kết nối rồi thử lại. Dữ liệu hồ sơ đã lưu không bị thay đổi."} actionLabel={"Thử lại"} isActionPending={props.retryPending} iconSource={iconSourceFor("retry", "leading")} actionStartContent={<Icon source={iconSourceFor("retry", "chip")} role="chip" />} onAction={({ act: props.on.retry })?.act} /></SurfaceCard></div> // vn-ok: localized Profile-entry recovery state.
    }
    return <div className={profileRedirectStateClassName} role="status" aria-live="polite" aria-busy="true"><SurfaceCard composition="joined" state="pending"><Text tone={"muted"} live={"polite"} isSkeleton>{"Đang mở hồ sơ của bạn…"}</Text></SurfaceCard></div> // vn-ok: localized Profile-entry pending state.
}
