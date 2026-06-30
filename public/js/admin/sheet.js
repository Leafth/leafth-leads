import { productLabels, statusLabels, statusStyles } from "./constants.js";
import {
  closeSheetButton,
  leadSheet,
  leadSheetOverlay,
  sheetCity,
  sheetDate,
  sheetDeleteButton,
  sheetEmail,
  sheetEmailLink,
  sheetMessage,
  sheetMessageWrap,
  sheetName,
  sheetPhone,
  sheetProduct,
  sheetStatus,
  sheetStatusDot,
  sheetStatusLabel,
} from "./dom.js";
import { formatPhone } from "./formatters.js";

let currentLeadId = null;

function formatFullDate(dateStr) {
  if (!dateStr) return "—";

  const date = new Date(dateStr);

  const datePart = date.toLocaleDateString("pt-BR");
  const timePart = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart}, ${timePart}`;
}

function buildGmailLink(lead) {
  if (!lead.email) return "#";

  const subject = `Contato Leafth - ${lead.name || "Lead"}`;

  const body = `
Olá, ${lead.name || "tudo bem"}!

Recebemos seu contato pelo site da Leafth e gostaríamos de conversar melhor sobre sua necessidade.

Resumo do contato:
- Nome: ${lead.name || "—"}
- Telefone: ${formatPhone(lead.phone) || "—"}
- Cidade: ${lead.city || "—"}
- Sistema de interesse: ${productLabels[lead.product] || lead.product || "—"}
- Status atual: ${statusLabels[lead.status] || lead.status || "—"}

Podemos marcar uma conversa para entender melhor sua propriedade?

Atenciosamente,
Equipe Leafth
  `.trim();

  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: lead.email,
    su: subject,
    body,
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}

function fillSheet(lead) {
  currentLeadId = lead.id;

  sheetName.textContent = lead.name || "—";
  sheetDate.textContent = formatFullDate(lead.created_at);

  const style = statusStyles[lead.status] || statusStyles.novo;
  sheetStatusLabel.textContent = statusLabels[lead.status] || lead.status;
  sheetStatusDot.style.color = style.color;
  sheetStatus.style.color = style.color;
  sheetStatus.style.borderColor = style.border;
  sheetStatus.style.backgroundColor = "#ffffff";

  sheetProduct.textContent = productLabels[lead.product] || lead.product;

  sheetEmail.textContent = lead.email || "—";
  sheetPhone.textContent = formatPhone(lead.phone) || "—";
  sheetCity.textContent = lead.city || "—";

  if (lead.message) {
    sheetMessage.textContent = lead.message;
    sheetMessageWrap.classList.remove("hidden");
  } else {
    sheetMessageWrap.classList.add("hidden");
  }

  sheetEmailLink.href = buildGmailLink(lead);
  sheetEmailLink.target = "_blank";
  sheetEmailLink.rel = "noopener noreferrer";

  sheetEmailLink.classList.toggle("pointer-events-none", !lead.email);
  sheetEmailLink.classList.toggle("opacity-50", !lead.email);

  sheetDeleteButton.dataset.leadId = lead.id;
  sheetDeleteButton.dataset.leadName = lead.name;
}

export function openLeadSheet(lead) {
  fillSheet(lead);

  leadSheetOverlay.classList.remove("hidden");

  requestAnimationFrame(() => {
    leadSheetOverlay.classList.add("opacity-100");
    leadSheet.classList.remove("translate-x-full");
  });

  document.body.classList.add("overflow-hidden");
}

export function closeLeadSheet() {
  leadSheet.classList.add("translate-x-full");
  leadSheetOverlay.classList.remove("opacity-100");

  document.body.classList.remove("overflow-hidden");
  currentLeadId = null;

  setTimeout(() => {
    leadSheetOverlay.classList.add("hidden");
  }, 300);
}

export function getCurrentSheetLeadId() {
  return currentLeadId;
}

closeSheetButton.addEventListener("click", closeLeadSheet);

leadSheetOverlay.addEventListener("click", (event) => {
  if (event.target === leadSheetOverlay) {
    closeLeadSheet();
  }
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    !leadSheet.classList.contains("translate-x-full")
  ) {
    closeLeadSheet();
  }
});
