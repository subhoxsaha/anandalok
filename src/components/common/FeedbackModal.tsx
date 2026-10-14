import React, { useState, useEffect } from 'react';
import { 
  MessageSquareHeart, 
  Star, 
  Send, 
  CheckCircle, 
  X, 
  MessageCircle, 
  Sparkles, 
  User as UserIcon, 
  ThumbsUp,
  ShieldCheck
} from 'lucide-react';
import { GlassModal } from './ReactBitsComponents';
import { UserFeedback, User } from '../../types';
import { saveFeedback, getFeedback } from '../../lib/storage';
import confetti from 'canvas-confetti';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'reviews'>('submit');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<UserFeedback['category']>('general');
  const [userName, setUserName] = useState(currentUser?.name !== 'Guest User' ? currentUser?.name || '' : '');
  const [userEmail, setUserEmail] = useState(currentUser?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedbacksList, setFeedbacksList] = useState<UserFeedback[]>(getFeedback());

  useEffect(() => {
    if (isOpen) {
      setFeedbacksList(getFeedback());
      if (currentUser?.name && currentUser.name !== 'Guest User') {
        setUserName(currentUser.name);
      }
      if (currentUser?.email) {
        setUserEmail(currentUser.email);
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 1: return 'Needs Improvement';
      case 2: return 'Fair & Satisfactory';
      case 3: return 'Good Experience';
      case 4: return 'Very Good Service';
      case 5: return 'Outstanding & Inspiring!';
      default: return 'Rate Your Experience';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !userName.trim()) return;

    setIsSubmitting(true);

    const newFb: UserFeedback = {
      id: `fb-${Date.now()}`,
      userName: userName.trim(),
      userEmail: userEmail.trim() || 'supporter@anandalok.org',
      category,
      rating,
      subject: subject.trim() || `${category.toUpperCase()} Experience Feedback`,
      message: message.trim(),
      date: new Date().toISOString().split('T')[0],
      status: 'published'
    };

    saveFeedback(newFb);
    setFeedbacksList(getFeedback());

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }, 400);
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setSubject('');
    setMessage('');
    setRating(5);
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="relative space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 shadow-2xs">
              <MessageSquareHeart className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Community Feedback & Reviews</h3>
              <p className="text-[11px] text-slate-500">Your opinion helps us improve our social welfare drives.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('submit'); handleResetForm(); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'submit' ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-amber-600" />
            <span>Submit Feedback</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'reviews' ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Community Stories ({feedbacksList.length})</span>
          </button>
        </div>

        {/* TAB 1: SUBMIT FEEDBACK */}
        {activeTab === 'submit' && (
          <div>
            {isSubmitted ? (
              <div className="py-8 text-center space-y-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 p-6">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs border border-emerald-300">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-slate-900">Thank You For Your Feedback!</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Your valuable review has been received and saved. Our field teams continuously refine our services based on community input.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="px-4 py-2 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    View All Feedback
                  </button>
                  <button
                    onClick={handleResetForm}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Submit Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                
                {/* Rating Stars Selection */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1.5">
                  <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                    Overall Experience Rating
                  </span>
                  
                  <div className="flex items-center justify-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            star <= (hoverRating || rating)
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <p className="text-xs font-extrabold text-amber-900 font-sans">
                    {getRatingLabel(hoverRating || rating)}
                  </p>
                </div>

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[11px]">Feedback Topic / Focus Area *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {[
                      { id: 'general', label: 'General NGO' },
                      { id: 'donation', label: 'Donation & 80G' },
                      { id: 'marketplace', label: 'Artisan Crafts' },
                      { id: 'volunteer', label: 'Volunteer Drives' },
                      { id: 'website_ui', label: 'Website Design' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as any)}
                        className={`py-1.5 px-2.5 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                          category === cat.id
                            ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-semibold text-slate-700 text-[11px]">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suman Roy"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full mt-1 p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 text-[11px]">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. email@domain.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full mt-1 p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="font-semibold text-slate-700 text-[11px]">Subject / Short Title</label>
                  <input
                    type="text"
                    placeholder="Brief summary of your feedback..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full mt-1 p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="font-semibold text-slate-700 text-[11px]">Your Message / Detailed Feedback *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Share your experience, suggestions, or notes for our volunteer team..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full mt-1 p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim() || !userName.trim()}
                  className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Community Feedback'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: COMMUNITY REVIEWS LIST */}
        {activeTab === 'reviews' && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {feedbacksList.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <MessageSquareHeart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-xs font-bold">No feedback entries yet.</p>
              </div>
            ) : (
              feedbacksList.map((item) => (
                <div key={item.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{item.userName}</span>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-800 bg-amber-100 px-2 py-0.2 rounded border border-amber-200">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.date}</p>
                    </div>

                    <div className="flex items-center gap-0.5 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span className="font-extrabold text-slate-800">{item.rating}/5</span>
                    </div>
                  </div>

                  {item.subject && (
                    <h5 className="font-extrabold text-slate-800 text-xs">{item.subject}</h5>
                  )}

                  <p className="text-slate-600 text-xs leading-relaxed">
                    "{item.message}"
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </GlassModal>
  );
};
