import PropVilla from '../../../assets/prop_villa.png';
import PropApartment from '../../../assets/prop_apartment.png';

export const PROPERTY_TYPES = [
  'House', 'Apartment', 'Plot', 'Commercial', 'Agricultural', 'Industrial'
];

export const PROPERTY_USES = [
  'Residential', 'Commercial', 'Industrial', 'Farm House', 'Agriculture'
];

export const PROPERTY_LOCATIONS = [
  'Normal', 'Corner', 'Dead End', 'Park Facing', 'Main Boulevard'
];

export const COUNTRIES = ['Pakistan'];
export const PROVINCES = ['Punjab', 'Sindh', 'Islamabad Capital Territory'];

export const CITIES = {
  'Punjab': ['Lahore', 'Faisalabad', 'Rawalpindi'],
  'Sindh': ['Karachi', 'Hyderabad'],
  'Islamabad Capital Territory': ['Islamabad']
};

export const DISTRICTS = {
  'Lahore': ['Lahore District'],
  'Karachi': ['Karachi South', 'Karachi East', 'Karachi Central'],
  'Islamabad': ['Islamabad District']
};

export const TEHSILS = {
  'Lahore District': ['City', 'Cantonment', 'Model Town', 'Shalimar', 'Raiwind'],
  'Karachi South': ['Saddar', 'Aram Bagh', 'Civil Line'],
  'Islamabad District': ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5']
};

export const SOCIETIES = {
  'Cantonment': ['DHA Phase 8', 'DHA Phase 6'],
  'Raiwind': ['Bahria Town', 'Lake City'],
  'City': ['Gulberg III', 'Johar Town']
};

export const SIZE_UOM = [
  'Marla', 'Kanal', 'Acre', 'Sq Ft', 'Sq Yard'
];

export const MARLA_SIZES = [
  '225 Sq Ft', '250 Sq Ft', '272 Sq Ft'
];

export const AMENITIES = [
  'Electricity', 'Sui Gas', 'Water Supply', 'Sewerage', 'Broadband Internet',
  'Mosque', 'Park', 'Gym', 'Security Staff', 'CCTV Security', 'Boundary Wall'
];

export const mockPropertiesList = [
  {
    id: 'PRP-001',
    propertyType: 'House',
    propertyUse: 'Residential',
    country: 'Pakistan',
    province: 'Punjab',
    city: 'Lahore',
    district: 'Lahore District',
    tehsil: 'Cantonment',
    society: 'DHA Phase 8',
    area: 'Sector W',
    propertyLocation: 'Corner',
    
    propertySize: 1,
    sizeUom: 'Kanal',
    marlaSize: '225 Sq Ft',
    areaMarla: 20,
    areaKanal: 1,
    areaAcre: 0.125,
    areaSqFt: 4500,
    areaSqYard: 500,
    coveredAreaSqFt: 4000,
    openAreaSqFt: 500,
    
    roadFrontFt: 40,
    roadLeftFt: 0,
    roadRightFt: 0,
    roadBackFt: 0,
    
    rooms: 5,
    bathrooms: 6,
    floors: 2,
    lounges: 2,
    kitchens: 2,
    drawingRooms: 1,
    
    swimmingPool: true,
    mediaRoom: true,
    solarInstalled: true,
    solarCapacity: '10kW',
    electricMeters: 1,
    gasMeters: 1,
    electricityBackup: 'Generator',
    otherBackup: '',
    
    amenities: ['Electricity', 'Sui Gas', 'Water Supply', 'Security Staff', 'Park', 'Gym'],
    additionalFeatures: ['Double Glazed Windows', 'Central Heating'],
    status: 'Active',
    image: PropVilla,
    media: {
      pictures: [PropVilla],
      videos: []
    }
  },
  {
    id: 'PRP-002',
    propertyType: 'Commercial',
    propertyUse: 'Commercial',
    country: 'Pakistan',
    province: 'Punjab',
    city: 'Lahore',
    district: 'Lahore District',
    tehsil: 'City',
    society: 'Gulberg III',
    area: 'Main Market',
    propertyLocation: 'Main Boulevard',
    
    propertySize: 500,
    sizeUom: 'Sq Ft',
    marlaSize: '',
    areaMarla: 2.22,
    areaKanal: 0.11,
    areaAcre: 0,
    areaSqFt: 500,
    areaSqYard: 55.5,
    coveredAreaSqFt: 500,
    openAreaSqFt: 0,
    
    roadFrontFt: 60,
    roadLeftFt: 0,
    roadRightFt: 0,
    roadBackFt: 0,
    
    rooms: 1,
    bathrooms: 1,
    floors: 1,
    lounges: 0,
    kitchens: 0,
    drawingRooms: 0,
    
    swimmingPool: false,
    mediaRoom: false,
    solarInstalled: false,
    solarCapacity: '',
    electricMeters: 1,
    gasMeters: 0,
    electricityBackup: 'None',
    otherBackup: '',
    
    amenities: ['Electricity', 'Water Supply', 'Broadband Internet'],
    additionalFeatures: [],
    status: 'Pending Verification',
    image: PropApartment,
    media: {
      pictures: [PropApartment],
      videos: []
    }
  },
  {
    id: 'PRP-003',
    propertyType: 'Plot',
    propertyUse: 'Residential',
    country: 'Pakistan',
    province: 'Punjab',
    city: 'Lahore',
    district: 'Lahore District',
    tehsil: 'Raiwind',
    society: 'Bahria Town',
    area: 'Sector C',
    propertyLocation: 'Normal',
    
    propertySize: 10,
    sizeUom: 'Marla',
    marlaSize: '225 Sq Ft',
    areaMarla: 10,
    areaKanal: 0.5,
    areaAcre: 0.0625,
    areaSqFt: 2250,
    areaSqYard: 250,
    coveredAreaSqFt: 0,
    openAreaSqFt: 0,
    
    roadFrontFt: 30,
    roadLeftFt: 0,
    roadRightFt: 0,
    roadBackFt: 0,
    
    rooms: 0,
    bathrooms: 0,
    floors: 0,
    lounges: 0,
    kitchens: 0,
    drawingRooms: 0,
    
    swimmingPool: false,
    mediaRoom: false,
    solarInstalled: false,
    solarCapacity: '',
    electricMeters: 0,
    gasMeters: 0,
    electricityBackup: 'None',
    otherBackup: '',
    
    amenities: ['Electricity', 'Sui Gas', 'Water Supply', 'Sewerage', 'Mosque', 'Park'],
    additionalFeatures: [],
    status: 'Active',
    image: null,
    media: {
      pictures: [],
      videos: []
    }
  }
];

// Initialize from sessionStorage to persist newly added properties across page reloads
const storedProperties = sessionStorage.getItem('mockPropertiesList');
if (storedProperties) {
  try {
    const parsed = JSON.parse(storedProperties);
    // Replace array contents without changing reference
    mockPropertiesList.length = 0;
    mockPropertiesList.push(...parsed);
  } catch (e) {
    console.error("Failed to parse mock properties", e);
  }
}

export const addMockProperty = (property) => {
  mockPropertiesList.push(property);
  sessionStorage.setItem('mockPropertiesList', JSON.stringify(mockPropertiesList));
};
