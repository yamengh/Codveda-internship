# Level 2 – Task 1: Frontend with React

## Overview
A React frontend application that connects to the REST API built in Level 1. Demonstrates component-based development, state management with hooks, API calls with Axios, and loading states.

## Features
- Functional components with React Hooks (useState, useEffect)
- Full CRUD operations (Create, Read, Update, Delete) via API calls
- Loading spinner and error handling
- Reusable components (UserCard, UserForm, Spinner)
- Responsive CSS layout

## Setup & Run

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

The app runs at `http://localhost:3000`.

> Make sure your REST API backend (Level 1 Task 2) is running on `http://localhost:5000` before starting this app.

## Project Structure

```
src/
├── App.jsx        # Main component with state management and API calls
├── App.css        # Styling and responsive layout
└── index.js       # Entry point
```

## Key Concepts Demonstrated
- **Functional components** – all components use function syntax
- **useState** – manages users list, loading, error, and edit state
- **useEffect** – fetches users from the API when the component mounts
- **Axios** – handles GET, POST, PUT, DELETE HTTP requests
- **Conditional rendering** – shows spinner, error, empty state, or card list
- **Props** – data passed down to UserCard and UserForm components
