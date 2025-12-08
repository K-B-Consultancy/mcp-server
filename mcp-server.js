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
app.get("/manifest.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json({
    schema_version: "v1",
    name_for_human: "Appwrite MCP Tools",
    name_for_model: "appwrite_mcp",
    description_for_model:
      "Plugin for managing tasks using Appwrite (listTasks, createTask, completeTask).",
    description_for_human:
      "Manage your tasks: list, create, complete — backed by Appwrite.",
    auth: {
      type: "none",
    },
    api: {
      type: "openapi",
      url: `${process.env.URL}/openapi.yaml`,
    },
  });
});

// Serve static OpenAPI spec
app.get("/openapi.yaml", (_, res) => {
  console.log("[OpenAPI] Fetching openapi.yaml");
  const openapiPath = path.join(process.cwd(), "openapi.yaml");
  if (!fs.existsSync(openapiPath)) {
    console.error("[OpenAPI] openapi.yaml not found at:", openapiPath);
    return res.status(404).send("openapi.yaml not found");
  }
  console.log("[OpenAPI] Successfully serving openapi.yaml");
  res.type("yaml").send(fs.readFileSync(openapiPath, "utf8"));
});

// -----------------------------
app.post("/v1/listTasks", async (req, res) => {
  console.log("[listTasks] Request received");
  try {
    console.log(
      "[listTasks] Fetching documents from Appwrite collection:",
      APPWRITE_COLLECTION
    );
    const r = await client.get(
      `/databases/default/collections/${APPWRITE_COLLECTION}/documents`
    );
    const tasks = r.data.documents.map((t) => ({
      id: t.$id,
      title: t.title,
      completed: t.completed,
    }));
    console.log("[listTasks] Successfully retrieved", tasks.length, "tasks");
    res.json({ tasks });
  } catch (e) {
    console.error("[listTasks] Error:", e.message, e.response?.data);
    res.status(500).json({ error: e.message });
  }
});

app.post("/v1/createTask", async (req, res) => {
  console.log("[createTask] Request received with body:", req.body);
  const { title } = req.body;
  if (!title) {
    console.error("[createTask] Error: Missing title in request");
    return res.status(400).json({ error: "Missing title" });
  }

  try {
    console.log("[createTask] Creating task with title:", title);
    await client.post(
      `/databases/default/collections/${APPWRITE_COLLECTION}/documents`,
      {
        documentId: "unique()",
        data: { title, completed: false },
      }
    );
    console.log("[createTask] Task created successfully:", title);
    res.json({ result: "Task created successfully" });
  } catch (e) {
    console.error("[createTask] Error:", e.message, e.response?.data);
    res.status(500).json({ error: e.message });
  }
});

app.post("/v1/completeTask", async (req, res) => {
  console.log("[completeTask] Request received with body:", req.body);
  const { taskId } = req.body;
  if (!taskId) {
    console.error("[completeTask] Error: Missing taskId in request");
    return res.status(400).json({ error: "Missing taskId" });
  }

  try {
    console.log("[completeTask] Marking task as completed:", taskId);
    await client.patch(
      `/databases/default/collections/${APPWRITE_COLLECTION}/documents/${taskId}`,
      {
        data: { completed: true },
      }
    );
    console.log(
      "[completeTask] Task marked as completed successfully:",
      taskId
    );
    res.json({ result: "Task marked as completed" });
  } catch (e) {
    console.error("[completeTask] Error:", e.message, e.response?.data);
    res.status(500).json({ error: e.message });
  }
});

// -----------------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ MCP server running at http://localhost:${PORT}`);
});
