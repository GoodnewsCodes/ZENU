# Walkthrough: Deleting Scripts

This update enables the functionality to delete scripts from both the **Dashboard** and the **Script Editor**.

## Prerequisites

- Ensure the backend server is running (`pnpm run dev` in the `server` directory).
- Ensure the frontend is served.

## How to Test

### 1. Test Deletion from Dashboard

1.  Navigate to the **Dashboard** (`dashboard.html`).
2.  Locate the **Recent Scripts** section.
3.  You should now see a **trash icon** (delete button) next to the "Manual" or voice badge on each script item.
4.  Click the trash icon.
5.  A confirmation dialog will appear: "Are you sure you want to delete '[Script Title]'?".
6.  Click **OK**.
7.  The script should be removed from the list, the "Total Scripts" counter should update, and a new activity record ("Deleted script: ...") should appear in the activity feed.

### 2. Test Deletion from Script Editor

1.  Open any existing script or create a new one in the **Script Editor** (`script-editor.html`).
2.  Next to the "Save Script" button in the top header, you should see a red **Delete** button.
3.  Click the **Delete** button.
4.  A confirmation dialog will appear.
5.  Confirm the deletion.
6.  The application should redirect you back to the **Dashboard**, and the script should no longer exist.

### 3. Test New/Unsaved Script Behavior

1.  Click "New Script" or go to `script-editor.html` without an ID.
2.  Initially, the **Delete** button might be hidden (depending on if there's content).
3.  Start typing a title or content. The **Delete** button should appear.
4.  Click **Delete**.
5.  Since the script isn't saved in the database yet, it will ask if you want to **clear the editor**.
6.  Confirming will reset the editor to a blank state.

## Implementation Details

- **Backend**: Uses the `DELETE /api/scripts/:id` endpoint in `server/index.js`. It includes validation and logging to handle potential issues.
- **API Client**: Uses `window.ZenuAPI.deleteScript(id)` in `scripts/api-client.js`.
- **UI Components**:
  - Dashboard trash button uses `event.stopPropagation()` to prevent opening the script when deleting.
  - Script Editor handles both database deletion and clearing unsaved local state.
