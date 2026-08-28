# StarCi Academy UAT Journal

Thư mục này lưu các lần review sản phẩm bằng ba quyết định độc lập `Behavior / UX / UI` và bằng chứng runtime. Nó không gọi hoặc sao chép verdict từ bộ StarCi skills hiện tại.

## Ownership

`.uat` thuộc repository FE của dự án vì nó theo dõi surface và customer journey. Backend vẫn sở hữu schema, migration, fixture infrastructure và secret stack; mỗi review vì vậy vẫn phải đóng băng cả FE và BE ref. Không tạo một `.uat` thứ hai trong backend.

## Mục đích

- Ghi rõ chính xác source nào đã được review.
- Tách ba góc nhìn `UX`, `UI` và `Behavior` để một điểm mạnh không che một điểm yếu khác.
- Giữ nhận định ban đầu của trò và phản biện của thầy riêng để hiệu chỉnh cách nhìn trong các review đầu.
- Biến các review sau thành một nhịp làm việc ổn định mà vẫn giữ quyền phản biện.

## Vì sao dùng “Behavior” thay cho “Logic”

“Logic” dễ bị hiểu là đọc code nội bộ. `Behavior` yêu cầu kiểm chứng điều sản phẩm thực sự làm qua UI, dữ liệu, API/event và trạng thái runtime. Nó bao gồm business rule, authentication/authorization, persistence, async job, realtime, retry/recovery và consistency.

Ba trục review:

| Trục | Câu hỏi chính | Không được dùng để kết luận |
|---|---|---|
| UX | Người dùng có hiểu, đi hết journey và phục hồi khi có lỗi không? Backend có thích ứng với trải nghiệm cần thiết không? | Không chấm visual fidelity hoặc data correctness chỉ từ cảm giác. |
| UI | Surface có chia vùng, phân cấp, render data/state và responsive đúng không? | Không kết luận journey hay business rule pass. |
| Behavior | Sản phẩm có thực thi đúng rule, quyền, dữ liệu, event, realtime và failure semantics không? | Không kết luận giao diện đẹp hoặc dễ dùng. |

Mỗi finding có đúng một primary owner. Nếu ảnh hưởng chéo, ghi các secondary axes thay vì nhân bản finding ở nhiều bảng.

## Git provenance bắt buộc

Không bao giờ chỉ ghi branch vì branch có thể di chuyển. Mỗi review phải đóng băng:

- journal repository, branch và commit;
- FE repository, branch và commit;
- BE repository, branch và commit;
- comparison ref nếu có;
- dirty files liên quan;
- ngày giờ và timezone;
- runtime URL/build mode;
- role/account fixture, nhưng không ghi password, token, cookie hoặc PII.

Workspace lúc khởi tạo journal:

| Vai trò | Repository | Branch | Commit |
|---|---|---|---|
| Journal + FE target | `starci-academy-fe` | `main` | `6195812625ad5083b0b828eb6971e211d33fff47` |
| BE runtime/fixture owner | `starci-academy-backend` | `mtp` | `c10c3f7719ed102e85813ab9380231e995ba3b85` |

`.v63` và `.uat` đang là thay đổi local chưa commit. Mỗi review mới phải ghi lại provenance; không kế thừa bảng trên bằng giả định.

## Luồng test tay

1. **Freeze target** — ghi page/journey, branch, commit, role, fixture, viewport và runtime URL.
2. **State the user goal** — mô tả người dùng muốn hoàn thành điều gì, điểm vào và điều kiện thành công.
3. **UX runtime gate** — kiểm tra bốn điều trước tiên: skeleton, loading, render completeness và journey completion.
4. **Behavior decision** — quyết business semantics, permissions, API/event, realtime, persistence và failure handling.
5. **UI decision** — chỉ quyết theo `fe.ui` + Grammar Common + đúng một selected Grammar.
6. **Three-decision freeze** — mỗi case phải có đủ `Behavior / UX / UI` trước khi đóng.
7. **User review** — thầy ghi chỗ đồng ý/không đồng ý và điều trò hiểu sai.
8. **Calibration** — giải thích khác biệt bằng evidence; không đổi kết luận chỉ để hai bên giống nhau.
9. **Decision** — `accepted`, `needs-work`, `blocked` hoặc `retest-required`.
10. **Promote learning carefully** — điều chỉ đúng cho page ở lại `.uat`; nguyên tắc tái sử dụng đã được thầy chốt mới chuyển sang `.v63` hoặc authority UI/Grammar thích hợp.

## UX runtime gate

UX luôn được kiểm tra trước bằng bốn gate độc lập:

| Gate | PASS khi | FAIL khi | BLOCKED khi |
|---|---|---|---|
| Skeleton | Xuất hiện đúng lúc, giữ đúng cấu trúc/measure của final content và không gây layout shift đáng kể. | Thiếu, sai hình, nhấp nháy hoặc khác cấu trúc final render. | Không tạo được trạng thái cold/delayed load để quan sát. |
| Loading | Mọi chờ đợi có feedback đúng chỗ; action chống submit lặp và trạng thái pending không làm người dùng mất phương hướng. | Chờ im lặng, feedback sai chỗ, double-submit hoặc pending làm vỡ flow. | Không tạo được async state cần kiểm tra. |
| Render completeness | Success, empty, error và dữ liệu chính/phụ cần cho task đều render đủ, không có vùng trống vô nghĩa hay nội dung biến mất. | Thiếu vùng, thiếu state, data bị cắt hoặc surface chỉ render một phần. | Fixture/runtime không cung cấp state cần quan sát. |
| Journey completion | Người dùng đi từ entry đến success condition bằng visible controls, bao gồm failure/retry/recovery cần thiết. | Flow dead-end, sai container, mất feedback hoặc không đạt success condition. | Thiếu account, mailbox, service hoặc dữ liệu fixture. |

Một UX journey chỉ `PASS` khi mọi gate áp dụng trong scope đều pass; gate `N/A` phải có lý do. Không lấy UI đẹp để bù journey fail.

## Decision và execution state

Behavior và UX có decision riêng:

- `PASS`: evidence đủ và không còn finding cần sửa trong scope.
- `FAIL`: evidence trực tiếp chứng minh ít nhất một requirement không đạt.
- `BLOCKED`: thiếu runtime, fixture, authority hoặc evidence để kết luận.
- `N/A`: trục thực sự không áp dụng; phải ghi lý do.

UI chỉ được quyết bằng `fe.ui` + Grammar Common + selected Grammar:

- `PASS`: runtime khớp toàn bộ authority áp dụng.
- `FAIL`: runtime trái authority; phải sửa source rồi retest.
- `SUSPENSE`: authority chưa đủ hoặc mâu thuẫn nên chưa biết phải render thế nào. Ghi đúng câu hỏi render để thầy feedback; không đoán.

`SUSPENSE` không phải runtime `BLOCKED`. Goal của calibration là **feedback → sửa → retest cho đến `NO SUSPENSE`**.

## Calibration mode

Các page đầu ở trạng thái `calibrating` cho đến khi thầy xác nhận tư duy của trò đã ổn định.

- Trò review và chốt verdict trước.
- Thầy review cùng evidence và phản biện.
- Review file giữ cả kết luận ban đầu, correction của thầy và kết luận sau thảo luận.
- Khi bất đồng, ghi rõ disagreement và evidence; không âm thầm đổi lịch sử.
- Khi thầy xác nhận một learning có tính tái sử dụng, ghi nó vào `.v63` một lần thay vì nhắc lại trong mọi review.
- Sau calibration, trò tự chạy cùng flow; chỉ hỏi lại khi gặp decision mới hoặc evidence mâu thuẫn.

## Evidence hygiene

- Screenshot phải được crop/sanitize trước khi commit nếu có tên, email, token hoặc dữ liệu cá nhân.
- Browser automation chỉ thu evidence; assertion “có render/có click” không đủ kết luận UI đúng. `UI PASS` cần screenshot ở đúng state cùng DOM/computed evidence cho visual owner áp dụng.
- Screenshot của mỗi case đặt tại `reviews/<feature>/<case>/screenshots/` và được reference bằng relative link từ `<case>.md`.
- Chỉ lưu checkpoint quan trọng: refusal/error, pending khi có ý nghĩa quyết định, và recovery/destination. Không chụp mọi bước.
- Mỗi ảnh ghi rõ `Proves` và `Does not prove`; thiếu ảnh phải ghi evidence boundary, không suy diễn visual từ test xanh.
- Không lưu secret, credential, cookie, raw token hoặc production data trong `.uat`.
- Ghi cả positive evidence cho pass; “không thấy lỗi” không phải evidence.
- Source inspection được dùng để giải thích finding, không thay runtime proof.
- Một review cũ không chứng minh revision mới pass.

## UAT account isolation

- Một case happy hoặc một failure/recovery journey chính xác dùng đúng một identity riêng; không tái dùng account giữa các case.
- Một case sở hữu đúng một browser session. Khi được phép scale, case cũng sở hữu đúng một agent; không dùng chung page/tab/session giữa agents.
- `accounts.json` là shared append-or-merge registry: mọi task chỉ merge case mình sở hữu và phải giữ nguyên case hiện hữu; không overwrite toàn file.
- Mọi fixture có `is_uat: true` trong `.uat/accounts.json`; account thật trong Keycloak còn có attributes `is_uat=true` và `uat_case=<case id>`.
- App user có `UserEntity.isUat` lưu ở cột `users.is_uat`; field này cố ý không public qua GraphQL.
- Password UAT được sinh ngẫu nhiên và lưu theo stack convention tại `.stacks/dev/runtime/files/uat-account-password.key.enc`; plaintext local chỉ xuất hiện sau khi trusted device decrypt, không đi vào Git hoặc review.
- `accounts.json.password_binding` và dòng `Password binding` trong mỗi case ghi rõ encrypted stack ref để người chạy biết credential owner; chúng không chứa giá trị password.
- Case cần chứng minh “account không tồn tại” vẫn có identity reservation riêng với `initial_state: absent`; script không tạo identity đó.
- Password/OTP/token không được ghi vào registry hay review. Password chỉ được provisioner đọc từ stack secret hoặc biến môi trường.
- Flow cần identity ngoài UAT (Google/GitHub OAuth hoặc account do người dùng sở hữu) phải ghi `[need user approval: <đề xuất account/action>]` và dừng trước thao tác dùng credential. Không biến blocker này thành `FAIL`.

## Cấu trúc

```text
.uat/
├── accounts.json
├── README.md
├── REVIEW-TEMPLATE.md
├── scripts/
│   └── provision-accounts.mjs
└── reviews/
    └── <feature>/
        ├── <flow>-<exact-journey>.md
        └── <flow>-<exact-journey>/
            └── screenshots/
                └── <important-checkpoint>.png
```

Authentication case-level target:

```text
.uat/reviews/authentication/
├── sign-in-happy.md
├── sign-in-password-failed.md
├── sign-in-not-receive-otp.md
├── sign-in-invalid-otp.md
├── sign-in-expired-otp.md
├── sign-in-missing-challenge.md
├── sign-in-server-unavailable.md
├── sign-in-rate-limited.md
├── sign-in-duplicate-submission.md
├── sign-in-unhappy.md (retired umbrella provenance; verdict frozen)
├── sign-up-happy.md
├── sign-up-existing-email.md
├── sign-up-password-mismatch.md
├── sign-up-terms-required.md
├── sign-up-unhappy.md (retired umbrella provenance; verdict frozen)
├── forgot-password-happy.md
└── forgot-password-unhappy.md
```

Mỗi active file là đúng một UAT case và có một account/reservation, agent owner, browser session, provenance và evidence riêng. File bắt buộc ba section `Behavior decision`, `UX decision`, `UI decision`, literal `TEACHER feedback`, kèm repair/retest loop và terminal gate `NO SUSPENSE`.

Các file journey gộp cũ được giữ tạm như evidence calibration lịch sử; migrate từng case sau khi chính case đó được chạy lại. Không bulk-rewrite verdict cũ.

Chỉ tạo thư mục `<case>/screenshots/` khi có ảnh đã sanitize cần lưu thật; không tạo placeholder. Artifact không phải ảnh chỉ tạo cạnh case khi thật sự cần và phải được journal reference.

## Validation

Chạy `node .uat/scripts/validate-journal.mjs` từ FE repository để kiểm case/account isolation, pilot registry, review inventory và contract ba quyết định trước khi giao artifact.
