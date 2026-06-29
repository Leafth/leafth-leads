const productLabels = {
  aria: "ARIA",
  conga: "ConGa",
  ambos: "Ambos",
  personalizado: "Personalizado",
};

const statusLabels = {
  novo: "Novo",
  em_contato: "Em contato",
  interessado: "Qualificado",
  proposta: "Proposta",
  convertido: "Convertido",
  perdido: "Descartado",
};

const statusStyles = {
  novo: {
    background: "#f1f5f9",
    color: "#475569",
    border: "#cbd5e1",
  },
  em_contato: {
    background: "#eff6ff",
    color: "#2563eb",
    border: "#bfdbfe",
  },
  interessado: {
    background: "#f5f3ff",
    color: "#7c3aed",
    border: "#ddd6fe",
  },
  proposta: {
    background: "#fffbeb",
    color: "#d97706",
    border: "#fde68a",
  },
  convertido: {
    background: "#ecfdf5",
    color: "#059669",
    border: "#a7f3d0",
  },
  perdido: {
    background: "#fef2f2",
    color: "#dc2626",
    border: "#fecaca",
  },
};

const leadsTable = document.querySelector("[data-leads-table]");
const totalLabel = document.querySelector("[data-total-label]");
const showingLabel = document.querySelector("[data-showing-label]");

function formatDate(dateValue) {
  if (!dateValue) return "-";

  return new Intl.DateTimeFormat("pt-BR").format(new Date(dateValue));
}

function formatPhone(phoneValue) {
  if (!phoneValue) return "-";

  const digits = String(phoneValue).replace(/\D/g, "");

  if (digits.length === 13 && digits.startsWith("55")) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return phoneValue;
}

function getStatusStyle(status) {
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

function applyStatusStyle(select) {
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

function renderLeads(leads) {
  if (leads.length === 0) {
    leadsTable.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-10 text-center text-sm text-slate-400">
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
        </tr>
      `;
    })
    .join("");
}

function updateLabels(leads) {
  const total = leads.length;

  totalLabel.textContent = `${total} ${total === 1 ? "contato" : "contatos"}`;
  showingLabel.textContent = `Mostrando ${total} de ${total} leads`;
}

async function loadLeads() {
  try {
    const response = await fetch("/api/leads");

    if (!response.ok) {
      throw new Error("Erro ao buscar leads.");
    }

    const leads = await response.json();

    renderLeads(leads);
    updateLabels(leads);
  } catch (error) {
    leadsTable.innerHTML = `
      <tr>
        <td colspan="7" class="px-6 py-10 text-center text-sm text-red-400">
          Erro ao carregar leads.
        </td>
      </tr>
    `;

    console.error(error);
  }
}

leadsTable.addEventListener("change", (event) => {
  const select = event.target.closest("[data-lead-status]");

  if (!select) return;

  applyStatusStyle(select);
});

document.addEventListener("DOMContentLoaded", loadLeads);
