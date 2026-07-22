'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useStore, type CartItem } from '@/store/useStore';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// lucide-react icons
import {
  Star,
  ShoppingCart,
  Menu,
  X,
  Plus,
  Minus,
  Trash2,
  Heart,
  Sparkles,
  Package,
  Key as KeychainIcon,
  Image as ImageIcon,
  Shirt,
  Gem,
  Settings,
  Send,
  MessageCircle,
  Upload,
  Pencil,
  Play,
  Facebook,
  ExternalLink,
  Phone,
  Mail,
  LogOut,
  ChevronLeft,
  Palette,
  Store,
  ShoppingBag,
  CreditCard,
  Check,
  Loader2,
  DollarSign,
  FolderOpen,
  Grid3x3,
  Info,
} from 'lucide-react';

// ===================== TYPES =====================

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  images: string;
  featured: boolean;
  active: boolean;
  category?: { id: string; name: string; slug: string; icon: string };
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  _count?: { products: number };
}

interface GalleryItem {
  id: string;
  title: string;
  type: string;
  url: string;
  thumbnail: string;
  order: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: string;
  total: number;
  status: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isForwarded: boolean;
  createdAt: string;
}

// ===================== HELPERS =====================

function formatPrice(price: number): string {
  return `$${price.toFixed(2)} MXN`;
}

function parseImages(imagesStr: string): string[] {
  try {
    const parsed = JSON.parse(imagesStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getStockBadge(stock: number) {
  if (stock === 0)
    return <Badge variant="destructive">Agotado</Badge>;
  if (stock <= 5)
    return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Quedan {stock}</Badge>;
  return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">En stock</Badge>;
}

function getCategoryIcon(slug: string): React.ReactNode {
  const iconMap: Record<string, React.ReactNode> = {
    pines: <Package className="size-6" />,
    llaveros: <KeychainIcon className="size-6" />,
    'dibujos-impresos': <ImageIcon className="size-6" />,
    'ropa-modificada': <Shirt className="size-6" />,
    'joyeria-economica': <Gem className="size-6" />,
  };
  return iconMap[slug] || <Package className="size-6" />;
}

const sessionId = typeof crypto !== 'undefined'
  ? crypto.randomUUID()
  : Math.random().toString(36).slice(2);

// ===================== MAIN PAGE =====================

export default function HomePage() {
  const store = useStore();

  // Local state
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoggingIn, setAdminLoggingIn] = useState(false);

  // Admin form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [galleryViewOpen, setGalleryViewOpen] = useState<GalleryItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);

  // Checkout form
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [forwardInfo, setForwardInfo] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageCountRef = useRef(0);

  // Product form state
  const [pFormName, setPFormName] = useState('');
  const [pFormDesc, setPFormDesc] = useState('');
  const [pFormPrice, setPFormPrice] = useState('');
  const [pFormStock, setPFormStock] = useState('');
  const [pFormCategory, setPFormCategory] = useState('');
  const [pFormImages, setPFormImages] = useState<string[]>([]);
  const [pFormFeatured, setPFormFeatured] = useState(false);
  const [pFormActive, setPFormActive] = useState(true);

  // Category form state
  const [cFormName, setCFormName] = useState('');
  const [cFormSlug, setCFormSlug] = useState('');
  const [cFormIcon, setCFormIcon] = useState('📦');
  const [cFormOrder, setCFormOrder] = useState('0');

  // Admin price change
  const [pricePercent, setPricePercent] = useState('');

  // Settings form
  const [sFormName, setSFormName] = useState('');
  const [sFormDesc, setSFormDesc] = useState('');
  const [sFormWhatsapp, setSFormWhatsapp] = useState('');
  const [sFormEmail, setSFormEmail] = useState('');
  const [sFormFbUrl, setSFormFbUrl] = useState('');
  const [sFormMlUrl, setSFormMlUrl] = useState('');
  const [sFormPassword, setSFormPassword] = useState('');
  const [sFormPrimary, setSFormPrimary] = useState('#e91e8c');
  const [sFormAccent, setSFormAccent] = useState('#a855f7');
  const [sFormBg, setSFormBg] = useState('#0f0a1a');
  const [sFormText, setSFormText] = useState('#f8fafc');

  // Product detail quantity
  const [detailQty, setDetailQty] = useState(1);
  const [detailImgIdx, setDetailImgIdx] = useState(0);

  // ===================== DATA LOADING =====================

  useEffect(() => {
    async function loadInitial() {
      try {
        const [settingsRes, catsRes, featuredRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/categories'),
          fetch('/api/products?featured=true'),
        ]);
        const [settingsData, catsData, featuredData] = await Promise.all([
          settingsRes.json(),
          catsRes.json(),
          featuredRes.json(),
        ]);
        store.setSettings(settingsData);
        setCategories(catsData || []);
        setFeaturedProducts(featuredData || []);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();

  }, []);

  // Load products when catalog is opened
  useEffect(() => {
    if (store.currentView === 'catalog') {
      loadAllProducts();
    }

  }, [store.currentView, store.selectedCategoryId]);

  async function loadAllProducts() {
    try {
      let url = '/api/products';
      if (store.selectedCategoryId) {
        url += `?categoryId=${store.selectedCategoryId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setAllProducts(data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  }

  // Load all products for admin (including inactive)
  async function loadAdminProducts() {
    try {
      const res = await fetch('/api/products?featured=false');
      const activeRes = await fetch('/api/products');
      const [inactive, active] = await Promise.all([res.json(), activeRes.json()]);
      const activeIds = new Set((active || []).map((p: Product) => p.id));
      const inactiveOnly = (inactive || []).filter((p: Product) => !activeIds.has(p.id));
      setAllProducts([...(active || []), ...inactiveOnly]);
    } catch (err) {
      console.error('Failed to load admin products:', err);
    }
  }

  // Load gallery
  async function loadGallery() {
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      setGalleryItems(data || []);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    }
  }

  // Load orders for admin
  async function loadOrders() {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  }

  // Load chat messages
  async function loadChat() {
    try {
      const res = await fetch(`/api/chat?sessionId=${sessionId}`);
      const data = await res.json();
      setChatMessages(data || []);
      messageCountRef.current = (data || []).filter((m: ChatMessage) => m.role === 'user').length;
    } catch (err) {
      console.error('Failed to load chat:', err);
    }
  }

  useEffect(() => {
    if (store.chatOpen) loadChat();

  }, [store.chatOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Admin view effects
  useEffect(() => {
    if (store.isAdmin) {
      if (store.adminView === 'products' || store.adminView === 'orders') loadAdminProducts();
      if (store.adminView === 'orders') loadOrders();
      if (store.adminView === 'gallery') loadGallery();
      if (store.adminView === 'categories') {
        fetch('/api/categories').then((r) => r.json()).then(setCategories);
      }
    }

  }, [store.isAdmin, store.adminView]);

  // Gallery view effect
  useEffect(() => {
    if (store.currentView === 'gallery') loadGallery();

  }, [store.currentView]);

  // Populate settings form when settings load
  useEffect(() => {
    if (store.settings) {
      setSFormName(store.settings.storeName || '');
      setSFormDesc(store.settings.storeDescription || '');
      setSFormWhatsapp(store.settings.whatsappNumber || '');
      setSFormEmail(store.settings.email || '');
      setSFormFbUrl(store.settings.facebookUrl || '');
      setSFormMlUrl(store.settings.mercadoLibreUrl || '');
      setSFormPrimary(store.settings.primaryColor || '#e91e8c');
      setSFormAccent(store.settings.accentColor || '#a855f7');
      setSFormBg(store.settings.bgColor || '#0f0a1a');
      setSFormText(store.settings.textColor || '#f8fafc');
    }
  }, [store.settings]);

  // ===================== HANDLERS =====================

  function navigateTo(view: 'home' | 'catalog' | 'gallery' | 'checkout') {
    store.setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAddToCart(product: Product, qty: number = 1) {
    const images = parseImages(product.images);
    store.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      image: images[0] || '',
    });
    toast.success(`${product.name} agregado al carrito`);
  }

  async function handleSendChat() {
    if (!chatInput.trim() || chatSending) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatSending(true);

    try {
      const body: any = { sessionId, content: msg };
      if (showContactForm) {
        body.customerName = contactName;
        body.customerEmail = contactEmail;
        body.customerPhone = contactPhone;
      }
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      const newMessages = [...chatMessages, data.botMessage];
      setChatMessages(newMessages);
      messageCountRef.current += 1;

      if (data.forwardInfo) {
        setForwardInfo(data.forwardInfo);
        toast.success('¡Información de contacto enviada!');
      }

      // After 3 messages without resolution, prompt for contact info
      if (messageCountRef.current >= 3 && !showContactForm && !data.forwardInfo) {
        setShowContactForm(true);
      }
    } catch (err) {
      toast.error('Error al enviar mensaje');
    } finally {
      setChatSending(false);
    }
  }

  async function handleCheckout() {
    if (!checkoutName || !checkoutEmail || !checkoutPhone) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    if (store.cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    try {
      const total = store.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: checkoutName,
          customerEmail: checkoutEmail,
          customerPhone: checkoutPhone,
          items: store.cart.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          total,
        }),
      });
      if (res.ok) {
        setOrderSuccess(true);
        store.clearCart();
        toast.success('¡Pedido realizado con éxito!');
      } else {
        toast.error('Error al crear el pedido');
      }
    } catch (err) {
      toast.error('Error al procesar el pedido');
    }
  }

  async function handleAdminLogin() {
    if (!adminPassword) return;
    setAdminLoggingIn(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });
      if (res.ok) {
        const data = await res.json();
        store.setIsAdmin(true);
        if (data.settings) store.setSettings(data.settings);
        setAdminLoginOpen(false);
        setAdminPassword('');
        toast.success('Bienvenido al panel de administración');
      } else {
        toast.error('Contraseña incorrecta');
      }
    } catch {
      toast.error('Error al iniciar sesión');
    } finally {
      setAdminLoggingIn(false);
    }
  }

  function openProductForm(product?: Product) {
    if (product) {
      setEditingProduct(product);
      setPFormName(product.name);
      setPFormDesc(product.description);
      setPFormPrice(String(product.price));
      setPFormStock(String(product.stock));
      setPFormCategory(product.categoryId);
      setPFormImages(parseImages(product.images));
      setPFormFeatured(product.featured);
      setPFormActive(product.active);
    } else {
      setEditingProduct(null);
      setPFormName('');
      setPFormDesc('');
      setPFormPrice('');
      setPFormStock('');
      setPFormCategory(categories[0]?.id || '');
      setPFormImages([]);
      setPFormFeatured(false);
      setPFormActive(true);
    }
    setProductFormOpen(true);
  }

  async function handleSaveProduct() {
    if (!pFormName || !pFormPrice) {
      toast.error('Nombre y precio son requeridos');
      return;
    }
    try {
      const body = {
        id: editingProduct?.id,
        name: pFormName,
        description: pFormDesc,
        price: parseFloat(pFormPrice),
        stock: parseInt(pFormStock) || 0,
        categoryId: pFormCategory,
        images: JSON.stringify(pFormImages),
        featured: pFormFeatured,
        active: pFormActive,
      };
      const res = await fetch(editingProduct ? '/api/products' : '/api/products', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editingProduct ? 'Producto actualizado' : 'Producto creado');
        setProductFormOpen(false);
        loadAdminProducts();
      } else {
        toast.error('Error al guardar producto');
      }
    } catch {
      toast.error('Error al guardar producto');
    }
  }

  async function handleDeleteProduct(id: string) {
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Producto eliminado');
        loadAdminProducts();
      } else {
        toast.error('Error al eliminar producto');
      }
    } catch {
      toast.error('Error al eliminar producto');
    }
  }

  async function handlePriceChangeAll() {
    const percent = parseFloat(pricePercent);
    if (isNaN(percent)) {
      toast.error('Ingresa un porcentaje válido');
      return;
    }
    try {
      const updated = allProducts.map((p) => ({
        ...p,
        price: Math.round(p.price * (1 + percent / 100) * 100) / 100,
      }));
      for (const p of updated) {
        await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            stock: p.stock,
            categoryId: p.categoryId,
            images: p.images,
            featured: p.featured,
            active: p.active,
          }),
        });
      }
      toast.success(`Precios actualizados ${percent > 0 ? '+' : ''}${percent}%`);
      setPricePercent('');
      loadAdminProducts();
    } catch {
      toast.error('Error al actualizar precios');
    }
  }

  function openCategoryForm(cat?: Category) {
    if (cat) {
      setEditingCategory(cat);
      setCFormName(cat.name);
      setCFormSlug(cat.slug);
      setCFormIcon(cat.icon);
      setCFormOrder(String(cat.order));
    } else {
      setEditingCategory(null);
      setCFormName('');
      setCFormSlug('');
      setCFormIcon('📦');
      setCFormOrder('0');
    }
    setCategoryFormOpen(true);
  }

  async function handleSaveCategory() {
    if (!cFormName || !cFormSlug) {
      toast.error('Nombre y slug son requeridos');
      return;
    }
    try {
      const body = {
        id: editingCategory?.id,
        name: cFormName,
        slug: cFormSlug,
        icon: cFormIcon,
        order: parseInt(cFormOrder) || 0,
      };
      const res = await fetch(editingCategory ? '/api/categories' : '/api/categories', {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editingCategory ? 'Categoría actualizada' : 'Categoría creada');
        setCategoryFormOpen(false);
        const catsRes = await fetch('/api/categories');
        setCategories(await catsRes.json());
      } else {
        toast.error('Error al guardar categoría');
      }
    } catch {
      toast.error('Error al guardar categoría');
    }
  }

  async function handleDeleteCategory(id: string) {
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Categoría eliminada');
        const catsRes = await fetch('/api/categories');
        setCategories(await catsRes.json());
      } else {
        toast.error('Error al eliminar categoría');
      }
    } catch {
      toast.error('Error al eliminar categoría');
    }
  }

  async function handleUploadFile(file: File, type: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    return data.url;
  }

  async function handleDeleteGalleryItem(id: string) {
    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Elemento eliminado');
        loadGallery();
      }
    } catch {
      toast.error('Error al eliminar');
    }
  }

  async function handleSaveSettings() {
    try {
      const body: any = {
        storeName: sFormName,
        storeDescription: sFormDesc,
        primaryColor: sFormPrimary,
        accentColor: sFormAccent,
        bgColor: sFormBg,
        textColor: sFormText,
        whatsappNumber: sFormWhatsapp,
        email: sFormEmail,
        facebookUrl: sFormFbUrl,
        mercadoLibreUrl: sFormMlUrl,
      };
      if (sFormPassword) body.adminPassword = sFormPassword;
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        store.setSettings(data);
        toast.success('Configuración guardada');
        setSFormPassword('');
      } else {
        toast.error('Error al guardar');
      }
    } catch {
      toast.error('Error al guardar');
    }
  }

  async function handleUpdateOrderStatus(id: string, status: string) {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        toast.success('Estado actualizado');
        loadOrders();
      }
    } catch {
      toast.error('Error al actualizar');
    }
  }

  function resetProductDetail() {
    setDetailQty(1);
    setDetailImgIdx(0);
  }

  useEffect(() => {
    if (store.selectedProduct) resetProductDetail();
  }, [store.selectedProduct]);

  const cartTotal = store.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = store.cart.reduce((sum, item) => sum + item.quantity, 0);
  const storeName = store.settings?.storeName || 'Kawaii Anime Store';
  const storeDesc = store.settings?.storeDescription || 'Tienda mexicana de anime artesanal';
  const heroImg = store.settings?.heroImage || '';

  // ===================== RENDER =====================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center anime-gradient">
        <div className="text-center">
          <Sparkles className="size-12 text-pink-500 mx-auto mb-4 animate-pulse" />
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col anime-gradient">
        {/* ============ HEADER ============ */}
        <header className="sticky top-0 z-40 glass-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Star className="size-6 text-pink-500 fill-pink-500" />
              <span className="font-bold text-lg hidden sm:block">{storeName}</span>
              <span className="font-bold text-lg sm:hidden">KAS</span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {(['home', 'catalog', 'gallery'] as const).map((view) => {
                const labels: Record<string, string> = {
                  home: 'Inicio',
                  catalog: 'Catálogo',
                  gallery: 'Galería',
                };
                const icons: Record<string, React.ReactNode> = {
                  home: <Sparkles className="size-4" />,
                  catalog: <ShoppingBag className="size-4" />,
                  gallery: <ImageIcon className="size-4" />,
                };
                return (
                  <Button
                    key={view}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigateTo(view);
                    }}
                    className={
                      store.currentView === view && !store.isAdmin
                        ? 'text-pink-400 hover:text-pink-400'
                        : 'text-gray-300 hover:text-pink-400'
                    }
                  >
                    {icons[view]}
                    {labels[view]}
                  </Button>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (store.isAdmin) {
                    store.setIsAdmin(false);
                    toast.success('Sesión de admin cerrada');
                  } else {
                    setAdminLoginOpen(true);
                  }
                }}
                className={
                  store.isAdmin
                    ? 'text-purple-400 hover:text-purple-400'
                    : 'text-gray-300 hover:text-purple-400'
                }
              >
                <Settings className="size-4" />
                Admin
              </Button>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => store.setCartOpen(true)}
                className="relative text-gray-300 hover:text-pink-400"
              >
                <ShoppingCart className="size-5" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold rounded-full size-5 flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-300 hover:text-pink-400"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-72 bg-[#1a1225] border-pink-500/20">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-pink-400 flex items-center gap-2">
                <Star className="size-5 fill-pink-500" /> {storeName}
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2">
              {(['home', 'catalog', 'gallery'] as const).map((view) => {
                const labels: Record<string, string> = { home: 'Inicio', catalog: 'Catálogo', gallery: 'Galería' };
                return (
                  <Button
                    key={view}
                    variant={store.currentView === view && !store.isAdmin ? 'secondary' : 'ghost'}
                    className="justify-start text-left"
                    onClick={() => navigateTo(view)}
                  >
                    {labels[view]}
                  </Button>
                );
              })}
              <Separator className="my-2 bg-white/10" />
              <Button
                variant={store.isAdmin ? 'secondary' : 'ghost'}
                className="justify-start text-left"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (store.isAdmin) {
                    store.setIsAdmin(false);
                    toast.success('Sesión de admin cerrada');
                  } else {
                    setAdminLoginOpen(true);
                  }
                }}
              >
                <Settings className="size-4 mr-2" /> Admin
              </Button>
            </nav>
          </SheetContent>
        </Sheet>

        {/* ============ MAIN CONTENT ============ */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            {/* ---- ADMIN PANEL ---- */}
            {store.isAdmin ? (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Settings className="size-6 text-purple-400" /> Panel de Administración
                  </h1>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => store.setIsAdmin(false)}
                    className="text-gray-300"
                  >
                    <LogOut className="size-4 mr-2" /> Salir
                  </Button>
                </div>

                <Tabs value={store.adminView} onValueChange={(v) => store.setAdminView(v as any)}>
                  <TabsList className="flex-wrap h-auto gap-1 bg-white/5 p-1">
                    {([
                      { value: 'products', label: 'Productos', icon: <Package className="size-4" /> },
                      { value: 'categories', label: 'Categorías', icon: <FolderOpen className="size-4" /> },
                      { value: 'orders', label: 'Pedidos', icon: <ShoppingBag className="size-4" /> },
                      { value: 'gallery', label: 'Galería', icon: <ImageIcon className="size-4" /> },
                      { value: 'appearance', label: 'Apariencia', icon: <Palette className="size-4" /> },
                      { value: 'settings', label: 'Configuración', icon: <Store className="size-4" /> },
                    ] as const).map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400 text-gray-400"
                      >
                        {tab.icon} {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* ADMIN: Products */}
                  <TabsContent value="products" className="mt-6 space-y-6">
                    {/* Price Change */}
                    <Card className="glass-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Cambiar precios masivamente</CardTitle>
                        <CardDescription>Aplica un porcentaje de cambio a todos los productos</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[200px]">
                          <Label>Porcentaje (%)</Label>
                          <Input
                            type="number"
                            placeholder="Ej: 10 o -5"
                            value={pricePercent}
                            onChange={(e) => setPricePercent(e.target.value)}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <Button onClick={handlePriceChangeAll} className="bg-pink-600 hover:bg-pink-700">
                          <DollarSign className="size-4 mr-2" /> Aplicar
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Products Table */}
                    <Card className="glass-card">
                      <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>Productos</CardTitle>
                        <Button onClick={() => openProductForm()} className="bg-pink-600 hover:bg-pink-700">
                          <Plus className="size-4 mr-2" /> Agregar
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="max-h-[500px]">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-gray-400">Producto</TableHead>
                                <TableHead className="text-gray-400">Precio</TableHead>
                                <TableHead className="text-gray-400 hidden sm:table-cell">Stock</TableHead>
                                <TableHead className="text-gray-400 hidden md:table-cell">Categoría</TableHead>
                                <TableHead className="text-gray-400">Estado</TableHead>
                                <TableHead className="text-gray-400 text-right">Acciones</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {allProducts.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                                    No hay productos
                                  </TableCell>
                                </TableRow>
                              ) : (
                                allProducts.map((product) => (
                                  <TableRow key={product.id} className="border-white/10">
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{formatPrice(product.price)}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{product.stock}</TableCell>
                                    <TableCell className="hidden md:table-cell">{product.category?.name || '-'}</TableCell>
                                    <TableCell>
                                      <div className="flex gap-1">
                                        {product.active ? (
                                          <Badge className="bg-green-500/20 text-green-400">Activo</Badge>
                                        ) : (
                                          <Badge variant="secondary">Inactivo</Badge>
                                        )}
                                        {product.featured && (
                                          <Badge className="bg-pink-500/20 text-pink-400">★ Destacado</Badge>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-1">
                                        <Button size="icon" variant="ghost" className="size-8" onClick={() => openProductForm(product)}>
                                          <Pencil className="size-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="size-8 text-red-400" onClick={() => setDeleteConfirm({ type: 'product', id: product.id, name: product.name })}>
                                          <Trash2 className="size-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ADMIN: Categories */}
                  <TabsContent value="categories" className="mt-6">
                    <Card className="glass-card">
                      <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>Categorías</CardTitle>
                        <Button onClick={() => openCategoryForm()} className="bg-pink-600 hover:bg-pink-700">
                          <Plus className="size-4 mr-2" /> Agregar
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {categories.length === 0 ? (
                            <p className="text-gray-500 col-span-full text-center py-8">No hay categorías</p>
                          ) : (
                            categories.map((cat) => (
                              <Card key={cat.id} className="glass-card p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{cat.icon}</span>
                                  <div>
                                    <p className="font-medium">{cat.name}</p>
                                    <p className="text-sm text-gray-400">{cat.slug} · {cat._count?.products || 0} productos</p>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="icon" variant="ghost" className="size-8" onClick={() => openCategoryForm(cat)}>
                                    <Pencil className="size-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="size-8 text-red-400" onClick={() => setDeleteConfirm({ type: 'category', id: cat.id, name: cat.name })}>
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              </Card>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ADMIN: Orders */}
                  <TabsContent value="orders" className="mt-6">
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle>Pedidos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="max-h-[500px]">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-gray-400">Fecha</TableHead>
                                <TableHead className="text-gray-400">Cliente</TableHead>
                                <TableHead className="text-gray-400 hidden sm:table-cell">Email</TableHead>
                                <TableHead className="text-gray-400">Total</TableHead>
                                <TableHead className="text-gray-400">Estado</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {orders.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                    No hay pedidos
                                  </TableCell>
                                </TableRow>
                              ) : (
                                orders.map((order) => (
                                  <TableRow key={order.id} className="border-white/10">
                                    <TableCell className="text-sm text-gray-300">
                                      {new Date(order.createdAt).toLocaleDateString('es-MX')}
                                    </TableCell>
                                    <TableCell className="font-medium">{order.customerName}</TableCell>
                                    <TableCell className="hidden sm:table-cell text-gray-300">{order.customerEmail}</TableCell>
                                    <TableCell>{formatPrice(order.total)}</TableCell>
                                    <TableCell>
                                      <Select
                                        value={order.status}
                                        onValueChange={(v) => handleUpdateOrderStatus(order.id, v)}
                                      >
                                        <SelectTrigger className="w-[140px] h-8 text-xs bg-white/5 border-white/10">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">Pendiente</SelectItem>
                                          <SelectItem value="confirmed">Confirmado</SelectItem>
                                          <SelectItem value="shipped">Enviado</SelectItem>
                                          <SelectItem value="delivered">Entregado</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ADMIN: Gallery */}
                  <TabsContent value="gallery" className="mt-6">
                    <Card className="glass-card">
                      <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>Galería</CardTitle>
                        <label className="cursor-pointer">
                          <Button asChild className="bg-pink-600 hover:bg-pink-700">
                            <span><Upload className="size-4 mr-2" /> Subir imagen</span>
                          </Button>
                          <input
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const url = await handleUploadFile(file, 'gallery');
                              await fetch('/api/gallery', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  title: file.name,
                                  type: file.type.startsWith('video') ? 'video' : 'image',
                                  url,
                                  thumbnail: url,
                                }),
                              });
                              loadGallery();
                              toast.success('Imagen subida');
                            }}
                          />
                        </label>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {galleryItems.length === 0 ? (
                            <p className="text-gray-500 col-span-full text-center py-8">No hay elementos en la galería</p>
                          ) : (
                            galleryItems.map((item) => (
                              <div key={item.id} className="relative group">
                                {item.type === 'video' ? (
                                  <div className="aspect-square glass-card rounded-xl flex items-center justify-center">
                                    <Play className="size-10 text-pink-400" />
                                  </div>
                                ) : (
                                  <img
                                    src={item.url}
                                    alt={item.title}
                                    className="w-full aspect-square object-cover rounded-xl border border-white/10"
                                  />
                                )}
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="absolute top-2 right-2 size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleDeleteGalleryItem(item.id)}
                                >
                                  <Trash2 className="size-3" />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ADMIN: Appearance */}
                  <TabsContent value="appearance" className="mt-6">
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Palette className="size-5 text-purple-400" /> Apariencia</CardTitle>
                        <CardDescription>Cambia los colores de la tienda</CardDescription>
                      </CardHeader>
                      <CardContent className="grid sm:grid-cols-2 gap-6">
                        {[
                          { label: 'Color primario', value: sFormPrimary, setter: setSFormPrimary },
                          { label: 'Color de acento', value: sFormAccent, setter: setSFormAccent },
                          { label: 'Fondo', value: sFormBg, setter: setSFormBg },
                          { label: 'Texto', value: sFormText, setter: setSFormText },
                        ].map((color) => (
                          <div key={color.label} className="space-y-2">
                            <Label>{color.label}</Label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={color.value}
                                onChange={(e) => color.setter(e.target.value)}
                                className="size-10 rounded-lg cursor-pointer border-0 bg-transparent"
                              />
                              <Input
                                value={color.value}
                                onChange={(e) => color.setter(e.target.value)}
                                className="bg-white/5 border-white/10"
                              />
                            </div>
                          </div>
                        ))}
                        <div className="sm:col-span-2">
                          <Button onClick={handleSaveSettings} className="bg-purple-600 hover:bg-purple-700">
                            <Check className="size-4 mr-2" /> Aplicar cambios
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ADMIN: Settings */}
                  <TabsContent value="settings" className="mt-6">
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle>Configuración general</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nombre de la tienda</Label>
                            <Input value={sFormName} onChange={(e) => setSFormName(e.target.value)} className="bg-white/5 border-white/10" />
                          </div>
                          <div className="space-y-2">
                            <Label>WhatsApp</Label>
                            <Input value={sFormWhatsapp} onChange={(e) => setSFormWhatsapp(e.target.value)} placeholder="+521234567890" className="bg-white/5 border-white/10" />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label>Descripción</Label>
                            <Textarea value={sFormDesc} onChange={(e) => setSFormDesc(e.target.value)} className="bg-white/5 border-white/10" />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={sFormEmail} onChange={(e) => setSFormEmail(e.target.value)} className="bg-white/5 border-white/10" />
                          </div>
                          <div className="space-y-2">
                            <Label>URL de Facebook</Label>
                            <Input value={sFormFbUrl} onChange={(e) => setSFormFbUrl(e.target.value)} className="bg-white/5 border-white/10" />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label>URL de Mercado Libre</Label>
                            <Input value={sFormMlUrl} onChange={(e) => setSFormMlUrl(e.target.value)} className="bg-white/5 border-white/10" />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label>Nueva contraseña de admin (dejar vacío para no cambiar)</Label>
                            <Input type="password" value={sFormPassword} onChange={(e) => setSFormPassword(e.target.value)} className="bg-white/5 border-white/10" />
                          </div>
                        </div>
                        <Button onClick={handleSaveSettings} className="bg-pink-600 hover:bg-pink-700">
                          <Check className="size-4 mr-2" /> Guardar configuración
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            ) : store.currentView === 'home' ? (
              /* ---- HOME VIEW ---- */
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Hero */}
                <section className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 via-purple-500/5 to-transparent" />
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="text-center md:text-left">
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <Badge className="mb-4 bg-pink-500/20 text-pink-400 border-pink-500/30 text-sm px-4 py-1">
                            <Sparkles className="size-3 mr-1" /> Tienda Artesanal Mexicana
                          </Badge>
                        </motion.div>
                        <motion.h1
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-4xl md:text-6xl font-bold mb-4"
                          style={{
                            background: 'linear-gradient(135deg, #e91e8c, #a855f7)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          {storeName}
                        </motion.h1>
                        <motion.p
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-gray-300 text-lg mb-8 max-w-lg mx-auto md:mx-0"
                        >
                          {storeDesc || 'Pines, llaveros, dibujos impresos, ropa modificada y joyería con estética kawaii y anime.'}
                        </motion.p>
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="flex gap-4 justify-center md:justify-start"
                        >
                          <Button
                            size="lg"
                            className="bg-pink-600 hover:bg-pink-700 rounded-full px-8 text-base"
                            onClick={() => navigateTo('catalog')}
                          >
                            <ShoppingBag className="size-5 mr-2" /> Ver Catálogo
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 rounded-full px-8 text-base"
                            onClick={() => navigateTo('gallery')}
                          >
                            <ImageIcon className="size-5 mr-2" /> Galería
                          </Button>
                        </motion.div>
                      </div>
                      {heroImg && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                          className="hidden md:block"
                        >
                          <img
                            src={heroImg}
                            alt="Hero"
                            className="w-full max-w-md mx-auto rounded-2xl shadow-2xl pink-glow"
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                  {/* Decorative stars */}
                  <div className="absolute top-20 left-10 text-pink-500/20 twinkle">
                    <Star className="size-6 fill-pink-500/20" />
                  </div>
                  <div className="absolute top-40 right-20 text-purple-500/20 twinkle" style={{ animationDelay: '1s' }}>
                    <Star className="size-8 fill-purple-500/20" />
                  </div>
                  <div className="absolute bottom-20 left-1/3 text-pink-500/15 twinkle" style={{ animationDelay: '0.5s' }}>
                    <Star className="size-4 fill-pink-500/15" />
                  </div>
                </section>

                {/* Featured Products */}
                {featuredProducts.length > 0 && (
                  <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Heart className="size-6 text-pink-500" /> Productos Destacados
                    </h2>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                      {featuredProducts.map((product) => {
                        const images = parseImages(product.images);
                        return (
                          <motion.div
                            key={product.id}
                            whileHover={{ scale: 1.03, y: -4 }}
                            className="min-w-[220px] max-w-[260px] flex-shrink-0"
                          >
                            <Card
                              className="glass-card rounded-xl cursor-pointer overflow-hidden group"
                              onClick={() => store.setSelectedProduct(product)}
                            >
                              <div className="aspect-square overflow-hidden">
                                {images[0] ? (
                                  <img
                                    src={images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                    <Package className="size-12 text-gray-600" />
                                  </div>
                                )}
                              </div>
                              <CardContent className="p-4">
                                <h3 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h3>
                                <p className="text-pink-400 font-bold">{formatPrice(product.price)}</p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Categories */}
                {categories.length > 0 && (
                  <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Grid3x3 className="size-6 text-purple-400" /> Categorías
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {categories.map((cat) => (
                        <motion.div key={cat.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                          <Card
                            className="glass-card rounded-xl cursor-pointer p-6 text-center group hover:border-pink-500/30 transition-colors"
                            onClick={() => {
                              store.setSelectedCategoryId(cat.id);
                              navigateTo('catalog');
                            }}
                          >
                            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{cat.icon || getCategoryIcon(cat.slug)}</div>
                            <h3 className="font-medium text-sm mb-1">{cat.name}</h3>
                            <p className="text-xs text-gray-400">{cat._count?.products || 0} productos</p>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

                {/* About */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                  <Card className="glass-card rounded-xl overflow-hidden">
                    <div className="grid md:grid-cols-2 items-center">
                      <CardContent className="p-8">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                          <Info className="size-6 text-purple-400" /> Sobre Nosotros
                        </h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                          Somos una tienda mexicana apasionada por el anime y el arte kawaii. Cada producto es hecho con amor y dedicación,
                          desde nuestros pines y llaveros hasta nuestras modificaciones de ropa únicas.
                        </p>
                        <p className="text-gray-300 leading-relaxed">
                          ¡Explora nuestro catálogo y encuentra algo especial para ti! Si no encuentras lo que buscas,
                          contáctanos y podemos crear algo personalizado.
                        </p>
                      </CardContent>
                      <div className="hidden md:flex items-center justify-center p-8">
                        <div className="text-center">
                          <Star className="size-20 text-pink-500/20 mx-auto mb-4" />
                          <p className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #e91e8c, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Hecho con ❤️ en México
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </section>
              </motion.div>
            ) : store.currentView === 'catalog' ? (
              /* ---- CATALOG VIEW ---- */
              <motion.div
                key="catalog"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
              >
                <h1 className="text-3xl font-bold mb-6">Catálogo</h1>

                {/* Category Tabs */}
                {categories.length > 0 && (
                  <Tabs
                    value={store.selectedCategoryId || 'all'}
                    onValueChange={(v) => {
                      store.setSelectedCategoryId(v === 'all' ? null : v);
                    }}
                    className="mb-6"
                  >
                    <TabsList className="flex-wrap h-auto gap-1 bg-white/5 p-1">
                      <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400 text-gray-400"
                      >
                        Todos
                      </TabsTrigger>
                      {categories.map((cat) => (
                        <TabsTrigger
                          key={cat.id}
                          value={cat.id}
                          className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400 text-gray-400"
                        >
                          <span className="mr-1">{cat.icon}</span> {cat.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                )}

                {/* Product Grid */}
                {allProducts.length === 0 ? (
                  <div className="text-center py-16">
                    <Package className="size-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No hay productos disponibles</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {allProducts.map((product) => {
                      const images = parseImages(product.images);
                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -4 }}
                        >
                          <Card
                            className="glass-card rounded-xl cursor-pointer overflow-hidden group"
                            onClick={() => store.setSelectedProduct(product)}
                          >
                            <div className="aspect-square overflow-hidden relative">
                              {images[0] ? (
                                <img
                                  src={images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                  <Package className="size-12 text-gray-600" />
                                </div>
                              )}
                              {product.featured && (
                                <Badge className="absolute top-2 left-2 bg-pink-500/80 text-white text-[10px]">
                                  <Star className="size-3 mr-1 fill-white" /> Destacado
                                </Badge>
                              )}
                            </div>
                            <CardContent className="p-3">
                              <h3 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h3>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-pink-400 font-bold text-sm">{formatPrice(product.price)}</span>
                                {getStockBadge(product.stock)}
                              </div>
                              <Button
                                size="sm"
                                className="w-full bg-pink-600 hover:bg-pink-700 rounded-full text-xs h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                }}
                                disabled={product.stock === 0}
                              >
                                <ShoppingCart className="size-3 mr-1" /> Agregar
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : store.currentView === 'gallery' ? (
              /* ---- GALLERY VIEW ---- */
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
              >
                <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <ImageIcon className="size-8 text-pink-500" /> Galería
                </h1>
                {galleryItems.length === 0 ? (
                  <div className="text-center py-16">
                    <ImageIcon className="size-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No hay elementos en la galería</p>
                  </div>
                ) : (
                  <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {galleryItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="break-inside-avoid"
                      >
                        <Card
                          className="glass-card rounded-xl overflow-hidden cursor-pointer group"
                          onClick={() => setGalleryViewOpen(item)}
                        >
                          <div className="relative">
                            {item.type === 'video' ? (
                              <div className="aspect-video bg-white/5 flex items-center justify-center">
                                <div className="text-center">
                                  <Play className="size-12 text-pink-400 mx-auto mb-2" />
                                  <p className="text-xs text-gray-400 px-2 line-clamp-2">{item.title}</p>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={item.url}
                                alt={item.title}
                                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                style={{ aspectRatio: `${(index % 3) + 3}/${(index % 2) + 2}` }}
                              />
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : store.currentView === 'checkout' ? (
              /* ---- CHECKOUT VIEW ---- */
              <motion.div
                key="checkout"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto px-4 sm:px-6 py-6"
              >
                <Button variant="ghost" size="sm" onClick={() => navigateTo('catalog')} className="mb-4 text-gray-400">
                  <ChevronLeft className="size-4 mr-1" /> Seguir comprando
                </Button>

                {orderSuccess ? (
                  <Card className="glass-card rounded-xl p-8 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="size-10 text-green-400" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">¡Pedido realizado!</h2>
                      <p className="text-gray-400 mb-6">Gracias por tu compra. Nos pondremos en contacto contigo pronto.</p>
                      <Button onClick={() => { setOrderSuccess(false); navigateTo('home'); }} className="bg-pink-600 hover:bg-pink-700 rounded-full">
                        Volver al inicio
                      </Button>
                    </motion.div>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    <h1 className="text-3xl font-bold">Checkout</h1>

                    {/* Customer info */}
                    <Card className="glass-card rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-lg">Datos de contacto</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Nombre completo</Label>
                          <Input value={checkoutName} onChange={(e) => setCheckoutName(e.target.value)} placeholder="Tu nombre" className="bg-white/5 border-white/10" />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={checkoutEmail} onChange={(e) => setCheckoutEmail(e.target.value)} placeholder="tu@email.com" className="bg-white/5 border-white/10" />
                          </div>
                          <div className="space-y-2">
                            <Label>Teléfono</Label>
                            <Input type="tel" value={checkoutPhone} onChange={(e) => setCheckoutPhone(e.target.value)} placeholder="+52 123 456 7890" className="bg-white/5 border-white/10" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Order summary */}
                    <Card className="glass-card rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-lg">Resumen del pedido</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {store.cart.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">El carrito está vacío</p>
                        ) : (
                          <>
                            <ScrollArea className="max-h-60">
                              {store.cart.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 py-2">
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                                  ) : (
                                    <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                                      <Package className="size-5 text-gray-600" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.name}</p>
                                    <p className="text-xs text-gray-400">x{item.quantity}</p>
                                  </div>
                                  <p className="text-sm font-semibold text-pink-400">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                              ))}
                            </ScrollArea>
                            <Separator className="bg-white/10" />
                            <div className="flex items-center justify-between pt-2">
                              <span className="font-bold text-lg">Total</span>
                              <span className="font-bold text-lg text-pink-400">{formatPrice(cartTotal)}</span>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    {/* Payment */}
                    <Card className="glass-card rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-lg">Método de pago</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button
                          className="w-full bg-pink-600 hover:bg-pink-700 rounded-full py-6 text-base"
                          onClick={handleCheckout}
                          disabled={store.cart.length === 0}
                        >
                          <CreditCard className="size-5 mr-2" /> Pagar con tarjeta (simulado)
                        </Button>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {store.settings?.mercadoLibreUrl && (
                            <Button
                              variant="outline"
                              className="rounded-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                              asChild
                            >
                              <a href={store.settings.mercadoLibreUrl} target="_blank" rel="noopener noreferrer">
                                Comprar por Mercado Libre <ExternalLink className="size-4 ml-2" />
                              </a>
                            </Button>
                          )}
                          {store.settings?.facebookUrl && (
                            <Button
                              variant="outline"
                              className="rounded-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                              asChild
                            >
                              <a href={store.settings.facebookUrl} target="_blank" rel="noopener noreferrer">
                                <Facebook className="size-4 mr-2" /> Comprar por Facebook <ExternalLink className="size-4 ml-2" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </main>

        {/* ============ PRODUCT DETAIL MODAL ============ */}
        <Dialog open={!!store.selectedProduct} onOpenChange={(open) => { if (!open) store.setSelectedProduct(null); }}>
          {store.selectedProduct && (
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1a1225] border-white/10">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Images */}
                <div className="space-y-3">
                  <div className="aspect-square rounded-xl overflow-hidden bg-white/5">
                    {parseImages(store.selectedProduct.images)[detailImgIdx] ? (
                      <img
                        src={parseImages(store.selectedProduct.images)[detailImgIdx]}
                        alt={store.selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="size-20 text-gray-600" />
                      </div>
                    )}
                  </div>
                  {parseImages(store.selectedProduct.images).length > 1 && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {parseImages(store.selectedProduct.images).map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setDetailImgIdx(idx)}
                          className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                            idx === detailImgIdx ? 'border-pink-500' : 'border-transparent'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-4">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">{store.selectedProduct.name}</DialogTitle>
                    <DialogDescription className="sr-only">Detalle del producto</DialogDescription>
                  </DialogHeader>

                  <div className="text-3xl font-bold text-pink-400">
                    {formatPrice(store.selectedProduct.price)}
                  </div>

                  <div className="flex items-center gap-2">
                    {getStockBadge(store.selectedProduct.stock)}
                    {store.selectedProduct.category && (
                      <Badge variant="outline" className="text-gray-400 border-white/20">
                        {store.selectedProduct.category.icon} {store.selectedProduct.category.name}
                      </Badge>
                    )}
                  </div>

                  {store.selectedProduct.description && (
                    <p className="text-gray-300 leading-relaxed">{store.selectedProduct.description}</p>
                  )}

                  <Separator className="bg-white/10" />

                  {/* Quantity */}
                  <div className="flex items-center gap-4">
                    <Label>Cantidad</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-9 border-white/20"
                        onClick={() => setDetailQty(Math.max(1, detailQty - 1))}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-10 text-center font-semibold">{detailQty}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-9 border-white/20"
                        onClick={() => setDetailQty(detailQty + 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-pink-600 hover:bg-pink-700 rounded-full py-6 text-base"
                    onClick={() => {
                      handleAddToCart(store.selectedProduct, detailQty);
                      store.setSelectedProduct(null);
                    }}
                    disabled={store.selectedProduct.stock === 0}
                  >
                    <ShoppingCart className="size-5 mr-2" /> Agregar al carrito
                  </Button>

                  <div className="space-y-2">
                    {store.settings?.mercadoLibreUrl && (
                      <Button variant="outline" className="w-full rounded-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10" asChild>
                        <a href={store.settings.mercadoLibreUrl} target="_blank" rel="noopener noreferrer">
                          Comprar por Mercado Libre <ExternalLink className="size-4 ml-2" />
                        </a>
                      </Button>
                    )}
                    {store.settings?.facebookUrl && (
                      <Button variant="outline" className="w-full rounded-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10" asChild>
                        <a href={store.settings.facebookUrl} target="_blank" rel="noopener noreferrer">
                          <Facebook className="size-4 mr-2" /> Comprar por Facebook <ExternalLink className="size-4 ml-2" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>

        {/* ============ CART DRAWER ============ */}
        <Sheet open={store.cartOpen} onOpenChange={store.setCartOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md bg-[#1a1225] border-pink-500/20">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-pink-400">
                <ShoppingCart className="size-5" /> Carrito ({cartCount})
              </SheetTitle>
              <SheetDescription>Tus productos seleccionados</SheetDescription>
            </SheetHeader>

            {store.cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16">
                <ShoppingCart className="size-16 text-gray-600 mb-4" />
                <p className="text-gray-400">Tu carrito está vacío</p>
                <Button variant="ghost" className="mt-4 text-pink-400" onClick={() => { store.setCartOpen(false); navigateTo('catalog'); }}>
                  Ver productos
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 px-4">
                  <div className="space-y-4 py-4">
                    {store.cart.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                        ) : (
                          <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="size-6 text-gray-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-sm text-pink-400 font-semibold">{formatPrice(item.price)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Button size="icon" variant="ghost" className="size-7" onClick={() => store.updateQuantity(item.id, item.quantity - 1)}>
                              <Minus className="size-3" />
                            </Button>
                            <span className="text-sm w-6 text-center">{item.quantity}</span>
                            <Button size="icon" variant="ghost" className="size-7" onClick={() => store.updateQuantity(item.id, item.quantity + 1)}>
                              <Plus className="size-3" />
                            </Button>
                            <Button size="icon" variant="ghost" className="size-7 text-red-400 ml-auto" onClick={() => store.removeFromCart(item.id)}>
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-300">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <SheetFooter className="border-t border-white/10 pt-4 space-y-3">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-xl text-pink-400">{formatPrice(cartTotal)}</span>
                  </div>
                  <Button className="w-full bg-pink-600 hover:bg-pink-700 rounded-full py-6" onClick={() => { store.setCartOpen(false); navigateTo('checkout'); }}>
                    Proceder al pago
                  </Button>
                </SheetFooter>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* ============ GALLERY VIEW MODAL ============ */}
        <Dialog open={!!galleryViewOpen} onOpenChange={(open) => { if (!open) setGalleryViewOpen(null); }}>
          {galleryViewOpen && (
            <DialogContent className="max-w-4xl bg-[#1a1225] border-white/10">
              <DialogHeader>
                <DialogTitle>{galleryViewOpen.title || 'Imagen'}</DialogTitle>
              </DialogHeader>
              {galleryViewOpen.type === 'video' ? (
                <div className="aspect-video bg-black rounded-xl flex items-center justify-center">
                  <p className="text-gray-400">Reproductor de video no disponible en preview</p>
                </div>
              ) : (
                <img src={galleryViewOpen.url} alt={galleryViewOpen.title} className="w-full rounded-xl" />
              )}
            </DialogContent>
          )}
        </Dialog>

        {/* ============ ADMIN LOGIN DIALOG ============ */}
        <Dialog open={adminLoginOpen} onOpenChange={setAdminLoginOpen}>
          <DialogContent className="max-w-sm bg-[#1a1225] border-white/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="size-5 text-purple-400" /> Acceso de Administrador
              </DialogTitle>
              <DialogDescription>Ingresa la contraseña para acceder al panel</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Contraseña</Label>
                <Input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAdminLogin(); }}
                  placeholder="••••••"
                  className="bg-white/5 border-white/10"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setAdminLoginOpen(false)}>Cancelar</Button>
              <Button onClick={handleAdminLogin} disabled={adminLoggingIn || !adminPassword} className="bg-purple-600 hover:bg-purple-700">
                {adminLoggingIn && <Loader2 className="size-4 mr-2 animate-spin" />}
                Iniciar sesión
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============ PRODUCT FORM DIALOG ============ */}
        <Dialog open={productFormOpen} onOpenChange={setProductFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1a1225] border-white/10">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Nombre</Label>
                  <Input value={pFormName} onChange={(e) => setPFormName(e.target.value)} className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Descripción</Label>
                  <Textarea value={pFormDesc} onChange={(e) => setPFormDesc(e.target.value)} className="bg-white/5 border-white/10" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Precio (MXN)</Label>
                  <Input type="number" step="0.01" value={pFormPrice} onChange={(e) => setPFormPrice(e.target.value)} className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input type="number" value={pFormStock} onChange={(e) => setPFormStock(e.target.value)} className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={pFormCategory} onValueChange={setPFormCategory}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Imágenes</Label>
                  <div className="flex flex-wrap gap-2">
                    {pFormImages.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16">
                        <img src={img} alt="" className="w-full h-full object-cover rounded-lg border border-white/10" />
                        <button
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full size-5 flex items-center justify-center text-xs"
                          onClick={() => setPFormImages(pFormImages.filter((_, i) => i !== idx))}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <label className="w-16 h-16 glass-card rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                      <Upload className="size-5 text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await handleUploadFile(file, 'products');
                          setPFormImages([...pFormImages, url]);
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={pFormFeatured} onCheckedChange={setPFormFeatured} />
                    <Label>Destacado</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={pFormActive} onCheckedChange={setPFormActive} />
                    <Label>Activo</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setProductFormOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveProduct} className="bg-pink-600 hover:bg-pink-700">
                {editingProduct ? 'Guardar cambios' : 'Crear producto'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============ CATEGORY FORM DIALOG ============ */}
        <Dialog open={categoryFormOpen} onOpenChange={setCategoryFormOpen}>
          <DialogContent className="max-w-md bg-[#1a1225] border-white/10">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={cFormName} onChange={(e) => setCFormName(e.target.value)} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={cFormSlug} onChange={(e) => setCFormSlug(e.target.value)} placeholder="ej: pines" className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Icono (emoji)</Label>
                <Input value={cFormIcon} onChange={(e) => setCFormIcon(e.target.value)} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Orden</Label>
                <Input type="number" value={cFormOrder} onChange={(e) => setCFormOrder(e.target.value)} className="bg-white/5 border-white/10" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setCategoryFormOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveCategory} className="bg-pink-600 hover:bg-pink-700">
                {editingCategory ? 'Guardar cambios' : 'Crear categoría'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============ DELETE CONFIRMATION ============ */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
          <AlertDialogContent className="bg-[#1a1225] border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar {deleteConfirm?.type === 'product' ? 'producto' : 'categoría'}?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará &quot;{deleteConfirm?.name}&quot; permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  if (!deleteConfirm) return;
                  if (deleteConfirm.type === 'product') handleDeleteProduct(deleteConfirm.id);
                  else handleDeleteCategory(deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ============ CHATBOT ============ */}
        {!store.isAdmin && (
          <>
            {/* Floating button */}
            <motion.div
              className="fixed bottom-6 right-6 z-50"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: 'spring' }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className="size-14 rounded-full bg-pink-600 hover:bg-pink-700 shadow-lg pink-glow"
                    onClick={() => store.setChatOpen(!store.chatOpen)}
                  >
                    {store.chatOpen ? <X className="size-6" /> : <MessageCircle className="size-6" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Chat de ayuda</TooltipContent>
              </Tooltip>
            </motion.div>

            {/* Chat Sheet */}
            <Sheet open={store.chatOpen} onOpenChange={store.setChatOpen}>
              <SheetContent side="right" className="w-full sm:max-w-sm bg-[#1a1225] border-pink-500/20 flex flex-col">
                <SheetHeader className="pb-3">
                  <SheetTitle className="flex items-center gap-2 text-pink-400">
                    <MessageCircle className="size-5" /> Chat de ayuda
                  </SheetTitle>
                  <SheetDescription>¡Pregúntanos lo que quieras!</SheetDescription>
                </SheetHeader>

                {/* Messages */}
                <ScrollArea className="flex-1 px-2">
                  <div className="space-y-3 py-4">
                    {chatMessages.length === 0 && (
                      <div className="text-center text-gray-500 text-sm py-8">
                        ¡Hola! 👋 ¿En qué podemos ayudarte?
                      </div>
                    )}
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                            msg.role === 'user'
                              ? 'bg-pink-600 text-white rounded-br-md'
                              : 'bg-white/10 text-gray-200 rounded-bl-md'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {chatSending && (
                      <div className="flex justify-start">
                        <div className="bg-white/10 rounded-2xl rounded-bl-md px-4 py-2">
                          <Loader2 className="size-4 animate-spin text-pink-400" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>

                {/* Contact form (after 3 messages) */}
                {showContactForm && !forwardInfo && (
                  <div className="px-4 pb-3 space-y-2 border-t border-white/10 pt-3">
                    <p className="text-xs text-gray-400">Déjanos tus datos para contactarte:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Nombre"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="h-8 text-xs bg-white/5 border-white/10"
                      />
                      <Input
                        placeholder="Teléfono"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="h-8 text-xs bg-white/5 border-white/10"
                      />
                      <Input
                        placeholder="Email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="h-8 text-xs bg-white/5 border-white/10 col-span-2"
                      />
                    </div>
                  </div>
                )}

                {/* Forward buttons */}
                {forwardInfo && (
                  <div className="px-4 pb-3 space-y-2 border-t border-white/10 pt-3">
                    <p className="text-xs text-green-400">✓ Información enviada. También puedes contactarnos directamente:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {forwardInfo.whatsappLink && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 rounded-full text-xs" asChild>
                          <a href={forwardInfo.whatsappLink} target="_blank" rel="noopener noreferrer">
                            <Phone className="size-3 mr-1" /> WhatsApp
                          </a>
                        </Button>
                      )}
                      {forwardInfo.email && (
                        <Button size="sm" variant="outline" className="rounded-full text-xs border-white/20" asChild>
                          <a href={`mailto:${forwardInfo.email}?subject=Consulta desde chatbot&body=${encodeURIComponent(forwardInfo.customerInfo?.message || '')}`}>
                            <Mail className="size-3 mr-1" /> Email
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="px-4 pb-4 pt-2 border-t border-white/10">
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                      placeholder="Escribe tu mensaje..."
                      className="bg-white/5 border-white/10"
                      disabled={chatSending}
                    />
                    <Button size="icon" className="bg-pink-600 hover:bg-pink-700 flex-shrink-0" onClick={handleSendChat} disabled={chatSending || !chatInput.trim()}>
                      <Send className="size-4" />
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </>
        )}

        {/* ============ FOOTER ============ */}
        <footer className="mt-auto border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="grid sm:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Star className="size-5 text-pink-500 fill-pink-500" /> {storeName}
                </h3>
                <p className="text-gray-400 text-sm">{storeDesc}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-pink-400">Enlaces</h4>
                <div className="space-y-2">
                  <button onClick={() => navigateTo('home')} className="block text-sm text-gray-400 hover:text-pink-400 transition-colors">Inicio</button>
                  <button onClick={() => navigateTo('catalog')} className="block text-sm text-gray-400 hover:text-pink-400 transition-colors">Catálogo</button>
                  <button onClick={() => navigateTo('gallery')} className="block text-sm text-gray-400 hover:text-pink-400 transition-colors">Galería</button>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-pink-400">Síguenos</h4>
                <div className="space-y-2">
                  {store.settings?.facebookUrl && (
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400 p-0 h-auto" asChild>
                      <a href={store.settings.facebookUrl} target="_blank" rel="noopener noreferrer">
                        <Facebook className="size-4 mr-2" /> Facebook
                      </a>
                    </Button>
                  )}
                  {store.settings?.mercadoLibreUrl && (
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-yellow-400 p-0 h-auto block" asChild>
                      <a href={store.settings.mercadoLibreUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-4 mr-2" /> Mercado Libre
                      </a>
                    </Button>
                  )}
                  {store.settings?.whatsappNumber && (
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-400 p-0 h-auto block" asChild>
                      <a href={`https://wa.me/${store.settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                        <Phone className="size-4 mr-2" /> WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <Separator className="bg-white/10 mb-4" />
            <div className="text-center text-sm text-gray-500">
              <p>© {new Date().getFullYear()} {storeName}. Todos los derechos reservados.</p>
              <p className="mt-1">Powered by <span className="text-pink-400">Kawaii Anime Store</span> ✨</p>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}