import React, { useState, useEffect } from 'react'
import './App.css'
import { Octokit, App } from "octokit";

const token = import.meta.env.VITE_GITHUB_ACCESS_TOKEN;

//desc = description,
//don't get confused like my friend who got confused when I opened it lol

const ZONES = {
  all: {
    title: "All",
    zone: "ALL",
    desc: "All projects",
    url: "https://orpheusairlines.xyz/",
    icon: "📡",
  },
  taxi: {
    marker: ".taxi",
    title: "Taxiing",
    zone: "GND",
    desc: "Projects in active development",
    badgeClass: "badge-taxi",
    badgeText: "TAXIING",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="19px" height="24px" fill="#9a3100" viewBox="0 0 256 256"><path d="M208,96H147.32L101.66,50.34A8,8,0,0,0,96,48H88A16,16,0,0,0,72.83,69.06l9,26.94H59.32L37.66,74.34A8,8,0,0,0,32,72H24A16,16,0,0,0,8.69,92.6l14.07,46.89A39.75,39.75,0,0,0,61.07,168H240a8,8,0,0,0,8-8V136A40,40,0,0,0,208,96Zm24,56H61.07a23.85,23.85,0,0,1-23-17.1L24,88h4.68l21.66,21.66A8,8,0,0,0,56,112h36.9a8,8,0,0,0,7.59-10.53L88,64h4.68l45.66,45.66A8,8,0,0,0,144,112h64a24,24,0,0,1,24,24Zm-8,48a16,16,0,1,1-16-16A16,16,0,0,1,224,200Zm-96,0a16,16,0,1,1-16-16A16,16,0,0,1,128,200Z"></path></svg>,
    url: 'https://taxi.orpheusairlines.xyz/',
  },
  "holding-short": {
    marker: ".holding-short",
    title: "Holding Short",
    zone: "RWY HOLD",
    desc: "Projects awaiting to be deployed",
    badgeClass: "badge-holding",
    badgeText: "HOLD SHORT",
    icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="19px" fill="#9a3100"><path d="M520-200v-560h240v560H520Zm-320 0v-560h240v560H200Zm400-80h80v-400h-80v400Zm-320 0h80v-400h-80v400Zm0-400v400-400Zm320 0v400-400Z"/></svg>,
    url: 'https://holding-short.orpheusairlines.xyz/'
  },
  airborne: {
    marker: ".airborne",
    title: "Airborne",
    zone: "EN ROUTE",
    desc: "Shipped projects",
    badgeClass: "badge-airborne",
    badgeText: "AIRBORNE",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plane-icon lucide-plane"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>,
    url: 'https://airborne.orpheusairlines.xyz/',
  },
};

async function checkFile(repo, filename) {
  try {
    const response = await fetch(`https://api.github.com/repos/s-ajay-2010/${repo}/contents/${filename}`, {headers: {Authorization: `Bearer ${token}`}});
    return response.status === 200;
  }
  catch {
    return false;
  }
}

const ALL = ['.taxi', '.holding-short', '.airborne']

async function fetchRepos(marker) {
  const res = await fetch (`https://api.github.com/users/s-ajay-2010/repos?per_page=100&sort=updated`, {headers: {Authorization: `Bearer ${token}`}});
  if (!res.ok) throw new Error("GitHub API error");
  const repos = await res.json();

  if (!marker) {
    const results = await Promise.all(repos.map(async(r) => {
      const [isTaxi, isHold, isAirborne] = await Promise.all(ALL.map(m => checkFile(r.name, m)));
      if (!isTaxi && !isHold && !isAirborne) return null;
      return {
        ...r,
        _status: isAirborne ? 'airborne' : isHold ? 'holding-short' : 'taxi',
      };
    }));
    return results.filter(Boolean);
  }

  const results = await Promise.all(repos.map(async (r) => ((await checkFile(r.name, marker)) ? r : null)));
  return results.filter(Boolean);
}

const STATUS_BADGE = {
  taxi: {cls: 'badge-taxi', text: 'TAXIING', icon: <svg xmlns="http://www.w3.org/2000/svg" width="50%" height="50%" fill="#ffffff" viewBox="0 0 256 256"><path d="M208,96H147.32L101.66,50.34A8,8,0,0,0,96,48H88A16,16,0,0,0,72.83,69.06l9,26.94H59.32L37.66,74.34A8,8,0,0,0,32,72H24A16,16,0,0,0,8.69,92.6l14.07,46.89A39.75,39.75,0,0,0,61.07,168H240a8,8,0,0,0,8-8V136A40,40,0,0,0,208,96Zm24,56H61.07a23.85,23.85,0,0,1-23-17.1L24,88h4.68l21.66,21.66A8,8,0,0,0,56,112h36.9a8,8,0,0,0,7.59-10.53L88,64h4.68l45.66,45.66A8,8,0,0,0,144,112h64a24,24,0,0,1,24,24Zm-8,48a16,16,0,1,1-16-16A16,16,0,0,1,224,200Zm-96,0a16,16,0,1,1-16-16A16,16,0,0,1,128,200Z"></path></svg>},
  'holding-short': {cls: 'badge-holding', text: 'HOLD-SHORT', icon: <svg xmlns="http://www.w3.org/2000/svg" height="50%" viewBox="0 -960 960 960" width="50%" fill="#e3e3e3"><path d="M520-200v-560h240v560H520Zm-320 0v-560h240v560H200Zm400-80h80v-400h-80v400Zm-320 0h80v-400h-80v400Zm0-400v400-400Zm320 0v400-400Z"/></svg>},
  airborne: {cls: 'badge-airborne', text: 'AIRBORNE', icon: <svg xmlns="http://www.w3.org/2000/svg" width="50%" height="50%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plane-icon lucide-plane"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>},
}

function Card({repo, cfg}) {
  const tags = [repo.language, ...(repo.topics || [])].filter(Boolean).slice(0, 4);
  const updated = new Date(repo.updated_at).toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric",});
  const badge = repo._status ? STATUS_BADGE[repo._status] : {cls: cfg.badgeClass, text: cfg.badgeText, icon: cfg.icon};
  return (
    <div className="card">
      <div className="card-wrap">
      <div className="card-title">{repo.name}</div>
      <div className="card-desc">{repo.description || "No flight plan filed."}</div>
      <div className="card-meta">
        {tags.map ((t) => <span className="tag" key={t}>{t}</span>)}
        <span className="tag">⭐ {repo.stargazers_count}</span>
        <span className="tag">Last Updated at: {updated}</span>
      </div>
      <div className="card-links">
        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>repo ↗</a>
        {repo.homepage && (
          <a href={repo.homepage} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>live ↗</a>
        )}
      </div>
      </div>
      <span className={`badge ${badge.cls}`}>{badge.text}</span>
      <div className="card-status">
        <span className="card-icon">{badge.icon}</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [activeZone, setActiveZone] = useState('all');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [time, setTime] = useState('');
  const cfg = ZONES[activeZone];

  useEffect(() => {
      const tick = () => setTime(new Date().toLocaleDateString('en-US', {timeZone: 'Asia/Kolkata', hour12: true}) + ' IST')
      tick()
      const id = setInterval(tick, 1000)
      return () => clearInterval(id)
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    setRepos([])
    fetchRepos(cfg.marker).then(setRepos).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [activeZone])

  useEffect(() => {
    const close = () => setMenuOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  return (
    <div onClick={() => setMenuOpen(false)}>
      <nav className="navbar">
        <div style={{position: 'relative'}} onClick={e => e.stopPropagation()}>
          <button className="side-bar" onClick={() => setMenuOpen(m => !m)}><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 770" width="24px" fill="#e3e3e3"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg></button>
          {menuOpen && (
            <div className="dropdown">
              {Object.entries(ZONES).map(([key, z]) => (
                <a key={key} href={z.url} rel="noopener noreferrer">
                  {z.icon} {z.title}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="nav-right">
          ORPHEUS AIRLINES
          <span> · {cfg.title.toUpperCase()} · {cfg.zone}</span>
          </div>
          <div className="nav-right">
            <a href={`https://github.com/s-ajay-2010`} target="_blank" rel="noopener noreferrer">github ↗</a>
          </div>
      </nav>

      <div className="status-bar">
        <span className="dot"/>
        <span>FIDS</span>
        <span className="sep">|</span>
        <span>{time}</span>
        <span className="sep">|</span>
        <span className="zone-label">{cfg.title.toUpperCase()}</span>
        <span className="sep">|</span>
        <span>{loading ? '-- PROJECTS' : `${repos.length} PROJECT ${repos.length !== 1 ? 'S' : ''}`}</span>
      </div>

      <div className="zone-tabs">
        {Object.entries(ZONES).map(([key, z]) => (
          <button key={key} className={`zone-tab ${activeZone === key ? 'active' : ''}`} onClick={(e) => {e.stopPropagation(); setActiveZone(key)}}>
            <span className="zt-icon">{z.icon}</span>
            <span className="zt-name">{z.title}</span>
            <span className="zt-desc">{z.desc}</span>
          </button>
        ))}
      </div>

      <main>
        <div className="fids-row">
          {[
            ['zone', cfg.zone],
            ['projects', loading ? '--' : repos.length],
            ['status', loading ? 'fetching' : error ? 'error' : 'live'],
            ['source', 'github'],
            ['marker', cfg.marker || 'all'],
          ].map(([label, val]) => (
            <div className="fids-cell" key={label}>
              <span className="fids-label">{label}</span>
              <span className="fids-val">{val}</span>
            </div>
          ))}
        </div>

        <div className="page-header">
          <h1>{cfg.title}</h1>
          <p>{cfg.desc}</p>
        </div>
        
        {loading && <div className="state-msg">Fetching flight data from tower...</div>}
        {error && <div className="state-msg error">TOWER UNREACHABLE — {error}</div>}
        {!loading && !error && repos.length === 0 && (
          <div className="state-msg error">
            NO FLIGHTS IN THIS ZONE
            <small>{cfg.marker ? `Add ${cfg.marker} to a repo root to list it here:)` : "No projects found in any zone, sorry my friend but if you're seeing this, then I think I'm cooked:("}</small>
          </div>
        )}
        {!loading && !error && repos.length > 0 && (
          <div className="grid">
            {repos.map((r) => <Card key={r.id} repo={r} cfg={cfg}/>)}
          </div>
        )}
      </main>


      <footer>
        ORPHEUS AIRLINES · {new Date().getFullYear()} · BUILT BY AJAY · ALL RUNWAYS
      </footer>
    </div>
  )
}
