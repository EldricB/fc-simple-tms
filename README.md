# Transaction Management System

A simple transaction management system built with React, Node.js and Express. It shows a table of transactions and their details. New transactions can be added through a form; they are validated first, then stored in a CSV file (no database needed).

> **AI disclosure:** AI was used responsibly to review and validate edge cases. I adjusted and reviewed the code myself. The design is not influenced by AI.

## Tech Stack
| Tool | Description | Use Case |
| --- | --- | --- |
| [React](https://react.dev/) | UI library. | Builds the page using components. |
| [Vite](https://vite.dev/) | Frontend build tool and dev server. | Runs the React app (`npm run dev`). |
| [Node.js](https://nodejs.org/) | Runs JavaScript outside the browser .| Runs the backend and the frontend tooling. |
| [Express](https://expressjs.com/) | Web server framework for Node.js. | Backend REST API. |

## Prerequisites
The project was created on macOS. You need:
- **macOS** with the **Terminal** (`Cmd + Space`, type "Terminal")
- **Apple Command Line Tools**: a prequisite for homebrew.
- **Homebrew**: a package manager that installs the tools.
- **Git**: to clone the project.
- **Node.js 20.19 or newer** (includes **npm**, which downloads libraries).

Every command in this guide is typed into the `Terminal` moving forward.

## Installation

### 1. Apple Command Line Tools
```
xcode-select --install
```

### 2. [Homebrew](https://brew.sh/)
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

When prompted, enter your macOS passcode and press Enter. Then add Homebrew to your path:

```
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

To verify, type: `brew --version`. Expected output is: `Homebrew 4.x.x`

If `brew` is not found, open the profile with `nano ~/.zprofile`, make sure it contains `eval "$(/opt/homebrew/bin/brew shellenv)"`, save (`Ctrl + O`, Enter, `Ctrl + X`) and reopen the Terminal. On Intel Macs, replace `/opt/homebrew` with `/usr/local`.

### 3. Git and Node.js
```
brew install git node
```

Then verify (Node should be `v20.19` or higher):
```
git --version
node --version
npm --version
```

### 4. Clone the repository
Enter the following to clone the project:
```
git clone <repository-url>
cd <project-folder>
```

### 5. Installing the libraries
`npm install` reads each folder's `package.json` and installs everything listed there, so no individual library commands are needed.
```
cd frontend && npm install && npm install lucide-react
cd backend && npm install express cors csv-parser
```

## Configuration
Everything works with the default settings. However, these optional settings do exist:

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | Port the API listens on |
| `CSV_PATH` | `backend/data/transactions.csv` | CSV file used for storage |
| `VITE_API_URL` | `http://localhost:3000` | Backend address (set in `frontend/.env`) |

Example: `PORT=4000 npm start`. If you change the port, set `VITE_API_URL=http://localhost:4000` in `frontend/.env` and restart the frontend.

If the CSV file is missing or empty, it is created automatically (with its header) when the first transaction is added.

## Running the Application

Use two Terminal windows or tabs at the same time.

**Terminal A: Backend**
```
cd backend && npm start
```

Expected: `Server is running on http://localhost:3000`

**Terminal B: Frontend**
```
cd frontend && npm run dev
```

Open the address it prints (usually `http://localhost:5173`). Press `Ctrl + C` in each Terminal to stop.

**Using the app:** the table is paginated (10, 25 or 50 rows). Click **Add**, fill in all fields and click **Save**. The server assigns a random status (`Pending`, `Settled` or `Failed`) to the new transaction.

## API
Base URL: `http://localhost:3000`. All responses are JSON with a `success` field.

### GET /transactions
Returns all transactions (an empty list if the CSV file does not exist yet).
```
curl http://localhost:3000/transactions
```

Response `200`:
```json
{
  "success": true,
  "data": [
    {
      "transactionDate": "2025-03-01",
      "accountNumber": "7289-3445-1121",
      "accountHolderName": "Maria Johnson",
      "amount": 150,
      "status": "Settled"
    }
  ]
}
```

### POST /transactions
Validates and saves a new transaction.
```
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "transactionDate": "2025-03-11",
    "accountNumber": "1111-2222-3333",
    "accountHolderName": "John O'\''Smith",
    "amount": 42.5
  }'
```

Validation guide:
| Field | Rule |
| --- | --- |
| `transactionDate` | A real date as `YYYY-MM-DD` (`2025-02-30` is rejected) |
| `accountNumber` | A string of 12 digits, with or without dashes. Stored as `1234-5678-9012` |
| `accountHolderName` | Required, max 100 characters. Letters, spaces, apostrophes, periods and hyphens only |
| `amount` | Greater than 0, max 2 decimal places, max `999999999.99`. |

A `status` sent by the client is ignored.

Response `201`:
```json
{
  "success": true,
  "data": {
    "transactionDate": "2025-03-11",
    "accountNumber": "1111-2222-3333",
    "accountHolderName": "John O'Smith",
    "amount": 42.5,
    "status": "Pending"
  }
}
```

Response `400` (validation failed):
```json
{
  "success": false,
  "errors": ["Amount must be greater than 0, with at most 2 decimal places (max 999,999,999.99)"]
}
```

### Other errors
| Status | Meaning |
| --- | --- |
| `400` | Request body is not valid JSON |
| `404` | Route not found |
| `413` | Request body larger than 10 KB |
| `500` | Server or file error |

## Testing
```
cd backend && npm test
```

Tests use a temporary CSV file, so the data in `backend/data` is never changed. They cover:
- Empty list when the CSV file does not exist, and automatic file creation with a header.
- Valid and invalid input. (dates, account numbers, names, amounts)
- 10 simultaneous POST requests producing intact rows.
- A CSV file missing its final newline.
- Account number formatting and leading zeros.
- Malformed JSON (400), oversized body (413) and unknown routes (404).
- A client-supplied `status` being ignored.

**Manual check:** start both servers, open the app, add a transaction and confirm it appears in the table and at the bottom of `backend/data/transactions.csv`. Stop the backend and refresh the page to see the `Cannot reach the server` message.

## Troubleshooting
| Problem | Fix |
| --- | --- |
| `brew` or `node` not found | Redo the path step above, then reopen the Terminal. |
| `EADDRINUSE ... :3000` | Port is taken. Use `PORT=4000 npm start` and update `VITE_API_URL`. |
| "Cannot reach the server" in the app | Backend is not running, or `VITE_API_URL` is wrong. |
| `.env` change has no effect | Stop and restart `npm run dev`. |
| Start with fresh data | Stop the backend and delete `backend/data/transactions.csv`. |

## Project Structure

```
backend/
  server.js                             Express app and entry point.
  controller/transactionController.js   GET and POST handlers.
  lib/csvStore.js                       Reads and appends CSV rows.
  lib/transactionValidator.js           Input validation and formatting.
  data/transactions.csv                 Stored transactions.
  test/                                 Automated tests.
frontend/
  src/api.js                            Calls the backend.
  src/App.jsx                           Page layout and data loading.
  src/components/                       TransactionTable, Pagination, AddTransactionModal.
```
