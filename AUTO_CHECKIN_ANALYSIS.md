# Auto-Checkin System Analysis

## Overview
This document explains how the checkpoint auto-checkin system works, including how the UI is updated and how the API is called.

## Architecture Flow

### 1. **Initial Setup & Data Fetching**

**Location:** `app/(tabs)/index.jsx`

#### Step 1: Get Running Tours
```javascript
const runningTours = bookedTours.filter(
  (tour) =>
    tour.status === 1 &&
    tour.tourDetails?.status === true &&
    tour.email === user?.email &&
    new Date(tour.tourDetails?.tour_start) <= now &&
    new Date(tour.tourDetails?.tour_end) >= now
);
```
- Filters tours that are currently active (between start and end dates)
- Only includes tours for the logged-in user

#### Step 2: Fetch Checkpoints
```javascript
useEffect(() => {
  const fetchCheckPoints = async () => {
    if (runningTours.length > 0 && geoTaggedCheckpoints === null) {
      const data = await handleGetCheckPoints(runningTours?.[0]?.tourDetails?._id);
      if (data?.length > 0) {
        setGeoCheckPoints(data);
      }
    }
  };
  fetchCheckPoints();
}, [runningTours]);
```

**API Call:** `GET /api/checked/get?email={email}&tourId={tourId}`
- Fetches all checkpoints for the running tour
- Filters for "Geo Tagging" type checkpoints that are not checked (`checked === false`)
- Stores filtered data in Redux state via `setGGeoTaggedCheckPoints`

---

### 2. **Auto-Checkin Location Tracking**

**Location:** `app/(tabs)/index.jsx` (lines 336-465)

#### Step 1: Location Permission Request
```javascript
const permission = await Location.requestForegroundPermissionsAsync();
const status = permission.status;

if (status !== "granted") {
  showWarning("Location permission is required for auto check-in");
  return;
}
```

#### Step 2: Start Location Watching
```javascript
watchId = await Location.watchPositionAsync(
  {
    accuracy: Location.Accuracy.High,
    distanceInterval: 100, // Updates every 100 meters
  },
  (location) => {
    // Location callback
  }
);
```

**Configuration:**
- **Accuracy:** High precision GPS
- **Distance Interval:** 100 meters (triggers callback when user moves 100m)
- **Time Interval:** Not specified (uses default)

#### Step 3: Distance Calculation
```javascript
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};
```
- Uses Haversine formula to calculate distance between user and checkpoint
- Returns distance in meters

#### Step 4: Auto-Checkin Trigger
```javascript
points?.forEach((point) => {
  if (point.type === "Geo Tagging" && !point.checked) {
    const distance = getDistance(
      latitude,
      longitude,
      point.latitude,
      point.longitude
    );
    
    if (distance <= 100) { // Within 100 meters
      const body = {
        email: user?.email,
        tourId: point.tourId,
        checkPointId: point._id,
      };
      
      handleCheckIn(body);
    }
  }
});
```

**Conditions for Auto-Checkin:**
1. Checkpoint type must be "Geo Tagging"
2. Checkpoint must not be already checked (`checked === false`)
3. User must be within 100 meters of checkpoint

---

### 3. **API Call - Check-in**

**Location:** `app/(tabs)/index.jsx` (lines 210-241)

```javascript
const handleCheckIn = async (body) => {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/checked/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to check in");
    }
    
    // Success handling
    showSuccess("You are checked in.");
    sendLocalNotification(
      "Check-in Successful",
      `You have reached the checkpoint ${runningTours[0]?.tourDetails?._id}`
    );

    // Refresh checkpoints to update UI
    handleGetCheckPoints(runningTours?.[0]?.tourDetails?._id);
  } catch (error) {
    showError(error.message || "Please try again.");
  }
};
```

**API Endpoint:** `POST /api/checked/add`

**Request Body:**
```json
{
  "email": "user@example.com",
  "tourId": "tour_id_here",
  "checkPointId": "checkpoint_id_here"
}
```

---

### 4. **UI Update Flow**

#### Step 1: After Successful Check-in
1. **Success Toast:** `showSuccess("You are checked in.")`
2. **Local Notification:** Sends push notification
3. **Refresh Checkpoints:** Calls `handleGetCheckPoints()` again

#### Step 2: Redux State Update
```javascript
const handleGetCheckPoints = async (ID) => {
  // ... API call ...
  const result = await response.json();
  
  const geoTaggedData = result.filter(
    (i) => i.type === "Geo Tagging" && i.checked === false
  );
  
  dispatch(setGGeoTaggedCheckPoints(geoTaggedData)); // ✅ Redux update
  return geoTaggedData;
};
```

**Redux Slice:** `redux/slices/autoCheckinSlice.js`
- Updates `GGeoTaggedCheckPoints` state
- Removes checked-in checkpoints from the list (since they're filtered out)

#### Step 3: Component Re-render
```javascript
useEffect(() => {
  // This effect runs when geoTaggedCheckpoints changes
  startLocationTracking(geoTaggedCheckpoints);
}, [geoTaggedCheckpoints]);
```

**What happens:**
- When `geoTaggedCheckpoints` changes (after API refresh), the `useEffect` re-runs
- The location tracking restarts with the updated checkpoint list
- Checked-in checkpoints are no longer in the list, so they won't trigger auto-checkin again

---

### 5. **Additional Auto-Checkin Implementation**

**Location:** `components/UI/CheckPointElement.jsx` (lines 191-260)

There's a **second auto-checkin implementation** in the CheckPointElement component:

```javascript
useEffect(() => {
  let watchId;
  
  const startLocationTracking = async () => {
    // Similar logic to main implementation
    watchId = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 100
      },
      (location) => {
        // Check distance and auto-checkin
      }
    );
  };

  if (
    isTourCurrentlyActive &&
    points?.type === "Geo Tagging" &&
    points?.checked === false
  ) {
    startLocationTracking();
  }

  return () => {
    if (watchId) {
      watchId.remove();
    }
  };
}, [points, isTourCurrentlyActive]);
```

**Note:** This creates a **duplicate location watcher** for each checkpoint element. This could cause performance issues and multiple check-in attempts.

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. App Loads                                                │
│    - Get running tours                                      │
│    - Fetch checkpoints from API                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Filter Geo-Tagged Checkpoints                           │
│    - Filter: type === "Geo Tagging" && checked === false   │
│    - Store in Redux: GGeoTaggedCheckPoints                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Start Location Tracking                                  │
│    - Request location permission                            │
│    - Watch position (updates every 100m)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Location Updates                                         │
│    - Calculate distance to each checkpoint                  │
│    - If distance <= 100m → Trigger check-in                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. API Call: POST /api/checked/add                         │
│    Body: { email, tourId, checkPointId }                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Success Response                                         │
│    - Show success toast                                     │
│    - Send local notification                                │
│    - Refresh checkpoints (GET /api/checked/get)            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Update Redux State                                       │
│    - Filter out checked checkpoints                         │
│    - Update GGeoTaggedCheckPoints                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. UI Re-renders                                            │
│    - Checked checkpoints removed from list                  │
│    - Location tracking restarts with new list              │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Files

1. **Main Auto-Checkin Logic:**
   - `app/(tabs)/index.jsx` (lines 336-465)

2. **API Functions:**
   - `app/(tabs)/index.jsx` (lines 180-241)
   - `utils/helpers.js` (lines 143-229)

3. **Redux State Management:**
   - `redux/slices/autoCheckinSlice.js`

4. **UI Components:**
   - `components/UI/CheckPointElement.jsx` (has duplicate auto-checkin logic)

---

## Issues & Recommendations

### ⚠️ Issues Found:

1. **Duplicate Location Watchers:**
   - Main implementation in `index.jsx`
   - Secondary implementation in `CheckPointElement.jsx`
   - **Impact:** Multiple watchers running simultaneously, potential battery drain

2. **Missing Dependency in useEffect:**
   - Line 465: `useEffect(() => { ... }, [geoTaggedCheckpoints])`
   - Missing `user` and `runningTours` in dependencies
   - **Impact:** Stale closures, potential bugs

3. **No Debouncing:**
   - Check-in can be triggered multiple times if user is within range
   - **Impact:** Duplicate API calls

4. **No Error Recovery:**
   - If API call fails, checkpoint remains unchecked but user might move away
   - **Impact:** User might miss check-in

### ✅ Recommendations:

1. **Remove duplicate location watcher** from `CheckPointElement.jsx`
2. **Add debouncing** to prevent multiple check-ins
3. **Add retry logic** for failed API calls
4. **Fix useEffect dependencies** to prevent stale closures
5. **Add checkpoint check-in status tracking** to prevent duplicate calls

---

## API Endpoints

### GET Checkpoints
```
GET /api/checked/get?email={email}&tourId={tourId}
```
**Response:** Array of checkpoint objects with `checked` status

### POST Check-in
```
POST /api/checked/add
Body: {
  "email": string,
  "tourId": string,
  "checkPointId": string
}
```
**Response:** Success/Error status

---

## State Management

**Redux Store Structure:**
```javascript
{
  autoCheckin: {
    GCheckPoints: null,              // All checkpoints
    GIsTourCurrentlyActive: null,     // Tour active status
    GGeoTaggedCheckPoints: null       // Filtered geo-tagged checkpoints
  }
}
```

**Selectors:**
- `selectGGeoTaggedCheckPoints` - Get geo-tagged checkpoints
- `selectGCheckPoints` - Get all checkpoints
- `selectGIsTourCurrentlyActive` - Get tour active status

---

## Summary

The auto-checkin system:
1. ✅ Fetches checkpoints when a tour is running
2. ✅ Filters for geo-tagged, unchecked checkpoints
3. ✅ Watches user location continuously
4. ✅ Calculates distance to checkpoints
5. ✅ Auto-checks in when within 100 meters
6. ✅ Calls API to record check-in
7. ✅ Updates Redux state
8. ✅ Refreshes UI by re-fetching checkpoints
9. ✅ Removes checked checkpoints from tracking list

**Main Flow:** Location Watch → Distance Check → API Call → State Update → UI Refresh


