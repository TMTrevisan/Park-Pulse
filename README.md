# Park Pulse: Disney Wait Time Tracker

Park Pulse is a modern, real-time dashboard for tracking wait times at **Disneyland Park** and **Disney California Adventure**. Built with Next.js and Tailwind CSS, it offers a premium user experience for analyzing ride availability and trends.

## 🚀 Key Features

### 📊 Real-Time Dashboard
*   **Live Data**: Connects to the [ThemeParks.wiki API](https://themeparks.wiki) for up-to-the-minute wait times.
*   **Park Status**: Instant "Busyness" indicator (Quiet, Moderate, Busy, Very Busy) based on park-wide averages.
*   **Search**: Instantly filter rides by name.

### 📱 Advanced List View
The table view is optimized for power users and mobile devices:
*   **Drag-and-Drop Columns**: Customize your view by dragging column headers. Reorder them however you like (e.g., move "Wait Time" next to "Ride Name").
    *   *Mobile Friendly*: Touch-optimized drag handles are always visible.
*   **Sticky Columns**: The first column in your custom order stays frozen while you scroll horizontally to view hourly forecasts.
*   **Smart Sorting**: Sort by Ride Name, Wait Time, Status, Land, or **Ticket Tier**.
*   **Ticket Value**: Rides are categorized by tier for easy filtering:
    *   **E-Ticket**: Headliners (e.g., *Rise of the Resistance*, *Space Mountain*).
    *   **D-Ticket**: Major attractions.
    *   **C/B/A-Ticket**: Smaller experiences.
*   **Hourly Forecasts**: Color-coded columns (Green/Yellow/Red) show predicted wait times for 9AM, 11AM, 1PM, etc.
*   **Trend Sparklines**: Visual line charts showing the wait time trend for the day.

### 🖼️ Grid View
*   **Visual Cards**: Browse rides with a clean, card-based layout.
*   **History Charts**: Click any ride card to expand a detailed interactive chart of wait time history.

## 🛠️ Tech Stack
*   **Framework**: Next.js 14 (App Router)
*   **Styling**: Tailwind CSS & Shadcn UI
*   **Charts**: Recharts
*   **Icons**: Lucide React
*   **Interactions**: @dnd-kit (Drag & Drop)
*   **Language**: TypeScript

## 🏃‍♂️ Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ttrevisan-ilmn/Park-Pulse.git
    cd Park-Pulse
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the app:**
    Navigate to [http://localhost:3000](http://localhost:3000)

## 📄 License
MIT

## 🙏 Acknowledgements
Wait time data provided by the [ThemeParks.wiki API](https://themeparks.wiki).
