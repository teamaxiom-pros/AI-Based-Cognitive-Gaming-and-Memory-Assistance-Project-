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
  Mic,
  BookOpen,
  Play,
  Share2,
} from 'lucide-react';

export const MemoryHubPage: React.FC = () => {
  const { people, places, albums, speakText, showToast, t, language } = useApp();

  const [activeTab, setActiveTab] = useState<'people' | 'places' | 'family' | 'photos' | 'voice'>('people');
  const [selectedPerson, setSelectedPerson] = useState<MemoryPerson | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPeople = people.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.relationship.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 5 Structured Categories Data
  const familyMilestones = [
    {
      id: 'fam-1',
      title: 'Bihu Festival Celebration with Family',
      year: '2023',
      description: 'The whole family gathered in Guwahati for Rongali Bihu. Rohan played the dhol, and Priya made pitha.',
      photoUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600&auto=format&fit=crop&q=80',
      tag: 'Family Tradition',
      audioStory: 'Remember the Rongali Bihu festival last year when everyone came home. Rohan was playing the dhol with such joy, and Priya prepared delicious sesame pitha for everyone.'
    },
    {
      id: 'fam-2',
      title: 'Rohan’s University Graduation in Jorhat',
      year: '2021',
      description: 'Grandson Rohan graduated with honors. You gifted him your silver pocket watch.',
      photoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
      tag: 'Milestone',
      audioStory: 'This was Rohan’s graduation day in Jorhat. You were so proud, standing next to him on stage in your traditional Eri chadar.'
    }
  ];

  const voiceStories = [
    {
      id: 'voice-1',
      speaker: 'Priya Sharma (Daughter)',
      title: 'Morning Garden Walk & Tea Recipe',
      duration: '0:45',
      transcript: 'Baba, remember to have your warm ginger tea after your morning walk. I will call you this afternoon at 4 PM.',
      date: 'Yesterday'
    },
    {
      id: 'voice-2',
      speaker: 'Rohan (Grandson)',
      title: 'Weekend Chess Game Reminiscence',
      duration: '1:10',
      transcript: 'Dadu, I am practicing the knight opening you taught me. Can’t wait for our chess game this Sunday!',
      date: '3 days ago'
    },
    {
      id: 'voice-3',
      speaker: 'Axiom Family Companion',
      title: 'Majuli Island Boat Journey Memory',
      duration: '1:30',
      transcript: 'In 1985, you traveled across the Brahmaputra River to Majuli Island during the winter sunset. The river was golden and calm.',
      date: 'Family Archive'
    }
  ];

  const handleHearFamilyMemoryPrompt = () => {
    const promptText = t('memory.hearStoryPrompt') || "Would you like to hear a family memory? Here is a cherished story from your daughter Priya.";
    speakText(`${promptText} "${voiceStories[0].transcript}"`);
    showToast(t('memory.playingVoiceStory') || 'Playing family voice memory...');
  };

  return (
    <PatientLayout pageTitle={t('memory.albumTitle')}>
      <div className="space-y-6 max-w-5xl mx-auto font-sans">
        {/* Top Header & Audio Prompt */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-teal-800 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-teal-100">
              <Heart size={14} className="text-rose-300" />
              {t('memory.albumTitle')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t('memory.albumTitle')}
            </h1>
            <p className="text-teal-100 text-sm sm:text-base leading-relaxed">
              {t('memory.subtitle')}
            </p>
          </div>

          <button
            onClick={handleHearFamilyMemoryPrompt}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-emerald-50 text-teal-900 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer flex-shrink-0"
          >
            <Volume2 size={20} className="text-emerald-700" />
            <span>{t('memory.hearStoryPrompt') || 'Hear Family Memory'}</span>
          </button>
        </div>

        {/* 5 Structured Category Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl overflow-x-auto">
          {[
            { id: 'people', label: t('memory.tabFamily', { count: people.length }) || `Family (${people.length})`, icon: Users },
            { id: 'places', label: t('memory.tabPlaces', { count: places.length }) || `Places (${places.length})`, icon: MapPin },
            { id: 'family', label: t('memory.tabStories') || 'Memory Stories', icon: Heart },
            { id: 'photos', label: t('memory.tabAlbums', { count: albums.length }) || `Albums (${albums.length})`, icon: ImageIcon },
            { id: 'voice', label: t('memory.tabVoice') || 'Voice Clips', icon: Mic },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-teal-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. PEOPLE (Family & Friends) */}
        {activeTab === 'people' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('memory.searchPlaceholder') || 'Search family members...'}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 text-sm sm:text-base font-semibold text-slate-900 shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPeople.map(person => (
                <div
                  key={person.id}
                  onClick={() => setSelectedPerson(person)}
                  className="bg-white hover:bg-teal-50/40 p-5 rounded-3xl border-2 border-slate-200/90 hover:border-teal-500 shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-4 group"
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
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1 truncate">
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

        {/* 2. PLACES (Familiar Locations in NER) */}
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

        {/* 3. FAMILY MEMORIES */}
        {activeTab === 'family' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {familyMilestones.map(milestone => (
              <Card key={milestone.id} className="p-0 overflow-hidden space-y-0">
                <img
                  src={milestone.photoUrl}
                  alt={milestone.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
                      {milestone.tag}
                    </span>
                    <span className="text-xs font-black text-slate-500">{milestone.year}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {milestone.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {milestone.description}
                  </p>
                  <div className="pt-2">
                    <SpeechSpeaker textToSpeak={milestone.audioStory} label="Listen to Memory" size="sm" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 4. PHOTOS & ALBUMS */}
        {activeTab === 'photos' && (
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
                    {album.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 5. VOICE MEMORIES & SPOKEN STORIES */}
        {activeTab === 'voice' && (
          <div className="space-y-4">
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                  <Mic size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Spoken Voice Archives</h4>
                  <p className="text-xs text-slate-600">Recorded voice clips from family members and memory cues</p>
                </div>
              </div>
              <button
                onClick={handleHearFamilyMemoryPrompt}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Play size={14} /> Play Story
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {voiceStories.map(story => (
                <div
                  key={story.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
                        {story.speaker}
                      </span>
                      <span className="text-xs text-slate-400">{story.date} • {story.duration}</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">{story.title}</h4>
                    <p className="text-xs text-slate-600 italic">"{story.transcript}"</p>
                  </div>

                  <SpeechSpeaker textToSpeak={`${story.speaker} says: ${story.transcript}`} label="Listen" size="md" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PERSON DETAIL MODAL */}
        {selectedPerson && (
          <Modal
            isOpen={!!selectedPerson}
            onClose={() => setSelectedPerson(null)}
            title={selectedPerson.name}
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
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
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

