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

const totalLeadsCard = document.querySelector("[data-total-leads]");
const totalAriaCard = document.querySelector("[data-total-aria]");
const totalCongaCard = document.querySelector("[data-total-conga]");
const convertidosCard = document.querySelector("[data-convertidos]");

const exportCsvButton = document.querySelector("[data-export-csv]");

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
                data-current-status"${lead.status}"
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

function updateSummary(summary) {
  totalLeadsCard.textContent = summary.totalLeads || 0;
  totalAriaCard.textContent = summary.totalAria += summary.totalAmbos || 0;
  totalCongaCard.textContent = summary.totalConga += summary.totalAmbos || 0;
  convertidosCard.textContent = summary.convertidos || 0;
}

async function loadSummary() {
  try {
    const response = await fetch("/api/leads/summary");

    if (!response.ok) {
      throw new Error("Erro ao buscar resumo dos leads.");
    }

    const summary = await response.json();

    updateSummary(summary);
  } catch (error) {
    console.error(error);
  }
}

function updatePipeline(pipeline) {
  Object.entries(pipeline).forEach(([status, total]) => {
    const pipelineElement = document.querySelector(
      `[data-pipeline="${status}"]`,
    );

    if (pipelineElement) {
      pipelineElement.textContent = total || 0;
    }
  });
}

async function loadPipeline() {
  try {
    const response = await fetch("/api/leads/pipeline");

    if (!response.ok) {
      throw new Error("Erro ao buscar pipeline dos leads.");
    }

    const pipeline = await response.json();

    updatePipeline(pipeline);
  } catch (error) {
    console.error(error);
  }
}

async function updateLeadStatus(leadId, status) {
  const response = await fetch(`/api/leads/${leadId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar status do lead.");
  }

  return response.json();
}

function escapeCsvValue(value) {
  if (value === null || value === undefined) return "";

  const stringValue = String(value).replace(/"/g, '""');

  return `"${stringValue}"`;
}

function convertLeadsToCsv(leads) {
  const headers = [
    "Nome",
    "E-mail",
    "Telefone",
    "Cidade",
    "Sistema",
    "Status",
    "Data",
  ];

  const rows = leads.map((lead) => [
    lead.name,
    lead.email,
    formatPhone(lead.phone),
    lead.city || "",
    productLabels[lead.product] || lead.product,
    statusLabels[lead.status] || lead.status,
    formatDate(lead.created_at),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(";"))
    .join("\n");

  return csvContent;
}

function downloadCsv(csvContent) {
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

async function exportLeadsCsv() {
  try {
    exportCsvButton.disabled = true;
    exportCsvButton.classList.add("opacity-60", "cursor-wait");

    const response = await fetch("/api/leads");

    if (!response.ok) {
      throw new Error("Erro ao buscar leads para exportação.");
    }

    const leads = await response.json();
    const csvContent = convertLeadsToCsv(leads);

    downloadCsv(csvContent);
  } catch (error) {
    alert("Não foi possível exportar os leads.");

    console.error(error);
  } finally {
    exportCsvButton.disabled = false;
    exportCsvButton.classList.remove("opacity-60", "cursor-wait");
  }
}

leadsTable.addEventListener("change", async (event) => {
  const select = event.target.closest("[data-lead-status]");

  if (!select) return;

  const leadId = select.dataset.leadId;
  const previousStatus = select.dataset.currentStatus;
  const newStatus = select.value;

  applyStatusStyle(select);

  select.disabled = true;
  select.classList.add("opacity-60", "cursor-wait");

  try {
    await updateLeadStatus(leadId, newStatus);

    select.dataset.currentStatus = newStatus;

    await loadSummary();
    await loadPipeline();
  } catch (error) {
    select.value = previousStatus;
    applyStatusStyle(select);

    alert("Não foi possível atualizar o status do lead.");

    console.error(error);
  } finally {
    select.disabled = false;
    select.classList.remove("opacity-60", "cursor-wait");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  loadLeads();
  loadSummary();
  loadPipeline();
});

exportCsvButton.addEventListener("click", exportLeadsCsv);
