import React, { useState, useEffect } from 'react'
import './App.css'
import { Octokit, App } from "octokit";

const token = import.meta.env.VITE_GITHUB_ACCESS_TOKEN;
console.log(import.meta.env.VITE_GITHUB_ACCESS_TOKEN)

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
    icon: "🛞",
    url: 'https://taxi.orpheusairlines.xyz/',
  },
  "holding-short": {
    marker: ".holding-short",
    title: "Holding Short",
    zone: "RWY HOLD",
    desc: "Projects awaiting to be deployed",
    badgeClass: "badge-holding",
    badgeText: "HOLD SHORT",
    icon: "⏸",
    url: 'https://holding-short.orpheusairlines.xyz/'
  },
  airborne: {
    marker: ".airborne",
    title: "Airborne",
    zone: "EN ROUTE",
    desc: "Shipped projects",
    badgeClass: "badge-airborne",
    badgeText: "AIRBORNE",
    icon: "✈",
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
  taxi: {cls: 'badge-taxi', text: 'TAXIING', icon: '🛞'},
  'holding-short': {cls: 'badge-holding', text: 'HOLD-SHORT', icon: '⏸'},
  airborne: {cls: 'badge-airborne', text: 'AIRBORNE', icon: '✈'},
}

function Card({repo, cfg}) {
  const tags = [repo.language, ...(repo.topics || [])].filter(Boolean).slice(0, 4);
  const updated = new Date(repo.updated_at).toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric",});
  const badge = repo._status ? STATUS_BADGE[repo._status] : {cls: cfg.badgeClass, text: cfg.badgeText, icon: cfg.icon};
  return (
    <div className="card">
      <div className="card-head">
        <span className="card-icon">{badge.icon}</span>
        <span className={`badge ${badge.cls}`}>{badge.text}</span>
      </div>
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
          <button className="side-bar" onClick={() => setMenuOpen(m => !m)}>☰</button>
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
