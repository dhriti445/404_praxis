import { industryPlaybooks } from "../data/industryPlaybooks.js";

export function listPlaybooks(req, res) {
  return res.json({ playbooks: industryPlaybooks });
}

export function getPlaybookById(req, res) {
  const id = String(req.params.id || "").toLowerCase();
  const playbook = industryPlaybooks.find((item) => item.id === id);

  if (!playbook) {
    return res.status(404).json({ error: "Playbook not found" });
  }

  return res.json({ playbook });
}
