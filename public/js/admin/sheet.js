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

  sheetEmailLink.href = lead.email ? `mailto:${lead.email}` : "#";
  sheetDeleteButton.dataset.leadId = lead.id;
  sheetDeleteButton.dataset.leadName = lead.name;
}

export function openLeadSheet(lead) {
  fillSheet(lead);

  leadSheetOverlay.classList.remove("hidden");
  // força reflow para a transição funcionar ao remover "hidden"
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

  // espera a transição terminar antes de esconder o overlay de fato
  setTimeout(() => {
    leadSheetOverlay.classList.add("hidden");
  }, 300);
}

export function getCurrentSheetLeadId() {
  return currentLeadId;
}

closeSheetButton.addEventListener("click", closeLeadSheet);
leadSheetOverlay.addEventListener("click", closeLeadSheet);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !leadSheet.classList.contains("translate-x-full")) {
    closeLeadSheet();
  }
});