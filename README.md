# Farewell Scrapbook 📸

A beautiful online scrapbook for your team to share photos, notes, and memories for a departing colleague.

## Quick Deploy to Vercel (5 minutes)

### Step 1: Set up shared storage (optional but recommended)

Without this, each person only sees their own entries. With it, all 10 people share the same scrapbook.

1. Go to [jsonbin.io](https://jsonbin.io) and create a free account
2. Click **Create a Bin**
3. Paste this as the content: `{"entries":[],"name":"Our Amazing Colleague"}`
4. Save it — copy the **Bin ID** from the URL
5. Go to **API Keys** in your dashboard — copy your **Master Key**
6. Open `src/App.jsx` and update these lines near the top:
   ```js
   const USE_JSONBIN = true;
   const JSONBIN_ID = "paste-your-bin-id-here";
   const JSONBIN_API_KEY = "paste-your-api-key-here";
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
- JSONBin.io free tier allows 10,000 requests/month — more than enough for a 10-person team
