import type { MockRoute, MockProtector, EmergencyRequest } from './types'

export const MOCK_ROUTES: MockRoute[] = [
  {
    id: 'A',
    label: 'Fastest',
    duration: 32,
    distance: '4.2 km',
    tags: ['Fastest', 'Direct'],
    lighting: 'Limited lighting',
    crowd: 'Low activity',
    connectivity: 'Good',
    helpPoints: 2,
    isolated: 'Some sections',
    color: '#7C7A9E',
    score: 58,
  },
  {
    id: 'B',
    label: 'AI Recommended',
    duration: 41,
    distance: '5.8 km',
    tags: ['Recommended', 'Preference Match'],
    lighting: 'Well-lit',
    crowd: 'Moderate activity',
    connectivity: 'Good',
    helpPoints: 7,
    isolated: 'Minimal',
    color: '#E0157A',
    score: 82,
    recommended: true,
  },
  {
    id: 'C',
    label: 'More Connected',
    duration: 44,
    distance: '6.1 km',
    tags: ['Most Connected', 'Public Areas'],
    lighting: 'Good lighting',
    crowd: 'Higher activity',
    connectivity: 'Excellent',
    helpPoints: 9,
    isolated: 'None',
    color: '#A855F7',
    score: 76,
  },
]

export const MOCK_PROTECTORS: MockProtector[] = [
  {
    id: 'p1',
    name: 'Officer Anjali Mehra',
    role: 'Police Officer',
    organization: 'Mumbai Police',
    area: 'Dadar – Parel Zone',
    availability: 'On Duty',
    status: 'Available',
    responseTime: '~4 min',
    verified: true,
    avatar: 'AM',
  },
  {
    id: 'p2',
    name: 'Dr. Kavitha Nair',
    role: 'Medical Professional',
    organization: 'Sion Hospital',
    area: 'Sion – Matunga',
    availability: 'Available',
    status: 'Available',
    responseTime: '~8 min',
    verified: true,
    avatar: 'KN',
  },
  {
    id: 'p3',
    name: 'Campus Security Unit',
    role: 'Campus Security',
    organization: 'VJTI Campus',
    area: 'Matunga Campus',
    availability: 'On Duty',
    status: 'Available',
    responseTime: '~2 min',
    verified: true,
    avatar: 'CS',
  },
  {
    id: 'p4',
    name: 'iCall Support',
    role: 'NGO Support',
    organization: 'iCall NGO',
    area: 'City-wide (Remote)',
    availability: '24 / 7',
    status: 'Available',
    responseTime: '< 1 min',
    verified: true,
    avatar: 'iC',
  },
  {
    id: 'p5',
    name: 'SafeWalk Volunteer',
    role: 'Verified Volunteer',
    organization: 'SafeWalk Network',
    area: 'Bandra – Andheri',
    availability: 'Available',
    status: 'Active',
    responseTime: '~6 min',
    verified: true,
    avatar: 'SW',
  },
]

export const MOCK_EMERGENCY_REQUESTS: EmergencyRequest[] = [
  {
    id: 'er1',
    userName: 'Priya M.',
    priority: 'HIGH',
    time: '11:42 PM',
    battery: 5,
    connectivity: 'Offline',
    situation: 'Missed check-in + Emergency gesture activated',
    location: 'Near Dadar Station, Mumbai',
    reasons: [
      'Emergency gesture activated',
      'Missed scheduled check-in',
      'Battery critical (5%)',
      'Route deviation detected',
    ],
  },
  {
    id: 'er2',
    userName: 'Sneha K.',
    priority: 'MEDIUM',
    time: '10:58 PM',
    battery: 23,
    connectivity: 'Weak',
    situation: 'Route deviation from usual pattern',
    location: 'Mahim Causeway area',
    reasons: [
      'Unusual route deviation',
      'Late night travel',
      'No response to check-in prompt',
    ],
  },
  {
    id: 'er3',
    userName: 'Ritu P.',
    priority: 'LOW',
    time: '11:15 PM',
    battery: 67,
    connectivity: 'Good',
    situation: 'Requested protector visibility',
    location: 'Bandra West',
    reasons: [
      'User requested protector visibility',
      'First journey in this area',
    ],
  },
]

export const OFFLINE_PACK_ITEMS = [
  { label: 'Route saved locally', done: true, delay: 0 },
  { label: 'Turn-by-turn directions cached', done: true, delay: 300 },
  { label: 'Help points saved (7 nearby)', done: true, delay: 600 },
  { label: 'Emergency contacts saved', done: true, delay: 900 },
  { label: 'Hospital locations cached', done: true, delay: 1200 },
  { label: 'Check-in ready (offline)', done: true, delay: 1500 },
  { label: 'Low-power backup active', done: true, delay: 1800 },
]

export const EMERGENCY_NUMBERS = [
  { number: '112', label: 'National Emergency', icon: '🆘', color: '#EF4444', desc: 'All emergencies (Police, Fire, Ambulance)' },
  { number: '100', label: 'Police', icon: '🚔', color: '#3B82F6', desc: 'Immediate police assistance' },
  { number: '102', label: 'Ambulance', icon: '🚑', color: '#EF4444', desc: 'Medical emergency ambulance' },
  { number: '101', label: 'Fire Brigade', icon: '🔥', color: '#F97316', desc: 'Fire emergency services' },
  { number: '1091', label: "Women's Helpline", icon: '🛡', color: '#E0157A', desc: 'National women in distress' },
  { number: '181', label: "Women's Helpline (State)", icon: '◈', color: '#A855F7', desc: 'State women helpline' },
  { number: '1098', label: 'Child Helpline', icon: '👶', color: '#22C55E', desc: 'Children in distress' },
  { number: '108', label: 'Emergency Medical', icon: '💊', color: '#EF4444', desc: 'Emergency medical services' },
  { number: '1800-11-0031', label: 'iCall Mental Health', icon: '❤', color: '#F59E0B', desc: 'Free counselling support' },
  { number: '155260', label: 'Cyber Crime', icon: '🔒', color: '#60A5FA', desc: 'Cyber harassment helpline' },
]

export const EMERGENCY_CONTACTS_DEMO = [
  { id: 'ec1', name: 'Maa', relation: 'Parent / Guardian', number: '+91 98765 43210', color: '#E0157A', initials: 'M', trusted: true },
  { id: 'ec2', name: 'Riya (Best Friend)', relation: 'Friend', number: '+91 87654 32109', color: '#A855F7', initials: 'R', trusted: true },
  { id: 'ec3', name: 'Arjun (Brother)', relation: 'Sibling', number: '+91 76543 21098', color: '#22C55E', initials: 'A', trusted: true },
  { id: 'ec4', name: 'Auntie Sunita', relation: 'Other contact', number: '+91 65432 10987', color: '#F59E0B', initials: 'S', trusted: false },
]

export const VERIFIED_POLICE = [
  { id: 'vp1', name: 'Dadar Police Station', type: 'Police Station', badge: 'PS/DDR/001', area: 'Dadar, Mumbai', phone: '022-24137518', available: '24/7', dist: '0.6 km', lat: 19.018, lng: 72.842 },
  { id: 'vp2', name: 'Matunga Police Station', type: 'Police Station', badge: 'PS/MTG/002', area: 'Matunga, Mumbai', phone: '022-24014534', available: '24/7', dist: '1.3 km', lat: 19.025, lng: 72.860 },
  { id: 'vp3', name: 'Sion Police Station', type: 'Police Station', badge: 'PS/SIN/003', area: 'Sion, Mumbai', phone: '022-24093641', available: '24/7', dist: '2.1 km', lat: 19.040, lng: 72.862 },
  { id: 'vp4', name: 'Sgt. Pradeep Kamble', type: 'Beat Officer', badge: 'BP/083', area: 'Dadar – Parel patrol', phone: '+91 98200 12345', available: 'On duty now', dist: '0.4 km', lat: 19.020, lng: 72.840 },
  { id: 'vp5', name: 'PCR Van Unit 7', type: 'Patrol Vehicle', badge: 'PCR/MH-07', area: 'Active patrol zone', phone: '100', available: 'Active now', dist: '0.9 km', lat: 19.016, lng: 72.845 },
]

export const VERIFIED_DOCTORS = [
  { id: 'vd1', name: 'Dr. Kavitha Nair', specialty: 'General Physician', hospital: 'Sion Hospital', phone: '+91 98765 11223', available: 'Available', dist: '2.1 km', gender: 'F' },
  { id: 'vd2', name: 'Dr. Anita Sharma', specialty: 'Emergency Medicine', hospital: 'KEM Hospital', phone: '+91 87654 22334', available: 'On call', dist: '3.2 km', gender: 'F' },
  { id: 'vd3', name: 'Dr. Rajesh Mehta', specialty: 'Trauma Surgeon', hospital: 'Sion Hospital', phone: '+91 76543 33445', available: 'Available', dist: '2.1 km', gender: 'M' },
  { id: 'vd4', name: 'iCall Counsellor', specialty: 'Mental Health Support', hospital: 'iCall (Remote)', phone: '1800-11-0031', available: '24/7 Free', dist: 'Remote', gender: 'F' },
  { id: 'vd5', name: 'Dr. Meena Iyer', specialty: 'Gynaecologist', hospital: 'Wadia Hospital', phone: '+91 65432 44556', available: 'Available', dist: '2.8 km', gender: 'F' },
]

// Map POIs for the enhanced safety map
export const MAP_POIS = [
  // Police stops
  { id: 'p1', type: 'police', label: 'Dadar Police Post', x: 50, y: 95, color: '#3B82F6' },
  { id: 'p2', type: 'police', label: 'Police Booth', x: 270, y: 45, color: '#3B82F6' },
  { id: 'p3', type: 'police', label: 'Beat Officer Post', x: 160, y: 175, color: '#3B82F6' },
  // Bus stops
  { id: 'b1', type: 'bus', label: 'BEST Bus Stop', x: 80, y: 165, color: '#22C55E' },
  { id: 'b2', type: 'bus', label: 'Main Rd Bus Stop', x: 210, y: 95, color: '#22C55E' },
  { id: 'b3', type: 'bus', label: 'Junction Bus Stop', x: 110, y: 60, color: '#22C55E' },
  // Railway stations
  { id: 'r1', type: 'train', label: 'Dadar Station', x: 110, y: 130, color: '#A855F7' },
  { id: 'r2', type: 'train', label: 'Sion Station', x: 260, y: 130, color: '#A855F7' },
  // Metro
  { id: 'm1', type: 'metro', label: 'Metro Station', x: 160, y: 60, color: '#8B5CF6' },
  // Markets
  { id: 'mk1', type: 'market', label: 'Dadar Market', x: 65, y: 45, color: '#F97316' },
  { id: 'mk2', type: 'market', label: 'Shivaji Market', x: 240, y: 165, color: '#F97316' },
  // Crowded areas (landmark)
  { id: 'c1', type: 'crowded', label: 'Busy Junction', x: 160, y: 95, color: '#EAB308' },
  { id: 'c2', type: 'crowded', label: 'Shopping Area', x: 205, y: 45, color: '#EAB308' },
  // Hospitals
  { id: 'h1', type: 'hospital', label: 'Sion Hospital', x: 290, y: 95, color: '#EF4444' },
  { id: 'h2', type: 'hospital', label: 'KEM Hospital', x: 35, y: 155, color: '#EF4444' },
  // Clinics
  { id: 'cl1', type: 'clinic', label: 'Health Clinic', x: 130, y: 45, color: '#E0157A' },
  { id: 'cl2', type: 'clinic', label: 'Medical Centre', x: 230, y: 175, color: '#E0157A' },
]

export const POI_CONFIG = {
  police: { symbol: 'P', color: '#3B82F6', label: 'Police' },
  bus: { symbol: 'B', color: '#22C55E', label: 'Bus Stop' },
  train: { symbol: 'T', color: '#A855F7', label: 'Train Station' },
  metro: { symbol: 'M', color: '#8B5CF6', label: 'Metro' },
  market: { symbol: '₹', color: '#F97316', label: 'Market' },
  crowded: { symbol: '★', color: '#EAB308', label: 'Crowded Area' },
  hospital: { symbol: 'H', color: '#EF4444', label: 'Hospital' },
  clinic: { symbol: '+', color: '#E0157A', label: 'Clinic' },
}

export const CONNECTIVITY_ZONES = [
  { label: 'Good connectivity', color: '#22C55E', from: 0, to: 35 },
  { label: 'Connectivity weakening', color: '#F59E0B', from: 35, to: 60 },
  { label: 'Very low connectivity', color: '#EF4444', from: 60, to: 80 },
  { label: 'Good again', color: '#22C55E', from: 80, to: 100 },
]
