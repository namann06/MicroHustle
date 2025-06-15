import React, { useState } from 'react';

function PostTask({ currentUser }) {
  const [form, setForm] = useState({ title: '', description: '', tags: '', budget: '', deadline: '' });
  const [success, setSuccess] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSuccess(false);
    await fetch('http://localhost:8080/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, poster: { id: currentUser.id } })
    });
    setSuccess(true);
    setForm({ title: '', description: '', tags: '', budget: '', deadline: '' });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold">Post a Task</h2>
      {success && <div className="text-green-600">Task posted!</div>}
      <input className="w-full p-2 border rounded" name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
      <textarea className="w-full p-2 border rounded" name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
      <input className="w-full p-2 border rounded" name="tags" placeholder="Tags (comma separated)" value={form.tags} onChange={handleChange} />
      <input className="w-full p-2 border rounded" name="budget" placeholder="Budget (₹)" type="number" value={form.budget} onChange={handleChange} required />
      <input className="w-full p-2 border rounded" name="deadline" placeholder="Deadline (YYYY-MM-DD)" type="date" value={form.deadline} onChange={handleChange} />
      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Post Task</button>
    </form>
  );
}

export default PostTask;