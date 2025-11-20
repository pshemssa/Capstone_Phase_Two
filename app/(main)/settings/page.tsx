"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user && 'username' in session.user && session.user.username) {
      setUsername(session.user.username as string);
    }
    if (session?.user?.name) {
      setName(session.user.name);
    }
    // Fetch user data including bio
    if (status === "authenticated") {
      fetchUserData();
    }
  }, [session?.user, status]);

  async function fetchUserData() {
    try {
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUsername(data.user.username || "");
          setName(data.user.name || "");
          setBio(data.user.bio || "");
        }
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  }

  const isAuthed = status === "authenticated";

  async function handleUsernameSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSavingUsername(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update username");
      }
      setMessage("Username updated");
      if (session?.user) {
        await update({ user: { ...(session.user as any), username } });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingUsername(false);
    }
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSavingProfile(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }
      setMessage("Profile updated");
      if (session?.user) {
        await update();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSavingPassword(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }
      setMessage("Password updated");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingPassword(false);
    }
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please sign in to manage your account.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

        {message && (
          <div className="mb-4 rounded-md bg-green-50 p-4 text-green-700 border border-green-200">{message}</div>
        )}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700 border border-red-200">{error}</div>
        )}

        <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-600"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={500}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-600"
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-gray-500 mt-1">{bio.length}/500 characters</p>
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center justify-center rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700 disabled:opacity-50"
            >
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Username</h2>
          <form onSubmit={handleUsernameSave} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-600"
                placeholder="your_username"
              />
              <p className="text-xs text-gray-500 mt-1">Only letters, numbers, and underscores. Min 3 characters.</p>
            </div>
            <button
              type="submit"
              disabled={savingUsername || !username}
              className="inline-flex items-center justify-center rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700 disabled:opacity-50"
            >
              {savingUsername ? "Saving..." : "Save Username"}
            </button>
          </form>
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-600"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-600"
                placeholder="At least 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={savingPassword || !passwords.currentPassword || !passwords.newPassword}
              className="inline-flex items-center justify-center rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700 disabled:opacity-50"
            >
              {savingPassword ? "Saving..." : "Save Password"}
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}