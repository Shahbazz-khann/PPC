export const REQUEST_CATEGORIES = {
  PROPERTY: 'PROPERTY',
  SERVICE: 'SERVICE'
};

export const PROPERTY_PURPOSES = [
  'Sale',
  'Purchase',
  'Rent',
  'Renovation',
  'Lease'
];

export const MOCK_PPC_SERVICES = [
  'Property Care',
  'Cleaning Services',
  'Plumbing Services',
  'Electrical Services',
  'Drain & Gutter Cleaning',
  'Painting Services',
  'Carpentry Services',
  'AC Repair & Maintenance',
  'Water Tank Cleaning',
  'Pest Control',
  'Gardening / Lawn Maintenance',
  'General Repair & Maintenance'
];

export const REQUEST_STATUSES = [
  'Pending',
  'Under Review',
  'Assigned',
  'In Progress',
  'Completed',
  'Withdrawn'
];

export const mockRequestsList = [
  {
    id: 'REQ-1001',
    category: REQUEST_CATEGORIES.PROPERTY,
    purpose: 'Sale',
    service: null,
    propertyId: 'PRP-001',
    description: 'I would like to list my house in DHA Phase 8 for sale. It is in excellent condition and ready for immediate possession.',
    audio: null,
    status: 'Pending',
    createdAt: '2025-10-15T10:30:00Z'
  },
  {
    id: 'REQ-1002',
    category: REQUEST_CATEGORIES.PROPERTY,
    purpose: 'Purchase',
    service: null,
    propertyId: null, // Optional for purchase
    description: 'Looking to purchase a 10 Marla plot in Bahria Town. Prefer a corner plot facing the park.',
    audio: 'voice_note_1.mp3',
    status: 'Under Review',
    createdAt: '2025-10-18T14:15:00Z'
  },
  {
    id: 'REQ-1003',
    category: REQUEST_CATEGORIES.SERVICE,
    purpose: null,
    service: 'Property Care',
    propertyId: 'PRP-002',
    description: 'Require monthly property care and maintenance services for my commercial plaza in Gulberg III.',
    audio: null,
    status: 'In Progress',
    createdAt: '2025-10-20T09:00:00Z'
  },
  {
    id: 'REQ-1004',
    category: REQUEST_CATEGORIES.PROPERTY,
    purpose: 'Renovation',
    service: null,
    propertyId: 'PRP-001',
    description: 'Need a quote for renovating the kitchen and two bathrooms.',
    audio: null,
    status: 'Withdrawn',
    createdAt: '2025-10-22T11:45:00Z'
  },
  {
    id: 'REQ-1005',
    category: REQUEST_CATEGORIES.SERVICE,
    purpose: null,
    service: 'Plumbing Services',
    propertyId: 'PRP-003',
    description: 'Need urgent plumbing assistance to fix a leaking pipe in the master bathroom.',
    audio: null,
    status: 'Assigned',
    createdAt: '2025-10-25T16:20:00Z'
  }
];
