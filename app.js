function localIsoDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
const now = new Date();
const TODAY = localIsoDate(now);
const seedSchedules = [
  {id:'c1',title:'HW#10 — Kinematics of Particles',course:'ENGR210501 · Engineering Mechanics',date:TODAY,time:'23:59',track:'university',minutes:90,done:false},
  {id:'c2',title:'Direct current circuits',course:'PHYS1021_coordination · Physics',date:'2026-11-21',time:'23:59',track:'university',minutes:60,done:false},
  {id:'c4',title:'Assignment 4',course:'MACT322404 · Probability and Statistics',date:'2026-11-23',time:'23:59',track:'university',minutes:90,done:false},
  {id:'c5',title:'HW11 — Kinematics of Particles',course:'ENGR210501 · Engineering Mechanics',date:'2026-11-25',time:'23:59',track:'university',minutes:90,done:false},
  {id:'c6',title:'Quiz 6',course:'PSYC100001 · Introduction to Psychology',date:'2026-12-09',time:'23:59',track:'university',minutes:45,done:false},
  {id:'c7',title:'Final project (20%)',course:'SCI102006 · Scientific Thinking',date:'2026-12-10',time:'10:00',track:'university',minutes:180,done:false},
  {id:'c8',title:'Assignment #2: Controversy in Psychology Paper',course:'PSYC100001 · Introduction to Psychology',date:'2026-12-20',time:'08:30',track:'university',minutes:180,done:false},
  {id:'s1',title:'Next self-study milestone',course:'Self-study course',date:'2026-11-30',time:'20:00',track:'self',minutes:60,done:false}
];
const defaultBlocks=[{title:'Canvas priority work',detail:'Nearest due item, phone away',done:false},{title:'Self-study course',detail:'30–60 minutes after university work',done:false},{title:'Review & plan',detail:'Choose tomorrow’s first action',done:false}];
const state={schedules:JSON.parse(localStorage.getItem('study-orbit-schedules')||'null')||seedSchedules,blocks:JSON.parse(localStorage.getItem('study-orbit-blocks')||'null')||defaultBlocks,resources:JSON.parse(localStorage.getItem('study-orbit-resources')||'null')||[],libraryTab:'journal',selectedResource:null,filter:'all',period:'all',layout:'list',sort:'due',showDone:false,searchTerm:'',focus:localStorage.getItem('study-orbit-focus')||'Clear the nearest Canvas deadlines.',dark:localStorage.getItem('study-orbit-dark')==='1',calendar:new Date(now.getFullYear(),now.getMonth(),1),selectedDate:TODAY};
state.resources.forEach((resource,index)=>{if(!resource.id)resource.id=`legacy-resource-${index}`});
const pomoPresets={focus25:{label:'Focus 25',seconds:25*60,kind:'focus',next:'break5'},break5:{label:'Break 5',seconds:5*60,kind:'break',next:'focus25'},focus55:{label:'Focus 55',seconds:55*60,kind:'focus',next:'break15'},break15:{label:'Break 15',seconds:15*60,kind:'break',next:'focus55'}};
const savedPomo=JSON.parse(localStorage.getItem('study-orbit-pomodoro')||'null');
const pomo=savedPomo&&pomoPresets[savedPomo.mode]?savedPomo:{mode:'focus25',seconds:25*60,running:false,updatedAt:Date.now()};
if(pomo.running&&pomo.updatedAt){pomo.seconds=Math.max(0,pomo.seconds-Math.floor((Date.now()-pomo.updatedAt)/1000));pomo.updatedAt=Date.now()}
let pomoTimer;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const save=()=>{localStorage.setItem('study-orbit-schedules',JSON.stringify(state.schedules));localStorage.setItem('study-orbit-blocks',JSON.stringify(state.blocks));localStorage.setItem('study-orbit-resources',JSON.stringify(state.resources));localStorage.setItem('study-orbit-focus',state.focus)};
const savePomo=()=>{pomo.updatedAt=Date.now();localStorage.setItem('study-orbit-pomodoro',JSON.stringify(pomo))};
function renderPomodoro(){const preset=pomoPresets[pomo.mode],minutes=String(Math.floor(pomo.seconds/60)).padStart(2,'0'),seconds=String(pomo.seconds%60).padStart(2,'0');$('#pomo-clock').textContent=`${minutes}:${seconds}`;$('#pomo-state').textContent=preset.kind==='focus'?'Focus':'Break';$('#pomo-start').textContent=pomo.running?'Pause':'Start';$$('.pomo-preset').forEach(button=>button.classList.toggle('is-active',button.dataset.pomo===pomo.mode));document.title=`${minutes}:${seconds} · ${preset.label} · Study Orbit`}
function setPomoMode(mode){pomo.mode=mode;pomo.seconds=pomoPresets[mode].seconds;pomo.running=false;clearInterval(pomoTimer);savePomo();renderPomodoro()}
function runPomo(){if(pomo.running){pomo.running=false;clearInterval(pomoTimer);savePomo();renderPomodoro();return}pomo.running=true;savePomo();renderPomodoro();clearInterval(pomoTimer);pomoTimer=setInterval(()=>{pomo.seconds-=1;if(pomo.seconds<=0){const completed=pomoPresets[pomo.mode],next=completed.next;showToast(`${completed.label} complete — ${pomoPresets[next].label} is ready.`);setPomoMode(next);return}savePomo();renderPomodoro()},1000)}
function resetPomo(){pomo.seconds=pomoPresets[pomo.mode].seconds;pomo.running=false;clearInterval(pomoTimer);savePomo();renderPomodoro()}
const dateObj=x=>new Date(`${x.date}T${x.time||'23:59'}:00`),fmtDate=x=>dateObj(x).toLocaleDateString('en-US',{month:'short',day:'numeric'}),safe=str=>String(str).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function diffLabel(item){const ms=dateObj(item)-new Date();if(ms<=0)return 'due now';const total=Math.floor(ms/1000),days=Math.floor(total/86400),hours=Math.floor(total%86400/3600),mins=Math.floor(total%3600/60);return days?`${days}d ${hours}h`:hours?`${hours}h ${mins}m`:`${Math.max(1,mins)}m`}
function decodeIcs(value = '') {
  return value.replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
}
function parseIcsDate(value) {
  if (!value) return null;
  const raw = value.trim();
  if (/^\d{8}$/.test(raw)) {
    return {
      date: `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`,
      time: '23:59'
    };
  }
  const match = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?/i);
  if (!match) return null;
  const y = +match[1], mo = +match[2] - 1, d = +match[3], h = +match[4], mi = +match[5], s = +(match[6] || 0);
  const isUtc = Boolean(match[7]);
  const dateObj = isUtc ? new Date(Date.UTC(y, mo, d, h, mi, s)) : new Date(y, mo, d, h, mi, s);
  if (isNaN(dateObj.getTime())) return null;
  return {
    date: `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`,
    time: `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`
  };
}
function unfoldIcs(text) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').reduce((lines, line) => {
    if (/^[ \t]/.test(line) && lines.length) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
    return lines;
  }, []);
}
function icsEvents(text, defaults = {}) {
  const events = [];
  const lines = unfoldIcs(text);
  let current = null;
  for (let line of lines) {
    line = line.trim();
    if (line.toUpperCase() === 'BEGIN:VEVENT') {
      current = {};
      continue;
    }
    if (line.toUpperCase() === 'END:VEVENT') {
      if (current && (current.summary || current.description) && (current.end || current.start || current.due)) {
        events.push(current);
      }
      current = null;
      continue;
    }
    if (!current) continue;
    const pivot = line.indexOf(':');
    if (pivot < 0) continue;
    const key = line.slice(0, pivot).split(';')[0].trim().toLowerCase();
    const value = line.slice(pivot + 1);
    if (key === 'summary') current.summary = decodeIcs(value);
    else if (key === 'uid') current.uid = decodeIcs(value);
    else if (key === 'dtend') current.end = value.trim();
    else if (key === 'dtstart') current.start = value.trim();
    else if (key === 'due') current.due = value.trim();
    else if (key === 'description') current.description = decodeIcs(value);
    else if (key === 'categories') current.categories = decodeIcs(value);
    else if (key === 'location') current.location = decodeIcs(value);
  }
  return events.map(event => {
    const rawWhen = event.end || event.due || event.start;
    const when = parseIcsDate(rawWhen);
    if (!when) return null;
    let title = (event.summary || 'Untitled event').trim();
    let course = '';
    const bracketMatch = title.match(/\[([^\]]+)\]\s*$/);
    if (bracketMatch) {
      course = bracketMatch[1].trim();
      title = title.replace(bracketMatch[0], '').trim();
    } else {
      const colonMatch = title.match(/^([^:]{2,50}):\s*(.+)$/);
      if (colonMatch) {
        course = colonMatch[1].trim();
        title = colonMatch[2].trim();
      }
    }
    if (!course && event.description) {
      const descMatch = event.description.match(/(?:course|context)\s*:\s*([^\n\r]+)/i);
      if (descMatch) course = descMatch[1].trim();
    }
    if (!course && event.categories) {
      course = event.categories.split(',')[0].trim();
    }
    course = course || defaults.defaultCourse || 'Imported calendar';
    const safeUid = (event.uid || `${course}-${title}-${when.date}-${when.time}`).replace(/[^a-zA-Z0-9_-]/g, '-');
    return {
      id: `canvas-ics-${safeUid}`,
      title: title || 'Scheduled item',
      course,
      date: when.date,
      time: when.time,
      track: defaults.track || 'university',
      minutes: 60,
      done: false,
      source: 'canvas-ics',
      icsUid: event.uid || ''
    };
  }).filter(Boolean);
}
function upsertSchedules(items){let added=0,updated=0;items.forEach(item=>{const existing=state.schedules.find(x=>x.id===item.id);if(existing){Object.assign(existing,{...item,done:existing.done});updated+=1}else{state.schedules.push(item);added+=1}});save();render();return{added,updated}}
function loadGoogleIdentity(){if(window.google?.accounts?.oauth2)return Promise.resolve();return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.defer=true;script.onload=resolve;script.onerror=()=>reject(new Error('Google Identity Services could not load. Check network.'));document.head.appendChild(script)})}
async function syncGoogleCalendar(clientId){
  if (window.location.protocol === 'file:') {
    throw new Error('Google OAuth requires http://localhost (Google blocks file:/// pages). Use the .ics export option instead!');
  }
  if (!clientId || clientId.length < 20) {
    throw new Error('Please enter a valid Google OAuth Client ID.');
  }
  await loadGoogleIdentity();
  const token = await new Promise((resolve, reject) => {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
        callback: response => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
          } else {
            resolve(response);
          }
        },
        error_callback: err => {
          reject(new Error(err?.message || err?.type || 'OAuth initialization rejected. Check Authorized JavaScript Origins in Google Cloud.'));
        }
      });
      client.requestAccessToken({ prompt: 'consent' });
    } catch (e) {
      reject(e);
    }
  });
  const min = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(min)}&maxResults=2500`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token.access_token}` } });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Google Calendar API rejected the request.');
  }
  const data = await response.json();
  const items = (data.items || []).filter(event => event.status !== 'cancelled').map(event => {
    const start = event.start?.dateTime || event.start?.date;
    if (!start) return null;
    return {
      id: `google-${event.id}`,
      title: event.summary || 'Untitled Google event',
      course: event.organizer?.displayName || 'Google Calendar',
      date: start.slice(0, 10),
      time: event.start?.dateTime ? start.slice(11, 16) : '23:59',
      track: 'university',
      minutes: 60,
      done: false,
      source: 'google'
    };
  }).filter(Boolean);
  const result = upsertSchedules(items);
  localStorage.setItem('study-orbit-google-client-id', clientId);
  $('#sync-status').textContent = `Google synced · ${result.added + result.updated} events`;
  showToast(`Google Calendar synced: ${result.added} added, ${result.updated} updated.`);
}
function isToday(item){return item.date===TODAY}
function inCurrentWeek(item){const d=new Date(`${item.date}T12:00:00`),start=new Date(`${TODAY}T12:00:00`);start.setDate(start.getDate()-start.getDay());const end=new Date(start);end.setDate(end.getDate()+7);return d>=start&&d<end}
function visibleSchedules(){let rows=state.schedules.filter(x=>state.filter==='all'||x.track===state.filter);if(!state.showDone)rows=rows.filter(x=>!x.done);if(state.period==='day')rows=rows.filter(x=>x.date===state.selectedDate);if(state.period==='week')rows=rows.filter(inCurrentWeek);if(state.searchTerm){const term=state.searchTerm.toLowerCase();rows=rows.filter(x=>(x.title||'').toLowerCase().includes(term)||(x.course||'').toLowerCase().includes(term))}return rows.sort((a,b)=>state.sort==='priority'?b.minutes-a.minutes:dateObj(a)-dateObj(b))}
function render(){renderDeadlines();renderBlocks();renderTimeline();renderCourses();renderCalendar();renderLibrary();renderWeekStrip();renderPomodoro();updateSummary();updateHeader();document.body.classList.toggle('dark',state.dark);if($('#focus-heading'))$('#focus-heading').textContent=state.focus;updatePeriodLabels()}
function deleteTask(id){const task=state.schedules.find(x=>x.id===id);if(!task)return;state.schedules=state.schedules.filter(x=>x.id!==id);save();render();showToast(`Deleted “${task.title}”.`)}
function renderDeadlines(){const list=$('#deadline-list'),visible=visibleSchedules();if($('#deadline-count'))$('#deadline-count').textContent=`${visible.length} item${visible.length===1?'':'s'}`;$('#anytime-count').textContent=visible.length;$('#task-group-title').textContent=state.period==='day'?'Today':state.period==='week'?'This week':'Anytime';if(state.layout==='board'){const groups=[['University',visible.filter(x=>x.track==='university')],['Self-study',visible.filter(x=>x.track==='self')]];list.innerHTML=`<div class="task-board">${groups.map(([label,items])=>`<section class="board-column"><div class="board-title">${label}<span>${items.length}</span></div>${items.map(taskCard).join('')||'<p class="muted">Nothing here yet.</p>'}</section>`).join('')}</div>`}else{list.innerHTML=visible.map(taskRow).join('')||'<div class="muted">No schedules in this view yet. Add one to begin.</div>'}$('[data-task-id]',list).forEach(row=>{const id=row.dataset.taskId;$('.check',row)?.addEventListener('click',event=>{event.stopPropagation();toggleSchedule(id)});$('.task-del-btn',row)?.addEventListener('click',event=>{event.stopPropagation();deleteTask(id)});row.addEventListener('dblclick',()=>editTask(id))})}
function taskRow(x){return `<div class="deadline-row ${x.done?'is-done':''}" data-task-id="${x.id}"><button class="check" aria-label="${x.done?'Mark incomplete':'Mark complete'}">${x.done?'✓':'·'}</button><div><div class="deadline-name">${safe(x.title)} <span class="tag ${x.track==='self'?'self':''}">${x.track==='self'?'SELF-STUDY':'CANVAS'}</span></div><div class="deadline-course">${safe(x.course)} · ${x.minutes} min <span class="countdown">${diffLabel(x)}</span></div></div><div class="deadline-due ${isToday(x)?'urgent':''}">${isToday(x)?'Today':fmtDate(x)}<br>${x.time}</div><button class="task-del-btn" title="Delete task" aria-label="Delete task">×</button></div>`}
function taskCard(x){return `<article class="board-task ${x.done?'is-done':''}" data-task-id="${x.id}"><button class="task-del-btn" title="Delete task" aria-label="Delete task">×</button><button class="check" aria-label="${x.done?'Mark incomplete':'Mark complete'}">${x.done?'✓':'·'}</button><strong>${safe(x.title)}</strong><span>${safe(x.course)}</span><small>${fmtDate(x)} · ${diffLabel(x)}</small></article>`}
function editTask(id){const task=state.schedules.find(x=>x.id===id);if(!task)return;const title=prompt('Edit task name',task.title);if(title?.trim()){task.title=title.trim();save();render();showToast('Task updated.')}}
function renderWeekStrip(){const start=new Date(`${TODAY}T12:00:00`);start.setDate(start.getDate()-start.getDay()+1);const days=[];for(let i=0;i<7;i++){const d=new Date(start);d.setDate(start.getDate()+i);const iso=localIsoDate(d),items=state.schedules.filter(x=>x.date===iso),label=d.toLocaleDateString('en-US',{weekday:'short'}),number=d.getDate();days.push(`<button class="week-day ${iso===TODAY?'is-today':''} ${iso===state.selectedDate?'is-active':''}" data-date="${iso}"><span>${label}</span><strong>${number}</strong><i>${items.length||''}</i></button>`)}$('#week-strip').innerHTML=days.join('');const due=state.schedules.filter(x=>!x.done&&inCurrentWeek(x)).length;$('#week-due').textContent=`${due} due`;$('#week-remaining').textContent=`${state.schedules.filter(x=>!x.done).length} task${state.schedules.filter(x=>!x.done).length===1?'':'s'} remaining`;$$('.week-day').forEach(btn=>btn.addEventListener('click',()=>{state.selectedDate=btn.dataset.date;state.period='day';$$('.period-tab').forEach(x=>x.classList.toggle('is-active',x.dataset.period==='day'));renderDeadlines();renderWeekStrip();showToast(`Showing ${btn.dataset.date}`)}))}
function renderBlocks(){$('#focus-blocks').innerHTML=state.blocks.map((b,i)=>`<div class="focus-item"><div class="focus-text" data-edit-block="${i}" style="flex:1;cursor:pointer;" title="Double-click to edit"><strong>${safe(b.title)}</strong><small>${safe(b.detail)}</small></div><button class="block-check ${b.done?'is-done':''}" data-block="${i}" aria-label="Toggle focus block">${b.done?'✓':'○'}</button><button class="task-del-btn" data-del-block="${i}" title="Delete block" aria-label="Delete block" style="margin-left:2px;opacity:0.6;">×</button></div>`).join('');$$('.block-check').forEach(btn=>btn.addEventListener('click',()=>{state.blocks[Number(btn.dataset.block)].done=!state.blocks[Number(btn.dataset.block)].done;save();renderBlocks();showToast('Focus block updated')}));$$('[data-del-block]').forEach(btn=>btn.addEventListener('click',()=>{const idx=Number(btn.dataset.delBlock);state.blocks.splice(idx,1);save();renderBlocks();showToast('Focus block deleted')}));$$('[data-edit-block]').forEach(el=>el.addEventListener('dblclick',()=>{const idx=Number(el.dataset.editBlock),block=state.blocks[idx],newTitle=prompt('Edit focus block title',block.title);if(newTitle?.trim()){const newDetail=prompt('Edit focus block detail',block.detail||'')||'';block.title=newTitle.trim();block.detail=newDetail;save();renderBlocks();showToast('Focus block updated')}}))}
function renderTimeline(){const rows=[...state.schedules].sort((a,b)=>dateObj(a)-dateObj(b));$('#timeline').innerHTML=rows.map(x=>`<div class="timeline-row"><div class="timeline-date">${fmtDate(x)}<br>${x.time}<br><span class="countdown">${diffLabel(x)}</span></div><div class="timeline-track ${x.track==='self'?'self':''}"><div class="timeline-title">${safe(x.title)}</div><div class="timeline-course">${safe(x.course)}</div></div></div>`).join('')||'<div class="muted">No deadlines scheduled yet.</div>'}
function renderCourses(){const grouped={};state.schedules.forEach(x=>{const key=x.course;grouped[key]??={items:[],track:x.track};grouped[key].items.push(x)});$('#course-grid').innerHTML=Object.entries(grouped).map(([name,g])=>{const next=g.items.filter(x=>!x.done).sort((a,b)=>dateObj(a)-dateObj(b))[0],imported=g.items.filter(x=>x.source==='canvas-ics').length;return `<article class="course-card ${g.track==='self'?'self':''}"><span class="eyebrow">${g.track==='self'?'SELF-STUDY':'UNIVERSITY / CANVAS'}${imported?` · ${imported} ICS` : ''}</span><h3>${safe(name)}</h3><p>${next?`Next deadline: ${safe(next.title)}`:'No remaining deadlines.'}</p>${next?`<span class="course-next">${fmtDate(next)} · ${next.time} · ${diffLabel(next)}</span>`:''}<div class="course-count">${g.items.filter(x=>x.done).length}/${g.items.length}</div><span class="muted">deadlines complete</span></article>`}).join('')}
const libraryViews={journal:{title:'Journal',eyebrow:'PERSONAL SPACE',subtitle:'Capture a thought before it disappears.',add:'Add entry',icon:'◈'},ideas:{title:'Ideas',eyebrow:'PERSONAL SPACE',subtitle:'Keep raw sparks somewhere they can grow.',add:'Add idea',icon:'♧'},plans:{title:'Plans',eyebrow:'PERSONAL SPACE',subtitle:'Turn the next big thing into a clear plan.',add:'Add plan',icon:'▤'},vault:{title:'Personal Vault',eyebrow:'PERSONAL SPACE',subtitle:'A private space for notes you want to keep close.',add:'Add to vault',icon:'▣'},notes:{title:'Unfiled notes',eyebrow:'EVERYTHING',subtitle:'Sort your notes later; capture them now.',add:'Add note',icon:'▱'},files:{title:'All files',eyebrow:'EVERYTHING',subtitle:'Keep useful links, files, and references together.',add:'Add file link',icon:'▱'},lectures:{title:'All lectures',eyebrow:'EVERYTHING',subtitle:'Store recordings, slides, or lecture summaries.',add:'Add lecture',icon:'♩'},readings:{title:'Readings',eyebrow:'EVERYTHING',subtitle:'Build a focused reading list for each course.',add:'Add reading',icon:'▥'}};
function categoryForResource(item){if(item.category)return item.category;const value=(item.meta||'').toLowerCase();if(value.includes('file'))return'files';if(value.includes('lecture'))return'lectures';if(value.includes('reading'))return'readings';if(value.includes('plan'))return'plans';if(value.includes('idea'))return'ideas';if(value.includes('vault'))return'vault';if(value.includes('note'))return'notes';return'journal'}
function renderLibrary(){const grid=$('#resource-grid');if(!grid)return;const view=libraryViews[state.libraryTab];const items=state.resources.filter(x=>categoryForResource(x)===state.libraryTab);$('#library-heading').textContent=view.title;$('#library-eyebrow').textContent=view.eyebrow;$('#library-subheading').textContent=view.subtitle;$('#library-add').textContent=`+ ${view.add}`;$$('[data-library-tab]').forEach(button=>button.classList.toggle('is-active',button.dataset.libraryTab===state.libraryTab));grid.innerHTML=items.map(x=>`<article class="resource-card" data-resource-id="${x.id}"><span>${safe(x.icon||view.icon)}</span><div><strong>${safe(x.title)}</strong><small>${safe(x.meta||view.title)}</small></div><p>${safe(x.body||'No details added yet.')}</p><button class="resource-open" aria-label="Open ${safe(x.title)}">↗</button></article>`).join('');$('#empty-library').hidden=items.length>0;const selected=state.resources.find(x=>x.id===state.selectedResource);const preview=$('#resource-preview');if(selected&&categoryForResource(selected)===state.libraryTab){preview.classList.remove('hidden');$('#preview-category').textContent=selected.meta||view.title;$('#preview-title').textContent=selected.title;$('#preview-body').textContent=selected.body||'No details added yet.'}else{preview.classList.add('hidden')}$$('[data-resource-id]',grid).forEach(card=>card.addEventListener('click',()=>{state.selectedResource=card.dataset.resourceId;renderLibrary()}))}
function createLibraryResource(){const view=libraryViews[state.libraryTab];const title=prompt(`Name this ${view.title.toLowerCase()} item`);if(!title?.trim())return;const body=prompt('Add a note or description (optional)','')||'';state.resources.push({id:`resource-${Date.now()}`,category:state.libraryTab,icon:view.icon,title:title.trim(),meta:view.title,body});save();state.selectedResource=null;renderLibrary();showToast(`${view.title} item saved.`)}
function editSelectedResource(){const item=state.resources.find(x=>x.id===state.selectedResource);if(!item)return;const title=prompt('Edit title',item.title);if(title?.trim()){const body=prompt('Edit note or description',item.body||'');item.title=title.trim();item.body=body||'';save();renderLibrary();showToast('Library item updated.')}}
function deleteSelectedResource(){const item=state.resources.find(x=>x.id===state.selectedResource);if(!item||!confirm(`Delete “${item.title}”?`))return;state.resources=state.resources.filter(x=>x.id!==item.id);state.selectedResource=null;save();renderLibrary();showToast('Library item deleted.')}
function renderCalendar(){const y=state.calendar.getFullYear(),m=state.calendar.getMonth();$('#calendar-month').textContent=state.calendar.toLocaleDateString('en-US',{month:'long',year:'numeric'});const first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),prevDays=new Date(y,m,0).getDate(),cells=[];for(let i=0;i<42;i++){const day=i-first.getDay()+1;let date,other=false;if(day<1){date=new Date(y,m-1,prevDays+day);other=true}else if(day>days){date=new Date(y,m+1,day-days);other=true}else date=new Date(y,m,day);const iso=localIsoDate(date),items=state.schedules.filter(x=>x.date===iso);cells.push(`<button class="calendar-cell ${other?'is-other':''} ${iso===TODAY?'is-today':''} ${iso===state.selectedDate?'is-selected':''}" data-date="${iso}"><span class="calendar-day">${date.getDate()}</span>${items.slice(0,3).map(x=>`<i class="calendar-dot ${x.track==='self'?'self':''}"></i>`).join('')}${items.length>3?`<span class="calendar-more">+${items.length-3} more</span>`:''}</button>`)}$('#calendar-grid').innerHTML=cells.join('');$$('.calendar-cell').forEach(cell=>cell.addEventListener('click',()=>{state.selectedDate=cell.dataset.date;renderCalendarDetails();renderCalendar()}));renderCalendarDetails()}
function renderCalendarDetails(){const items=state.schedules.filter(x=>x.date===state.selectedDate).sort((a,b)=>dateObj(a)-dateObj(b));const pretty=new Date(`${state.selectedDate}T12:00:00`).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});$('#calendar-subtitle').textContent=pretty;const detailHtml=items.map(x=>`<span class="calendar-detail-line"><b>${x.time}</b> · ${safe(x.title)} <span class="muted">(${x.track==='self'?'self-study':'Canvas'})</span></span>`).join('');$('#calendar-details').innerHTML=items.length?`<strong>${pretty}</strong>${detailHtml}`:`<span class="muted">Nothing scheduled. A good place for recovery or a new goal.</span>`}
function updateHeader(){const current=new Date();const dateEl=$('#topbar-date');if(dateEl){dateEl.textContent=current.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).toUpperCase()}const greetEl=$('#topbar-greeting');if(greetEl){const hr=current.getHours();const g=hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';greetEl.textContent=`${g}, Mustafa.`}}
function updatePeriodLabels(){const week=state.period==='week';if($('#period-label')){if(week){const d=new Date(`${state.selectedDate||TODAY}T12:00:00`),start=new Date(d);start.setDate(start.getDate()-start.getDay()+1);const end=new Date(start);end.setDate(end.getDate()+6);const sM=start.toLocaleDateString('en-US',{month:'short'}),eM=end.toLocaleDateString('en-US',{month:'short'}),range=sM===eM?`${sM} ${start.getDate()}–${end.getDate()}`:`${sM} ${start.getDate()} – ${eM} ${end.getDate()}`;$('#period-label').textContent=`This week · ${range}`}else{const sel=new Date(`${state.selectedDate||TODAY}T12:00:00`);$('#period-label').textContent=`${state.selectedDate===TODAY?'Today':'Day'} · ${sel.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}`}}if($('#period-summary'))$('#period-summary').textContent=week?'A seven-day view of university and self-study momentum.':'Your nearest actions, in order.';if($('#rhythm-title'))$('#rhythm-title').textContent=week?'See the week before it sees you.':'Keep the momentum visible.'}
function updateSummary(){const canvas=state.schedules.filter(x=>x.track==='university'),done=state.schedules.filter(x=>x.done).length;if($('#stat-due'))$('#stat-due').textContent=canvas.filter(x=>!x.done).length;const pct=Math.round(done/state.schedules.length*100);if($('#focus-percent'))$('#focus-percent').textContent=`${pct}%`;$('#side-progress').style.width=`${pct}%`;if($('#list-count'))$('#list-count').textContent=state.schedules.length;$('#anytime-count').textContent=state.schedules.filter(x=>!x.done).length;const next=state.schedules.filter(x=>!x.done).sort((a,b)=>dateObj(a)-dateObj(b))[0];if(next){$('#side-next-title').textContent=next.title;$('#side-next-due').textContent=`${isToday(next)?'Today':fmtDate(next)} · ${diffLabel(next)}`}}
function toggleSchedule(id){const item=state.schedules.find(x=>x.id===id);item.done=!item.done;save();render();showToast(item.done?'Nice — one orbit cleared.':'Back on your orbit.')}
function openModal(id){$(id).classList.remove('hidden');document.body.style.overflow='hidden';if(id==='#schedule-modal'){const dateInput=$('input[name="date"]',$(id));if(dateInput&&!dateInput.value)dateInput.value=state.selectedDate||TODAY}const input=$('input:not([type=hidden]), textarea',$(id));if(input)input.focus()}function closeModals(){$$('.modal-backdrop').forEach(x=>x.classList.add('hidden'));document.body.style.overflow=''}
function addSchedule(data){state.schedules.push({id:`u${Date.now()}`,...data,done:false,minutes:Number(data.minutes||60)});save();render();closeModals();showToast('Added to your orbit.')}
function showToast(message){const t=$('#toast');t.textContent=message;t.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove('show'),2400)}
$$('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{$$('.nav-item').forEach(x=>x.classList.remove('is-active'));btn.classList.add('is-active');$$('.view').forEach(x=>x.classList.add('hidden'));$(`#view-${btn.dataset.view}`).classList.remove('hidden');if(btn.dataset.view==='calendar')renderCalendar();if(btn.dataset.view==='timeline')renderTimeline()}));
$$('.period-tab').forEach(btn=>btn.addEventListener('click',()=>{$$('.period-tab').forEach(x=>x.classList.remove('is-active'));btn.classList.add('is-active');state.period=btn.dataset.period;renderDeadlines();updatePeriodLabels()}));
['#add-schedule','#timeline-add','#courses-add','#calendar-add'].forEach(id=>$(id)?.addEventListener('click',()=>openModal('#schedule-modal')));
$('#library-add').addEventListener('click',createLibraryResource);
$$('[data-library-tab]').forEach(button=>button.addEventListener('click',()=>{state.libraryTab=button.dataset.libraryTab;state.selectedResource=null;renderLibrary()}));
$('#preview-close').addEventListener('click',()=>{state.selectedResource=null;renderLibrary()});
$('#preview-edit').addEventListener('click',editSelectedResource);
$('#preview-delete').addEventListener('click',deleteSelectedResource);
$('#open-import').addEventListener('click',()=>openModal('#import-modal'));
$('#open-ics').addEventListener('click',()=>openModal('#ics-modal'));
$('#open-google').addEventListener('click',()=>{
  const savedId=localStorage.getItem('study-orbit-google-client-id')||'';
  if($('#google-client-id'))$('#google-client-id').value=savedId;
  const warn=$('#google-file-warning');
  if(warn)warn.style.display=window.location.protocol==='file:'?'block':'none';
  openModal('#google-modal')
});
$('#google-ics-pick')?.addEventListener('click',()=>$('#google-ics-file')?.click());
$('#google-ics-file')?.addEventListener('change',e=>{
  const file=e.currentTarget.files?.[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const content=String(reader.result||'');
      const items=icsEvents(content,{defaultCourse:'Google Calendar',track:'university'});
      if(!items||!items.length){
        showToast('No events found in this .ics file.');
        return;
      }
      const result=upsertSchedules(items);
      $('#sync-status').textContent=`Google synced · ${result.added+result.updated} events`;
      closeModals();
      e.currentTarget.value='';
      showToast(`Google Calendar imported: ${result.added} added, ${result.updated} updated.`);
    }catch(err){
      console.error(err);
      showToast(`Error parsing Google .ics: ${err.message}`);
    }
  };
  reader.onerror=()=>showToast('Failed to read Google .ics file.');
  reader.readAsText(file);
});
$('#pomo-start').addEventListener('click',runPomo);
$('#pomo-reset').addEventListener('click',resetPomo);
$$('.pomo-preset').forEach(btn=>btn.addEventListener('click',()=>setPomoMode(btn.dataset.pomo)));
$('#add-focus-block').addEventListener('click',()=>{state.blocks.push({title:'New focus block',detail:'A protected window for meaningful work',done:false});save();renderBlocks();showToast('New focus block added.')});
$('#edit-focus')?.addEventListener('click',()=>{const next=prompt('What is your north-star outcome?',state.focus);if(next?.trim()){state.focus=next.trim();save();render()}});
$('#theme-toggle').addEventListener('click',()=>{state.dark=!state.dark;localStorage.setItem('study-orbit-dark',state.dark?'1':'0');render()});
function parseQuickTask(input){let str=input.trim(),course='General task',minutes=30,track='university';const tagMatch=str.match(/#([a-zA-Z0-9_\-\.]+)/);if(tagMatch){course=tagMatch[1];str=str.replace(tagMatch[0],'').trim();if(course.toLowerCase().includes('self'))track='self'}const minMatch=str.match(/\b(\d+)\s*(?:m|min|mins)\b/i);if(minMatch){minutes=Number(minMatch[1]);str=str.replace(minMatch[0],'').trim()}else{const hrMatch=str.match(/\b(\d+)\s*(?:h|hr|hrs)\b/i);if(hrMatch){minutes=Number(hrMatch[1])*60;str=str.replace(hrMatch[0],'').trim()}}str=str.replace(/!+/g,'').trim();return{title:str||'Quick task',course,minutes,track}}
$('#quick-task-input').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.currentTarget.value.trim()){const parsed=parseQuickTask(e.currentTarget.value);addSchedule({...parsed,date:state.selectedDate,time:'23:59'});e.currentTarget.value='';showToast('Quick task added.')}});
$('#task-search').addEventListener('input',e=>{state.searchTerm=e.currentTarget.value.trim();renderDeadlines()});
$$('.home-tab').forEach(btn=>btn.addEventListener('click',()=>{state.layout=btn.dataset.layout;$$('.home-tab').forEach(x=>x.classList.toggle('is-active',x===btn));renderDeadlines()}));
$('#filter-button').addEventListener('click',()=>{state.filter=state.filter==='all'?'university':state.filter==='university'?'self':'all';$('#filter-button').textContent=`☷ Filter: ${state.filter==='all'?'All':state.filter==='self'?'Self-study':'University'}`;renderDeadlines()});
$$('[data-sort]').forEach(btn=>btn.addEventListener('click',()=>{state.sort=btn.dataset.sort;$$('[data-sort]').forEach(x=>x.classList.toggle('is-active',x===btn));$('#smart-order').textContent=`☷ Smart order: ${state.sort==='due'?'Due':'Priority'}⌄`;renderDeadlines()}));
$('#smart-order').addEventListener('click',()=>{state.sort=state.sort==='due'?'priority':'due';$$('[data-sort]').forEach(x=>x.classList.toggle('is-active',x.dataset.sort===state.sort));$('#smart-order').textContent=`☷ Smart order: ${state.sort==='due'?'Due':'Priority'}⌄`;renderDeadlines()});
$('#show-all-tasks').addEventListener('click',e=>{state.showDone=!state.showDone;e.currentTarget.classList.toggle('is-active',state.showDone);e.currentTarget.textContent=state.showDone?'Hide done':'Show done';renderDeadlines()});
$('#calendar-prev').addEventListener('click',()=>{state.calendar.setMonth(state.calendar.getMonth()-1);renderCalendar()});
$('#calendar-next').addEventListener('click',()=>{state.calendar.setMonth(state.calendar.getMonth()+1);renderCalendar()});
$$('[data-close-modal]').forEach(btn=>btn.addEventListener('click',closeModals));
$$('.modal-backdrop').forEach(backdrop=>backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeModals()}));
$('#schedule-form').addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));addSchedule(data);e.currentTarget.reset()});
$('#import-form').addEventListener('submit',e=>{e.preventDefault();const lines=new FormData(e.currentTarget).get('bulk').split('\n').map(x=>x.trim()).filter(Boolean);let count=0;lines.forEach(line=>{const [course,title,date,time='23:59']=line.split('|').map(x=>x.trim());if(course&&title&&/^\d{4}-\d{2}-\d{2}$/.test(date)){state.schedules.push({id:`import-${Date.now()}-${count++}`,course,title,date,time,track:course.toLowerCase().includes('self')?'self':'university',minutes:60,done:false})}});save();render();closeModals();e.currentTarget.reset();showToast(`${count} schedule${count===1?'':'s'} imported.`)});
$('#ics-form').addEventListener('submit',e=>{
  e.preventDefault();
  const form=e.currentTarget;
  const fileInput=form.elements.icsFile,file=fileInput?.files?.[0];
  if(!file){showToast('Please select a calendar .ics file.');return}
  const defaultCourse=form.elements.defaultCourse.value.trim()||'Canvas imported',track=form.elements.track.value||'university';
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const content=String(reader.result||'');
      const items=icsEvents(content,{defaultCourse,track});
      if(!items||!items.length){showToast('No events found in this .ics file.');return}
      const result=upsertSchedules(items);
      $('#sync-status').textContent=`Calendar synced · ${result.added+result.updated} events`;
      closeModals();
      form.reset();
      showToast(`Calendar imported: ${result.added} added, ${result.updated} updated.`);
    }catch(err){
      console.error(err);
      showToast(`Error reading .ics: ${err.message||'Check file format'}`);
    }
  };
  reader.onerror=()=>showToast('Failed to read .ics file.');
  reader.readAsText(file);
});
$('#google-form').addEventListener('submit',async e=>{
  e.preventDefault();
  const form=e.currentTarget;
  const clientId=form.elements.clientId.value.trim();
  if(!clientId){
    showToast('Please enter an OAuth client ID or use Option 1 (.ics).');
    return;
  }
  const submitBtn=form.querySelector('button[type="submit"]'),prevText=submitBtn.textContent;
  submitBtn.disabled=true;
  submitBtn.textContent='Connecting...';
  try{
    await syncGoogleCalendar(clientId);
    closeModals();
  }catch(err){
    console.error(err);
    showToast(err.message||'Google authorization failed.');
  }finally{
    submitBtn.disabled=false;
    submitBtn.textContent=prevText;
  }
});
$('#enter-planner').addEventListener('click',()=>{closeWelcome();openModal('#welcome-task-modal')});
$('#skip-welcome').addEventListener('click',()=>{closeModals();closeWelcome()});
$('#welcome-task-form').addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));addSchedule(data);closeWelcome()});
function closeWelcome(){localStorage.setItem('study-orbit-entered','1');const welcome=$('#welcome-screen');if(welcome){welcome.classList.add('is-leaving');setTimeout(()=>welcome.remove(),850)}}
if(localStorage.getItem('study-orbit-entered')==='1'){$('#welcome-screen')?.remove()}
const welcomeScreen=$('#welcome-screen');
if(welcomeScreen){welcomeScreen.addEventListener('pointermove',event=>{const rect=welcomeScreen.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width*100,y=(event.clientY-rect.top)/rect.height*100;welcomeScreen.style.setProperty('--mouse-x',`${x}%`);welcomeScreen.style.setProperty('--mouse-y',`${y}%`);welcomeScreen.style.setProperty('--tilt-x',`${(x-50)/22}px`);welcomeScreen.style.setProperty('--tilt-y',`${(y-50)/30}px`);welcomeScreen.classList.add('is-hovering')});welcomeScreen.addEventListener('pointerleave',()=>welcomeScreen.classList.remove('is-hovering'))}
document.addEventListener('keydown',event=>{const isInput=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName);if(event.key==='Escape'){closeModals();return}if(!isInput&&!$('#welcome-screen')){if(event.key.toLowerCase()==='n'){event.preventDefault();$('#quick-task-input')?.focus()}else if(event.key==='/'){event.preventDefault();$('#task-search')?.focus()}}});
$('#show-done').addEventListener('click',()=>showToast('Use the round control on each task to mark it complete.'));
setInterval(()=>{renderDeadlines();renderTimeline();updateSummary()},30000);
render();
