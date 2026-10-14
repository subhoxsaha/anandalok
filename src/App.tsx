import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getCauses,
  getProducts,
  getEvents,
  getBlogPosts,
  getGalleryItems,
  getDonations,
  getVolunteerRegistrations,
  getHeroImages,
  saveHeroImage,
  deleteHeroImage,
  getCurrentUser,
  setCurrentUser,
  getUsers,
  saveCause,
  deleteCause,
  saveProduct,
  deleteProduct,
  saveEvent,
  deleteEvent,
  saveBlogPost,
  deleteBlogPost,
  saveGalleryItem,
  deleteGalleryItem,
  recordDonation,
  registerVolunteerForEvent,
  updateVolunteerRegistrationStatus,
  getOrders,
  appBus
} from './lib/storage';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  User,
  Cause,
  ArtisanProduct,
  VolunteerEvent,
  BlogPost,
  GalleryItem,
  Donation,
  VolunteerRegistration,
  HeroImage,
  ArtisanOrder
} from './types';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HeroSection } from './components/home/HeroSection';
import { CausesSection } from './components/home/CausesSection';
import { ArtisanMarketplaceSection } from './components/home/ArtisanMarketplaceSection';
import { MarketplacePage } from './components/marketplace/MarketplacePage';
import { ExtendedCheckoutPage } from './components/marketplace/ExtendedCheckoutPage';
import { GallerySection } from './components/home/GallerySection';
import { BlogSection } from './components/home/BlogSection';
import { FullBlogPage } from './components/blog/FullBlogPage';
import { CMSDashboard } from './components/cms/CMSDashboard';
import { DonationModal } from './components/donation/DonationModal';
import { AuthModal } from './components/auth/AuthModal';
import { CraftCartModal } from './components/marketplace/CraftCartModal';
import { FeedbackModal } from './components/common/FeedbackModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');

  // Adjust screen position (scroll to top) during page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Dynamic Data State
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [currentUser, setCurrentUserState] = useState<User>(getCurrentUser());
  const [causes, setCauses] = useState<Cause[]>(getCauses());
  const [products, setProducts] = useState<ArtisanProduct[]>(getProducts());

  useEffect(() => {
    // Initial data hydration transition to show skeleton loading state
    const timer = setTimeout(() => {
      setIsLoadingData(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);
  const [events, setEvents] = useState<VolunteerEvent[]>(getEvents());
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(getBlogPosts());
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(getGalleryItems());
  const [donations, setDonations] = useState<Donation[]>(getDonations());
  const [registrations, setRegistrations] = useState<VolunteerRegistration[]>(getVolunteerRegistrations());
  const [heroImages, setHeroImages] = useState<HeroImage[]>(getHeroImages());
  const [orders, setOrders] = useState<ArtisanOrder[]>(getOrders());
  const [users, setUsers] = useState<User[]>(getUsers());

  // Cart State
  const [cart, setCart] = useState<{ product: ArtisanProduct; quantity: number }[]>([]);
  const [isCartDropdownOpen, setIsCartDropdownOpen] = useState(false);

  // Modals
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [selectedCauseIdForDonate, setSelectedCauseIdForDonate] = useState<string | undefined>(undefined);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<ArtisanProduct | null>(null);

  // Subscribe to storage changes for live real-time state sync across tabs
  useEffect(() => {
    const handleCausesChange = () => setCauses(getCauses());
    const handleProductsChange = () => setProducts(getProducts());
    const handleEventsChange = () => setEvents(getEvents());
    const handleBlogsChange = () => setBlogPosts(getBlogPosts());
    const handleGalleryChange = () => setGalleryItems(getGalleryItems());
    const handleDonationsChange = () => setDonations(getDonations());
    const handleVolunteersChange = () => setRegistrations(getVolunteerRegistrations());
    const handleUserChange = () => setCurrentUserState(getCurrentUser());
    const handleHeroImagesChange = () => setHeroImages(getHeroImages());
    const handleOrdersChange = () => setOrders(getOrders());
    const handleUsersChange = () => setUsers(getUsers());

    appBus.addEventListener('causes_changed', handleCausesChange);
    appBus.addEventListener('products_changed', handleProductsChange);
    appBus.addEventListener('events_changed', handleEventsChange);
    appBus.addEventListener('blogs_changed', handleBlogsChange);
    appBus.addEventListener('gallery_changed', handleGalleryChange);
    appBus.addEventListener('donations_changed', handleDonationsChange);
    appBus.addEventListener('volunteers_changed', handleVolunteersChange);
    appBus.addEventListener('user_changed', handleUserChange);
    appBus.addEventListener('hero_images_changed', handleHeroImagesChange);
    appBus.addEventListener('orders_changed', handleOrdersChange);
    appBus.addEventListener('users_changed', handleUsersChange);

    return () => {
      appBus.removeEventListener('causes_changed', handleCausesChange);
      appBus.removeEventListener('products_changed', handleProductsChange);
      appBus.removeEventListener('events_changed', handleEventsChange);
      appBus.removeEventListener('blogs_changed', handleBlogsChange);
      appBus.removeEventListener('gallery_changed', handleGalleryChange);
      appBus.removeEventListener('donations_changed', handleDonationsChange);
      appBus.removeEventListener('volunteers_changed', handleVolunteersChange);
      appBus.removeEventListener('user_changed', handleUserChange);
      appBus.removeEventListener('hero_images_changed', handleHeroImagesChange);
      appBus.removeEventListener('orders_changed', handleOrdersChange);
      appBus.removeEventListener('users_changed', handleUsersChange);
    };
  }, []);

  // Listen to live Firebase Auth state changes
  useEffect(() => {
    const ADMIN_WHITELIST = [
      'subhoxsaha@gmail.com', // Active User Email from runtime metadata
      'admin@anandalok.org',  // Standard seed admin email
    ];

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const cached = getCurrentUser();
        // If the cached profile is for a different user, or is the default guest Priya Sharma,
        // sync the Firebase user details.
        if (cached.id !== firebaseUser.uid) {
          const email = firebaseUser.email || '';
          const name = firebaseUser.displayName || email.split('@')[0] || 'Google User';
          const avatar = firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
          
          // Determine roles. Default to general_user unless they are in ADMIN_WHITELIST or have active local storage admin token
          let role: User['role'] = 'general_user';
          const isWhitelisted = ADMIN_WHITELIST.includes(email.toLowerCase()) || email.toLowerCase().includes('admin');
          
          if (isWhitelisted) {
            role = 'central_admin';
          } else {
            const localString = localStorage.getItem('anandalok_current_user_v1');
            if (localString) {
              try {
                const u = JSON.parse(localString);
                if (u.id === firebaseUser.uid && u.role === 'central_admin') {
                  role = 'central_admin';
                }
              } catch (err) {}
            }
          }

          const user: User = {
            id: firebaseUser.uid,
            name,
            email,
            role,
            avatar,
            joinedDate: new Date().toISOString().split('T')[0]
          };
          setCurrentUser(user);
          setCurrentUserState(user);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Cart Handlers
  const handleAddToCart = (product: ArtisanProduct, qtyToAdd: number = 1) => {
    if (!currentUser || currentUser.id === 'guest' || !currentUser.email) {
      setIsAuthOpen(true);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + qtyToAdd } : item
        );
      }
      return [...prev, { product, quantity: qtyToAdd }];
    });
    setIsCartDropdownOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCart((prev) => prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item)));
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOpenDonate = (causeId?: string) => {
    if (!currentUser || currentUser.id === 'guest' || !currentUser.email) {
      setIsAuthOpen(true);
      return;
    }
    setSelectedCauseIdForDonate(causeId);
    setIsDonateOpen(true);
  };

  const handleCompleteDonation = (donation: Donation) => {
    recordDonation(donation);
  };

  const handleRegisterVolunteerEvent = (
    eventId: string,
    volunteerName: string,
    volunteerEmail: string,
    volunteerPhone: string
  ) => {
    const foundEvent = events.find((e) => e.id === eventId);
    const reg: VolunteerRegistration = {
      id: `vreg-${Date.now()}`,
      eventId,
      eventTitle: foundEvent?.title || 'Anandalok Field Event',
      volunteerId: currentUser.id,
      volunteerName,
      volunteerEmail,
      volunteerPhone,
      status: 'pending',
      registeredAt: new Date().toISOString().split('T')[0]
    };
    registerVolunteerForEvent(reg);
  };

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    setCurrentUserState(user);
  };

  const handleSwitchUserRole = (role: User['role']) => {
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
    setCurrentUserState(updated);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-amber-200 selection:text-amber-900">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenDonate={handleOpenDonate}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        onOpenCart={() => setIsCartDropdownOpen(!isCartDropdownOpen)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        isCartDropdownOpen={isCartDropdownOpen}
        setIsCartDropdownOpen={setIsCartDropdownOpen}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {activeTab === 'home' && (
              <>
                <HeroSection heroImages={heroImages} onOpenDonate={handleOpenDonate} setActiveTab={setActiveTab} />
                <CausesSection causes={causes} onOpenDonate={handleOpenDonate} setActiveTab={setActiveTab} isLoading={isLoadingData} />
                <ArtisanMarketplaceSection
                  products={products}
                  onAddToCart={handleAddToCart}
                  onOpenProductDetail={setSelectedProductForDetail}
                  setActiveTab={setActiveTab}
                  isLoading={isLoadingData}
                />
                <GallerySection items={galleryItems} isHome setActiveTab={setActiveTab} />
                <BlogSection posts={blogPosts} setActiveTab={setActiveTab} />
              </>
            )}

            {activeTab === 'causes' && (
              <CausesSection causes={causes} onOpenDonate={handleOpenDonate} setActiveTab={setActiveTab} isLoading={isLoadingData} />
            )}

            {activeTab === 'marketplace' && (
              <MarketplacePage
                products={products}
                onAddToCart={handleAddToCart}
                selectedProduct={selectedProductForDetail}
                setSelectedProduct={setSelectedProductForDetail}
                onOpenDonate={() => handleOpenDonate()}
              />
            )}

            {(activeTab === 'cart' || activeTab === 'checkout') && (
              <ExtendedCheckoutPage
                cart={cart}
                onUpdateQuantity={handleUpdateCartQuantity}
                onRemoveItem={handleRemoveCartItem}
                onClearCart={() => setCart([])}
                currentUser={currentUser}
                setActiveTab={setActiveTab}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            )}

            {activeTab === 'gallery' && <GallerySection items={galleryItems} />}

            {activeTab === 'blog' && <FullBlogPage posts={blogPosts} setActiveTab={setActiveTab} />}

            {activeTab === 'cms' && (
              <CMSDashboard
                currentUser={currentUser}
                blogPosts={blogPosts}
                events={events}
                products={products}
                causes={causes}
                registrations={registrations}
                donations={donations}
                heroImages={heroImages}
                orders={orders}
                users={users}
                galleryItems={galleryItems}
                onSaveBlogPost={saveBlogPost}
                onDeleteBlogPost={deleteBlogPost}
                onSaveEvent={saveEvent}
                onDeleteEvent={deleteEvent}
                onSaveProduct={saveProduct}
                onDeleteProduct={deleteProduct}
                onSaveCause={saveCause}
                onDeleteCause={deleteCause}
                onSaveHeroImage={saveHeroImage}
                onDeleteHeroImage={deleteHeroImage}
                onSaveGalleryItem={saveGalleryItem}
                onDeleteGalleryItem={deleteGalleryItem}
                onUpdateRegStatus={updateVolunteerRegistrationStatus}
                onSwitchUserRole={handleSwitchUserRole}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} onOpenDonate={() => handleOpenDonate()} onOpenFeedback={() => setIsFeedbackOpen(true)} />

      {/* Global Modals */}
      <DonationModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
        causes={causes}
        selectedCauseId={selectedCauseIdForDonate}
        onCompleteDonation={handleCompleteDonation}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
      />

      <CraftCartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCart([])}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
