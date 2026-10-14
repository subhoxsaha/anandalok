import {
  Cause,
  ArtisanProduct,
  VolunteerEvent,
  BlogPost,
  GalleryItem,
  Donation,
  VolunteerRegistration,
  User,
  HeroImage,
  ArtisanOrder,
  UserFeedback
} from '../types';
import {
  INITIAL_CAUSES,
  INITIAL_ARTISAN_PRODUCTS,
  INITIAL_EVENTS,
  INITIAL_BLOG_POSTS,
  INITIAL_GALLERY,
  INITIAL_USERS,
  INITIAL_HERO_IMAGES
} from '../data/initialData';
import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

import { auth, googleProvider } from './firebase';
import { signOut } from 'firebase/auth';

const KEYS = {
  CAUSES: 'anandalok_causes_v1',
  PRODUCTS: 'anandalok_products_v1',
  EVENTS: 'anandalok_events_v1',
  BLOGS: 'anandalok_blogs_v1',
  GALLERY: 'anandalok_gallery_v1',
  DONATIONS: 'anandalok_donations_v1',
  VOLUNTEERS: 'anandalok_volunteers_v1',
  CURRENT_USER: 'anandalok_current_user_v1',
  USERS: 'anandalok_users_v1',
  HERO_IMAGES: 'anandalok_hero_images_v1',
  ORDERS: 'anandalok_orders_v1',
  FEEDBACK: 'anandalok_feedback_v1'
};

// Simple event target for reactive cross-component state updates
class AppStateBus extends EventTarget {
  notify(eventName: string) {
    this.dispatchEvent(new Event(eventName));
  }
}

export const appBus = new AppStateBus();

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T, eventName?: string) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (eventName) {
      appBus.notify(eventName);
    }
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

// Setup Firestore real-time sync with automatic seed on first run
function setupFirestoreSync<T extends { id: string }>(
  collectionName: string,
  storageKey: string,
  busEvent: string,
  initialData: T[]
) {
  try {
    const colRef = collection(db, collectionName);
    onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: T[] = [];
          snapshot.forEach((d) => {
            items.push(d.data() as T);
          });
          setStored(storageKey, items, busEvent);
        } else if (initialData.length > 0) {
          // Seed Firestore with initial data if Firestore collection is currently empty
          initialData.forEach((item) => {
            setDoc(doc(db, collectionName, item.id), item).catch((err) =>
              console.warn(`Firestore seed error [${collectionName}]:`, err)
            );
          });
        }
      },
      (error) => {
        console.warn(`Firestore listener notice [${collectionName}]:`, error.message);
      }
    );
  } catch (err) {
    console.warn(`Firestore sync init warning [${collectionName}]:`, err);
  }
}

const INITIAL_FEEDBACK: UserFeedback[] = [];

// Initialize Firestore listeners
setupFirestoreSync<Cause>('causes', KEYS.CAUSES, 'causes_changed', INITIAL_CAUSES);
setupFirestoreSync<ArtisanProduct>('products', KEYS.PRODUCTS, 'products_changed', INITIAL_ARTISAN_PRODUCTS);
setupFirestoreSync<VolunteerEvent>('events', KEYS.EVENTS, 'events_changed', INITIAL_EVENTS);
setupFirestoreSync<BlogPost>('blogs', KEYS.BLOGS, 'blogs_changed', INITIAL_BLOG_POSTS);
setupFirestoreSync<GalleryItem>('gallery', KEYS.GALLERY, 'gallery_changed', INITIAL_GALLERY);
setupFirestoreSync<HeroImage>('hero_images', KEYS.HERO_IMAGES, 'hero_images_changed', INITIAL_HERO_IMAGES);
setupFirestoreSync<Donation>('donations', KEYS.DONATIONS, 'donations_changed', []);
setupFirestoreSync<VolunteerRegistration>('volunteers', KEYS.VOLUNTEERS, 'volunteers_changed', []);
setupFirestoreSync<ArtisanOrder>('orders', KEYS.ORDERS, 'orders_changed', []);
setupFirestoreSync<User>('users', KEYS.USERS, 'users_changed', INITIAL_USERS);
setupFirestoreSync<UserFeedback>('feedback', KEYS.FEEDBACK, 'feedback_changed', INITIAL_FEEDBACK);

// CAUSES
export function getCauses(): Cause[] {
  return getStored<Cause[]>(KEYS.CAUSES, INITIAL_CAUSES);
}

export function saveCause(cause: Cause) {
  const causes = getCauses();
  const index = causes.findIndex((c) => c.id === cause.id);
  if (index >= 0) {
    causes[index] = cause;
  } else {
    causes.unshift(cause);
  }
  setStored(KEYS.CAUSES, causes, 'causes_changed');
  setDoc(doc(db, 'causes', cause.id), cause).catch((err) =>
    console.error('Firestore saveCause error:', err)
  );
}

export function deleteCause(id: string) {
  const causes = getCauses().filter((c) => c.id !== id);
  setStored(KEYS.CAUSES, causes, 'causes_changed');
  deleteDoc(doc(db, 'causes', id)).catch((err) =>
    console.error('Firestore deleteCause error:', err)
  );
}

// ARTISAN PRODUCTS
export function getProducts(): ArtisanProduct[] {
  return getStored<ArtisanProduct[]>(KEYS.PRODUCTS, INITIAL_ARTISAN_PRODUCTS);
}

export function saveProduct(product: ArtisanProduct) {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.unshift(product);
  }
  setStored(KEYS.PRODUCTS, products, 'products_changed');
  setDoc(doc(db, 'products', product.id), product).catch((err) =>
    console.error('Firestore saveProduct error:', err)
  );
}

export function deleteProduct(id: string) {
  const products = getProducts().filter((p) => p.id !== id);
  setStored(KEYS.PRODUCTS, products, 'products_changed');
  deleteDoc(doc(db, 'products', id)).catch((err) =>
    console.error('Firestore deleteProduct error:', err)
  );
}

// VOLUNTEER EVENTS
export function getEvents(): VolunteerEvent[] {
  return getStored<VolunteerEvent[]>(KEYS.EVENTS, INITIAL_EVENTS);
}

export function saveEvent(event: VolunteerEvent) {
  const events = getEvents();
  const index = events.findIndex((e) => e.id === event.id);
  if (index >= 0) {
    events[index] = event;
  } else {
    events.unshift(event);
  }
  setStored(KEYS.EVENTS, events, 'events_changed');
  setDoc(doc(db, 'events', event.id), event).catch((err) =>
    console.error('Firestore saveEvent error:', err)
  );
}

export function deleteEvent(id: string) {
  const events = getEvents().filter((e) => e.id !== id);
  setStored(KEYS.EVENTS, events, 'events_changed');
  deleteDoc(doc(db, 'events', id)).catch((err) =>
    console.error('Firestore deleteEvent error:', err)
  );
}

// BLOG POSTS
export function getBlogPosts(): BlogPost[] {
  return getStored<BlogPost[]>(KEYS.BLOGS, INITIAL_BLOG_POSTS);
}

export function saveBlogPost(post: BlogPost) {
  const posts = getBlogPosts();
  const index = posts.findIndex((p) => p.id === post.id);
  if (index >= 0) {
    posts[index] = post;
  } else {
    posts.unshift(post);
  }
  setStored(KEYS.BLOGS, posts, 'blogs_changed');
  setDoc(doc(db, 'blogs', post.id), post).catch((err) =>
    console.error('Firestore saveBlogPost error:', err)
  );
}

export function deleteBlogPost(id: string) {
  const posts = getBlogPosts().filter((p) => p.id !== id);
  setStored(KEYS.BLOGS, posts, 'blogs_changed');
  deleteDoc(doc(db, 'blogs', id)).catch((err) =>
    console.error('Firestore deleteBlogPost error:', err)
  );
}

// GALLERY ITEMS
export function getGalleryItems(): GalleryItem[] {
  return getStored<GalleryItem[]>(KEYS.GALLERY, INITIAL_GALLERY);
}

export function saveGalleryItem(item: GalleryItem) {
  const items = getGalleryItems();
  const index = items.findIndex((i) => i.id === item.id);
  if (index >= 0) {
    items[index] = item;
  } else {
    items.unshift(item);
  }
  setStored(KEYS.GALLERY, items, 'gallery_changed');
  setDoc(doc(db, 'gallery', item.id), item).catch((err) =>
    console.error('Firestore saveGalleryItem error:', err)
  );
}

export function deleteGalleryItem(id: string) {
  const items = getGalleryItems().filter((i) => i.id !== id);
  setStored(KEYS.GALLERY, items, 'gallery_changed');
  deleteDoc(doc(db, 'gallery', id)).catch((err) =>
    console.error('Firestore deleteGalleryItem error:', err)
  );
}

// DONATIONS
export function getDonations(): Donation[] {
  return getStored<Donation[]>(KEYS.DONATIONS, []);
}

export function recordDonation(donation: Donation) {
  const donations = getDonations();
  donations.unshift(donation);
  setStored(KEYS.DONATIONS, donations, 'donations_changed');
  setDoc(doc(db, 'donations', donation.id), donation).catch((err) =>
    console.error('Firestore recordDonation error:', err)
  );

  // Also update cause raised amount
  const causes = getCauses();
  const cause = causes.find((c) => c.id === donation.causeId);
  if (cause) {
    cause.raisedAmount += donation.amount;
    cause.donorCount += 1;
    saveCause(cause);
  }
}

// VOLUNTEER REGISTRATIONS
export function getVolunteerRegistrations(): VolunteerRegistration[] {
  return getStored<VolunteerRegistration[]>(KEYS.VOLUNTEERS, []);
}

export function registerVolunteerForEvent(registration: VolunteerRegistration) {
  const regs = getVolunteerRegistrations();
  regs.unshift(registration);
  setStored(KEYS.VOLUNTEERS, regs, 'volunteers_changed');
  setDoc(doc(db, 'volunteers', registration.id), registration).catch((err) =>
    console.error('Firestore registerVolunteer error:', err)
  );

  // Update event counts
  const events = getEvents();
  const event = events.find((e) => e.id === registration.eventId);
  if (event) {
    event.registeredVolunteers = (event.registeredVolunteers || 0) + 1;
    saveEvent(event);
  }
}

export function updateVolunteerRegistrationStatus(id: string, status: 'approved' | 'completed', hours?: number) {
  const regs = getVolunteerRegistrations();
  const reg = regs.find((r) => r.id === id);
  if (reg) {
    reg.status = status;
    if (hours !== undefined) reg.hoursLogged = hours;
    setStored(KEYS.VOLUNTEERS, regs, 'volunteers_changed');
    setDoc(doc(db, 'volunteers', reg.id), reg).catch((err) =>
      console.error('Firestore updateVolunteer error:', err)
    );
  }
}

// USER & AUTH SYSTEM
export function getUsers(): User[] {
  const users = getStored<User[]>(KEYS.USERS, INITIAL_USERS);
  return users.filter((u) => u.id !== 'user-general' && u.email !== 'priya.community@gmail.com');
}

export const GUEST_USER: User = {
  id: 'guest',
  name: 'Guest User',
  email: '',
  role: 'general_user',
  avatar: '',
  phone: '',
  location: '',
  joinedDate: ''
};

export function getCurrentUser(): User {
  const storedUser = getStored<User | null>(KEYS.CURRENT_USER, null);
  if (storedUser) {
    if (storedUser.role === ('admin' as any) || storedUser.role === ('staff_editor' as any)) {
      storedUser.role = 'central_admin';
    } else if (storedUser.role !== 'central_admin') {
      storedUser.role = 'general_user';
    }
    return storedUser;
  }
  return GUEST_USER;
}

export function logoutFirebaseUser() {
  signOut(auth).catch((err) => console.error('Firebase Auth signout error:', err));
  setCurrentUser(GUEST_USER);
}

export function setCurrentUser(user: User) {
  setStored(KEYS.CURRENT_USER, user, 'user_changed');
  
  if (user.id !== 'guest') {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    setStored(KEYS.USERS, users, 'users_changed');
  }

  // Only write to Firestore if this is a real authenticated Firebase user to prevent permission errors for guest states
  if (auth.currentUser && auth.currentUser.uid === user.id) {
    setDoc(doc(db, 'users', user.id), user).catch((err) =>
      console.error('Firestore setCurrentUser error:', err)
    );
  }
}

// HERO IMAGES
export function getHeroImages(): HeroImage[] {
  return getStored<HeroImage[]>(KEYS.HERO_IMAGES, INITIAL_HERO_IMAGES);
}

export function saveHeroImage(item: HeroImage) {
  const items = getHeroImages();
  const index = items.findIndex((i) => i.id === item.id);
  if (index >= 0) {
    items[index] = item;
  } else {
    items.unshift(item);
  }
  setStored(KEYS.HERO_IMAGES, items, 'hero_images_changed');
  setDoc(doc(db, 'hero_images', item.id), item).catch((err) =>
    console.error('Firestore saveHeroImage error:', err)
  );
}

export function deleteHeroImage(id: string) {
  const items = getHeroImages().filter((i) => i.id !== id);
  setStored(KEYS.HERO_IMAGES, items, 'hero_images_changed');
  deleteDoc(doc(db, 'hero_images', id)).catch((err) =>
    console.error('Firestore deleteHeroImage error:', err)
  );
}

// Reset all demo data to default initial state if requested
export function resetDemoData() {
  setStored(KEYS.CAUSES, INITIAL_CAUSES, 'causes_changed');
  setStored(KEYS.PRODUCTS, INITIAL_ARTISAN_PRODUCTS, 'products_changed');
  setStored(KEYS.BLOGS, INITIAL_BLOG_POSTS, 'blogs_changed');
  setStored(KEYS.GALLERY, INITIAL_GALLERY, 'gallery_changed');
  setStored(KEYS.USERS, INITIAL_USERS, 'user_changed');
  setStored(KEYS.HERO_IMAGES, INITIAL_HERO_IMAGES, 'hero_images_changed');
  setStored(KEYS.DONATIONS, [], 'donations_changed');
  setStored(KEYS.VOLUNTEERS, [], 'volunteers_changed');
  setStored(KEYS.ORDERS, [], 'orders_changed');
}

// ARTISAN ORDERS
export function getOrders(): ArtisanOrder[] {
  return getStored<ArtisanOrder[]>(KEYS.ORDERS, []);
}

export function saveOrder(order: ArtisanOrder) {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === order.id);
  if (index >= 0) {
    orders[index] = order;
  } else {
    orders.unshift(order);
  }
  setStored(KEYS.ORDERS, orders, 'orders_changed');
  setDoc(doc(db, 'orders', order.id), order).catch((err) =>
    console.error('Firestore saveOrder error:', err)
  );

  // When a new order is placed, reduce product stock
  if (index < 0) {
    const products = getProducts();
    order.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        prod.inStock = Math.max(0, prod.inStock - item.quantity);
        saveProduct(prod);
      }
    });
  }
}

export function updateOrderStatus(id: string, status: ArtisanOrder['status']) {
  const orders = getOrders();
  const order = orders.find((o) => o.id === id);
  if (order) {
    order.status = status;
    setStored(KEYS.ORDERS, orders, 'orders_changed');
    setDoc(doc(db, 'orders', order.id), order).catch((err) =>
      console.error('Firestore updateOrderStatus error:', err)
    );
  }
}

export function deleteOrder(id: string) {
  const orders = getOrders().filter((o) => o.id !== id);
  setStored(KEYS.ORDERS, orders, 'orders_changed');
  deleteDoc(doc(db, 'orders', id)).catch((err) =>
    console.error('Firestore deleteOrder error:', err)
  );
}

// USER FEEDBACK
export function getFeedback(): UserFeedback[] {
  const items = getStored<UserFeedback[]>(KEYS.FEEDBACK, INITIAL_FEEDBACK);
  return items.filter((f) => f.id !== 'fb-1' && f.id !== 'fb-2');
}

export function saveFeedback(fb: UserFeedback) {
  const items = getFeedback();
  const index = items.findIndex((i) => i.id === fb.id);
  if (index >= 0) {
    items[index] = fb;
  } else {
    items.unshift(fb);
  }
  setStored(KEYS.FEEDBACK, items, 'feedback_changed');
  setDoc(doc(db, 'feedback', fb.id), fb).catch((err) =>
    console.error('Firestore saveFeedback error:', err)
  );
}

export function deleteFeedback(id: string) {
  const items = getFeedback().filter((i) => i.id !== id);
  setStored(KEYS.FEEDBACK, items, 'feedback_changed');
  deleteDoc(doc(db, 'feedback', id)).catch((err) =>
    console.error('Firestore deleteFeedback error:', err)
  );
}

