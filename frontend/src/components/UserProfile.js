import React, { useEffect, useState, useRef } from "react";

export default function UserProfile({ userId, username, onUsernameClick }) {
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [ratings, setRatings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef();

  // Fetch profile (by id for own, or by username for public)
  useEffect(() => {
    setLoading(true);
    setError(null);
    const base = "http://localhost:8080";
    let url = userId
      ? `${base}/api/users/${userId}/profile`
      : `${base}/api/users/public/${encodeURIComponent(username)}`;
    fetch(url)
      .then(async res => {
        if (!res.ok) throw new Error('Profile not found');
        return res.json();
      })
      .then(data => {
        setProfile(data);
        setBio(data.bio || "");
        setProfilePicUrl(data.profilePicUrl || "");
        if (data.role === "HUSTLER") {
          fetch(`${base}/api/users/${data.id}/hustler-completed-tasks`)            .then(res => res.json())
            .then(setTasks);
          fetch(`${base}/api/users/${data.id}/hustler-ratings`)            .then(res => res.json())
            .then(setRatings);
        } else if (data.role === "POSTER") {
          fetch(`${base}/api/users/${data.id}/poster-tasks`)            .then(res => res.json())
            .then(setTasks);
        }
      })
      .catch(err => {
        setError(err.message);
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, [userId, username]);

  // Handle profile pic upload
  const handlePicUpload = async (e) => {
    setUploading(true);
    setUploadError(null);
    try {
      const file = e.target.files[0];
      if (!file) throw new Error('No file selected');
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Profile picture upload failed');
      let url = await res.text();
      if (url.startsWith('"') && url.endsWith('"')) url = url.substring(1, url.length - 1);
      setProfilePicUrl(url);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Save profile changes
  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`http://localhost:8080/api/users/${profile.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, profilePicUrl })
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setEditMode(false);
      setProfile(p => ({ ...p, bio, profilePicUrl }));
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) return <div className="p-4">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded shadow p-6 mt-6">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={profilePicUrl ? `http://localhost:8080/${profilePicUrl.replace(/^\/uploads\//, '')}` : "https://ui-avatars.com/api/?name=" + profile.username}
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover border"
        />
        <div>
          <h2 className="text-2xl font-bold mb-1">{profile.username} <span className="text-sm text-gray-500">({profile.role})</span></h2>
          {editMode ? (
            <>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePicUpload}
                className="block mb-1"
              />
              {uploading ? (
                <span>Uploading...</span>
              ) : (
                uploadError && <span className="text-red-500 ml-2">{uploadError}</span>
              )}
              <textarea
                className="border rounded px-2 py-1 w-full mb-2"
                rows={2}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Write something about yourself..."
              />
              <button
                className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              {saveError && <span className="text-red-500 ml-2">{saveError}</span>}
              <button className="bg-gray-400 text-white px-3 py-1 rounded" onClick={() => setEditMode(false)}>Cancel</button>
            </>
          ) : (
            <>
              <div className="text-gray-700 mb-1">{profile.bio || <span className="italic text-gray-400">No bio yet.</span>}</div>
              {userId && (
                <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm" onClick={() => setEditMode(true)}>Edit Profile</button>
              )}
            </>
          )}
        </div>
      </div>
      {profile.role === "HUSTLER" && ratings && (
        <div className="mb-4">
          <div className="font-semibold">Average Rating: <span className="text-yellow-500">{ratings.average.toFixed(2)}</span> / 5</div>
          <div className="mt-1 text-xs text-gray-500">({ratings.ratings.length} reviews)</div>
        </div>
      )}
      <div className="mb-4">
        <div className="font-semibold mb-1">
          {profile.role === "HUSTLER" ? "Completed Tasks" : "Posted Tasks"}
        </div>
        {tasks.length === 0 ? (
          <div className="text-gray-400">No tasks found.</div>
        ) : (
          <ul className="list-disc ml-5">
            {tasks.map(task => (
              <li key={task.id} className="mb-1">
                <span className="font-semibold">{task.title}</span>
                <span className="ml-2 text-xs text-gray-500">({task.status})</span>
                {task.poster && (
                  <span className="ml-2 text-blue-600 underline cursor-pointer" onClick={() => {
                    if(onUsernameClick) onUsernameClick(task.poster.username);
                    else window.dispatchEvent(new CustomEvent('viewPublicProfile', { detail: { username: task.poster.username } }));
                  }}>by {task.poster.username}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {profile.role === "HUSTLER" && ratings && ratings.ratings.length > 0 && (
        <div className="mb-4">
          <div className="font-semibold mb-1">Ratings & Reviews</div>
          <ul className="border rounded divide-y">
            {ratings.ratings.map(r => (
              <li key={r.id} className="p-2">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                {r.comment && <div className="text-sm mt-1">{r.comment}</div>}
                <div className="text-xs text-gray-400 mt-1">
                  From: <span className="text-blue-600 underline cursor-pointer" onClick={() => {
                    if(onUsernameClick) onUsernameClick(r.poster.username);
                    else window.dispatchEvent(new CustomEvent('viewPublicProfile', { detail: { username: r.poster.username } }));
                  }}>{r.poster.username}</span> on task: <span className="text-blue-600 underline cursor-pointer" onClick={() => {
                    if(onUsernameClick && r.task.poster) onUsernameClick(r.task.poster.username);
                  }}>{r.task.title}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
