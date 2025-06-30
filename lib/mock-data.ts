export const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@ui.edu.ng",
    password: "password123", // In a real app, this would be hashed
    role: "admin",
    avatar: "/avatars/01.png",
    department: "Information Technology",
    joinedAt: "2023-01-10",
    reportsSubmitted: 5,
  },
  {
    id: "2",
    name: "Security Officer",
    email: "security@ui.edu.ng",
    password: "password123",
    role: "SECURITY_PERSONNEL",
    avatar: "/avatars/02.png",
    department: "Campus Security",
    joinedAt: "2023-02-15",
    reportsSubmitted: 12,
  },
  {
    id: "3",
    name: "John Doe",
    email: "john.doe@ui.edu.ng",
    password: "password123",
    role: "student",
    avatar: "/avatars/03.png",
    department: "Computer Science",
    joinedAt: "2023-03-20",
    reportsSubmitted: 2,
  },
  {
    id: "4",
    name: "Jane Smith",
    email: "jane.smith@ui.edu.ng",
    password: "password123",
    role: "faculty",
    avatar: "/avatars/04.png",
    department: "Engineering",
    joinedAt: "2023-04-05",
    reportsSubmitted: 8,
  },
  {
    id: "5",
    name: "Guest User",
    email: "guest@ui.edu.ng",
    password: "password123",
    role: "guest",
    avatar: "/avatars/05.png",
    department: "Visitor",
    joinedAt: "2023-05-12",
    reportsSubmitted: 0,
  },
]

// Updated mock incidents with University of Ibadan locations
export const mockIncidents = [
  {
    id: "1",
    title: "Broken window in Faculty of Science",
    description:
      "A window on the second floor of the Faculty of Science building has been broken. Glass shards on the ground pose a safety hazard.",
    location: "Faculty of Science, Room 204",
    latitude: 7.4429,
    longitude: 3.8967, // University of Ibadan coordinates
    status: "investigating",
    severity: "medium",
    reportedAt: "2025-05-14 10:30 AM",
    reportedBy: "anonymous",
    tags: ["property damage", "safety hazard"],
    upvotes: 12,
    comments: [
      {
        id: "c1",
        user: "Security Team",
        content: "We have dispatched a team to secure the area.",
        timestamp: "2023-05-14 10:45 AM",
      },
      {
        id: "c2",
        user: "Maintenance",
        content: "Scheduled for repair tomorrow morning.",
        timestamp: "2023-05-14 11:30 AM",
      },
    ],
  },
  {
    id: "2",
    title: "Suspicious activity near Mellanby Hall",
    description:
      "Noticed someone trying door handles at Mellanby Hall around midnight. Wearing dark clothing and a backpack.",
    location: "Mellanby Hall",
    latitude: 7.4435,
    longitude: 3.898, // Mellanby Hall area
    status: "active",
    severity: "high",
    reportedAt: "2023-05-14 00:15 AM",
    reportedBy: "John Doe",
    tags: ["suspicious activity", "security concern"],
    upvotes: 28,
    comments: [
      {
        id: "c1",
        user: "Security Team",
        content: "Increased patrols in the area. Please report any additional sightings immediately.",
        timestamp: "2023-05-14 00:30 AM",
      },
    ],
  },
  {
    id: "3",
    title: "Power outage in Kenneth Dike Library",
    description:
      "The entire west wing of the Kenneth Dike Library has lost power. Emergency lights are on but computers and study areas are affected.",
    location: "Kenneth Dike Library, West Wing",
    latitude: 7.4418,
    longitude: 3.8972, // Library area
    status: "resolved",
    severity: "medium",
    reportedAt: "2023-05-13 3:45 PM",
    reportedBy: "Library Staff",
    tags: ["power outage", "facility issue"],
    upvotes: 15,
    comments: [
      {
        id: "c1",
        user: "Facilities Management",
        content: "Issue identified as a circuit breaker problem. Working on repairs now.",
        timestamp: "2023-05-13 4:00 PM",
      },
      {
        id: "c2",
        user: "Facilities Management",
        content: "Power has been restored. Please report any lingering issues.",
        timestamp: "2023-05-13 5:30 PM",
      },
    ],
  },
  {
    id: "4",
    title: "Flooding in basement of Admin Building",
    description:
      "Water leaking from ceiling in the basement level of the Administration Building. Several inches of standing water.",
    location: "Administration Building, Basement",
    latitude: 7.4425,
    longitude: 3.896, // Admin building area
    status: "active",
    severity: "high",
    reportedAt: "2023-05-14 8:20 AM",
    reportedBy: "Administrative Staff",
    tags: ["flooding", "facility issue", "urgent"],
    upvotes: 8,
    comments: [
      {
        id: "c1",
        user: "Facilities Management",
        content: "Emergency plumbing team dispatched. Please avoid the area.",
        timestamp: "2023-05-14 8:35 AM",
      },
    ],
  },
  {
    id: "5",
    title: "Bike theft at Faculty of Engineering",
    description:
      "My bike was stolen from the rack outside the Faculty of Engineering between 2-4 PM. It's a red Trek mountain bike with a black basket.",
    location: "Faculty of Engineering, North Entrance",
    latitude: 7.444,
    longitude: 3.8955, // Engineering faculty area
    status: "investigating",
    severity: "medium",
    reportedAt: "2023-05-13 4:30 PM",
    reportedBy: "Jane Smith",
    tags: ["theft", "bicycle", "security concern"],
    upvotes: 19,
    comments: [
      {
        id: "c1",
        user: "Campus Security",
        content: "Please file a formal report with our office. We'll check security cameras in the area.",
        timestamp: "2023-05-13 4:45 PM",
      },
      {
        id: "c2",
        user: "Student",
        content: "I saw a suspicious person with bolt cutters near there around 3 PM.",
        timestamp: "2023-05-13 5:15 PM",
      },
    ],
  },
  {
    id: "6",
    title: "Broken light in SUB parking lot",
    description:
      "Several lights are out in the Student Union Building parking lot making it very dark at night. Safety concern for students walking to cars.",
    location: "Student Union Building Parking Lot",
    latitude: 7.4415,
    longitude: 3.899, // SUB area
    status: "investigating",
    severity: "low",
    reportedAt: "2023-05-12 9:15 PM",
    reportedBy: "Mike Johnson",
    tags: ["lighting", "safety concern", "parking"],
    upvotes: 32,
    comments: [
      {
        id: "c1",
        user: "Facilities Management",
        content: "Scheduled for repair tomorrow. Thank you for reporting.",
        timestamp: "2023-05-13 8:30 AM",
      },
    ],
  },
  {
    id: "7",
    title: "Graffiti on Faculty of Arts wall",
    description:
      "Large graffiti tag on the east-facing wall of the Faculty of Arts. Appears to have happened overnight.",
    location: "Faculty of Arts, East Wall",
    latitude: 7.441,
    longitude: 3.8975, // Arts faculty area
    status: "resolved",
    severity: "low",
    reportedAt: "2023-05-13 7:45 AM",
    reportedBy: "Campus Staff",
    tags: ["vandalism", "property damage"],
    upvotes: 5,
    comments: [
      {
        id: "c1",
        user: "Facilities Management",
        content: "Cleaning crew has been notified and will remove it today.",
        timestamp: "2023-05-13 8:15 AM",
      },
      {
        id: "c2",
        user: "Facilities Management",
        content: "Graffiti has been removed.",
        timestamp: "2023-05-13 2:30 PM",
      },
    ],
  },
]
