export async function getLeads() {
  const response = await fetch("/api/leads");

  if (!response.ok) {
    throw new Error("Erro ao buscar leads.");
  }

  return response.json();
}

export async function getSummary() {
  const response = await fetch("/api/leads/summary");

  if (!response.ok) {
    throw new Error("Erro ao buscar resumo dos leads.");
  }

  return response.json();
}

export async function getPipeline() {
  const response = await fetch("/api/leads/pipeline");

  if (!response.ok) {
    throw new Error("Erro ao buscar pipeline dos leads.");
  }

  return response.json();
}

export async function updateLeadStatus(leadId, status) {
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

export async function getLeadById(leadId) {
  const response = await fetch(`/api/leads/${leadId}`);

  if (!response.ok) {
    throw new Error("Erro ao buscar detalhes do lead.");
  }

  return response.json();
}

export async function deleteLead(leadId) {
  const response = await fetch(`/api/leads/${leadId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Erro ao deletar lead.");
  }
}
