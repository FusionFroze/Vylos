Vylos 🎙️🌐

An Accessibility-First, Voice-Controlled Web Navigator.

"Technology is most powerful when it empowers everyone."

Vylos (pronounced Vye-los) is a specialized web browser designed specifically for users with severe motor impairments (ALS, Paralysis, Spinal Cord Injuries, Arthritis) who find using a traditional mouse and keyboard difficult or impossible.

Our Mission

This project was built with a single goal: Digital Independence.

For millions of people, the internet is a walled garden because standard input devices are physical barriers. Vylos aims to tear down those walls. It is, and always will be, a free, open-source, and privacy-focused tool dedicated to the well-being of the differently-abled community.

We believe access to information is a fundamental human right, not a privilege reserved for those with fine motor control.

🎯 Project Status: Alpha v1.0

Note to Contributors: This was created as a final year engineering project. The core navigation and proxy features are stable, but the AI integration is currently in Experimental Mode. We are looking for contributors to help stabilize the LLM integration!

🚀 Key Features

✅ Stable (Works Great)

Grid Overlay: A 6x6 coordinate system to click any element on the screen without a mouse.

Smart Proxy Engine: Browses external sites (Wikipedia, BBC) securely within the app by rewriting headers and links.

Voice Navigation: Instant scrolling ("Scroll down"), navigation ("Go home"), and typing ("Start typing") using a low-latency Regex engine.

Local-First: Data is stored locally (SQLite), ensuring user privacy and offline capability.

🧪 Experimental (Needs Love)

Notepad: Create, edit, and delete notes entirely via voice (works but buggy).

AI Command Interpretation: We have an integration with Google Gemini (ai.js) to handle complex natural language, but we currently default to a Regex Fallback for speed and stability.

AI Summarization: Feature exists to summarize long articles using LLMs, but requires a stable API key and error handling improvements.

🛠️ Tech Stack

Frontend: React.js, Tailwind CSS, Web Speech API.

Backend: Node.js, Express.js, Cheerio (Proxy Engine).

Database: SQLite (via Prisma ORM).

AI Integration: Google Gemini SDK.

⚡ Getting Started

Prerequisites

Node.js (v16 or higher)

A Google Gemini API Key (Optional - for enabling experimental features)

Installation

Clone the repo

git clone [https://github.com/FusionFroze/vylos.git](https://github.com/FusionFroze/vylos.git)
cd vylos

Setup Backend

cd backend
npm install

# Create a .env file and add:

# GEMINI_API_KEY="your_key_here"

# JWT_SECRET="random_secret"

npx prisma generate
npx prisma db push

Setup Frontend

cd ../frontend
npm install

Run Development Mode
Open two terminals:

Terminal 1 (Backend): cd backend && npm start

Terminal 2 (Frontend): cd frontend && npm run dev

The app will open at http://localhost:5173.

🤝 Roadmap & Contributing

We specifically need help with:

AI Stability: Improving src/routes/ai.js to handle API timeouts gracefully so we can switch from Regex back to full AI.

Proxy Improvements: Better handling of Single Page Applications (SPAs) like Gmail within the proxy.

UI/UX: High-contrast themes for better visibility.

See CONTRIBUTING.md for details on how to submit a Pull Request!

Building from Source (Creating the .exe)

If you want to create your own installer:

Build the Frontend:

cd frontend
npm run build

Move the Build:
Copy the dist folder from frontend/ and paste it into backend/.
(You should see backend/dist/index.html)

Package the App:

cd ../backend
npm run dist

📄 License

Distributed under the MIT License. See LICENSE for more information.
