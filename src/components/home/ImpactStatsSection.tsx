import React from 'react';
import { Heart, Shirt, Sparkles, GraduationCap, Award, ShieldCheck } from 'lucide-react';
import { SpotlightCard, AnimatedCounter } from '../common/ReactBitsComponents';
import { IMPACT_STATS } from '../../data/initialData';

const iconMap = {
  Heart: Heart,
  Shirt: Shirt,
  Sparkles: Sparkles,
  GraduationCap: GraduationCap
};

export const ImpactStatsSection: React.FC = () => {
  return (
    <section className="py-10 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Transforming Communities Across Bengal
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Our programs ensure child care, dignified clothing drives, and artisan economic empowerment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {IMPACT_STATS.map((stat, idx) => {
            const IconComponent = iconMap[stat.iconName as keyof typeof iconMap] || Heart;
            return (
              <SpotlightCard key={idx} className="p-5 text-left flex flex-col justify-between space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <IconComponent className="w-5 h-5 text-amber-700" />
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={2} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 mt-0.5">{stat.label}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{stat.description}</p>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};
