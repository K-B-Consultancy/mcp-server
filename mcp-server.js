// mcp-server.js
import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// Configuración Appwrite
const API_KEY = process.env.APPWRITE_KEY;
const PROJECT_ID = process.env.APPWRITE_PROJECT;
const ENDPOINT = process.env.APPWRITE_ENDPOINT;
const COLLECTION_ID = process.env.APPWRITE_COLLECTION;

const client = axios.create({
  baseURL: `${ENDPOINT}/v1`,
  headers: {
    "X-Appwrite-Project": PROJECT_ID,
    "X-Appwrite-Key": API_KEY,
    "Content-Type": "application/json",
  },
});

// MCP: tool list
app.get("/.well-known/mcp/tool-manifest.json", (_, res) => {
  res.json({
    tools: [
      {
        name: "listTasks",
        description: "Lista todas las tareas pendientes",
        parameters: {},
        response: { type: "object", properties: { tasks: { type: "array" } } },
      },
      {
        name: "createTask",
        description: "Crea una nueva tarea con título",
        parameters: { title: { type: "string" } },
        response: { type: "string" },
      },
      {
        name: "completeTask",
        description: "Marca una tarea como completada",
        parameters: { taskId: { type: "string" } },
        response: { type: "string" },
      },
    ],
  });
});

// MCP: ejecutar herramienta
app.post("/mcp/tool-call", async (req, res) => {
  const { tool_name, parameters } = req.body;

  try {
    if (tool_name === "listTasks") {
      const r = await client.get(
        `/databases/default/collections/${COLLECTION_ID}/documents`
      );
      const tasks = r.data.documents.map((t) => ({
        id: t.$id,
        title: t.title,
        completed: t.completed,
      }));
      return res.json({ tasks });
    }

    if (tool_name === "createTask") {
      const { title } = parameters;
      await client.post(
        `/databases/default/collections/${COLLECTION_ID}/documents`,
        {
          documentId: "unique()",
          data: { title, completed: false },
        }
      );
      return res.json({ result: "Tarea creada correctamente" });
    }

    if (tool_name === "completeTask") {
      const { taskId } = parameters;
      await client.patch(
        `/databases/default/collections/${COLLECTION_ID}/documents/${taskId}`,
        {
          data: { completed: true },
        }
      );
      return res.json({ result: "Tarea marcada como completada" });
    }

    res.status(400).json({ error: "Tool no reconocida" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});
