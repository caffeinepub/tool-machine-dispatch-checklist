# Tool & Machine Dispatch Checklist

## Current State
Full worker flow and admin panel are live. Captured photos are displayed but cannot be tapped/clicked to view full-size. Admin dispatch detail shows checklist items but not the actual photos taken.

## Requested Changes (Diff)

### Add
- Photo Lightbox: tap any captured photo to view it full-screen with label and close button
- Admin photo gallery in dispatch detail modal with thumbnails that open lightbox
- Worker dispatch detail bottom-sheet: photos grid, statuses, QR data, timestamps, duration
- Worker notes: optional text note per checklist item after photo capture
- Dispatch duration display (createdAt to completedAt)
- Search bar on Worker Dashboard
- Dark/Light mode toggle in header (persisted)
- Offline indicator banner
- Print dispatch report button in admin detail

### Modify
- ChecklistScreen: clickable photo opens lightbox; notes textarea after capture
- FinalVerification: clickable toolbox photo
- WorkerDashboard: tappable dispatch items, search bar, dark mode, offline banner
- AdminPanel dispatch detail: photo grid, duration, print button, dark mode, offline banner
- Types: add notes field to ChecklistItem

### Remove
- Nothing

## Implementation Plan
1. Add PhotoLightbox component
2. Add DispatchDetailSheet component
3. Update ChecklistScreen
4. Update FinalVerification
5. Update WorkerDashboard
6. Update AdminPanel
7. Add useTheme and useOffline hooks
