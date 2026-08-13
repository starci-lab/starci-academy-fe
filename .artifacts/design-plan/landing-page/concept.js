const resultCopy = {
  scale: ["DECISION A · LOCAL RELIEF", "Thêm pod giảm áp lực ở compute, nhưng database vẫn là một failure domain. Bạn vừa mua thêm thời gian — chưa sửa nguyên nhân."],
  cache: ["DECISION B · READ RELIEF", "Cache hạ tải read path, đổi lại bạn phải sở hữu invalidation và stale data. Một bottleneck biến thành một consistency decision."],
  boundary: ["DECISION C · STRUCTURAL CHANGE", "Tách data boundary giảm coupling, nhưng migration và operational cost tăng mạnh. Đúng hướng dài hạn không có nghĩa là nước đi đầu tiên đúng."],
};

document.querySelectorAll("[data-decision]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-decision]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const [code, body] = resultCopy[button.dataset.decision];
    document.querySelector(".result-code").textContent = code;
    document.querySelector(".decision-result p").textContent = body;
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
