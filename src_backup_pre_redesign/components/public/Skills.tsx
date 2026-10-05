import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Search,
  Check,
  Star,
  Compass,
  Map,
  Share2,
  Target,
  Radio,
  GitBranch,
  Cpu,
  Terminal,
  Code,
  Box,
  Sliders,
  Activity,
  Monitor,
  Crosshair,
  Eye,
  Layout,
  FileCode,
  Layers,
  Server,
  Zap,
  HardDrive,
  Shield,
} from 'lucide-react';
import { SkillItem } from '../../types/portfolio';

interface SkillsProps {
  skills: SkillItem[];
}

export const Skills: React.FC<SkillsProps> = ({ skills }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const iconComponents: Record<string, React.ReactNode> = {
    Compass: <Compass className="w-4 h-4" />,
    Map: <Map className="w-4 h-4" />,
    Share2: <Share2 className="w-4 h-4" />,
    Target: <Target className="w-4 h-4" />,
    Radio: <Radio className="w-4 h-4" />,
    GitBranch: <GitBranch className="w-4 h-4" />,
    Cpu: <Cpu className="w-4 h-4" />,
    Terminal: <Terminal className="w-4 h-4" />,
    Code: <Code className="w-4 h-4" />,
    Box: <Box className="w-4 h-4" />,
    Sliders: <Sliders className="w-4 h-4" />,
    Activity: <Activity className="w-4 h-4" />,
    Monitor: <Monitor className="w-4 h-4" />,
    Crosshair: <Crosshair className="w-4 h-4" />,
    Eye: <Eye className="w-4 h-4" />,
    Layout: <Layout className="w-4 h-4" />,
    FileCode: <FileCode className="w-4 h-4" />,
    Layers: <Layers className="w-4 h-4" />,
    Server: <Server className="w-4 h-4" />,
    Zap: <Zap className="w-4 h-4" />,
    HardDrive: <HardDrive className="w-4 h-4" />,
    Shield: <Shield className="w-4 h-4" />,
  };

  const categories = useMemo(() => {
    const cats = new Set<string>();
    skills.forEach((s) => {
      if (s.category) cats.add(s.category);
    });
    return ['All', ...Array.from(cats)];
  }, [skills]);

  const filteredSkills = useMemo(() => {
    return skills
      .filter((s) => s.enabled)
      .filter((s) => {
        const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
        const matchesSearch =
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => a.order - b.order);
  }, [skills, selectedCategory, searchQuery]);

  return (
    <section id="skills" className="py-24 relative bg-[#090D18]/90 border-t border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-950/50 border border-blue-500/30 text-blue-400 font-mono text-xs">
              <Wrench className="w-3.5 h-3.5" />
              <span>TECHNICAL ARSENAL</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight font-sans">
              Specialized Skills & Technologies
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl font-mono">
              Directly aligned with real autonomous flight stacks, robotics simulation, embedded microcontrollers, and low-latency telemetry protocols.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search skill (e.g. ROS, Pixhawk)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0E1424] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                  : 'bg-[#111827] text-slate-400 hover:text-slate-200 border border-[#1E293B] hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="p-4 rounded-xl bg-[#0D121F] border border-[#1E293B] hover:border-cyan-500/40 hover:bg-[#111726] transition-all group"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:border-cyan-400 transition">
                  {iconComponents[skill.icon] || <Cpu className="w-4 h-4 text-cyan-400" />}
                </div>

                {skill.featured && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                    <Star className="w-2.5 h-2.5 fill-cyan-400" />
                    CORE
                  </span>
                )}
              </div>

              <div className="font-semibold text-sm text-slate-100 group-hover:text-cyan-300 transition">
                {skill.name}
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                {skill.category}
              </div>

              {skill.description && (
                <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                  {skill.description}
                </p>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
