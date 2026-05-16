# Park Pulse: Next-Gen Theme Park Dashboard

Park Pulse is an ultra-premium, real-time analytics dashboard for tracking wait times and optimizing your day at **Disneyland Resort** (California) and **Walt Disney World** (Florida). Built with Next.js, Tailwind CSS, and Upstash Redis, it offers a stunning glassmorphic interface and deep historical insights that far exceed official park apps.

## 🚀 Functional Features

### 🌍 Cross-Coastal Tracking
*   Seamlessly toggle between **Disneyland Resort** (Disneyland & California Adventure) and **Walt Disney World** (Magic Kingdom, EPCOT, Hollywood Studios, Animal Kingdom).
*   Data is pulled in real-time from the [ThemeParks.wiki API](https://themeparks.wiki).

### 📈 Historical Analytics & Heatmaps
*   **7-Day Heatmaps**: Uncover the best times to ride. Heatmaps analyze the last 7 days of historical data, processed and time-zone corrected, to show you the exact hour a ride's line dips.
*   **Live Trend Charts**: Expand any ride to see its wait time trajectory throughout the current day compared to its historical averages.

### 🗺️ Interactive Map View
*   A fully integrated 3D **Mapbox** view of the parks. 
*   **Live Markers**: See wait times rendered directly on top of the physical ride locations.
*   **Wayfinding**: Visual dotted paths connect your location (or the park entrance) to your selected ride for easy navigation.

### 🏃‍♂️ Rope Drop Itinerary Planner
*   The system uses historical data to generate an optimized, hour-by-hour itinerary.
*   It automatically sequences E-Ticket headliners early in the day when wait times are lowest, grouping nearby rides to minimize cross-park walking.

### 🔔 Smart Alerts & Favorites
*   **Alerts**: Set custom wait-time thresholds for rides (e.g., "Alert me when Space Mountain drops below 30 mins").
*   **Favorites**: Star rides to pin them to the top of the dashboard. Both alerts and favorites persist locally on your device.

### 🎨 Premium Glassmorphic UI
*   A sleek, modern dark-mode interface featuring blurred glass elements, dynamic color coding for wait severities (Walk-on to Very Busy), and skeleton loading states.
*   **Drag-and-Drop Columns**: Reorder metrics in the data table to suit your planning style.

---

## 🏗️ Architecture & Infrastructure

Park Pulse is engineered to handle massive amounts of real-time data efficiently within strict serverless constraints.

*   **Frontend**: Next.js App Router, React 19, Recharts for data visualization, and Mapbox GL JS for spatial mapping.
*   **Backend Telemetry**: Upstash Redis is used as a persistent ring buffer. 
*   **Data Ingestion**: A cron job triggers the `/api/cron/save` endpoint every minute. The backend compresses the API payload, chunks the data, and intelligently downsamples historical records (15-min resolution for the current day, 60-min for older days) to keep Vercel API payloads under 2MB.

---

## 🏃‍♂️ Getting Started

### Prerequisites
You will need accounts/keys for the following free-tier services:
1.  **Upstash Redis**: Used for storing historical wait time data and system telemetry.
2.  **Mapbox**: Used for rendering the interactive park maps.
3.  **Cron-job.org** (or similar): To ping the data ingestion endpoint every minute.

### Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ttrevisan-ilmn/Park-Pulse.git
    cd Park-Pulse
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Copy `.env.example` to `.env.local` and fill in your keys:
    ```bash
    cp .env.example .env.local
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Configure Cron Job:**
    Set up an external cron service to issue a `GET` request to `https://<your-domain>/api/cron/save` every minute, passing your `CRON_SECRET` as a Bearer token in the Authorization header.

## 📄 License
MIT

## 🙏 Acknowledgements
Wait time data provided by the [ThemeParks.wiki API](https://themeparks.wiki).
