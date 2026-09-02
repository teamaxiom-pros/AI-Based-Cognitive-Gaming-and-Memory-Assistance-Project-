import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PatientLayout } from '../../components/layout/PatientLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { SpeechSpeaker } from '../../components/common/SpeechSpeaker';
import { MemoryPerson, MemoryPlace, MemoryAlbumItem } from '../../types';
import {
  Users,
  MapPin,
  Image as ImageIcon,
  Phone,
  Volume2,
  Heart,
  Calendar,
  Sparkles,
  Search,
} from 'lucide-react';

export const MemoryHubPage: React.FC = () => {
  const { people, places, albums, speakText, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'people' | 'places' | 'albums'>('people');
  const [selectedPerson, setSelectedPerson] = useState<MemoryPerson | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPeople = people.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.relationship.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PatientLayout pageTitle="Memory Assistance Book">
      <div className="space-y-6">
        {/* Top Header & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              My Memory Book
            </h1>
            <p className="text-slate-600 font-medium text-sm sm:text-base mt-0.5">
              Cherished family members, familiar places, and life stories.
            </p>
          </div>
          <SpeechSpeaker textToSpeak="Welcome to your memory book. You can browse your family members, favorite places in Assam, and photo albums." />
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl max-w-md">
          <button
            onClick={() => setActiveTab('people')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'people'
                ? 'bg-white text-teal-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={18} /> Family ({people.length})
          </button>
          <button
            onClick={() => setActiveTab('places')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'places'
                ? 'bg-white text-teal-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin size={18} /> Places ({places.length})
          </button>
          <button
            onClick={() => setActiveTab('albums')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'albums'
                ? 'bg-white text-teal-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon size={18} /> Albums ({albums.length})
          </button>
        </div>

        {/* TAB 1: FAMILY & FRIENDS */}
        {activeTab === 'people' && (
          <div className="space-y-4">
            {/* Search bar & Quick Family Quiz */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Who are you looking for? (e.g. Priya, Son, Rohan)"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 text-base font-semibold text-slate-900 shadow-xs"
                />
              </div>
              <button
                onClick={() => {
                  setSelectedPerson(people[0]);
                  showToast('Opened Priya Sharma profile with audio note.');
                }}
                className="px-4 py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Sparkles size={16} /> Familiar Faces Quiz
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPeople.map(person => (
                <div
                  key={person.id}
                  onClick={() => setSelectedPerson(person)}
                  className="bg-white hover:bg-teal-50/40 p-5 rounded-3xl border-2 border-slate-200/90 hover:border-teal-500 shadow-soft transition-all duration-200 cursor-pointer flex items-center gap-4 group"
                >
                  <img
                    src={person.photoUrl}
                    alt={person.name}
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-teal-500/50 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-teal-800 bg-teal-100/70 px-2.5 py-0.5 rounded-full">
                      {person.relationship}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-1 truncate">
                      {person.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      {person.location}
                    </p>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {person.recentInteraction}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: FAMILIAR PLACES IN NER */}
        {activeTab === 'places' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {places.map(place => (
              <Card key={place.id} className="p-0 overflow-hidden space-y-0">
                <img
                  src={place.photoUrl}
                  alt={place.name}
                  className="w-full h-44 object-cover"
                />
                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-teal-700 font-bold">
                    <MapPin size={14} /> {place.location}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {place.name}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {place.description}
                  </p>
                  <div className="pt-2">
                    <SpeechSpeaker textToSpeak={`${place.name}. ${place.description}`} label="Listen to Story" size="sm" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 3: LIFE ALBUMS */}
        {activeTab === 'albums' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {albums.map(album => (
              <Card key={album.id} className="p-0 overflow-hidden space-y-0">
                <img
                  src={album.photoUrl}
                  alt={album.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5 space-y-2">
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Year {album.year}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {album.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {album.description}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {album.tags.map(t => (
                      <span key={t} className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* PERSON DETAIL MODAL */}
        {selectedPerson && (
          <Modal
            isOpen={!!selectedPerson}
            onClose={() => setSelectedPerson(null)}
            title="Family Member Profile"
          >
            <div className="space-y-6 text-center">
              <img
                src={selectedPerson.photoUrl}
                alt={selectedPerson.name}
                className="w-32 h-32 rounded-3xl object-cover mx-auto ring-4 ring-teal-500 shadow-lg"
              />

              <div>
                <span className="text-sm font-bold text-teal-800 bg-teal-100 px-3.5 py-1 rounded-full">
                  {selectedPerson.relationship}
                </span>
                <h2 className="text-3xl font-black text-slate-900 mt-2">
                  {selectedPerson.name}
                </h2>
                <p className="text-sm text-slate-500 font-medium">{selectedPerson.location}</p>
              </div>

              {/* Audio Voice Note Card */}
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Volume2 size={16} /> Spoken Memory Note
                  </span>
                  <SpeechSpeaker
                    textToSpeak={selectedPerson.audioTranscription}
                    label="Play Voice"
                    size="sm"
                  />
                </div>
                <p className="text-sm text-slate-700 font-medium italic">
                  "{selectedPerson.audioTranscription}"
                </p>
              </div>

              {/* Memory Notes */}
              <div className="text-left bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 font-medium space-y-1">
                <div><strong>Memory Cue:</strong> {selectedPerson.notes}</div>
                <div><strong>Recent Visit:</strong> {selectedPerson.recentInteraction}</div>
              </div>

              {/* Call Action */}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  fullWidth
                  onClick={() => showToast(`Calling ${selectedPerson.name} at ${selectedPerson.phone}...`)}
                  icon={<Phone size={20} />}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Call {selectedPerson.name.split(' ')[0]}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </PatientLayout>
  );
};
