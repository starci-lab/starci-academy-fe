/**
 * Review lab manifest - PLAN phase, case-course-detail-v3.
 *
 * DIRECTIONAL HTML. None of this is an Apply baseline and none of it is production markup: it
 * exists so three product decisions can be compared side by side before anything is built. The
 * executable candidate is Preview's job, and it is rebuilt from the selected direction rather than
 * copied from here.
 *
 * The three directions differ on four decisions and nothing cosmetic: where PROOF sits relative to
 * the price, where the discount ladder lives, what the rail is FOR, and what the rail does when the
 * page scrolls. Item 5 of the request ("sticky card with an effect") was never defined, so it is a
 * differentiator here rather than an assumption - choosing a direction chooses the scroll behaviour.
 */
window.STARCI_REVIEW = {
    title: "Course detail v3 - prerequisites, pricing ladder, trial/cart, reviews",
    phase: "plan",
    deliveryMode: "single",
    mode: "extension",
    caseId: "case-course-detail-v3",
    status: "DIRECTIONAL - NOT AN APPLY BASELINE",
    workItems: [{
        id: "page-course-detail",
        scope: "page",
        target: "D:\\Repositories\\starci-academy-fe - /courses/[displayId], extending the applied v2 page",
    }],
    evidence: [
        { source: "src/components/contracts/index.ts (locked @ a5d833a)", claim: "course-promise-list and course-module-list ALREADY render as joined SurfaceListCard lists with divide-y. Two of the seven requested items are satisfied by the applied page and are excluded from this case." },
        { source: "course-promise-list .why", claim: "Reusing profile-evidence-list was considered and refused on domain-naming grounds. That decision stands; this case does not reopen it." },
        { source: "starci-academy-backend nest-cli core app", claim: "startTrial, addToCart, courseEnroll, coursesCheckout and refundCoursePurchase all exist. No backend enabler is needed for trial or cart." },
        { source: "starci-academy-backend PrerequisiteEntity", claim: "Ordered prerequisites hang off CourseEntity, so the prerequisite block reads real data rather than copy." },
        { source: "starci-academy-backend course-review feature (this session)", claim: "submitCourseReview / updateCourseReview / deleteCourseReview / courseReviews plus a CDC-fed aggregate. 48 unit specs and a 5-step broker e2e pass. The rating is served by a projection, so a course with no reviews answers zero rather than null." },
        { source: "starci-academy-fe useMutateAddToCartSwr", claim: "The cart mutation is already wired on the catalog card, so the detail page reuses a hook rather than adding plumbing." },
        { source: ".artifacts/design-plan/cart/plan-record.json", claim: "direction-legacy-full-default was selected for the cart case and never went through Preview. Its selected posture is folded into direction A here rather than left as a second competing case." },
        { source: "contracts main-then-rail (locked)", claim: "The rail already declares sticky, self-start, max-h-rail and its own overflow-y. Every direction below inherits that mechanism; they differ only in what the rail is asked to hold and to do." },
    ],
    cases: [
        {
            id: "direction-parity-rail",
            posture: "parity-first",
            title: "A - The rail decides, and it does not move",
            thesis: "Everything new lands where the named legacy render already put it. Prerequisites become a gate directly under the promises, the discount ladder stays inside the rail beneath the price, trial and cart join the rail as secondary actions under the primary enrol button, and the whole review block sits at the bottom after the curriculum. The rail is a FORM, so it holds still: a buy box that animates while a reader is comparing a price is a buy box they stop trusting.",
            distinction: "The only direction that changes no existing reading order. Every new region is appended at the position the legacy page used, so a reviewer comparing this against production is comparing additions rather than a rearrangement.",
            blockTree: "course-detail-page > [course-breadcrumb-row, main-then-rail > [course-hero > (heading, stat-chips, promises, PREREQUISITES, curriculum, REVIEWS), course-pricing-rail > (cover, price-block, DISCOUNT-LADDER, enrol, TRIAL, CART, proof)], course-mobile-action-bar]",
            contracts: "REUSE course-section + course-promise-list for prerequisites (same joined-list shape, new key course-prerequisite-list because the domain noun differs - the same reason course-promise-list refused profile-evidence-list). REUSE pricing-phase-ladder, already in the registry and already in the rail. EXTEND course-pricing-rail children with trial and cart slots. NEW course-review-block, course-review-summary, course-review-row.",
            proposals: "3 new contract keys, 1 slot extension. No new leaf.",
            backendEnablers: "None. Every field this direction renders exists today.",
            stateCoverage: "rail: price loaded / price loading / no discount phase. reviews: empty / one page / more than one page. trial: available / already used / already enrolled. cart: not in cart / in cart.",
            assumptions: "That a buyer reads the curriculum before they read other buyers. The legacy page assumes this; nothing measured says it is true.",
            unknowns: "Whether an empty review block at the page foot reads as 'no reviews yet' or as a broken region.",
            legacyDivergence: "None intended.",
            states: [
                { label: "Desktop, priced course with reviews", ownerId: "page-course-detail", state: "default", coverage: "rendered", covers: [], html: `
<div class="lab-page">
  <div class="lab-main">
    <p class="crumb">Trang chu &rsaquo; Khoa hoc</p>
    <h2 class="h-hero">Fullstack Mastery</h2>
    <p class="muted">Xay dung nen tang vung chac, ky nang thuc chien va tu duy engineering.</p>
    <div class="chips"><span>13 Hoc vien</span><span>23 Module</span><span>95 Noi dung</span><span>33 Gio hoc</span></div>

    <h3 class="h-sec">Ban se hoc duoc gi</h3>
    <ul class="joined">
      <li><i class="tick"></i>Lo trinh hoc dang module tu nen tang den trien khai thuc te.</li>
      <li><i class="tick"></i>Bai giang chat luong cao, giai thich truc tiep.</li>
      <li><i class="tick"></i>Review CV 1:1 va ho tro phan phoi CV.</li>
    </ul>

    <h3 class="h-sec new">Dieu kien tien quyet</h3>
    <ul class="joined">
      <li><i class="dot"></i>Biet mot ngon ngu lap trinh o muc co ban.</li>
      <li><i class="dot"></i>Da tung dung git va dong lenh.</li>
    </ul>

    <h3 class="h-sec">Noi dung khoa hoc</h3>
    <ol class="joined">
      <li><span class="mod">Nen tang backend: Framework, vong doi request</span><span class="meta">Nen tang &middot; 5 bai</span></li>
      <li><span class="mod">Tich hop Database &amp; Caching</span><span class="meta">Nen tang &middot; 6 bai</span></li>
      <li><span class="mod">REST API: Thiet ke &amp; Tai lieu</span><span class="meta">Nen tang &middot; 4 bai</span></li>
    </ol>

    <h3 class="h-sec new">Danh gia tu hoc vien</h3>
    <div class="card">
      <div class="rate-row"><span class="big">4,6</span><span class="stars">&#9733;&#9733;&#9733;&#9733;&#9734;</span><span class="muted">18 danh gia</span></div>
      <ul class="joined tight">
        <li><b>Minh</b> <span class="stars sm">&#9733;&#9733;&#9733;&#9733;&#9733;</span><br><span class="muted">Module caching mot minh no da dang tien.</span></li>
        <li><b>Lan</b> <span class="stars sm">&#9733;&#9733;&#9733;&#9733;&#9734;</span><br><span class="muted">Hai module cuoi hoi luot.</span></li>
      </ul>
    </div>
  </div>

  <aside class="lab-rail pinned">
    <div class="cover"></div>
    <div class="price"><b>1.250.000 &#8363;</b> <s>1.500.000</s> <em>-17%</em></div>
    <p class="muted sm">Tiet kiem 250.000 &#8363;</p>
    <div class="ladder new">
      <div><span>Tien phong</span><span>1.000.000 &#8363;</span></div>
      <div class="on"><span>&#9679; Som</span><span>Dang mo</span></div>
      <div><span>Tieu chuan</span><span>0 &#8363;</span></div>
    </div>
    <button class="cta">Dang ky hoc</button>
    <button class="cta ghost new">Hoc thu</button>
    <button class="cta ghost new">Them vao gio</button>
    <p class="muted sm">13 nguoi da dang ky</p>
  </aside>
</div>` },
            ],
        },
        {
            id: "direction-proof-first",
            posture: "evidence-first",
            title: "B - Proof before price",
            thesis: "A buyer who is not yet convinced does not read a curriculum. So the rating rises into the hero as one line beside the enrolment count, and the whole review block moves ABOVE the curriculum, directly after the promises. Prerequisites stop being a page block and become a disclosure at the head of the curriculum, where they answer the question the curriculum raises. The rail collapses to a compact price-and-CTA strip once the hero scrolls past, giving the long curriculum the width back.",
            distinction: "The only direction that changes the reading order of the existing page. It bets that social proof converts earlier than detail does, and it pays for that bet with a hero that must render honestly when a course has no reviews at all.",
            blockTree: "course-detail-page > [course-breadcrumb-row, main-then-rail > [course-hero > (heading, stat-chips + RATING-LINE, promises, REVIEWS, curriculum > PREREQUISITE-DISCLOSURE), course-pricing-rail > (cover, price-block, DISCOUNT-LADDER, enrol, TRIAL, CART)], course-mobile-action-bar]",
            contracts: "EXTEND course-stat-chip-run with one rating chip - the chip run already exists and a rating IS a stat about the course, so this is the extension the tier system asks for rather than a new owner. NEW course-review-block, course-review-summary, course-review-row, course-prerequisite-disclosure. REUSE pricing-phase-ladder.",
            proposals: "4 new contract keys, 1 slot extension, 1 rail behaviour (collapse-on-scroll) that no existing owner declares.",
            backendEnablers: "None for data. The collapse behaviour needs a scroll observer, which is new client behaviour in a tier that today declares only static classes.",
            stateCoverage: "hero rating: has reviews / zero reviews (the chip must not render a zero-star line). reviews: empty / one page / paginated. rail: expanded / collapsed. prerequisites: present / course has none.",
            assumptions: "That the rating chip is honest at zero. The projection answers zero rather than null, so the chip must be ABSENT rather than showing zero stars - a nought-star course reads as a bad course rather than a new one.",
            unknowns: "Whether the collapsed rail keeps the discount ladder or drops it. Dropping it hides the reason for the price; keeping it defeats the collapse.",
            legacyDivergence: "Reading order differs from the named legacy render. Recorded here rather than smuggled in: legacy puts reviews last.",
            states: [
                { label: "Desktop, scrolled past hero, rail collapsed", ownerId: "page-course-detail", state: "scrolled", coverage: "rendered", covers: [], html: `
<div class="lab-page">
  <div class="lab-main">
    <p class="crumb">Trang chu &rsaquo; Khoa hoc</p>
    <h2 class="h-hero">Fullstack Mastery</h2>
    <div class="chips"><span>13 Hoc vien</span><span class="new">&#9733; 4,6 &middot; 18 danh gia</span><span>23 Module</span><span>33 Gio hoc</span></div>

    <h3 class="h-sec">Ban se hoc duoc gi</h3>
    <ul class="joined">
      <li><i class="tick"></i>Lo trinh hoc dang module tu nen tang den trien khai thuc te.</li>
      <li><i class="tick"></i>Review CV 1:1 va ho tro phan phoi CV.</li>
    </ul>

    <h3 class="h-sec new">Hoc vien noi gi</h3>
    <div class="card">
      <div class="rate-row"><span class="big">4,6</span><span class="stars">&#9733;&#9733;&#9733;&#9733;&#9734;</span><span class="muted">18 danh gia</span></div>
      <div class="hist">
        <div><span>5&#9733;</span><b style="width:72%"></b><span class="muted">12</span></div>
        <div><span>4&#9733;</span><b style="width:24%"></b><span class="muted">4</span></div>
        <div><span>3&#9733;</span><b style="width:12%"></b><span class="muted">2</span></div>
      </div>
      <ul class="joined tight">
        <li><b>Minh</b> <span class="stars sm">&#9733;&#9733;&#9733;&#9733;&#9733;</span><br><span class="muted">Module caching mot minh no da dang tien.</span></li>
      </ul>
    </div>

    <h3 class="h-sec">Noi dung khoa hoc</h3>
    <details class="pre new" open><summary>Dieu kien tien quyet (2)</summary>
      <ul class="joined tight"><li><i class="dot"></i>Biet mot ngon ngu lap trinh.</li><li><i class="dot"></i>Da tung dung git.</li></ul>
    </details>
    <ol class="joined">
      <li><span class="mod">Nen tang backend: Framework, vong doi request</span><span class="meta">Nen tang &middot; 5 bai</span></li>
      <li><span class="mod">Tich hop Database &amp; Caching</span><span class="meta">Nen tang &middot; 6 bai</span></li>
      <li><span class="mod">REST API: Thiet ke &amp; Tai lieu</span><span class="meta">Nen tang &middot; 4 bai</span></li>
      <li><span class="mod">Xac thuc &amp; Phan quyen</span><span class="meta">Nen tang &middot; 9 bai</span></li>
    </ol>
  </div>

  <aside class="lab-rail collapsed">
    <p class="rail-note">rail thu gon sau khi cuon qua hero</p>
    <div class="price sm"><b>1.250.000 &#8363;</b> <em>-17%</em></div>
    <button class="cta">Dang ky hoc</button>
    <div class="rail-row"><button class="cta ghost tiny new">Hoc thu</button><button class="cta ghost tiny new">Gio</button></div>
  </aside>
</div>` },
            ],
        },
        {
            id: "direction-decision-desk",
            posture: "conservative-structure, bold-rail",
            title: "C - One desk, everything the decision needs on it",
            thesis: "Split the page by JOB rather than by topic. The main column becomes pure narrative - promises, curriculum, reviews - and the rail becomes the entire decision surface: price, the phase ladder, what you need before starting, the rating in one line, and all three ways in. A reader deciding never has to leave the rail, and a reader learning never has to step over a CTA.",
            distinction: "The only direction that moves prerequisites OUT of the narrative. It treats them as a condition of purchase rather than as course content, which is a claim about what a prerequisite IS - and the one place the three directions actually disagree about meaning rather than about position.",
            blockTree: "course-detail-page > [course-breadcrumb-row, main-then-rail > [course-hero > (heading, stat-chips, promises, curriculum, REVIEWS), course-pricing-rail > (cover, price-block, DISCOUNT-LADDER, RATING-LINE, PREREQUISITE-CHECKLIST, enrol, TRIAL, CART, proof)], course-mobile-action-bar]",
            contracts: "REUSE pricing-phase-ladder. NEW course-review-block, course-review-summary, course-review-row, course-rail-prerequisite-list. EXTEND course-pricing-rail children with four slots. The rail keeps its existing sticky + max-h-rail + overflow-y-auto, which is the mechanism this direction leans on hardest.",
            proposals: "4 new contract keys, 4 slot extensions. No new leaf, no new behaviour - the scroll mechanism already exists in the locked entry.",
            backendEnablers: "None.",
            stateCoverage: "rail: full desk / short desk (no discount, no prerequisites) / rail taller than viewport, scrolling inside itself. mobile: rail stacks above main and the mobile action bar takes the CTA.",
            assumptions: "That a prerequisite is a condition of buying rather than a piece of the syllabus. If that is wrong, this direction puts content in a buy box.",
            unknowns: "Whether the CTA survives the rail's own scroll on a short laptop. max-h-rail already scrolls the rail internally, so a long desk can push the enrol button below the rail's fold - which is the one failure this direction can produce and the other two cannot.",
            legacyDivergence: "Legacy keeps prerequisites in the narrative. Recorded.",
            states: [
                { label: "Desktop, full decision desk", ownerId: "page-course-detail", state: "default", coverage: "rendered", covers: [], html: `
<div class="lab-page">
  <div class="lab-main">
    <p class="crumb">Trang chu &rsaquo; Khoa hoc</p>
    <h2 class="h-hero">Fullstack Mastery</h2>
    <div class="chips"><span>13 Hoc vien</span><span>23 Module</span><span>95 Noi dung</span></div>

    <h3 class="h-sec">Ban se hoc duoc gi</h3>
    <ul class="joined">
      <li><i class="tick"></i>Lo trinh hoc dang module tu nen tang den trien khai thuc te.</li>
      <li><i class="tick"></i>Review CV 1:1 va ho tro phan phoi CV.</li>
    </ul>

    <h3 class="h-sec">Noi dung khoa hoc</h3>
    <ol class="joined">
      <li><span class="mod">Nen tang backend: Framework, vong doi request</span><span class="meta">5 bai</span></li>
      <li><span class="mod">Tich hop Database &amp; Caching</span><span class="meta">6 bai</span></li>
      <li><span class="mod">REST API: Thiet ke &amp; Tai lieu</span><span class="meta">4 bai</span></li>
      <li><span class="mod">Xac thuc &amp; Phan quyen</span><span class="meta">9 bai</span></li>
    </ol>

    <h3 class="h-sec new">Danh gia tu hoc vien</h3>
    <ul class="joined">
      <li><b>Minh</b> <span class="stars sm">&#9733;&#9733;&#9733;&#9733;&#9733;</span><br><span class="muted">Module caching mot minh no da dang tien.</span></li>
      <li><b>Lan</b> <span class="stars sm">&#9733;&#9733;&#9733;&#9733;&#9734;</span><br><span class="muted">Hai module cuoi hoi luot.</span></li>
    </ul>
  </div>

  <aside class="lab-rail desk">
    <div class="cover"></div>
    <div class="price"><b>1.250.000 &#8363;</b> <s>1.500.000</s> <em>-17%</em></div>
    <div class="ladder new">
      <div><span>Tien phong</span><span>1.000.000 &#8363;</span></div>
      <div class="on"><span>&#9679; Som</span><span>Dang mo</span></div>
    </div>
    <p class="rail-rate new"><span class="stars sm">&#9733;&#9733;&#9733;&#9733;&#9734;</span> 4,6 &middot; 18 danh gia</p>
    <div class="pre-mini new">
      <p class="muted sm">Can co truoc khi bat dau</p>
      <ul class="joined tight"><li><i class="dot"></i>Mot ngon ngu lap trinh</li><li><i class="dot"></i>Git va dong lenh</li></ul>
    </div>
    <button class="cta">Dang ky hoc</button>
    <div class="rail-row"><button class="cta ghost tiny new">Hoc thu</button><button class="cta ghost tiny new">Them vao gio</button></div>
    <p class="muted sm">13 nguoi da dang ky</p>
  </aside>
</div>` },
            ],
        },
    ],
}
