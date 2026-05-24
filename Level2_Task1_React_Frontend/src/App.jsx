import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// API base URL — update this to match your backend
const API_URL = 'http://localhost:5000/api/users';

// ─── Reusable UI Components ────────────────────────────────────────────────

function Spinner() {
  return <div className="spinner" aria-label="Loading..." />;
}

function UserCard({ user, onDelete, onEdit }) {
  return (
    <div className="card">
      <div className="card-info">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
      </div>
      <div className="card-actions">
        <button className="btn btn-edit" onClick={() => onEdit(user)}>Edit</button>
        <button className="btn btn-delete" onClick={() => onDelete(user._id)}>Delete</button>
      </div>
    </div>
  );
}

function UserForm({ initial, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [email, setEmail] = useState(initial?.email || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSubmit({ name, email });
    setName('');
    setEmail('');
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <h2>{initial ? 'Edit User' : 'Add New User'}</h2>
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {initial ? 'Update' : 'Add User'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  // Fetch all users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(API_URL);
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users. Make sure your backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Create a new user
  const handleCreate = async ({ name, email }) => {
    try {
      const res = await axios.post(API_URL, { name, email });
      setUsers((prev) => [...prev, res.data]);
    } catch (err) {
      setError('Failed to create user.');
    }
  };

  // Update an existing user
  const handleUpdate = async ({ name, email }) => {
    try {
      const res = await axios.put(`${API_URL}/${editingUser._id}`, { name, email });
      setUsers((prev) =>
        prev.map((u) => (u._id === editingUser._id ? res.data : u))
      );
      setEditingUser(null);
    } catch (err) {
      setError('Failed to update user.');
    }
  };

  // Delete a user
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setError('Failed to delete user.');
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>User Manager</h1>
        <p>Level 2 – Task 1: Frontend with React</p>
      </header>

      <main className="main">
        <section className="form-section">
          {editingUser ? (
            <UserForm
              initial={editingUser}
              onSubmit={handleUpdate}
              onCancel={() => setEditingUser(null)}
            />
          ) : (
            <UserForm onSubmit={handleCreate} />
          )}
        </section>

        <section className="list-section">
          <div className="list-header">
            <h2>Users ({users.length})</h2>
            <button className="btn btn-secondary" onClick={fetchUsers}>
              Refresh
            </button>
          </div>

          {error && <p className="error-msg">{error}</p>}

          {loading ? (
            <Spinner />
          ) : users.length === 0 ? (
            <p className="empty-msg">No users found. Add one above!</p>
          ) : (
            <div className="card-list">
              {users.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  onDelete={handleDelete}
                  onEdit={setEditingUser}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
