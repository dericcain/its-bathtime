"use client";

import getCroppedImg from "@/lib/cropImage";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Camera, Edit2, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";

export default function KidsPage() {
  const kids = useLiveQuery(() => db.kids.toArray()) || [];
  
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [avatarBlob, setAvatarBlob] = useState<Blob | undefined>(undefined);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      let imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
    }
  };

  const showCroppedImage = async () => {
    try {
      if (!imageSrc) return;
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels, 0);
      if (croppedImageBlob) {
        setAvatarBlob(croppedImageBlob);
        setImageSrc(null); // hide cropper
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveKid = async () => {
    if (!name.trim()) return;
    
    if (editingId) {
      await db.kids.update(editingId, {
        name,
        ...(avatarBlob ? { avatarBlob } : {})
      });
    } else {
      await db.kids.add({
        id: crypto.randomUUID(),
        name,
        createdAt: Date.now(),
        ...(avatarBlob ? { avatarBlob } : {})
      });
    }
    
    // Reset form
    setName("");
    setAvatarBlob(undefined);
    setImageSrc(null);
    setEditingId(null);
  };

  const editKid = (kid: any) => {
    setName(kid.name);
    setAvatarBlob(kid.avatarBlob);
    setEditingId(kid.id);
    setImageSrc(null);
  };

  const deleteKid = async (id: string) => {
    await db.kids.delete(id);
  };

  return (
    <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <h2 style={{ textAlign: "center" }}>Manage Kids</h2>

      {/* Form */}
      <div className="kids-form-card">
        <h3>{editingId ? "Edit Kid" : "Add New Kid"}</h3>
        <input
          className="input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Kid's Name..."
        />
        
        {/* Avatar Upload */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {avatarBlob && !imageSrc && (
            <img src={URL.createObjectURL(avatarBlob)} alt="Avatar" className="avatar-preview" />
          )}
          <label className="button button-yellow" style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", width: "fit-content" }}>
            <Camera size={20} />
            {avatarBlob ? "Change Photo" : "Upload Photo"}
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
          </label>
        </div>

        {/* Cropper Modal-ish */}
        {imageSrc && (
          <div style={{ position: "relative", width: "100%", height: "300px", background: "#333", border: "4px solid black", marginTop: "1rem" }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
            <button
              onClick={showCroppedImage}
              className="button button-yellow"
              style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", zIndex: 10 }}
            >
              Crop
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="kids-form-actions">
          <button className="button" onClick={saveKid}>
            {editingId ? "Update" : "Add to Team!"}
          </button>
          {editingId && (
            <button className="button button-red" onClick={() => {
              setEditingId(null);
              setName("");
              setAvatarBlob(undefined);
              setImageSrc(null);
            }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3>Current Team</h3>
        {kids.length === 0 && <p>No kids added yet. Must add at least 2 kids!</p>}
        {kids.map((kid) => (
          <div key={kid.id} className="kids-row">
            {kid.avatarBlob ? (
              <img src={URL.createObjectURL(kid.avatarBlob)} alt={kid.name} className="avatar-preview" style={{width: '60px', height: '60px', borderWidth: '3px'}} />
            ) : (
              <div className="avatar-preview" style={{width: '60px', height: '60px', borderWidth: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Camera size={24} />
              </div>
            )}
            <div className="kids-row-name">
              <h4>{kid.name}</h4>
            </div>
            <div className="kids-row-actions">
              <button className="button button-yellow" style={{ padding: "0.5rem 0.9rem" }} onClick={() => editKid(kid)} aria-label={`Edit ${kid.name}`}>
                <Edit2 size={20} />
              </button>
              <button className="button button-red" style={{ padding: "0.5rem 0.9rem" }} onClick={() => deleteKid(kid.id)} aria-label={`Delete ${kid.name}`}>
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result as string), false);
    reader.readAsDataURL(file);
  });
}
