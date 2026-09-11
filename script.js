const intro = document.querySelector("#intro");
const site = document.querySelector("#main-content");
const guestForm = document.querySelector("#guest-form");
const guestInput = document.querySelector("#guest-name");
const openWithoutName = document.querySelector("#open-without-name");
const heroSalutation = document.querySelector("#hero-salutation");
const letterSalutation = document.querySelector("#letter-salutation");
const siteHeader = document.querySelector(".site-header");
const replayButton = document.querySelector("#replay-invitation");
const saveButton = document.querySelector("#save-invitation");
const toast = document.querySelector("#toast");
const petalTemplate = document.querySelector("#celebration-petal");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const lightboxClose = document.querySelector(".lightbox__close");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const pageParams = new URLSearchParams(window.location.search);
let guestName = normalizeName(pageParams.get("to") || "");
let toastTimer;

if (guestName) {
  guestInput.value = guestName;
  updatePersonalMessage(guestName);
}

function normalizeName(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
}

function updatePersonalMessage(name) {
  guestName = normalizeName(name);

  if (guestName) {
    heroSalutation.textContent = `Thân gửi ${guestName},`;
    letterSalutation.textContent = `Gửi ${guestName} thân mến,`;
    return;
  }

  heroSalutation.textContent = "Thân gửi bạn,";
  letterSalutation.textContent = "Gửi bạn thân mến,";
}

function openInvitation({ useInput = true } = {}) {
  if (useInput) updatePersonalMessage(guestInput.value);

  intro.classList.add("is-opened");
  intro.setAttribute("aria-hidden", "true");
  intro.inert = true;
  site.setAttribute("aria-hidden", "false");
  site.inert = false;
  document.body.classList.remove("is-locked");

  revealVisibleItems();
  celebrate();

  window.setTimeout(() => {
    site.setAttribute("tabindex", "-1");
    site.focus({ preventScroll: true });
    site.removeAttribute("tabindex");
  }, reducedMotion.matches ? 20 : 920);
}

function replayInvitation() {
  window.scrollTo({ top: 0, behavior: "auto" });
  intro.classList.remove("is-opened");
  intro.removeAttribute("aria-hidden");
  intro.inert = false;
  site.setAttribute("aria-hidden", "true");
  site.inert = true;
  document.body.classList.add("is-locked");

  window.setTimeout(() => guestInput.focus(), reducedMotion.matches ? 20 : 500);
}

function celebrate() {
  if (reducedMotion.matches || !petalTemplate) return;

  const amount = window.innerWidth < 600 ? 22 : 36;

  for (let index = 0; index < amount; index += 1) {
    const petal = petalTemplate.content.firstElementChild.cloneNode();
    const angle = Math.random() * Math.PI * 2;
    const distance = 170 + Math.random() * Math.min(window.innerWidth, 680);
    const travelX = Math.cos(angle) * distance;
    const travelY = Math.sin(angle) * distance + 90;

    petal.style.setProperty("--start-x", `${46 + Math.random() * 8}%`);
    petal.style.setProperty("--start-y", `${42 + Math.random() * 8}%`);
    petal.style.setProperty("--travel-x", `${travelX.toFixed(0)}px`);
    petal.style.setProperty("--travel-y", `${travelY.toFixed(0)}px`);
    petal.style.setProperty("--spin", `${240 + Math.random() * 620}deg`);
    petal.style.setProperty("--size", `${8 + Math.random() * 10}px`);
    petal.style.setProperty("--duration", `${1.8 + Math.random() * 1.4}s`);
    petal.style.setProperty("--delay", `${Math.random() * 0.28}s`);
    document.body.appendChild(petal);
    petal.addEventListener("animationend", () => petal.remove(), { once: true });
  }
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function invitationUrl() {
  const url = new URL(window.location.href);

  if (guestName) url.searchParams.set("to", guestName);
  else url.searchParams.delete("to");

  url.searchParams.delete("open");
  return url.href;
}

async function shareInvitation() {
  const shareData = {
    title: "Thiệp tốt nghiệp của Phương Mai",
    text: guestName
      ? `${guestName} ơi, mở tấm thiệp nhỏ từ Phương Mai nhé!`
      : "Mở tấm thiệp tốt nghiệp nhỏ từ Phương Mai nhé!",
    url: invitationUrl(),
  };

  if (navigator.share && window.location.protocol !== "file:") {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(shareData.url);
    showToast(
      window.location.protocol === "file:"
        ? "Hãy dùng nút này sau khi đăng trang lên GitHub Pages nhé."
        : "Đã sao chép đường dẫn thiệp ✦",
    );
  } catch {
    const helper = document.createElement("textarea");
    helper.value = shareData.url;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
    showToast("Đã sao chép đường dẫn thiệp ✦");
  }
}

function openLightbox(card) {
  lightboxImage.src = card.dataset.lightbox;
  lightboxImage.alt = card.querySelector("img")?.alt || "Ảnh tốt nghiệp của Phương Mai";
  lightboxCaption.textContent = card.dataset.caption || "Phương Mai — Class of 2026";
  document.body.classList.add("lightbox-open");

  if (typeof lightbox.showModal === "function") lightbox.showModal();
  else lightbox.setAttribute("open", "");
}

function closeLightbox() {
  document.body.classList.remove("lightbox-open");

  if (typeof lightbox.close === "function" && lightbox.open) lightbox.close();
  else lightbox.removeAttribute("open");

  window.setTimeout(() => {
    lightboxImage.removeAttribute("src");
  }, 180);
}

function revealVisibleItems() {
  document.querySelectorAll(".reveal").forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight * 1.08) item.classList.add("is-visible");
  });
}

guestForm.addEventListener("submit", (event) => {
  event.preventDefault();
  openInvitation();
});

openWithoutName.addEventListener("click", () => {
  updatePersonalMessage(guestInput.value || guestName);
  openInvitation({ useInput: false });
});

replayButton.addEventListener("click", replayInvitation);
saveButton.addEventListener("click", () => window.print());
document.querySelectorAll("[data-share]").forEach((button) => {
  button.addEventListener("click", shareInvitation);
});

document.querySelectorAll("[data-lightbox]").forEach((card) => {
  card.addEventListener("click", () => openLightbox(card));
});

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
lightbox.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeLightbox();
});

window.addEventListener(
  "scroll",
  () => siteHeader.classList.toggle("is-scrolled", window.scrollY > 32),
  { passive: true },
);

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6%" },
  );

  document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));
} else {
  document.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
}

if (pageParams.get("open") === "1") {
  window.setTimeout(() => openInvitation({ useInput: false }), 350);
}
