import React, { useState } from 'react';
import { X, Briefcase, MapPin, DollarSign, Calendar, Check, Send } from 'lucide-react';
import { Opportunity } from '../types';

interface OpportunityModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
  onApply: (id: string, note?: string) => void;
  onToggleSave: (id: string) => void;
}

export const OpportunityModal: React.FC<OpportunityModalProps> = ({
  opportunity,
  onClose,
  onApply,
  onToggleSave,
}) => {
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!opportunity) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(opportunity.id, note);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-[#1E1929]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div
        id="opportunity-modal"
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-[#ECE4F6] shadow-2xl shadow-purple-950/15"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-[#F5F0FD] to-[#ECE4FB] border-b border-[#E3D9F3] relative">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#524B62] hover:text-[#211B33] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#7033F5] text-white shadow-xs inline-block mb-2">
            {opportunity.type}
          </span>

          <h2 className="text-xl font-extrabold text-[#211B33]">
            {opportunity.title}
          </h2>
          <p className="text-xs font-semibold text-[#5A2FB5] mt-1">
            {opportunity.organization}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 bg-[#F9F7FD] p-3.5 rounded-2xl border border-[#EDE7F5] text-xs">
            <div>
              <p className="text-[11px] text-[#7A728B] font-medium">Location</p>
              <p className="font-bold text-[#211B33]">{opportunity.location}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#7A728B] font-medium">Compensation</p>
              <p className="font-bold text-emerald-700">{opportunity.compensation}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#7A728B] font-medium">Application Deadline</p>
              <p className="font-bold text-[#211B33]">{opportunity.deadline}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#7A728B] font-medium">Status</p>
              <p className="font-bold text-[#7033F5]">
                {opportunity.hasApplied ? 'Application Sent' : 'Accepting Applications'}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#3B344D] uppercase tracking-wider mb-1.5">
              Role Details & Scope
            </h4>
            <p className="text-xs text-[#4A425B] leading-relaxed">
              {opportunity.description}
            </p>
          </div>

          {opportunity.hasApplied || submitted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <Check className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-emerald-900">Application Submitted!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                The student recruiter / lab lead will reach out via your Univia student email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#3B344D] mb-1">
                  Quick Intro / Statement of Interest (Optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tell them briefly about your background, relevant coursework, or enthusiasm..."
                  rows={3}
                  className="w-full p-3 text-xs bg-[#FBF9FE] border border-[#E4DAF3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7033F5]/25 focus:border-[#7033F5] text-[#211B33]"
                ></textarea>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => onToggleSave(opportunity.id)}
                  className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${
                    opportunity.isSaved
                      ? 'bg-[#F2EDFB] text-[#7033F5] border-[#D8C7F5]'
                      : 'bg-white text-[#665D7B] border-[#EDE4F6] hover:bg-[#F9F7FD]'
                  }`}
                >
                  {opportunity.isSaved ? '★ Bookmarked' : '☆ Save for Later'}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#7033F5] text-white hover:bg-[#5E22E2] transition-colors flex items-center gap-1.5 shadow-sm shadow-[#7033F5]/25"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Quick Application</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
