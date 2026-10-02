import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector<HTMLElement>("[data-header]");
const menuToggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
const mobileMenu = document.querySelector<HTMLElement>(".mobile-menu");
const workSection = document.querySelector<HTMLElement>("[data-work-section]");
const sliderInterval = 5200;

document.querySelectorAll<HTMLElement>("[data-slider]").forEach((slider) => {
  const slides = Array.from(slider.querySelectorAll<HTMLImageElement>(".project-slide"));
  const buttons = Array.from(slider.parentElement?.querySelectorAll<HTMLButtonElement>("[data-slide-target]") ?? []);
  let activeIndex = 0;
  let timer: number | undefined;

  const showSlide = (nextIndex: number) => {
    activeIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
    buttons.forEach((button, index) => {
      const isActive = index === activeIndex;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = undefined;
  };

  const start = () => {
    if (reduceMotion || slides.length < 2) return;
    stop();
    timer = window.setInterval(() => showSlide(activeIndex + 1), sliderInterval);
  };

  buttons.forEach((button) => button.addEventListener("click", () => {
    showSlide(Number(button.dataset.slideTarget));
    start();
  }));
  slider.parentElement?.addEventListener("pointerenter", stop);
  slider.parentElement?.addEventListener("pointerleave", start);
  slider.parentElement?.addEventListener("focusin", stop);
  slider.parentElement?.addEventListener("focusout", (event) => {
    if (!slider.parentElement?.contains(event.relatedTarget as Node | null)) start();
  });
  start();
});

if (workSection) {
  const imageAreas = Array.from(workSection.querySelectorAll<HTMLElement>(".project-image-wrap"));
  const visibleImages = new Set<HTMLElement>();
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visibleImages.add(entry.target as HTMLElement);
      else visibleImages.delete(entry.target as HTMLElement);
    });
    const isImageFocus = visibleImages.size > 0;
    workSection.classList.toggle("is-image-focus", isImageFocus);
    header?.classList.toggle("is-image-focus", isImageFocus);
  }, { threshold: 0.2 });

  imageAreas.forEach((image) => imageObserver.observe(image));
}

if (!reduceMotion) {
  const heroTitle = document.querySelector<HTMLElement>("[data-split-text]");
  if (heroTitle) {
    const originalTitle = heroTitle.innerHTML;
    const lines = heroTitle.innerHTML.split("<br>");
    heroTitle.innerHTML = lines.map((line) => `<span class="title-line"><span>${line}</span></span>`).join("");
    gsap.from(".title-line > span", {
      y: 24,
      opacity: 0,
      duration: 1.2,
      stagger: 0.12,
      ease: "power4.out",
      delay: 0.25,
      onComplete: () => { heroTitle.innerHTML = originalTitle; },
    });
    gsap.from(".hero-eyebrow, .hero-bottomline, .hero-footer", { opacity: 0, y: 24, duration: 0.9, stagger: 0.1, ease: "power3.out", delay: 0.55 });
    gsap.to(".hero-orbit", { rotation: 360, duration: 28, repeat: -1, ease: "none" });
  }

  gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((element) => {
    gsap.from(element, {
      opacity: 0,
      y: 48,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 84%",
        toggleActions: "play none none reset",
      },
    });
  });

  gsap.utils.toArray<HTMLElement>(".project-image-wrap").forEach((image) => {
    let targetX = image.clientWidth / 2;
    let targetY = image.clientHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let frame: number | undefined;

    const updateFocus = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      image.style.setProperty("--pointer-x", `${currentX}px`);
      image.style.setProperty("--pointer-y", `${currentY}px`);

      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        frame = window.requestAnimationFrame(updateFocus);
      } else {
        frame = undefined;
      }
    };

    const requestFocusUpdate = () => {
      if (frame === undefined) frame = window.requestAnimationFrame(updateFocus);
    };

    image.addEventListener("pointermove", (event) => {
      const bounds = image.getBoundingClientRect();
      targetX = event.clientX - bounds.left;
      targetY = event.clientY - bounds.top;
      requestFocusUpdate();
    });

    image.addEventListener("pointerleave", () => {
      targetX = image.clientWidth / 2;
      targetY = image.clientHeight / 2;
      requestFocusUpdate();
    });

    gsap.fromTo(image.querySelector("img"), { scale: 1.12 }, {
      scale: 1,
      ease: "none",
      scrollTrigger: { trigger: image, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  gsap.utils.toArray<HTMLElement>("[data-value-card]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.setProperty("--card-rotate-y", `${x * 3}deg`);
      card.style.setProperty("--card-rotate-x", `${y * -3}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--card-rotate-x", "0deg");
      card.style.setProperty("--card-rotate-y", "0deg");
    });
  });

  ScrollTrigger.create({
    start: "top -80",
    end: "max",
    onUpdate: (self) => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0 ? self.scroll() / scrollableHeight : 0;
      header?.classList.toggle("is-scrolled", self.scroll() > 80);
      header?.style.setProperty("--scroll-progress", String(Math.min(1, Math.max(0, progress))));
    },
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
