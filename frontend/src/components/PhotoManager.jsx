// components/PhotoManager.jsx
import React, { useState, useEffect } from "react";

const URL_PREFIX = "http://localhost:5000/uploads/";   // adjust if needed

export default function PhotoManager({ recipeId }) {
    const [photos, setPhotos] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [newUrls,  setNewUrls]  = useState([""]);

    /* -------- fetch existing photos -------- */
    useEffect(() => {
        fetch(`http://localhost:5000/api/photos/recipe/${recipeId}`)
            .then(r => r.json())
            .then(setPhotos)
            .catch(console.error);
    }, [recipeId]);

    /* ---------- helpers ---------- */
    const deletePhoto = async (photoId) => {
        await fetch(`http://localhost:5000/api/photos/${photoId}`, {
            method: "DELETE",
            credentials: "include"
        });
        setPhotos(p => p.filter(ph => ph.photo_id !== photoId));
    };

    const updateCaption = async (photoId, caption) => {
        await fetch(`http://localhost:5000/api/photos/${photoId}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ caption })
        });
        setPhotos(p =>
            p.map(ph => ph.photo_id === photoId ? {...ph, caption} : ph)
        );
    };

    /* ---------- add new photos on demand ---------- */
    const uploadAllNew = async () => {
        const promises = [];

        /* files */
        newFiles.forEach(f => {
            const fd = new FormData();
            fd.append("photoFile", f);
            fd.append("recipe_id", recipeId);
            promises.push(
                fetch("http://localhost:5000/api/photos", {
                    method: "POST", body: fd
                })
            );
        });

        /* external URLs */
        newUrls
            .filter(u => u.trim().startsWith("http"))
            .forEach(u => {
                promises.push(
                    fetch("http://localhost:5000/api/photos/url", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({ recipe_id: recipeId, name: u.trim() })
                    })
                );
            });

        const results = await Promise.all(promises);
        const fresh = await Promise.all(results.map(r => r.json()));
        setPhotos(p => [...p, ...fresh.map(obj => ({
            ...obj,
            url: obj.url ?? URL_PREFIX + obj.filename
        }))]);

        // reset local form
        setNewFiles([]);
        setNewUrls([""]);
    };

    /* ---------- UI ---------- */
    return (
        <div className="space-y-6">
            {/* existing photos grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {photos.map(ph => (
                    <div key={ph.photo_id} className="relative group">
                        <img
                            src={ph.url}
                            alt={ph.caption || "photo"}
                            className="h-40 w-full object-cover rounded"
                        />
                        <button
                            onClick={() => deletePhoto(ph.photo_id)}
                            className="absolute top-1 right-1 bg-red-600 text-xs px-2 rounded opacity-0 group-hover:opacity-100"
                        >
                            ✕
                        </button>
                        <textarea
                            rows="2"
                            defaultValue={ph.caption || ""}
                            onBlur={(e) => updateCaption(ph.photo_id, e.target.value)}
                            className="mt-2 w-full bg-gray-800 text-sm text-white p-1 rounded"
                            placeholder="Add caption…"
                        />
                    </div>
                ))}
            </div>

            {/* add new photos */}
            <div className="border-t border-gray-700 pt-4">
                <label className="block text-gray-300 mb-2 font-semibold">
                    Add Photos
                </label>

                {/* file picker */}
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setNewFiles([...e.target.files])}
                    className="mb-2"
                />

                {/* external URLs */}
                {newUrls.map((u, i) => (
                    <input
                        key={i}
                        type="url"
                        placeholder="https://example.com/my.jpg"
                        className="w-full bg-gray-800 text-white p-1 my-1 rounded"
                        value={u}
                        onChange={(e) => {
                            const copy = [...newUrls];
                            copy[i] = e.target.value;
                            setNewUrls(copy);
                        }}
                    />
                ))}
                <button
                    type="button"
                    onClick={() => setNewUrls([...newUrls, ""])}
                    className="text-blue-400 text-sm mt-1"
                >
                    + another URL
                </button>

                {/* upload trigger */}
                <button
                    type="button"
                    onClick={uploadAllNew}
                    disabled={newFiles.length === 0 && newUrls.every(u => !u.trim())}
                    className="block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-40"
                >
                    Upload Selected
                </button>
            </div>
        </div>
    );
}
