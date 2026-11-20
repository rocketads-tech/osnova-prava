const YM_COUNTER_ID = 114386213;

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. МОДАЛЬНОЕ ОКНО ОБРАТНОГО ЗВОНКА
  // ==========================================
  const callbackModal = document.getElementById("callback-modal");
  const openModalBtns = document.querySelectorAll(".open-modal");
  const closeModalBtn = document.querySelector(".modal-close");

  if (callbackModal) {
    const modalTitle = callbackModal.querySelector("[data-modal-title]");
    const modalSubtitle = callbackModal.querySelector("[data-modal-subtitle]");
    const modalForm = callbackModal.querySelector(".modal-form");
    const modalContent = callbackModal.querySelector(".modal-content");
    const formTypeInput = callbackModal.querySelector("[data-form-type-input]");
    const modalStatus = callbackModal.querySelector("[data-modal-status]");
    const submitBtn = modalForm
      ? modalForm.querySelector(".modal-submit")
      : null;

    const resetStatus = () => {
      if (!modalStatus) return;
      modalStatus.hidden = true;
      modalStatus.textContent = "";
      modalStatus.classList.remove(
        "modal-status--success",
        "modal-status--error",
      );
    };

    const setStatus = (text, type) => {
      if (!modalStatus) return;
      modalStatus.hidden = false;
      modalStatus.textContent = text;
      modalStatus.classList.remove(
        "modal-status--success",
        "modal-status--error",
      );
      modalStatus.classList.add(
        type === "success" ? "modal-status--success" : "modal-status--error",
      );
    };

    openModalBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.formType || "consultation";
        callbackModal.dataset.formType = type;
        if (formTypeInput) {
          formTypeInput.value = type;
        }
        resetStatus();
        if (modalContent) {
          modalContent.classList.remove("modal-content--success");
        }
        modalTitle.textContent =
          btn.dataset.modalTitle || callbackModal.dataset.modalTitle;
        modalSubtitle.textContent =
          btn.dataset.modalSubtitle || callbackModal.dataset.modalSubtitle;
        callbackModal.classList.add("modal--open");
      });
    });

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        callbackModal.classList.remove("modal--open");
      });
    }

    window.addEventListener("click", (e) => {
      if (e.target === callbackModal) {
        callbackModal.classList.remove("modal--open");
      }
    });

    if (modalForm && submitBtn) {
      const defaultLabel = submitBtn.textContent;
      const consentCheckbox = modalForm.querySelector('input[name="consent"]');

      const syncSubmitState = () => {
        if (consentCheckbox) {
          submitBtn.disabled = !consentCheckbox.checked;
        }
      };

      if (consentCheckbox) {
        consentCheckbox.addEventListener("change", syncSubmitState);
      }

      modalForm.addEventListener("submit", (event) => {
        event.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = "Отправляем...";

        fetch(modalForm.action, {
          method: "POST",
          body: new FormData(modalForm),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.ok) {
              // === YANDEX METRICA: Успешная отправка ===
              const formType = formTypeInput
                ? formTypeInput.value
                : "consultation";
              const goalId =
                formType === "callback" ? "form_callback" : "form_consultation";
              if (typeof ym !== "undefined") {
                ym(YM_COUNTER_ID, "reachGoal", goalId);
              }
              // =========================================
              modalForm.reset();
              if (modalContent) {
                modalContent.classList.add("modal-content--success");
              }
            } else {
              setStatus(
                data.error ||
                  "Не удалось отправить заявку. Позвоните нам: +7 (990) 009-36-90",
                "error",
              );
            }
          })
          .catch(() => {
            setStatus(
              "Ошибка соединения. Позвоните нам: +7 (990) 009-36-90",
              "error",
            );
          })
          .finally(() => {
            syncSubmitState();
            submitBtn.textContent = defaultLabel;
          });
      });
    }
  }

  // ==========================================
  // 2. МОБИЛЬНОЕ МЕНЮ (БУРГЕР)
  // ==========================================
  const burgerBtn = document.getElementById("burger-btn");
  const mobileNav = document.getElementById("mobile-nav");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  if (burgerBtn && mobileNav) {
    const toggleMenu = () => {
      const isActive = mobileNav.classList.contains("active");
      burgerBtn.classList.toggle("active");
      mobileNav.classList.toggle("active");
      document.body.style.overflow = isActive ? "" : "hidden";
    };

    burgerBtn.addEventListener("click", toggleMenu);

    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        burgerBtn.classList.remove("active");
        mobileNav.classList.remove("active");
        document.body.style.overflow = "";
      });
    });
  }

  // ==========================================
  // 3. СЛАЙДЕР ОТЗЫВОВ (SWIPER)
  // ==========================================
  if (
    typeof Swiper !== "undefined" &&
    document.querySelector(".reviews-slider")
  ) {
    new Swiper(".reviews-slider", {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: false,
      navigation: {
        nextEl: ".reviews-next",
        prevEl: ".reviews-prev",
      },
      breakpoints: {
        768: {
          spaceBetween: 30,
        },
      },
    });
  }

  // ==========================================
  // 4. ОФИСЫ В ФУТЕРЕ (ЗАГОЛОВОК + КАРТА)
  // ==========================================
  const footerOffices = document.getElementById("footer-offices");

  if (footerOffices) {
    const officeTitleCity = footerOffices.querySelector("[data-active-city]");
    const mapFrame = document.getElementById("footer-map");
    const cityButtons = footerOffices.querySelectorAll(".footer-city");
    const infoCards = footerOffices.querySelectorAll(".footer-office-info");

    cityButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const city = btn.dataset.city;

        cityButtons.forEach((item) =>
          item.classList.toggle("hidden", item === btn),
        );

        infoCards.forEach((card) => {
          card.classList.toggle("active", card.dataset.city === city);
        });

        if (officeTitleCity) {
          officeTitleCity.textContent = btn.dataset.cityIn || city;
        }

        if (mapFrame && btn.dataset.mapUrl) {
          mapFrame.src = btn.dataset.mapUrl;
        }
      });
    });
  }

  // ==========================================
  // 5. АНИМАЦИИ ПОЯВЛЕНИЯ (AOS-СТИЛЬ)
  // ==========================================
  const animatedEls = document.querySelectorAll("[data-aos]");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (
    animatedEls.length &&
    !prefersReducedMotion &&
    "IntersectionObserver" in window
  ) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            if (el.dataset.aosDuration) {
              el.style.transitionDuration = el.dataset.aosDuration + "ms";
            }
            if (el.dataset.aosDelay) {
              el.style.transitionDelay = el.dataset.aosDelay + "ms";
            }
            el.classList.add("aos-animate");
            el.addEventListener("transitionend", function handler(event) {
              if (event.target !== el) return;
              el.style.transitionDuration = "";
              el.style.transitionDelay = "";
              el.classList.add("aos-done");
              el.removeEventListener("transitionend", handler);
            });
          } else {
            el.classList.remove("aos-animate", "aos-done");
          }
        });
      },
      { threshold: 0.15 },
    );

    animatedEls.forEach((el) => revealObserver.observe(el));
  } else {
    animatedEls.forEach((el) => el.classList.add("aos-animate"));
  }

  // ==========================================
  // 6. ЛИПКИЙ ХЕДЕР / НАВИГАЦИЯ
  // ==========================================
  const header = document.querySelector(".header");
  const headerNav = document.querySelector(".header-nav");
  const mobileHeaderMedia = window.matchMedia("(max-width: 768px)");

  if (header) {
    let lastScrollY = window.scrollY;
    let navNaturalTop = 0;

    window.addEventListener(
      "scroll",
      () => {
        const currentY = window.scrollY;

        if (mobileHeaderMedia.matches) {
          header.classList.toggle("header--scrolled", currentY > 40);

          if (currentY > lastScrollY && currentY > 150) {
            header.classList.add("header--hidden");
          } else {
            header.classList.remove("header--hidden");
          }
        } else if (headerNav) {
          if (!headerNav.classList.contains("header-nav--fixed")) {
            navNaturalTop = headerNav.getBoundingClientRect().top + currentY;
          }

          headerNav.classList.toggle(
            "header-nav--fixed",
            currentY > navNaturalTop,
          );
          headerNav.classList.toggle(
            "header-nav--hidden",
            currentY > lastScrollY && currentY > navNaturalTop + 150,
          );
        }

        lastScrollY = currentY;
      },
      { passive: true },
    );
  }

  // ==========================================
  // 7. АКТИВНЫЕ ПУНКТЫ МЕНЮ
  // ==========================================
  const navLinks = document.querySelectorAll(
    '.header-nav a[href^="#"], .mobile-nav a[href^="#"]',
  );

  if (navLinks.length) {
    const spySections = [];
    navLinks.forEach((link) => {
      const section = document.getElementById(
        link.getAttribute("href").slice(1),
      );
      if (section && !spySections.includes(section)) {
        spySections.push(section);
      }
    });

    const updateActiveLink = () => {
      const spyLine = window.scrollY + window.innerHeight * 0.35;
      let currentId = spySections.length ? spySections[0].id : null;

      spySections.forEach((section) => {
        if (spyLine >= section.offsetTop) {
          currentId = section.id;
        }
      });

      navLinks.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href").split("#")[1] === currentId,
        );
      });
    };

    updateActiveLink();
    window.addEventListener("scroll", updateActiveLink, { passive: true });
  }

  // ==========================================
  // 8. YANDEX METRICA: UTM И КЛИКИ
  // ==========================================

  // А. Автоматический сбор UTM-меток в форму при загрузке страницы
  const metricaForm = document.querySelector(".modal-form");
  if (metricaForm) {
    const urlParams = new URLSearchParams(window.location.search);
    const utmKeys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
    ];

    utmKeys.forEach((key) => {
      if (
        urlParams.has(key) &&
        !metricaForm.querySelector(`input[name="${key}"]`)
      ) {
        const hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.name = key;
        hiddenInput.value = urlParams.get(key);
        metricaForm.appendChild(hiddenInput);
      }
    });
  }

  // Б. Отслеживание кликов по телефонам и мессенджерам (делегирование)
  document.addEventListener("click", function (e) {
    // Клик по телефону
    const phoneLink = e.target.closest('a[href^="tel:"]');
    if (phoneLink && typeof ym !== "undefined") {
      ym(YM_COUNTER_ID, "reachGoal", "phone_click");
    }

    // Клик по мессенджерам — определяем конкретный канал
    const messengerLink = e.target.closest(
      'a[href*="wa.me"], a[href*="t.me"], a[href*="max.ru"]',
    );
    if (messengerLink && typeof ym !== "undefined") {
      const href = messengerLink.href.toLowerCase();

      if (href.includes("wa.me") || href.includes("whatsapp")) {
        ym(YM_COUNTER_ID, "reachGoal", "messenger_whatsapp");
      } else if (href.includes("t.me") || href.includes("telegram")) {
        ym(YM_COUNTER_ID, "reachGoal", "messenger_telegram");
      } else if (href.includes("max.ru")) {
        ym(YM_COUNTER_ID, "reachGoal", "messenger_max");
      }
    }
  });
});
