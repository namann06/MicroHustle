import React, { useState } from 'react';

function Register({ setCurrentUser }) {
  const [form, setForm] = useState({ username: '', password: '', role: 'POSTER' });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    try {
      const res = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Registration failed');
      const user = await res.json();
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setSuccess(true);
      setForm({ username: '', password: '', role: 'POSTER' });
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold">Register</h2>
      {success && <div className="text-green-600">Registration successful! You are now logged in.</div>}
      {error && <div className="text-red-600">{error}</div>}
      <input className="w-full p-2 border rounded" name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
      <input className="w-full p-2 border rounded" name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} required />
      <select className="w-full p-2 border rounded" name="role" value={form.role} onChange={handleChange}>
        <option value="POSTER">Poster</option>
        <option value="HUSTLER">Hustler</option>
      </select>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Register</button>
    </form>
  );
}

export default Register;