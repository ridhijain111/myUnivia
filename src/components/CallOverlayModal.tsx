import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Users,
  Shield,
  MonitorUp,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ActiveCallState } from '../types';

interface CallOverlayModalProps {
  call: ActiveCallState | null;
  onEndCall: (durationSeconds: number) => void;
}

export const CallOverlayModal: React.FC<CallOverlayModalProps> = ({
  call,
  onEndCall,
}) => {
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected'>('ringing');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [waveHeights, setWaveHeights] = useState<number[]>([40, 60, 30, 80, 50, 70, 45, 90, 65, 55]);

  const modalRef = useRef<HTMLDivElement>(null);

  // Transition from ringing to connected after 1.8 seconds
  useEffect(() => {
    if (!call) {
      setDuration(0);
      setCallStatus('ringing');
      return;
    }

    setCallStatus('ringing');
    setDuration(0);

    const ringTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 1800);

    return () => clearTimeout(ringTimer);
  }, [call?.channelId]);

  // Duration timer when connected
  useEffect(() => {
    if (callStatus !== 'connected') return;

    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStatus]);

  // Simulated audio wave animation
  useEffect(() => {
    if (callStatus !== 'connected') return;

    const waveInterval = setInterval(() => {
      setWaveHeights((prev) =>
        prev.map(() => Math.floor(Math.random() * 65) + 25)
      );
    }, 250);

    return () => clearInterval(waveInterval);
  }, [callStatus]);

  if (!call) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleFullScreen = () => {
    if (!modalRef.current) return;
    if (!isFullScreen) {
      if (modalRef.current.requestFullscreen) {
        modalRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullScreen(false);
    }
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl h-[85vh] max-h-[640px] bg-[#121B22] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between text-white">
        {/* Top Header Bar */}
        <div className="relative z-10 px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold">
              {call.isVideo ? <Video className="w-4 h-4 text-emerald-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white tracking-wide">
                  {call.channelName}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" />
                  <span>End-to-End Encrypted</span>
                </span>
              </div>
              <p className="text-xs text-white/70">
                {callStatus === 'ringing' ? (
                  <span className="animate-pulse text-emerald-300">Ringing student channel...</span>
                ) : (
                  <span className="text-emerald-400 font-medium">Connected • {formatTime(duration)}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullScreen}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Central Stage: Video or Audio Visualizer */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden p-6">
          {call.isVideo ? (
            /* Video Call Screen */
            <div className="w-full h-full relative rounded-2xl overflow-hidden bg-[#1E293B] flex items-center justify-center shadow-inner">
              {/* Remote Simulated Camera Stream */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#111827] via-[#1e1b4b] to-[#0f172a] flex flex-col items-center justify-center">
                {call.avatar && !call.avatar.includes('unsplash') ? (
                  <img
                    src={call.avatar}
                    alt={call.channelName}
                    className="w-24 h-24 rounded-full object-cover border-2 border-white/20 mb-3 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#7033F5] to-[#9061F9] text-white flex items-center justify-center text-3xl font-extrabold mb-3 shadow-lg">
                    {call.channelName ? call.channelName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-white/80 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Video Connected</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none"></div>

                {/* Remote Participant Label */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-semibold text-white">
                    {call.channelName}
                  </span>
                  <span className="text-[10px] text-white/60">• 1080p Campus HD</span>
                </div>
              </div>

              {/* Local Self PiP Camera Box */}
              <div className="absolute top-4 right-4 w-32 sm:w-44 h-44 sm:h-56 rounded-2xl overflow-hidden bg-black border-2 border-white/30 shadow-2xl z-20">
                {!isVideoOff ? (
                  <div className="relative w-full h-full bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#7033F5]/30 border border-[#7033F5]/60 flex items-center justify-center text-white text-sm font-bold mb-1">
                      You
                    </div>
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-bold text-white">
                      Live
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-white/60 p-2 text-center">
                    <VideoOff className="w-6 h-6 mb-1 text-white/40" />
                    <span className="text-[10px]">Camera Paused</span>
                  </div>
                )}
              </div>

              {isScreenSharing && (
                <div className="absolute top-4 left-4 bg-[#7033F5]/90 text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg border border-purple-300/40">
                  <MonitorUp className="w-3.5 h-3.5" />
                  <span>Presenting screen to channel</span>
                </div>
              )}
            </div>
          ) : (
            /* Audio Call Screen */
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              {/* Pulsing Avatar */}
              <div className="relative">
                {callStatus === 'ringing' ? (
                  <div className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping"></div>
                ) : (
                  <div className="absolute -inset-3 rounded-full bg-[#7033F5]/30 animate-pulse"></div>
                )}

                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl bg-[#7033F5] flex items-center justify-center">
                  {call.avatar && !call.avatar.includes('unsplash') ? (
                    <img
                      src={call.avatar}
                      alt={call.channelName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-extrabold text-white">
                      {call.channelName ? call.channelName.charAt(0).toUpperCase() : '⚡'}
                    </span>
                  )}
                </div>

                <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#121B22] flex items-center justify-center text-[11px]">
                  📞
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {call.channelName}
                </h2>
                <p className="text-xs text-white/70 mt-1">
                  {callStatus === 'ringing'
                    ? 'Univia Campus Audio Call • Calling...'
                    : 'HD Voice Encrypted Connection'}
                </p>
              </div>

              {/* Dynamic Audio Waveform */}
              {callStatus === 'connected' && (
                <div className="flex items-center gap-1.5 h-12 px-6 py-2 rounded-2xl bg-white/5 border border-white/10">
                  {waveHeights.map((h, i) => (
                    <span
                      key={i}
                      style={{ height: `${isMuted ? 8 : h}%` }}
                      className={`w-1.5 rounded-full transition-all duration-200 ${
                        isMuted ? 'bg-white/20' : 'bg-emerald-400'
                      }`}
                    ></span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="relative z-10 px-6 py-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-center gap-4 sm:gap-6">
          {/* Mute Mic */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 sm:p-4 rounded-2xl transition-all ${
              isMuted
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Video Toggle (if video call) */}
          {call.isVideo && (
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-3.5 sm:p-4 rounded-2xl transition-all ${
                isVideoOff
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          {/* Screen Share */}
          {call.isVideo && (
            <button
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-3.5 sm:p-4 rounded-2xl transition-all ${
                isScreenSharing
                  ? 'bg-[#7033F5] text-white hover:bg-[#5E22E2]'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              title="Share Screen"
            >
              <MonitorUp className="w-5 h-5" />
            </button>
          )}

          {/* Speaker Mute */}
          <button
            onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
            className={`p-3.5 sm:p-4 rounded-2xl transition-all ${
              isSpeakerMuted
                ? 'bg-amber-600 text-white'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
            title={isSpeakerMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Red End Call Button */}
          <button
            onClick={() => onEndCall(duration)}
            className="p-4 sm:px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all hover:scale-105"
            title="End Call"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="hidden sm:inline text-xs">End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
