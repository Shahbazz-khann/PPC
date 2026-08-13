import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import {
  Bell,
  ChevronDown,
  Search,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  Eye,
  Play,
  MoreVertical,
  X,
  Filter,
  List,
  Grid,
  AlertCircle,
  Phone,
  Check,
} from 'lucide-react';

// ─── Initial Mock Data ────────────────────────────────────────────────────────
const MOCK_SUMMARY = {
  todayCount: 3,
  thisWeekCount: 12,
  upcomingCount: 15,
  completedCount: 7,
};

const INITIAL_SCHEDULE_GROUPS = [
  {
    groupTitle: 'Today - Monday, 11 August 2025',
    dateKey: '2025-08-11',
    items: [
      {
        id: 1,
        time: '10:00 AM',
        dateStr: '11 Aug 2025',
        property_title: 'House # 123, Street 5',
        address: 'Bahria Town, Phase 8 Rawalpindi',
        owner_name: 'Ahmad Khan',
        owner_phone: '0300-1234567',
        status: 'Scheduled',
        area: 'Bahria Town Phase 8, Rawalpindi',
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=120&q=80',
        notes: 'Initial structural, boundary check, and electrical installation verification.',
      },
      {
        id: 2,
        time: '02:00 PM',
        dateStr: '11 Aug 2025',
        property_title: 'Plot # 45, Block C',
        address: 'DHA Phase 2 Islamabad',
        owner_name: 'Usman Ali',
        owner_phone: '0311-9876543',
        status: 'Scheduled',
        area: 'DHA Phase 2 Islamabad',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=120&q=80',
        notes: 'Verification of plot corner marks and main boulevard access road.',
      },
      {
        id: 3,
        time: '04:30 PM',
        dateStr: '11 Aug 2025',
        property_title: 'House # 67, Street 12',
        address: 'G-13/4, Islamabad',
        owner_name: 'Bilal Ahmed',
        owner_phone: '0321-6543210',
        status: 'Scheduled',
        area: 'G-13/4 Islamabad',
        image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=120&q=80',
        notes: 'Interior quality, plumbing lines, and gas fittings audit.',
      },
    ],
  },
  {
    groupTitle: 'Tomorrow - Tuesday, 12 August 2025',
    dateKey: '2025-08-12',
    items: [
      {
        id: 4,
        time: '11:00 AM',
        dateStr: '12 Aug 2025',
        property_title: 'Plot # 09, Block A',
        address: 'Citi Housing Jhelum',
        owner_name: 'Faisal Malik',
        owner_phone: '0333-1112223',
        status: 'Upcoming',
        area: 'Citi Housing Jhelum',
        image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=120&q=80',
        notes: 'Awaiting site document verification from local authority.',
      },
      {
        id: 5,
        time: '03:00 PM',
        dateStr: '12 Aug 2025',
        property_title: 'House # 88, Street 3',
        address: 'DHA Phase 5 Islamabad',
        owner_name: 'Hassan Raza',
        owner_phone: '0345-7778889',
        status: 'Upcoming',
        area: 'DHA Phase 5 Islamabad',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=120&q=80',
        notes: 'Solar system capacity and HVAC audit.',
      },
    ],
  },
  {
    groupTitle: 'Wednesday, 13 August 2025',
    dateKey: '2025-08-13',
    items: [
      {
        id: 6,
        time: '10:30 AM',
        dateStr: '13 Aug 2025',
        property_title: 'Plot # 22, Block B',
        address: 'Bahria Town, Phase 7 Rawalpindi',
        owner_name: 'Imran Shah',
        owner_phone: '0305-5556677',
        status: 'Upcoming',
        area: 'Bahria Town Phase 7, Rawalpindi',
        image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=120&q=80',
        notes: 'Demarcation and physical boundary check.',
      },
    ],
  },
];

const Schedule = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth?.user;

  // View Mode: 'list' | 'calendar'
  const [viewMode, setViewMode] = useState('list');

  // Filter States
  const [dateRange, setDateRange] = useState('11 Aug 2025 - 17 Aug 2025');
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('All Areas');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Data State
  const [scheduleGroups, setScheduleGroups] = useState(INITIAL_SCHEDULE_GROUPS);

  // Modal / Action States
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [startingInspection, setStartingInspection] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const displayName = user?.full_name || user?.name || 'Sara';
  const displayRole = 'Inspector';
  const avatarUrl =
    user?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256';

  // Computed Filtered Schedule Groups
  const filteredScheduleGroups = useMemo(() => {
    return scheduleGroups
      .map((group) => {
        const filteredItems = group.items.filter((item) => {
          // Status filter
          if (statusFilter !== 'All Status' && item.status !== statusFilter) return false;

          // Area filter
          if (
            areaFilter !== 'All Areas' &&
            !item.area.toLowerCase().includes(areaFilter.toLowerCase())
          )
            return false;

          // Search query filter
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchTitle = item.property_title.toLowerCase().includes(q);
            const matchOwner = item.owner_name.toLowerCase().includes(q);
            const matchAddr = item.address.toLowerCase().includes(q);
            const matchArea = item.area.toLowerCase().includes(q);
            if (!matchTitle && !matchOwner && !matchAddr && !matchArea) return false;
          }

          return true;
        });

        return { ...group, items: filteredItems };
      })
      .filter((group) => group.items.length > 0);
  }, [scheduleGroups, statusFilter, areaFilter, searchQuery]);

  // Count total displayed schedules
  const totalDisplayedCount = useMemo(() => {
    return filteredScheduleGroups.reduce((acc, grp) => acc + grp.items.length, 0);
  }, [filteredScheduleGroups]);

  // Handle Start Inspection Action
  const handleConfirmStart = (e) => {
    e.preventDefault();
    if (!startingInspection) return;

    // Update status to 'In Progress'
    setScheduleGroups((prev) =>
      prev.map((grp) => ({
        ...grp,
        items: grp.items.map((item) =>
          item.id === startingInspection.id ? { ...item, status: 'In Progress' } : item
        ),
      }))
    );

    setToastMessage(`Inspection started for "${startingInspection.property_title}".`);
    setTimeout(() => setToastMessage(null), 4000);
    setStartingInspection(null);
  };

  return (
    <div style={styles.container}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={styles.toastBanner}>
          <CheckCircle2 size={18} color="#059669" />
          <span style={styles.toastText}>{toastMessage}</span>
          <button style={styles.closeToastBtn} onClick={() => setToastMessage(null)}>
            <X size={14} color="#065F46" />
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          TOP HEADER BAR
      ═══════════════════════════════════════════════ */}
      <header style={styles.topHeader}>
        <div>
          <h1 style={styles.headerTitle}>Schedules</h1>
          <p style={styles.headerSubtitle}>View and manage your upcoming inspection schedules.</p>
        </div>

        <div style={styles.headerRight}>
          <button style={styles.notificationBtn} aria-label="Notifications">
            <Bell size={18} color="#374151" />
            <span style={styles.notificationBadge}>2</span>
          </button>

          <div style={styles.profileChip} onClick={() => navigate('/inspector/profile')}>
            <img
              src={avatarUrl}
              alt={displayName}
              style={styles.profileAvatar}
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256';
              }}
            />
            <div style={styles.profileInfo}>
              <span style={styles.profileName}>{displayName}</span>
              <span style={styles.profileRole}>{displayRole}</span>
            </div>
            <ChevronDown size={14} color="#6B7280" />
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          4 SUMMARY STAT CARDS ROW
      ═══════════════════════════════════════════════ */}
      <section style={styles.summaryGrid}>
        {/* Card 1: Today's Schedule */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div>
              <span style={styles.summaryCardTitle}>Today's Schedule</span>
              <span style={styles.summaryCardVal}>{MOCK_SUMMARY.todayCount}</span>
            </div>
            <div style={{ ...styles.summaryIconBox, background: '#E0F2FE', color: '#0284C7' }}>
              <CalendarIcon size={20} />
            </div>
          </div>
          <span style={styles.summarySubtext}>Inspections today</span>
        </div>

        {/* Card 2: This Week */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div>
              <span style={styles.summaryCardTitle}>This Week</span>
              <span style={styles.summaryCardVal}>{MOCK_SUMMARY.thisWeekCount}</span>
            </div>
            <div style={{ ...styles.summaryIconBox, background: '#FEF3C7', color: '#D97706' }}>
              <CalendarIcon size={20} />
            </div>
          </div>
          <span style={styles.summarySubtext}>Inspections scheduled</span>
        </div>

        {/* Card 3: Upcoming */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div>
              <span style={styles.summaryCardTitle}>Upcoming</span>
              <span style={styles.summaryCardVal}>{MOCK_SUMMARY.upcomingCount}</span>
            </div>
            <div style={{ ...styles.summaryIconBox, background: '#DCFCE7', color: '#16A34A' }}>
              <CalendarIcon size={20} />
            </div>
          </div>
          <span style={styles.summarySubtext}>Next 7 days</span>
        </div>

        {/* Card 4: Completed This Week */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryCardHeader}>
            <div>
              <span style={styles.summaryCardTitle}>Completed This Week</span>
              <span style={styles.summaryCardVal}>{MOCK_SUMMARY.completedCount}</span>
            </div>
            <div style={{ ...styles.summaryIconBox, background: '#F3E8FF', color: '#9333EA' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span style={styles.summarySubtext}>Inspections completed</span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SEARCH, FILTERS & VIEW MODE CONTROL BAR
      ═══════════════════════════════════════════════ */}
      <div style={styles.filterCard}>
        <div style={styles.filterRow}>
          {/* Date Range Selector Dropdown */}
          <div style={styles.dropdownWrapRange}>
            <CalendarIcon size={14} color="#6B7280" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={styles.selectElRange}
            >
              <option value="11 Aug 2025 - 17 Aug 2025">11 Aug 2025 - 17 Aug 2025</option>
              <option value="18 Aug 2025 - 24 Aug 2025">18 Aug 2025 - 24 Aug 2025</option>
              <option value="This Month">This Month (Aug 2025)</option>
            </select>
            <ChevronDown size={14} color="#6B7280" style={styles.selectIcon} />
          </div>

          {/* Search Box */}
          <div style={styles.searchWrap}>
            <Search size={15} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Search by property, owner, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Area Filter */}
          <div style={styles.dropdownWrap}>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              style={styles.selectEl}
            >
              <option value="All Areas">All Areas</option>
              <option value="Bahria Town">Bahria Town</option>
              <option value="DHA Phase 2">DHA Phase 2</option>
              <option value="G-13">G-13</option>
              <option value="Citi Housing">Citi Housing</option>
              <option value="DHA Phase 5">DHA Phase 5</option>
            </select>
            <ChevronDown size={14} color="#6B7280" style={styles.selectIcon} />
          </div>

          {/* Status Filter */}
          <div style={styles.dropdownWrap}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.selectEl}
            >
              <option value="All Status">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Upcoming">Upcoming</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <ChevronDown size={14} color="#6B7280" style={styles.selectIcon} />
          </div>

          {/* Filters Reset Button */}
          <button
            style={styles.filterBtn}
            onClick={() => {
              setSearchQuery('');
              setAreaFilter('All Areas');
              setStatusFilter('All Status');
            }}
          >
            <Filter size={14} color="#374151" />
            <span>Filters</span>
          </button>

          {/* View Toggle Buttons (List View vs Calendar View) */}
          <div style={styles.viewToggleGroup}>
            <button
              style={viewMode === 'list' ? styles.viewBtnActive : styles.viewBtnInactive}
              onClick={() => setViewMode('list')}
            >
              <List size={15} />
              <span>List View</span>
            </button>
            <button
              style={viewMode === 'calendar' ? styles.viewBtnActive : styles.viewBtnInactive}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon size={15} />
              <span>Calendar View</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          SCHEDULE CONTENT AREA
      ═══════════════════════════════════════════════ */}
      {viewMode === 'list' ? (
        /* ── LIST VIEW: Grouped by Date ── */
        <div style={styles.scheduleListContainer}>
          {filteredScheduleGroups.length === 0 ? (
            <div style={styles.emptyStateCard}>
              <AlertCircle size={38} color="#9CA3AF" />
              <h3 style={styles.emptyTitle}>No inspection schedules found</h3>
              <p style={styles.emptyDesc}>Try clearing your search query or adjusting your filters.</p>
            </div>
          ) : (
            filteredScheduleGroups.map((group) => (
              <div key={group.groupTitle} style={styles.groupSection}>
                {/* Date Group Heading */}
                <h3 style={styles.groupHeading}>{group.groupTitle}</h3>

                {/* Group Items Cards */}
                <div style={styles.groupItemsContainer}>
                  {group.items.map((item) => {
                    const isScheduled = item.status === 'Scheduled';
                    const isUpcoming = item.status === 'Upcoming';
                    const isInProgress = item.status === 'In Progress';

                    const badgeBg = isScheduled
                      ? '#DBEAFE'
                      : isInProgress
                      ? '#E0F2FE'
                      : isUpcoming
                      ? '#FEF3C7'
                      : '#DCFCE7';

                    const badgeColor = isScheduled
                      ? '#1E40AF'
                      : isInProgress
                      ? '#0284C7'
                      : isUpcoming
                      ? '#92400E'
                      : '#166534';

                    return (
                      <div key={item.id} style={styles.scheduleCardItem}>
                        {/* Time Column */}
                        <div style={styles.timeCol}>
                          <span style={styles.timeMain}>{item.time}</span>
                          <span style={styles.timeSub}>{item.dateStr}</span>
                        </div>

                        {/* Property Details */}
                        <div style={styles.propCol}>
                          <img src={item.image} alt={item.property_title} style={styles.propThumb} />
                          <div>
                            <h4 style={styles.propTitle}>{item.property_title}</h4>
                            <p style={styles.propAddress}>{item.address}</p>
                          </div>
                        </div>

                        {/* Owner Details */}
                        <div style={styles.ownerCol}>
                          <span style={styles.ownerName}>{item.owner_name}</span>
                          <span style={styles.ownerPhone}>{item.owner_phone}</span>
                        </div>

                        {/* Status Badge */}
                        <div style={styles.statusCol}>
                          <span style={{ ...styles.statusBadge, background: badgeBg, color: badgeColor }}>
                            ● {item.status}
                          </span>
                        </div>

                        {/* Location Text */}
                        <div style={styles.locationCol}>
                          <MapPin size={13} color="#64748B" />
                          <span style={styles.locationText}>{item.area}</span>
                        </div>

                        {/* Actions Row */}
                        <div style={styles.actionsCol}>
                          <button
                            style={styles.detailsBtn}
                            onClick={() => setSelectedSchedule(item)}
                          >
                            View Details
                          </button>

                          <button
                            style={styles.startBtn}
                            onClick={() => setStartingInspection(item)}
                          >
                            Start Inspection
                          </button>

                          <button
                            style={styles.moreBtn}
                            onClick={() => setSelectedSchedule(item)}
                            title="More Options"
                          >
                            <MoreVertical size={16} color="#94A3B8" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* ── CALENDAR VIEW GRID ── */
        <div style={styles.calendarContainer}>
          <div style={styles.calendarHeaderRow}>
            {['Mon 11', 'Tue 12', 'Wed 13', 'Thu 14', 'Fri 15', 'Sat 16', 'Sun 17'].map((day) => (
              <div key={day} style={styles.calendarDayHeader}>
                {day}
              </div>
            ))}
          </div>

          <div style={styles.calendarGrid}>
            {/* Mon 11 */}
            <div style={styles.calendarCellActive}>
              <span style={styles.calendarCellDate}>11 AUG</span>
              <div style={{ ...styles.calItem, background: '#DBEAFE', color: '#1E40AF' }} onClick={() => setSelectedSchedule(INITIAL_SCHEDULE_GROUPS[0].items[0])}>
                <strong>10:00 AM</strong> — House # 123
              </div>
              <div style={{ ...styles.calItem, background: '#DBEAFE', color: '#1E40AF' }} onClick={() => setSelectedSchedule(INITIAL_SCHEDULE_GROUPS[0].items[1])}>
                <strong>02:00 PM</strong> — Plot # 45
              </div>
              <div style={{ ...styles.calItem, background: '#DBEAFE', color: '#1E40AF' }} onClick={() => setSelectedSchedule(INITIAL_SCHEDULE_GROUPS[0].items[2])}>
                <strong>04:30 PM</strong> — House # 67
              </div>
            </div>

            {/* Tue 12 */}
            <div style={styles.calendarCellActive}>
              <span style={styles.calendarCellDate}>12 AUG</span>
              <div style={{ ...styles.calItem, background: '#FEF3C7', color: '#92400E' }} onClick={() => setSelectedSchedule(INITIAL_SCHEDULE_GROUPS[1].items[0])}>
                <strong>11:00 AM</strong> — Plot # 09
              </div>
              <div style={{ ...styles.calItem, background: '#FEF3C7', color: '#92400E' }} onClick={() => setSelectedSchedule(INITIAL_SCHEDULE_GROUPS[1].items[1])}>
                <strong>03:00 PM</strong> — House # 88
              </div>
            </div>

            {/* Wed 13 */}
            <div style={styles.calendarCellActive}>
              <span style={styles.calendarCellDate}>13 AUG</span>
              <div style={{ ...styles.calItem, background: '#FEF3C7', color: '#92400E' }} onClick={() => setSelectedSchedule(INITIAL_SCHEDULE_GROUPS[2].items[0])}>
                <strong>10:30 AM</strong> — Plot # 22
              </div>
            </div>

            {/* Thu 14 */}
            <div style={styles.calendarCell}>
              <span style={styles.calendarCellDate}>14 AUG</span>
              <span style={styles.calEmptyText}>No schedules</span>
            </div>

            {/* Fri 15 */}
            <div style={styles.calendarCell}>
              <span style={styles.calendarCellDate}>15 AUG</span>
              <span style={styles.calEmptyText}>No schedules</span>
            </div>

            {/* Sat 16 */}
            <div style={styles.calendarCell}>
              <span style={styles.calendarCellDate}>16 AUG</span>
              <span style={styles.calEmptyText}>Off Day</span>
            </div>

            {/* Sun 17 */}
            <div style={styles.calendarCell}>
              <span style={styles.calendarCellDate}>17 AUG</span>
              <span style={styles.calEmptyText}>Off Day</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          PAGINATION FOOTER
      ═══════════════════════════════════════════════ */}
      <div style={styles.paginationRow}>
        <span style={styles.paginationText}>
          Showing 1 to {totalDisplayedCount} of {MOCK_SUMMARY.upcomingCount} schedules
        </span>

        <div style={styles.paginationControls}>
          <button
            style={styles.pageArrowBtn}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          <button
            style={currentPage === 1 ? styles.pageNumActive : styles.pageNumInactive}
            onClick={() => setCurrentPage(1)}
          >
            1
          </button>
          <button
            style={currentPage === 2 ? styles.pageNumActive : styles.pageNumInactive}
            onClick={() => setCurrentPage(2)}
          >
            2
          </button>
          <button style={styles.pageArrowBtn} onClick={() => setCurrentPage((p) => p + 1)}>
            &gt;
          </button>

          <div style={{ ...styles.dropdownWrap, marginLeft: '8px' }}>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              style={styles.selectElPage}
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
            <ChevronDown size={14} color="#6B7280" style={styles.selectIcon} />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          VIEW SCHEDULE DETAILS MODAL
      ═══════════════════════════════════════════════ */}
      {selectedSchedule && (
        <div style={styles.modalOverlay} onClick={() => setSelectedSchedule(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={20} color="#2563EB" />
                <h3 style={styles.modalTitle}>Inspection Schedule Details</h3>
              </div>
              <button style={styles.modalCloseBtn} onClick={() => setSelectedSchedule(null)}>
                <X size={18} color="#475569" />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalHero}>
                <img
                  src={selectedSchedule.image}
                  alt={selectedSchedule.property_title}
                  style={styles.modalImg}
                />
                <div>
                  <h2 style={styles.modalHeroTitle}>{selectedSchedule.property_title}</h2>
                  <p style={styles.modalHeroSub}>
                    <MapPin size={13} color="#64748B" /> {selectedSchedule.address}
                  </p>
                  <span style={styles.modalStatusBadge}>{selectedSchedule.status}</span>
                </div>
              </div>

              <div style={styles.infoGrid2}>
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Scheduled Time:</span>
                  <strong style={styles.infoVal}>
                    {selectedSchedule.time} ({selectedSchedule.dateStr})
                  </strong>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Location / Area:</span>
                  <strong style={styles.infoVal}>{selectedSchedule.area}</strong>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Property Owner:</span>
                  <strong style={styles.infoVal}>{selectedSchedule.owner_name}</strong>
                </div>
                <div style={styles.infoBox}>
                  <span style={styles.infoLabel}>Owner Contact:</span>
                  <strong style={styles.infoVal}>{selectedSchedule.owner_phone}</strong>
                </div>
              </div>

              <div style={styles.notesBox}>
                <h4 style={styles.notesTitle}>Inspection Instructions & Notes:</h4>
                <p style={styles.notesContent}>{selectedSchedule.notes}</p>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.secondaryModalBtn}
                onClick={() => setSelectedSchedule(null)}
              >
                Close
              </button>
              <button
                style={styles.primaryModalBtn}
                onClick={() => {
                  const target = selectedSchedule;
                  setSelectedSchedule(null);
                  setStartingInspection(target);
                }}
              >
                Start Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          START INSPECTION MODAL
      ═══════════════════════════════════════════════ */}
      {startingInspection && (
        <div style={styles.modalOverlay} onClick={() => setStartingInspection(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleConfirmStart}>
              <div style={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Play size={20} color="#2563EB" />
                  <h3 style={styles.modalTitle}>
                    Start Inspection — {startingInspection.property_title}
                  </h3>
                </div>
                <button
                  type="button"
                  style={styles.modalCloseBtn}
                  onClick={() => setStartingInspection(null)}
                >
                  <X size={18} color="#475569" />
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={styles.startConfirmNotice}>
                  <CheckCircle2 size={24} color="#059669" />
                  <div>
                    <h4 style={styles.noticeTitle}>Confirm Inspection Onset</h4>
                    <p style={styles.noticeText}>
                      Starting inspection for <strong>{startingInspection.property_title}</strong> located at{' '}
                      {startingInspection.area}. Status will be set to <strong>In Progress</strong>.
                    </p>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Initial On-Site Inspector Notes</label>
                  <textarea
                    rows={4}
                    defaultValue={startingInspection.notes}
                    placeholder="Enter on-site notes, weather condition, or initial observations..."
                    style={styles.formTextarea}
                  />
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  style={styles.secondaryModalBtn}
                  onClick={() => setStartingInspection(null)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.primaryModalBtn}>
                  Confirm & Start Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Styles Object ────────────────────────────────────────────────────────────
const styles = {
  container: {
    background: '#F8FAFC',
    minHeight: '100vh',
    padding: '24px 32px 40px 32px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: '#0F172A',
  },

  toastBanner: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: '#ECFDF5',
    border: '1.5px solid #A7F3D0',
    borderRadius: '12px',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    zIndex: 1100,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  toastText: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#065F46',
  },
  closeToastBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
  },

  topHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0F172A',
    margin: 0,
    lineHeight: 1.2,
  },
  headerSubtitle: {
    fontSize: '13px',
    color: '#64748B',
    margin: '4px 0 0 0',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  notificationBtn: {
    position: 'relative',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '9px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  notificationBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#EF4444',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: '700',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #FFFFFF',
  },

  profileChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '6px 12px 6px 8px',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  profileAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1.5px solid #E2E8F0',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.2,
  },
  profileName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F172A',
  },
  profileRole: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#64748B',
  },

  /* ── Summary Metric Cards Grid (4 Cards Row) ── */
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '18px',
    marginBottom: '24px',
  },
  summaryCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '18px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  summaryCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  summaryCardTitle: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#334155',
    display: 'block',
    marginBottom: '4px',
  },
  summaryCardVal: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 1,
  },
  summaryIconBox: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summarySubtext: {
    fontSize: '11.5px',
    color: '#64748B',
    fontWeight: '500',
  },

  /* ── Filter Card ── */
  filterCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '14px',
    padding: '12px 18px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    marginBottom: '24px',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  dropdownWrapRange: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    padding: '7px 12px',
    background: '#FFFFFF',
    minWidth: '220px',
  },
  selectElRange: {
    appearance: 'none',
    WebkitAppearance: 'none',
    border: 'none',
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#334155',
    background: 'transparent',
    cursor: 'pointer',
    outline: 'none',
    width: '100%',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },

  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    padding: '7.5px 12px',
    flex: 2,
    minWidth: '220px',
    background: '#F8FAFC',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '13px',
    color: '#0F172A',
    width: '100%',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  dropdownWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minWidth: '120px',
  },
  selectEl: {
    appearance: 'none',
    WebkitAppearance: 'none',
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    padding: '7.5px 28px 7.5px 12px',
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#334155',
    background: '#FFFFFF',
    cursor: 'pointer',
    outline: 'none',
    width: '100%',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  selectIcon: {
    position: 'absolute',
    right: '8px',
    pointerEvents: 'none',
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    padding: '7.5px 14px',
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },

  viewToggleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: '#F1F5F9',
    padding: '3px',
    borderRadius: '10px',
    marginLeft: 'auto',
  },
  viewBtnActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#2563EB',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  viewBtnInactive: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748B',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },

  /* ── List View Layout ── */
  scheduleListContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginBottom: '24px',
  },
  groupSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  groupHeading: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#2563EB',
    margin: 0,
  },
  groupItemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  scheduleCardItem: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
    gap: '16px',
    flexWrap: 'wrap',
  },

  timeCol: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '80px',
  },
  timeMain: {
    fontSize: '13.5px',
    fontWeight: '800',
    color: '#0F172A',
  },
  timeSub: {
    fontSize: '11px',
    color: '#64748B',
    marginTop: '2px',
  },

  propCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 2,
    minWidth: '220px',
  },
  propThumb: {
    width: '46px',
    height: '46px',
    borderRadius: '10px',
    objectFit: 'cover',
    border: '1px solid #E2E8F0',
    flexShrink: 0,
  },
  propTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0F172A',
    margin: 0,
  },
  propAddress: {
    fontSize: '12px',
    color: '#64748B',
    margin: '2px 0 0 0',
  },

  ownerCol: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '130px',
  },
  ownerName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F172A',
  },
  ownerPhone: {
    fontSize: '11.5px',
    color: '#64748B',
    marginTop: '1px',
  },

  statusCol: {
    minWidth: '110px',
  },
  statusBadge: {
    fontSize: '11.5px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '8px',
    display: 'inline-block',
  },

  locationCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    color: '#475569',
    minWidth: '180px',
    fontWeight: '500',
  },
  locationText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  actionsCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  detailsBtn: {
    background: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '8px',
    padding: '7.5px 14px',
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#334155',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  startBtn: {
    background: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
  },
  moreBtn: {
    background: 'transparent',
    border: 'none',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },

  /* ── Calendar View Layout ── */
  calendarContainer: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  },
  calendarHeaderRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    borderBottom: '1px solid #E2E8F0',
    paddingBottom: '12px',
    marginBottom: '12px',
  },
  calendarDayHeader: {
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: '700',
    color: '#2563EB',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '10px',
    minHeight: '220px',
  },
  calendarCellActive: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  calendarCell: {
    background: '#FAFAFA',
    border: '1px border-dashed #E2E8F0',
    borderRadius: '12px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    opacity: 0.6,
  },
  calendarCellDate: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#64748B',
  },
  calItem: {
    padding: '6px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    cursor: 'pointer',
  },
  calEmptyText: {
    fontSize: '11px',
    color: '#94A3B8',
    marginTop: '10px',
  },

  emptyStateCard: {
    background: '#FFFFFF',
    border: '1.5px dashed #CBD5E1',
    borderRadius: '16px',
    padding: '48px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0F172A',
    margin: 0,
  },
  emptyDesc: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0,
  },

  /* ── Pagination ── */
  paginationRow: {
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid #E2E8F0',
    borderRadius: '14px',
    background: '#FFFFFF',
    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
  },
  paginationText: {
    fontSize: '12.5px',
    color: '#64748B',
    fontWeight: '500',
  },
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  pageArrowBtn: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    width: '28px',
    height: '28px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumActive: {
    background: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    width: '28px',
    height: '28px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  pageNumInactive: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    width: '28px',
    height: '28px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
  },
  selectElPage: {
    appearance: 'none',
    WebkitAppearance: 'none',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '4px 24px 4px 10px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    background: '#FFFFFF',
    cursor: 'pointer',
    outline: 'none',
  },

  /* ── Modals ── */
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    background: '#FFFFFF',
    borderRadius: '18px',
    width: '100%',
    maxWidth: '540px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: '18px 24px',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0F172A',
    margin: 0,
  },
  modalCloseBtn: {
    background: '#F1F5F9',
    border: 'none',
    borderRadius: '8px',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
  },
  modalBody: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  modalHero: {
    display: 'flex',
    gap: '14px',
    alignItems: 'center',
    background: '#F8FAFC',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
  },
  modalImg: {
    width: '70px',
    height: '70px',
    borderRadius: '10px',
    objectFit: 'cover',
  },
  modalHeroTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0F172A',
    margin: 0,
  },
  modalHeroSub: {
    fontSize: '12px',
    color: '#64748B',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    margin: '3px 0 0 0',
  },
  modalStatusBadge: {
    display: 'inline-block',
    marginTop: '6px',
    background: '#DBEAFE',
    color: '#1E40AF',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '6px',
  },

  infoGrid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '12px',
  },
  infoBox: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '12px',
  },
  infoLabel: {
    color: '#64748B',
  },
  infoVal: {
    color: '#0F172A',
    fontWeight: '700',
    marginTop: '2px',
  },

  notesBox: {
    background: '#FFFBEB',
    border: '1px solid #FDE68A',
    borderRadius: '12px',
    padding: '14px',
  },
  notesTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#92400E',
    margin: '0 0 6px 0',
  },
  notesContent: {
    fontSize: '12.5px',
    color: '#78350F',
    margin: 0,
    lineHeight: '1.5',
  },

  startConfirmNotice: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    background: '#ECFDF5',
    border: '1px solid #A7F3D0',
    borderRadius: '12px',
    padding: '14px',
  },
  noticeTitle: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#065F46',
    margin: 0,
  },
  noticeText: {
    fontSize: '12.5px',
    color: '#047857',
    margin: '3px 0 0 0',
    lineHeight: '1.4',
  },

  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formLabel: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#334155',
  },
  formTextarea: {
    border: '1.5px solid #CBD5E1',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '13px',
    color: '#0F172A',
    background: '#FFFFFF',
    outline: 'none',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    resize: 'vertical',
  },

  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  secondaryModalBtn: {
    background: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    color: '#334155',
    borderRadius: '8px',
    padding: '9px 18px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  primaryModalBtn: {
    background: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 20px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
  },
};

export default Schedule;
