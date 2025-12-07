import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function Notepad({
  isOpen,
  onClose,
  speak,
  initialMode = "list",
}) {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState({ title: "", content: "" });
  const [view, setView] = useState("list"); // 'list' or 'editor'
  const [loading, setLoading] = useState(false);

  // Ref for auto-focusing textarea for voice typing
  const contentRef = useRef(null);

  // Load notes or start editor based on initialMode
  useEffect(() => {
    if (isOpen) {
      if (initialMode === "create") {
        handleCreateNew();
      } else {
        fetchNotes();
        setView("list");
      }
    }
  }, [isOpen, initialMode]);

  // Auto-focus when switching to editor view
  useEffect(() => {
    if (view === "editor" && contentRef.current) {
      // Small timeout to ensure render is complete
      setTimeout(() => contentRef.current.focus(), 100);
    }
  }, [view]);

  const fetchNotes = async () => {
    try {
      const res = await API.get("/notes");
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to load notes", err);
    }
  };

  const handleSave = async () => {
    if (!activeNote.title && !activeNote.content) return;

    setLoading(true);
    try {
      if (activeNote.id) {
        await API.put(`/notes/${activeNote.id}`, activeNote);
        speak("Note updated");
      } else {
        await API.post("/notes", activeNote);
        speak("Note saved");
      }
      await fetchNotes();
      setView("list");
      setActiveNote({ title: "", content: "" });
    } catch (err) {
      speak("Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setActiveNote({ title: "", content: "" });
    setView("editor");
    // Only speak if we manually clicked, otherwise App.js speaks "Ready to type"
    if (initialMode === "list") speak("New note. Start typing.");
  };

  const handleEdit = (note) => {
    setActiveNote(note);
    setView("editor");
    speak(`Opening ${note.title}`);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this note?")) return;
    try {
      await API.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      speak("Note deleted");
    } catch (err) {
      speak("Error deleting note");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl h-[600px] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {view === "list"
              ? "My Notes"
              : activeNote.id
              ? "Edit Note"
              : "New Note"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-lg px-3"
          >
            ✕ Close
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-4">
          {view === "list" ? (
            <div className="h-full flex flex-col">
              <button
                onClick={handleCreateNew}
                className="mb-4 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition"
              >
                <span>+</span> Create New Note
              </button>

              <div className="flex-1 overflow-y-auto space-y-2">
                {notes.length === 0 ? (
                  <p className="text-center text-gray-500 mt-10">
                    No notes yet.
                  </p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => handleEdit(note)}
                      className="p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group flex justify-between items-center transition"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                          {note.title || "Untitled"}
                        </h3>
                        <p className="text-sm text-gray-500 truncate w-64">
                          {note.content}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDelete(note.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 p-2 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col gap-4">
              <input
                className="w-full p-3 text-lg font-bold border-b focus:border-blue-500 outline-none bg-transparent dark:text-white"
                placeholder="Note Title..."
                value={activeNote.title}
                onChange={(e) =>
                  setActiveNote({ ...activeNote, title: e.target.value })
                }
              />
              <textarea
                ref={contentRef}
                className="flex-1 w-full p-3 resize-none border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
                placeholder="Start typing or say 'Start typing'..."
                value={activeNote.content}
                onChange={(e) =>
                  setActiveNote({ ...activeNote, content: e.target.value })
                }
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setView("list")}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                >
                  {loading ? "Saving..." : "Save Note"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
