# Data Flow

This page describes how data moves through the candlz system.

## Trading Flow

The trading flow describes how a user's order moves through the system:

1. User places an order in the frontend (Electron UI)
2. The frontend sends the order to the FastAPI backend
3. The backend validates and processes the order
4. The market simulation engine updates prices and order books
5. The backend updates the user's portfolio and returns results to the frontend
6. The frontend displays updated portfolio and trade status

```mermaid
sequenceDiagram
    participant User
    participant UI as Frontend
    participant API as Backend API
    participant Market as Market Engine
    participant DB as Database
    User->>UI: Place order
    UI->>API: Submit order request
    API->>Market: Validate order
    Market->>API: Order validation result
    alt Order is valid
        API->>Market: Execute order
        Market->>API: Execution results
        API->>DB: Update portfolio
        API->>UI: Confirmation
        UI->>User: Order succeeded
    else Order is invalid
        API->>UI: Error details
        UI->>User: Order failed
    end
```

## Algorithm Execution Flow

How player-created algorithms interact with the system:

1. User writes and deploys an algorithm in the Algorithm Lab
2. The backend runs the algorithm in a sandboxed environment
3. On each market update, the algorithm receives new data
4. The algorithm can place orders, which are processed like manual trades
5. Results and logs are sent back to the frontend for review

```mermaid
sequenceDiagram
    participant User
    participant Editor as Algorithm Editor
    participant Runner as Algorithm Runner
    participant Market as Market Engine
    participant Portfolio as Portfolio Manager
    User->>Editor: Write algorithm
    Editor->>Runner: Deploy algorithm
    loop Every market update
        Market->>Runner: Price & market data
        Runner->>Runner: Execute algorithm logic
        alt Algorithm generates order
            Runner->>Market: Submit order
            Market->>Portfolio: Update positions
            Portfolio->>Runner: Position update
        end
    end
    User->>Runner: Monitor performance
```
