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
    <section className="profile_container">
      {/* Left Profile Card */}
      <div className="profile_card relative flex flex-col items-center justify-center bg-[#10172a] border-[5px] border-black rounded-[30px] shadow-2xl w-[300px] min-w-[260px] max-w-xs pb-8 pt-20 px-5 mx-auto">
        {/* Name badge */}
        <div className="profile_title absolute -top-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-white border-[5px] border-black rounded-[20px] shadow-lg flex items-center justify-center w-11/12">
          <span className="font-black text-lg uppercase text-center tracking-wide text-black">{profile.name || profile.username}</span>
        </div>
        {/* Profile image */}
        <img
          src={profilePicUrl ? `http://localhost:8080/${profilePicUrl.replace(/^\/uploads\//, '')}` : "https://ui-avatars.com/api/?name=" + profile.username}
          alt="Profile"
          className="profile_image w-40 h-40 rounded-full object-cover border-[3px] border-black mt-8 shadow-md bg-white"
        />
        {/* Handle */}
        <p className="font-extrabold text-2xl text-white mt-6 mb-2 text-center">@{profile.username}</p>
        {/* Bio and edit controls */}
        <div className="w-full flex flex-col items-center">
        {editMode ? (
          <>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handlePicUpload}
              className="mt-2"
              disabled={uploading}
            />
            {uploadError && <div className="text-red-500 text-xs mt-1">{uploadError}</div>}
            <textarea
              className="border rounded px-2 py-1 w-full mb-2 mt-2"
              rows={2}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Write something about yourself..."
            />
            <div className="flex gap-2 w-full justify-center">
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="bg-gray-400 text-white px-3 py-1 rounded" onClick={() => setEditMode(false)}>Cancel</button>
            </div>
            {saveError && <div className="text-red-500 text-xs mt-1">{saveError}</div>}
          </>
        ) : (
          <>
            <div className="text-white text-center mb-2 min-h-[32px]">{profile.bio || <span className="italic text-gray-300">No bio yet.</span>}</div>
            {userId && (
              <button className="bg-white text-black font-semibold px-3 py-1 rounded text-sm shadow hover:bg-gray-100 transition" onClick={() => setEditMode(true)}>Edit Profile</button>
            )}
          </>
        )}
        </div>
      </div>
      {/* Right: Projects/Tasks and Ratings */}
      <div className="flex-1 flex flex-col gap-7 pl-2">
        <h2 className="text-3xl font-black mb-4 mt-2 text-[#101828]">All Tasks</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-7 card_grid-sm">
          {tasks.length === 0 ? (
            <div className="text-gray-400">No tasks found.</div>
          ) : (
            tasks.map(task => (
              <li key={task.id} className="task-list_card list-none border-4 border-[#10172a] shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="task-list_date">{task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</p>
                  {/* <span className="flex items-center gap-1 text-xs text-gray-400"><EyeIcon className="w-4 h-4" />{task.views}</span> */}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-800">{task.poster?.username || 'Unknown'}</span>
                  {task.poster?.profilePicUrl && <img src={task.poster.profilePicUrl.startsWith('/') ? `http://localhost:8080${task.poster.profilePicUrl}` : task.poster.profilePicUrl} alt={task.poster.username} className="w-7 h-7 rounded-full border ml-1" />}
                </div>
                <h3 className="text-xl font-bold text-[#101828] truncate mt-1">{task.title}</h3>
                <p className="task-list_desc">{task.description}</p>
                <img src={task.imageUrl || 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80'} alt="task" className="task-list_img" />
                <div className="flex items-center justify-between gap-3 mt-3">
                  <span className="text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-600 font-medium cursor-pointer hover:bg-gray-200 transition">{task.tags || 'General'}</span>
                  <span className="text-xs px-3 py-1 bg-blue-100 rounded-full text-blue-700 font-semibold">₹{task.budget}</span>
                </div>
                <button
                  className="task-list_btn mt-5 w-full"
                  onClick={() => window.location.href = `/tasks/${task.id}`}
                >
                  Details
                </button>
              </li>
            ))
          )}
        </ul>
        {/* Ratings/Reviews for Hustler */}
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
    </section>
  );
}
