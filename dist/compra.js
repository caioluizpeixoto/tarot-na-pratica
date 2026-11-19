// Checkout: link direto (o script do FluxoTracker adiciona as UTMs no href).
const button = document.querySelector("#buy");

button.addEventListener("click", () => {
  if (window.fbq) fbq("track", "InitiateCheckout", { content_name: "Tarot na Prática", value: 27.90, currency: "BRL" });
});


const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-in");
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12 });

  document.querySelectorAll(".three article, .deck, .bonus, .offer, .faq h2, .try-card")
    .forEach((element) => observer.observe(element));
}


const bonusInstruction = document.querySelector(".bonus-instruction");
for (const card of document.querySelectorAll(".bonus")) {
  const button = card.querySelector(".bonus-toggle");
  const closed = card.querySelector(".bonus-closed");
  const content = card.querySelector(".bonus-content");
  const returnHint = card.querySelector(".bonus-return");
  const revealLabel = button.getAttribute("aria-label");

  card.classList.add("is-interactive");
  button.hidden = false;
  closed.hidden = false;
  returnHint.hidden = false;
  content.setAttribute("aria-hidden", "true");

  button.addEventListener("click", () => {
    const flipped = card.classList.toggle("is-flipped");
    button.setAttribute("aria-expanded", String(flipped));
    button.setAttribute("aria-label", flipped ? "Virar de volta a carta do bônus" : revealLabel);
    content.setAttribute("aria-hidden", String(!flipped));
  });
}
bonusInstruction.hidden = false;


const bonusCarousel = document.querySelector("#bonus-carousel");
const bonusControls = document.querySelector(".bonus-carousel-controls");
const bonusCards = [...bonusCarousel.querySelectorAll(".bonus")];
const mobileBonuses = window.matchMedia("(max-width: 680px)");
const pauseBonuses = bonusControls.querySelector("[data-bonus-pause]");
let bonusTimer;
let bonusInView = false;
let bonusesPaused = reducedMotion.matches;

bonusCarousel.classList.add("is-carousel");
bonusControls.hidden = false;

function currentBonusIndex() {
  const left = bonusCarousel.scrollLeft;
  const origin = bonusCards[0].offsetLeft;
  return bonusCards.reduce((nearest, card, index) => {
    const offset = card.offsetLeft - origin;
    const best = bonusCards[nearest].offsetLeft - origin;
    return Math.abs(left - offset) < Math.abs(left - best) ? index : nearest;
  }, 0);
}

function moveBonus(direction) {
  const current = currentBonusIndex();
  const next = (current + direction + bonusCards.length) % bonusCards.length;
  bonusCarousel.scrollTo({
    left: bonusCards[next].offsetLeft - bonusCards[0].offsetLeft,
    behavior: reducedMotion.matches || Math.abs(current - next) > 1 ? "instant" : "smooth"
  });
}

function scheduleBonusAdvance() {
  window.clearTimeout(bonusTimer);
  if (!mobileBonuses.matches || !bonusInView || document.hidden || bonusesPaused) return;
  bonusTimer = window.setTimeout(() => {
    if (!bonusCards[currentBonusIndex()].classList.contains("is-flipped")) {
      moveBonus(1);
    }
    scheduleBonusAdvance();
  }, 4500);
}

function updateBonusPlayback() {
  pauseBonuses.textContent = bonusesPaused ? "Reproduzir" : "Pausar";
  scheduleBonusAdvance();
}

pauseBonuses.addEventListener("click", () => {
  bonusesPaused = !bonusesPaused;
  updateBonusPlayback();
});

for (const [selector, direction] of [["[data-bonus-prev]", -1], ["[data-bonus-next]", 1]]) {
  bonusControls.querySelector(selector).addEventListener("click", () => {
    moveBonus(direction);
    scheduleBonusAdvance();
  });
}

bonusCarousel.addEventListener("scroll", scheduleBonusAdvance, { passive: true });
bonusCarousel.addEventListener("click", scheduleBonusAdvance);
document.addEventListener("visibilitychange", scheduleBonusAdvance);
mobileBonuses.addEventListener("change", scheduleBonusAdvance);
reducedMotion.addEventListener("change", () => {
  bonusesPaused = reducedMotion.matches;
  updateBonusPlayback();
});

if ("IntersectionObserver" in window) {
  const carouselObserver = new IntersectionObserver(([entry]) => {
    bonusInView = entry.isIntersecting;
    scheduleBonusAdvance();
  }, { threshold: 0.3 });
  carouselObserver.observe(bonusCarousel);
} else {
  bonusInView = true;
}
updateBonusPlayback();
