G.music = (() => {
  let el = null, src = null, an = null, gain = null, data = null, mode = "none", beatT = null, beatStep = 0, pulse = 0, vol = Save.d.vol ?? 0.8, synthGain = null, styleKey = "house";
  const YOUTUBE_API_KEY = "";
  const yt = { p: null, on: false, loading: false, q: [], title: "" };
  const list = [];
  let idx = -1;
  const ui = { file: $("musicFile"), tog: $("musicToggle"), vol: $("musicVol"), st: $("musicStatus"), prev: $("musicPrev"), next: $("musicNext"), q: $("musicQueue"), chip: $("btnMusic") };
  ui.vol.value = vol;
  const STY = {
    house: { name: "House", bpm: 122, kick: (i) => i % 4 === 0, hat: (i) => i % 4 === 2, clap: (i) => i === 4 || i === 12, bass: { 0: 55, 3: 55, 6: 65.4, 8: 49, 11: 55, 14: 73.4 }, lead: [220, 261.6, 329.6, 293.7], every: 8, wave: "triangle" },
    funk: { name: "Funk", bpm: 104, kick: (i) => [0, 5, 8, 11].includes(i), hat: (i) => i % 2 === 0, clap: (i) => i === 4 || i === 12, bass: { 0: 65.4, 2: 65.4, 5: 73.4, 8: 49, 10: 55, 13: 61.7 }, lead: [392, 329.6, 293.7, 261.6], every: 4, wave: "square" },
    chill: { name: "Chill", bpm: 80, kick: (i) => i === 0 || i === 10, hat: (i) => i % 4 === 2, clap: (i) => i === 8, bass: { 0: 49, 6: 55, 12: 41.2 }, lead: [261.6, 329.6, 392, 329.6], every: 8, wave: "sine" }
  };
  function ensureGraph() {
    const a = getAC();
    if (!a) return false;
    if (!an) {
      an = a.createAnalyser();
      an.fftSize = 256;
      data = new Uint8Array(an.frequencyBinCount);
      gain = a.createGain();
      gain.gain.value = vol;
      an.connect(gain);
      gain.connect(a.destination);
    }
    return true;
  }
  const playing = () => mode === "file" ? !!(el && !el.paused) : mode === "beat" ? !!beatT : mode === "yt" ? yt.on : false;
  const cur = () => list[idx] || null;
  function status(t) {
    ui.st.textContent = t;
  }
  function paint() {
    ui.tog.disabled = mode === "none";
    ui.tog.textContent = playing() ? "Pause" : "Play";
    ui.chip.classList.toggle("on", playing());
    ui.chip.querySelector(".mi").textContent = playing() ? "\u266A" : "\u266A";
    ui.prev.disabled = ui.next.disabled = list.length < 2;
    document.querySelectorAll(".mstyle").forEach((b) => b.setAttribute("aria-pressed", String(mode === "beat" && b.dataset.s === styleKey)));
    ui.q.innerHTML = list.map((t, i) => `<button type="button" class="qi${i === idx ? " on" : ""}" data-i="${i}">${i === idx && playing() ? "\u266A " : ""}${escapeHTML(t.name)}</button>`).join("");
  }
  function setMode(m) {
    mode = m;
    paint();
  }
  function addFiles(files) {
    if (!files || !files.length || !ensureGraph()) {
      if (files && files.length) status("Audio is not available in this browser.");
      return;
    }
    const first = list.length;
    for (const f of files) {
      if (!/^audio\//.test(f.type) && !/\.(mp3|m4a|wav|ogg|aac|flac|opus)$/i.test(f.name)) continue;
      list.push({ name: f.name.replace(/\.[a-z0-9]+$/i, "").slice(0, 48), url: URL.createObjectURL(f), size: f.size, dur: 0 });
    }
    if (list.length === first) {
      status("Pick an audio file, like an mp3, m4a or wav.");
      return;
    }
    loadTrack(first, true);
  }
  function loadTrack(i, auto) {
    if (!list.length) return;
    idx = (i % list.length + list.length) % list.length;
    const t = cur();
    stopBeat();
    ytStop();
    if (el) {
      el.pause();
      el.onended = null;
    }
    el = new Audio();
    el.src = t.url;
    el.crossOrigin = "anonymous";
    el.loop = list.length < 2;
    try {
      if (src) src.disconnect();
      src = getAC().createMediaElementSource(el);
      src.connect(an);
    } catch (e) {
    }
    el.addEventListener("loadedmetadata", () => {
      t.dur = el.duration || 0;
    });
    el.addEventListener("error", () => status("That file could not be played. Try an mp3, m4a or wav."));
    el.onended = () => {
      if (list.length > 1) loadTrack(idx + 1, true);
    };
    mode = "file";
    status("Loaded: " + t.name);
    paint();
    if (auto) play();
  }
  function play() {
    if (!ensureGraph()) return;
    getAC();
    if (mode === "yt" && yt.p) {
      yt.p.playVideo();
      return;
    }
    if (mode === "file" && el) {
      el.play().then(() => {
        status("Playing: " + cur().name);
        toast("Music on!");
        paint();
      }).catch(() => status("Tap Play again to start the music."));
    } else startBeat(styleKey);
    paint();
  }
  function pause() {
    if (mode === "file" && el) el.pause();
    if (mode === "yt" && yt.p) yt.p.pauseVideo();
    stopBeat();
    status("Paused.");
    paint();
  }
  function stopAll() {
    stopBeat();
    ytStop();
    if (el) el.pause();
  }
  function startBeat(k) {
    const a = getAC();
    if (!a || !ensureGraph()) return;
    if (beatT) {
      clearInterval(beatT);
      beatT = null;
    }
    ytStop();
    if (el) el.pause();
    styleKey = k || styleKey;
    const sty = STY[styleKey];
    if (!synthGain) {
      synthGain = a.createGain();
      synthGain.gain.value = 0.9;
      synthGain.connect(an);
    }
    beatStep = 0;
    const step = 60 / sty.bpm / 4;
    let next = a.currentTime + 0.05;
    beatT = setInterval(() => {
      while (next < a.currentTime + 0.25) {
        const i = beatStep % 16;
        if (sty.kick(i)) synth(next, "kick");
        if (sty.hat(i)) synth(next, "hat");
        if (sty.clap(i)) synth(next, "clap");
        if (sty.bass[i]) synth(next, "bass", sty.bass[i], sty.wave);
        if (beatStep % sty.every === 0) synth(next, "lead", sty.lead[Math.floor(beatStep / sty.every) % sty.lead.length]);
        next += step;
        beatStep++;
      }
    }, 60);
    mode = "beat";
    status("Playing the " + sty.name.toLowerCase() + " beat. Add your own songs any time.");
    paint();
  }
  function stopBeat() {
    if (beatT) {
      clearInterval(beatT);
      beatT = null;
    }
  }
  function synth(t, kind, f, wave) {
    const a = getAC();
    const o = a.createOscillator(), g = a.createGain();
    o.connect(g);
    g.connect(synthGain);
    if (kind === "kick") {
      o.type = "sine";
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.14);
      g.gain.setValueAtTime(0.9, t);
      g.gain.exponentialRampToValueAtTime(1e-3, t + 0.22);
      o.start(t);
      o.stop(t + 0.25);
      pulse = 1;
    } else if (kind === "hat") {
      o.type = "square";
      o.frequency.value = 7e3;
      g.gain.setValueAtTime(0.05, t);
      g.gain.exponentialRampToValueAtTime(1e-3, t + 0.04);
      o.start(t);
      o.stop(t + 0.05);
    } else if (kind === "clap") {
      o.type = "sawtooth";
      o.frequency.value = 1200;
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(1e-3, t + 0.1);
      o.start(t);
      o.stop(t + 0.12);
    } else if (kind === "bass") {
      o.type = wave || "triangle";
      o.frequency.value = f;
      g.gain.setValueAtTime(wave === "square" ? 0.22 : 0.5, t);
      g.gain.exponentialRampToValueAtTime(1e-3, t + 0.2);
      o.start(t);
      o.stop(t + 0.22);
    } else {
      o.type = "sine";
      o.frequency.value = f * 2;
      g.gain.setValueAtTime(1e-3, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.05);
      g.gain.exponentialRampToValueAtTime(1e-3, t + 0.5);
      o.start(t);
      o.stop(t + 0.55);
    }
  }
  function ytStop() {
    if (yt.p && yt.on) {
      try {
        yt.p.pauseVideo();
      } catch (e) {
      }
    }
  }
  function ytLoad(cb) {
    if (window.YT && window.YT.Player) {
      cb();
      return;
    }
    yt.q.push(cb);
    if (yt.loading) return;
    yt.loading = true;
    window.onYouTubeIframeAPIReady = () => {
      yt.q.splice(0).forEach((f) => f());
    };
    const sc = document.createElement("script");
    sc.src = "https://www.youtube.com/iframe_api";
    sc.onerror = () => {
      yt.loading = false;
      yt.q.length = 0;
      status("YouTube could not load. Check your connection and try again.");
    };
    document.head.appendChild(sc);
  }
  const ytId = (v) => {
    v = v.trim();
    const m = v.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/|live\/)([\w-]{11})/);
    if (m) return m[1];
    return /^[\w-]{11}$/.test(v) ? v : null;
  };
  function ytPlay(id, title) {
    getAC();
    stopBeat();
    if (el) el.pause();
    mode = "yt";
    yt.on = false;
    yt.title = title || "";
    status("Loading from YouTube\u2026");
    paint();
    ytLoad(() => {
      if (yt.p) {
        yt.p.loadVideoById(id);
        yt.p.setVolume(vol * 100);
        return;
      }
      const vars = { autoplay: 1, playsinline: 1, controls: 0, rel: 0, disablekb: 1 };
      if (/^https?:$/.test(location.protocol)) vars.origin = location.origin;
      yt.p = new YT.Player("ytHost", { width: "200", height: "200", videoId: id, playerVars: vars, events: {
        onReady: (e) => {
          e.target.setVolume(vol * 100);
          e.target.playVideo();
        },
        onStateChange: (e) => {
          yt.on = e.data === 1;
          if (e.data === 1) {
            const d = e.target.getVideoData();
            if (d && d.title) yt.title = d.title;
            status("Playing: " + (yt.title || "YouTube"));
            toast("Music on!");
          } else if (e.data === 0) {
            e.target.seekTo(0);
            e.target.playVideo();
          }
          paint();
        },
        onError: () => {
          yt.on = false;
          status("That video can not be played here. Try a different one.");
          paint();
        }
      } });
    });
  }
  const decode = (t) => {
    const a = document.createElement("textarea");
    a.innerHTML = t;
    return a.value;
  };
  async function ytSearch(q) {
    const res = $("ytRes");
    res.innerHTML = "";
    status("Searching\u2026");
    try {
      const r = await fetch("https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddableOnly=true&maxResults=6&q=" + encodeURIComponent(q) + "&key=" + YOUTUBE_API_KEY);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error && j.error.message || "Search failed");
      const items = (j.items || []).filter((i) => i.id && i.id.videoId);
      res.innerHTML = items.map((i) => `<button type="button" class="qi" data-id="${i.id.videoId}" data-t="${escapeHTML(decode(i.snippet.title))}">${escapeHTML(decode(i.snippet.title))}</button>`).join("");
      status(items.length ? "Pick a song to play it." : "No songs found. Try different words.");
    } catch (e) {
      status("Search did not work. Check your YouTube key, or paste a link instead.");
    }
  }
  function ytGo() {
    const v = $("ytq").value.trim();
    if (!v) return;
    const id = ytId(v);
    if (id) {
      $("ytRes").innerHTML = "";
      ytPlay(id);
      return;
    }
    if (YOUTUBE_API_KEY) {
      ytSearch(v);
      return;
    }
    status("Paste a link from YouTube. Searching by name needs a YouTube key, see the top of the music code.");
  }
  $("ytGo").addEventListener("click", ytGo);
  $("ytq").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      ytGo();
    }
  });
  $("ytq").addEventListener("input", () => {
    $("ytOpen").href = "https://www.youtube.com/results?search_query=" + encodeURIComponent($("ytq").value.trim());
  });
  $("ytRes").addEventListener("click", (e) => {
    const b = e.target.closest("[data-id]");
    if (b) {
      $("ytRes").innerHTML = "";
      ytPlay(b.dataset.id, b.dataset.t);
    }
  });
  ui.file.addEventListener("change", (e) => {
    addFiles([...e.target.files || []]);
    e.target.value = "";
  });
  ui.tog.addEventListener("click", () => {
    playing() ? pause() : play();
  });
  ui.prev.addEventListener("click", () => {
    loadTrack(idx - 1, true);
  });
  ui.next.addEventListener("click", () => {
    loadTrack(idx + 1, true);
  });
  ui.q.addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]");
    if (b) loadTrack(+b.dataset.i, true);
  });
  document.querySelectorAll(".mstyle").forEach((b) => b.addEventListener("click", () => {
    getAC();
    startBeat(b.dataset.s);
    setMode("beat");
  }));
  ui.vol.addEventListener("input", () => {
    vol = +ui.vol.value;
    Save.d.vol = vol;
    Save.put();
    if (gain) gain.gain.value = vol;
    if (yt.p && yt.p.setVolume) yt.p.setVolume(vol * 100);
  });
  paint();
  return {
    pulse() {
      if (an && data && mode === "file" && playing()) {
        an.getByteFrequencyData(data);
        let s = 0;
        for (let i = 1; i < 10; i++) s += data[i];
        return clamp(s / 10 / 255 * 1.3, 0, 1);
      }
      pulse *= 0.9;
      return mode === "beat" && playing() ? pulse : 0;
    },
    energy(t) {
      if (mode === "file" && el) {
        if (playing() && an) {
          an.getByteFrequencyData(data);
          const avg = (a, b) => {
            let s = 0;
            for (let i = a; i < b; i++) s += data[i];
            return s / (b - a) / 255;
          };
          return { bass: clamp(avg(1, 5) * 1.25, 0, 1), mid: clamp(avg(5, 24) * 1.4, 0, 1), high: clamp(avg(24, 70) * 2, 0, 1) };
        }
        return { bass: 0.18, mid: 0.15, high: 0.1 };
      }
      if (mode === "beat" && playing()) {
        pulse *= 0.92;
        return { bass: 0.25 + 0.7 * pulse, mid: 0.35 + 0.25 * Math.sin(t * 3), high: 0.3 + 0.3 * Math.sin(t * 7) };
      }
      const ph = t * 2 % 1, k = Math.exp(-ph * 6);
      return { bass: 0.2 + 0.7 * k, mid: 0.35 + 0.25 * Math.sin(t * 3), high: 0.3 + 0.3 * Math.sin(t * 7) };
    },
    playing,
    stop() {
      stopAll();
      paint();
    }
  };
})();
G.openMusic = () => {
  $("music").hidden = false;
};
$("muClose").addEventListener("click", () => {
  $("music").hidden = true;
  $("scene").focus();
});
$("btnMusic").addEventListener("click", () => {
  if (!$("intro").hidden || !$("creator").hidden) return;
  getAC();
  $("music").hidden = false;
});
