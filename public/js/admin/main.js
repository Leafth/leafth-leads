import { leadsTable, exportCsvButton } from "./dom.js";
import {
  getLeads,
  getSummary,
  getPipeline,
  updateLeadStatus,
  deleteLead,
} from "./api.js";
import {
  renderLeads,
  renderLeadsError,
  updateLabels,
  updateSummary,
  updatePipeline,
  applyStatusStyle,
} from "./render.js";
import { convertLeadsToCsv, downloadCsv } from "./csv.js";

async function loadLeads() {
  try {
    const leads = await getLeads();

    renderLeads(leads);
    updateLabels(leads);
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

exportCsvButton.addEventListener("click", exportLeadsCsv);

document.addEventListener("DOMContentLoaded", refreshDashboard);
