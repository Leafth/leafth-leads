const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");

menuButton?.addEventListener("click", () => {
  mobileMenu?.classList.toggle("hidden");
});

const leadForm = document.getElementById('leadForm');

leadForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  
  const formData = {
    nome: document.getElementById('nome').value,
    email: document.getElementById('email').value,
    telefone: document.getElementById('telefone').value,
    sistema: document.getElementById('sistema').value,
    mensagem: document.getElementById('mensagem').value,
  };

  console.log('Dados do formulário capturados:', formData);
  leadForm.reset();
});