# It's Bathtime! 🦇🛁

A production-ready Next.js App Router PWA built to track your kids' bathtime order, complete with a classic superhero comic-book aesthetic!

## Features 🚀

- **Local Data Only**: All session data, kids profiles, and avatars are stored strictly locally in your browser leveraging IndexedDB (`Dexie.js`). No data leaves your device.
- **Fair Rotation System**: Rotates who gets to go first and who has to go last automatically!
- **"I'm feeling lucky" 🎲**: Allows the kid in the 2nd position to scramble the order, injecting a little chaos into bathtime.
- **Kid Management**: Add robust team rosters with avatar picture uploads and cropping support.
- **Statistics**: Dive deep into historical data with stacked bar charts and tabular leaderboards (`Recharts`).
- **Progressive Web App (PWA)**: Installable on Mobile/Desktop, offline support, powered by `@ducanh2912/next-pwa`.
- **Comic-Book Aesthetic**: Vibrant halftones, action sound-texts (POW/BAM/SPLASH), heavy borders, and thick shadows.

## Tech Stack 🛠️

- [Next.js](https://nextjs.org/) (App Router, React 18)
- [Dexie.js](https://dexie.org/) & `dexie-react-hooks` (Simplified IndexedDB)
- [Recharts](https://recharts.org/) (Data Visualization)
- [React Easy Crop](https://www.npmjs.com/package/react-easy-crop) (Avatar Cropping)
- Vanilla CSS (Custom design system inside `globals.css` with no Tailwind)

## Setup & Run Locally 💻

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open the browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).
   *Note: In development, PWA service workers and caching are disabled to make debugging easier.*

## Deployment to Vercel ☁️

This Next.js app is pre-configured and 100% deployable to Vercel without a database (IndexedDB runs on the client end).

1. Push your repository to GitHub/GitLab/Bitbucket.
2. Go to [Vercel](https://vercel.com/) -> Add New Project.
3. Import your repository. Vercel automatically detects Next.js settings.
4. Click **Deploy**. The Next-PWA plugin will correctly generate service workers for the production build.

## How to Use 🦸‍♂️

1. Head to the **Kids** tab to enlist at least 2 Sidekicks. Upload their photos and crop them to make avatars!
2. Go to the **Bathtime** tab. 
3. If feeling lucky, the #2 kid can press the **Dice icon** to randomize the current roster limit. 
4. Once everyone is clean, hit **"Baths Done"** to log the session. The order automatically rotates for tomorrow!
5. View the leaderboards under the **Stats** tab.
