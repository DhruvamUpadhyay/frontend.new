import React from 'react';

export function AlternatingFeatures({ 
  features = [],
  headerTitle = "Uncover The Truth With Expert Techniques",
  headerSubtitle = "Our comprehensive curriculum covers every aspect of modern forensic science, from physical crime scenes to digital espionage."
}: { 
  features?: any[];
  headerTitle?: string;
  headerSubtitle?: string;
}) {
  if (!features || features.length === 0) return null;

  return (
    <>
      {features.map((feature: any, index: number) => (
        <section 
          key={index}
          className="min-h-[100svh] flex items-center justify-center relative overflow-hidden bg-[#1D1A39]/80 border-b border-white/5 py-12 md:py-20"
        >
          {/* Background Glows */}
          <div className="absolute top-[20%] left-0 w-[400px] h-[400px] bg-[#E8BCB9]/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[20%] right-0 w-[400px] h-[400px] bg-[#F59F59]/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
            {index === 0 && (
              <div className="text-center mb-12 md:mb-16">
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                  {headerTitle}
                </h2>
                <p className="text-white/60 max-w-2xl mx-auto text-base">
                  {headerSubtitle}
                </p>
              </div>
            )}

            <div 
              className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 fade-up-element ${
                feature.reverse ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Text Content */}
              <div className="flex-1 space-y-6 text-left">
                <h3 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
                  {feature.title}
                </h3>
                <p className="text-[#F59F59] font-medium text-lg tracking-wide">
                  {feature.subtitle}
                </p>
                <p className="text-white/70 text-base leading-relaxed">
                  {feature.description}
                </p>
                
                <ul className="space-y-3 pt-2">
                  {(feature.features || []).map((item: any, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-white/80">
                      <div className="w-5 h-5 rounded-full bg-[#E8BCB9]/20 flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-[#E8BCB9]" />
                      </div>
                      <span className="font-medium text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image Container */}
              <div className="flex-1 w-full relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-[#F59F59]/10 to-[#E8BCB9]/10 rounded-2xl blur-xl" />
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 aspect-[4/3] group shadow-2xl">
                  {/* Corners */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#F59F59] rounded-tl-xl z-20 opacity-50" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#E8BCB9] rounded-br-xl z-20 opacity-50" />
                  
                  {feature.image && (
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1D1A39]/80 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
