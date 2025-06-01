# Architecture Summary

The architecture of candlz is designed for performance, modularity, and extensibility. The system is built on a hybrid model with an Electron-based frontend and a FastAPI backend. Key principles include separation of concerns, local-first operation, and security through sandboxed algorithm execution. The frontend provides a responsive UI with components for trading, charting, portfolio management, and algorithm development. The backend exposes endpoints for trading, portfolio management, and algorithm deployment, all secured via authentication. Data flows seamlessly between frontend and backend, supporting real-time trading and algorithmic execution. Game progress is saved locally with optional cloud sync, ensuring data security and cross-device play.

**Important Details:**

- Electron frontend for UI, FastAPI backend for logic
- Real-time data flow and market simulation
- Secure, sandboxed environment for user algorithms
- Local and cloud save options for user data
- Modular design for future expansion
