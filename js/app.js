/* ---------- SHARED DATE UTILITIES ---------- */
  const TODAY = new Date(2026,6,8); // July 8, 2026 — single source of truth for "today"
  function dateKey(d){ return d.toISOString().slice(0,10); }
  function shortLabel(d){ return d.toLocaleDateString('en-US',{month:'short',day:'numeric'}); }
  const TODAY_KEY = dateKey(TODAY);
  function loadState(key, fallback){
    try{
      const raw = localStorage.getItem('momentum_'+key);
      return raw !== null ? JSON.parse(raw) : fallback;
    }catch(e){ return fallback; }
  }
  function saveState(key, value){
    try{ localStorage.setItem('momentum_'+key, JSON.stringify(value)); }catch(e){}
  }


  /* ---------- STATE ---------- */
  let habits = loadState('habits', [
    {id:1, name:'Morning Run', desc:'Start the day with movement', icon:'🏃', color:'#FFF1CE', freq:'Daily', streak:12, history:[1,1,1,0,1,1,1,1,0,1,1,1,1,1]},
    {id:2, name:'Drink 2L Water', desc:'Stay hydrated all day', icon:'💧', color:'#E4F0FF', freq:'Daily', streak:9, history:[1,1,0,1,1,1,0,1,1,1,1,1,0,1]},
    {id:3, name:'Read 20 Pages', desc:'Grow the mind daily', icon:'📖', color:'#EFE7FF', freq:'Daily', streak:5, history:[0,1,1,1,0,1,1,0,1,1,1,1,1,0]}
  ]);
  let todos = loadState('todos', [
    {id:1, name:'Submit assignment', date:'2026-07-08', time:'14:00', priority:'high', done:false},
    {id:2, name:'Team standup notes', date:'2026-07-08', time:'10:00', priority:'med', done:true},
    {id:3, name:'Review portfolio site', date:'2026-07-10', time:'', priority:'low', done:false}
  ]);
  let nextHabitId = loadState('nextHabitId', 4);
  let nextTodoId = loadState('nextTodoId', 4);

  /* ---------- VIEW SWITCHING ---------- */
  function showView(name){
    window.location.href = name + '.html';
  }

  function setActiveNav(){
    const page = document.body.getAttribute('data-page');
    document.querySelectorAll('.nav-item[data-view]').forEach(n=>{
      n.classList.toggle('active', n.getAttribute('data-view')===page);
    });
  }

  /* ---------- MODALS ---------- */
  function openModal(id){ document.getElementById(id).classList.add('active'); }
  function closeModal(id){ document.getElementById(id).classList.remove('active'); }
  document.querySelectorAll('.modal-overlay').forEach(ov=>{
    ov.addEventListener('click', e=>{ if(e.target===ov) ov.classList.remove('active'); });
  });
  document.querySelectorAll('#h_iconPicker .icon-opt').forEach(opt=>{
    opt.addEventListener('click', ()=>{
      document.querySelectorAll('#h_iconPicker .icon-opt').forEach(o=>o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });
  document.querySelectorAll('#h_colorPicker .color-opt').forEach(opt=>{
    opt.addEventListener('click', ()=>{
      document.querySelectorAll('#h_colorPicker .color-opt').forEach(o=>o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });
  document.querySelectorAll('#t_priority .priority-opt').forEach((opt,i)=>{
    opt.addEventListener('click', ()=>{
      document.querySelectorAll('#t_priority .priority-opt').forEach(o=>o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  /* ---------- HABITS ---------- */
  function addHabit(){
    const name = document.getElementById('h_name').value.trim();
    if(!name){ alert('Give your habit a name first.'); return; }
    const icon = document.querySelector('#h_iconPicker .selected').textContent;
    const color = document.querySelector('#h_colorPicker .selected').dataset.c;
    const freq = document.getElementById('h_freq').value;
    const desc = document.getElementById('h_desc').value.trim();
    habits.push({id:nextHabitId++, name, desc, icon, color, freq, streak:0, history:[0,0,0,0,0,0,0,0,0,0,0,0,0,0]});
    saveState('habits', habits); saveState('nextHabitId', nextHabitId);
    closeModal('habitModal');
    document.getElementById('h_name').value=''; document.getElementById('h_desc').value='';
    renderHabits();
    renderDashboard();
  }
  function deleteHabit(id){ habits = habits.filter(h=>h.id!==id); saveState('habits', habits); renderHabits(); renderDashboard(); }
  function toggleHabitToday(id){
    const h = habits.find(h=>h.id===id);
    const last = h.history[h.history.length-1];
    h.history[h.history.length-1] = last ? 0 : 1;
    h.streak = last ? Math.max(0,h.streak-1) : h.streak+1;
    saveState('habits', habits);
    renderHabits();
    renderDashboard();
  }
  function renderHabits(){
    const grid = document.getElementById('habitsGrid');
    if(!grid) return;
    grid.innerHTML = habits.map(h=>{
      const oldest = new Date(TODAY); oldest.setDate(oldest.getDate() - (h.history.length-1));
      const rangeLabel = `${shortLabel(oldest)} – ${shortLabel(TODAY)}`;
      return `
      <div class="habit-card">
        <div class="habit-card-top">
          <div class="habit-card-icon" style="background:${h.color}">${h.icon}</div>
          <div>
            <div class="habit-card-name">${h.name}</div>
            <div class="habit-card-freq">${h.freq}</div>
          </div>
          <span class="habit-card-del" onclick="deleteHabit(${h.id})">&times;</span>
        </div>
        <div class="heatmap-range">${rangeLabel}</div>
        <div class="heatmap-strip">
          ${h.history.map((v,i)=>{
            const d = new Date(TODAY); d.setDate(d.getDate() - (h.history.length-1-i));
            return `<div class="sq ${v?'done':''}" title="${shortLabel(d)}${v?' · done':' · missed'}">${d.getDate()}</div>`;
          }).join('')}
        </div>
        <div class="habit-card-bottom">
          <span class="streak-chip"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>${h.streak}</span>
          <div class="habit-check ${h.history[h.history.length-1]?'done':''}" onclick="toggleHabitToday(${h.id})">
            ${h.history[h.history.length-1] ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>' : ''}
          </div>
        </div>
      </div>
    `;
    }).join('') || '<p class="empty-note">No habits yet — add your first one.</p>';
  }

  /* ---------- TODOS ---------- */
  function addTodo(){
    const name = document.getElementById('t_name').value.trim();
    if(!name){ alert('Give your task a name first.'); return; }
    const date = document.getElementById('t_date').value || TODAY_KEY;
    const time = document.getElementById('t_time').value;
    const priority = document.querySelector('#t_priority .selected').classList.contains('low') ? 'low'
                    : document.querySelector('#t_priority .selected').classList.contains('high') ? 'high' : 'med';
    todos.push({id:nextTodoId++, name, date, time, priority, done:false});
    saveState('todos', todos); saveState('nextTodoId', nextTodoId);
    closeModal('todoModal');
    document.getElementById('t_name').value='';
    renderTodos();
    renderDashboard();
  }
  function deleteTodo(id){ todos = todos.filter(t=>t.id!==id); saveState('todos', todos); renderTodos(); renderDashboard(); }
  function toggleTodo(id){ const t = todos.find(t=>t.id===id); t.done = !t.done; saveState('todos', todos); renderTodos(); renderDashboard(); }
  function todoRow(t){
    return `<div class="todo-item ${t.done?'completed':''}">
      <div class="todo-check ${t.done?'done':''}" onclick="toggleTodo(${t.id})">
        ${t.done ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>' : ''}
      </div>
      <span class="priority-dot ${t.priority}"></span>
      <div class="todo-name">${t.name}</div>
      <div class="todo-meta">${t.date}${t.time?' · '+t.time:''}</div>
      <span class="todo-del" onclick="deleteTodo(${t.id})">&times;</span>
    </div>`;
  }
  function toggleUpcoming(){
    const list = document.getElementById('todosUpcoming');
    const btn = document.getElementById('upcomingToggleBtn');
    const isOpen = list.style.display !== 'none';
    list.style.display = isOpen ? 'none' : 'block';
    btn.textContent = isOpen ? 'Show' : 'Hide';
    btn.classList.toggle('open', !isOpen);
  }

  function renderTodos(){
    if(!document.getElementById('todosToday')) return;
    const todayList = todos.filter(t=>!t.done && t.date===TODAY_KEY);
    const upcoming = todos.filter(t=>!t.done && t.date>TODAY_KEY);
    const doneToday = todos.filter(t=>t.done && t.date===TODAY_KEY);
    const doneAll = todos.filter(t=>t.done);

    document.getElementById('todosToday').innerHTML = todayList.map(todoRow).join('') || '<div class="empty-note">Nothing due today. Enjoy it.</div>';
    document.getElementById('todosDone').innerHTML = doneAll.map(todoRow).join('') || '<div class="empty-note">Completed tasks will show here.</div>';
    document.getElementById('todosUpcoming').innerHTML = upcoming.map(todoRow).join('') || '<div class="empty-note">Nothing scheduled ahead yet — it\'ll move here automatically once you add it.</div>';
    document.getElementById('upcomingCount').textContent = upcoming.length ? `(${upcoming.length})` : '';

    const totalToday = todayList.length + doneToday.length;
    const doneCount = doneToday.length;
    const pct = totalToday ? doneCount/totalToday : 0;
    document.getElementById('tpNum').textContent = `${doneCount} / ${totalToday}`;
    document.getElementById('tpRingFg').setAttribute('stroke-dashoffset', (163.4 * (1-pct)).toFixed(1));
  }

  /* ---------- ANALYTICS ---------- */
  function hashStr(s){ let h=0; for(let i=0;i<s.length;i++){ h = (h*31 + s.charCodeAt(i))|0; } return Math.abs(h); }
  function seededRandom(seed){ const x = Math.sin(seed)*10000; return x - Math.floor(x); }

  function renderGithubHeatmap(){
    const container = document.getElementById('yearHeatmap');
    const monthsToShow = 6;
    let html = '';
    for(let m=monthsToShow-1; m>=0; m--){
      const d = new Date(TODAY.getFullYear(), TODAY.getMonth()-m, 1);
      const year = d.getFullYear(), month = d.getMonth();
      const daysInMonth = new Date(year, month+1, 0).getDate();
      const monthName = d.toLocaleDateString('en-US',{month:'short'});
      const isCurrentMonth = (m===0);
      let daySquares = '';
      for(let day=1; day<=daysInMonth; day++){
        const cellDate = new Date(year,month,day);
        const isFuture = cellDate > TODAY;
        let lvl = 'future';
        if(!isFuture){
          const r = seededRandom(hashStr(`${year}-${month}-${day}`));
          lvl = r>0.7?'lvl3':r>0.45?'lvl2':r>0.25?'lvl1':'';
        }
        daySquares += `<div class="gh-sq ${lvl}${isCurrentMonth && day===TODAY.getDate() ? ' current-month':''}" title="${shortLabel(cellDate)}"></div>`;
      }
      html += `<div class="gh-month-block"><div class="gh-month-label">${monthName}</div><div class="gh-month-grid">${daySquares}</div></div>`;
    }
    container.innerHTML = html;
  }

  function renderAnalytics(){
    if(!document.getElementById('yearHeatmap')) return;
    const monthSel = document.getElementById('analyticsMonth');
    const monthVal = monthSel ? monthSel.value : '2026-07';
    const seed = hashStr(monthVal);
    const monthLabel = monthSel ? monthSel.options[monthSel.selectedIndex].text : 'July 2026';

    renderGithubHeatmap();

    /* Stat row — seeded per month so it's consistent but varies by selection */
    const stats = document.getElementById('analyticsStats');
    const curStreak = Math.round(4 + seededRandom(seed+1)*18);
    const longStreak = curStreak + Math.round(seededRandom(seed+2)*10);
    const habitsDone = Math.round(60 + seededRandom(seed+3)*120);
    const todoPct = Math.round(50 + seededRandom(seed+4)*45);
    stats.innerHTML = `
      <div class="stat-card"><div class="stat-num">${curStreak}</div><div class="stat-label">Current Streak</div></div>
      <div class="stat-card"><div class="stat-num">${longStreak}</div><div class="stat-label">Longest Streak</div></div>
      <div class="stat-card"><div class="stat-num">${habitsDone}</div><div class="stat-label">Habits Completed</div></div>
      <div class="stat-card"><div class="stat-num">${todoPct}%</div><div class="stat-label">Todo Completion</div></div>
    `;

    /* Completion chart — Week 1-4 of selected month */
    document.getElementById('completionRangeLabel').textContent = monthLabel + ' · Week 1–4';
    const weekPcts = [1,2,3,4].map(w => Math.round(30 + seededRandom(seed+w*7)*65));
    const xs = [70, 175, 280, 385];
    const yFor = pct => 130 - (pct/100)*120;
    const pts = xs.map((x,i)=>`${x},${yFor(weekPcts[i]).toFixed(1)}`).join(' ');
    const fillPts = `${pts} ${xs[3]},130 ${xs[0]},130`;
    const chart = document.getElementById('completionChart');
    chart.innerHTML = `
      <line x1="34" y1="10" x2="34" y2="130" stroke="var(--line)" stroke-width="1"/>
      <line x1="34" y1="10" x2="410" y2="10" stroke="var(--line)" stroke-width="1" stroke-dasharray="3 4"/>
      <line x1="34" y1="70" x2="410" y2="70" stroke="var(--line)" stroke-width="1" stroke-dasharray="3 4"/>
      <line x1="34" y1="130" x2="410" y2="130" stroke="var(--line)" stroke-width="1"/>
      <text x="26" y="14" class="chart-axis-label" text-anchor="end">100%</text>
      <text x="26" y="74" class="chart-axis-label" text-anchor="end">50%</text>
      <text x="26" y="134" class="chart-axis-label" text-anchor="end">0%</text>
      <polyline fill="url(#lineFill)" stroke="none" points="${fillPts}"/>
      <polyline fill="none" stroke="var(--coral)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${pts}"/>
      <defs><linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--coral)" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="var(--coral)" stop-opacity="0"/>
      </linearGradient></defs>
      <g class="chart-points">
        ${xs.map((x,i)=>`<circle cx="${x}" cy="${yFor(weekPcts[i]).toFixed(1)}" r="3.5"/><text x="${x}" y="${(yFor(weekPcts[i])-10).toFixed(1)}" class="chart-val">${weekPcts[i]}%</text>`).join('')}
      </g>
      <g class="chart-x-labels">
        <text x="70" y="148">Week 1</text><text x="175" y="148">Week 2</text><text x="280" y="148">Week 3</text><text x="385" y="148">Week 4</text>
      </g>
    `;

    const bd = document.getElementById('habitBreakdown');
    bd.innerHTML = habits.map(h=>{
      const done = h.history.filter(v=>v).length;
      const total = h.history.length;
      const pct = Math.round((done/total)*100);
      return `<div class="breakdown-card">
        <div class="breakdown-card-top">
          <div class="breakdown-card-icon" style="background:${h.color}">${h.icon}</div>
          <div class="breakdown-card-name">${h.name}</div>
          <div class="breakdown-card-streak"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>${h.streak}</div>
        </div>
        <div class="breakdown-card-bottom">
          <div class="breakdown-bar-track"><div class="breakdown-bar-fill" style="width:${pct}%"></div></div>
          <span class="breakdown-pct">${done}/${total} days</span>
        </div>
      </div>`;
    }).join('') || '<p class="empty-note">Add a habit to see its breakdown here.</p>';
  }

  /* ---------- SETTINGS ---------- */
  let userProfile = loadState('userProfile', { name:'Deodatta', email:'deodatta@example.com', photo:null });

  function applyAvatar(){
    const initial = userProfile.name.charAt(0).toUpperCase();
    [document.getElementById('settingsAvatar'), document.getElementById('sidebarAvatar')].forEach(el=>{
      if(!el) return;
      if(userProfile.photo){
        el.style.backgroundImage = `url(${userProfile.photo})`;
        el.classList.add('has-photo');
        el.textContent = '';
      } else {
        el.style.backgroundImage = '';
        el.classList.remove('has-photo');
        el.textContent = initial;
      }
    });
  }

  function handlePhotoUpload(event){
    const file = event.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      userProfile.photo = e.target.result;
      saveState('userProfile', userProfile);
      applyAvatar();
    };
    reader.readAsDataURL(file);
  }

  function renderSettings(){
    if(!document.getElementById('s_name')) return;
    document.getElementById('s_name').value = userProfile.name;
    document.getElementById('s_email').value = userProfile.email;
    applyAvatar();
    document.getElementById('darkToggle').checked = document.body.classList.contains('dark');
  }

  function saveProfile(){
    const name = document.getElementById('s_name').value.trim() || 'Deodatta';
    const email = document.getElementById('s_email').value.trim();
    userProfile.name = name;
    userProfile.email = email;
    saveState('userProfile', userProfile);
    document.getElementById('sidebarName').textContent = name;
    applyAvatar();
    const greetH1 = document.querySelector('.greeting h1');
    if(greetH1) greetH1.textContent = `Good morning, ${name}`;
  }

  function toggleDarkMode(){
    const on = document.getElementById('darkToggle').checked;
    document.body.classList.toggle('dark', on);
    saveState('darkMode', on);
  }

  function confirmDeleteAccount(){
    if(confirm('This will permanently delete your account and all data. This cannot be undone. Continue?')){
      alert('Account deletion requested. (Demo only — nothing was actually deleted.)');
    }
  }

  /* ---------- NOTES ---------- */
  let notes = loadState('notes', [
    {id:1, title:'Welcome to Notes', content:'<p>This is your first note. Use the toolbar above to format text — bold, italic, colors, highlights, lists, and more.</p><p>Create as many notes as you like, download them, or print to PDF whenever you\'re ready.</p>', updated: TODAY.getTime()}
  ]);
  let activeNoteId = loadState('activeNoteId', 1);
  let nextNoteId = loadState('nextNoteId', 2);

  function timeAgoLabel(ts){
    const diffMs = TODAY.getTime() - ts;
    const mins = Math.round(diffMs/60000);
    if(mins < 1) return 'just now';
    if(mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins/60);
    if(hrs < 24) return `${hrs}h ago`;
    const days = Math.round(hrs/24);
    return `${days}d ago`;
  }

  function activeNote(){ return notes.find(n=>n.id===activeNoteId); }

  function renderNotesList(){
    const list = document.getElementById('notesList');
    if(!list) return;
    const sorted = [...notes].sort((a,b)=>b.updated-a.updated);
    list.innerHTML = sorted.map(n=>{
      const plain = n.content.replace(/<[^>]*>/g,' ').trim().slice(0,60);
      return `<div class="note-list-item ${n.id===activeNoteId?'active':''}" onclick="openNote(${n.id})">
        <div class="note-list-item-title">${n.title || 'Untitled note'}</div>
        <div class="note-list-item-meta">${timeAgoLabel(n.updated)}${plain ? ' · ' + plain : ''}</div>
        <span class="note-list-item-del" onclick="event.stopPropagation(); deleteNote(${n.id})">&times;</span>
      </div>`;
    }).join('');
    loadActiveNoteIntoEditor();
  }

  function loadActiveNoteIntoEditor(){
    const n = activeNote();
    if(!n) return;
    document.getElementById('noteTitleInput').value = n.title;
    document.getElementById('noteContent').innerHTML = n.content;
    document.getElementById('noteMeta').textContent = 'Last edited ' + timeAgoLabel(n.updated);
  }

  function newNote(){
    const n = {id:nextNoteId++, title:'', content:'', updated:TODAY.getTime()};
    notes.push(n);
    activeNoteId = n.id;
    saveState('notes', notes); saveState('nextNoteId', nextNoteId); saveState('activeNoteId', activeNoteId);
    renderNotesList();
    setTimeout(()=>document.getElementById('noteTitleInput').focus(), 50);
  }

  function openNote(id){
    activeNoteId = id;
    saveState('activeNoteId', activeNoteId);
    renderNotesList();
  }

  function deleteNote(id){
    if(notes.length===1){ alert("You need at least one note — create a new one before deleting this."); return; }
    notes = notes.filter(n=>n.id!==id);
    if(activeNoteId===id) activeNoteId = notes[0].id;
    saveState('notes', notes); saveState('activeNoteId', activeNoteId);
    renderNotesList();
  }

  function onTitleInput(){
    const n = activeNote();
    if(!n) return;
    n.title = document.getElementById('noteTitleInput').value;
    n.updated = TODAY.getTime();
    saveState('notes', notes);
    renderNotesList();
  }

  function onContentInput(){
    const n = activeNote();
    if(!n) return;
    n.content = document.getElementById('noteContent').innerHTML;
    n.updated = TODAY.getTime();
    saveState('notes', notes);
    document.getElementById('noteMeta').textContent = 'Last edited just now';
  }

  function execCmd(cmd, value){
    document.getElementById('noteContent').focus();
    document.execCommand(cmd, false, value || null);
    onContentInput();
  }

  function downloadNote(){
    const n = activeNote();
    if(!n) return;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${n.title||'Untitled note'}</title>
      <style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;color:#1C1B1A;}
      h1{font-family:Georgia,serif;}</style></head>
      <body><h1>${n.title||'Untitled note'}</h1>${n.content}</body></html>`;
    const blob = new Blob([html], {type:'text/html'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(n.title||'untitled-note').replace(/[^a-z0-9]+/gi,'-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function printNote(){
    window.print();
  }

  function shareNote(){
    const n = activeNote();
    if(!n) return;
    const plainText = n.content.replace(/<[^>]*>/g,'\n').replace(/\n{2,}/g,'\n').trim();
    if(navigator.share){
      navigator.share({ title:n.title||'Untitled note', text:plainText }).catch(()=>{});
    } else if(navigator.clipboard){
      navigator.clipboard.writeText(plainText).then(()=>{
        alert('Note content copied to clipboard — paste it anywhere to share.');
      });
    } else {
      alert('Sharing isn\'t supported in this browser. Try Download instead.');
    }
  }

  /* ---------- REWARDS ---------- */
  /* ---------- BADGE CHAINS (tiered, always extend to a next target) ---------- */
  const badgeChains = [
    {
      key:'streak', label:'Streak', icon:'flame', bgBase:'#FFE9DC', anim:'icon-flicker',
      baseTiers:[7,15,30,60,100], step:50,
      unit:'day streak',
      labelFor: (n) => `${n}-Day Streak`,
      currentValue: () => habits.length ? Math.max(...habits.map(h=>h.streak)) : 0,
      svg:'<path d="M24 4c4 6 10 12 10 20a10 10 0 01-20 0c0-3 1-5.5 2.5-8 .8 2 2.5 4 4.5 4 2 0 2.8-1.8 1.8-3.5C20.5 13 19 9.5 24 4z" fill="#FF9142"/><path d="M24 16c2.5 4 5 7 5 11a5 5 0 01-10 0c0-1.5.5-2.8 1.2-4 .5 1.2 1.5 2.2 2.3 2.2 1 0 1.3-1 .8-2C22 20.5 21 18 24 16z" fill="#FFD23F"/>'
    },
    {
      key:'todos', label:'Todo', icon:'check', bgBase:'#E1F3EC', anim:'',
      baseTiers:[10,25,50,100], step:50,
      unit:'todos done',
      labelFor: (n) => `${n} Todos Done`,
      currentValue: () => todos.filter(t=>t.done).length,
      svg:'<path d="M18 4l6 14-6 3-4-13z" fill="#3FC1B0"/><path d="M30 4l-6 14 6 3 4-13z" fill="#FF6B6B"/><circle cx="24" cy="30" r="10" fill="#FFC93C" stroke="#E0A400" stroke-width="2"/><path d="M24 24l1.8 3.7 4 .6-3 2.9.7 4-3.5-1.9-3.5 1.9.7-4-3-2.9 4-.6z" fill="#FFF3D0"/>'
    },
    {
      key:'checkins', label:'Check-in', icon:'trophy', bgBase:'#E7F1FC', anim:'icon-bob',
      baseTiers:[25,75,150,300], step:250,
      unit:'total check-ins',
      labelFor: (n) => `${n} Check-ins`,
      currentValue: () => habits.reduce((sum,h)=>sum + h.history.filter(v=>v).length, 0),
      svg:'<path d="M12 16h24l6 8-18 16L6 24z" fill="#A6A192"/><path d="M12 16h24l-12 8z" fill="#C9C5B8"/><path d="M6 24h36l-18 16z" fill="#8A8578"/><path d="M12 16l-6 8h12z" fill="#B4AFA0"/><path d="M36 16l6 8h-12z" fill="#B4AFA0"/>'
    }
  ];

  const flavorBadges = [
    {name:'Early Bird', unlocked:true, bg:'#FFF3D6', anim:'',
      svg:'<path d="M16 8h16v8a8 8 0 01-16 0V8z" fill="#FFC93C"/><path d="M16 8h16v3H16z" fill="#FFE07D"/><path d="M12 10h4v4a4 4 0 01-4-4z" fill="none" stroke="#E0A400" stroke-width="2"/><path d="M36 10h-4v4a4 4 0 004-4z" fill="none" stroke="#E0A400" stroke-width="2"/><rect x="21" y="24" width="6" height="7" fill="#C97B3D"/><rect x="15" y="31" width="18" height="4" rx="1.5" fill="#A85F2A"/><path d="M9 12c1 3 3 5 5 6l-1-3c-2-.5-3.5-1.8-4-3z" fill="#6FCF6F"/><path d="M39 12c-1 3-3 5-5 6l1-3c2-.5 3.5-1.8 4-3z" fill="#6FCF6F"/>'},
    {name:'Comeback Kid', unlocked:true, bg:'#FDE7E7', anim:'icon-bob',
      svg:'<circle cx="24" cy="24" r="14" fill="#FF6B6B"/><circle cx="24" cy="24" r="10" fill="#FFF3EC"/><circle cx="24" cy="24" r="6" fill="#FF6B6B"/><circle cx="24" cy="24" r="2.5" fill="#FFC93C"/><path d="M32 12l6-4-1 7-3 1z" fill="#C97B3D"/>'},
    {name:'Perfect Week', unlocked:true, bg:'#EFE9FB', anim:'icon-sway',
      svg:'<path d="M16 26v14l8-5 8 5V26z" fill="#8E6FCB"/><path d="M24 8l3.5 7 7.5 1-5.5 5.3 1.3 7.7L24 25l-6.8 3.7 1.3-7.7L13 15l7.5-1z" fill="#FFC93C"/>'}
  ];

  // extends a chain's tier list until the last one exceeds the current value —
  // this is what makes progression infinite: there's always one more target ahead
  function getChainProgress(chain){
    const value = chain.currentValue();
    let tiers = [...chain.baseTiers];
    while(tiers[tiers.length-1] <= value){
      tiers.push(tiers[tiers.length-1] + chain.step);
    }
    const achieved = tiers.slice(0, -1);
    const nextTarget = tiers[tiers.length-1];
    const prevTarget = achieved.length ? achieved[achieved.length-1] : 0;
    return { value, achieved, nextTarget, prevTarget };
  }

  const rankTitles = [
    {min:0, title:'Newcomer', icon:'🌱'},
    {min:2, title:'Spark', icon:'✨'},
    {min:4, title:'Rising Star', icon:'🚀'},
    {min:7, title:'Momentum Builder', icon:'⚡'},
    {min:10, title:'Unstoppable', icon:'🔥'},
    {min:15, title:'Legend', icon:'👑'}
  ];
  function currentLevel(){ return 4; } // mirrors the XP card on the dashboard

  function renderRewards(){
    const grid = document.getElementById('badgeGrid');
    if(!grid) return;

    let cards = [];

    badgeChains.forEach(chain=>{
      const { achieved, nextTarget, value, prevTarget } = getChainProgress(chain);
      const remaining = nextTarget - value;
      const span = nextTarget - prevTarget;
      const progressPct = Math.max(4, Math.round(((value-prevTarget)/span)*100));

      if(achieved.length === 0){
        // no tier earned yet — show the first tier as the locked target to work toward
        cards.push({
          name: chain.labelFor(nextTarget), unlocked:false, bg:'#EDEAE0', anim:'', svg:chain.svg,
          progressLabel:`${value}/${nextTarget} · ${remaining} to go`, progressPct
        });
      } else {
        // show ONLY the current (highest earned) tier — this badge replaces itself as you level up,
        // with a caption showing progress toward the next tier so it's clear more is coming
        const currentTier = achieved[achieved.length-1];
        cards.push({
          name: chain.labelFor(currentTier), unlocked:true, bg:chain.bgBase, anim:chain.anim, svg:chain.svg,
          progressLabel:`Next: ${chain.labelFor(nextTarget)} · ${remaining} to go`, progressPct, showNextCaption:true
        });
      }
    });

    flavorBadges.forEach(b=>cards.push(b));

    grid.innerHTML = cards.map(b=>`
      <div class="badge-item ${b.unlocked?'':'locked'}" onclick="onBadgeClick(this, ${b.unlocked})">
        <div class="badge-circle ${b.unlocked?'glow':'locked'}" style="background:${b.bg};">
          <svg class="${b.unlocked?b.anim:''}" viewBox="0 0 48 48">${b.svg}</svg>
        </div>
        <div class="badge-name ${b.unlocked?'':'locked-label'}">${b.name}</div>
        ${b.progressLabel ? `
          <div class="badge-progress-track"><div class="badge-progress-fill" style="width:${b.progressPct}%"></div></div>
          <div class="badge-progress-label">${b.progressLabel}</div>
        ` : ''}
      </div>
    `).join('');

    const level = currentLevel();
    let rank = rankTitles[0];
    rankTitles.forEach(r => { if(level >= r.min) rank = r; });
    const rankTitleEl = document.getElementById('rankTitle');
    const rankIconEl = document.getElementById('rankIcon');
    if(rankTitleEl) rankTitleEl.textContent = rank.title;
    if(rankIconEl) rankIconEl.textContent = rank.icon;

    renderNextMilestone();
  }

  function renderNextMilestone(){
    const wrap = document.getElementById('nextMilestoneBody');
    if(!wrap) return;
    // find whichever chain is CLOSEST to its next tier — that's the most motivating one to surface
    let best = null;
    badgeChains.forEach(chain=>{
      const { value, nextTarget, prevTarget } = getChainProgress(chain);
      const remaining = nextTarget - value;
      if(!best || remaining < best.remaining){
        best = { chain, value, nextTarget, prevTarget, remaining };
      }
    });
    if(!best) return;
    const span = best.nextTarget - best.prevTarget;
    const pct = Math.max(4, Math.round(((best.value-best.prevTarget)/span)*100));
    const label = best.chain.labelFor(best.nextTarget);
    wrap.innerHTML = `
      <div class="milestone-icon">🏆</div>
      <div style="flex:1;">
        <div class="milestone-title">${label}</div>
        <div class="milestone-bar"><div class="milestone-fill" style="width:${pct}%;"></div></div>
        <div class="milestone-sub">${best.value} / ${best.nextTarget} · ${best.remaining} to go</div>
      </div>
    `;
  }

  function onBadgeClick(el, unlocked){
    if(!unlocked){
      el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
      return;
    }
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
    const pieces = ['✨','🎉','⭐','🔥','💫'];
    for(let i=0;i<10;i++){
      const span = document.createElement('span');
      span.className = 'confetti-piece';
      span.textContent = pieces[Math.floor(Math.random()*pieces.length)];
      const angle = Math.random()*Math.PI*2;
      const dist = 40 + Math.random()*50;
      span.style.setProperty('--fly-to', `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist - 20}px)`);
      span.style.setProperty('--fly-rot', `${Math.random()*360}deg`);
      span.style.left = cx+'px'; span.style.top = cy+'px';
      document.body.appendChild(span);
      setTimeout(()=>span.remove(), 950);
    }
  }

  /* ---------- DASHBOARD (real data, single source of truth) ---------- */
  function renderDashboard(){
    const dh = document.getElementById('dashHabits');
    if(dh){
      dh.innerHTML = habits.map(h=>{
        const doneToday = h.history[h.history.length-1];
        return `<div class="habit-row">
          <div class="habit-check ${doneToday?'done':''}" onclick="toggleHabitToday(${h.id})">
            ${doneToday ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>' : ''}
          </div>
          <div class="habit-icon" style="background:${h.color}">${h.icon}</div>
          <div class="habit-info">
            <div class="habit-name">${h.name}</div>
            <div class="habit-freq">${h.freq}</div>
          </div>
          <div class="streak-chip"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>${h.streak}</div>
        </div>`;
      }).join('') || '<p class="empty-note">No habits yet — add your first one.</p>';
    }

    const dt = document.getElementById('dashTodos');
    if(dt){
      const todayTodos = todos.filter(t=>t.date===TODAY_KEY);
      dt.innerHTML = todayTodos.map(todoRow).join('') || '<p class="empty-note">Nothing due today. Enjoy it.</p>';
    }

    const totalHabits = habits.length;
    const todayTasksLeft = todos.filter(t=>t.date===TODAY_KEY && !t.done).length;
    const longest = habits.length ? Math.max(...habits.map(h=>h.streak)) : 0;
    const sub = document.getElementById('greetingSub');
    if(sub){
      sub.innerHTML = `You've got <span class="accent">${totalHabits} habit${totalHabits!==1?'s':''}</span> and <span class="accent">${todayTasksLeft} task${todayTasksLeft!==1?'s':''}</span> today. Your longest streak is ${longest} days — let's keep it moving.`;
    }
  }

  /* ---------- MOTIVATIONAL QUOTES ---------- */
  const quotes = [
    "Motion, once started, is far easier to continue than to begin again.",
    "You don't have to be extreme, just consistent.",
    "Small daily improvements are the key to staggering long-term results.",
    "Discipline is choosing between what you want now and what you want most.",
    "A habit a day keeps regret away.",
    "The secret of getting ahead is getting started.",
    "Progress, not perfection.",
    "Streaks aren't built in a day — they're built by not missing twice.",
    "What you do every day matters more than what you do once in a while.",
    "Momentum is a byproduct of consistency, not motivation.",
    "Don't count the days, make the days count.",
    "Every checkbox you tick is a vote for who you're becoming."
  ];
  function pickQuote(){
    const el = document.getElementById('quoteText');
    if(!el) return;
    const q = quotes[Math.floor(Math.random()*quotes.length)];
    document.getElementById('quoteChip').style.opacity = '0';
    setTimeout(()=>{ el.textContent = q; document.getElementById('quoteChip').style.opacity = '1'; }, 180);
  }

  /* ---------- LIVE IST CLOCK ---------- */
  function tickClock(){
    const el = document.getElementById('clockTime');
    if(!el) return;
    const parts = new Intl.DateTimeFormat('en-IN', {
      timeZone:'Asia/Kolkata', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true
    }).formatToParts(new Date());
    const get = t => parts.find(p=>p.type===t)?.value || '';
    el.innerHTML = `${get('hour')}:${get('minute')}<span class="sec">:${get('second')}</span><span class="ampm">${get('dayPeriod')}</span>`;
  }
  setInterval(tickClock, 1000);
  tickClock();

  /* init */
  if(loadState('darkMode', false)){ document.body.classList.add('dark'); }
  setActiveNav();
  renderHabits(); renderTodos(); renderDashboard(); pickQuote(); applyAvatar();
  renderAnalytics(); renderRewards(); renderSettings(); renderNotesList();