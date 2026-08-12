(() => {
  "use strict";
  const model = window.STARCI_REVIEW;
  const root = document.querySelector("#review-root");
  if (!model || !Array.isArray(model.cases) || model.cases.length === 0) {
    root.textContent = "No review cases were supplied.";
    return;
  }
  const tabs = document.querySelector("#case-tabs");
  document.querySelector("#review-title").textContent = model.title;
  document.querySelector("#review-meta").textContent = `${model.scope} · ${model.mode} · ${model.cases.length} case`;
  let caseIndex = 0;
  let stateIndex = 0;
  const node = (tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
  };
  const panel = (title, content) => {
    const section = node("section", "evidence-panel");
    section.append(node("h3", "", title), content);
    return section;
  };
  const list = (items, fallback) => {
    const result = node("ul", "plain-list");
    (items.length ? items : [fallback]).forEach((item) => result.append(node("li", "", item)));
    return result;
  };
  const render = () => {
    const design = model.cases[caseIndex];
    const state = design.states[stateIndex];
    tabs.querySelectorAll("button").forEach((button, index) => button.setAttribute("aria-selected", String(index === caseIndex)));
    root.replaceChildren();
    const intro = node("section", "case-intro");
    intro.append(node("p", "eyebrow", design.id), node("h2", "", design.title), node("p", "thesis", design.thesis), node("p", "distinction", design.distinction));
    const stateBar = node("div", "state-tabs");
    design.states.forEach((item, index) => {
      const button = node("button", "state-button", item.label);
      button.type = "button";
      button.setAttribute("aria-pressed", String(index === stateIndex));
      button.addEventListener("click", () => { stateIndex = index; render(); });
      stateBar.append(button);
    });
    const canvas = node("section", "canvas-panel");
    const style = document.createElement("style");
    style.textContent = design.css;
    const viewport = node("div", "case-canvas");
    viewport.innerHTML = state.html;
    canvas.append(style, stateBar, viewport);
    const evidence = node("div", "evidence-grid");
    evidence.append(panel("Block tree", node("pre", "tree", design.blockTree)));
    const contracts = node("div", "card-list");
    design.contracts.forEach((contract) => {
      const card = node("article", "mini-card");
      card.append(node("strong", "", contract.key), node("p", "", contract.why));
      contracts.append(card);
    });
    evidence.append(panel("Contracts", contracts));
    const proposals = node("div", "card-list");
    design.proposals.forEach((proposal) => {
      const card = node("article", "proposal-card");
      card.append(node("strong", "", `${proposal.decision} · ${proposal.tier}: ${proposal.name}`));
      if (proposal.target) card.append(node("p", "", `Target: ${proposal.target} · ${proposal.targetPath}`));
      card.append(node("p", "", proposal.reasonForDecision));
      card.append(node("pre", "", JSON.stringify({ publicApi: proposal.publicApi, apiDelta: proposal.apiDelta, affectedCallers: proposal.affectedCallers, compatibility: proposal.compatibility, tests: proposal.tests }, null, 2)));
      proposals.append(card);
    });
    evidence.append(panel("Proposal shelf", proposals));
    const claims = node("div", "two-column");
    claims.append(panel("Assumptions", list(design.assumptions, "None recorded.")), panel("Unknowns", list(design.unknowns, "None recorded.")));
    const source = node("section", "source-panel");
    source.append(node("h3", "", `Actual HTML · ${state.label}`), node("pre", "source-code", state.html), node("h3", "", "Case CSS"), node("pre", "source-code", design.css));
    root.append(intro, canvas, evidence, claims, source);
  };
  model.cases.forEach((design, index) => {
    const button = node("button", "case-button", `${design.id} · ${design.title}`);
    button.type = "button";
    button.setAttribute("role", "tab");
    button.addEventListener("click", () => { caseIndex = index; stateIndex = 0; render(); });
    tabs.append(button);
  });
  render();
})();
