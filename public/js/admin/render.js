import { productLabels, statusLabels, statusStyles } from "./constants.js";
import { formatDate, formatPhone } from "./formatters.js";
import {
  leadsTable,
  totalLabel,
  showingLabel,
  totalLeadsCard,
  totalAriaCard,
  totalCongaCard,
  convertidosCard,
} from "./dom.js";

export function getStatusStyle(status) {
  const style = statusStyles[status] || statusStyles.novo;

  return `
    background-color: #ffffff;
    color: ${style.color};
    border-color: ${style.border};
    appearance: none;
    -webkit-appearance: none;
    min-width: 145px;
  `;
}

export function applyStatusStyle(select) {
  const style = statusStyles[select.value] || statusStyles.novo;

  select.style.backgroundColor = "#ffffff";
  select.style.color = style.color;
  select.style.borderColor = style.border;

  const wrapper = select.closest("[data-status-wrapper]");
  const arrow = wrapper?.querySelector("[data-status-arrow]");

  if (arrow) {
    arrow.style.color = style.color;
  }
}

function renderStatusOptions(currentStatus) {
  return Object.entries(statusLabels)
    .map(([value, label]) => {
      const selected = value === currentStatus ? "selected" : "";

      return `
        <option value="${value}" ${selected} style="background-color: #ffffff; color: #334155;">
          ${label}
        </option>
      `;
    })
    .join("");
}

export function renderLeads(leads) {
  if (leads.length === 0) {
    leadsTable.innerHTML = `
      <tr>
        <td colspan="8" class="px-6 py-10 text-center text-sm text-slate-400">
          Nenhum lead encontrado.
        </td>
      </tr>
    `;

    return;
  }

  leadsTable.innerHTML = leads
    .map((lead) => {
      const statusStyle = statusStyles[lead.status] || statusStyles.novo;

      return `
        <tr class="transition hover:bg-slate-50">
          <td class="px-6 py-5 text-sm font-semibold text-slate-700">
            ${lead.name}
          </td>

          <td class="px-6 py-5 text-sm text-slate-500">
            ${lead.email}
          </td>

          <td class="px-6 py-5 text-sm text-slate-500">
            ${formatPhone(lead.phone)}
          </td>

          <td class="px-6 py-5 text-sm text-slate-500">
            ${lead.city || "-"}
          </td>

          <td class="px-6 py-5 text-sm text-slate-500">
            ${productLabels[lead.product] || lead.product}
          </td>

          <td class="px-6 py-5">
            <div data-status-wrapper class="relative inline-block">
              <select
                data-lead-status
                data-lead-id="${lead.id}"
                data-current-status="${lead.status}"
                class="cursor-pointer rounded-full border bg-white px-4 py-2 pr-9 text-xs font-bold outline-none transition hover:brightness-95 focus:ring-2 focus:ring-blue-100"
                style="${getStatusStyle(lead.status)}"
              >
                ${renderStatusOptions(lead.status)}
              </select>

              <span
                data-status-arrow
                class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold"
                style="color: ${statusStyle.color};"
              >
                ▾
              </span>
            </div>
          </td>

          <td class="px-6 py-5 text-sm text-slate-400">
            ${formatDate(lead.created_at)}
          </td>

          <td class="px-6 py-5">
            <div data-actions-wrapper class="relative inline-block text-left">
              <button
                type="button"
                data-actions-toggle
                data-lead-id="${lead.id}"
                aria-label="Abrir opções do lead"
                class="cursor-pointer px-2 text-2xl leading-none text-slate-400 transition hover:text-slate-700"
              >
                ⋮
              </button>

              <div
                data-actions-menu
                class="absolute right-0 z-30 mt-2 hidden w-44 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg"
              >
                <button
                  type="button"
                  data-view-lead
                  data-lead-id="${lead.id}"
                  class="block w-full px-4 py-3 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Ver detalhes
                </button>

                <button
                  type="button"
                  data-delete-lead
                  data-lead-id="${lead.id}"
                  data-lead-name="${lead.name}"
                  class="block w-full px-4 py-3 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Deletar
                </button>
              </div>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

export function renderLeadsError() {
  leadsTable.innerHTML = `
    <tr>
      <td colspan="8" class="px-6 py-10 text-center text-sm text-red-400">
        Erro ao carregar leads.
      </td>
    </tr>
  `;
}

export function updateLabels(leads) {
  const total = leads.length;

  totalLabel.textContent = `${total} ${total === 1 ? "contato" : "contatos"}`;
  showingLabel.textContent = `Mostrando ${total} de ${total} leads`;
}

export function updateSummary(summary) {
  const totalAria = (summary.totalAria || 0) + (summary.totalAmbos || 0);
  const totalConga = (summary.totalConga || 0) + (summary.totalAmbos || 0);

  totalLeadsCard.textContent = summary.totalLeads || 0;
  totalAriaCard.textContent = totalAria;
  totalCongaCard.textContent = totalConga;
  convertidosCard.textContent = summary.convertidos || 0;
}

export function updatePipeline(pipeline) {
  Object.entries(pipeline).forEach(([status, total]) => {
    const pipelineElement = document.querySelector(
      `[data-pipeline="${status}"]`,
    );

    if (pipelineElement) {
      pipelineElement.textContent = total || 0;
    }
  });
}
