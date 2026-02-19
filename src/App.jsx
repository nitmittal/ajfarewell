import { useState, useRef, useEffect, useCallback } from "react";

// ============================================================
// STORAGE CONFIG — Choose your backend
// ============================================================
// OPTION 1: JSONBin.io (FREE, recommended for quick setup)
//   1. Go to https://jsonbin.io and sign up (free)
//   2. Create a new bin with content: {"entries":[],"name":"Our Amazing Colleague"}
//   3. Copy your Bin ID and API key below
//
// OPTION 2: localStorage only (no shared state — each person sees only their own entries)
//   Set USE_JSONBIN = false
// ============================================================

const USE_JSONBIN = false; // Set to true after adding your JSONBin credentials
const JSONBIN_ID = "YOUR_BIN_ID_HERE"; // e.g. "65a1b2c3d4e5f6a7b8c9d0e1"
const JSONBIN_API_KEY = "YOUR_API_KEY_HERE"; // e.g. "$2a$10$..."

// ============================================================

const STORAGE_KEY = "farewell_scrapbook_data";

async function loadData() {
  if (USE_JSONBIN) {
    try {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
        headers: { "X-Master-Key": JSONBIN_API_KEY },
      });
      const json = await res.json();
      return json.record || { entries: [], name: "Our Amazing Colleague" };
    } catch (e) {
      console.error("JSONBin load failed, falling back to localStorage", e);
    }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { entries: [], name: "Our Amazing Colleague" };
  } catch { return { entries: [], name: "Our Amazing Colleague" }; }
}

async function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  if (USE_JSONBIN) {
    try {
      await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": JSONBIN_API_KEY,
        },
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.error("JSONBin save failed", e);
    }
  }
}

// ============================================================

const P = {
  bg: "#FDF6EE", bgAlt: "#F5EBE0", card: "#FFFCF8", accent: "#D4845A",
  accentDark: "#B5694A", accentLight: "#F0C9A8", text: "#3D2F25",
  textLight: "#7D6B5D", textMuted: "#A8957F", border: "#E8DDD0",
  gold: "#C9A24D", goldLight: "#F5E6B8", cream: "#FFF8EF",
  shadow: "rgba(61,47,37,0.08)", shadowDeep: "rgba(61,47,37,0.15)",
};

const TAPES = ["#F5E6B8","#E8DDD0","#D4C5B0","#F0D9C0","#E0D0BE"];
const randRot = () => (Math.random()-0.5)*6;
const randTape = () => TAPES[Math.floor(Math.random()*TAPES.length)];

const Heart = ({s=14,c=P.accent}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const Camera = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={P.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const Star = ({s=18}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={P.gold}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const Plus = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const Trash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const RefreshIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;

const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});

export default function App() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [author, setAuthor] = useState("");
  const [note, setNote] = useState("");
  const [img, setImg] = useState(null);
  const [imgPrev, setImgPrev] = useState(null);
  const [name, setName] = useState("Our Amazing Colleague");
  const [editName, setEditName] = useState(false);
  const [tmpName, setTmpName] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);
  const nameRef = useRef(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await loadData();
    setEntries(data.entries || []);
    if (data.name) setName(data.name);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { if (editName && nameRef.current) nameRef.current.focus(); }, [editName]);

  const persist = async (ents, n) => {
    await saveData({ entries: ents, name: n || name });
  };

  const handleImg = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 800;
        let w = image.width, h = image.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = h * MAX / w; w = MAX; } else { w = w * MAX / h; h = MAX; }
        }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(image, 0, 0, w, h);
        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        setImg(compressed); setImgPrev(compressed);
      };
      image.src = ev.target.result;
    };
    reader.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    if (!note.trim() && !img) return;
    setSaving(true);
    const entry = {
      id: Date.now() + "_" + Math.random().toString(36).slice(2,8),
      image: img, author: author.trim() || "Anonymous",
      note: note.trim(), timestamp: new Date().toISOString(),
      rotation: randRot(), tapeColor: randTape(), hearts: 0,
    };
    // Re-fetch to merge
    const current = await loadData();
    const updated = [...(current.entries || []), entry];
    await persist(updated);
    setEntries(updated);
    setAuthor(""); setNote(""); setImg(null); setImgPrev(null);
    setShowModal(false); setSaving(false);
  };

  const handleHeart = async (id) => {
    const current = await loadData();
    const updated = (current.entries || []).map(e => e.id === id ? {...e, hearts: (e.hearts||0)+1} : e);
    await persist(updated);
    setEntries(updated);
  };

  const handleDelete = async (id) => {
    const current = await loadData();
    const updated = (current.entries || []).filter(e => e.id !== id);
    await persist(updated);
    setEntries(updated);
  };

  const doSaveName = async () => {
    const n = tmpName.trim() || name;
    setName(n); setEditName(false);
    const current = await loadData();
    await persist(current.entries || entries, n);
  };

  const memCount = entries.length;

  return (
    <div style={{
      minHeight:"100vh", fontFamily:"'Georgia','Palatino Linotype',serif", color:P.text,
      background:`radial-gradient(ellipse at 20% 0%,${P.accentLight}33,transparent 50%),radial-gradient(ellipse at 80% 100%,${P.goldLight}44,transparent 50%),repeating-linear-gradient(0deg,transparent,transparent 40px,${P.border}22 40px,${P.border}22 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,${P.border}22 40px,${P.border}22 41px),${P.bg}`,
      paddingBottom:80,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Caveat:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{margin:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes floatStar{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-6px) rotate(10deg)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
        @keyframes heartPop{0%{transform:scale(1)}50%{transform:scale(1.4)}100%{transform:scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .hdr{text-align:center;padding:60px 20px 24px;animation:fadeUp .8s ease-out}
        .stars{display:flex;justify-content:center;gap:8px;margin-bottom:16px}
        .stars svg:nth-child(1){animation:floatStar 3s ease-in-out infinite}
        .stars svg:nth-child(2){animation:floatStar 3s ease-in-out infinite .5s}
        .stars svg:nth-child(3){animation:floatStar 3s ease-in-out infinite 1s}
        .stars svg:nth-child(4){animation:floatStar 3s ease-in-out infinite 1.5s}
        .stars svg:nth-child(5){animation:floatStar 3s ease-in-out infinite 2s}
        .htitle{font-family:'Playfair Display',serif;font-size:clamp(2rem,5vw,3.2rem);font-weight:700;letter-spacing:-.02em;line-height:1.2}
        .hname{font-family:'Caveat',cursive;font-size:clamp(2.5rem,6vw,4rem);font-weight:700;color:${P.accent};cursor:pointer;display:inline-block;position:relative;transition:color .2s;line-height:1.3}
        .hname:hover{color:${P.accentDark}}
        .hname::after{content:'\\270E';font-size:.4em;position:absolute;top:4px;right:-24px;opacity:.4;font-family:sans-serif}
        .hsub{font-family:'Lora',serif;font-style:italic;color:${P.textLight};font-size:1.05rem;margin-top:8px}
        .ninp{font-family:'Caveat',cursive;font-size:clamp(2rem,5vw,3rem);font-weight:700;color:${P.accent};background:${P.cream};border:2px dashed ${P.accentLight};border-radius:12px;padding:8px 16px;text-align:center;outline:none;width:min(90%,400px)}
        .divl{width:60px;height:2px;background:${P.accentLight};margin:12px auto 0;border-radius:1px}
        .counter{text-align:center;padding:10px 20px 12px;font-family:'Lora',serif;font-style:italic;color:${P.textMuted};font-size:.9rem;animation:fadeIn 1s ease .8s both}
        .refresh-btn{display:inline-flex;align-items:center;gap:5px;background:${P.cream};border:1.5px solid ${P.border};border-radius:20px;padding:6px 14px;font-family:'Lora',serif;font-size:.8rem;color:${P.textLight};cursor:pointer;transition:all .2s;margin-left:8px;vertical-align:middle}
        .refresh-btn:hover{background:${P.bgAlt};border-color:${P.accentLight}}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:32px;padding:20px clamp(20px,4vw,60px);max-width:1200px;margin:0 auto}
        .card{background:${P.card};border-radius:4px;padding:16px;box-shadow:2px 3px 12px ${P.shadow},0 1px 3px ${P.shadowDeep};position:relative;transition:transform .3s ease,box-shadow .3s ease;animation:scaleIn .5s ease-out both}
        .card:hover{transform:rotate(0deg) scale(1.02)!important;box-shadow:4px 6px 20px ${P.shadowDeep};z-index:2}
        .tape{position:absolute;width:70px;height:22px;top:-10px;left:50%;transform:translateX(-50%) rotate(-2deg);border-radius:2px;opacity:.85;z-index:3}
        .imgwrap{width:100%;aspect-ratio:4/3;overflow:hidden;border-radius:2px;margin-bottom:12px;background:${P.bgAlt};display:flex;align-items:center;justify-content:center}
        .imgwrap img{width:100%;height:100%;object-fit:cover;display:block}
        .noimg{display:flex;flex-direction:column;align-items:center;gap:8px;color:${P.textMuted};font-family:'Caveat',cursive;font-size:1.1rem}
        .enote{font-family:'Caveat',cursive;font-size:1.2rem;line-height:1.5;color:${P.text};margin-bottom:10px;word-wrap:break-word}
        .emeta{display:flex;justify-content:space-between;align-items:center;font-family:'Lora',serif;font-size:.78rem;color:${P.textMuted}}
        .eauthor{font-weight:500;color:${P.textLight}}
        .hbtn{display:inline-flex;align-items:center;gap:4px;background:none;border:none;cursor:pointer;padding:4px 8px;border-radius:20px;font-family:'Lora',serif;font-size:.8rem;color:${P.accent};transition:background .2s}
        .hbtn:hover{background:${P.accentLight}44}
        .hbtn:active svg{animation:heartPop .3s ease}
        .dbtn{position:absolute;top:8px;right:8px;background:${P.card};border:1px solid ${P.border};border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity .2s,background .2s;color:${P.textMuted};z-index:4}
        .card:hover .dbtn{opacity:1}
        .dbtn:hover{background:#fee;color:#c44}
        .addbtn{position:fixed;bottom:28px;right:28px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,${P.accent},${P.accentDark});color:#fff;border:none;cursor:pointer;box-shadow:0 4px 16px ${P.shadowDeep};display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s;z-index:100;animation:fadeIn 1s ease .5s both}
        .addbtn:hover{transform:scale(1.1);box-shadow:0 6px 24px ${P.shadowDeep}}
        .overlay{position:fixed;inset:0;background:rgba(61,47,37,.5);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease}
        .modal{background:${P.card};border-radius:16px;padding:32px;width:min(95%,480px);max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(61,47,37,.3);animation:scaleIn .3s ease}
        .modal h2{font-family:'Playfair Display',serif;font-size:1.5rem;margin-bottom:4px}
        .modal .desc{font-family:'Lora',serif;color:${P.textLight};font-size:.9rem;margin-bottom:20px}
        .fg{margin-bottom:16px}
        .fl{display:block;font-family:'Lora',serif;font-size:.85rem;font-weight:500;color:${P.textLight};margin-bottom:6px}
        .fi{width:100%;padding:10px 14px;border:1.5px solid ${P.border};border-radius:10px;font-family:'Lora',serif;font-size:.95rem;background:${P.cream};color:${P.text};outline:none;transition:border-color .2s}
        .fi:focus{border-color:${P.accentLight}}
        .fta{resize:vertical;min-height:100px;font-family:'Caveat',cursive;font-size:1.15rem;line-height:1.5}
        .uz{border:2px dashed ${P.border};border-radius:12px;padding:24px;text-align:center;cursor:pointer;transition:border-color .2s,background .2s;background:${P.cream}}
        .uz:hover{border-color:${P.accentLight};background:${P.accentLight}15}
        .uprev{width:100%;max-height:200px;object-fit:cover;border-radius:8px}
        .btnrow{display:flex;gap:10px;justify-content:flex-end;margin-top:20px}
        .btnc{padding:10px 20px;border:1.5px solid ${P.border};border-radius:10px;background:transparent;color:${P.textLight};font-family:'Lora',serif;font-size:.9rem;cursor:pointer;transition:background .2s}
        .btnc:hover{background:${P.bgAlt}}
        .btns{padding:10px 24px;border:none;border-radius:10px;background:linear-gradient(135deg,${P.accent},${P.accentDark});color:#fff;font-family:'Lora',serif;font-size:.9rem;font-weight:500;cursor:pointer;transition:transform .1s,box-shadow .2s}
        .btns:hover{transform:translateY(-1px);box-shadow:0 4px 12px ${P.shadow}}
        .btns:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .empty{text-align:center;padding:60px 20px;animation:fadeIn .8s ease}
        .empty-icon{font-size:3rem;margin-bottom:12px}
        .empty h3{font-family:'Playfair Display',serif;font-size:1.3rem;margin-bottom:8px}
        .empty p{font-family:'Lora',serif;color:${P.textLight};font-size:.95rem}
        .loader{display:flex;justify-content:center;padding:80px;color:${P.textMuted};font-family:'Lora',serif;font-style:italic;gap:10px;align-items:center}
        .loader svg{animation:spin 1s linear infinite}
        .banner{background:linear-gradient(135deg,${P.cream},${P.card});border:2px solid ${P.goldLight};border-radius:12px;padding:28px 32px;text-align:center;max-width:560px;margin:0 auto 20px;animation:scaleIn .6s ease both}
        .banner .enote{font-size:1.3rem;color:${P.textLight}}
        .setup-banner{background:${P.goldLight}44;border:1.5px solid ${P.gold}55;border-radius:10px;padding:14px 20px;margin:0 auto 16px;max-width:600px;font-family:'Lora',serif;font-size:.85rem;color:${P.textLight};text-align:center;animation:fadeIn .5s ease}
        .setup-banner a{color:${P.accent};font-weight:500}
      `}</style>

      <header className="hdr">
        <div className="stars">{[...Array(5)].map((_,i)=><Star key={i}/>)}</div>
        <div className="htitle">Farewell & Best Wishes</div>
        {editName ? (
          <div style={{margin:"12px 0"}}>
            <input ref={nameRef} className="ninp" value={tmpName}
              onChange={e=>setTmpName(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter")doSaveName();if(e.key==="Escape")setEditName(false)}}
              onBlur={doSaveName} placeholder="Enter their name..."/>
          </div>
        ) : (
          <div className="hname" onClick={()=>{setTmpName(name);setEditName(true)}} title="Click to edit name">{name}</div>
        )}
        <div className="hsub">A collection of memories from those who'll miss you most</div>
        <div className="divl"/>
      </header>

      <div className="counter">
        {loading ? "Loading memories..." : `${memCount} ${memCount===1?"memory":"memories"} shared so far — add yours!`}
        {!loading && <button className="refresh-btn" onClick={refresh}><RefreshIcon/> Refresh</button>}
      </div>

      {!loading && !USE_JSONBIN && (
        <div className="setup-banner">
          <strong>Local mode:</strong> Entries are stored in each browser separately.
          To share across your team, set up <a href="https://jsonbin.io" target="_blank" rel="noopener">JSONBin.io</a> (free) —
          see instructions in <code>src/App.jsx</code> at the top.
        </div>
      )}

      {loading && (
        <div className="loader">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.textMuted} strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          Loading your team's memories...
        </div>
      )}

      {!loading && (
        <div style={{padding:"0 clamp(20px,4vw,60px)",maxWidth:1200,margin:"0 auto"}}>
          <div className="banner">
            <div className="enote">
              We'll miss you more than words can say. This scrapbook is a small token of the incredible memories we've shared. Hit the <strong style={{color:P.accent}}>+</strong> button to add yours!
            </div>
            <div className="emeta" style={{justifyContent:"center",marginTop:12}}>
              <span className="eauthor">— The Team</span>
            </div>
          </div>
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="empty">
          <div className="empty-icon">📸</div>
          <h3>No memories yet</h3>
          <p>Be the first to share a photo or note!</p>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div className="grid">
          {entries.map((entry, i) => (
            <div key={entry.id} className="card"
              style={{transform:`rotate(${entry.rotation||0}deg)`,animationDelay:`${i*0.08}s`}}>
              <div className="tape" style={{background:entry.tapeColor||randTape()}}/>
              <button className="dbtn" onClick={()=>handleDelete(entry.id)} title="Remove"><Trash/></button>
              {entry.image ? (
                <div className="imgwrap"><img src={entry.image} alt={`Memory by ${entry.author}`}/></div>
              ) : (
                <div className="imgwrap"><div className="noimg"><Camera/><span>Note only</span></div></div>
              )}
              {entry.note && <div className="enote">{entry.note}</div>}
              <div className="emeta">
                <span className="eauthor">— {entry.author}</span>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span>{fmtDate(entry.timestamp)}</span>
                  <button className="hbtn" onClick={()=>handleHeart(entry.id)}>
                    <Heart/>{entry.hearts>0&&<span>{entry.hearts}</span>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="addbtn" onClick={()=>setShowModal(true)} title="Add a memory"><Plus/></button>

      {showModal && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setShowModal(false)}}>
          <div className="modal">
            <h2>Add a Memory</h2>
            <p className="desc">Share a photo, a note, or both — anything you want {name} to remember.</p>
            <div className="fg">
              <label className="fl">Your Name</label>
              <input className="fi" value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Who's writing this?"/>
            </div>
            <div className="fg">
              <label className="fl">Photo (optional)</label>
              <input type="file" accept="image/*" ref={fileRef} onChange={handleImg} style={{display:"none"}}/>
              {imgPrev ? (
                <div style={{position:"relative"}}>
                  <img src={imgPrev} alt="Preview" className="uprev"/>
                  <button style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.5)",color:"#fff",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}
                    onClick={()=>{setImg(null);setImgPrev(null)}}>×</button>
                </div>
              ) : (
                <div className="uz" onClick={()=>fileRef.current.click()}>
                  <Camera/>
                  <p style={{fontFamily:"'Lora',serif",fontSize:".9rem",color:P.textMuted,marginTop:8}}>Click to upload a photo</p>
                </div>
              )}
            </div>
            <div className="fg">
              <label className="fl">Your Note / Memory</label>
              <textarea className="fi fta" value={note} onChange={e=>setNote(e.target.value)}
                placeholder="Write your favorite memory, a wish, or anything from the heart..."/>
            </div>
            <div className="btnrow">
              <button className="btnc" onClick={()=>{setShowModal(false);setImg(null);setImgPrev(null)}}>Cancel</button>
              <button className="btns" disabled={(!note.trim()&&!img)||saving} onClick={handleSubmit}>
                {saving ? "Saving..." : "Add to Scrapbook"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
