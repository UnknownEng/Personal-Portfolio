import React, { useState, useEffect } from 'react';
import { HeroData } from '../../types/portfolio';
import { ArrowDown, FileText } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '../ui/Icons';
import { sanitizeUrl, isSafeUrl } from '../../utils/url';

interface HeroProps {
  hero: HeroData;
  linkedInUrl?: string;
  githubUrl?: string;
  onOpenResume?: () => void;
  currentLang?: 'en' | 'zh' | 'ur';
}

export const Hero: React.FC<HeroProps> = ({
  hero,
  linkedInUrl = 'https://www.linkedin.com/in/mansoorahmedrind',
  githubUrl = 'https://github.com/UnknownEng',
  onOpenResume,
  currentLang = 'en',
}) => {
  const titlesEnglish = [
    'UAV Systems Engineer',
    'Swarm Robotics Specialist',
    'Autonomous Flight Control Architect',
    'Embedded Electronics Engineer',
    'NUST Gold Medalist',
  ];

  const titlesChinese = [
    '无人机系统工程师',
    '群体机器人专家',
    '自主飞行控制架构师',
    '嵌入式电子工程师',
    'NUST 金牌得主',
  ];

  const titles = currentLang === 'zh' ? titlesChinese : titlesEnglish;

  const [titleIndex, setTitleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentTitle = titles[titleIndex];
    const typingSpeed = isDeleting ? 40 : 80;

    const timer = setTimeout(() => {
      if (!isDeleting && charIndex < currentTitle.length) {
        setCharIndex((prev) => prev + 1);
      } else if (!isDeleting && charIndex === currentTitle.length) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && charIndex > 0) {
        setCharIndex((prev) => prev - 1);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setTitleIndex((prev) => (prev + 1) % titles.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, titleIndex, titles]);

  const displayedText = titles[titleIndex]?.substring(0, charIndex) || '';

  const scrollToWork = () => {
    const el = document.getElementById('work');
    if (el) {
      const yOffset = -70;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section className="section" id="home">
      <div className="container text-center">
        {/* Subtitle / Greeting */}
        <h2 className="text-xl md:text-2xl font-semibold text-slate-400 mb-2">
          {currentLang === 'zh' ? '你好，我是' : 'Hi, I am'}{' '}
          <span className="text-white font-bold">
            {hero.name || 'Mansoor Ahmed Rind'}
          </span>
        </h2>

        {/* Dynamic Typewriter Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mt-1 mb-6 flex items-center justify-center flex-wrap gap-2">
          <span>{currentLang === 'zh' ? '我是一名 ' : 'I am a '}</span>
          <span className="text-sky-400 inline-block min-w-[200px] text-left">
            {displayedText}
            <span className="blinkingCursor">_</span>
          </span>
        </h1>

        {/* Bio Paragraph */}
        <p className="max-w-2xl text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-8 mx-auto px-4">
          {currentLang === 'zh'
            ? '我是一名电气与电子工程专业工程师，专注于构建自主无人机系统、无人机蜂群自主协同控制与数字孪生航空仿真。'
            : hero.shortIntroduction ||
              'I am an Electrical & Electronics engineer passionate about bringing autonomous UAV systems, multi-drone swarm robotics, and aerial digital twins to life.'}
        </p>

        {/* Action Buttons matching Steven Feng's site */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {linkedInUrl && isSafeUrl(linkedInUrl) && (
            <a
              href={sanitizeUrl(linkedInUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-btn"
            >
              <LinkedinIcon className="w-4 h-4 mr-1 inline" />
              {currentLang === 'zh' ? '与我联系！' : 'CONNECT WITH ME!'}
            </a>
          )}

          {githubUrl && isSafeUrl(githubUrl) && (
            <a
              href={sanitizeUrl(githubUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-700 font-bold text-sm hover:bg-slate-800 shadow-sm transition hover:scale-105"
            >
              <GithubIcon className="w-4 h-4 text-sky-400" />
              <span>GITHUB</span>
            </a>
          )}

          {onOpenResume && (
            <button
              type="button"
              onClick={onOpenResume}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-700 font-bold text-sm hover:bg-slate-800 shadow-sm transition hover:scale-105"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              {currentLang === 'zh' ? '查看简历' : 'VIEW RESUME'}
            </button>
          )}

          <button
            type="button"
            onClick={scrollToWork}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-slate-400 hover:text-sky-400 font-semibold text-sm transition"
          >
            <span>{currentLang === 'zh' ? '探索研究' : 'Explore Work'}</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
};
