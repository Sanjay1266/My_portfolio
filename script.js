(() => {
    const body = document.body;
    const root = document.documentElement;
    const savedTheme = localStorage.getItem("theme");
    const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = savedTheme || (preferredDark ? "dark" : "light");
    body.setAttribute("data-theme", theme);

    const preloader = document.querySelector("[data-preloader]");
    window.addEventListener("load", () => {
        if (preloader) preloader.classList.add("hidden");
    });

    const themeToggle = document.querySelector("[data-theme-toggle]");
    if (themeToggle) {
        const icon = themeToggle.querySelector("i");
        const syncIcon = () => {
            icon.className = body.getAttribute("data-theme") === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
        };
        syncIcon();

        themeToggle.addEventListener("click", () => {
            const current = body.getAttribute("data-theme");
            const next = current === "dark" ? "light" : "dark";
            body.setAttribute("data-theme", next);
            localStorage.setItem("theme", next);
            syncIcon();
        });
    }

    const menuBtn = document.querySelector("[data-menu-btn]");
    const navLinks = document.querySelector("[data-nav-links]");
    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("open");
            body.classList.toggle("nav-open", isOpen);
            menuBtn.setAttribute("aria-expanded", String(isOpen));
        });
        navLinks.addEventListener("click", (event) => {
            if (event.target.matches("a")) {
                navLinks.classList.remove("open");
                body.classList.remove("nav-open");
                menuBtn.setAttribute("aria-expanded", "false");
            }
        });
    }

    const progress = document.querySelector("[data-scroll-progress]");
    const topBtn = document.querySelector("[data-back-to-top]");
    const onScroll = () => {
        const scrollTop = root.scrollTop || body.scrollTop;
        const scrollHeight = root.scrollHeight - root.clientHeight;
        const ratio = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        if (progress) progress.style.width = `${ratio}%`;
        if (topBtn) topBtn.classList.toggle("show", scrollTop > 420);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (topBtn) {
        topBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    const revealEls = document.querySelectorAll("[data-reveal]");
    if (revealEls.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.18 });
        revealEls.forEach((el) => observer.observe(el));
    }

    const skillFills = document.querySelectorAll(".skill-fill[data-width]");
    const animateSkills = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.width = entry.target.dataset.width;
                animateSkills.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });
    skillFills.forEach((fill) => animateSkills.observe(fill));

    const typingEl = document.querySelector("[data-typing]");
    if (typingEl) {
        const roles = [
            "AI/ML Enthusiast",
            "Full Stack Developer",
            "Computer Vision Explorer",
            "Research-Oriented Engineer"
        ];
        let roleIdx = 0;
        let charIdx = 0;
        let deleting = false;
        const tick = () => {
            const current = roles[roleIdx];
            charIdx += deleting ? -1 : 1;
            typingEl.textContent = current.slice(0, charIdx);

            if (!deleting && charIdx === current.length) {
                deleting = true;
                setTimeout(tick, 1100);
                return;
            }

            if (deleting && charIdx === 0) {
                deleting = false;
                roleIdx = (roleIdx + 1) % roles.length;
            }

            setTimeout(tick, deleting ? 45 : 80);
        };
        tick();
    }

    document.addEventListener("click", (event) => {
        const button = event.target.closest(".btn");
        if (!button) return;
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        const rect = button.getBoundingClientRect();
        circle.style.width = `${diameter}px`;
        circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.className = "ripple";
        button.appendChild(circle);
        setTimeout(() => circle.remove(), 650);
    });

    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";
    const navAnchors = document.querySelectorAll(".nav-links a");
    navAnchors.forEach((a) => {
        const href = a.getAttribute("href") || "";
        const normalized = href.split("/").pop();
        if ((page === "index.html" || page === "") && href.includes("#about")) a.classList.add("active");
        if (normalized === page) a.classList.add("active");
    });

    const pageSections = document.querySelectorAll("section[id]");
    if (pageSections.length && page.includes("index")) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                navAnchors.forEach((link) => {
                    link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
                });
            });
        }, { threshold: 0.55 });
        pageSections.forEach((section) => sectionObserver.observe(section));
    }

    const yearNode = document.querySelector("[data-year]");
    if (yearNode) yearNode.textContent = String(new Date().getFullYear());

    const setupFilter = (scopeSelector, cardSelector, chipSelector, searchSelector, key = "all") => {
        const scope = document.querySelector(scopeSelector);
        if (!scope) return;
        const cards = scope.querySelectorAll(cardSelector);
        const chips = scope.querySelectorAll(chipSelector);
        const search = scope.querySelector(searchSelector);
        const state = { category: key, query: "" };

        const runFilter = () => {
            cards.forEach((card) => {
                const category = card.dataset.category || "all";
                const text = card.innerText.toLowerCase();
                const categoryMatch = state.category === "all" || category === state.category;
                const queryMatch = text.includes(state.query);
                card.style.display = categoryMatch && queryMatch ? "" : "none";
            });
        };

        chips.forEach((chip) => chip.addEventListener("click", () => {
            chips.forEach((node) => node.classList.remove("active"));
            chip.classList.add("active");
            state.category = chip.dataset.filter || "all";
            runFilter();
        }));

        if (search) {
            search.addEventListener("input", () => {
                state.query = search.value.trim().toLowerCase();
                runFilter();
            });
        }
        runFilter();
    };

    setupFilter("[data-projects]", ".project-card", ".chip", "[data-search-project]");
    setupFilter("[data-blogs]", ".blog-card", ".chip", "[data-search-blog]");

    const modal = document.querySelector("[data-modal]");
    if (modal) {
        const modalContent = modal.querySelector("[data-modal-content]");
        document.addEventListener("click", (event) => {
            const trigger = event.target.closest("[data-project-detail]");
            if (trigger) {
                const card = trigger.closest(".project-card");
                if (!card || !modalContent) return;
                modalContent.innerHTML = `
                    <h3>${card.dataset.title}</h3>
                    <p class="meta">${card.dataset.stack}</p>
                    <p>${card.dataset.long}</p>
                `;
                modal.classList.add("open");
                modal.setAttribute("aria-hidden", "false");
            }
            if (event.target.matches("[data-modal-close]") || event.target === modal) {
                modal.classList.remove("open");
                modal.setAttribute("aria-hidden", "true");
            }
        });
    }

    const form = document.querySelector("[data-contact-form]");
    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const fields = ["name", "email", "subject", "message"];
            let hasError = false;
            fields.forEach((field) => {
                const input = form.querySelector(`[name="${field}"]`);
                const error = form.querySelector(`[data-error="${field}"]`);
                if (!input || !error) return;
                error.textContent = "";

                const value = input.value.trim();
                if (!value) {
                    error.textContent = "This field is required.";
                    hasError = true;
                    return;
                }
                if (field === "email" && !/^\S+@\S+\.\S+$/.test(value)) {
                    error.textContent = "Enter a valid email address.";
                    hasError = true;
                }
            });
            if (hasError) return;
            form.reset();
            alert("Thanks! Your message has been validated and captured.");
        });
    }
})();
