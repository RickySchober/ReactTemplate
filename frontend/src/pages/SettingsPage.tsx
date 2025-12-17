/* Settings page to modify user profile information such as settings
   mailing address, and backsplash.
*/
import * as React from "react";
import { useState, useEffect } from "react";
import api from "../api/client.js";
import NavBar from "../components/NavBar.js";
import { UserProfile } from "../lib/types.js";
import Button from "../components/Button.js";
const backsplashImages = [
  "Gudul_Lurker.jpg",
  "Treasure_Cruise.jpg",
  "Lightning_Bolt.jpg",
  "Nissa.jpg",
  "Soul_Herder.jpg",
  "Evolving_Wilds.jpg",
];

const SettingsPage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [showBksChooser, setShowBksChooser] = useState(false);
  // Fetch profile
  useEffect(() => {
    api.get("/auth/me").then((res) => setProfile(res.data));
  }, []);

  if (!profile) return <div className="p-4 text-white">Loading...</div>;

  const updateField = (section: "settings" | "address", field: string, value: any) => {
    setProfile((prev: UserProfile) => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value,
      },
    }));
  };

  const save = () => {
    console.log(profile);
    setSaving(true);
    api.patch("/auth/me", profile).then(() => setSaving(false));
  };

  const s = profile.settings!;
  const a = profile.address!;

  return (
    <div className="flex flex-col items-center justify-center space-y-8 text-white">
      <NavBar />
      {/* SAVE BUTTON */}
      <button
        onClick={save}
        disabled={saving}
        className="w-4xl rounded bg-blue-400 py-3 hover:bg-blue-500 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
      {/* SETTINGS */}
      <div className="w-4xl rounded-xl bg-slate-800 p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">User Settings</h2>

        <div className="w-full space-y-3">
          {/* BACKSPLASH */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Backsplash</p>
                <p className="text-sm text-slate-400">{profile.settings?.backsplash}</p>
              </div>
              <Button onClick={() => setShowBksChooser(!showBksChooser)}>Change</Button>
            </div>
            {/* IMAGE GRID */}
            {showBksChooser && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {backsplashImages.map((img) => (
                  <div
                    key={img}
                    className={`cursor-pointer overflow-hidden rounded border hover:opacity-80 ${
                      profile.settings?.backsplash === img ? "border-blue-500" : "border-slate-700"
                    }`}
                    onClick={() => {
                      updateField("settings", "backsplash", img);
                      setShowBksChooser(false);
                    }}
                  >
                    <img src={`/backsplashes/${img}`} className="h-40 w-full object-cover" />
                    <p className="py-1 text-center text-xs">{img}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!s.disable_warning}
              onChange={(e) => {
                const enabled = e.target.checked;
                updateField("settings", "disable_warning", !enabled);
                if (enabled) {
                  localStorage.removeItem("disableProfileTutorial");
                  localStorage.removeItem("disableTradeTutorial");
                }
              }}
            />
            Enable Tutorial Popups
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={s.email_notifications}
              onChange={(e) => updateField("settings", "email_notifications", e.target.checked)}
            />
            Email Notifications
          </label>
        </div>
      </div>

      {/* ADDRESS */}
      <div className="w-4xl rounded-xl bg-slate-800 p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Mailing Address</h2>

        <div className="space-y-3">
          {["full_name", "street", "city", "state", "zip_code", "country"].map((field) => (
            <label key={field} className="block capitalize">
              <span>{field.replace("_", " ")}</span>
              <input
                className="mt-1 w-full rounded bg-slate-700 p-2"
                value={(a as any)[field] ?? ""}
                onChange={(e) => updateField("address", field, e.target.value)}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
