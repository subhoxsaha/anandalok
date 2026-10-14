import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  ShoppingBag,
  Heart,
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  ShieldAlert,
  Sparkles,
  Download,
  Eye,
  Save,
  Lock,
  Image as ImageIcon,
  Images,
  ChevronRight,
  MapPin,
  Clock,
  ShieldCheck,
  TrendingUp,
  Award,
  Package,
  Truck,
  RefreshCw
} from 'lucide-react';
import {
  User,
  BlogPost,
  VolunteerEvent,
  ArtisanProduct,
  Cause,
  VolunteerRegistration,
  Donation,
  HeroImage,
  ArtisanOrder,
  GalleryItem
} from '../../types';
import { GlassModal } from '../common/ReactBitsComponents';
import confetti from 'canvas-confetti';
import { updateOrderStatus, deleteOrder } from '../../lib/storage';
import { ImageUpload } from './ImageUpload';

interface CMSDashboardProps {
  currentUser: User;
  blogPosts: BlogPost[];
  events: VolunteerEvent[];
  products: ArtisanProduct[];
  causes: Cause[];
  registrations: VolunteerRegistration[];
  donations: Donation[];
  heroImages?: HeroImage[];
  orders?: ArtisanOrder[];
  users?: User[];
  galleryItems?: GalleryItem[];
  onSaveBlogPost: (post: BlogPost) => void;
  onDeleteBlogPost: (id: string) => void;
  onSaveEvent: (event: VolunteerEvent) => void;
  onDeleteEvent: (id: string) => void;
  onSaveProduct: (product: ArtisanProduct) => void;
  onDeleteProduct: (id: string) => void;
  onSaveCause: (cause: Cause) => void;
  onDeleteCause?: (id: string) => void;
  onSaveHeroImage?: (heroImage: HeroImage) => void;
  onDeleteHeroImage?: (id: string) => void;
  onSaveGalleryItem?: (item: GalleryItem) => void;
  onDeleteGalleryItem?: (id: string) => void;
  onUpdateRegStatus: (id: string, status: 'approved' | 'completed', hours?: number) => void;
  onSwitchUserRole: (role: any) => void;
  onOpenAuth?: () => void;
}

export const CMSDashboard: React.FC<CMSDashboardProps> = ({
  currentUser,
  blogPosts,
  events,
  products,
  causes,
  registrations,
  donations,
  heroImages = [],
  orders = [],
  users = [],
  galleryItems = [],
  onSaveBlogPost,
  onDeleteBlogPost,
  onSaveEvent,
  onDeleteEvent,
  onSaveProduct,
  onDeleteProduct,
  onSaveCause,
  onDeleteCause,
  onSaveHeroImage,
  onDeleteHeroImage,
  onSaveGalleryItem,
  onDeleteGalleryItem,
  onUpdateRegStatus,
  onSwitchUserRole,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<'blogs' | 'events' | 'products' | 'orders' | 'causes' | 'hero' | 'gallery' | 'donations' | 'users'>('blogs');

  // Adjust screen position (scroll to top) during dashboard tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Modals state for editing
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [editingEvent, setEditingEvent] = useState<VolunteerEvent | null>(null);
  const [editingProduct, setEditingProduct] = useState<ArtisanProduct | null>(null);
  const [editingCause, setEditingCause] = useState<Cause | null>(null);
  const [editingHero, setEditingHero] = useState<HeroImage | null>(null);
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  const isAuthorized = currentUser.role === 'central_admin';

  if (!isAuthorized) {
    return (
      <div className="py-24 px-4 max-w-xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-slate-50 text-slate-800 rounded-full flex items-center justify-center mx-auto border border-slate-200 shadow-3xs">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Central Admin Access Required</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            You are currently logged in as <strong className="text-slate-800">{currentUser.name}</strong>. Access to the Central CMS is strictly restricted to verified administrative accounts.
          </p>
        </div>

        <div className="pt-4 flex justify-center">
          <button
            onClick={() => {
              if (onOpenAuth) {
                onOpenAuth();
              }
            }}
            className="px-5 py-3 rounded-xl bg-purple-950 text-white font-extrabold text-xs shadow-md hover:bg-purple-900 transition-all cursor-pointer hover:scale-101 flex items-center gap-2"
            type="button"
          >
            <ShieldAlert className="w-4 h-4 text-purple-300" />
            Authenticate Admin Credentials (2FA)
          </button>
        </div>
      </div>
    );
  }

  // Calculate Key Dashboard Metrics
  const totalStories = blogPosts.length;
  const activeEventsCount = events.filter(e => e.status !== 'completed').length;
  const totalDonatedAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  const uniqueDonorsCount = new Set(donations.map(d => d.donorEmail)).size;
  const totalVolunteerHours = registrations
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + (r.hoursLogged || 0), 0);

  return (
    <div className="py-8 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Elegant Flat Top Header - No Background Color */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Anandalok Central CMS
            </h1>
            <p className="text-xs text-slate-500">
              Logged in as <strong className="text-slate-800">{currentUser.name}</strong> • Central System Administrator
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1.5 shadow-3xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live System Connected
            </span>
          </div>
        </div>

        {/* Operational Overview Metrics - Flat and Minimal */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 border border-slate-200/60 rounded-xl bg-white shadow-3xs space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Total Field Stories</p>
            <div className="flex items-baseline justify-between">
              <span className="text-lg sm:text-xl font-black text-slate-900">{totalStories}</span>
              <span className="text-[10px] font-bold text-slate-500">Articles Live</span>
            </div>
          </div>

          <div className="p-4 border border-slate-200/60 rounded-xl bg-white shadow-3xs space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Active Field Drives</p>
            <div className="flex items-baseline justify-between">
              <span className="text-lg sm:text-xl font-black text-slate-900">{activeEventsCount}</span>
              <span className="text-[10px] font-bold text-slate-500">Scheduled</span>
            </div>
          </div>

          <div className="p-4 border border-slate-200/60 rounded-xl bg-white shadow-3xs space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Generous Donors</p>
            <div className="flex items-baseline justify-between">
              <span className="text-lg sm:text-xl font-black text-slate-900">{uniqueDonorsCount}</span>
              <span className="text-[10px] font-bold text-slate-500">Registered</span>
            </div>
          </div>

          <div className="p-4 border border-slate-200/60 rounded-xl bg-white shadow-3xs space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Total Audited Funds</p>
            <div className="flex items-baseline justify-between">
              <span className="text-lg sm:text-xl font-black text-slate-900">₹{totalDonatedAmount.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-emerald-700">100% Direct</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Elegant Flat Pill Buttons */}
        <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-100">
          {[
            { id: 'blogs', label: 'Field Stories', icon: FileText, count: blogPosts.length },
            { id: 'events', label: 'Field Drives', icon: Calendar, count: events.length },
            { id: 'products', label: 'Artisan Crafts', icon: ShoppingBag, count: products.length },
            { id: 'orders', label: 'Artisan Orders', icon: Package, count: orders.length },
            { id: 'causes', label: 'Donation Causes', icon: Heart, count: causes.length },
            { id: 'hero', label: 'Hero Banners', icon: ImageIcon, count: heroImages.length },
            { id: 'gallery', label: 'Impact Gallery', icon: ImageIcon, count: galleryItems.length },
            { id: 'donations', label: 'Tax Audit Logs', icon: Download, count: donations.length },
            { id: 'users', label: 'User Accounts', icon: Users, count: users.length }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm scale-102'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-3xs'
                }`}
                type="button"
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: FIELD STORIES & BLOGS */}
        {activeTab === 'blogs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Field Stories & Blogs</h3>
                <p className="text-xs text-slate-500">Publish and edit village impact updates and news</p>
              </div>

              <button
                onClick={() =>
                  setEditingBlog({
                    id: `blog-${Date.now()}`,
                    title: '',
                    excerpt: '',
                    content: '',
                    author: currentUser.name,
                    authorRole: 'Field Staff Editor',
                    authorAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
                    date: new Date().toISOString().split('T')[0],
                    category: 'Field Updates',
                    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1000',
                    readTime: '3 min read',
                    tags: ['Anandalok', 'FieldDrive'],
                    published: true
                  })
                }
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto hover:scale-101 transition-transform"
                type="button"
              >
                <Plus className="w-4 h-4" />
                <span>Publish New Field Story</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-3xs divide-y divide-slate-100">
              {blogPosts.map((post) => (
                <div key={post.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-16 h-12 rounded-lg object-cover border border-slate-100 bg-slate-50" 
                    />
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/30">
                        {post.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight pt-1">{post.title}</h4>
                      <p className="text-[10px] text-slate-500">{post.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => setEditingBlog(post)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      type="button"
                    >
                      <Edit className="w-3.5 h-3.5 text-slate-500" /> Edit
                    </button>
                    <button
                      onClick={() => onDeleteBlogPost(post.id)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                      type="button"
                      title="Delete Story"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: FIELD EVENTS & DRIVES */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Volunteer Drives & Field Events</h3>
                <p className="text-xs text-slate-500">Post new distribution and care drives for public sign-ups</p>
              </div>

              <button
                onClick={() =>
                  setEditingEvent({
                    id: `evt-${Date.now()}`,
                    title: '',
                    category: 'cloth_drive',
                    date: new Date().toISOString().split('T')[0],
                    time: '10:00 AM - 02:00 PM',
                    location: 'Kolkata Central Drive',
                    address: 'Anandalok Hub, Howrah',
                    description: '',
                    requiredVolunteers: 25,
                    registeredVolunteers: 0,
                    coordinatorName: currentUser.name,
                    coordinatorPhone: '+91 98301 23456',
                    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
                    skillsNeeded: ['Distribution', 'Sorting'],
                    status: 'upcoming'
                  })
                }
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto hover:scale-101 transition-transform"
                type="button"
              >
                <Plus className="w-4 h-4" />
                <span>Create Field Drive Event</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((event) => (
                <div key={event.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-3xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/40">
                        {event.category.replace('_', ' ')}
                      </span>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setEditingEvent(event)} 
                          className="p-1 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDeleteEvent(event.id)} 
                          className="p-1 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{event.title}</h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {event.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Registered Progress bar */}
                  <div className="space-y-1.5 pt-3 border-t border-slate-100">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>Families Reached</span>
                      <span>{event.registeredVolunteers} / {event.requiredVolunteers}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 transition-all duration-500" 
                        style={{ width: `${Math.min(100, (event.registeredVolunteers / event.requiredVolunteers) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ARTISAN CRAFTS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Artisan Crafts Marketplace Inventory</h3>
                <p className="text-xs text-slate-500">Manage traditional handmade creations and update village stock</p>
              </div>

              <button
                onClick={() =>
                  setEditingProduct({
                    id: `prod-${Date.now()}`,
                    title: '',
                    artisanName: 'Village Women Cooperative',
                    artisanLocation: 'Santiniketan, Birbhum',
                    artisanAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
                    artisanStory: 'Crafted with traditional Bengal heritage techniques.',
                    category: 'textiles',
                    price: 850,
                    rating: 4.8,
                    reviewsCount: 1,
                    inStock: 10,
                    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'],
                    description: '',
                    materials: ['Natural Cotton', 'Hand Embroidery'],
                    impactMessage: '100% of profits fund local artisan families.'
                  })
                }
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto hover:scale-101 transition-transform"
                type="button"
              >
                <Plus className="w-4 h-4" />
                <span>Add Artisan Craft</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((prod) => (
                <div key={prod.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-3xs flex gap-4 items-start hover:shadow-xs transition-shadow">
                  <img 
                    src={prod.images[0]} 
                    alt={prod.title} 
                    className="w-20 h-20 rounded-lg object-cover border border-slate-100 bg-slate-50 shrink-0" 
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200/30">
                        {prod.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate pt-1">{prod.title}</h4>
                      <p className="text-[10px] text-slate-500 truncate">By {prod.artisanName}</p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                      <span className="text-xs font-black text-slate-900">₹{prod.price.toLocaleString()}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        prod.inStock > 3 ? 'text-emerald-800 bg-emerald-50' : 'text-rose-800 bg-rose-50'
                      }`}>
                        Stock: {prod.inStock}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0 self-start">
                    <button 
                      onClick={() => setEditingProduct(prod)} 
                      className="p-1 rounded-md hover:bg-slate-50 text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => onDeleteProduct(prod.id)} 
                      className="p-1 rounded-md hover:bg-rose-50 text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: ARTISAN ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Artisan Marketplace Order Management</h3>
              <p className="text-xs text-slate-500">Track handcraft orders, monitor buyer contact details, and update shipment status</p>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-3xs space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Total Orders</span>
                <p className="text-lg sm:text-xl font-black text-slate-900">{orders.length}</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-3xs space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Marketplace Revenue</span>
                <p className="text-lg sm:text-xl font-black text-slate-900">₹{orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-3xs space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800">Pending Orders</span>
                <p className="text-lg sm:text-xl font-black text-amber-950">{orders.filter(o => o.status === 'pending').length}</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-3xs space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800">Completed Orders</span>
                <p className="text-lg sm:text-xl font-black text-emerald-950">{orders.filter(o => o.status === 'delivered').length}</p>
              </div>
            </div>

            {/* Main Orders List & Details */}
            {orders.length === 0 ? (
              <div className="text-center py-16 space-y-4 rounded-2xl border border-dashed border-slate-200 bg-white/50">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">No Orders Placed Yet</h4>
                  <p className="text-slate-500 text-xs mt-1">When buyers order handcrafted items, they will appear here in real-time.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-3xs hover:shadow-xs transition-shadow flex flex-col lg:flex-row gap-6 justify-between items-start">
                    {/* Customer & Address Details */}
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700">
                          ID: {order.id.replace('ord-', '#')}
                        </span>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {order.date}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                          <span className="text-slate-700 font-bold">Buyer:</span> {order.customerName}
                        </h4>
                        <p className="text-xs text-slate-600 flex items-center gap-1">
                          <strong className="text-slate-800">Phone:</strong> {order.customerPhone}
                        </p>
                        <p className="text-xs text-slate-600 flex items-start gap-1">
                          <strong className="text-slate-800 shrink-0">Delivery Address:</strong> 
                          <span className="italic text-slate-600">{order.customerAddress}</span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-4 items-center">
                        <div className="text-xs">
                          <span className="text-slate-500">Payment: </span>
                          <strong className="font-bold text-slate-800 uppercase">{order.paymentMethod}</strong>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <div className="text-xs">
                          <span className="text-slate-500">Total Bill: </span>
                          <strong className="font-black text-slate-900">₹{order.total.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Ordered Items list */}
                    <div className="flex-1 w-full lg:w-auto bg-slate-50/60 border border-slate-200/50 rounded-xl p-3.5 space-y-2.5 max-w-lg">
                      <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 pb-1.5 border-b border-slate-200/60">Ordered Handcrafts</h5>
                      <div className="space-y-2 divide-y divide-slate-100 max-h-36 overflow-y-auto pr-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-3 items-center text-xs first:pt-0 pt-2">
                            <img src={item.imageUrl} alt={item.productTitle} className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h6 className="font-bold text-slate-900 truncate leading-tight">{item.productTitle}</h6>
                              <p className="text-[10px] text-slate-500">₹{item.price.toLocaleString()} × {item.quantity}</p>
                            </div>
                            <span className="font-bold text-slate-800 shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex justify-between text-[11px] text-slate-500">
                        <span>Items Subtotal: ₹{order.subtotal.toLocaleString()}</span>
                        {order.discount > 0 && <span className="text-emerald-700 font-bold">-₹{order.discount.toLocaleString()} coupon discount</span>}
                        <span>Courier: {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
                      </div>
                    </div>

                    {/* Order Status & Actions */}
                    <div className="flex flex-col gap-3 shrink-0 w-full sm:w-auto lg:self-stretch justify-between items-end border-t lg:border-t-0 pt-4 lg:pt-0">
                      {/* Status badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-semibold">Status:</span>
                        <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                          order.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          order.status === 'shipped' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          order.status === 'delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Dropdown status modifier */}
                      <div className="space-y-1.5 w-full">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-right">Update Order Status</label>
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => {
                              updateOrderStatus(order.id, 'shipped');
                              confetti({ particleCount: 30, spread: 40 });
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                              order.status === 'shipped' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                            title="Mark as Shipped"
                          >
                            <Truck className="w-3 h-3" /> Shipped
                          </button>

                          <button
                            onClick={() => {
                              updateOrderStatus(order.id, 'delivered');
                              confetti({ particleCount: 60, spread: 80 });
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                              order.status === 'delivered' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                            title="Mark as Delivered"
                          >
                            <CheckCircle className="w-3 h-3" /> Deliver
                          </button>

                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to cancel this order?')) {
                                updateOrderStatus(order.id, 'cancelled');
                              }
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                              order.status === 'cancelled' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                            title="Cancel Order"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>

                      {/* Delete action */}
                      <button
                        onClick={() => {
                          if (confirm('Warning: This will permanently remove the order record from the system. Proceed?')) {
                            deleteOrder(order.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer mt-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Record
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DONATION CAUSES */}
        {activeTab === 'causes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Donation Campaign Causes</h3>
                <p className="text-xs text-slate-500">Edit, create and monitor 80G tax-deductible welfare campaigns</p>
              </div>

              <button
                onClick={() =>
                  setEditingCause({
                    id: `cause-${Date.now()}`,
                    title: '',
                    subtitle: '',
                    category: 'child_welfare',
                    description: '',
                    targetAmount: 150000,
                    raisedAmount: 0,
                    donorCount: 0,
                    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
                    taxExempt80G: true,
                    impactPer100: 'Provides full study bags and nutrition kits for rural kids'
                  })
                }
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto hover:scale-101 transition-transform"
                type="button"
              >
                <Plus className="w-4 h-4" />
                <span>Create Donation Cause</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {causes.map((cause) => (
                <div key={cause.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-3xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/30">
                        {cause.category.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setEditingCause(cause)} 
                          className="p-1 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 cursor-pointer"
                          type="button"
                          title="Edit cause"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {onDeleteCause && (
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${cause.title}"?`)) {
                                onDeleteCause(cause.id);
                              }
                            }} 
                            className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                            type="button"
                            title="Delete cause"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-1">{cause.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{cause.subtitle}</p>
                    </div>
                  </div>

                  {/* Fund Progress details - optimized with no amounts */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">Active Campaign</span>
                    {cause.taxExempt80G && <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded">80G Tax Saving</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: HERO CAROUSEL BANNERS */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Hero Carousel Banners</h3>
                <p className="text-xs text-slate-500">Configure background slideshow images and headlines displayed on the home page</p>
              </div>

              <button
                onClick={() =>
                  setEditingHero({
                    id: `hero-${Date.now()}`,
                    title: 'New Field Drive',
                    caption: 'Community impact initiative across West Bengal villages',
                    url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1600'
                  })
                }
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto hover:scale-101 transition-transform"
                type="button"
              >
                <Plus className="w-4 h-4" />
                <span>Add Hero Banner</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {heroImages.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center col-span-2">No custom hero images loaded. Custom hero images will appear here.</p>
              ) : (
                heroImages.map((hero) => (
                  <div key={hero.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-3xs flex gap-4 items-center">
                    <img 
                      src={hero.url} 
                      alt={hero.title} 
                      className="w-24 h-20 rounded-xl object-cover shrink-0 border border-slate-100 bg-slate-50" 
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{hero.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{hero.caption}</p>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button 
                        onClick={() => setEditingHero(hero)} 
                        className="p-1 rounded-md hover:bg-slate-50 text-slate-600 hover:text-slate-900 cursor-pointer"
                        type="button"
                        title="Edit Slide"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {onDeleteHeroImage && (
                        <button 
                          onClick={() => onDeleteHeroImage(hero.id)} 
                          className="p-1 rounded-md hover:bg-rose-50 text-rose-500 hover:text-rose-700 cursor-pointer"
                          type="button"
                          title="Delete Slide"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB: IMPACT GALLERY MANAGEMENT */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Impact Event Gallery Folders</h3>
                <p className="text-xs text-slate-500">Create, edit, and organize event-wise folders with multiple images to show under the Impact Gallery.</p>
              </div>

              <button
                onClick={() =>
                  setEditingGallery({
                    id: `gal-${Date.now()}`,
                    title: '',
                    category: 'events',
                    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1000',
                    highResUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=2000',
                    thumbnailUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400',
                    location: '',
                    date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                    description: '',
                    photographer: '',
                    images: []
                  })
                }
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto hover:scale-101 transition-transform"
                type="button"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Gallery Folder</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryItems.length === 0 ? (
                <p className="text-xs text-slate-500 py-12 text-center col-span-3">No impact gallery folders loaded. Click the button above to create one.</p>
              ) : (
                galleryItems.map((folder) => {
                  const imageCount = folder.images?.length || 1;
                  return (
                    <div key={folder.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-3xs flex flex-col justify-between space-y-3">
                      <div className="flex gap-4 items-center">
                        <img 
                          src={folder.imageUrl} 
                          alt={folder.title} 
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100 bg-slate-50" 
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/30">
                            {folder.category.replace('_', ' ')}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate pt-1">{folder.title}</h4>
                          <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-500" /> {folder.location} ({folder.date})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-bold">
                        <span>{imageCount} {imageCount === 1 ? 'image' : 'images'} inside</span>
                        
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => setEditingGallery(JSON.parse(JSON.stringify(folder)))} 
                            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60 flex items-center gap-1 cursor-pointer font-bold text-[10px]"
                            type="button"
                          >
                            <Edit className="w-3 h-3" /> Edit
                          </button>
                          {onDeleteGalleryItem && (
                            <button 
                              onClick={() => onDeleteGalleryItem(folder.id)} 
                              className="px-2 py-1 rounded-lg hover:bg-rose-50 text-rose-500 border border-transparent hover:border-rose-100 flex items-center gap-1 cursor-pointer font-bold text-[10px]"
                              type="button"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 6: VOLUNTEER ROSTER */}
        {activeTab === 'volunteers' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Volunteer Event Registrations & Hours Audit</h3>
              <p className="text-xs text-slate-500">Track and approve volunteer field hours for high school & corporate logs</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-3xs divide-y divide-slate-100">
              {registrations.length === 0 ? (
                <p className="text-slate-500 py-8 text-center text-xs">No registrations found. Register for events to view entries.</p>
              ) : (
                registrations.map((reg) => (
                  <div key={reg.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">{reg.volunteerName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({reg.volunteerPhone})</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-bold">{reg.eventTitle}</p>
                      <p className="text-[10px] text-slate-400">Registered on: {reg.registeredAt}</p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] capitalize border ${
                        reg.status === 'completed' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200/40' 
                          : 'bg-amber-50 text-amber-800 border-amber-200/40'
                      }`}>
                        {reg.status === 'completed' ? 'Hours Verified' : 'Registered'}
                      </span>
                      
                      {reg.status !== 'completed' && (
                        <button
                          onClick={() => {
                            onUpdateRegStatus(reg.id, 'completed', 5);
                            confetti({ particleCount: 50, spread: 60 });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] cursor-pointer transition-all hover:scale-101 shadow-2xs flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Approve 5 Hours</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 7: 80G AUDIT REGISTER */}
        {activeTab === 'donations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">80G Transparent Donation Audit Register</h3>
                <p className="text-xs text-slate-500">Every donation instantly logged with verified 80G tax benefit claim data</p>
              </div>

              <button
                onClick={() => {
                  const csvHeader = 'Transaction ID,Donor Name,Email,Amount,Payment Method,Date\n';
                  const csvRows = donations.map(d => `${d.transactionId},"${d.donorName}",${d.donorEmail},${d.amount},${d.paymentMethod},"${d.date}"`).join('\n');
                  const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'Anandalok_80G_Audit_Log.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                  confetti({ particleCount: 30 });
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto hover:scale-101 transition-transform shadow-sm"
                type="button"
              >
                <Download className="w-4 h-4" /> Export 80G Tax Audit Log (CSV)
              </button>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-3xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-bold">
                      <th className="p-4 font-extrabold uppercase tracking-wider text-[10px]">TXN ID</th>
                      <th className="p-4 font-extrabold uppercase tracking-wider text-[10px]">Donor Info</th>
                      <th className="p-4 font-extrabold uppercase tracking-wider text-[10px]">Welfare Cause</th>
                      <th className="p-4 font-extrabold uppercase tracking-wider text-[10px]">Amount</th>
                      <th className="p-4 font-extrabold uppercase tracking-wider text-[10px]">Payment</th>
                      <th className="p-4 font-extrabold uppercase tracking-wider text-[10px]">PAN / Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {donations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 font-medium text-xs">
                          No audit records logged. Verified transactions will appear automatically.
                        </td>
                      </tr>
                    ) : (
                      donations.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50/20 transition-colors">
                          <td className="p-4 font-mono font-bold text-slate-800">
                            <span className="bg-slate-100 border border-slate-200/40 px-2 py-0.5 rounded text-[11px]">
                              {d.transactionId}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-900">{d.donorName}</div>
                            <div className="text-[10px] text-slate-400">{d.donorEmail}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-slate-700 leading-tight">{d.causeTitle}</div>
                          </td>
                          <td className="p-4 font-black text-slate-900 text-sm">
                            ₹{d.amount.toLocaleString()}
                          </td>
                          <td className="p-4 uppercase font-extrabold text-[10px] text-slate-500">
                            {d.paymentMethod}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-slate-800 text-[11px]">
                              {d.panNumber ? `PAN: ${d.panNumber}` : 'Direct Donor'}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{d.date}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: USER ACCOUNTS SECTION */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">User Directory & System Accounts</h3>
                <p className="text-xs text-slate-500">View registered user profiles, contact information, and roles</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-3xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-bold">
                      <th className="p-4 w-12 font-extrabold uppercase tracking-wider text-[10px]">Photo</th>
                      <th className="p-4 font-extrabold uppercase tracking-wider text-[10px]">User Details</th>
                      <th className="p-4 font-extrabold uppercase tracking-wider text-[10px] text-right">Role / Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-slate-400 font-medium text-xs">
                          No users registered in the system.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/20 transition-colors">
                          <td className="p-4">
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt={u.name}
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600">
                                {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                {u.name}
                                {u.id === currentUser.id && (
                                  <span className="text-[9px] font-black uppercase tracking-wider bg-slate-900 text-white px-1 py-0.2 rounded">You</span>
                                )}
                              </div>
                              <div className="text-[10px] font-semibold text-slate-500">{u.email || 'No email synced'}</div>
                              <div className="text-[9px] text-slate-400 font-mono mt-0.5">ID: {u.id.slice(0, 8)}...</div>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              u.role === 'central_admin'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : 'bg-slate-50 text-slate-800 border-slate-200'
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${u.role === 'central_admin' ? 'bg-purple-500' : 'bg-slate-400'}`} />
                              {u.role === 'central_admin' ? 'Central Admin' : 'General User'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EDIT BLOG MODAL */}
      {editingBlog && (
        <GlassModal isOpen={!!editingBlog} onClose={() => setEditingBlog(null)} maxWidth="max-w-xl">
          <div className="space-y-5 p-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {editingBlog.title ? 'Edit Field Story' : 'Publish New Field Story'}
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Article Title</label>
                <input
                  type="text"
                  value={editingBlog.title}
                  onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:border-slate-950 focus:outline-none"
                  placeholder="e.g., Winter Warmth Distribution in Sunderbans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={editingBlog.category}
                    onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  >
                    <option value="Cloth Drives">Cloth Drives</option>
                    <option value="Child Care">Child Care</option>
                    <option value="Women Empowerment">Women Empowerment</option>
                    <option value="Artisan Stories">Artisan Stories</option>
                    <option value="Field Updates">Field Updates</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimated Read Time</label>
                  <input
                    type="text"
                    value={editingBlog.readTime}
                    onChange={(e) => setEditingBlog({ ...editingBlog, readTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    placeholder="e.g. 4 min read"
                  />
                </div>
              </div>

              <div>
                <ImageUpload
                  id="blog-image-upload"
                  label="Blog Cover Image"
                  value={editingBlog.imageUrl}
                  maxWidth={800}
                  maxHeight={600}
                  quality={0.7}
                  onChange={(val) => setEditingBlog({ ...editingBlog, imageUrl: val })}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Short Excerpt</label>
                <input
                  type="text"
                  value={editingBlog.excerpt}
                  onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  placeholder="Give a quick 1-sentence teaser of this update"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Story Content (Markdown Supported)</label>
                <textarea
                  rows={6}
                  value={editingBlog.content}
                  onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none leading-relaxed"
                  placeholder="Tell the detailed story here..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBlog(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSaveBlogPost(editingBlog);
                    setEditingBlog(null);
                    confetti({ particleCount: 50 });
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-sm cursor-pointer"
                >
                  Save & Publish Live
                </button>
              </div>
            </div>
          </div>
        </GlassModal>
      )}

      {/* EDIT EVENT MODAL */}
      {editingEvent && (
        <GlassModal isOpen={!!editingEvent} onClose={() => setEditingEvent(null)} maxWidth="max-w-xl">
          <div className="space-y-5 p-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {editingEvent.title ? 'Edit Field Drive Event' : 'Create Field Drive Event'}
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Event Title</label>
                <input
                  type="text"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  placeholder="e.g., Blanket Distribution & Health Check"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Families / Beneficiaries</label>
                  <input
                    type="number"
                    value={editingEvent.requiredVolunteers}
                    onChange={(e) => setEditingEvent({ ...editingEvent, requiredVolunteers: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location / Village</label>
                  <input
                    type="text"
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    placeholder="e.g., Sundarbans Village"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Address Detail</label>
                  <input
                    type="text"
                    value={editingEvent.address}
                    onChange={(e) => setEditingEvent({ ...editingEvent, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    placeholder="Full street / landmark address"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={4}
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none leading-relaxed"
                  placeholder="Explain event tasks, itinerary, logistics..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setEditingEvent(null)} 
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSaveEvent(editingEvent);
                    setEditingEvent(null);
                    confetti({ particleCount: 50 });
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-sm cursor-pointer"
                >
                  Save Event Live
                </button>
              </div>
            </div>
          </div>
        </GlassModal>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <GlassModal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} maxWidth="max-w-xl">
          <div className="space-y-5 p-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {editingProduct.title ? 'Edit Artisan Craft' : 'Add New Artisan Craft'}
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  placeholder="e.g. Traditional Handwoven Bengal Kantha Saree"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Artisan Name</label>
                  <input
                    type="text"
                    value={editingProduct.artisanName}
                    onChange={(e) => setEditingProduct({ ...editingProduct, artisanName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Village Location</label>
                  <input
                    type="text"
                    value={editingProduct.artisanLocation}
                    onChange={(e) => setEditingProduct({ ...editingProduct, artisanLocation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    placeholder="e.g. Santiniketan, Birbhum"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.inStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, inStock: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <ImageUpload
                  id="product-image-upload"
                  label="Craft Product Image"
                  value={editingProduct.images?.[0] || ''}
                  maxWidth={800}
                  maxHeight={600}
                  quality={0.7}
                  onChange={(val) => setEditingProduct({ ...editingProduct, images: [val] })}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none leading-relaxed"
                  placeholder="Describe craftsmanship details, heritage style, cotton counts..."
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Artisan Background & Story</label>
                <textarea
                  rows={3}
                  value={editingProduct.artisanStory}
                  onChange={(e) => setEditingProduct({ ...editingProduct, artisanStory: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none leading-relaxed"
                  placeholder="Introduce the artisan's personal story and community impact..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setEditingProduct(null)} 
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSaveProduct(editingProduct);
                    setEditingProduct(null);
                    confetti({ particleCount: 50 });
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-sm cursor-pointer"
                >
                  Save Craft Item
                </button>
              </div>
            </div>
          </div>
        </GlassModal>
      )}

      {/* EDIT CAUSE MODAL */}
      {editingCause && (
        <GlassModal isOpen={!!editingCause} onClose={() => setEditingCause(null)} maxWidth="max-w-xl">
          <div className="space-y-5 p-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {editingCause.title ? 'Configure Donation Cause' : 'Create Donation Cause'}
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Campaign Title</label>
                <input
                  type="text"
                  value={editingCause.title}
                  onChange={(e) => setEditingCause({ ...editingCause, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  placeholder="e.g., Sunderbans Child Nutrition & Studies Support"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Campaign Subtitle</label>
                <input
                  type="text"
                  value={editingCause.subtitle}
                  onChange={(e) => setEditingCause({ ...editingCause, subtitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  placeholder="Short, highly emotive summary"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={editingCause.category}
                  onChange={(e) => setEditingCause({ ...editingCause, category: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-1 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="child_welfare">Child Welfare</option>
                  <option value="women_empowerment">Women Empowerment</option>
                  <option value="cloth_distribution">Cloth Distribution</option>
                  <option value="food_health">Food & Health</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Direct Impact Message per ₹100</label>
                <input
                  type="text"
                  value={editingCause.impactPer100}
                  onChange={(e) => setEditingCause({ ...editingCause, impactPer100: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  placeholder="e.g. Provides school supplies and warmth for 2 rural kids"
                />
              </div>

              <div>
                <ImageUpload
                  id="cause-image-upload"
                  label="Cause Cover Image"
                  value={editingCause.imageUrl}
                  maxWidth={800}
                  maxHeight={600}
                  quality={0.7}
                  onChange={(val) => setEditingCause({ ...editingCause, imageUrl: val })}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  value={editingCause.description}
                  onChange={(e) => setEditingCause({ ...editingCause, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none leading-relaxed"
                  placeholder="Detailed breakdown of expenses, village names, expected timeline, etc..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setEditingCause(null)} 
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSaveCause(editingCause);
                    setEditingCause(null);
                    confetti({ particleCount: 50 });
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-bold transition-all shadow-sm cursor-pointer"
                >
                  Save Welfare Campaign
                </button>
              </div>
            </div>
          </div>
        </GlassModal>
      )}

      {/* Modal: Edit Hero Image */}
      {editingHero && (
        <GlassModal isOpen={!!editingHero} onClose={() => setEditingHero(null)} maxWidth="max-w-xl">
          <div className="space-y-5 p-1 text-xs">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Configure Hero Banner Slide</h3>

            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tag / Title</label>
                <input
                  type="text"
                  value={editingHero.title}
                  onChange={(e) => setEditingHero({ ...editingHero, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  placeholder="e.g. Vastra Daan Drives 2026"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Caption / Subtitle</label>
                <input
                  type="text"
                  value={editingHero.caption}
                  onChange={(e) => setEditingHero({ ...editingHero, caption: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  placeholder="e.g. Over 5,000 woolen sets distributed this winter"
                />
              </div>

              <div>
                <ImageUpload
                  id="hero-image-upload"
                  label="Background Banner Image"
                  value={editingHero.url}
                  maxWidth={1200}
                  maxHeight={800}
                  quality={0.75}
                  onChange={(val) => setEditingHero({ ...editingHero, url: val })}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setEditingHero(null)} 
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onSaveHeroImage) {
                      onSaveHeroImage(editingHero);
                    }
                    setEditingHero(null);
                    confetti({ particleCount: 50 });
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-sm cursor-pointer"
                >
                  Save Banner Slide
                </button>
              </div>
            </div>
          </div>
        </GlassModal>
      )}

      {/* Modal: Edit Gallery Folder */}
      {editingGallery && (
        <GlassModal isOpen={!!editingGallery} onClose={() => { setEditingGallery(null); setGalleryError(null); }} maxWidth="max-w-2xl">
          <div className="space-y-5 p-1 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Configure Impact Event Folder</h3>
              <p className="text-slate-500 text-[10px]">Add multiple photos, tag locations, and write a field description.</p>
            </div>

            {galleryError && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl font-bold text-[11px] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>{galleryError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Folder Title / Event Name</label>
                <input
                  type="text"
                  value={editingGallery.title}
                  onChange={(e) => setEditingGallery({ ...editingGallery, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none bg-slate-50/50"
                  placeholder="e.g. Joy of Warmth - Sundarbans Blanket Drive"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={editingGallery.category}
                  onChange={(e) => setEditingGallery({ ...editingGallery, category: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white"
                >
                  <option value="cloth_drives">Cloth & Blanket Drives</option>
                  <option value="children">Child Pathshalas</option>
                  <option value="women">Women Empowerment</option>
                  <option value="crafts">Artisan Crafts</option>
                  <option value="events">Other Field Drives</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Location Conducted</label>
                <input
                  type="text"
                  value={editingGallery.location}
                  onChange={(e) => setEditingGallery({ ...editingGallery, location: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none bg-slate-50/50"
                  placeholder="e.g. Gosaba, Sundarbans"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Date Conducted</label>
                <input
                  type="text"
                  value={editingGallery.date}
                  onChange={(e) => setEditingGallery({ ...editingGallery, date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none bg-slate-50/50"
                  placeholder="e.g. July 2026"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Brief Description of Impact</label>
                <textarea
                  value={editingGallery.description}
                  onChange={(e) => setEditingGallery({ ...editingGallery, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none h-20 resize-none bg-slate-50/50"
                  placeholder="Summarize what volunteers did and who was supported..."
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Photographer / Credit (Optional)</label>
                <input
                  type="text"
                  value={editingGallery.photographer || ''}
                  onChange={(e) => setEditingGallery({ ...editingGallery, photographer: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none bg-slate-50/50"
                  placeholder="e.g. Suman Roy"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Folder Cover Photo URL (Primary)</label>
                <input
                  type="text"
                  value={editingGallery.imageUrl}
                  onChange={(e) => setEditingGallery({ ...editingGallery, imageUrl: e.target.value, highResUrl: e.target.value, thumbnailUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:outline-none bg-slate-50/50"
                  placeholder="Paste cover photo link or select from list below"
                />
              </div>
            </div>

            {/* Multiple Images Management Section */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  <Images className="w-4 h-4 text-amber-500" />
                  <span>Images inside Folder ({(editingGallery.images || []).length})</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-bold">Base64 uploads or URLs supported</span>
              </div>

              {/* Upload image as sub-photo */}
              <div className="space-y-2.5">
                <p className="text-[10px] text-slate-500 font-bold">Upload a new sub-photo to include in this event folder:</p>
                <ImageUpload
                  id="gallery-sub-image-upload"
                  label=""
                  value=""
                  maxWidth={600}
                  maxHeight={450}
                  quality={0.55}
                  onChange={(newImgVal) => {
                    if (newImgVal) {
                      const currentImages = editingGallery.images || [];
                      // Prevent duplicate
                      if (!currentImages.includes(newImgVal)) {
                        const updatedImages = [...currentImages, newImgVal];
                        // If no cover photo is set yet, make this the cover photo!
                        let coverVal = editingGallery.imageUrl;
                        if (!coverVal || coverVal.startsWith('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c')) {
                          coverVal = newImgVal;
                        }
                        setEditingGallery({
                          ...editingGallery,
                          imageUrl: coverVal,
                          highResUrl: coverVal,
                          thumbnailUrl: coverVal,
                          images: updatedImages
                        });
                      }
                    }
                  }}
                />
              </div>

              {/* Thumbnail list of current folder images */}
              {(editingGallery.images || []).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[180px] overflow-y-auto pr-1">
                  {(editingGallery.images || []).map((imgUrl, index) => {
                    const isCover = editingGallery.imageUrl === imgUrl;
                    return (
                      <div key={index} className={`relative rounded-xl overflow-hidden border bg-white p-1 shadow-3xs flex flex-col justify-between ${isCover ? 'border-amber-500' : 'border-slate-200'}`}>
                        <img src={imgUrl} className="w-full h-14 object-cover rounded-lg" alt="" />
                        <div className="flex gap-1 pt-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingGallery({
                              ...editingGallery,
                              imageUrl: imgUrl,
                              highResUrl: imgUrl,
                              thumbnailUrl: imgUrl
                            })}
                            className={`flex-1 py-0.5 rounded text-[8px] font-black uppercase text-center transition-all ${
                              isCover ? 'bg-amber-500 text-slate-900 cursor-default' : 'bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-slate-950 cursor-pointer'
                            }`}
                            disabled={isCover}
                          >
                            {isCover ? 'Cover' : 'Set Cover'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const remaining = (editingGallery.images || []).filter((_, i) => i !== index);
                              let nextCover = editingGallery.imageUrl;
                              // If deleted cover photo, set cover to next available image
                              if (isCover && remaining.length > 0) {
                                nextCover = remaining[0];
                              } else if (remaining.length === 0) {
                                nextCover = '';
                              }
                              setEditingGallery({
                                ...editingGallery,
                                imageUrl: nextCover,
                                highResUrl: nextCover,
                                thumbnailUrl: nextCover,
                                images: remaining
                              });
                            }}
                            className="px-1.5 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[8px] cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 italic text-center py-4 bg-white/50 rounded-xl border border-dashed border-slate-200">No photos added yet. Upload an image above to populate the folder.</p>
              )}
            </div>

             {/* Bottom Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => { setEditingGallery(null); setGalleryError(null); }} 
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingGallery.title) {
                    setGalleryError('Please enter a title for the gallery folder');
                    return;
                  }
                  if (!editingGallery.imageUrl) {
                    setGalleryError('Please upload or set at least one photo for this folder');
                    return;
                  }
                  setGalleryError(null);
                  if (onSaveGalleryItem) {
                    onSaveGalleryItem(editingGallery);
                  }
                  setEditingGallery(null);
                  confetti({ particleCount: 50 });
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-bold transition-all shadow-sm cursor-pointer text-xs"
              >
                Save Gallery Folder
              </button>
            </div>
          </div>
        </GlassModal>
      )}
    </div>
  );
};
