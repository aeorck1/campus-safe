export const mockIncidents = [
  {
    title: "Power Outage",
    date_created: "2025-07-01T08:00:00Z",
    date_resolved: "2025-07-02T14:00:00Z",
    status: "RESOLVED",
    comments: [{}, {}, {}], // 3 comments
  },
  {
    title: "System Crash",
    date_created: "2025-07-03T10:00:00Z",
    date_resolved: "2025-07-03T20:00:00Z",
    status: "RESOLVED",
    comments: [{}], // 1 comment
  },
  {
    title: "Network Latency",
    date_created: "2025-07-04T09:00:00Z",
    date_resolved: null,
    status: "ACTIVE",
    comments: [{}, {}], // 2 comments
  },
  {
    title: "Broken Light",
    date_created: "2025-07-05T11:00:00Z",
    date_resolved: "2025-07-06T12:00:00Z",
    status: "RESOLVED",
    comments: [{}], // 1 comment
  },
];
