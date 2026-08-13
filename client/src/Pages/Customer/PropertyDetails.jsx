import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Calendar,
  ShieldCheck,
  Building2,
  Tag,
  Home,
  ArrowLeft,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Info,
} from 'lucide-react';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
// Structured to match properties table schema.
// Replace MOCK_PROPERTIES_DETAIL with GET /api/customer/properties/:id
// when backend is ready. All field names align with the DB schema.

const MOCK_PROPERTIES_DETAIL = {
  1: {
    property_id: 1,
    title: 'Modern Family Villa',
    description:
      'This stunning modern villa offers an unparalleled living experience in the heart of Bahria Town, Islamabad. Designed with contemporary aesthetics and high-end finishes, the property features a spacious open-plan layout, floor-to-ceiling windows, a private garden, and a rooftop terrace with panoramic views. Every detail has been carefully curated to deliver the highest standard of comfort and luxury. The villa is situated in a secure, well-maintained community with 24/7 security, parks, and proximity to top schools and commercial areas.',
    property_type: 'House',
    property_status: 'For Sale',
    address: 'Street 12, Block C, Bahria Town',
    city: 'Islamabad',
    area_value: 1,
    area_unit: 'Kanal',
    bedrooms: 5,
    bathrooms: 6,
    sale_price: 25000000,
    rent_price: null,
    is_deleted: false,
    created_at: '2026-01-15',
    media: [
      {
        media_id: 1,
        url: '/src/assets/prop_villa.png',
        fallback:
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        caption: 'Front Exterior',
      },
      {
        media_id: 2,
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        fallback:
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        caption: 'Living Room',
      },
      {
        media_id: 3,
        url: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=1200&q=80',
        fallback:
          'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=1200&q=80',
        caption: 'Kitchen',
      },
      {
        media_id: 4,
        url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
        fallback:
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
        caption: 'Master Bedroom',
      },
      {
        media_id: 5,
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
        fallback:
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
        caption: 'Garden',
      },
    ],
    verification: {
      verification_status: 'Verified',
      verified_date: '10 Jul 2026',
    },
  },
  2: {
    property_id: 2,
    title: 'Luxury Apartment in DHA',
    description:
      'A beautifully appointed luxury apartment located in the prestigious DHA Phase 2, Islamabad. The apartment features premium finishes, a modern open kitchen, spacious bedrooms with built-in wardrobes, and a large balcony overlooking a lush green boulevard. Residents enjoy access to world-class amenities including a gym, swimming pool, and underground parking.',
    property_type: 'Apartment',
    property_status: 'For Sale',
    address: 'Block F, DHA Phase 2',
    city: 'Islamabad',
    area_value: 1200,
    area_unit: 'sqft',
    bedrooms: 3,
    bathrooms: 3,
    sale_price: 18500000,
    rent_price: null,
    is_deleted: false,
    created_at: '2026-02-10',
    media: [
      {
        media_id: 6,
        url: '/src/assets/prop_apartment.png',
        fallback:
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        caption: 'Building Exterior',
      },
      {
        media_id: 7,
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
        fallback:
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
        caption: 'Living Area',
      },
      {
        media_id: 8,
        url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
        fallback:
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
        caption: 'Kitchen',
      },
    ],
    verification: {
      verification_status: 'Verified',
      verified_date: '15 Jun 2026',
    },
  },
  3: {
    property_id: 3,
    title: 'Fully Furnished House',
    description:
      'A fully furnished and move-in ready house in the sought-after G-13 sector of Islamabad. This property has been tastefully decorated with high-quality furniture and fittings, making it ideal for families looking for immediate occupancy. The house is surrounded by parks and is walking distance from G-13 Markaz.',
    property_type: 'House',
    property_status: 'For Rent',
    address: 'G-13/4, Street 8',
    city: 'Islamabad',
    area_value: 10,
    area_unit: 'Marla',
    bedrooms: 4,
    bathrooms: 4,
    sale_price: null,
    rent_price: 120000,
    is_deleted: false,
    created_at: '2026-03-05',
    media: [
      {
        media_id: 9,
        url: '/src/assets/prop_house.png',
        fallback:
          'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80',
        caption: 'Front View',
      },
      {
        media_id: 10,
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        fallback:
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        caption: 'Living Room',
      },
    ],
    verification: null, // No verification yet — empty state will be shown
  },
  4: {
    property_id: 4,
    title: 'Contemporary Living Space',
    description:
      'A stunning contemporary apartment in F-7, one of Islamabad\'s most prestigious neighbourhoods. Featuring an open-concept layout, premium appliances, floor-to-ceiling glass, and a wraparound balcony. This is an exceptional opportunity to own a piece of Islamabad\'s finest real estate.',
    property_type: 'Apartment',
    property_status: 'For Sale',
    address: 'F-7/2, Margalla Road',
    city: 'Islamabad',
    area_value: 2000,
    area_unit: 'sqft',
    bedrooms: 4,
    bathrooms: 3,
    sale_price: 32000000,
    rent_price: null,
    is_deleted: false,
    created_at: '2026-01-28',
    media: [
      {
        media_id: 11,
        url: '/src/assets/prop_living_room.png',
        fallback:
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
        caption: 'Main Living Area',
      },
      {
        media_id: 12,
        url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
        fallback:
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
        caption: 'Dining Area',
      },
    ],
    verification: {
      verification_status: 'Verified',
      verified_date: '20 May 2026',
    },
  },
  5: {
    property_id: 5,
    title: 'Premium Penthouse',
    description:
      'An extraordinary penthouse in DHA Phase 5, Lahore, offering breathtaking city views and an unrivalled level of luxury. Spanning 3500 sqft, this penthouse boasts a private rooftop terrace, a chef\'s kitchen, five en-suite bedrooms, and a private elevator. This is the pinnacle of high-rise living.',
    property_type: 'Apartment',
    property_status: 'For Rent',
    address: 'Tower 3, DHA Phase 5, Main Boulevard',
    city: 'Lahore',
    area_value: 3500,
    area_unit: 'sqft',
    bedrooms: 5,
    bathrooms: 5,
    sale_price: null,
    rent_price: 250000,
    is_deleted: false,
    created_at: '2026-03-20',
    media: [
      {
        media_id: 13,
        url: '/src/assets/prop_penthouse.png',
        fallback:
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        caption: 'Penthouse Exterior',
      },
      {
        media_id: 14,
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        fallback:
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        caption: 'Rooftop Terrace',
      },
    ],
    verification: {
      verification_status: 'Verified',
      verified_date: '01 Apr 2026',
    },
  },
};

// ─── Lightbox Component ────────────────────────────────────────────────────────

const Lightbox = ({ media, activeIndex, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  const item = media[activeIndex];
  const [imgError, setImgError] = useState(false);

  return (
    <div style={lbStyles.backdrop} onClick={onClose}>
      <div style={lbStyles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button style={lbStyles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={20} color="#fff" strokeWidth={2} />
        </button>
        {/* Counter */}
        <div style={lbStyles.counter}>
          {activeIndex + 1} / {media.length}
        </div>
        {/* Image */}
        <img
          src={imgError ? item.fallback : item.url}
          alt={item.caption || 'Property image'}
          style={lbStyles.img}
          onError={() => setImgError(true)}
        />
        {/* Caption */}
        {item.caption && <div style={lbStyles.caption}>{item.caption}</div>}
        {/* Prev */}
        {media.length > 1 && (
          <button style={{ ...lbStyles.navBtn, left: '16px' }} onClick={onPrev} aria-label="Previous">
            <ChevronLeft size={24} color="#fff" strokeWidth={2.5} />
          </button>
        )}
        {/* Next */}
        {media.length > 1 && (
          <button style={{ ...lbStyles.navBtn, right: '16px' }} onClick={onNext} aria-label="Next">
            <ChevronRight size={24} color="#fff" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
};

const lbStyles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.92)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    position: 'relative',
    width: '90vw',
    maxWidth: '1000px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: '-48px',
    right: 0,
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  counter: {
    position: 'absolute',
    top: '-48px',
    left: 0,
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  img: {
    width: '100%',
    maxHeight: '75vh',
    objectFit: 'contain',
    borderRadius: '12px',
  },
  caption: {
    marginTop: '12px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  navBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)',
  },
};

// ─── Schedule Visit Modal ──────────────────────────────────────────────────────

const ScheduleVisitModal = ({ property, onClose, onConfirm }) => (
  <div style={svStyles.backdrop} onClick={onClose}>
    <div style={svStyles.modal} onClick={(e) => e.stopPropagation()}>
      <button style={svStyles.closeBtn} onClick={onClose} aria-label="Close">
        <X size={18} color="#6B7280" strokeWidth={2} />
      </button>
      <div style={svStyles.iconWrap}>
        <Calendar size={26} color="#1D6A4A" strokeWidth={1.8} />
      </div>
      <h2 style={svStyles.title}>Schedule a Visit</h2>
      <p style={svStyles.desc}>
        You're about to request a property visit for:
      </p>
      <div style={svStyles.propChip}>
        <Building2 size={14} color="#1D6A4A" strokeWidth={2} />
        <span style={svStyles.propName}>{property.title}</span>
      </div>
      <div style={svStyles.infoBox}>
        <Info size={14} color="#D97706" strokeWidth={2} style={{ flexShrink: 0, marginTop: '1px' }} />
        <p style={svStyles.infoText}>
          After submitting your request, a PPC inspector will be assigned
          and you will be notified with the confirmed date and time. You can
          track your visit status under <strong>My Visits</strong>.
        </p>
      </div>
      <div style={svStyles.actions}>
        <button style={svStyles.cancelBtn} onClick={onClose}>Cancel</button>
        <button style={svStyles.confirmBtn} onClick={onConfirm}>
          <Calendar size={14} color="#fff" strokeWidth={2} />
          Request Visit
        </button>
      </div>
    </div>
  </div>
);

const svStyles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  modal: {
    position: 'relative',
    background: '#fff',
    borderRadius: '16px',
    padding: '28px 24px 24px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
  },
  closeBtn: {
    position: 'absolute',
    top: '14px',
    right: '14px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
  },
  iconWrap: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: '#E8F4F1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '14px',
  },
  title: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#111827',
    margin: '0 0 6px',
  },
  desc: {
    fontSize: '13px',
    color: '#6B7280',
    margin: '0 0 12px',
  },
  propChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#F0FAF6',
    border: '1.5px solid #A7F3D0',
    borderRadius: '8px',
    padding: '8px 12px',
    marginBottom: '14px',
  },
  propName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1D6A4A',
  },
  infoBox: {
    display: 'flex',
    gap: '8px',
    background: '#FFFBEB',
    border: '1.5px solid #FDE68A',
    borderRadius: '8px',
    padding: '10px 12px',
    marginBottom: '20px',
  },
  infoText: {
    fontSize: '12px',
    color: '#78350F',
    lineHeight: 1.5,
    margin: 0,
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  cancelBtn: {
    flex: 1,
    background: '#fff',
    border: '1.5px solid #D1D5DB',
    borderRadius: '9px',
    padding: '9px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  confirmBtn: {
    flex: 1,
    background: '#1D6A4A',
    border: '1.5px solid #1D6A4A',
    borderRadius: '9px',
    padding: '9px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
};

// ─── Main Component ────────────────────────────────────────────────────────────

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Simulate a brief loading state
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);

  // Gallery state
  const [activeImg, setActiveImg] = useState(0);
  const [imgErrors, setImgErrors] = useState({});
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Visit modal
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [visitRequested, setVisitRequested] = useState(false);

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      const found = MOCK_PROPERTIES_DETAIL[Number(id)];
      setProperty(found || null);
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [id]);

  const handleImgError = useCallback((mediaId) => {
    setImgErrors((prev) => ({ ...prev, [mediaId]: true }));
  }, []);

  const prevImg = useCallback(() => {
    if (!property) return;
    setActiveImg((i) => (i === 0 ? property.media.length - 1 : i - 1));
  }, [property]);

  const nextImg = useCallback(() => {
    if (!property) return;
    setActiveImg((i) => (i === property.media.length - 1 ? 0 : i + 1));
  }, [property]);

  const handleRequestVisit = () => {
    setVisitRequested(true);
    setVisitModalOpen(false);
    // When backend is ready: POST /api/customer/visits { property_id }
    // Then navigate to My Visits
    setTimeout(() => navigate('/customer/my-visits'), 1800);
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div style={s.loadingPage}>
        <div style={s.loadingSpinner} />
        <p style={s.loadingText}>Loading property details...</p>
      </div>
    );
  }

  // ── Not found / deleted ──
  if (!property || property.is_deleted) {
    return (
      <div style={s.notFoundPage}>
        <AlertCircle size={48} color="#D97706" strokeWidth={1.5} />
        <h2 style={s.notFoundTitle}>Property Not Found</h2>
        <p style={s.notFoundText}>
          This property is no longer available or may have been removed.
        </p>
        <button style={s.backBtn} onClick={() => navigate('/customer/properties')}>
          <ArrowLeft size={15} color="#1D6A4A" strokeWidth={2} />
          Back to Properties
        </button>
      </div>
    );
  }

  const media = property.media || [];
  const currentMedia = media[activeImg];
  const hasMedia = media.length > 0;

  const purposeBg = property.property_status === 'For Sale' ? '#1D6A4A' : '#0EA5E9';

  const formatPrice = (n) =>
    'Rs. ' + n.toLocaleString('en-PK');

  // Info rows (only render if value exists)
  const infoRows = [
    { label: 'Property Type', value: property.property_type },
    { label: 'Status', value: property.property_status },
    { label: 'City', value: property.city },
    { label: 'Address', value: property.address },
    { label: 'Area', value: `${property.area_value} ${property.area_unit}` },
    { label: 'Bedrooms', value: property.bedrooms },
    { label: 'Bathrooms', value: property.bathrooms },
    property.sale_price ? { label: 'Sale Price', value: formatPrice(property.sale_price) } : null,
    property.rent_price ? { label: 'Rent Price', value: formatPrice(property.rent_price) + ' / month' } : null,
    { label: 'Listed On', value: new Date(property.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }) },
  ].filter(Boolean);

  return (
    <div style={s.page}>
      {/* ── Back navigation ── */}
      <div style={s.backNav}>
        <button style={s.backNavBtn} onClick={() => navigate('/customer/properties')}>
          <ArrowLeft size={15} color="#1D6A4A" strokeWidth={2.5} />
          Back to Properties
        </button>
        <div style={s.breadcrumb}>
          <span style={s.breadCrumbItem}>Properties</span>
          <ChevronRight size={13} color="#9CA3AF" />
          <span style={s.breadCrumbActive}>{property.title}</span>
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div style={s.contentGrid}>
        {/* ══════════ LEFT / MAIN COLUMN ══════════ */}
        <div style={s.mainCol}>

          {/* ── Media Gallery ── */}
          <div style={s.galleryCard}>
            {hasMedia ? (
              <>
                {/* Main image */}
                <div style={s.mainImgWrap}>
                  <img
                    src={imgErrors[currentMedia.media_id] ? currentMedia.fallback : currentMedia.url}
                    alt={currentMedia.caption || property.title}
                    style={s.mainImg}
                    onError={() => handleImgError(currentMedia.media_id)}
                    onClick={() => setLightboxOpen(true)}
                  />
                  {/* Status badge */}
                  <span style={{ ...s.statusBadge, background: purposeBg }}>
                    {property.property_status}
                  </span>
                  {/* Image counter */}
                  <span style={s.imgCounter}>
                    {activeImg + 1} / {media.length}
                  </span>
                  {/* Expand hint */}
                  <button
                    style={s.expandBtn}
                    onClick={() => setLightboxOpen(true)}
                    title="View full screen"
                  >
                    <Maximize size={15} color="#fff" strokeWidth={2} />
                    View Photos
                  </button>
                  {/* Nav arrows */}
                  {media.length > 1 && (
                    <>
                      <button style={{ ...s.galleryNavBtn, left: '12px' }} onClick={prevImg} aria-label="Previous image">
                        <ChevronLeft size={20} color="#fff" strokeWidth={2.5} />
                      </button>
                      <button style={{ ...s.galleryNavBtn, right: '12px' }} onClick={nextImg} aria-label="Next image">
                        <ChevronRight size={20} color="#fff" strokeWidth={2.5} />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {media.length > 1 && (
                  <div style={s.thumbnailRow}>
                    {media.map((m, idx) => (
                      <button
                        key={m.media_id}
                        style={{
                          ...s.thumbBtn,
                          ...(idx === activeImg ? s.thumbBtnActive : {}),
                        }}
                        onClick={() => setActiveImg(idx)}
                        aria-label={`View image ${idx + 1}`}
                      >
                        <img
                          src={imgErrors[m.media_id] ? m.fallback : m.url}
                          alt={m.caption || `Image ${idx + 1}`}
                          style={s.thumbImg}
                          onError={() => handleImgError(m.media_id)}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={s.noMediaState}>
                <Home size={40} color="#D1D5DB" strokeWidth={1.5} />
                <p style={s.noMediaText}>Property images are not available.</p>
              </div>
            )}
          </div>

          {/* ── About this Property ── */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>About this Property</h2>
            {property.description ? (
              <p style={s.description}>{property.description}</p>
            ) : (
              <p style={s.emptyText}>No description available.</p>
            )}
          </div>

          {/* ── Property Information ── */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Property Information</h2>
            <div style={s.infoGrid}>
              {infoRows.map((row) => (
                <div key={row.label} style={s.infoRow}>
                  <span style={s.infoLabel}>{row.label}</span>
                  <span style={s.infoValue}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Location ── */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Location</h2>
            <div style={s.locationCard}>
              <div style={s.locationIconBox}>
                <MapPin size={20} color="#1D6A4A" strokeWidth={1.8} />
              </div>
              <div>
                <div style={s.locationAddress}>{property.address}</div>
                <div style={s.locationCity}>{property.city}, Pakistan</div>
              </div>
            </div>
            <div style={s.staticMap}>
              <MapPin size={28} color="#1D6A4A" strokeWidth={1.5} />
              <div>
                <div style={s.staticMapLabel}>{property.address}</div>
                <div style={s.staticMapSub}>{property.city} · Pakistan</div>
              </div>
            </div>
          </div>

        </div>

        {/* ══════════ RIGHT SIDEBAR ══════════ */}
        <aside style={s.rightAside}>

          {/* ── Property Summary Card ── */}
          <div style={s.summaryCard}>
            {/* Title */}
            <div style={s.summaryTitle}>{property.title}</div>
            {/* Type · City */}
            <div style={s.summaryMeta}>
              <Building2 size={13} color="#9CA3AF" strokeWidth={2} />
              <span>{property.property_type}</span>
              <span style={s.metaDot}>·</span>
              <MapPin size={13} color="#9CA3AF" strokeWidth={2} />
              <span>{property.city}</span>
            </div>

            {/* Key stats */}
            <div style={s.statsRow}>
              <div style={s.statItem}>
                <BedDouble size={16} color="#1D6A4A" strokeWidth={1.8} />
                <span style={s.statValue}>{property.bedrooms}</span>
                <span style={s.statLabel}>Beds</span>
              </div>
              <div style={s.statDivider} />
              <div style={s.statItem}>
                <Bath size={16} color="#1D6A4A" strokeWidth={1.8} />
                <span style={s.statValue}>{property.bathrooms}</span>
                <span style={s.statLabel}>Baths</span>
              </div>
              <div style={s.statDivider} />
              <div style={s.statItem}>
                <Maximize size={16} color="#1D6A4A" strokeWidth={1.8} />
                <span style={s.statValue}>{property.area_value}</span>
                <span style={s.statLabel}>{property.area_unit}</span>
              </div>
            </div>

            {/* Price */}
            <div style={s.priceSection}>
              {property.sale_price && (
                <div style={s.priceRow}>
                  <Tag size={14} color="#6B7280" strokeWidth={2} />
                  <div>
                    <div style={s.priceLabelSmall}>Sale Price</div>
                    <div style={s.priceValue}>{formatPrice(property.sale_price)}</div>
                  </div>
                </div>
              )}
              {property.rent_price && (
                <div style={s.priceRow}>
                  <Tag size={14} color="#6B7280" strokeWidth={2} />
                  <div>
                    <div style={s.priceLabelSmall}>Rent Price</div>
                    <div style={s.priceValue}>
                      {formatPrice(property.rent_price)}
                      <span style={s.pricePerMonth}> / month</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            {visitRequested ? (
              <div style={s.visitRequestedBanner}>
                <CheckCircle2 size={16} color="#166534" strokeWidth={2} />
                Visit request submitted! Redirecting to My Visits…
              </div>
            ) : (
              <button
                style={s.scheduleBtn}
                onClick={() => setVisitModalOpen(true)}
              >
                <Calendar size={16} color="#fff" strokeWidth={2} />
                Schedule a Visit
              </button>
            )}

            {/* Listed by */}
            <div style={s.listedBy}>
              <Home size={13} color="#9CA3AF" strokeWidth={2} />
              <span>Listed by PPC Property Owner</span>
            </div>
          </div>

          {/* ── PPC Verification ── */}
          <div style={s.card}>
            <h2 style={s.sideCardTitle}>PPC Verification</h2>
            {property.verification ? (
              <div style={s.verifiedBox}>
                <div style={s.verifiedIconWrap}>
                  <ShieldCheck size={22} color="#1D6A4A" strokeWidth={1.8} />
                </div>
                <div>
                  <div style={s.verifiedLabel}>PPC Verified Property</div>
                  <div style={s.verifiedSub}>
                    Verified on {property.verification.verified_date}
                  </div>
                </div>
              </div>
            ) : (
              <div style={s.notVerifiedBox}>
                <Clock size={16} color="#D97706" strokeWidth={2} style={{ flexShrink: 0 }} />
                <span style={s.notVerifiedText}>
                  Verification information is not currently available for this property.
                </span>
              </div>
            )}
          </div>

          {/* ── PPC Workflow ── */}
          <div style={s.card}>
            <h2 style={s.sideCardTitle}>PPC Process</h2>
            {[
              { step: 1, label: 'Browse Properties', done: true },
              { step: 2, label: 'View Property Details', done: true, active: true },
              { step: 3, label: 'Schedule a Visit', done: false },
              { step: 4, label: 'Inspection Report', done: false },
              { step: 5, label: 'Transaction', done: false },
              { step: 6, label: 'Invoice & Payment', done: false },
            ].map(({ step, label, done, active }) => (
              <div key={step} style={s.workflowRow}>
                <div
                  style={{
                    ...s.workflowDot,
                    background: active ? '#1D6A4A' : done ? '#E8F4F1' : '#F3F4F6',
                    border: active ? '2px solid #1D6A4A' : done ? '2px solid #1D6A4A' : '2px solid #E5E7EB',
                  }}
                >
                  {done ? (
                    <CheckCircle2 size={12} color="#1D6A4A" strokeWidth={2.5} />
                  ) : (
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF' }}>{step}</span>
                  )}
                </div>
                <span
                  style={{
                    ...s.workflowLabel,
                    color: active ? '#1D6A4A' : done ? '#374151' : '#9CA3AF',
                    fontWeight: active ? '700' : done ? '600' : '500',
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

        </aside>
      </div>

      {/* ── Lightbox ── */}
      {lightboxOpen && hasMedia && (
        <Lightbox
          media={media}
          activeIndex={activeImg}
          onClose={() => setLightboxOpen(false)}
          onPrev={prevImg}
          onNext={nextImg}
        />
      )}

      {/* ── Schedule Visit Modal ── */}
      {visitModalOpen && (
        <ScheduleVisitModal
          property={property}
          onClose={() => setVisitModalOpen(false)}
          onConfirm={handleRequestVisit}
        />
      )}
    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = {
  // ── Page ──
  page: {
    background: '#F9FAFB',
    minHeight: '100vh',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: '#111827',
    paddingBottom: '40px',
  },

  // ── Loading ──
  loadingPage: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  loadingSpinner: {
    width: '36px',
    height: '36px',
    border: '3.5px solid #E5E7EB',
    borderTop: '3.5px solid #1D6A4A',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontSize: '13px',
    color: '#6B7280',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },

  // ── Not Found ──
  notFoundPage: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    padding: '40px 28px',
    textAlign: 'center',
  },
  notFoundTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
  },
  notFoundText: {
    fontSize: '13px',
    color: '#6B7280',
    margin: 0,
    maxWidth: '320px',
  },

  // ── Back nav ──
  backNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '18px 28px 0 28px',
    flexWrap: 'wrap',
  },
  backNavBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: '1.5px solid #E5E7EB',
    borderRadius: '8px',
    padding: '7px 14px',
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#1D6A4A',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    background: '#fff',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#fff',
    border: '1.5px solid #E5E7EB',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1D6A4A',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  breadCrumbItem: {
    fontSize: '12px',
    color: '#6B7280',
    fontWeight: '500',
  },
  breadCrumbActive: {
    fontSize: '12px',
    color: '#111827',
    fontWeight: '600',
    maxWidth: '240px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  // ── Two-column grid ──
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: '20px',
    padding: '18px 28px 0 28px',
    alignItems: 'start',
  },
  mainCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    minWidth: 0,
  },
  rightAside: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  // ── Cards ──
  card: {
    background: '#fff',
    border: '1.5px solid #E5E7EB',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#111827',
    margin: '0 0 14px 0',
  },
  sideCardTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 12px 0',
  },

  // ── Gallery ──
  galleryCard: {
    background: '#fff',
    border: '1.5px solid #E5E7EB',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  mainImgWrap: {
    position: 'relative',
    width: '100%',
    height: '400px',
    overflow: 'hidden',
    cursor: 'pointer',
    background: '#F3F4F6',
  },
  mainImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.3s ease',
  },
  statusBadge: {
    position: 'absolute',
    top: '14px',
    left: '14px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '700',
    padding: '4px 12px',
    borderRadius: '20px',
    letterSpacing: '0.2px',
  },
  imgCounter: {
    position: 'absolute',
    top: '14px',
    right: '14px',
    background: 'rgba(0,0,0,0.55)',
    color: '#fff',
    fontSize: '11.5px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  expandBtn: {
    position: 'absolute',
    bottom: '14px',
    right: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(0,0,0,0.55)',
    border: 'none',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    backdropFilter: 'blur(4px)',
  },
  galleryNavBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.45)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)',
    transition: 'background 0.15s',
  },
  thumbnailRow: {
    display: 'flex',
    gap: '8px',
    padding: '10px 12px',
    overflowX: 'auto',
    background: '#F9FAFB',
  },
  thumbBtn: {
    border: '2px solid transparent',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    flexShrink: 0,
    background: 'none',
    padding: 0,
    transition: 'border-color 0.15s',
  },
  thumbBtnActive: {
    borderColor: '#1D6A4A',
  },
  thumbImg: {
    width: '72px',
    height: '54px',
    objectFit: 'cover',
    display: 'block',
  },
  noMediaState: {
    height: '260px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    background: '#F9FAFB',
  },
  noMediaText: {
    fontSize: '13px',
    color: '#9CA3AF',
    fontWeight: '500',
    margin: 0,
  },

  // ── Description ──
  description: {
    fontSize: '13.5px',
    color: '#374151',
    lineHeight: 1.7,
    margin: 0,
    fontWeight: '400',
  },
  emptyText: {
    fontSize: '13px',
    color: '#9CA3AF',
    margin: 0,
    fontStyle: 'italic',
  },

  // ── Property Info Grid ──
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0',
    border: '1.5px solid #E5E7EB',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    padding: '12px 14px',
    borderBottom: '1px solid #F3F4F6',
    borderRight: '1px solid #F3F4F6',
  },
  infoLabel: {
    fontSize: '11px',
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  infoValue: {
    fontSize: '13px',
    color: '#111827',
    fontWeight: '600',
  },

  // ── Location ──
  locationCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#F9FAFB',
    border: '1.5px solid #E5E7EB',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '14px',
  },
  locationIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#E8F4F1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  locationAddress: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#111827',
  },
  locationCity: {
    fontSize: '12px',
    color: '#6B7280',
    fontWeight: '500',
    marginTop: '2px',
  },
  staticMap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    height: '100px',
    background: '#F0FAF6',
    border: '1.5px dashed #A7F3D0',
    borderRadius: '10px',
  },
  staticMapLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1D6A4A',
  },
  staticMapSub: {
    fontSize: '11px',
    color: '#6B7280',
    marginTop: '2px',
  },

  // ── Summary Card ──
  summaryCard: {
    background: '#fff',
    border: '1.5px solid #E5E7EB',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  summaryTitle: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#111827',
    lineHeight: 1.3,
  },
  summaryMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12.5px',
    color: '#6B7280',
    fontWeight: '500',
    flexWrap: 'wrap',
  },
  metaDot: {
    color: '#D1D5DB',
    fontWeight: '400',
    margin: '0 2px',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    background: '#F9FAFB',
    border: '1.5px solid #E5E7EB',
    borderRadius: '10px',
    padding: '12px 8px',
  },
  statItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#111827',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '10.5px',
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  statDivider: {
    width: '1px',
    height: '32px',
    background: '#E5E7EB',
  },
  priceSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    background: '#F0FAF6',
    border: '1.5px solid #A7F3D0',
    borderRadius: '10px',
    padding: '10px 12px',
  },
  priceLabelSmall: {
    fontSize: '10px',
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  priceValue: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#111827',
    lineHeight: 1.2,
    marginTop: '1px',
  },
  pricePerMonth: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6B7280',
  },
  scheduleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: '#1D6A4A',
    border: '1.5px solid #1D6A4A',
    borderRadius: '10px',
    padding: '12px 0',
    fontSize: '14px',
    fontWeight: '700',
    color: '#fff',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    transition: 'background 0.15s',
    width: '100%',
  },
  visitRequestedBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#F0FAF6',
    border: '1.5px solid #A7F3D0',
    borderRadius: '10px',
    padding: '12px',
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#166534',
    lineHeight: 1.4,
  },
  listedBy: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11.5px',
    color: '#9CA3AF',
    fontWeight: '500',
    justifyContent: 'center',
    paddingTop: '4px',
  },

  // ── Verification ──
  verifiedBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#F0FAF6',
    border: '1.5px solid #A7F3D0',
    borderRadius: '10px',
    padding: '12px',
  },
  verifiedIconWrap: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#E8F4F1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  verifiedLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1D6A4A',
  },
  verifiedSub: {
    fontSize: '11px',
    color: '#6B7280',
    fontWeight: '500',
    marginTop: '2px',
  },
  notVerifiedBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    background: '#FFFBEB',
    border: '1.5px solid #FDE68A',
    borderRadius: '10px',
    padding: '12px',
  },
  notVerifiedText: {
    fontSize: '12px',
    color: '#78350F',
    lineHeight: 1.5,
    fontWeight: '500',
  },

  // ── Workflow ──
  workflowRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingBottom: '10px',
  },
  workflowDot: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  workflowLabel: {
    fontSize: '12.5px',
  },
};

// Add CSS keyframe for loading spinner via a style tag
if (typeof document !== 'undefined' && !document.getElementById('ppc-spin-style')) {
  const style = document.createElement('style');
  style.id = 'ppc-spin-style';
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}

export default PropertyDetails;
