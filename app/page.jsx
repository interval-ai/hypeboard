"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const C = {
  bg: "#080a0f",
  surface: "#0e111a",
  card: "#111520",
  cardAlt: "#13172280",
  border: "#1a2035",
  blue: "#3b82f6",
  blueDim: "#3b82f618",
  blueBright: "#60a5fa",
  blueGlow: "#3b82f640",
  text: "#eef2ff",
  muted: "#4b5675",
  mutedLight: "#8b95b0",
  green: "#34d399",
  pink: "#f472b6",
  purple: "#a78bfa",
};

const HYPE_PHRASES = [
  "Your team is on fire.",
  "Big moves. Bigger moments.",
  "Every win deserves a witness.",
  "Hype is contagious — spread it.",
  "The energy is real.",
  "Your people. Your legends.",
  "Good vibes. Loud and clear.",
];

const CATEGORIES = ["Teamwork", "Innovation", "Leadership", "Clutch Save", "Above & Beyond", "Big Energy"];
const BADGE_EMOJIS = ["🔥", "⚡", "💎", "🚀", "🌟", "🏆", "👑", "🎯"];

const SEED = [
  {
    id: 1, from: "Jordan", to: "Alex", category: "Clutch Save",
    message: "Stayed late, fixed the critical bug 30 min before the client demo. Absolute hero.",
    likes: 14, emoji: "🔥", timestamp: "2h ago", photo: null,
    comments: [
      { id: 101, author: "Sam", text: "This is facts, Alex you're built different 🙌", likes: 4, timestamp: "1h ago" },
      { id: 102, author: "Morgan", text: "LEGEND behavior fr fr", likes: 7, timestamp: "45m ago" },
    ],
  },
  {
    id: 2, from: "Sam", to: "Riley", category: "Innovation",
    message: "The AR dashboard redesign you pitched? Clients haven't stopped talking about it.",
    likes: 9, emoji: "💎", timestamp: "5h ago", photo: null,
    comments: [
      { id: 201, author: "Casey", text: "Riley has been on another level this quarter", likes: 3, timestamp: "4h ago" },
    ],
  },
  {
    id: 3, from: "Casey", to: "The whole team", category: "Teamwork",
    message: "Best offsite we've ever had. Everyone showed up, connected, and left fired up. This is what we're about.",
    likes: 24, emoji: "👑", timestamp: "1d ago", photo: "PLACEHOLDER_TEAM",
    comments: [
      { id: 301, author: "Jordan", text: "Lake Tahoe was immaculate 🏔️", likes: 9, timestamp: "22h ago" },
      { id: 302, author: "Alex", text: "The bonding session hit different. We needed that.", likes: 12, timestamp: "20h ago" },
      { id: 303, author: "Riley", text: "Already can't wait for the next one 🔥", likes: 6, timestamp: "18h ago" },
    ],
  },
  {
    id: 4, from: "Alex", to: "Jordan", category: "Leadership",
    message: "The way you ran that all-hands had everyone walking out genuinely energized.",
    likes: 11, emoji: "🚀", timestamp: "1d ago", photo: null,
    comments: [],
  },
  {
    id: 5, from: "Riley", to: "Sam", category: "Above & Beyond",
    message: "Onboarded two new hires, hit quota, AND organized the offsite. You're a different breed.",
    likes: 13, emoji: "⚡", timestamp: "2d ago", photo: null,
    comments: [
      { id: 501, author: "Jordan", text: "Sam is literally three people in one 😭", likes: 8, timestamp: "1d ago" },
    ],
  },
];

const WRAPPED_STATS = [
  { label: "Total Recognitions", value: "247", emoji: "🎉", color: C.blue },
  { label: "Hype Moments", value: "38", emoji: "🔥", color: C.pink },
  { label: "Team Members Hyped", value: "24", emoji: "👥", color: C.purple },
  { label: "Biggest Hype Day", value: "Launch Day", emoji: "🚀", color: C.green },
];

const TOP_PEOPLE = [
  { name: "Morgan", count: 31, title: "The Backbone", emoji: "👑" },
  { name: "Alex", count: 28, title: "The Closer", emoji: "🔥" },
  { name: "Riley", count: 24, title: "The Innovator", emoji: "💎" },
];

/* ─── CSS ─── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #080a0f; color: #eef2ff; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
  .bebas { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.04em; }

  @keyframes slide-up    { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
  @keyframes float       { 0%,100%{transform:translateY(0);}50%{transform:translateY(-7px);} }
  @keyframes pulse-dot   { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.45;transform:scale(.8);} }
  @keyframes ticker      { 0%{transform:translateX(0);}100%{transform:translateX(-50%);} }
  @keyframes glow-breathe{ 0%,100%{box-shadow:0 0 16px #3b82f640;}50%{box-shadow:0 0 38px #3b82f650;} }
  @keyframes border-glow { 0%,100%{border-color:#3b82f628;}50%{border-color:#3b82f660;} }
  @keyframes rotate-slow { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
  @keyframes phrase-in   { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
  @keyframes phrase-out  { from{opacity:1;transform:translateY(0);}to{opacity:0;transform:translateY(-14px);} }
  @keyframes card-shine  { 0%{transform:translateX(-100%) skewX(-15deg);}100%{transform:translateX(300%) skewX(-15deg);} }
  @keyframes comment-in  { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }
  @keyframes drag-pulse  { 0%,100%{border-color:#3b82f660;}50%{border-color:#3b82f6;} }
  @keyframes fade-in     { from{opacity:0;}to{opacity:1;} }

  .nav-blur { background:#080a0fcc; backdrop-filter:blur(16px); border-bottom:1px solid #1a2035; position:sticky; top:0; z-index:100; }

  .tab-btn { padding:7px 15px; border-radius:8px; border:none; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.18s; background:transparent; color:#4b5675; }
  .tab-btn:hover { color:#eef2ff; }
  .tab-btn.active { background:#3b82f618; color:#3b82f6; border:1px solid #3b82f630; }

  .stat-card { background:#111520; border:1px solid #1a2035; border-radius:16px; padding:20px; animation:border-glow 4s ease infinite; transition:transform 0.2s; }
  .stat-card:hover { transform:translateY(-2px); }

  .rec-card { background:#111520; border:1px solid #1a2035; border-radius:18px; overflow:hidden; transition:transform 0.2s, border-color 0.2s, box-shadow 0.2s; position:relative; }
  .rec-card:hover { transform:translateY(-2px); border-color:#3b82f640; box-shadow:0 8px 32px #3b82f610; }
  .rec-card::before { content:''; position:absolute; top:0; left:0; width:40px; height:100%; background:linear-gradient(90deg,transparent,#3b82f608,transparent); transform:translateX(-100%) skewX(-15deg); pointer-events:none; }
  .rec-card:hover::before { animation:card-shine 0.7s ease forwards; }

  .comment-box { background:#0e111a; border-top:1px solid #1a2035; }
  .comment-item { padding:12px 20px; border-bottom:1px solid #1a203530; animation:comment-in 0.25s ease; }
  .comment-item:last-child { border-bottom:none; }
  .comment-like { padding:3px 10px; border-radius:7px; font-family:'DM Sans',sans-serif; font-size:11px; font-weight:600; cursor:pointer; transition:all 0.15s; border:1px solid #1a2035; background:transparent; color:#4b5675; }
  .comment-like:hover { border-color:#3b82f640; color:#8b95b0; }
  .comment-like.liked { background:#3b82f618; border-color:#3b82f650; color:#3b82f6; }

  .comment-input-row { display:flex; gap:8px; padding:12px 16px; border-top:1px solid #1a2035; background:#080a0f80; }
  .comment-input-row input { background:#13172260; border:1px solid #1a2035; border-radius:20px; padding:8px 14px; color:#eef2ff; font-size:13px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.18s; flex:1; }
  .comment-input-row input:focus { border-color:#3b82f6; }
  .comment-send { padding:8px 16px; border-radius:20px; border:none; background:#3b82f6; color:#fff; font-size:12px; font-weight:600; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.15s; white-space:nowrap; }
  .comment-send:hover { background:#60a5fa; }

  .toggle-comments { padding:5px 12px; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.15s; background:transparent; border:1px solid #1a2035; color:#4b5675; }
  .toggle-comments:hover { border-color:#3b82f640; color:#8b95b0; }

  .like-btn { padding:5px 14px; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.18s; }
  .like-btn.liked   { background:#3b82f618; border:1px solid #3b82f650; color:#3b82f6; }
  .like-btn.unliked { background:transparent; border:1px solid #1a2035; color:#4b5675; }
  .like-btn.unliked:hover { border-color:#3b82f640; color:#8b95b0; }

  .hype-btn { width:100%; padding:15px; border:none; border-radius:12px; background:#3b82f6; color:#fff; font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:0.1em; cursor:pointer; animation:glow-breathe 3s ease infinite; transition:transform 0.15s; }
  .hype-btn:hover { transform:scale(1.01); }

  .ghost-btn { padding:10px 22px; border-radius:10px; border:1px solid #1a2035; background:transparent; color:#8b95b0; font-family:'DM Sans',sans-serif; font-size:14px; cursor:pointer; transition:all 0.18s; }
  .ghost-btn:hover { border-color:#3b82f6; color:#eef2ff; }

  input, textarea, select { width:100%; background:#0e111a; border:1px solid #1a2035; border-radius:10px; padding:12px 16px; color:#eef2ff; font-size:14px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.18s, box-shadow 0.18s; }
  input:focus, textarea:focus, select:focus { border-color:#3b82f6; box-shadow:0 0 0 3px #3b82f618; }
  select option { background:#111520; }
  label { display:block; font-size:11px; font-weight:600; color:#4b5675; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px; }

  .drop-zone { border:2px dashed #1a2035; border-radius:12px; padding:24px; text-align:center; cursor:pointer; transition:all 0.2s; background:#0e111a; }
  .drop-zone:hover, .drop-zone.dragging { border-color:#3b82f6; background:#3b82f618; animation:drag-pulse 1.5s ease infinite; }
  .photo-preview { border-radius:10px; overflow:hidden; position:relative; animation:fade-in 0.3s ease; }
  .photo-preview img { width:100%; height:200px; object-fit:cover; display:block; }
  .photo-remove { position:absolute; top:8px; right:8px; width:28px; height:28px; border-radius:50%; background:rgba(0,0,0,0.75); border:1px solid #1a2035; color:#fff; font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
  .photo-remove:hover { background:rgba(220,38,38,0.85); }

  .lightbox { position:fixed; inset:0; background:rgba(0,0,0,0.92); z-index:999; display:flex; align-items:center; justify-content:center; animation:fade-in 0.2s ease; cursor:pointer; }
  .lightbox img { max-width:90vw; max-height:88vh; border-radius:12px; object-fit:contain; cursor:default; }
  .lightbox-close { position:fixed; top:18px; right:22px; font-size:26px; color:#fff; cursor:pointer; opacity:0.7; background:none; border:none; }

  .wrapped-stat { background:#111520; border:1px solid #1a2035; border-radius:16px; padding:26px; position:relative; overflow:hidden; transition:transform 0.2s; }
  .wrapped-stat:hover { transform:translateY(-3px); }

  .orb { position:fixed; border-radius:50%; pointer-events:none; z-index:0; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-thumb { background:#1a2035; border-radius:2px; }
`;

/* ─── Rotating phrase ─── */
function RotatingPhrase() {
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState("phrase-in");
  useState(() => {
    const t = setInterval(() => {
      setAnim("phrase-out");
      setTimeout(() => { setIdx(i => (i + 1) % HYPE_PHRASES.length); setAnim("phrase-in"); }, 360);
    }, 3400);
    return () => clearInterval(t);
  });
  return (
    <div style={{ height: "2em", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <span style={{ display: "block", animation: `${anim} 0.36s ease forwards`, color: C.blue, fontStyle: "italic", fontWeight: 300, fontSize: "clamp(17px, 2.4vw, 24px)", letterSpacing: "-0.01em" }}>
        {HYPE_PHRASES[idx]}
      </span>
    </div>
  );
}

/* ─── Photo drop zone ─── */
function PhotoDropZone({ photo, onPhoto, onRemove }) {
  const fileRef = useRef();
  const [dragging, setDragging] = useState(false);
  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = (e) => onPhoto(e.target.result);
    r.readAsDataURL(file);
  };
  if (photo) return (
    <div className="photo-preview">
      <img src={photo} alt="Attached" />
      <button className="photo-remove" onClick={onRemove}>✕</button>
    </div>
  );
  return (
    <div className={`drop-zone ${dragging ? "dragging" : ""}`}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
      onClick={() => fileRef.current.click()}
    >
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
      <div style={{ fontSize: 26, marginBottom: 6 }}>📸</div>
      <div style={{ color: C.mutedLight, fontSize: 13, fontWeight: 500 }}>Attach a photo <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span></div>
      <div style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>Client meeting · team activity · big win — drag & drop or click</div>
    </div>
  );
}

/* ─── Comment section ─── */

/* ─── User picker dropdown ─── */
function UserPicker({ value, onChange, users, placeholder }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  const select = (user) => {
    onChange(user.name);
    setQuery("");
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <input
          value={open ? query : value}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          style={{ paddingRight: value && !open ? 32 : 16 }}
        />
        {value && !open && (
          <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>✓</div>
        )}
      </div>
      {open && (users.length > 0 ? (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#111520", border: "1px solid #1a2035", borderRadius: 10, zIndex: 50, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "10px 14px", color: "#4b5675", fontSize: 13 }}>No matches</div>
          ) : filtered.map(u => (
            <div key={u.id} onClick={() => select(u)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer", transition: "background 0.12s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#3b82f615"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {u.avatar
                ? <img src={u.avatar} alt="" style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0 }} />
                : <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f660, #a78bfa60)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{u.name[0]}</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#eef2ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</div>
                {u.title && <div style={{ fontSize: 11, color: "#4b5675", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.title}</div>}
              </div>
              <div style={{ fontSize: 11, color: "#4b5675" }}>@{u.handle}</div>
            </div>
          ))}
        </div>
      ) : null)}
    </div>
  );
}

function CommentSection({ recId, comments, onAddComment, likedComments, onLikeComment }) {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);

  const send = () => {
    const author = name.trim() || "Anonymous";
    if (!text.trim()) return;
    onAddComment(recId, author, text.trim());
    setText("");
  };

  return (
    <div className="comment-box">
      {comments.map(c => (
        <div key={c.id} className="comment-item">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blue}60, ${C.purple}60)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {c.author[0].toUpperCase()}
                </div>
                <span style={{ fontWeight: 600, fontSize: 12, color: C.text }}>{c.author}</span>
                <span style={{ fontSize: 11, color: C.muted }}>{c.timestamp}</span>
              </div>
              <p style={{ fontSize: 13, color: C.mutedLight, lineHeight: 1.55, paddingLeft: 30 }}>{c.text}</p>
            </div>
            <button
              className={`comment-like ${likedComments.includes(c.id) ? "liked" : ""}`}
              onClick={() => onLikeComment(recId, c.id)}
              style={{ flexShrink: 0 }}
            >
              🔥 {c.likes}
            </button>
          </div>
        </div>
      ))}

      {/* Name + comment input */}
      <div style={{ padding: "10px 16px 12px", background: "#080a0f60" }}>
        {showNameInput && (
          <div style={{ marginBottom: 8 }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name (optional)"
              style={{ fontSize: 12, padding: "7px 12px", borderRadius: 8 }}
            />
          </div>
        )}
        <div className="comment-input-row" style={{ padding: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blue}50, ${C.purple}50)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12 }}>💬</div>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onFocus={() => setShowNameInput(true)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Add to the hype…"
          />
          <button className="comment-send" onClick={send}>Send 🔥</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Recognition card ─── */
function RecCard({ rec, liked, onLike, likedComments, onLikeComment, onAddComment }) {
  const [showComments, setShowComments] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const hasRealPhoto = rec.photo && rec.photo !== "PLACEHOLDER_TEAM";
  const hasPlaceholder = rec.photo === "PLACEHOLDER_TEAM";
  const commentCount = rec.comments.length;

  return (
    <>
      {lightbox && hasRealPhoto && (
        <div className="lightbox" onClick={() => setLightbox(false)}>
          <button className="lightbox-close">✕</button>
          <img src={rec.photo} alt="Full size" onClick={e => e.stopPropagation()} />
        </div>
      )}
      <div className="rec-card">
        {/* Main content */}
        <div style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, flexShrink: 0, background: `${C.blue}15`, border: `1px solid ${C.blue}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, animation: `float 5s ease infinite` }}>
              {rec.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                <div style={{ fontSize: 15 }}>
                  <span style={{ color: C.mutedLight }}>{rec.from}</span>
                  <span style={{ color: C.muted, margin: "0 7px", fontSize: 11 }}>→</span>
                  <span style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>{rec.to}</span>
                </div>
                <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
                  {rec.photo && <span style={{ background: `${C.green}18`, color: C.green, border: `1px solid ${C.green}30`, padding: "2px 8px", borderRadius: 5, fontSize: 10, fontWeight: 600 }}>📸 PHOTO</span>}
                  <span style={{ background: `${C.blue}18`, color: C.blue, border: `1px solid ${C.blue}30`, padding: "3px 10px", borderRadius: 5, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{rec.category}</span>
                  <span style={{ color: C.muted, fontSize: 11 }}>{rec.timestamp}</span>
                </div>
              </div>

              {/* Message */}
              <p style={{ color: C.mutedLight, marginTop: 9, lineHeight: 1.65, fontSize: 14 }}>"{rec.message}"</p>

              {/* Action row */}
              <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
                <button className={`like-btn ${liked ? "liked" : "unliked"}`} onClick={onLike}>
                  🔥 {rec.likes} {liked ? "Hyped!" : "Hype this"}
                </button>
                <button className="toggle-comments" onClick={() => setShowComments(v => !v)}>
                  💬 {commentCount} {commentCount === 1 ? "comment" : "comments"} {showComments ? "▲" : "▼"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Photo */}
        {hasRealPhoto && (
          <div onClick={() => setLightbox(true)} style={{ cursor: "pointer", borderTop: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
            <img src={rec.photo} alt="Attached" style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block", transition: "transform 0.3s" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 14px", background: "linear-gradient(transparent, rgba(0,0,0,0.6))", fontSize: 11, color: "rgba(255,255,255,0.7)" }}>📸 Tap to expand</div>
          </div>
        )}
        {hasPlaceholder && (
          <div style={{ borderTop: `1px solid ${C.border}`, background: `linear-gradient(135deg, ${C.blue}25, ${C.purple}15)`, height: 160, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 36 }}>🏔️</span>
            <span style={{ color: C.blue, fontWeight: 600, fontSize: 13 }}>Team Offsite · Lake Tahoe</span>
            <span style={{ color: C.muted, fontSize: 11 }}>📍 Team Activity</span>
          </div>
        )}

        {/* Comments */}
        {showComments && (
          <CommentSection
            recId={rec.id}
            comments={rec.comments}
            onAddComment={onAddComment}
            likedComments={likedComments}
            onLikeComment={onLikeComment}
          />
        )}
      </div>
    </>
  );
}

/* ─── MAIN ─── */
export default function HypeBoard() {
  const [view, setView] = useState("feed");
  const [recs, setRecs] = useState(SEED);
  const [liked, setLiked] = useState([]);
  const [likedComments, setLikedComments] = useState([]);
  const [form, setForm] = useState({ from: "", to: "", category: CATEGORIES[0], message: "", emoji: "🔥", photo: null });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [slackUsers, setSlackUsers] = useState([]);

  // Load Slack users for the picker
  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(d => {
      if (d.users?.length) setSlackUsers(d.users);
    }).catch(() => {});
  }, []);

  const loadRecs = useCallback(async () => {
    try {
      const res = await fetch("/api/recognize");
      const data = await res.json();
      if (data.recognitions?.length) setRecs(data.recognitions);
    } catch (e) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadRecs();
    const interval = setInterval(loadRecs, 15000);
    return () => clearInterval(interval);
  }, [loadRecs]);

  const submit = async () => {
    if (!form.from || !form.to || !form.message) return;
    const optimistic = { id: Date.now(), ...form, likes: 0, timestamp: "Just now", comments: [] };
    setRecs(prev => [optimistic, ...prev]);
    setSubmitted(true);
    await fetch("/api/recognize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setTimeout(() => { setSubmitted(false); setView("feed"); setForm({ from: "", to: "", category: CATEGORIES[0], message: "", emoji: "🔥", photo: null }); }, 2200);
  };

  const like = async (id) => {
    if (liked.includes(id)) return;
    setLiked(prev => [...prev, id]);
    setRecs(prev => prev.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r));
    await fetch("/api/slack", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "like", recId: id }) });
  };

  const addComment = async (recId, author, text) => {
    const newComment = { id: Date.now(), author, text, likes: 0, timestamp: "Just now" };
    setRecs(prev => prev.map(r => r.id === recId ? { ...r, comments: [...r.comments, newComment] } : r));
    await fetch("/api/slack", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "comment", recId, author, text }) });
  };

  const likeComment = async (recId, commentId) => {
    const key = `${recId}-${commentId}`;
    if (likedComments.includes(key)) return;
    setLikedComments(prev => [...prev, key]);
    setRecs(prev => prev.map(r => r.id === recId ? { ...r, comments: r.comments.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c) } : r));
    await fetch("/api/slack", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "likeComment", recId, commentId }) });
  };

  const totalLikes = recs.reduce((a, r) => a + r.likes, 0);
  const totalComments = recs.reduce((a, r) => a + r.comments.length, 0);
  const photoCount = recs.filter(r => r.photo).length;
  const tickerItems = [...recs, ...recs, ...recs];

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <style>{css}</style>

      {/* Ambient orbs */}
      <div className="orb" style={{ width: 700, height: 700, top: -280, right: -220, background: `radial-gradient(circle, ${C.blue}0c 0%, transparent 65%)` }} />
      <div className="orb" style={{ width: 500, height: 500, bottom: -120, left: -140, background: `radial-gradient(circle, ${C.purple}0e 0%, transparent 65%)` }} />

      {/* NAV */}
      <nav className="nav-blur">
        <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12.5" stroke={C.blue} strokeWidth="1.5"/>
              <path d="M14 5 C10 9 10 14 14 14 C18 14 18 19 14 23" stroke={C.blue} strokeWidth="2" strokeLinecap="round" fill="none"/>
              <circle cx="14" cy="14" r="2.5" fill={C.blue}/>
            </svg>
            <span className="bebas" style={{ fontSize: 18, letterSpacing: "0.08em" }}>INTERVAL</span>
            <span style={{ color: C.border }}>·</span>
            <span className="bebas" style={{ fontSize: 14, color: C.blue, letterSpacing: "0.12em" }}>HYPEBOARD</span>
          </div>

          <div style={{ display: "flex", gap: 2 }}>
            {[["feed","🔥 Feed"], ["give","✨ Give Hype"], ["wrapped","🎁 Wrapped"]].map(([key, label]) => (
              <button key={key} className={`tab-btn ${view === key ? "active" : ""}`} onClick={() => setView(key)}>{label}</button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, animation: "pulse-dot 2s ease infinite" }} />
            <span style={{ fontSize: 11, color: C.muted }}>{recs.length} live</span>
          </div>
        </div>
      </nav>

      {/* TICKER */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "stretch" }}>
          <div style={{ background: C.blue, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", animation: "pulse-dot 1.5s ease infinite" }} />
            <span className="bebas" style={{ fontSize: 12, color: "#fff", letterSpacing: "0.12em" }}>LIVE</span>
          </div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{ display: "inline-flex", animation: "ticker 32s linear infinite", whiteSpace: "nowrap", padding: "6px 0" }}>
              {tickerItems.map((r, i) => (
                <span key={i} style={{ fontSize: 12, color: C.muted, marginRight: 40 }}>
                  <span style={{ color: C.blue, fontWeight: 600 }}>{r.from}</span>
                  <span> hyped </span>
                  <span style={{ color: C.text, fontWeight: 600 }}>{r.to}</span>
                  {r.photo && <span style={{ color: C.green }}> 📸</span>}
                  {r.comments.length > 0 && <span style={{ color: C.purple }}> 💬{r.comments.length}</span>}
                  <span style={{ opacity: 0.3, margin: "0 14px" }}>✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 }}>

        {/* HERO — fixed height so it never clips */}
        <div style={{ padding: "52px 0 36px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: `${C.blue}15`, border: `1px solid ${C.blue}35`, borderRadius: 100, padding: "5px 15px", marginBottom: 24, animation: "border-glow 3s ease infinite" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, animation: "pulse-dot 2s ease infinite" }} />
            <span style={{ fontSize: 11, color: C.blue, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Interval Internal · Recognition Platform</span>
          </div>

          {/* Big title — clamp prevents overflow */}
          <div className="bebas" style={{ fontSize: "clamp(64px, 13vw, 120px)", lineHeight: 0.9, letterSpacing: "0.03em", marginBottom: 20 }}>
            <div style={{ color: C.text }}>HYPE</div>
            <div style={{ WebkitTextStroke: `2px ${C.blue}`, WebkitTextFillColor: "transparent" }}>BOARD</div>
          </div>

          {/* Rotating phrase — fixed height container */}
          <div style={{ minHeight: 36, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
            <RotatingPhrase />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setView("give")} style={{ padding: "11px 26px", borderRadius: 10, border: "none", background: C.blue, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", animation: "glow-breathe 3s ease infinite" }}>
              ✨ Give Recognition
            </button>
            <button className="ghost-btn" onClick={() => setView("wrapped")}>View Wrapped →</button>
          </div>
        </div>

        {/* ── FEED ── */}
        {view === "feed" && (
          <div style={{ animation: "slide-up 0.35s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
              {[
                { label: "Shoutouts", val: recs.length, icon: "🎉", color: C.blue },
                { label: "Comments", val: totalComments, icon: "💬", color: C.purple },
                { label: "Photos Shared", val: photoCount, icon: "📸", color: C.green },
              ].map((s, i) => (
                <div key={s.label} className="stat-card" style={{ animationDelay: `${i * 1.5}s` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontSize: 24, animation: `float ${4 + i}s ease infinite` }}>{s.icon}</div>
                    <div>
                      <div className="bebas" style={{ fontSize: 34, color: s.color, lineHeight: 1 }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recs.map((rec, i) => (
                <div key={rec.id} style={{ animation: `slide-up 0.4s ease ${i * 0.05}s both` }}>
                  <RecCard
                    rec={rec}
                    liked={liked.includes(rec.id)}
                    onLike={() => like(rec.id)}
                    likedComments={likedComments.filter(k => k.startsWith(`${rec.id}-`)).map(k => parseInt(k.split("-")[1]))}
                    onLikeComment={likeComment}
                    onAddComment={addComment}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── GIVE HYPE ── */}
        {view === "give" && (
          <div style={{ animation: "slide-up 0.35s ease", maxWidth: 560, margin: "0 auto" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 68, animation: "float 1s ease infinite" }}>🎉</div>
                <div className="bebas" style={{ fontSize: 54, color: C.blue, marginTop: 18, letterSpacing: "0.06em" }}>HYPE SENT!</div>
                <p style={{ color: C.muted, marginTop: 8, fontSize: 15 }}>Live on the board now.</p>
              </div>
            ) : (
              <div style={{ background: C.card, borderRadius: 20, padding: 32, border: `1px solid ${C.border}`, animation: "border-glow 4s ease infinite" }}>
                <div className="bebas" style={{ fontSize: 34, letterSpacing: "0.06em", marginBottom: 4 }}>DROP SOME HYPE</div>
                <p style={{ color: C.muted, fontSize: 14, marginBottom: 26 }}>Recognize a teammate for something great</p>

                <div style={{ marginBottom: 20 }}>
                  <label>Pick your vibe</label>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {BADGE_EMOJIS.map(e => (
                      <button key={e} onClick={() => setForm({ ...form, emoji: e })} style={{ width: 42, height: 42, borderRadius: 10, fontSize: 18, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s", background: form.emoji === e ? `${C.blue}20` : C.surface, border: `1px solid ${form.emoji === e ? C.blue : C.border}`, transform: form.emoji === e ? "scale(1.1)" : "scale(1)" }}>{e}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div>
                    <label>Your name</label>
                    {slackUsers.length > 0
                      ? <UserPicker value={form.from} onChange={v => setForm({ ...form, from: v })} users={slackUsers} placeholder="Your name" />
                      : <input value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} placeholder="Your name" />
                    }
                  </div>
                  <div>
                    <label>Recognizing</label>
                    {slackUsers.length > 0
                      ? <UserPicker value={form.to} onChange={v => setForm({ ...form, to: v })} users={slackUsers} placeholder="Their name" />
                      : <input value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} placeholder="Their name" />
                    }
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label>The hype message</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell them exactly why they're crushing it..." rows={3} />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label>Attach a photo <span style={{ color: C.blue, textTransform: "none", fontSize: 10, fontWeight: 400 }}>— client meeting, team activity, big win</span></label>
                  <PhotoDropZone photo={form.photo} onPhoto={(src) => setForm({ ...form, photo: src })} onRemove={() => setForm({ ...form, photo: null })} />
                </div>

                <button className="hype-btn" onClick={submit}>SEND THE HYPE →</button>
              </div>
            )}
          </div>
        )}

        {/* ── WRAPPED ── */}
        {view === "wrapped" && (
          <div style={{ animation: "slide-up 0.35s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div className="bebas" style={{ fontSize: "clamp(46px,10vw,86px)", lineHeight: 0.9, letterSpacing: "0.04em" }}>
                <span style={{ color: C.text }}>HYPE </span>
                <span style={{ WebkitTextStroke: `2px ${C.blue}`, WebkitTextFillColor: "transparent" }}>WRAPPED</span>
              </div>
              <p style={{ color: C.muted, marginTop: 12, fontSize: 14, fontStyle: "italic" }}>Your team's greatest hits, all time</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 14 }}>
              {WRAPPED_STATS.map((s, i) => (
                <div key={s.label} className="wrapped-stat" style={{ animation: `slide-up 0.4s ease ${i * 0.08}s both`, borderColor: `${s.color}30` }}>
                  <div style={{ position: "absolute", top: -10, right: -10, fontSize: 68, opacity: 0.055, animation: `rotate-slow ${20 + i * 5}s linear infinite` }}>{s.emoji}</div>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{s.emoji}</div>
                  <div className="bebas" style={{ fontSize: "clamp(28px,6vw,48px)", color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {recs.filter(r => r.photo).length > 0 && (
              <div style={{ background: C.card, borderRadius: 18, padding: 26, border: `1px solid ${C.border}`, marginBottom: 14 }}>
                <div className="bebas" style={{ fontSize: 22, marginBottom: 16, letterSpacing: "0.06em" }}>📸 MOMENTS CAPTURED</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                  {recs.filter(r => r.photo && r.photo !== "PLACEHOLDER_TEAM").map(r => (
                    <div key={r.id} style={{ borderRadius: 10, overflow: "hidden", position: "relative" }}>
                      <img src={r.photo} alt="" style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "5px 8px", background: "linear-gradient(transparent,rgba(0,0,0,0.7))", fontSize: 10, color: "rgba(255,255,255,0.8)" }}>{r.from} → {r.to}</div>
                    </div>
                  ))}
                  {recs.filter(r => r.photo === "PLACEHOLDER_TEAM").map(r => (
                    <div key={r.id} style={{ borderRadius: 10, overflow: "hidden", background: `linear-gradient(135deg, ${C.blue}30, ${C.purple}20)`, height: 120, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 26 }}>🏔️</span>
                      <span style={{ fontSize: 10, color: C.blue, fontWeight: 600 }}>Team Offsite</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: C.card, borderRadius: 18, padding: 26, border: `1px solid ${C.border}`, marginBottom: 14 }}>
              <div className="bebas" style={{ fontSize: 22, marginBottom: 20, letterSpacing: "0.06em" }}>🏆 MOST HYPED</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {TOP_PEOPLE.map((p, i) => (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="bebas" style={{ fontSize: 30, color: i===0?C.blue:i===1?C.mutedLight:C.muted, width: 32 }}>{i+1}</div>
                    <div style={{ fontSize: 20, animation: `float ${4+i}s ease infinite` }}>{p.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                      <div style={{ color: C.muted, fontSize: 12 }}>{p.title}</div>
                    </div>
                    <div style={{ textAlign: "right", marginRight: 10 }}>
                      <div className="bebas" style={{ fontSize: 26, color: C.blue }}>{p.count}</div>
                      <div style={{ color: C.muted, fontSize: 11 }}>shoutouts</div>
                    </div>
                    <div style={{ width: 76, height: 4, background: C.border, borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
                      <div style={{ height: "100%", width: `${(p.count/31)*100}%`, background: `linear-gradient(90deg,${C.blue},${C.blueBright})`, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: C.card, borderRadius: 18, padding: 26, border: `1px solid ${C.border}` }}>
              <div className="bebas" style={{ fontSize: 22, marginBottom: 14, letterSpacing: "0.06em" }}>🎯 RECOGNITION CATEGORIES</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
                {CATEGORIES.map((cat, i) => {
                  const count = recs.filter(r => r.category === cat).length;
                  return (
                    <div key={cat} style={{ padding: "7px 15px", borderRadius: 8, background: i===0?`${C.blue}20`:C.surface, border: `1px solid ${i===0?C.blue:C.border}`, color: i===0?C.blue:C.mutedLight, fontSize: [16,14,13,12,12,11][i]||11, fontWeight: i===0?700:400 }}>
                      {cat} {count>0&&<span style={{opacity:0.5}}>({count})</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div style={{ height: 64 }} />
      </div>
    </div>
  );
}
