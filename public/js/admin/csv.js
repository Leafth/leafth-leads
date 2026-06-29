import { productLabels, statusLabels } from "./constants.js";
import { formatDate, formatPhone } from "./formatters.js";

function escapeCsvValue(value) {
  if (value === null || value === undefined) return "";

  const stringValue = String(value).replace(/"/g, '""');

  return `"${stringValue}"`;
}

export function convertLeadsToCsv(leads) {
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

  return [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(";"))
    .join("\n");
}

export function downloadCsv(csvContent) {
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
