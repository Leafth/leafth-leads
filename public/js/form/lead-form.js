const leadForm = document.querySelector("#leadForm");

const toast = document.querySelector("#toast");
const toastIcon = document.querySelector("#toastIcon");
const toastTitle = document.querySelector("#toastTitle");
const toastMessage = document.querySelector("#toastMessage");

let toastTimeout;

async function createLead(leadData) {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(leadData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Erro ao enviar formulário.");
  }

  return data;
}

function getLeadFormData() {
  return {
    name: document.querySelector("#nome").value.trim(),
    email: document.querySelector("#email").value.trim(),
    phone: document.querySelector("#telefone").value.trim(),
    city: document.querySelector("#cidade").value.trim(),
    product: document.querySelector("#sistema").value,
  };
}

function showToast({ type, title, message }) {
  clearTimeout(toastTimeout);

  const isSuccess = type === "success";

  toast.className = `
    pointer-events-none fixed right-6 top-6 z-[9999] max-w-sm rounded-2xl border bg-white p-4 shadow-xl
    ${isSuccess ? "border-emerald-100" : "border-red-100"}
  `;

  toastIcon.className = `
    flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold
    ${isSuccess ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}
  `;

  toastIcon.textContent = isSuccess ? "✓" : "!";
  toastTitle.textContent = title;
  toastMessage.textContent = message;

  toast.classList.remove("hidden");
  toast.classList.add("animate-[fadeIn_0.2s_ease-out]");

  toastTimeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 4000);
}

leadForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = leadForm.querySelector('button[type="submit"]');
  const originalButtonContent = submitButton.innerHTML;

  try {
    submitButton.disabled = true;
    submitButton.classList.add("opacity-60", "cursor-wait");
    submitButton.innerHTML = "Enviando...";

    const leadData = getLeadFormData();

    await createLead(leadData);

    leadForm.reset();

    showToast({
      type: "success",
      title: "Mensagem enviada!",
      message: "Recebemos seu contato. Nossa equipe responderá em breve.",
    });
  } catch (error) {
    showToast({
      type: "error",
      title: "Erro ao enviar",
      message: "Não foi possível enviar sua mensagem. Tente novamente.",
    });

    console.error(error);
  } finally {
    submitButton.classList.remove("opacity-60", "cursor-wait");
    submitButton.innerHTML = originalButtonContent;
    submitButton.disabled = false;
  }
});
