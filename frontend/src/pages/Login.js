import React, { useState } from 'react';

function Login({ setCurrentUser }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const user = await res.json();
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold">Login</h2>
      {error && <div className="text-red-600">{error}</div>}
      <input className="w-full p-2 border rounded" name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
      <input className="w-full p-2 border rounded" name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} required />
      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Login</button>
    </form>
  );
}

export default Login;