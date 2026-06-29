const leadForm = document.querySelector("#leadForm");

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

    submitButton.classList.remove("opacity-60", "cursor-wait");
    submitButton.classList.add("bg-emerald-600", "hover:bg-emerald-700");
    submitButton.innerHTML = "Mensagem enviada com sucesso";

    setTimeout(() => {
      submitButton.classList.remove("bg-emerald-600", "hover:bg-emerald-700");
      submitButton.innerHTML = originalButtonContent;
      submitButton.disabled = false;
    }, 4000);
  } catch (error) {
    submitButton.classList.remove("opacity-60", "cursor-wait");
    submitButton.classList.add("bg-red-600", "hover:bg-red-700");
    submitButton.innerHTML = "Erro ao enviar. Tente novamente";

    setTimeout(() => {
      submitButton.classList.remove("bg-red-600", "hover:bg-red-700");
      submitButton.innerHTML = originalButtonContent;
      submitButton.disabled = false;
    }, 4000);

    console.error(error);
  }
});
