# 🛍️ Typesense Product Search App

This is a full-stack product search app built with **React** and **Typesense**.

It features:

- Full-text product search
- Faceted filters (by tags and collections)
- Pagination
- Instant results with debounce
- Live-updating filters per query

---

## 🚀 Getting Started

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) (for running Typesense)

---

## 🧠 Project Structure

```bash
.
├── backend/
│   ├── src/
│   │   ├── index.js           # Express server with /search endpoint
│   │   ├── catalog.fixed.jsonl # Product data for indexing
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   │   └── App.tsx            # Main React App
│   ├── public/
│   ├── package.json
│   └── ...
├── .gitignore
├── README.md
└── ...

⚙️ Setup Instructions
1. Clone the repo:
git clone https://github.com/moshe19909090/typesense-search-app.git
cd typesense-search-app

2. Start Typesense using Docker:
cd backend
docker run -p 8108:8108 -v$(pwd)/typesense-data:/data typesense/typesense:0.25.1 \
  --data-dir /data --api-key=xyz --listen-port 8108 --enable-cors

3.Install backend dependencies:
npm install

4. Run the index script to upload product data:
npm run index

You should see logs confirming that the products were indexed successfully.

5. Run the backend
npm run dev


----

💻 Running the Frontend
Open a new terminal.

1. Navigate to the frontend folder:
cd frontend

2. Install frontend dependencies:
npm install

3. Run the React app:
npm start

The app will run on http://localhost:3000

----

🔍 Search Behavior
Typing in the search box triggers debounce (200ms) for live results
Tags and Collections facets update dynamically based on the current query
You can click chips to filter, and clear filters to reset

----

📦 Dependencies
Frontend:

React

Axios

Backend:

Express

Typesense

dotenv (optional)


```
