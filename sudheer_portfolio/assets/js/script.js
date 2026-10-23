'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();

  });

}

// add click event to modal close button
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");
const formStatus = document.querySelector("[data-form-status]");

// Helper function to validate email format
const isValidEmail = function (email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Check full form validity
const checkFormValidity = function () {
  if (!form) return false;

  const fullname = form.querySelector('[name="fullname"]')?.value.trim() || "";
  const email = form.querySelector('[name="email"]')?.value.trim() || "";
  const subject = form.querySelector('[name="subject"]')?.value.trim() || "";
  const message = form.querySelector('[name="message"]')?.value.trim() || "";

  return (
    form.checkValidity() &&
    fullname.length >= 1 &&
    isValidEmail(email) &&
    subject.length >= 1 &&
    message.length >= 1
  );
};

// Update button disabled state
const updateFormButton = function () {
  if (!formBtn) return;
  if (checkFormValidity()) {
    formBtn.removeAttribute("disabled");
  } else {
    formBtn.setAttribute("disabled", "");
  }
};

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", updateFormButton);
  formInputs[i].addEventListener("change", updateFormButton);
  formInputs[i].addEventListener("keyup", updateFormButton);
}

// Initial check
updateFormButton();

// Track submission state to prevent duplicate submissions
let isSubmitting = false;

// handle form submission via EmailJS
if (form) {
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Prevent duplicate submissions while in progress
    if (isSubmitting) return;

    // Validate inputs
    if (!checkFormValidity()) {
      form.reportValidity();
      return;
    }

    const btnText = formBtn.querySelector("span");
    const originalText = btnText ? btnText.textContent : "Send Message";

    // Read EmailJS credentials from configuration/environment or direct fallback
    const serviceID =
      (window.EMAILJS_CONFIG?.SERVICE_ID && window.EMAILJS_CONFIG.SERVICE_ID !== "YOUR_SERVICE_ID")
        ? window.EMAILJS_CONFIG.SERVICE_ID
        : "service_sudheer";

    const templateID =
      (window.EMAILJS_CONFIG?.TEMPLATE_ID && window.EMAILJS_CONFIG.TEMPLATE_ID !== "YOUR_TEMPLATE_ID")
        ? window.EMAILJS_CONFIG.TEMPLATE_ID
        : "template_sudheer";

    const publicKey =
      (window.EMAILJS_CONFIG?.PUBLIC_KEY && window.EMAILJS_CONFIG.PUBLIC_KEY !== "YOUR_PUBLIC_KEY")
        ? window.EMAILJS_CONFIG.PUBLIC_KEY
        : "Y6o7zKcujG50UvUlk";

    // Check if EmailJS library loaded
    if (typeof emailjs === "undefined") {
      if (formStatus) {
        formStatus.className = "form-status-msg error active";
        formStatus.textContent = "Email service library could not be loaded. Please check your internet connection.";
      }
      return;
    }

    // Check if EmailJS has valid credentials
    const isConfigured =
      serviceID &&
      serviceID !== "YOUR_SERVICE_ID" &&
      templateID &&
      templateID !== "YOUR_TEMPLATE_ID" &&
      publicKey &&
      publicKey !== "YOUR_PUBLIC_KEY";

    if (!isConfigured) {
      if (formStatus) {
        formStatus.className = "form-status-msg error active";
        formStatus.innerHTML =
          "EmailJS is not yet configured with your credentials. Please set your <strong>EMAILJS_SERVICE_ID</strong>, <strong>EMAILJS_TEMPLATE_ID</strong>, and <strong>EMAILJS_PUBLIC_KEY</strong> in <code>assets/js/emailjs-config.js</code> (or .env).";
      }
      return;
    }

    // Set loading state and prevent duplicate submissions
    isSubmitting = true;
    formBtn.setAttribute("disabled", "");
    formBtn.style.pointerEvents = "none";
    if (btnText) btnText.textContent = "Sending...";
    if (formStatus) {
      formStatus.className = "form-status-msg";
      formStatus.textContent = "";
    }

    const fullname = form.querySelector('[name="fullname"]')?.value.trim() || "";
    const email = form.querySelector('[name="email"]')?.value.trim() || "";
    const subject = form.querySelector('[name="subject"]')?.value.trim() || "";
    const message = form.querySelector('[name="message"]')?.value.trim() || "";

    const templateParams = {
      from_name: fullname,
      name: fullname,
      user_name: fullname,
      from_email: email,
      email: email,
      user_email: email,
      reply_to: email,
      subject: subject,
      title: subject,
      message: message,
      to_name: "Venkata Sudheer Kalahasthi",
      to_email: "venkatasudheerkalahasthi@gmail.com"
    };

    try {
      emailjs.init({ publicKey: publicKey });

      const response = await emailjs.send(
        serviceID,
        templateID,
        templateParams,
        { publicKey: publicKey }
      );

      // Verify that the email service confirms delivery (HTTP 200 / OK)
      if (response && (response.status === 200 || response.text === "OK")) {
        if (formStatus) {
          formStatus.className = "form-status-msg success active";
          formStatus.textContent = "Thank you! Your message has been sent successfully. I will get back to you soon.";
        }
        form.reset();
        updateFormButton();
      } else {
        throw new Error(response?.text || "The email service did not confirm delivery.");
      }
    } catch (error) {
      console.error("EmailJS submission error:", error);
      if (formStatus) {
        formStatus.className = "form-status-msg error active";
        const errorMsg =
          error?.text ||
          error?.message ||
          "Failed to send message. Please verify your EmailJS credentials and network connection.";
        formStatus.textContent = `Error: ${errorMsg}`;
      }
      updateFormButton();
    } finally {
      isSubmitting = false;
      formBtn.style.pointerEvents = "";
      if (btnText) btnText.textContent = originalText;
    }
  });
}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    const targetPage = this.innerHTML.trim().toLowerCase();

    for (let i = 0; i < pages.length; i++) {
      const pageName = pages[i].dataset.page;
      const isMatch = targetPage === pageName ||
                      (targetPage === "projects" && pageName === "portfolio") ||
                      (targetPage === "portfolio" && pageName === "projects");

      if (isMatch) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}



//--------------------------------------------------
// #PROJECT DETAILS MODAL & THEME MAPPINGS
//--------------------------------------------------

const projectItems = document.querySelectorAll("[data-project-item]");
const projectModalContainer = document.querySelector("[data-project-modal-container]");
const projectModalCloseBtn = document.querySelector("[data-project-modal-close-btn]");
const projectOverlay = document.querySelector("[data-project-overlay]");

const projectModalBanner = document.querySelector(".project-modal-banner");
const projectModalImg = document.querySelector("[data-project-modal-img]");
const projectModalTitle = document.querySelector("[data-project-modal-title]");
const projectModalCategory = document.querySelector("[data-project-modal-category]");
const projectModalText = document.querySelector("[data-project-modal-text]");
const projectModalBtn = document.querySelector("[data-project-modal-btn]");

let currentActiveProjectItem = null;

const themeBgMapDark = {
  trustpay: "linear-gradient(165deg, #091a13 0%, #040c08 50%, #020503 100%)",
  linora: "linear-gradient(165deg, #121316 0%, #1e1d1c 50%, #252422 100%)",
  collegedsa: "linear-gradient(165deg, #182038 0%, #0d1222 50%, #070a14 100%)",
  codeorbit: "radial-gradient(circle at 50% 50%, #200810 0%, #0f0306 45%, #000000 100%)",
  ganesh: "linear-gradient(165deg, #25080a 0%, #170406 50%, #210a0c 100%)"
};

const themeBorderMapDark = {
  trustpay: "1px solid rgba(0, 230, 118, 0.25)",
  linora: "1px solid rgba(229, 172, 85, 0.25)",
  collegedsa: "1px solid rgba(59, 130, 246, 0.28)",
  codeorbit: "1px solid rgba(255, 45, 85, 0.28)",
  ganesh: "1px solid rgba(218, 165, 32, 0.3)"
};

const themeBgMapLight = {
  trustpay: "linear-gradient(165deg, #ffffff 0%, #f6f8fd 50%, #edf1fa 100%)",
  linora: "linear-gradient(165deg, #ede4d8 0%, #ded2c2 50%, #cbb9a3 100%)",
  collegedsa: "linear-gradient(165deg, #fdf8ee 0%, #f4e8d3 50%, #e2cfb2 100%)",
  codeorbit: "linear-gradient(165deg, #fbfaff 0%, #f3effe 50%, #e6e0fc 100%)",
  ganesh: "linear-gradient(165deg, #fffaf5 0%, #fef3e5 50%, #fae6cf 100%)"
};

const themeBorderMapLight = {
  trustpay: "1px solid rgba(79, 70, 229, 0.22)",
  linora: "1px solid rgba(168, 137, 107, 0.45)",
  collegedsa: "1px solid rgba(217, 119, 6, 0.35)",
  codeorbit: "1px solid rgba(124, 58, 237, 0.28)",
  ganesh: "1px solid rgba(217, 119, 6, 0.35)"
};

function updateModalThemeVisuals() {
  if (!currentActiveProjectItem) return;
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  const projectTheme = currentActiveProjectItem.getAttribute("data-project-theme");
  const lightImg = currentActiveProjectItem.querySelector("[data-project-light-img]");
  const darkImg = currentActiveProjectItem.querySelector("[data-project-dark-img]") || currentActiveProjectItem.querySelector("[data-project-img]");
  const activeImg = (isLight && lightImg) ? lightImg : darkImg;
  const titleEl = currentActiveProjectItem.querySelector("[data-project-title]");

  if (activeImg && projectModalImg) {
    projectModalImg.src = activeImg.src;
    projectModalImg.alt = activeImg.alt || (titleEl ? titleEl.innerText : "Project Image");
  }

  const bgMap = isLight ? themeBgMapLight : themeBgMapDark;
  const borderMap = isLight ? themeBorderMapLight : themeBorderMapDark;

  if (projectModalBanner && projectTheme && bgMap[projectTheme]) {
    projectModalBanner.style.background = bgMap[projectTheme];
    projectModalBanner.style.border = borderMap[projectTheme] || "1px solid var(--jet)";
  }
}

//--------------------------------------------------
// #THEME TOGGLE FUNCTIONALITY (Dark & Light Theme)
//--------------------------------------------------

const themeBtns = document.querySelectorAll("[data-theme-btn]");

const applyTheme = function (theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("vcard_portfolio_theme", theme);
  updateModalThemeVisuals();
};

// Ensure theme is synced on page load
const currentSavedTheme = localStorage.getItem("vcard_portfolio_theme") || "dark";
applyTheme(currentSavedTheme);

// Toggle function for all theme buttons (navbar & floating)
const handleThemeToggle = function (e) {
  if (e) {
    e.preventDefault();
  }
  const activeTheme = document.documentElement.getAttribute("data-theme") || "dark";
  const nextTheme = activeTheme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
};

for (let i = 0; i < themeBtns.length; i++) {
  themeBtns[i].addEventListener("click", handleThemeToggle);
}

//--------------------------------------------------
// #PROJECT DETAILS MODAL INTERACTIONS
//--------------------------------------------------

const toggleProjectModal = function () {
  if (projectModalContainer && projectOverlay) {
    projectModalContainer.classList.toggle("active");
    projectOverlay.classList.toggle("active");
    if (!projectModalContainer.classList.contains("active")) {
      currentActiveProjectItem = null;
    }
  }
};

if (projectItems.length > 0 && projectModalContainer) {
  for (let i = 0; i < projectItems.length; i++) {
    const item = projectItems[i];

    // Prevent default anchor link behavior
    const link = item.querySelector("a");
    if (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
      });
    }

    item.addEventListener("click", function (e) {
      e.preventDefault();

      currentActiveProjectItem = this;

      const titleEl = this.querySelector("[data-project-title]");
      const categoryEl = this.querySelector("[data-project-category]");
      const descEl = this.querySelector("[data-project-desc]");
      const projectUrl = this.getAttribute("data-project-url") || "#";

      updateModalThemeVisuals();

      if (titleEl && projectModalTitle) {
        projectModalTitle.innerText = titleEl.innerText;
      }

      if (categoryEl && projectModalCategory) {
        projectModalCategory.innerText = categoryEl.innerText;
      }

      if (descEl && projectModalText) {
        projectModalText.innerHTML = descEl.innerHTML;
        projectModalText.scrollTop = 0;
      }

      if (projectModalBtn) {
        const hasRealUrl = /^https?:\/\//.test(projectUrl) && projectUrl.replace(/\/$/, "") !== "https://github.com";
        projectModalBtn.hidden = !hasRealUrl;
        if (hasRealUrl) {
          projectModalBtn.href = projectUrl;
          projectModalBtn.style.display = "inline-flex";
        } else {
          projectModalBtn.removeAttribute("href");
          projectModalBtn.style.display = "none";
        }
      }

      toggleProjectModal();
    });
  }

  if (projectModalCloseBtn) {
    projectModalCloseBtn.addEventListener("click", toggleProjectModal);
  }

  if (projectOverlay) {
    projectOverlay.addEventListener("click", toggleProjectModal);
  }

  // Close modal when pressing Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && projectModalContainer.classList.contains("active")) {
      toggleProjectModal();
    }
  });
}

// Update copyright year dynamically
const copyrightYearEl = document.getElementById("copyright-year");
if (copyrightYearEl) {
  copyrightYearEl.textContent = new Date().getFullYear();
}