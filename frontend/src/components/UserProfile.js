import React, { useEffect, useState, useRef } from "react";

export default function UserProfile({ userId, username, onUsernameClick, currentUser }) {
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
      console.log('[DEBUG] Uploading file:', file.name);
      const res = await fetch('http://localhost:8080/api/files/upload', {
        method: 'POST',
        body: formData
      });
      console.log('[DEBUG] Upload response status:', res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('[ERROR] Upload failed:', errorText);
        throw new Error('Profile picture upload failed');
      }
      let url = await res.text();
      if (url.startsWith('"') && url.endsWith('"')) url = url.substring(1, url.length - 1);
      console.log('[DEBUG] Uploaded file URL:', url);
      setProfilePicUrl(url);
    } catch (err) {
      console.error('[ERROR] handlePicUpload:', err);
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
    <div className="container mx-auto px-4 py-8 max-w-7xl mt-20">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Profile Card */}
        <div className="lg:w-1/3">
          <div className="profile_card relative flex flex-col items-center justify-center bg-[#10172a] border-[5px] border-black rounded-[30px] shadow-2xl w-[300px] min-w-[260px] max-w-xs pb-8 pt-20 px-5 mx-auto lg:mx-0">
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
            {/* Only allow editing if viewing own profile (by id or username) */}
            {currentUser && profile && ((userId && String(currentUser.id) === String(userId)) || (!userId && profile.username && currentUser.username === profile.username)) && editMode ? (
              <div className="w-full flex flex-col items-center space-y-3 mt-4">
                {/* File upload with styled button */}
                <div className="w-full flex flex-col items-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-0.5 border-2 border-white uppercase bg-white text-black transition duration-200 text-sm shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255),4px_4px_rgba(255,255,255),5px_5px_0px_0px_rgba(255,255,255)] flex items-center gap-2 font-medium"
                    disabled={uploading}
                  >
                    📷 {uploading ? 'Uploading...' : 'Change Photo'}
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handlePicUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploadError && <div className="text-red-400 text-xs mt-2 text-center">{uploadError}</div>}
                </div>
                
                {/* Bio textarea */}
                <textarea
                  className="w-full bg-white border-2 border-white text-black placeholder-gray-500 resize-none focus:outline-none transition-all duration-200 px-3 py-2 shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255),4px_4px_rgba(255,255,255),5px_5px_0px_0px_rgba(255,255,255)]"
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Write something about yourself..."
                />
                
                {/* Action buttons */}
                <div className="flex gap-3 w-full justify-center">
                  <button
                    className="px-6 py-0.5 border-2 border-white uppercase bg-green-600 text-white transition duration-200 text-sm shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255),4px_4px_rgba(255,255,255),5px_5px_0px_0px_rgba(255,255,255)] disabled:opacity-50 font-medium"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    className="px-6 py-0.5 border-2 border-white uppercase bg-white text-black transition duration-200 text-sm shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255),4px_4px_rgba(255,255,255),5px_5px_0px_0px_rgba(255,255,255)] font-medium" 
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                </div>
                {saveError && <div className="text-red-400 text-xs text-center">{saveError}</div>}
              </div>
            ) : (
              <>
                <div className="text-white text-center mb-4 min-h-[32px] px-2">{profile.bio || <span className="italic text-gray-300">No bio yet.</span>}</div>
                {currentUser && profile && ((userId && String(currentUser.id) === String(userId)) || (!userId && profile.username && currentUser.username === profile.username)) && (
                  <button 
                    className="px-8 py-0.5 border-2 border-black dark:border-white uppercase bg-white text-black transition duration-200 text-sm shadow-[1px_1px_rgba(0,0,0),2px_2px_rgba(0,0,0),3px_3px_rgba(0,0,0),4px_4px_rgba(0,0,0),5px_5px_0px_0px_rgba(0,0,0)] dark:shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255),4px_4px_rgba(255,255,255),5px_5px_0px_0px_rgba(255,255,255)]"
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </button>
                )}
              </>
            )}
            </div>
          </div>
        </div>

        {/* Right: Ratings & Reviews */}
        <div className="lg:w-2/3">
          {profile.role === "HUSTLER" && ratings && ratings.ratings.length > 0 && (
            <div className="mb-4">
              <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Ratings & Reviews</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ratings.ratings.map(r => (
                  <div key={r.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-xl transition-shadow duration-300">
                    {/* Header with rating and date */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 text-lg">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {r.rating}/5
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Task title */}
                    <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white line-clamp-1">
                      {r.task.title}
                    </h3>

                    {/* Review comment */}
                    {r.comment && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                        "{r.comment}"
                      </p>
                    )}

                    {/* Poster info */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <img
                        src={`https://ui-avatars.com/api/?name=${r.poster.username}&background=random`}
                        alt={r.poster.username}
                        className="rounded-full w-6 h-6 object-cover border-2 border-white"
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs text-gray-400">Review by</p>
                        <p 
                          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline truncate"
                          onClick={() => {
                            if(onUsernameClick) onUsernameClick(r.poster.username);
                            else window.dispatchEvent(new CustomEvent('viewPublicProfile', { detail: { username: r.poster.username } }));
                          }}
                        >
                          @{r.poster.username}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
