export function filterLeads(leads, { search, system, status }) {
  const term = (search || "").trim().toLowerCase();

  return leads.filter((lead) => {
    const matchesSearch =
      !term ||
      lead.name?.toLowerCase().includes(term) ||
      lead.email?.toLowerCase().includes(term) ||
      lead.city?.toLowerCase().includes(term);

    const matchesSystem = !system || lead.product === system;
    const matchesStatus = !status || lead.status === status;

    return matchesSearch && matchesSystem && matchesStatus;
  });
}