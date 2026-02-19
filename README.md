# Farewell Scrapbook 📸

A beautiful online scrapbook for your team to share photos, notes, and memories for a departing colleague.

## Quick Deploy to Vercel (5 minutes)

### Step 1: Set up shared storage (30 seconds)

Without this, each person only sees their own entries. With it, all 10 people share the same scrapbook.

1. Go to [npoint.io](https://www.npoint.io) — no signup needed
2. Paste this as the content: `{"entries":[],"name":"Our Amazing Colleague"}`
3. Click **Save**
4. Copy the ID from the URL (e.g. if the URL is `https://www.npoint.io/docs/abc123def456`, the ID is `abc123def456`)
5. Open `src/App.jsx` and update this line near the top:
   ```js
   const NPOINT_ID = "abc123def456";
   ```

### Step 2: Deploy to Vercel

**Option A — Via GitHub (recommended)**
1. Push this folder to a new GitHub repo
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **Add New → Project** and import the repo
4. Click **Deploy** — done!

**Option B — Via Vercel CLI**
```bash
npm install -g vercel
cd scrapbook-app
npm install
vercel
```
Follow the prompts and you'll get a live URL in ~60 seconds.

### Step 3: Share the link

Send the Vercel URL to your team. Everyone can:
- Upload photos with notes
- Heart each other's memories
- Click the name at the top to personalize it

## Local Development

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Notes

- Photos are automatically compressed to ~800px max and JPEG quality 0.7
- The scrapbook name is editable by clicking on it
- Works great on mobile and desktop
- npoint.io is free with no signup — data persists indefinitely and is more than enough for a 10-person team
