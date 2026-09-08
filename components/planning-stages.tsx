'use client';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';
import { stages } from '@/lib/site';
export function PlanningStages() {
  const [active, setActive] = useState(0);
  return (
    <div className="planning-framework">
      <div className="stage-tabs" aria-label="Areas of your plan">
        {stages.map((s, i) => (
          <button
            key={s.name}
            type="button"
            aria-pressed={active === i}
            onClick={() => setActive(i)}
            className={active === i ? 'stage active' : 'stage'}
          >
            <span className="stage-number">0{i + 1}</span>
            <span>{s.name}</span>
            <ArrowRight size={20} />
          </button>
        ))}
      </div>
      <div className="stage-detail" aria-live="polite">
        <div>
          <p className="stage-kicker">
            {String(active + 1).padStart(2, '0')} / {stages[active].name.toUpperCase()}
          </p>
          <h3>{stages[active].verb}</h3>
        </div>
        <p>{stages[active].text}</p>
        <div>
          {stages[active].links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
              <ArrowUpRight size={15} />
            </Link>
          ))}
        </div>
      </div>
      <p className="framework-note">
        <Check size={14} /> These areas connect and overlap. Your plan can begin wherever you are.
      </p>
    </div>
  );
}
