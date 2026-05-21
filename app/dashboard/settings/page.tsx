"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "@/lib/store/toastStore";
import { User, Shield, Mail, CheckCircle, AlertCircle, Save } from "lucide-react";
import FormSection from "@/components/ui/FormSection";

export default function SettingsPage() {
  const { user } = useAuth();
  
  // Profile State
  const [fullName, setFullName] = useState(user?.full_name || "John Doe"); // Stub fallback
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Verification State
  const isVerified = false; // Stubbed as unverified
  const [isResending, setIsResending] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    await new Promise((r) => setTimeout(r, 600)); // Stub delay
    toast.success("Profile updated successfully");
    setIsSavingProfile(false);
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setIsSavingPassword(true);
    await new Promise((r) => setTimeout(r, 1000)); // Stub delay
    toast.success("Password changed securely");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsSavingPassword(false);
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    await new Promise((r) => setTimeout(r, 1200)); // Stub delay
    toast.info("Verification link sent to your email.");
    setIsResending(false);
  };

  return (
    <div className="mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-white/50 mt-2">Manage your profile details, security, and verification.</p>
      </div>

      {/* Profile Section */}
      <FormSection title="Public Profile" description="This information will be displayed publicly so be careful what you share.">
         <form onSubmit={handleProfileSave} className="space-y-6">
           <div className="flex flex-col gap-6 md:flex-row">
             <div className="flex-1">
               <label className="block text-sm font-medium text-white/70 mb-2">Full Name</label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <User className="h-5 w-5 text-white/30" />
                 </div>
                 <input
                   type="text"
                   required
                   value={fullName}
                   onChange={(e) => setFullName(e.target.value)}
                   className="block w-full pl-10 pr-3 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                   placeholder="Your name"
                 />
               </div>
             </div>
             <div className="flex-1 opacity-70">
               <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Mail className="h-5 w-5 text-white/30" />
                 </div>
                 <input
                   type="email"
                   disabled
                   value={user?.email || "user@example.com"}
                   className="block w-full pl-10 pr-3 py-3 rounded-xl border border-white/5 bg-transparent text-white sm:text-sm cursor-not-allowed"
                 />
               </div>
               <p className="text-xs text-white/30 mt-2">Email cannot be changed.</p>
             </div>
           </div>
           
           <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-white/10 text-white hover:bg-white/20 transition-all disabled:opacity-50"
              >
                {isSavingProfile ? "Saving..." : <><Save className="w-4 h-4"/> Save Profile</>}
              </button>
           </div>
         </form>
      </FormSection>

      {/* Security Section */}
      <FormSection title="Security & Password" description="Update your password to keep your account secure.">
        <form onSubmit={handlePasswordSave} className="space-y-6">
           <div className="max-w-md space-y-4">
             <div>
               <label className="block text-sm font-medium text-white/70 mb-2">Current Password</label>
               <input
                 type="password"
                 required
                 value={currentPassword}
                 onChange={(e) => setCurrentPassword(e.target.value)}
                 className="block w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-white/70 mb-2">New Password</label>
               <input
                 type="password"
                 required
                 minLength={8}
                 value={newPassword}
                 onChange={(e) => setNewPassword(e.target.value)}
                 className="block w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-white/70 mb-2">Confirm New Password</label>
               <input
                 type="password"
                 required
                 minLength={8}
                 value={confirmPassword}
                 onChange={(e) => setConfirmPassword(e.target.value)}
                 className="block w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
               />
             </div>
           </div>

           <div className="flex justify-start pt-4 border-t border-white/10 mt-6">
              <button
                type="submit"
                disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white"
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                }}
              >
                {isSavingPassword ? "Updating..." : <><Shield className="w-4 h-4"/> Update Password</>}
              </button>
           </div>
        </form>
      </FormSection>

      {/* Verification Box */}
      <div className={`rounded-2xl border p-6 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative ${isVerified ? "bg-green-500/5 border-green-500/20" : "bg-orange-500/5 border-orange-500/20"}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-5 rounded-full blur-3xl" />
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isVerified ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
            {isVerified ? <CheckCircle className="w-8 h-8"/> : <AlertCircle className="w-8 h-8" />}
          </div>
          <div>
             <h3 className="text-lg font-bold text-white">
                {isVerified ? "Account Verified" : "Account Verification Pending"}
             </h3>
             <p className="text-sm text-white/50 mt-1 max-w-md">
                {isVerified 
                  ? "Your email address is verified and your account is in good standing." 
                  : "Please verify your email address to unlock full platform features like payouts and public event listings."}
             </p>
          </div>
        </div>

        {!isVerified && (
          <button
            onClick={handleResendVerification}
            disabled={isResending}
            className="shrink-0 px-6 py-3 rounded-xl font-bold text-sm bg-white text-black hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {isResending ? "Sending Link..." : "Resend Email"}
          </button>
        )}
      </div>

    </div>
  );
}
