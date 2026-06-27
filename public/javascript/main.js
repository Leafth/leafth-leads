const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");

menuButton?.addEventListener("click", () => {
  mobileMenu?.classList.toggle("hidden");
});
