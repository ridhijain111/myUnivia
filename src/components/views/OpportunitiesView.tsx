import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Bookmark,
  DollarSign,
  MapPin,
  Calendar,
  Filter,
  Check,
  Building,
  X,
  Plus,
  Briefcase,
} from 'lucide-react';
import { Opportunity } from '../../types';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  onSelectOpportunity: (opp: Opportunity) => void;
  onToggleOpportunitySave: (id: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  onAddOpportunity?: (newOpp: Opportunity) => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  onSelectOpportunity,
  onToggleOpportunitySave,
  searchQuery = '',
  onSearchQueryChange,
  onAddOpportunity,
}) => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [savedOnly, setSavedOnly] = useState<boolean>(false);

  // Add Opportunity Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newOrg, setNewOrg] = useState<string>('');
  const [newType, setNewType] = useState<Opportunity['type']>('Internship');
  const [newLocation, setNewLocation] = useState<string>('Campus / Hybrid');
  const [newComp, setNewComp] = useState<string>('Stipend / Paid');
  const [newDeadline, setNewDeadline] = useState<string>('Sept 30, 2026');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newTags, setNewTags] = useState<string>('Tech, Research');
  const [formError, setFormError] = useState<string>('');

  const handleCreateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newOrg.trim() || !newDesc.trim()) {
      setFormError('Title, organization, and description are required.');
      return;
    }

    const created: Opportunity = {
      id: `opp-${Date.now()}`,
      title: newTitle.trim(),
      organization: newOrg.trim(),
      type: newType,
      location: newLocation.trim() || 'Campus',
      compensation: newComp.trim() || 'Unpaid / Certificate',
      deadline: newDeadline.trim() || 'Rolling',
      description: newDesc.trim(),
      tags: newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      isSaved: false,
      hasApplied: false,
    };

    if (onAddOpportunity) {
      onAddOpportunity(created);
    }
    setNewTitle('');
    setNewOrg('');
    setNewDesc('');
    setFormError('');
    setIsAddModalOpen(false);
  };

  const activeSearch = searchQuery !== undefined && onSearchQueryChange ? searchQuery : localSearch;

  const handleSearchChange = (val: string) => {
    if (onSearchQueryChange) {
      onSearchQueryChange(val);
    } else {
      setLocalSearch(val);
    }
  };

  const types = ['All', 'Research', 'Campus Job', 'Internship', 'Grant'];

  const filtered = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchesType = selectedType === 'All' || opp.type === selectedType;
      const matchesSaved = !savedOnly || opp.isSaved;
      if (!matchesType || !matchesSaved) return false;

      if (activeSearch.trim()) {
        const q = activeSearch.toLowerCase().trim();
        const searchPool = [
          opp.title,
          opp.organization,
          opp.description,
          opp.type,
          opp.location,
          opp.compensation,
          ...(opp.tags || []),
        ]
          .join(' ')
          .toLowerCase();

        return searchPool.includes(q);
      }
      return true;
    });
  }, [opportunities, selectedType, savedOnly, activeSearch]);

  return (
    <div id="univia-opportunities-view" className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B33]">
            Student Opportunities & Research
          </h1>
          <p className="text-xs text-[#766E87] mt-1">
            Paid undergraduate research, faculty labs, verified campus jobs, and internships.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSavedOnly(!savedOnly)}
            className={`text-xs px-3.5 py-2 rounded-xl font-bold border transition-colors flex items-center gap-1.5 self-start sm:self-auto ${
              savedOnly
                ? 'bg-[#F2EDFB] text-[#7033F5] border-[#D4C3F2]'
                : 'bg-white text-[#635B74] border-[#EDE7F5] hover:bg-[#FAF8FE]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{savedOnly ? 'Showing Saved' : 'My Saved Opportunities'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#7033F5] hover:bg-[#5E22E2] text-white text-xs font-bold transition-all shadow-md shadow-[#7033F5]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post Opportunity</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EDE7F5] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#9186A4] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={activeSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by role, faculty lab, company..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-[#FAF8FE] border border-[#E7DDF4] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
          />
          {activeSearch && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[#9186A4] hover:text-[#211B33]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-colors shrink-0 ${
                selectedType === t
                  ? 'bg-[#7033F5] text-white shadow-xs'
                  : 'bg-[#F4EFFB] text-[#554C68] hover:bg-[#EAE2F7]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-[#DDD2F3] p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F6F0FD] text-[#7033F5] mx-auto flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#211B33]">
            {savedOnly ? 'No Saved Opportunities' : 'No Opportunities Found'}
          </h3>
          <p className="text-xs text-[#7B738C] max-w-md mx-auto">
            {savedOnly
              ? 'Bookmark internships and research posts to track them here.'
              : 'Post the first campus internship, laboratory research position, or scholarship role.'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7033F5] text-white text-xs font-bold hover:bg-[#5E22E2] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post Opportunity</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-3xl border border-[#EDE7F5] p-6 hover:border-[#D5C4F2] transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EFEBFA] text-[#7033F5] border border-[#DDD3F3]">
                    {opp.type}
                  </span>

                  <button
                    onClick={() => onToggleOpportunitySave(opp.id)}
                    className={`p-2 rounded-xl border transition-colors ${
                      opp.isSaved
                        ? 'bg-[#F2EDFB] text-[#7033F5] border-[#D9C8F5]'
                        : 'bg-white text-[#7B738C] border-[#EDE7F5] hover:bg-[#FAF8FE]'
                    }`}
                    title={opp.isSaved ? 'Saved' : 'Save opportunity'}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>

                <h3
                  onClick={() => onSelectOpportunity(opp)}
                  className="text-base font-bold text-[#211B33] hover:text-[#7033F5] cursor-pointer transition-colors"
                >
                  {opp.title}
                </h3>

                <p className="text-xs font-semibold text-[#5A2FB5] mt-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>{opp.organization}</span>
                </p>

                <p className="text-xs text-[#524A63] mt-2 line-clamp-2 leading-relaxed">
                  {opp.description}
                </p>

                <div className="mt-4 p-3 bg-[#FAF8FE] rounded-2xl border border-[#EDE7F5] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#7A728C]">Compensation:</span>
                    <span className="font-bold text-emerald-700">
                      {opp.compensation}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#7A728C]">Location:</span>
                    <span className="text-[#322C41] font-medium">
                      {opp.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#7A728C]">Deadline:</span>
                    <span className="text-[#322C41] font-medium">
                      {opp.deadline}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-[#F5F0FB] flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {(opp.tags || []).slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#F4EEFA] text-[#69607B]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => onSelectOpportunity(opp)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    opp.hasApplied
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-[#7033F5] text-white hover:bg-[#5E22E2] shadow-xs'
                  }`}
                >
                  {opp.hasApplied ? 'Applied ✓' : 'View & Apply'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: POST OPPORTUNITY */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#E2D5F5] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F0EAF8] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F4EEFB] text-[#7033F5] flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-[#211B33]">
                  Post Student Opportunity
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl hover:bg-[#F3EEFB] text-[#786E8C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateOpportunity} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#352E47] block mb-1">
                  Opportunity Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. AI Research Assistant / Frontend Intern"
                  className="w-full px-3 py-2 rounded-xl border border-[#DDD0F4] bg-[#FAF8FE] focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#352E47] block mb-1">
                    Organization / Lab *
                  </label>
                  <input
                    type="text"
                    value={newOrg}
                    onChange={(e) => setNewOrg(e.target.value)}
                    placeholder="e.g. Dept of CSE / Univia Labs"
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD0F4] bg-[#FAF8FE] focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-[#352E47] block mb-1">
                    Category Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as Opportunity['type'])}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD0F4] bg-[#FAF8FE] focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  >
                    <option value="Internship">Internship</option>
                    <option value="Research">Research</option>
                    <option value="Campus Job">Campus Job</option>
                    <option value="Grant">Grant</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#352E47] block mb-1">
                    Location / Mode
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Campus Lab / Remote"
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD0F4] bg-[#FAF8FE] focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#352E47] block mb-1">
                    Compensation / Stipend
                  </label>
                  <input
                    type="text"
                    value={newComp}
                    onChange={(e) => setNewComp(e.target.value)}
                    placeholder="e.g. ₹15,000/mo / Certificate"
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD0F4] bg-[#FAF8FE] focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#352E47] block mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="text"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    placeholder="e.g. Sept 30, 2026"
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD0F4] bg-[#FAF8FE] focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#352E47] block mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="e.g. AI, Python, Lab"
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD0F4] bg-[#FAF8FE] focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#352E47] block mb-1">
                  Description &amp; Key Details *
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  placeholder="Outline expectations, student eligibility, or how to apply..."
                  className="w-full px-3 py-2 rounded-xl border border-[#DDD0F4] bg-[#FAF8FE] focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0EAF8]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DDD0F4] hover:bg-[#F8F6FD] font-bold text-[#625974] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#7033F5] hover:bg-[#5E22E2] text-white font-bold transition-all shadow-md shadow-[#7033F5]/20 cursor-pointer"
                >
                  Publish Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
