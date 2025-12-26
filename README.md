# Appwrite MCP Server

An MCP (Model Context Protocol) server that provides a task management API using Appwrite as the backend. This server is compatible with OpenAI plugin specifications and provides a simple yet powerful interface for managing tasks.

## Author

**Tom**

## Features

- 🚀 **OpenAI Plugin Compatible**: Follows the OpenAI plugin specification for seamless integration
- 📝 **Task Management**: Create, list, and complete tasks
- 🔌 **Appwrite Integration**: Uses Appwrite as a scalable backend database
- 🌐 **RESTful API**: Clean and simple API endpoints
- 📋 **OpenAPI Documentation**: Includes OpenAPI 3.0 specification
- ⚡ **Express-based**: Built on Express 5.x for high performance

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v16 or higher recommended)
- **pnpm** (or npm/yarn)
- **Appwrite instance** (self-hosted or cloud)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/K-B-Consultancy/mcp-server.git
   cd mcp-server
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` with your Appwrite credentials:
   ```env
   APPWRITE_KEY=your-secret-api-key
   APPWRITE_PROJECT=project-id
   APPWRITE_ENDPOINT=https://appwrite.yourdomain.com
   APPWRITE_DATABASE_ID=123456
   APPWRITE_COLLECTION_ID=123456
   URL=https://yourdomain.com
   ```

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `APPWRITE_KEY` | Your Appwrite API key with database permissions |
| `APPWRITE_PROJECT` | Appwrite project ID |
| `APPWRITE_ENDPOINT` | Appwrite server endpoint URL |
| `APPWRITE_DATABASE_ID` | Appwrite database ID for storing tasks |
| `APPWRITE_COLLECTION_ID` | Appwrite collection ID for task documents |
| `URL` | The public URL where this server will be hosted |
| `PORT` | (Optional) Server port, defaults to 3001 |

### Appwrite Setup

1. Create a new project in your Appwrite instance
2. Create a database
3. Create a collection with the following attributes:
   - `title` (string, required)
   - `completed` (boolean, default: false)
4. Generate an API key with appropriate permissions
5. Update your `.env` file with the credentials

## Usage

### Starting the Server

```bash
pnpm start
```

The server will start on `http://localhost:3001` (or the PORT specified in your environment).

### API Endpoints

#### 1. Get Plugin Manifest
```http
GET /manifest.json
```
Returns the OpenAI-compatible plugin manifest.

#### 2. Get OpenAPI Specification
```http
GET /openapi.yaml
```
Returns the OpenAPI 3.0 specification for the API.

#### 3. List Tasks
```http
POST /v1/listTasks
```
**Response:**
```json
{
  "tasks": [
    {
      "id": "task-id",
      "title": "Task title",
      "completed": false
    }
  ]
}
```

#### 4. Create Task
```http
POST /v1/createTask
Content-Type: application/json

{
  "title": "New task title"
}
```
**Response:**
```json
{
  "result": "Task created successfully",
  "taskId": "generated-task-id"
}
```

#### 5. Complete Task
```http
POST /v1/completeTask
Content-Type: application/json

{
  "taskId": "task-id-to-complete"
}
```
**Response:**
```json
{
  "result": "Task marked as completed"
}
```

## Project Structure

```
mcp-server/
├── mcp-server.js      # Main server file with Express app and API routes
├── openapi.yaml       # OpenAPI 3.0 specification
├── package.json       # Project dependencies and scripts
├── .env.example       # Example environment configuration
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## Technology Stack

- **Express 5.2.1**: Web framework
- **Axios 1.13.2**: HTTP client for Appwrite API calls
- **dotenv 17.2.3**: Environment variable management
- **Appwrite**: Backend as a Service (BaaS) for data storage

## Development

The server includes extensive logging for debugging:
- All API requests are logged with `[operationName]` prefixes
- Successful operations and errors are clearly indicated
- Appwrite API responses are logged for troubleshooting

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is part of K-B Consultancy.

## Support

For issues, questions, or contributions, please open an issue in the GitHub repository.

---

**Made with ❤️ by Tom**
