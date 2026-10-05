import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Check,
  RefreshCw,
  Search,
  Sparkles,
  Layers,
  GraduationCap,
  Briefcase,
  User,
  Images,
  Loader2,
  Globe,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { PortfolioData, ShowcaseItem, ProjectItem, EducationItem, ExperienceItem, GalleryItem } from '../../types/portfolio';
import { useAuth } from '../../context/AuthContext';

interface SectionMediaManagerProps {
  data: PortfolioData;
  onSaveSection: <K extends keyof PortfolioData>(
    section: K,
    value: PortfolioData[K]
  ) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

type SectionCategory = 'all' | 'showcase' | 'projects' | 'education' | 'experience' | 'hero_about' | 'gallery';

interface MediaEntry {
  id: string;
  category: 'showcase' | 'projects' | 'education' | 'experience' | 'hero' | 'about' | 'gallery';
  sectionLabel: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  currentUrl: string;
  defaultFallbackUrl: string;
  aspectRatio: string;
  aspectDesc: string;
}

const CURATED_PRESETS = [
  {
    name: 'Swarm Quadcopters in Flight',
    url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Swarm',
  },
  {
    name: 'Ground Control Telemetry Station',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    tag: 'GCS',
  },
  {
    name: 'Autonomous Interceptor Drone',
    url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=80',
    tag: 'Aerospace',
  },
  {
    name: 'Precision Visual Landing Target',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    tag: 'Autonomy',
  },
  {
    name: 'Autonomous Emergency Delivery UAV',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    tag: 'Payload',
  },
  {
    name: 'SITL ROS & Gazebo Robotics Lab',
    url: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Simulation',
  },
  {
    name: 'Carbon Fiber Frame & Motors',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    tag: 'Hardware',
  },
  {
    name: 'Long-Range Aerial Platform',
    url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1200&q=80',
    tag: 'UAV',
  },
  {
    name: 'Embedded Avionics Circuit Board',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    tag: 'Electronics',
  },
  {
    name: 'University Campus & Engineering Academy',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
    tag: 'Education',
  },
  {
    name: 'Robotics Engineering Teamwork',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    tag: 'Team',
  },
  {
    name: 'Autonomous Ground Vehicle Deck',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    tag: 'Robotics',
  },
];

export const SectionMediaManager: React.FC<SectionMediaManagerProps> = ({
  data,
  onSaveSection,
  onShowToast,
}) => {
  const { token } = useAuth();
  const [activeCategory, setActiveCategory] = useState<SectionCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUrlId, setEditingUrlId] = useState<string | null>(null);
  const [urlDrafts, setUrlDrafts] = useState<Record<string, string>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [presetModalId, setPresetModalId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUploadTargetRef = useRef<MediaEntry | null>(null);

  // Default fallback showcase slides if empty
  const defaultShowcaseSlides: ShowcaseItem[] = [
    {
      id: 'showcase-vslam',
      title: 'A Review of Visual & Visual-Inertial SLAM in Dynamic UAV Environments',
      subtitle: 'SEECS NUST Technical Review Paper & FYP Trajectory',
      date: '2026',
      category: 'Research & Autonomy',
      organization: 'SEECS — NUST (Advised by Dr. Moazzam Ali & Muhammad Saad Zia)',
      summary: 'Synthesized 27 recent papers on GPS-denied VI-SLAM, categorizing detection-based, geometry-based, and semantic-geometric frameworks running on sub-2 kg UAV compute budgets.',
      mediaUrl: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=1200&q=80',
      highlights: [],
      technologies: [],
    },
    {
      id: 'showcase-maverick',
      title: 'maverick_.tech — High-Velocity Beta Systems Lab',
      subtitle: 'Sub-Startup of AeroMavericks Technologies',
      date: '2026',
      category: 'Startup & AI Products',
      organization: 'maverick_.tech / AeroMavericks Technologies',
      summary: 'Founded maverick_.tech to architect rapid beta systems for modern challenges. Built and deployed LawerAI (legal intelligence) and Sasta Dawa Finder (medicine price transparency).',
      mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      highlights: [],
      technologies: [],
    },
    {
      id: 'showcase-1',
      title: 'Decentralized Multi-UAV Swarm Formation Control',
      subtitle: 'Research & Field Deployment',
      date: '2025 – 2026',
      category: 'Swarm Systems',
      organization: 'CSN Lab, NUST & INTELGENCY',
      summary: 'Decentralized flocking and multi-agent coordination protocols for autonomous quadcopters.',
      mediaUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
      highlights: [],
      technologies: [],
    },
    {
      id: 'showcase-2',
      title: 'Custom Ground Control Station for Multi-UAV Swarms',
      subtitle: 'Avionics & Telemetry Command Interface',
      date: '2025 – 2026',
      category: 'GCS',
      organization: 'Team AeroMavericks',
      summary: 'MAVLink-integrated ground control application with real-time waypoint dispatching.',
      mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      highlights: [],
      technologies: [],
    },
    {
      id: 'showcase-3',
      title: 'Dynamic Precision UAV Landing on Moving Autonomous USV',
      subtitle: 'Teknofest Turkey 2025 Finalist Project',
      date: '2025',
      category: 'Teknofest',
      organization: 'Team Vitesse — Teknofest Turkey',
      summary: 'Autonomous visual servoing and precision landing pipeline enabling hexacopter tracking on USV.',
      mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      highlights: [],
      technologies: [],
    },
    {
      id: 'showcase-4',
      title: 'Autonomous Anti-Drone Interceptor UAV Platform',
      subtitle: 'Teknofest Turkey 2024 Finalist Project',
      date: '2024',
      category: 'Aerospace',
      organization: 'Team Vitesse — Teknofest Turkey',
      summary: 'High-speed avionics and computer vision guidance loops for aerial interceptor quadcopter.',
      mediaUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=80',
      highlights: [],
      technologies: [],
    },
    {
      id: 'showcase-5',
      title: 'Medical Sample Autonomous Delivery & Recovery UAV',
      subtitle: 'National Aerothon ’25 — 3rd Overall & Swift Wing Award',
      date: '2025',
      category: 'Aerothon',
      organization: 'Team AeroMavericks',
      summary: 'Autonomous disaster-relief UAV system with custom payload winch and GPS precision.',
      mediaUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
      highlights: [],
      technologies: [],
    },
    {
      id: 'showcase-6',
      title: 'Software-in-the-Loop (SITL) Gazebo & ArduPilot Simulation',
      subtitle: 'Digital Twin Robotics Framework',
      date: '2025 – 2026',
      category: 'Research',
      organization: 'CSN Lab, SEECS — NUST',
      summary: 'Digital twin testing environments in Gazebo and ROS for multi-rotor dynamics simulation.',
      mediaUrl: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=1200&q=80',
      highlights: [],
      technologies: [],
    },
  ];

  const currentShowcase = data.showcase && data.showcase.length > 0 ? data.showcase : defaultShowcaseSlides;

  // Build unified media entries list
  const entries: MediaEntry[] = [
    // 1. Showcase Carousel Slides
    ...currentShowcase.map((s, idx) => ({
      id: s.id,
      category: 'showcase' as const,
      sectionLabel: `Showcase (Slide ${idx + 1})`,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      title: s.title,
      subtitle: `${s.category} • ${s.organization}`,
      currentUrl: s.mediaUrl || defaultShowcaseSlides[idx]?.mediaUrl || '',
      defaultFallbackUrl: defaultShowcaseSlides[idx]?.mediaUrl || '',
      aspectRatio: 'aspect-video',
      aspectDesc: '16:9 Banner (Showcase Carousel & Detail Modal)',
    })),

    // 2. Projects (9 CV Projects)
    ...data.projects.map((p, idx) => {
      const fallbackList = [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      ];
      const fallback = fallbackList[idx % fallbackList.length];
      return {
        id: p.id,
        category: 'projects' as const,
        sectionLabel: `Projects (Card ${idx + 1})`,
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        title: p.title,
        subtitle: `${p.category} • ${p.projectDate}`,
        currentUrl: p.projectImage || fallback,
        defaultFallbackUrl: fallback,
        aspectRatio: 'aspect-video',
        aspectDesc: '16:9 Wide Cover (Master Carousel & Grid Cards)',
      };
    }),

    // 3. Education Cards
    ...data.education.map((edu, idx) => {
      const eduFallbacks = [
        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
      ];
      const fallback = eduFallbacks[idx % eduFallbacks.length];
      return {
        id: edu.id,
        category: 'education' as const,
        sectionLabel: `Education (Card ${idx + 1})`,
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        title: edu.institution,
        subtitle: `${edu.degree} (${edu.startDate} – ${edu.endDate})`,
        currentUrl: edu.image || fallback,
        defaultFallbackUrl: fallback,
        aspectRatio: 'aspect-[3/2]',
        aspectDesc: '3:2 Frosted Glass Card Background',
      };
    }),

    // 4. Experience Cards
    ...data.experience.map((exp, idx) => {
      const expFallbacks = [
        'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800&q=80',
      ];
      const fallback = expFallbacks[idx % expFallbacks.length];
      return {
        id: exp.id,
        category: 'experience' as const,
        sectionLabel: `Experience (Card ${idx + 1})`,
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        title: exp.company,
        subtitle: `${exp.position} • ${exp.startDate} – ${exp.endDate}`,
        currentUrl: exp.image || fallback,
        defaultFallbackUrl: fallback,
        aspectRatio: 'aspect-[3/2]',
        aspectDesc: '3:2 Frosted Glass Card Background',
      };
    }),

    // 5. Hero & About Profile Avatars
    {
      id: 'hero-avatar',
      category: 'hero' as const,
      sectionLabel: 'Hero Section (Profile Photo)',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      title: data.hero.name || 'Hero Profile Photo',
      subtitle: data.hero.title || 'Headline & Introduction',
      currentUrl: data.hero.profileImage || '',
      defaultFallbackUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      aspectRatio: 'aspect-square',
      aspectDesc: '1:1 Square Portrait / Avatar',
    },
    {
      id: 'about-avatar',
      category: 'about' as const,
      sectionLabel: 'About Section (Profile Photo)',
      badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
      title: 'About Bio Profile Image',
      subtitle: data.about.sectionTitle || 'Engineering Background',
      currentUrl: data.about.profileImage || '',
      defaultFallbackUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      aspectRatio: 'aspect-square',
      aspectDesc: '1:1 Square Portrait / Bio Photo',
    },

    // 6. Visual Gallery (CV Images)
    ...(data.gallery || []).map((g, idx) => ({
      id: g.id,
      category: 'gallery' as const,
      sectionLabel: `Visual Gallery (Item ${idx + 1})`,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      title: g.title,
      subtitle: `${g.category} • ${g.caption || 'Verified Flight & Hardware Archive'}`,
      currentUrl: g.imageUrl,
      defaultFallbackUrl: g.imageUrl,
      aspectRatio: 'aspect-video',
      aspectDesc: '16:9 High-Resolution Flight Photography',
    })),
  ];

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    if (activeCategory === 'showcase' && entry.category !== 'showcase') return false;
    if (activeCategory === 'projects' && entry.category !== 'projects') return false;
    if (activeCategory === 'education' && entry.category !== 'education') return false;
    if (activeCategory === 'experience' && entry.category !== 'experience') return false;
    if (activeCategory === 'hero_about' && entry.category !== 'hero' && entry.category !== 'about') return false;
    if (activeCategory === 'gallery' && entry.category !== 'gallery') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = entry.title.toLowerCase().includes(q);
      const matchSub = entry.subtitle.toLowerCase().includes(q);
      const matchSec = entry.sectionLabel.toLowerCase().includes(q);
      return matchTitle || matchSub || matchSec;
    }
    return true;
  });

  // Apply new URL to item and persist
  const applyPictureUpdate = async (entry: MediaEntry, newUrl: string) => {
    const cleanUrl = newUrl.trim();
    if (!cleanUrl) {
      onShowToast('error', 'Please provide a valid image URL');
      return;
    }

    try {
      if (entry.category === 'showcase') {
        const nextShowcase = currentShowcase.map((s) =>
          s.id === entry.id ? { ...s, mediaUrl: cleanUrl } : s
        );
        const res = await onSaveSection('showcase', nextShowcase);
        if (res.success) {
          onShowToast('success', `Updated picture for "${entry.title}"!`);
        } else {
          onShowToast('error', res.error || 'Failed to update showcase picture');
        }
      } else if (entry.category === 'projects') {
        const nextProjects = data.projects.map((p) =>
          p.id === entry.id ? { ...p, projectImage: cleanUrl } : p
        );
        const res = await onSaveSection('projects', nextProjects);
        if (res.success) {
          onShowToast('success', `Updated picture for "${entry.title}"!`);
        } else {
          onShowToast('error', res.error || 'Failed to update project picture');
        }
      } else if (entry.category === 'education') {
        const nextEducation = data.education.map((edu) =>
          edu.id === entry.id ? { ...edu, image: cleanUrl } : edu
        );
        const res = await onSaveSection('education', nextEducation);
        if (res.success) {
          onShowToast('success', `Updated picture for "${entry.title}"!`);
        } else {
          onShowToast('error', res.error || 'Failed to update education picture');
        }
      } else if (entry.category === 'experience') {
        const nextExperience = data.experience.map((exp) =>
          exp.id === entry.id ? { ...exp, image: cleanUrl } : exp
        );
        const res = await onSaveSection('experience', nextExperience);
        if (res.success) {
          onShowToast('success', `Updated picture for "${entry.title}"!`);
        } else {
          onShowToast('error', res.error || 'Failed to update experience picture');
        }
      } else if (entry.category === 'hero') {
        const nextHero = { ...data.hero, profileImage: cleanUrl };
        const res = await onSaveSection('hero', nextHero);
        if (res.success) {
          onShowToast('success', 'Updated Hero profile photo!');
        } else {
          onShowToast('error', res.error || 'Failed to update hero photo');
        }
      } else if (entry.category === 'about') {
        const nextAbout = { ...data.about, profileImage: cleanUrl };
        const res = await onSaveSection('about', nextAbout);
        if (res.success) {
          onShowToast('success', 'Updated About profile photo!');
        } else {
          onShowToast('error', res.error || 'Failed to update about photo');
        }
      } else if (entry.category === 'gallery') {
        const nextGallery = (data.gallery || []).map((g) =>
          g.id === entry.id ? { ...g, imageUrl: cleanUrl } : g
        );
        const res = await onSaveSection('gallery', nextGallery);
        if (res.success) {
          onShowToast('success', `Updated picture for gallery item!`);
        } else {
          onShowToast('error', res.error || 'Failed to update gallery photo');
        }
      }

      setEditingUrlId(null);
      setPresetModalId(null);
    } catch (err: any) {
      onShowToast('error', err.message || 'Error updating picture');
    }
  };

  // Trigger file browser for direct image upload
  const triggerFileUpload = (entry: MediaEntry) => {
    currentUploadTargetRef.current = entry;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Handle uploaded file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = currentUploadTargetRef.current;
    if (!file || !target) return;

    if (file.size > 20 * 1024 * 1024) {
      onShowToast('error', 'File size exceeds maximum 20MB limit');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploadingId(target.id);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const resJson = await res.json();
      if (res.ok && resJson.success) {
        const uploadedUrl = resJson.media.url;
        await applyPictureUpdate(target, uploadedUrl);
        onShowToast('success', `File "${file.name}" uploaded & applied to ${target.sectionLabel}!`);
      } else {
        onShowToast('error', resJson.error || 'Upload failed');
      }
    } catch (err: any) {
      onShowToast('error', err.message || 'Upload error');
    } finally {
      setUploadingId(null);
      currentUploadTargetRef.current = null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Direct Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#0B0F1C] border border-[#1E293B] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
              <Camera className="w-4 h-4" />
              <span>FRONTEND VISUAL ASSETS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-sans tracking-tight">
              Section Pictures & Media Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-mono">
              Easily change, upload, and update the photos and card cover pictures displayed on each section of your frontend website.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-cyan-950/40 border border-cyan-500/30 px-3.5 py-2 rounded-xl text-cyan-300">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Instant sync to live site</span>
          </div>
        </div>

        {/* Section Category Filters */}
        <div className="mt-6 pt-5 border-t border-[#1E293B]/70 flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Sections', count: entries.length, icon: Sliders },
            { id: 'showcase', label: 'Showcase Carousel', count: currentShowcase.length, icon: Sparkles },
            { id: 'projects', label: 'Projects (9 CV)', count: data.projects.length, icon: Layers },
            { id: 'education', label: 'Education Cards', count: data.education.length, icon: GraduationCap },
            { id: 'experience', label: 'Experience Cards', count: data.experience.length, icon: Briefcase },
            { id: 'hero_about', label: 'Profile & Avatars', count: 2, icon: User },
            { id: 'gallery', label: 'Visual Gallery', count: (data.gallery || []).length, icon: Images },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as SectionCategory)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                    : 'bg-[#10172A] text-slate-400 hover:text-slate-100 hover:bg-[#16213D] border border-[#1E293B]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-slate-950 text-cyan-300 font-bold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search bar */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by card title, organization, or section..."
            className="w-full pl-10 pr-4 py-2 bg-[#090D18] border border-[#1E293B] rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition"
          />
        </div>
      </div>

      {/* Grid of Section Picture Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredEntries.map((entry) => {
          const isUploading = uploadingId === entry.id;
          const isEditingUrl = editingUrlId === entry.id;
          const isPresetsOpen = presetModalId === entry.id;
          const currentDraft = urlDrafts[entry.id] ?? entry.currentUrl;

          return (
            <div
              key={entry.id}
              className="rounded-2xl bg-[#0B0F1C] border border-[#1E293B] hover:border-slate-700 transition flex flex-col overflow-hidden shadow-lg group"
            >
              {/* Picture Thumbnail Preview */}
              <div className={`relative w-full ${entry.aspectRatio} bg-slate-950 overflow-hidden`}>
                {entry.currentUrl ? (
                  <img
                    src={entry.currentUrl}
                    alt={entry.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      // Fallback on broken image link
                      (e.target as HTMLImageElement).src = entry.defaultFallbackUrl;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-900/60 p-4 text-center">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs font-mono">No picture assigned</span>
                  </div>
                )}

                {/* Section Badge Overlay */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold backdrop-blur-md ${entry.badgeColor}`}
                  >
                    {entry.sectionLabel}
                  </span>
                </div>

                {/* Aspect ratio guide */}
                <div className="absolute bottom-2.5 left-2.5 z-10">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black/70 text-slate-300 backdrop-blur-xs">
                    {entry.aspectDesc}
                  </span>
                </div>

                {/* Loading Spinner during direct upload */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center text-cyan-400 z-20">
                    <Loader2 className="w-7 h-7 animate-spin mb-2" />
                    <span className="text-xs font-mono font-bold tracking-wider">UPLOADING IMAGE...</span>
                  </div>
                )}

                {/* External link button */}
                {entry.currentUrl && (
                  <a
                    href={entry.currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 text-slate-300 hover:text-white backdrop-blur-xs transition z-10"
                    title="Open full image in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Card Meta & Actions */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-sans line-clamp-1">
                    {entry.title}
                  </h3>
                  <p className="text-[11px] font-mono text-cyan-400/90 line-clamp-1 mt-0.5">
                    {entry.subtitle}
                  </p>
                </div>

                {/* Direct Action Buttons */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* 1. Direct Upload Button */}
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => triggerFileUpload(entry)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5 shrink-0" />
                      <span>Upload File</span>
                    </button>

                    {/* 2. Choose from Curated Presets */}
                    <button
                      type="button"
                      onClick={() => {
                        setPresetModalId(isPresetsOpen ? null : entry.id);
                        setEditingUrlId(null);
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#16213D] hover:bg-[#1E2E55] text-cyan-300 border border-cyan-500/30 text-xs font-mono font-medium transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Pick Preset</span>
                    </button>
                  </div>

                  {/* 3. URL Toggle / Quick Edit */}
                  <div className="pt-1">
                    {isEditingUrl ? (
                      <div className="space-y-2 p-2.5 rounded-xl bg-[#070A12] border border-cyan-500/40">
                        <label className="block text-[10px] font-mono text-cyan-400 uppercase font-bold">
                          Image URL / Direct Link
                        </label>
                        <input
                          type="text"
                          value={currentDraft}
                          onChange={(e) =>
                            setUrlDrafts((prev) => ({ ...prev, [entry.id]: e.target.value }))
                          }
                          placeholder="https://... or /uploads/..."
                          className="w-full px-2.5 py-1.5 bg-[#0D1220] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                        />
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingUrlId(null)}
                            className="px-2.5 py-1 text-[11px] font-mono text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => applyPictureUpdate(entry, currentDraft)}
                            className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] font-mono rounded-lg transition"
                          >
                            Save URL
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUrlId(entry.id);
                          setPresetModalId(null);
                          setUrlDrafts((prev) => ({ ...prev, [entry.id]: entry.currentUrl }));
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#070A12] hover:bg-[#0E1526] border border-[#1E293B] text-[11px] font-mono text-slate-400 hover:text-slate-200 transition text-left"
                      >
                        <span className="truncate pr-2">
                          {entry.currentUrl ? entry.currentUrl : 'Paste custom image URL...'}
                        </span>
                        <span className="text-[10px] text-cyan-400 shrink-0 font-semibold underline">
                          Edit URL
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Preset Selector Popover */}
                  {isPresetsOpen && (
                    <div className="p-3 rounded-xl bg-[#070A12] border border-cyan-500/40 space-y-2 mt-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 font-bold">
                        <span>Select Aerospace / Robotics Photography:</span>
                        <button
                          onClick={() => setPresetModalId(null)}
                          className="text-slate-500 hover:text-white text-xs"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {CURATED_PRESETS.map((preset, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => applyPictureUpdate(entry, preset.url)}
                            className="group/preset flex flex-col text-left rounded-lg overflow-hidden border border-[#1E293B] hover:border-cyan-500 bg-[#0D1220] transition p-1"
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-full h-14 object-cover rounded mb-1"
                            />
                            <div className="text-[10px] font-sans font-semibold text-slate-200 line-clamp-1">
                              {preset.name}
                            </div>
                            <div className="text-[9px] font-mono text-cyan-400">
                              {preset.tag}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reset to Default Picture */}
                  {entry.currentUrl !== entry.defaultFallbackUrl && entry.defaultFallbackUrl && (
                    <button
                      type="button"
                      onClick={() => applyPictureUpdate(entry, entry.defaultFallbackUrl)}
                      className="w-full text-center text-[10px] font-mono text-slate-500 hover:text-slate-300 transition py-1"
                    >
                      Reset to default picture
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEntries.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-[#0B0F1C] border border-[#1E293B]">
          <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold font-mono text-slate-300">No matching section pictures</h3>
          <p className="text-xs font-mono text-slate-500 mt-1">
            Try adjusting your search query or switching categories.
          </p>
        </div>
      )}
    </div>
  );
};
