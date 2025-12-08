import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
app.use(express.json());

// Appwrite config from .env
const {
  APPWRITE_KEY,
  APPWRITE_PROJECT,
  APPWRITE_ENDPOINT,
  APPWRITE_COLLECTION,
  URL, // domain where the plugin will be served from
} = process.env;

const client = axios.create({
  baseURL: `${APPWRITE_ENDPOINT}/v1`,
  headers: {
    "X-Appwrite-Project": APPWRITE_PROJECT,
    "X-Appwrite-Key": APPWRITE_KEY,
    "Content-Type": "application/json",
  },
});

// -----------------------------
// OpenAI-compatible plugin spec
// -----------------------------
app.get("/.well-known/ai-plugin.json", (_, res) => {
  res.json({
    schema_version: "v1",
    name_for_model: "appwrite_mcp",
    name_for_human: "Appwrite Task Manager",
    description_for_model:
      "Plugin to manage tasks using Appwrite (list, create, complete).",
    description_for_human:
      "Interact with your Appwrite tasks: view, add, and complete tasks via chat.",
    auth: { type: "none" },
    api: {
      type: "openapi",
      url: `${URL}/openapi.yaml`,
    },
    logo_url: `${URL}/logo.png`,
    contact_email: "admin@example.com",
    legal_info_url: `${URL}/legal`,
  });
});

// Serve static OpenAPI spec
app.get("/openapi.yaml", (_, res) => {
  const openapiPath = path.join(process.cwd(), "openapi.yaml");
  if (!fs.existsSync(openapiPath)) {
    return res.status(404).send("openapi.yaml not found");
  }
  res.type("yaml").send(fs.readFileSync(openapiPath, "utf8"));
});

// -----------------------------
// Function Endpoints for LobeChat
// -----------------------------

app.post("/v1/listTasks", async (req, res) => {
  try {
    const r = await client.get(
      `/databases/default/collections/${APPWRITE_COLLECTION}/documents`
    );
    const tasks = r.data.documents.map((t) => ({
      id: t.$id,
      title: t.title,
      completed: t.completed,
    }));
    res.json({ tasks });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/v1/createTask", async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Missing title" });

  try {
    await client.post(
      `/databases/default/collections/${APPWRITE_COLLECTION}/documents`,
      {
        documentId: "unique()",
        data: { title, completed: false },
      }
    );
    res.json({ result: "Task created successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/v1/completeTask", async (req, res) => {
  const { taskId } = req.body;
  if (!taskId) return res.status(400).json({ error: "Missing taskId" });

  try {
    await client.patch(
      `/databases/default/collections/${APPWRITE_COLLECTION}/documents/${taskId}`,
      {
        data: { completed: true },
      }
    );
    res.json({ result: "Task marked as completed" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// -----------------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ MCP server running at http://localhost:${PORT}`);
});
