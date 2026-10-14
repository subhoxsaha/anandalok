import React, { useState } from 'react';
import { BlogPost } from '../../types';
import { GlassModal } from '../common/ReactBitsComponents';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';

interface BlogSectionProps {
  posts: BlogPost[];
  setActiveTab: (tab: string) => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ posts, setActiveTab }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const publishedPosts = posts.filter((p) => p.published);

  if (publishedPosts.length === 0) return null;

  // Show up to 6 most recent posts in unified 2-3 column grid
  const recentPosts = publishedPosts.slice(0, 6);

  return (
    <section className="py-8 sm:py-12 bg-slate-50/90 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
            Field Stories
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Latest News & Ground Updates
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-medium">
            Real impact stories and field progress from our grassroots community programs.
          </p>
        </div>

        {/* Unified Cards Grid: 2 cards per row on small screens, 3 cards on md/lg screens */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5 items-stretch">
          {recentPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="relative rounded-xl sm:rounded-2xl overflow-hidden min-h-[220px] sm:min-h-[280px] p-3.5 sm:p-5 flex flex-col justify-between group cursor-pointer border border-slate-200/80 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
            >
              {/* Full Background Photo */}
              <img
                src={post.imageUrl}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Gradient Backdrop Overlay for contrast & readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20 opacity-85 group-hover:opacity-95 transition-opacity" />

              {/* Top Bar on Image */}
              <div className="relative z-10 flex items-center justify-between gap-1.5">
                <span className="bg-amber-500 text-slate-950 text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md shadow-xs">
                  {post.category}
                </span>
                <span className="text-slate-200 text-[8px] sm:text-[10px] font-semibold flex items-center gap-1 bg-slate-950/70 px-1.5 sm:px-2 py-0.5 rounded-md backdrop-blur-xs">
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" /> {post.readTime}
                </span>
              </div>

              {/* Bottom Content Overlaid Directly on Photo */}
              <div className="relative z-10 space-y-1 sm:space-y-1.5 text-white mt-auto pt-6">
                <span className="text-[10px] sm:text-[11px] font-semibold text-amber-300/90 block">
                  {post.date}
                </span>
                <h3 className="text-xs sm:text-base font-extrabold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-2 font-normal leading-relaxed hidden sm:block">
                  {post.excerpt}
                </p>
                <div className="pt-1 flex items-center gap-1 text-[10px] sm:text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Read Story</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Centered Read All Stories Pill Button */}
        <div className="text-center pt-2">
          <button
            onClick={() => setActiveTab('blog')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-300 bg-white hover:bg-slate-900 hover:text-white hover:border-slate-900 text-slate-800 text-xs font-bold uppercase tracking-wider shadow-2xs hover:shadow-md transition-all cursor-pointer group"
            type="button"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600 group-hover:text-amber-400 transition-colors" />
            <span>Read All Field Stories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

      {/* Full Reader Modal */}
      {selectedPost && (
        <GlassModal isOpen={!!selectedPost} onClose={() => setSelectedPost(null)} maxWidth="max-w-3xl">
          <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
            <div className="relative h-60 sm:h-72 rounded-2xl overflow-hidden bg-slate-900">
              <img src={selectedPost.imageUrl} alt={selectedPost.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                  {selectedPost.category}
                </span>
                <h2 className="text-lg sm:text-2xl font-black leading-tight text-white">{selectedPost.title}</h2>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">Published on {selectedPost.date}</p>
              <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" /> {selectedPost.readTime}
              </p>
            </div>

            <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-line space-y-3">
              {selectedPost.content}
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-2">
              {selectedPost.tags.map((tag, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2.5 py-1 rounded-md">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </GlassModal>
      )}
    </section>
  );
};
