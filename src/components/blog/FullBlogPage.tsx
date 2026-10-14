import React, { useState, useMemo } from 'react';
import { BlogPost } from '../../types';
import { Search, Clock, ArrowRight, ArrowLeft, Filter, Calendar, Tag } from 'lucide-react';
import { GlassModal } from '../common/ReactBitsComponents';

interface FullBlogPageProps {
  posts: BlogPost[];
  setActiveTab: (tab: string) => void;
}

export const FullBlogPage: React.FC<FullBlogPageProps> = ({ posts, setActiveTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const publishedPosts = useMemo(() => posts.filter((p) => p.published), [posts]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(publishedPosts.map((p) => p.category)));
    return ['all', ...cats];
  }, [publishedPosts]);

  // Filter posts based on search and category
  const filteredPosts = useMemo(() => {
    return publishedPosts.filter((post) => {
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [publishedPosts, selectedCategory, searchQuery]);

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  return (
    <div className="py-8 sm:py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb & Page Header */}
        <div className="space-y-4">
          <button
            onClick={() => setActiveTab('home')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-amber-800 transition-colors cursor-pointer"
            type="button"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-200">
                Anandalok Journal
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                Field Stories & Ground Updates
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
                Explore verified impact reports, community transformations, and grassroots updates from our field teams across West Bengal.
              </p>
            </div>

            {/* Search & Filter bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
              {/* Search bar */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stories, tags..."
                  className="w-full pl-8 pr-7 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
                    type="button"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs">
                <Filter className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer font-bold capitalize text-xs text-slate-800"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Main Story (if available) */}
        {featuredPost && (
          <div
            onClick={() => setSelectedPost(featuredPost)}
            className="relative min-h-[320px] sm:min-h-[400px] rounded-2xl overflow-hidden group cursor-pointer border border-slate-200/80 shadow-md flex flex-col justify-end p-6 sm:p-8 transition-all hover:shadow-xl"
          >
            <img
              src={featuredPost.imageUrl}
              alt={featuredPost.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

            <span className="absolute top-4 left-4 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-md shadow-xs z-10">
              Featured • {featuredPost.category}
            </span>

            <div className="relative z-10 max-w-3xl space-y-2 text-white">
              <div className="flex items-center gap-3 text-xs text-amber-300 font-bold">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {featuredPost.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {featuredPost.readTime}
                </span>
              </div>

              <h2 className="text-xl sm:text-3xl font-black leading-snug group-hover:text-amber-300 transition-colors">
                {featuredPost.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed">
                {featuredPost.excerpt}
              </p>

              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>Read Full Story</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* Stories Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
            <p className="text-slate-500 font-bold text-sm">No stories found matching "{searchQuery}"</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="px-4 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              type="button"
            >
              Clear Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col justify-between"
              >
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
                  <span className="absolute top-3 left-3 bg-slate-900/90 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                    {post.category}
                  </span>
                  <span className="absolute bottom-3 right-3 text-slate-300 text-[10px] font-medium flex items-center gap-1 bg-slate-950/70 px-2 py-0.5 rounded backdrop-blur-xs">
                    <Clock className="w-3 h-3 text-amber-400" /> {post.readTime}
                  </span>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold">{post.date}</span>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-800 group-hover:text-amber-900">
                    <span>Read Story</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Reader Modal */}
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
                <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5 text-amber-600" /> #{tag}
                </span>
              ))}
            </div>
          </div>
        </GlassModal>
      )}
    </div>
  );
};
