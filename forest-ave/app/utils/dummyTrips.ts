import { Trip } from "@/db/trips";

const MOCK_VEHICLE_ID = "veh_01j1abcdefg1234567890xyz";
export const MOCK_TRIPS: Trip[] = [
  {
    id: "trip_01",
    vehicleId: MOCK_VEHICLE_ID,
    tripName: "Morning Commute to Work",
    startTime: 1781964000000, // Monday, June 15, 2026 7:00 AM
    endTime: 1781965800000,   // Monday, June 15, 2026 7:30 AM (30 mins)
    tripAggResults: {
      distanceTraveled: 12.4, // Miles
      avgMpg: 24.5,
      avgSpeed: 24.8, // MPH (Stop-and-go city traffic)
      geoJson: JSON.stringify({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { color: "#F4B400" }, // Mid-range MPG
            geometry: {
              type: "LineString",
              coordinates: [
                [-122.4194, 37.7749],
                [-122.4224, 37.7792],
                [-122.4312, 37.7831]
              ]
            }
          }
        ]
      })
    }
  },
  {
    id: "trip_02",
    vehicleId: MOCK_VEHICLE_ID,
    tripName: "Weekend Highway Cruise",
    startTime: 1782136800000, // Wednesday, June 17, 2026 7:00 AM
    endTime: 1782142200000,   // Wednesday, June 17, 2026 8:30 AM (1.5 hours)
    tripAggResults: {
      distanceTraveled: 88.2,
      avgMpg: 32.8, // Great efficiency on highway
      avgSpeed: 58.8,
      geoJson: JSON.stringify({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { color: "#0F9D58" }, // High efficiency Green
            geometry: {
              type: "LineString",
              coordinates: [
                [-122.4312, 37.7831],
                [-122.1419, 37.4419],
                [-121.8863, 37.3382]
              ]
            }
          }
        ]
      })
    }
  },
  {
    id: "trip_03",
    vehicleId: MOCK_VEHICLE_ID,
    tripName: "Quick Grocery Run",
    startTime: 1782324000000, // Friday, June 19, 2026 11:00 AM
    endTime: 1782324600000,   // Friday, June 19, 2026 11:10 AM (10 mins)
    tripAggResults: {
      distanceTraveled: 1.8,
      avgMpg: 16.2, // Terrible efficiency (Cold engine, short idle blocks)
      avgSpeed: 10.8,
      geoJson: JSON.stringify({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { color: "#DB4437" }, // Low efficiency Red
            geometry: {
              type: "LineString",
              coordinates: [
                [-121.8863, 37.3382],
                [-121.8942, 37.3421],
                [-121.8991, 37.3455]
              ]
            }
          }
        ]
      })
    }
  }
];