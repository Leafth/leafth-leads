import {
  deleteLead,
  getLeads,
  getPipeline,
  getSummary,
  updateLeadStatus
} from "./api.js";
import { convertLeadsToCsv, downloadCsv } from "./csv.js";
import { exportCsvButton, leadsTable, searchInput, statusFilter, systemFilter } from "./dom.js";
import { filterLeads } from "./filters.js";
import {
  applyStatusStyle,
  renderLeads,
  renderLeadsError,
  updateLabels,
  updatePipeline,
  updateSummary,
} from "./render.js";

let allLeads = [];

function getActiveFilters() {
  return {
    search: searchInput.value,
    system: systemFilter.value,
    status: statusFilter.value,
  };
}

function applyFiltersAndRender() {
  const filtered = filterLeads(allLeads, getActiveFilters());

  renderLeads(filtered);
  updateLabels(filtered, allLeads.length);
}

async function loadLeads() {
  try {
    const leads = await getLeads();

    allLeads = leads;
    applyFiltersAndRender();
  } catch (error) {
    renderLeadsError();
    console.error(error);
  }
}

async function loadSummary() {
  try {
    const summary = await getSummary();

    updateSummary(summary);
  } catch (error) {
    console.error(error);
  }
}

async function loadPipeline() {
  try {
    const pipeline = await getPipeline();

    updatePipeline(pipeline);
  } catch (error) {
    console.error(error);
  }
}

async function refreshDashboard() {
  await loadLeads();
  await loadSummary();
  await loadPipeline();
}

function closeActionsMenus() {
  document.querySelectorAll("[data-actions-menu]").forEach((menu) => {
    menu.classList.add("hidden");
  });
}

function toggleActionsMenu(button) {
  const wrapper = button.closest("[data-actions-wrapper]");
  const menu = wrapper?.querySelector("[data-actions-menu]");

  if (!menu) return;

  const isHidden = menu.classList.contains("hidden");

  closeActionsMenus();

  if (isHidden) {
    menu.classList.remove("hidden");
  }
}

async function exportLeadsCsv() {
  try {
    exportCsvButton.disabled = true;
    exportCsvButton.classList.add("opacity-60", "cursor-wait");

    const leads = await getLeads();
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

    const lead = allLeads.find((l) => String(l.id) === String(leadId));
    if (lead) lead.status = newStatus;

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

leadsTable.addEventListener("click", async (event) => {
  const optionsButton = event.target.closest("[data-actions-toggle]");
  const deleteButton = event.target.closest("[data-delete-lead]");

  if (optionsButton) {
    toggleActionsMenu(optionsButton);
    return;
  }

  if (deleteButton) {
    const leadId = deleteButton.dataset.leadId;
    const leadName = deleteButton.dataset.leadName;

    closeActionsMenus();

    const confirmed = confirm(`Deseja deletar o lead "${leadName}"?`);

    if (!confirmed) return;

    deleteButton.disabled = true;
    deleteButton.classList.add("opacity-60", "cursor-wait");

    try {
      await deleteLead(leadId);
      await refreshDashboard();
    } catch (error) {
      alert("Não foi possível deletar o lead.");
      console.error(error);
    } finally {
      deleteButton.disabled = false;
      deleteButton.classList.remove("opacity-60", "cursor-wait");
    }
  }
});

document.addEventListener("click", (event) => {
  const clickedInsideActions = event.target.closest("[data-actions-wrapper]");

  if (!clickedInsideActions) {
    closeActionsMenus();
  }
});

exportCsvButton.addEventListener("click", exportLeadsCsv);

let searchDebounceTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(applyFiltersAndRender, 250);
});

systemFilter.addEventListener("change", applyFiltersAndRender);
statusFilter.addEventListener("change", applyFiltersAndRender);

document.addEventListener("DOMContentLoaded", refreshDashboard);