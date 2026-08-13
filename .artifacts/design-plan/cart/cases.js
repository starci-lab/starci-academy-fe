/* Direction lab manifest — Plan phase. Directional HTML only; never an Apply baseline. */

const CASE_CSS = `
.sc { --bg:#0a0a0a; --surface:#151515; --surface2:#1d1d1d; --sep:#282828; --fg:#ededed;
      --muted:#8b8b8b; --accent:#ff2d8f; --success:#22c55e; --warn:#f5a524;
      background:var(--bg); color:var(--fg); padding:20px; border-radius:14px;
      font-family:ui-sans-serif,system-ui,"Segoe UI",sans-serif; font-size:14px; line-height:1.5; }
.sc *{box-sizing:border-box}
.sc-split{display:grid;grid-template-columns:1fr 360px;gap:24px;align-items:start}
.sc-lab{color:var(--muted);font-size:11px;letter-spacing:.06em;font-weight:700;margin:0 0 8px}
.sc-page{background:var(--surface);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:14px}
.sc-drawer{background:var(--surface);border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:12px;
           border-left:2px solid var(--accent)}
.sc-h{margin:0;font-size:18px;font-weight:700}
.sc-h2{margin:0;font-size:15px;font-weight:600}
.sc-crumb{color:var(--muted);font-size:12px;margin:0}
.sc-lines{display:flex;flex-direction:column;border:1px solid var(--sep);border-radius:12px;overflow:hidden}
.sc-line{display:grid;grid-template-columns:44px 1fr 6rem 2rem;gap:10px;align-items:center;
         padding:11px 12px;border-top:1px solid var(--sep)}
.sc-line:first-child{border-top:0}
.sc-thumb{width:44px;height:30px;border-radius:6px;background:linear-gradient(135deg,#6d3bd6,#c02a7a)}
.sc-thumb.b{background:linear-gradient(135deg,#2b7f95,#3aa8c1)}
.sc-thumb.c{background:linear-gradient(135deg,#d2691e,#f0913c)}
.sc-name{min-width:0;display:flex;flex-direction:column;gap:1px}
.sc-name strong{font-size:13px;font-weight:600}
.sc-name span{color:var(--muted);font-size:11px}
.sc-price{text-align:right;font-size:12.5px;font-variant-numeric:tabular-nums}
.sc-price s{color:var(--muted);font-size:11px;display:block}
.sc-x{color:var(--muted);text-align:center;cursor:pointer}
.sc-sum{display:flex;flex-direction:column;gap:6px;background:var(--surface2);border-radius:12px;padding:12px}
.sc-row{display:flex;justify-content:space-between;font-size:12.5px;gap:12px}
.sc-row.total{font-size:15px;font-weight:700;padding-top:6px;border-top:1px solid var(--sep)}
.sc-save{color:var(--success)}
.sc-warn{color:var(--warn)}
.sc-btn{background:var(--accent);color:#fff;border:0;border-radius:999px;padding:11px 18px;
        font-size:14px;font-weight:600;cursor:pointer;width:100%}
.sc-btn.ghost{background:transparent;color:var(--fg);border:1px solid var(--sep)}
.sc-btn.auto{width:auto}
.sc-btn.big{padding:14px 18px;font-size:15px}
.sc-switch{display:grid;grid-template-columns:1fr 1fr;gap:4px;background:var(--surface2);
           border-radius:999px;padding:4px}
.sc-switch button{border:0;border-radius:999px;padding:8px 10px;font-size:12.5px;font-weight:600;
                  background:transparent;color:var(--muted);cursor:pointer}
.sc-switch button[aria-pressed="true"]{background:var(--accent);color:#fff}
.sc-sched{display:flex;flex-direction:column;border:1px solid var(--sep);border-radius:12px;overflow:hidden}
.sc-cyc{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:10px 12px;
        border-top:1px solid var(--sep);font-size:12.5px}
.sc-cyc:first-child{border-top:0}
.sc-cyc.now{background:rgba(255,45,143,.08)}
.sc-dot{width:8px;height:8px;border-radius:999px;background:var(--sep)}
.sc-cyc.now .sc-dot{background:var(--accent)}
.sc-cyc b{font-variant-numeric:tabular-nums}
.sc-cyc span{color:var(--muted);font-size:11.5px}
.sc-hint{color:var(--muted);font-size:12px;margin:0}
.sc-note{color:var(--muted);font-size:11px;font-style:italic;margin:8px 0 0}
.sc-flow{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 14px}
.sc-step{background:var(--surface2);border:1px solid var(--sep);border-radius:999px;padding:3px 10px;font-size:11px}
.sc-step.on{border-color:var(--accent);color:var(--fg)}
.sc-arrow{color:var(--muted);font-size:11px}
.sc-modal{background:var(--surface);border:1px solid var(--sep);border-radius:16px;padding:16px;
          display:flex;flex-direction:column;gap:12px}
.sc-lead{display:flex;flex-direction:column;gap:2px}
.sc-lead b{font-size:24px;font-variant-numeric:tabular-nums}
.sc-lead span{color:var(--muted);font-size:12px}
`;

const LINES = `
<div class="sc-lines">
  <div class="sc-line"><span class="sc-thumb"></span>
    <span class="sc-name"><strong>System Design Mastery</strong><span>Cốt lõi</span></span>
    <span class="sc-price">1.800.000₫<s>2.000.000₫</s></span><span class="sc-x">✕</span></div>
  <div class="sc-line"><span class="sc-thumb b"></span>
    <span class="sc-name"><strong>Fullstack Mastery</strong><span>Nền tảng</span></span>
    <span class="sc-price">1.350.000₫<s>1.500.000₫</s></span><span class="sc-x">✕</span></div>
  <div class="sc-line"><span class="sc-thumb c"></span>
    <span class="sc-name"><strong>DevOps Mastery</strong><span>Nâng cao</span></span>
    <span class="sc-price">1.800.000₫<s>2.000.000₫</s></span><span class="sc-x">✕</span></div>
</div>`;

const SCHEDULE = `
<div class="sc-sched">
  <div class="sc-cyc now"><i class="sc-dot"></i>
    <span>Kỳ 1 · hôm nay · 50%</span><b>2.475.000₫</b></div>
  <div class="sc-cyc"><i class="sc-dot"></i>
    <span>Kỳ 2 · sau 1 tháng · nửa phần còn lại</span><b>1.361.250₫</b></div>
  <div class="sc-cyc"><i class="sc-dot"></i>
    <span>Kỳ 3 · sau 2 tháng · nửa phần còn lại</span><b>1.361.250₫</b></div>
</div>`;

/* The backend does not auto-charge and does not hold a fixed calendar: nextDueAt is one rolling
   date advanced by +1 month FROM THE PAYMENT, so a hard date would be a promise nobody keeps. */
const MANUAL_WARNING = `
<p class="sc-hint">Mỗi kỳ bạn tự vào đóng, hệ thống không tự trừ tiền. Trễ quá 14 ngày sẽ tạm khoá
  <b>cả 3 khoá</b> trong đơn này cho tới khi đóng tiếp.</p>`;

const FULL_SUMMARY = `
<div class="sc-sum">
  <div class="sc-row"><span>Tạm tính</span><span>5.500.000₫</span></div>
  <div class="sc-row sc-save"><span>Tiết kiệm</span><span>−550.000₫</span></div>
  <div class="sc-row total"><span>Tổng</span><span>4.950.000₫</span></div>
</div>`;

const INSTALLMENT_LED_SUMMARY = `
<div class="sc-sum">
  <div class="sc-row total"><span>Tổng trả góp</span><span>5.197.500₫</span></div>
  <div class="sc-row"><span>Trả hôm nay · kỳ 1</span><span>2.475.000₫</span></div>
  <div class="sc-row sc-warn"><span>Đã gồm phí trả góp 5%</span><span>+247.500₫</span></div>
</div>`;

const INSTALLMENT_SUMMARY = `
<div class="sc-sum">
  <div class="sc-row"><span>Giá trả một lần</span><span>4.950.000₫</span></div>
  <div class="sc-row sc-warn"><span>Phí trả góp 3 kỳ (5%)</span><span>+247.500₫</span></div>
  <div class="sc-row total"><span>Tổng trả góp</span><span>5.197.500₫</span></div>
</div>`;

const SWITCH = `
<div class="sc-switch">
  <button type="button" aria-pressed="false">Trả một lần</button>
  <button type="button" aria-pressed="true">Trả góp 3 kỳ</button>
</div>`;

const FLOW = (steps) => `<div class="sc-flow">${steps.map((s, i) =>
  `${i ? '<span class="sc-arrow">→</span>' : ''}<span class="sc-step${s.on ? " on" : ""}">${s.t}</span>`).join("")}</div>`;

/* ---------- A · installment stays a payment-step decision (legacy shape) ---------- */
const A = `
<div class="sc">
  ${FLOW([{t:"Giỏ hàng: đã tính theo trả góp",on:true},{t:"Bấm thanh toán",on:true},{t:"Modal: xem lịch, đổi được",on:true},{t:"Cổng thanh toán",on:true}])}
  <div class="sc-split">
    <div>
      <p class="sc-lab">/CART — GIỎ NÓI GIÁ, KHÔNG NÓI LỊCH</p>
      <div class="sc-page">
        <p class="sc-crumb">Trang chủ › Giỏ hàng</p>
        <h2 class="sc-h">Giỏ hàng</h2>
        ${LINES}
        ${INSTALLMENT_LED_SUMMARY}
        <p class="sc-hint">Đang tính theo trả góp 3 kỳ. Muốn trả một lần 4.950.000₫ thì đổi ở bước thanh toán.</p>
        <div style="display:flex;gap:8px"><button class="sc-btn">Thanh toán (3)</button>
          <button class="sc-btn ghost auto">Xoá hết</button></div>
      </div>
    </div>
    <div>
      <p class="sc-lab">PAYMENT MODAL — NƠI CHỌN</p>
      <div class="sc-modal">
        <h3 class="sc-h2">Thanh toán</h3>
        ${SWITCH}
        ${INSTALLMENT_SUMMARY}
        ${SCHEDULE}
        ${MANUAL_WARNING}
        <button class="sc-btn">Trả kỳ 1 · 2.475.000₫</button>
      </div>
    </div>
  </div>
  <p class="sc-note">Giữ CẤU TRÚC legacy — giỏ nói giá, modal nói cách trả — nhưng đảo mặc định sang trả góp.
    Hệ quả kèm theo: trả góp chỉ chạy PayOS/Sepay, nên mặc định này làm Stripe/PayPal/Crypto <b>biến mất</b>
    khỏi danh sách cổng cho tới khi người mua tự đổi về trả một lần.</p>
</div>`;

/* ---------- D · legacy default kept (the option being departed from) ---------- */
const D = `
<div class="sc">
  ${FLOW([{t:"Giỏ hàng: giá trả một lần",on:true},{t:"Bấm thanh toán",on:true},{t:"Modal: mặc định trả một lần",on:true},{t:"Ai muốn góp thì tự bật"}])}
  <div class="sc-split">
    <div>
      <p class="sc-lab">/CART — ĐÚNG NHƯ LEGACY</p>
      <div class="sc-page">
        <p class="sc-crumb">Trang chủ › Giỏ hàng</p>
        <h2 class="sc-h">Giỏ hàng</h2>
        ${LINES}
        ${FULL_SUMMARY}
        <p class="sc-hint">Có thể trả góp 3 kỳ — trả trước 2.475.000₫. Chi tiết ở bước thanh toán.</p>
        <div style="display:flex;gap:8px"><button class="sc-btn">Thanh toán (3)</button>
          <button class="sc-btn ghost auto">Xoá hết</button></div>
      </div>
    </div>
    <div>
      <p class="sc-lab">PAYMENT MODAL — MỞ RA LÀ TRẢ MỘT LẦN</p>
      <div class="sc-modal">
        <h3 class="sc-h2">Thanh toán</h3>
        <div class="sc-switch">
          <button type="button" aria-pressed="true">Trả một lần</button>
          <button type="button" aria-pressed="false">Trả góp 3 kỳ</button>
        </div>
        ${FULL_SUMMARY}
        <p class="sc-hint">Còn đủ cổng quốc tế: PayOS · Sepay · Stripe · PayPal · Crypto.</p>
        <button class="sc-btn">Trả 4.950.000₫</button>
      </div>
    </div>
  </div>
  <p class="sc-note">Phương án đang bị rời bỏ, giữ lại để so sánh chứ không phải để chọn cho có.
    Được: người mua không bao giờ vô tình trả thêm 247.500₫, và cổng quốc tế vẫn còn.
    Mất: trả góp thành thứ phải đi tìm, nên phần lớn người mua sẽ không thấy nó.</p>
</div>`;

/* ---------- B · the cart carries the choice ---------- */
const B = `
<div class="sc">
  ${FLOW([{t:"Giỏ hàng: chọn cách trả",on:true},{t:"Thấy đủ 3 kỳ",on:true},{t:"Bấm trả kỳ 1",on:true},{t:"Cổng thanh toán",on:true}])}
  <div class="sc-split">
    <div>
      <p class="sc-lab">/CART — CHỌN NGAY TRONG GIỎ</p>
      <div class="sc-page">
        <p class="sc-crumb">Trang chủ › Giỏ hàng</p>
        <h2 class="sc-h">Giỏ hàng</h2>
        ${LINES}
        ${SWITCH}
        ${INSTALLMENT_SUMMARY}
        ${SCHEDULE}
        ${MANUAL_WARNING}
        <div style="display:flex;gap:8px"><button class="sc-btn">Trả kỳ 1 · 2.475.000₫</button>
          <button class="sc-btn ghost auto">Xoá hết</button></div>
      </div>
    </div>
    <div>
      <p class="sc-lab">DRAWER — CÙNG MỘT LỰA CHỌN</p>
      <div class="sc-drawer">
        <h3 class="sc-h2">Giỏ hàng · 3</h3>
        ${SWITCH}
        ${INSTALLMENT_SUMMARY}
        ${SCHEDULE}
        <button class="sc-btn">Trả kỳ 1 · 2.475.000₫</button>
        <button class="sc-btn ghost">Xem giỏ đầy đủ</button>
      </div>
    </div>
  </div>
  <p class="sc-note">Số tiền sắp bị trừ hiện ra TRƯỚC khi bấm, không phải sau. Modal thanh toán rút lại
    chỉ còn chọn cổng. Đánh đổi: giỏ hàng dài thêm, và hai bề mặt phải đọc chung một lựa chọn.</p>
</div>`;

/* ---------- C · entry price leads ---------- */
const C = `
<div class="sc">
  ${FLOW([{t:"Giỏ hàng: giá vào học",on:true},{t:"Trả 50% vào học",on:true},{t:"Kỳ 2, kỳ 3 tự nhắc",on:true}])}
  <div class="sc-split">
    <div>
      <p class="sc-lab">/CART — DẪN BẰNG GIÁ VÀO HỌC</p>
      <div class="sc-page">
        <p class="sc-crumb">Trang chủ › Giỏ hàng</p>
        <h2 class="sc-h">Giỏ hàng</h2>
        ${LINES}
        <div class="sc-sum">
          <div class="sc-lead"><b>2.475.000₫</b><span>trả hôm nay để vào học cả 3 khoá</span></div>
          <div class="sc-row"><span>Còn 2 kỳ · chia đôi phần còn lại</span><span>1.361.250₫ / kỳ</span></div>
          <div class="sc-row total"><span>Tổng trả góp</span><span>5.197.500₫</span></div>
        </div>
        <button class="sc-btn big">Trả 2.475.000₫ · vào học ngay</button>
        <p class="sc-hint">Hoặc <u>trả một lần 4.950.000₫</u> để không mất 247.500₫ phí trả góp.</p>
        ${MANUAL_WARNING}
      </div>
    </div>
    <div>
      <p class="sc-lab">DRAWER — CHECKOUT</p>
      <div class="sc-drawer">
        <h3 class="sc-h2">3 khoá · vào học hôm nay</h3>
        <div class="sc-lead" style="padding:0 2px"><b>2.475.000₫</b><span>kỳ 1 trong 3 kỳ</span></div>
        ${SCHEDULE}
        <button class="sc-btn">Trả 2.475.000₫</button>
        <button class="sc-btn ghost">Trả một lần 4.950.000₫</button>
      </div>
    </div>
  </div>
  <p class="sc-note">Trả góp thành mặc định, trả một lần thành lựa chọn phụ. Được: rào vào học thấp nhất có thể.
    Mất: con số lớn nhất trên màn hình không còn là giá thật của khoá học, và 5% phí bị đẩy xuống dòng nhỏ.</p>
</div>`;

const SHARED_CONTRACTS = [
  { key: "label-row-over-card", why: "A section label and its quiet end action stay outside the surface they name." },
  { key: "ranked-user-list", why: "Cited as the joined-list precedent: comparable rows in one surface, shared separators, one row grammar." },
  { key: "evidence-title-over-subtitle", why: "A figure and the words that qualify it are one statement, so they stack." },
  { key: "cart-line-row", why: "PROPOSED. One purchasable row is a fixed grammar and must read the same at both measures." },
  { key: "installment-cycle-row", why: "PROPOSED. A cycle is an ordinal, a date, a share and an amount; the row that is due now is marked by state, not by a different shape." },
];

const SHARED_EVIDENCE = [
  { source: "starci-academy-fe/src (whole tree)", claim: "No cart and no installment surface of any kind exists here today. All of it is net-new on this frontend." },
  { source: "backend src/modules/platform/env/config.ts (installment.markupPercentByMonths)", claim: "Exactly ONE term is offered: 3 months at 10% markup. The comment records a teacher decision of 2026-07-14 dropping the 6- and 12-month terms so no term picker is needed." },
  { source: "backend src/modules/bussiness/installment-plan/installment-plan.service.ts:100-112", claim: "computeInstallmentTotal derives totalAmountVnd = base x 1.10 and monthlyAmountVnd = total / months - an EQUAL split, 36.67% of base per cycle." },
  { source: "backend src/modules/bussiness/installment-plan/installment-plan.service.ts:124-134", claim: "computeMinPaymentVnd for a Fixed plan returns the single stored monthlyAmountVnd, so every cycle owes the same amount by construction." },
  { source: "backend entities/installment-plan.entity.ts:192-253", claim: "A Fixed plan stores one monthly_amount_vnd plus installments_paid. There is no per-cycle amount column, so a 50/30/30 schedule is not representable today." },
  { source: "backend mutations/courses/courses-checkout/graphql-types/request.ts:68-75", claim: "Checkout already accepts installmentMonths; the first cycle is charged at checkout and the plan is created once payment succeeds." },
  { source: "backend queries/courses/courses-checkout-preview response type", claim: "The cart preview already returns installmentOptions for the whole order - the earlier reading of this file in this plan run missed the field." },
  { source: "backend installment-plan-enforcement.cron.ts + entity lockout_after_days", claim: "Missing a cycle reminds at day 0, warns after 7 days and LOCKS every course on the plan after 14 days; paying catches up and unlocks." },
  { source: "starci-academy CartPage/index.tsx:44-49 and MiniCartDrawer/index.tsx:82-87", claim: "Legacy shows only a hint built from the CHEAPEST monthlyAmountVnd and defers the real choice to PaymentModal." },
  { source: "starci-academy-fe/src/components/shells", claim: "ModalShell exists; DrawerShell does not, so the drawer needs the one shell canon names and this repository has not built." },
  { source: "backend pay-next-installment.handler.ts + the absence of any auto-debit path", claim: "NOTHING is charged automatically. Every cycle after the first is a manual payNextInstallment checkout the learner starts themselves. There is no card on file anywhere in this codebase." },
  { source: "backend installment-plan.service.ts:271-272 (nextDueAt = now + 1 month, set on payment)", claim: "There is no fixed calendar: the plan holds ONE rolling nextDueAt advanced a month from the payment that just landed. A schedule showing hard dates for cycles 2 and 3 would be promising something the server does not hold." },
  { source: "backend enrollment.entity.ts is_enrolled + installment-plan.service.ts lockGatedEnrollments", claim: "A locked-for-non-payment enrollment and a never-paid trial are the SAME false boolean. Nothing records why. To render 'your access is locked, pay to restore' the frontend must cross-reference myInstallmentPlans for a Defaulted plan whose courses contain that course." },
  { source: "backend enqueue/enroll.service.ts createInstallmentPlanIfNeeded (lockedCourseIds = every course of the order)", claim: "One plan gates the WHOLE order. Missing a cycle locks every course bought together, not the cheapest one - which the buyer has to be told before choosing installments on a 3-course cart." },
  { source: "backend enums/transaction-status.ts:16-27", claim: "Cancelled and Failed are declared but never assigned by production code; every real failure lands on Unpaid. A frontend branch keyed on Cancelled or Failed would be dead code." },
  { source: "backend mutations/courses/courses-checkout/graphql-types/request.ts (no voucherCode field)", claim: "Cart checkout accepts no voucher; only the single-course courseEnroll does. Vouchers are simply not part of the cart flow." },
  { source: "backend queries/courses/courses-checkout-preview/graphql-types/request.ts (courseIds only)", claim: "The cart preview takes no installmentMonths and returns every offered option - currently exactly one - so the frontend reads installmentOptions[0] and there is no round-trip confirming a term before checkout." },
  { source: "backend course-pricing.service.ts LOCAL_TEST_PRICE_DIVISOR = 100", claim: "Outside production every VND amount is divided by 100 before it reaches the frontend. Amounts arrive display-ready and must never be re-scaled locally." },
  { source: "starci-academy PaymentModal/index.tsx:117-118 and 274-278", claim: "Legacy initialises installmentMonths to null - the comment reads 'pay in full (unchanged default)' - and RESETS it to null on every modal open. Defaulting to installments is a real departure from the reference, not a small adjustment." },
  { source: "starci-academy PaymentModal/index.tsx:300-305", claim: "hasUsd is false whenever an installment term is active, because installments are VND-only per PAYMENT_MODIFIER_CAPABILITY. Defaulting to installments therefore HIDES Stripe, PayPal and Crypto from the gateway list until the buyer switches back to paying in full." },
];

const SHARED_UNKNOWNS = [
  "What a signed-out reader gets on add-to-cart. Legacy defers the intent and replays it after sign-in, which is generous and is also a second state machine; no direction assumes it.",
  "Whether a learner may open a second installment plan while one is still Active. Nothing in the read code forbids it and nobody has decided it.",
  "Where coursesCheckout sends the reader after the gateway. The legacy drawer hands to a payment overlay this repository does not have.",
  "SETTLED, kept for the record: the markup drops from 10% to 5%. That makes the share vector sum to 105 rather than 110, so 50/30/30 no longer closes and the later cycles become half of what is left each.",
  "Whether a plans surface (list, pay-next-cycle, locked-course recovery) is in scope with the cart or is its own later plan. The backend ships myInstallmentPlans and payNextInstallment and this frontend renders neither, so choosing installments in the cart creates an obligation with nowhere to discharge it.",
];

const STATE_COVERAGE = (p) => [
  { ownerId: p + ":cart", state: "populated · installment chosen", coverage: "rendered", scenarioId: "default", evidence: "myCart rows joined to coursesCheckoutPreview.installmentOptions." },
  { ownerId: p + ":cart", state: "populated · pay in full", coverage: "deferred-to-preview", evidence: "Every scene here shows the installment branch, because that is what is being chosen between." },
  { ownerId: p + ":cart", state: "empty", coverage: "deferred-to-preview", evidence: "The commonest state; needs its own copy and its own exit into the catalogue." },
  { ownerId: p + ":cart", state: "loading | failed", coverage: "deferred-to-preview", evidence: "Two independent keys - the cart list and the checkout preview - which can fail separately." },
  { ownerId: p + ":cart", state: "preview-failed-while-cart-loaded", coverage: "deferred-to-preview", evidence: "Legacy handles exactly this: totals go unknown while the rows stay real. With installments the schedule goes unknown too, and no schedule means no offer may be shown." },
  { ownerId: p + ":cart", state: "installment unavailable", coverage: "deferred-to-preview", evidence: "installmentOptions is empty for a free or USD-only order, and only the domestic VND gateways support it." },
  { ownerId: p + ":cart", state: "mutating (remove, clear)", coverage: "deferred-to-preview", evidence: "Removing a line re-prices the whole schedule, so cycle amounts must not be read while a write is in flight." },
  { ownerId: p + ":cart", state: "signed-out", coverage: "deferred-to-preview", evidence: "Depends on the deferred-intent decision recorded in unknowns." },
  { ownerId: p + ":plans", state: "Active | Overdue | Defaulted | Completed", coverage: "deferred-to-preview", evidence: "The four InstallmentPlanStatus values a plans surface must render, including the locked-course case." },
];

const SHARED_PROPOSALS = [
  { decision: "new", tier: "shell", name: "DrawerShell", target: "src/components/shells/DrawerShell/index.tsx", api: "props { title, isOpen }, on { close }, children", why: "Canon names exactly two shells that may expose children and this repository built only ModalShell. A drawer assembled as a branch would invent its own focus and scroll mechanics.", tests: "opens/closes, focus trapped and returned to the trigger, body scroll locked" },
  { decision: "new", tier: "block", name: "CartLine", target: "src/components/blocks/commerce/CartLine/index.tsx", api: "props { courseId, title, tier, thumbnail, listVnd, chargedVnd, isRemoving }, on { remove }", why: "The same row renders on both surfaces in every direction; two copies drift the first time pricing changes.", tests: "with and without a discount, remove disabled while mutating" },
  { decision: "new", tier: "block", name: "OrderSummary", target: "src/components/blocks/commerce/OrderSummary/index.tsx", api: "props { totalListVnd, totalChargedVnd, savingsVnd, installment: null | { totalAmountVnd, markupPercent } }", why: "Three figures that only mean anything together, plus the one place the installment surcharge can be stated instead of hidden.", tests: "no savings, preview pending, preview failed, installment on and off" },
  { decision: "new", tier: "block", name: "InstallmentSchedule", target: "src/components/blocks/commerce/InstallmentSchedule/index.tsx", api: "props { cycles: Array<{ ordinal, dueAt, percent, amountVnd, state }> }", why: "A front-loaded schedule cannot be summarised by one per-month number, so the three cycles are shown as three rows - and the same block later renders a LIVE plan, where the rows carry paid/due/overdue instead of a forecast.", tests: "forecast at checkout, live plan mid-schedule, overdue cycle" },
  { decision: "new", tier: "block", name: "AddToCartButton", target: "src/components/blocks/commerce/AddToCartButton/index.tsx", api: "props { courseId, isInCart, isPending }, on { add, open }", why: "Every direction starts here, and it is the only owner that has to know what a signed-out press means.", tests: "already in cart, pending, signed out" },
];

const SHARED_ENABLERS = [
  {
    id: "installment-weighted-schedule",
    classification: "behaviour-change",
    operationKind: "domain-service + schema",
    uiNeed: "Charge 50% of the base price at checkout and half of the remainder on each of the two following cycles, instead of three equal cycles - and lower the 3-month markup from 10% to 5%.",
    evidence: "computeInstallmentTotal returns one monthlyAmountVnd = total/months; computeMinPaymentVnd(Fixed) returns that single stored value; installment_plans has no per-cycle column. The requested shape is not representable today.",
    proposal: "Set INSTALLMENT_MARKUP_PERCENT_3M to 5, configure the schedule as a BASIS-POINT share vector (INSTALLMENT_SCHEDULE_BPS_3M = 5000,2750,2750 - basis points because 27.5% is not an integer and the existing columns are int), have computeInstallmentTotal return cycles[] beside totalAmountVnd, snapshot the vector on the plan in a jsonb cycle_bps column beside the existing markup_percent snapshot, and make computeMinPaymentVnd(Fixed) read cycles[installmentsPaid] instead of a single monthly amount.",
    arithmetic: "Shares are of the BASE (loyalty+bundle discounted) price and must sum to 100 + markup. At 5% that is 105, so 50/30/30 no longer closes: keeping the instructed 50% first payment leaves 55 to split, giving 50 / 27.5 / 27.5. On the worked cart: 2.475.000 + 1.361.250 + 1.361.250 = 5.197.500 = 4.950.000 x 1.05, with no rounding remainder.",
    authorization: "Unchanged: the same buyer, the same domestic VND gateways.",
    compatibility: "Live plans keep working, and this matters more now than before: markup_percent is already snapshotted per plan, so a buyer who bought at 10% keeps owing 10% and a plan with no vector keeps its even split. The drop to 5% applies to new plans only - nobody is repriced in either direction.",
    tests: "the vector sums to the stored total; cycle 2 and 3 minimums differ from cycle 1; a plan snapshotted at 10% with a null vector still charges its stored monthly amount; the rounding remainder lands on the last cycle.",
    escalationTrigger: "Settled by the teacher: markup 5%, first cycle 50%. If the round 30% later cycles are preferred over the round 50% first one, the vector becomes 45/30/30 - same total, lower entry price, less collected before the riskiest moment.",
  },
  {
    id: "installment-preview-schedule",
    classification: "additive-field",
    operationKind: "query",
    uiNeed: "Show the three dated cycles before the buyer commits, on whichever surface the chosen direction puts them.",
    evidence: "InstallmentOption today carries months, markupPercent, totalAmountVnd and monthlyAmountVnd. One monthlyAmountVnd cannot describe 50/30/30.",
    proposal: "Add cycles: Array<{ ordinal, percent, amountVnd, dueAt }> to InstallmentOption in both coursePricePreview and coursesCheckoutPreview, keeping monthlyAmountVnd so no existing caller breaks.",
    authorization: "Same as the query it extends.",
    compatibility: "Purely additive.",
    tests: "cycles sum to totalAmountVnd; empty for a free or USD-only order.",
    escalationTrigger: "None - if the schedule enabler is refused, this one has nothing to describe.",
  },
];

const FEASIBILITY = {
  status: "mapped",
  existingOwners: ["SurfaceCard", "SurfaceListCard", "Tree", "Button", "Text", "Image", "ModalShell"],
  existingContracts: ["label-row-over-card", "ranked-user-list", "evidence-title-over-subtitle"],
  exactProposals: SHARED_PROPOSALS.map((proposal) => `${proposal.tier} ${proposal.name} at ${proposal.target} - ${proposal.api}`),
  unmappedAnatomy: [],
};

window.STARCI_REVIEW = {
  title: "Cart — /cart, cart drawer, and where the 3-cycle installment offer lives",
  phase: "plan",
  deliveryMode: "batch",
  mode: "mixed",
  parityBaseline: "D:\\Repositories\\starci-academy (mtp, 9a19342) — CartPage, MiniCartDrawer, PaymentModal, CartLine, AddToCartButton, InstallmentPlansPage",
  workItems: [
    { id: "page-cart", scope: "page", target: "src/app/[lang]/cart + src/components/pages/CartPage" },
    { id: "overlay-cart-drawer", scope: "overlay", target: "src/components/overlays/commerce/CartDrawer" },
    { id: "block-cart-line", scope: "block", target: "src/components/blocks/commerce/CartLine" },
    { id: "block-installment-schedule", scope: "block", target: "src/components/blocks/commerce/InstallmentSchedule" },
    { id: "block-add-to-cart", scope: "block", target: "src/components/blocks/commerce/AddToCartButton" },
  ],
  evidence: SHARED_EVIDENCE,
  cases: [
    {
      id: "direction-installment-at-payment",
      title: "A · Legacy structure, installment default (posture: conservative)",
      thesis: "Keep legacy's division of labour - the cart states a price, the payment step states how to pay - but open on installments so nobody has to find them.",
      distinction: "The smallest edit to legacy that still makes installments the default. The cost is that the default silently drops the international gateways.",
      css: CASE_CSS,
      states: [{ id: "default", label: "Cart + payment modal", covers: ["page-cart:installment", "overlay-payment:installment"], html: A }],
      stateCoverage: STATE_COVERAGE("A"),
      blockTree: [
        "CartPage / CartDrawer          cart-line xN | order-summary | installment-hint | checkout",
        "PaymentModal (ModalShell)      full-vs-installment switch | order-summary(installment) |",
        "                               installment-schedule | gateway list | pay cycle 1",
      ].join("\n"),
      contracts: SHARED_CONTRACTS,
      proposals: SHARED_PROPOSALS,
      backendEnablers: SHARED_ENABLERS,
      assumptions: [
        "The cart total is the INSTALLMENT total, not the pay-in-full one. If the cart said 4.950.000d and the modal then said 5.197.500d, the number would jump between surfaces for no reason the buyer can see.",
        "The legacy 'chi tu X/thang' hint cannot survive: under 50/30/30 the first cycle is the most expensive one, so a from-price would be a false floor.",
      ],
      unknowns: SHARED_UNKNOWNS,
      implementationFeasibility: FEASIBILITY,
    },
    {
      id: "direction-installment-in-cart",
      title: "B · The cart carries the choice (posture: balanced)",
      thesis: "How much money leaves the account on the next press is a cart-level fact, so the switch and the three dated cycles live in the cart, and the payment modal shrinks to choosing a gateway.",
      distinction: "Nobody reaches a payment screen without having already seen 2.475.000d today, 1.361.250d twice, and +247.500d of surcharge.",
      css: CASE_CSS,
      states: [{ id: "default", label: "Cart + drawer", covers: ["page-cart:installment", "overlay-cart-drawer:installment"], html: B }],
      stateCoverage: STATE_COVERAGE("B"),
      blockTree: [
        "CartPage / CartDrawer          cart-line xN | full-vs-installment switch |",
        "                               order-summary(installment) | installment-schedule | pay cycle 1",
        "PaymentModal (ModalShell)      gateway list only",
      ].join("\n"),
      contracts: SHARED_CONTRACTS,
      proposals: SHARED_PROPOSALS,
      backendEnablers: SHARED_ENABLERS,
      assumptions: [
        "The switch is one cart-level choice both surfaces read from a single place, so opening the drawer after choosing on the page does not silently reset it.",
      ],
      unknowns: SHARED_UNKNOWNS.concat([
        "Whether the choice should survive a reload. Holding it in the URL is cheap and makes the cart shareable; holding it in memory is simpler and loses it.",
      ]),
      implementationFeasibility: FEASIBILITY,
    },
    {
      id: "direction-entry-price-leads",
      title: "C · Entry price leads (posture: bold)",
      thesis: "The number that decides whether someone enrolls is what they pay today, so the cart leads with 2.475.000d and paying in full becomes the alternative.",
      distinction: "Installments stop being an option the buyer must find and become the frame of the whole cart.",
      css: CASE_CSS,
      states: [{ id: "default", label: "Cart + drawer", covers: ["page-cart:installment", "overlay-cart-drawer:installment"], html: C }],
      stateCoverage: STATE_COVERAGE("C"),
      blockTree: [
        "CartPage / CartDrawer          cart-line xN | entry-price lead | installment-schedule |",
        "                               pay cycle 1 | quiet pay-in-full alternative",
        "PaymentModal (ModalShell)      gateway list only",
      ].join("\n"),
      contracts: SHARED_CONTRACTS,
      proposals: SHARED_PROPOSALS,
      backendEnablers: SHARED_ENABLERS,
      assumptions: [
        "Leading with the entry price is acceptable only while the surcharge and the total stay visible on the same surface, not one tap away.",
      ],
      unknowns: SHARED_UNKNOWNS,
      implementationFeasibility: FEASIBILITY,
    },
    {
      id: "direction-legacy-full-default",
      title: "D · Legacy default kept: pay in full leads (posture: parity-first)",
      thesis: "The reference opens on paying in full and installments are a choice the buyer makes deliberately; this is that behaviour, ported unchanged.",
      distinction: "The only direction where nobody can be charged the surcharge without having asked for it, and the only one that leaves Stripe, PayPal and Crypto visible by default.",
      css: CASE_CSS,
      states: [{ id: "default", label: "Cart + payment modal", covers: ["page-cart:pay-in-full", "overlay-payment:pay-in-full"], html: D }],
      stateCoverage: STATE_COVERAGE("D"),
      blockTree: [
        "CartPage / CartDrawer          cart-line xN | order-summary | installment-hint | checkout",
        "PaymentModal (ModalShell)      switch defaulting to FULL | order-summary | all five gateways |",
        "                               installment-schedule only once the buyer turns installments on",
      ].join("\n"),
      contracts: SHARED_CONTRACTS,
      proposals: SHARED_PROPOSALS,
      backendEnablers: SHARED_ENABLERS,
      assumptions: [
        "Kept in the lab because the other three depart from it. A migration that cannot see what it is leaving behind cannot review the departure, only assert it.",
      ],
      unknowns: SHARED_UNKNOWNS,
      implementationFeasibility: FEASIBILITY,
    },
  ],
};
