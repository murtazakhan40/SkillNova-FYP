"use client";

import React, { useState, useRef, useTransition } from "react";
import { 
  updateStudentProfileAction, 
  ProfileUpdateResult 
} from "@/app/actions/profile";
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  ShieldCheck,
  Camera,
  Trash2,
  Sparkles,
  Loader2,
  Users,
  Heart,
  Smile
} from "lucide-react";

interface StudentProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
    headline?: string | null;
    bio?: string | null;
    phone?: string | null;
    age?: number | null;
    parentName?: string | null;
    parentEmail?: string | null;
    parentPhone?: string | null;
    parentRelationship?: string | null;
  };
}

const AVATAR_PRESETS = [
  { id: "student-1", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80", label: "Scholar 1" },
  { id: "student-2", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80", label: "Scholar 2" },
  { id: "student-3", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80", label: "Scholar 3" },
  { id: "student-4", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80", label: "Scholar 4" },
  { id: "student-5", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80", label: "Scholar 5" },
];

export function StudentProfileForm({ user }: StudentProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ProfileUpdateResult | null>(null);

  // Form field state
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || "");
  const [headline, setHeadline] = useState(user.headline || "");
  const [bio, setBio] = useState(user.bio || "");

  // Minor & Guardian field state
  const [age, setAge] = useState<string | number>(user.age !== null && user.age !== undefined ? user.age : "");
  const [parentName, setParentName] = useState(user.parentName || "");
  const [parentEmail, setParentEmail] = useState(user.parentEmail || "");
  const [parentPhone, setParentPhone] = useState(user.parentPhone || "");
  const [parentRelationship, setParentRelationship] = useState(user.parentRelationship || "Parent");

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);
  const [avatarPresetUrl, setAvatarPresetUrl] = useState<string | null>(user.avatar || null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setState({ error: "Selected image exceeds maximum allowed limit of 5MB." });
        return;
      }
      setSelectedFile(file);
      setRemoveAvatar(false);
      setAvatarPresetUrl(null);
      
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
      setState(null);
    }
  };

  const handleSelectPreset = (url: string) => {
    setSelectedFile(null);
    setRemoveAvatar(false);
    setAvatarPresetUrl(url);
    setAvatarPreview(url);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setRemoveAvatar(true);
    setAvatarPresetUrl(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("headline", headline);
    formData.append("bio", bio);

    if (age !== "") {
      formData.append("age", String(age));
    }
    formData.append("parentName", parentName);
    formData.append("parentEmail", parentEmail);
    formData.append("parentPhone", parentPhone);
    formData.append("parentRelationship", parentRelationship);

    if (selectedFile) {
      formData.append("avatarFile", selectedFile);
    } else if (avatarPresetUrl) {
      formData.append("avatar", avatarPresetUrl);
    }

    if (removeAvatar) {
      formData.append("removeAvatar", "true");
    }

    startTransition(async () => {
      try {
        const result = await updateStudentProfileAction(null, formData);
        setState(result);
        if (result.success && result.updatedUser) {
          setName(result.updatedUser.name);
          setEmail(result.updatedUser.email);
          setPhone(result.updatedUser.phone || "");
          setHeadline(result.updatedUser.headline || "");
          setBio(result.updatedUser.bio || "");
          if (result.updatedUser.age !== undefined && result.updatedUser.age !== null) {
            setAge(result.updatedUser.age);
          }
          if (result.updatedUser.parentName !== undefined) {
            setParentName(result.updatedUser.parentName || "");
          }
          if (result.updatedUser.parentEmail !== undefined) {
            setParentEmail(result.updatedUser.parentEmail || "");
          }
          if (result.updatedUser.parentPhone !== undefined) {
            setParentPhone(result.updatedUser.parentPhone || "");
          }
          if (result.updatedUser.parentRelationship !== undefined) {
            setParentRelationship(result.updatedUser.parentRelationship || "Parent");
          }
          if (result.updatedUser.avatar !== undefined) {
            setAvatarPreview(result.updatedUser.avatar);
          }
          setSelectedFile(null);
          setRemoveAvatar(false);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unable to save profile details.";
        setState({ error: message });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* Feedback Alerts */}
      {state?.success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold">Success: </span>
            {state.message}
          </div>
        </div>
      )}

      {state?.error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold">Error: </span>
            {state.error}
          </div>
        </div>
      )}

      {/* Profile Picture Management Section */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar Preview */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-[#0B1B3D] text-white flex items-center justify-center font-black text-2xl overflow-hidden ring-4 ring-orange-500/20 shadow-md shrink-0">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt={name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span>{name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-bold cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span>Upload</span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#0B1B3D]">{name}</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  <span>Verified Student</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {headline || "Enrolled SkillNova Scholar"}
              </p>
              <div className="text-[11px] text-slate-400">
                Institutional ID: <span className="font-mono text-slate-600 font-semibold">{user.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>

          {/* Photo Actions */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white text-[#0B1B3D] hover:bg-slate-100 border border-slate-300 shadow-xs cursor-pointer transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>{selectedFile ? "Change File" : "Upload Photo"}</span>
            </button>

            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isPending}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer transition-colors"
                title="Remove current avatar"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>

        {selectedFile && (
          <div className="text-xs text-emerald-700 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between">
            <span className="font-medium">Selected file: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            <span className="text-[10px] uppercase font-bold text-emerald-600">Ready to save</span>
          </div>
        )}

        {/* Quick Avatar Presets */}
        <div className="pt-3 border-t border-slate-200/70">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0B1B3D] mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Or choose an academic preset avatar:</span>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {AVATAR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.url)}
                className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                  avatarPreview === preset.url
                    ? "border-[#FF6B00] ring-2 ring-orange-500/30 scale-105"
                    : "border-slate-200 hover:border-slate-400"
                }`}
                title={preset.label}
              >
                <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Profile Attributes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0B1B3D] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Full Name</span>
          </label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Murtaza Wazir"
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-colors bg-white"
          />
        </div>

        {/* Academic Email (Now Fully Editable) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0B1B3D] flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Academic & Sign-In Email</span>
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="e.g. student@skillnova.edu"
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-colors bg-white font-medium"
          />
          <p className="text-[10px] text-slate-400">
            Primary email address used for login credentials, course notifications, and certificates.
          </p>
        </div>

        {/* Contact Phone Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0B1B3D] flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>Contact Phone Number</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +92 302 9983146"
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-colors bg-white font-mono"
          />
          <p className="text-[10px] text-slate-400">
            Used for institutional verification and academic support contact.
          </p>
        </div>

        {/* Professional Headline */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0B1B3D] flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>Professional Headline</span>
          </label>
          <input
            type="text"
            name="headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. BS Computer Science | Full-Stack & Cloud Architecture"
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-colors bg-white"
          />
          <p className="text-[10px] text-slate-400">
            Appears on your course discussions, project evaluations, and portfolio.
          </p>
        </div>

        {/* Student Age & Minor Status */}
        <div className="space-y-1.5 sm:col-span-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#0B1B3D] flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Student Age (Years)</span>
            </label>
            {age !== "" && (
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                Number(age) < 18
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}>
                {Number(age) < 18 ? "🌟 Junior Scholar (Under 18)" : "🎓 Adult Independent Scholar (18+)"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              name="age"
              min={5}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 16"
              disabled={isPending}
              className="w-32 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#0B1B3D] focus:outline-hidden focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-colors bg-white font-mono"
            />
            <div className="flex items-center gap-1.5 flex-wrap">
              {[12, 14, 16, 17, 18].map((presetAge) => (
                <button
                  key={presetAge}
                  type="button"
                  onClick={() => setAge(presetAge)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    Number(age) === presetAge
                      ? "bg-[#FF6B00] text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {presetAge === 18 ? "18+" : `${presetAge}y`}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400">
            Learners under 18 require parent or legal guardian details to receive academic progress reports.
          </p>
        </div>

        {/* Guardian Contact Details (Visible if student is under 18) */}
        {(age !== "" && Number(age) < 18) && (
          <div className="sm:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-white border-2 border-orange-200/90 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#0B1B3D]">
                  Parent & Guardian Contact Information (Required for Under-18 Scholars)
                </h4>
                <p className="text-[11px] text-slate-600">
                  SkillNova automatically emails lecture progress, quiz results, and verified certificates to your parent.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Parent Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>Parent / Guardian Full Name *</span>
                </label>
                <input
                  type="text"
                  name="parentName"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="e.g. Sarah Wazir"
                  disabled={isPending}
                  required={Number(age) < 18}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-hidden focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
                />
              </div>

              {/* Relationship */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-400" />
                  <span>Relationship</span>
                </label>
                <select
                  name="parentRelationship"
                  value={parentRelationship}
                  onChange={(e) => setParentRelationship(e.target.value)}
                  disabled={isPending}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-hidden focus:border-[#FF6B00]"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Legal Guardian">Legal Guardian</option>
                  <option value="Parent">Parent</option>
                </select>
              </div>

              {/* Parent Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#FF6B00]" />
                  <span>Parent Email (For Progress Reports) *</span>
                </label>
                <input
                  type="email"
                  name="parentEmail"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="parent@example.com"
                  disabled={isPending}
                  required={Number(age) < 18}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-hidden focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
                />
              </div>

              {/* Parent Phone / WhatsApp */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>Parent WhatsApp / Mobile Number *</span>
                </label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  disabled={isPending}
                  required={Number(age) < 18}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-hidden focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Academic Biography */}
        <div className="sm:col-span-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#0B1B3D] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Academic Biography & Engineering Focus</span>
            </label>
            <span className={`text-[10px] ${bio.length > 700 ? "text-amber-600 font-bold" : "text-slate-400"}`}>
              {bio.length} / 800 characters
            </span>
          </div>
          <textarea
            name="bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={800}
            placeholder="Briefly describe your programming background, current FYP research topics, project repositories, and technical skills..."
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-colors bg-white"
          />
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          All changes are synchronized with your PostgreSQL database record.
        </span>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-md shadow-orange-500/20 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Profile Information</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
