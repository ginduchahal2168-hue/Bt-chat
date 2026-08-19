import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Shield,
  UserCheck,
  Lock,
  Radio,
  HardDrive,
  EyeOff,
  CheckCircle2,
  FileText,
  Server,
  Zap,
  Globe,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PrivacyPolicyScreenProps {
  onBack?: () => void;
}

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onBack }) => {
  const { setShowPrivacyPolicy, showToast } = useApp();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setShowPrivacyPolicy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 overflow-y-auto pb-24 p-4 space-y-6 text-neutral-100"
    >
      {/* Top Navigation Header */}
      <div className="flex items-center gap-3 pt-1">
        <button
          id="btn-privacy-back"
          onClick={handleBack}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition"
          aria-label="Back to settings"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Privacy Policy
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-semibold border border-blue-500/20">
              v1.2 Active
            </span>
          </h1>
          <p className="text-xs text-neutral-400">Account transparency, cryptography & P2P protocol</p>
        </div>
      </div>

      {/* Summary Highlight Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-950/40 via-neutral-900 to-neutral-900 border border-blue-500/20 space-y-2.5">
        <div className="flex items-center gap-2 text-blue-400">
          <Shield className="w-5 h-5" />
          <span className="text-xs font-bold tracking-wide uppercase">Zero-Knowledge & Privacy-First Architecture</span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          BlueMesh is engineered for decentralized, resilient communication. Whether exchanging instant messages over
          Bluetooth mesh relays or syncing direct conversations via secure cloud infrastructure, your privacy and device autonomy
          remain strictly protected.
        </p>
      </div>

      {/* SECTION 1: Account Information */}
      <section className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-4">
        <div className="flex items-center gap-3 border-b border-neutral-800/80 pb-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">1. Account Information</h2>
            <p className="text-[11px] text-neutral-400">Identity collection, scope, and user ownership</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
          <p>
            When creating an account, BlueMesh requests only minimal profile attributes necessary for user discovery and real-time identity routing:
          </p>

          <ul className="space-y-2 pl-1">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Public Profile:</strong> Display name, custom username handle (<code className="text-blue-300">@username</code>), and optional profile avatar image.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Authentication Credentials:</strong> Secure Firebase OAuth sign-in credentials (e.g., Google Identity token). We never receive or store your raw account passwords.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Privacy Controls:</strong> Granular settings allowing you to restrict who can view your Last Seen timestamp, online presence dot, profile avatar, and status stories.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Full Data Deletion:</strong> You can permanently wipe your account and all associated messages, contacts, and cloud records instantly with one tap via Settings.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* SECTION 2: Data Security */}
      <section className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-4">
        <div className="flex items-center gap-3 border-b border-neutral-800/80 pb-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">2. Data Security</h2>
            <p className="text-[11px] text-neutral-400">Access control rules, cryptography, and storage isolation</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
          <p>
            Your data is protected by multiple security layers enforcing attribute-based access control and strict transport encryption:
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            <div className="p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 space-y-1">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hardened Firestore Security Rules</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Direct conversations and message subcollections are protected so that only verified participants of a conversation can query or write messages. Unrelated third parties are blocked at the database engine level.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 space-y-1">
              <div className="flex items-center gap-2 text-white font-semibold">
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                <span>Sandboxed Local Device Storage</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Offline queues, cached file transfers, and device preferences are securely stored inside your browser's private local state and never sent to diagnostic servers or advertising aggregators.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 space-y-1">
              <div className="flex items-center gap-2 text-white font-semibold">
                <EyeOff className="w-3.5 h-3.5 text-purple-400" />
                <span>24-Hour Ephemeral Status Expiration</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Status updates and multimedia stories are programmatically set to expire and become unreadable 24 hours after creation, keeping your footprint transient.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: P2P Communication Handling */}
      <section className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-4">
        <div className="flex items-center gap-3 border-b border-neutral-800/80 pb-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">3. P2P Communication Handling</h2>
            <p className="text-[11px] text-neutral-400">Bluetooth mesh, WebRTC streams, and local file beams</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
          <p>
            BlueMesh includes native support for true offline, decentralized device-to-device interaction without cell towers or internet:
          </p>

          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800/80">
              <Zap className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">Direct 2.4 GHz Bluetooth Mesh Transmission</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Offline nearby device discovery and message forwarding broadcast packets directly between local hardware radios. No intermediate internet routers, third-party loggers, or ISP telemetry are involved.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800/80">
              <Globe className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">Encrypted WebRTC Audio & Video Calling</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Real-time voice and video streams establish direct peer-to-peer media pipelines protected with DTLS-SRTP encryption. Media tracks flow straight from device to device without recording on central servers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800/80">
              <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">Direct Local File Beams</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Files, documents, and media shared via P2P File Beam are sliced into secure binary chunks and transferred point-to-point. They are stored only on the receiving device's local memory upon completion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Contact Footer Card */}
      <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
        <div>
          <p className="text-neutral-300 font-semibold">Questions regarding privacy?</p>
          <p className="text-[11px] text-neutral-500">Managed under BlueMesh Decentralized Security Policy</p>
        </div>
        <button
          onClick={() => {
            showToast('Privacy standards are up to date');
          }}
          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium transition text-xs"
        >
          Check Status
        </button>
      </div>
    </motion.div>
  );
};
