import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector<HTMLElement>("[data-header]");
const menuToggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
const mobileMenu = document.querySelector<HTMLElement>(".mobile-menu");

if (!reduceMotion) {
  const heroTitle = document.querySelector<HTMLElement>("[data-split-text]");
  if (heroTitle) {
    const lines = heroTitle.innerHTML.split("<br>");
    heroTitle.innerHTML = lines.map((line) => `<span class="title-line"><span>${line}</span></span>`).join("");
    gsap.to(".title-line > span", { y: 0, duration: 1.2, stagger: 0.12, ease: "power4.out", delay: 0.25 });
    gsap.from(".hero-eyebrow, .hero-bottomline, .hero-footer", { opacity: 0, y: 24, duration: 0.9, stagger: 0.1, ease: "power3.out", delay: 0.55 });
    gsap.to(".hero-orbit", { rotation: 360, duration: 28, repeat: -1, ease: "none" });
  }

  gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((element) => {
    gsap.from(element, {
      opacity: 0,
      y: 48,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: element, start: "top 84%", once: true },
    });
  });

  gsap.utils.toArray<HTMLElement>(".project-image-wrap").forEach((image) => {
    gsap.fromTo(image.querySelector("img"), { scale: 1.12 }, {
      scale: 1,
      ease: "none",
      scrollTrigger: { trigger: image, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  ScrollTrigger.create({
    start: "top -80",
    end: "max",
    onUpdate: (self) => header?.classList.toggle("is-scrolled", self.scroll() > 80),
  });
}

const setMenuState = (open: boolean) => {
  menuToggle?.setAttribute("aria-expanded", String(open));
  mobileMenu?.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("menu-open", open);
};

menuToggle?.addEventListener("click", () => {
  setMenuState(menuToggle.getAttribute("aria-expanded") !== "true");
});

mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenuState(false)));
