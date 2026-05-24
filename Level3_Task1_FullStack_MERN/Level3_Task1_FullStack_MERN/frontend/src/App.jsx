import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const API = 'http://localhost:5000/api';

// ─── Axios auth helper ─────────────────────────────────────────────────────
const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

// ─── Auth Screen ───────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'signup' ? '/auth/signup' : '/auth/login';
      const payload = mode === 'signup'
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };
      const res = await axios.post(`${API}${endpoint}`, payload);
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>📋 Task Manager</h1>
        <p className="auth-subtitle">MERN Full-Stack Application</p>
        <div className="tabs">
          <button className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => setMode('login')}>Login</button>
          <button className={mode === 'signup' ? 'tab active' : 'tab'} onClick={() => setMode('signup')}>Sign Up</button>
        </div>
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <input placeholder="Full Name" value={form.name} onChange={set('name')} required />
          )}
          <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
          <input type="password" placeholder="Password" value={form.password} onChange={set('password')} required />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Task Item ─────────────────────────────────────────────────────────────
function TaskItem({ task, onToggle, onDelete }) {
  const priorityColors = { low: '#27ae60', medium: '#f39c12', high: '#e74c3c' };
  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <input type="checkbox" checked={task.completed} onChange={() => onToggle(task)} />
      <div className="task-body">
        <span className="task-title">{task.title}</span>
        {task.description && <span className="task-desc">{task.description}</span>}
      </div>
      <span className="priority-badge" style={{ background: priorityColors[task.priority] }}>
        {task.priority}
      </span>
      <button className="btn-icon" onClick={() => onDelete(task._id)}>🗑</button>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────
function Dashboard({ token, user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' });
  const [filter, setFilter] = useState('all'); // all | active | done

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/tasks`, authHeader(token));
      setTasks(res.data);
    } catch {
      onLogout(); // token probably expired
    } finally {
      setLoading(false);
    }
  }, [token, onLogout]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      const res = await axios.post(`${API}/tasks`, form, authHeader(token));
      setTasks((prev) => [res.data, ...prev]);
      setForm({ title: '', description: '', priority: 'medium' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task.');
    }
  };

  const handleToggle = async (task) => {
    try {
      const res = await axios.put(`${API}/tasks/${task._id}`, { completed: !task.completed }, authHeader(token));
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`${API}/tasks/${id}`, authHeader(token));
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch {}
  };

  const filtered = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  });

  const done = tasks.filter((t) => t.completed).length;

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div>
          <h2>Welcome, {user.name} 👋</h2>
          <p>{done}/{tasks.length} tasks completed</p>
        </div>
        <button className="btn-logout" onClick={onLogout}>Logout</button>
      </header>

      <form className="task-form" onSubmit={handleCreate}>
        <input
          placeholder="Task title…"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <button type="submit" className="btn-primary">+ Add Task</button>
      </form>

      <div className="filters">
        {['all', 'active', 'done'].map((f) => (
          <button key={f} className={filter === f ? 'filter active' : 'filter'} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="task-list">
        {loading ? (
          <div className="spinner" />
        ) : filtered.length === 0 ? (
          <p className="empty">No tasks here. Add one above!</p>
        ) : (
          filtered.map((task) => (
            <TaskItem key={task._id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return token && user
    ? <Dashboard token={token} user={user} onLogout={handleLogout} />
    : <AuthScreen onLogin={handleLogin} />;
}
