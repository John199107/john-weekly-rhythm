export const createWorkspaceTable = `
CREATE TABLE IF NOT EXISTS workspaces (
  owner_id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;
