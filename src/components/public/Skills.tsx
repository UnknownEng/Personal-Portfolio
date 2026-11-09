import React, { useMemo } from 'react';
import { SkillItem } from '../../types/portfolio';
import { SectionHead } from './siteKit';

interface SkillsProps {
  num: string;
  skills: SkillItem[];
  /** Technologies listed across projects / roles, used to round out the toolkit. */
  usedTech: string[];
}

export const Skills: React.FC<SkillsProps> = ({ num, skills, usedTech }) => {
  const groups = useMemo(() => {
    const map = new Map<string, SkillItem[]>();
    skills
      .filter((s) => s.enabled !== false)
      .sort((a, b) => a.order - b.order)
      .forEach((s) => {
        const list = map.get(s.category) || [];
        list.push(s);
        map.set(s.category, list);
      });
    return Array.from(map.entries());
  }, [skills]);

  const extra = useMemo(() => {
    const known = new Set(skills.filter((s) => s.enabled !== false).map((s) => s.name.toLowerCase()));
    return usedTech.filter((t) => !known.has(t.toLowerCase())).slice(0, 24);
  }, [skills, usedTech]);

  if (!groups.length && !extra.length) return null;

  return (
    <section className="sec" id="toolkit" aria-labelledby="toolkit-title">
      <div className="wrap">
        <SectionHead
          num={num}
          title="Toolkit"
          id="toolkit-title"
          note="What I reach for when building autonomy stacks, from the flight controller up to the ground station."
        />

        <div className="kit">
          {groups.map(([cat, list]) => (
            <div className="kit__row rv" key={cat}>
              <h3 className="kit__cat mono">{cat}</h3>
              <ul className="kit__items">
                {list.map((s) => (
                  <li key={s.id} className={s.featured ? 'is-core' : undefined} title={s.description || undefined}>
                    {s.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {extra.length > 0 && (
            <div className="kit__row rv">
              <h3 className="kit__cat mono">Also in my projects</h3>
              <ul className="kit__items">
                {extra.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
