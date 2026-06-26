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
    badgeText: "TAXIING",
    badgeClass: "badge-taxi",
    icon: "🛞",
  },
  "holding-short": {
    marker: ".holding-short",
    title: "Holding Short",
    zone: "RWY HOLD",
    desc: "Projects awaiting to be deployed",
    badgeClass: "badge-holding",
    badgeText: "HOLD SHORT",
    icon: "⏸",
  },
  airborne: {
    marker: ".airborne",
    title: "Airborne",
    zone: "EN ROUTE",
    desc: "Shipped projects",
    badgeClass: "badge-airborne",
    badgeText: "AIRBORNE",
    icon: "✈",
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

async function fetchRepos(marker) {
  const res = await fetch (`https://api.github.com/users/s-ajay-2010/repos?per_page=100&sort=updated`, {headers: {Authorization: `Bearer ${token}`}});
  if (!res.ok) throw new Error("GitHub API error");
  const repos = await res.json();
  const results = await Promise.all(repos.map(async (r) => ((await checkFile(r.name, marker)) ? r : null)));
  return results.filter(Boolean);
}

function Card({repo, cfg}) {
  const tags = [repo.language, ...(repo.topics || [])].filter(Boolean).slice(0, 4);
  const updated = new Date(repo.updated_at).toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric",});
  return (
    <div
     className="card"
     href={repo.homepage || repo.html_url}
     target="_blank"
     rel="noopener noreferrer"
    >
      <div className="card-head">
        <span className="card-icon">{cfg.icon}</span>
        <span className={`badge ${cfg.badgeClass}`}>{cfg.badgeText}</span>
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

function Nav({cfg, menuOpen, setMenuOpen}) {
  return (
    <nav className="navbar">
      <div className="nav-left" style={{position: "relative"}}>
        <button className="side-bar" onClick={(e) => {e.stopPropagation(); setMenuOpen(!menuOpen); }}>☰</button>
        {menuOpen && (
          <div className="dropdown" onClick={(e) => e.stopPropagation()}>
            {Object.entries(ZONES).map(([key, z]) => (
              <a key={key} href={`https://${key}.orpheusairlines.xyz`}>{z.icon} {z.title}</a>
            ))}
          </div>
        )}
      </div>
      <div className="nav-title">
        ORPHEUS AIRLINES<br/>
        <span>{cfg.title.toUpperCase()} · {cfg.zone}</span>
      </div>
      <div className="nav-right">
        <a href={`https://github.com/s-ajay-2010`} target="_blank" rel="noopener noreferrer">github ↗</a>
      </div>
    </nav>
  );
}

export default function SubdomainPage() {
  const host = window.location.hostname;
  const zonekey = Object.keys(ZONES).find((k) => host.includes(k)) || "holding-short";
  const cfg = ZONES[zonekey];

  const [repos, setRepos] = useState([]);
  const [loading, setLoading]= useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    document.title = `Orpheus Airlines — ${cfg.title}`;
    fetchRepos(cfg.marker).then(setRepos).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata", hour12: true})+" IST");
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    document.addEventListener("click", close);
  }, []);

  return (
    <div onClick={() => setMenuOpen(false)}>
      <Nav cfg={cfg} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <div className="status-bar">
          <span className="dot"/>
          <span>FIDS</span>
          <span className="sep">|</span>
          <span>{time}</span>
          <span className="sep">|</span>
          <span className="zone-label">{cfg.title.toUpperCase()}</span>
          <span className="sep">|</span>
          <span>{loading ? "-- PROJECTS" : repos.length>1 ? `${repos.length} PROJECTS` : `${repos.length} PROJECT`}</span>
        </div>
        <main>
          <div className="fids-row">
            {[["zone", cfg.zone], ["projects", loading ? "--" : repos.length],
              ["status", loading ? "fetching" : error ? "error" : "live"],
              ["source", "github"], ["marker", cfg.marker]].map(([label, val]) => (
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
              NO FLIGHTS IN THIS ZONE<br/>
              <small>Add {cfg.marker} to a repo root to list here</small>
            </div>
          )}
          {!loading && !error && repos.length > 0 && (
            <div className="grid">
              {repos.map((r) => <Card key={r.id} repo={r} cfg={cfg}/>)}
            </div>
          )}
        </main>

        <footer>
          ORPHEUS AIRLINES · {new Date().getFullYear()} · BUILT BY AJAY · ALL RUNWAYS CLEAR
        </footer>
    </div>
  );
}