(function(){
'use strict';
var $ = function(s,r){return (r||document).querySelector(s);};
var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var desktopMQ = window.matchMedia('(min-width: 901px)');

/* ---------- Theme ---------- */
var htmlEl = document.documentElement;
function setTheme(t){
  htmlEl.setAttribute('data-theme', t);
  var m = document.querySelector('meta[name="theme-color"]'); if(m) m.setAttribute('content', t==='light' ? '#f8f4ea' : '#100c08');
  try{ localStorage.setItem('portfolio-theme', t); }catch(e){}
}
var saved = 'dark'; try{ saved = localStorage.getItem('portfolio-theme') || 'dark'; }catch(e){}
setTheme(saved === 'light' ? 'light' : 'dark');
$('#themeToggle').addEventListener('click', function(){ setTheme(htmlEl.getAttribute('data-theme')==='light' ? 'dark' : 'light'); });

/* ---------- Mobile menu ---------- */
var menu = $('#mobileMenu');
function openMenu(){ menu.classList.add('open'); document.body.style.overflow='hidden'; $('#mobileClose').focus(); }
function closeMenu(){ menu.classList.remove('open'); document.body.style.overflow=''; }
$('#burger').addEventListener('click', openMenu);
$('#mobileClose').addEventListener('click', closeMenu);
$$('a', menu).forEach(function(a){ a.addEventListener('click', closeMenu); });
document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeMenu(); });

/* ---------- Nav state ---------- */
var sections = $$('section[id]'), navA = $$('#navLinks a'), navbar = $('#navbar');
function onScroll(){
  var cur = '';
  sections.forEach(function(s){ if(window.scrollY >= s.offsetTop - 200) cur = s.id; });
  navA.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === '#'+cur); });
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}
window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

/* ---------- Rotating role ---------- */
var roleEl = $('#roleText');
var roles = ['AI Automation Engineer','n8n Workflow Developer','Full-Stack Web Developer','React & Supabase Developer','LLM Integration Specialist'];
var ri = 0;
if(!reduce){
  setInterval(function(){
    roleEl.classList.add('out');
    setTimeout(function(){ ri = (ri+1) % roles.length; roleEl.textContent = roles[ri]; roleEl.classList.remove('out'); }, 420);
  }, 2800);
}

/* ---------- Holographic tilt card (mouse, touch-drag, and idle sway) ---------- */
function initHolo(stageId, cardId, phase){
  var stage = document.getElementById(stageId), card = document.getElementById(cardId);
  if(!stage || !card) return;
  var MAX = 13;
  var cur = {rx:0, ry:0, mx:50, my:30, o:.25}, tgt = {rx:0, ry:0, mx:50, my:30, o:.25};
  var interacting = false, lastInteract = 0, visible = true, raf = 0;
  function aim(px, py){
    px = Math.max(0, Math.min(1, px)); py = Math.max(0, Math.min(1, py));
    tgt.ry = (px - .5) * 2 * MAX; tgt.rx = (.5 - py) * 2 * MAX;
    tgt.mx = px * 100; tgt.my = py * 100; tgt.o = .5;
  }
  function onMove(e){
    var r = stage.getBoundingClientRect();
    interacting = true; lastInteract = performance.now();
    aim((e.clientX - r.left)/r.width, (e.clientY - r.top)/r.height);
  }
  function onLeave(){ lastInteract = performance.now(); interacting = false; }
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerdown', onMove);
  stage.addEventListener('pointerleave', onLeave);
  stage.addEventListener('pointerup', onLeave);
  stage.addEventListener('pointercancel', onLeave);
  function frame(t){
    if(!interacting && t - lastInteract > 700 && !reduce){
      aim(.5 + .30*Math.sin(t/1700 + phase), .42 + .24*Math.cos(t/2100 + phase)); tgt.o = .32;
    } else if(!interacting && reduce){ tgt.rx = 0; tgt.ry = 0; tgt.mx = 50; tgt.my = 30; tgt.o = .25; }
    var k = .1;
    cur.rx += (tgt.rx - cur.rx)*k; cur.ry += (tgt.ry - cur.ry)*k;
    cur.mx += (tgt.mx - cur.mx)*k; cur.my += (tgt.my - cur.my)*k; cur.o += (tgt.o - cur.o)*k;
    card.style.setProperty('--rx', cur.rx.toFixed(2)+'deg');
    card.style.setProperty('--ry', cur.ry.toFixed(2)+'deg');
    card.style.setProperty('--mx', cur.mx.toFixed(1)+'%');
    card.style.setProperty('--my', cur.my.toFixed(1)+'%');
    card.style.setProperty('--o', cur.o.toFixed(3));
    raf = visible ? requestAnimationFrame(frame) : 0;
  }
  new IntersectionObserver(function(en){
    visible = en[0].isIntersecting;
    if(visible && !raf) raf = requestAnimationFrame(frame);
  }, {threshold:0}).observe(stage);
  raf = requestAnimationFrame(frame);
}

/* ---------- Swinging ID badge (hero) — drag to swing, mouse and touch ---------- */
(function(){
  var badge = document.getElementById('idBadge');
  if(!badge) return;
  var dragging = false, startX = 0;
  function down(e){
    dragging = true; badge.classList.add('dragging');
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    badge.style.transition = 'none';
  }
  function move(e){
    if(!dragging) return;
    var x = (e.touches ? e.touches[0].clientX : e.clientX);
    var angle = Math.max(-45, Math.min(45, (x - startX) * 0.4));
    badge.style.transform = 'rotate(' + angle + 'deg)';
  }
  function up(){
    if(!dragging) return;
    dragging = false;
    badge.style.transition = 'transform .6s cubic-bezier(.34,1.56,.64,1)';
    badge.style.transform = 'rotate(0deg)';
    setTimeout(function(){ badge.classList.remove('dragging'); badge.style.transition = ''; badge.style.transform = ''; }, 600);
  }
  badge.addEventListener('mousedown', down);
  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', up);
  badge.addEventListener('touchstart', down, {passive:true});
  window.addEventListener('touchmove', move, {passive:true});
  window.addEventListener('touchend', up);
})();

/* ---------- Mouse-only custom cursor ---------- */
(function(){
  var dot = $('#curDot'), ring = $('#curRing');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var x = -100, y = -100, rx = -100, ry = -100, on = false;
  function enable(){ if(on) return; on = true; htmlEl.classList.add('mouse'); requestAnimationFrame(loop); }
  function disable(){ on = false; htmlEl.classList.remove('mouse'); }
  window.addEventListener('pointermove', function(e){
    if(e.pointerType === 'mouse' && fine.matches){ enable(); x = e.clientX; y = e.clientY; dot.style.left = x+'px'; dot.style.top = y+'px'; }
    else if(e.pointerType === 'touch'){ disable(); }
  }, {passive:true});
  window.addEventListener('touchstart', disable, {passive:true});
  document.addEventListener('mouseover', function(e){
    ring.classList.toggle('hot', !!e.target.closest('a,button,.proj-item,input,textarea'));
  });
  function loop(){ if(!on) return; rx += (x - rx)*.2; ry += (y - ry)*.2; ring.style.left = rx+'px'; ring.style.top = ry+'px'; requestAnimationFrame(loop); }
})();

/* ---------- About rail ---------- */
var about = $('#aboutCopy');
if('IntersectionObserver' in window){
  new IntersectionObserver(function(en,o){ if(en[0].isIntersecting){ about.classList.add('seen'); o.disconnect(); } }, {threshold:.3}).observe(about);
} else { about.classList.add('seen'); }

/* ---------- Skill workflows ---------- */
$$('.flow').forEach(function(flow){
  var nodes = $$('.node', flow), btn = $('.run-btn', flow), label = $('span', btn), timers = [];
  function run(){
    timers.forEach(clearTimeout); timers = [];
    nodes.forEach(function(n){ n.classList.remove('lit'); });
    btn.disabled = true; label.textContent = 'Running…';
    var step = reduce ? 0 : 520;
    nodes.forEach(function(n,i){ timers.push(setTimeout(function(){ n.classList.add('lit'); }, reduce ? 0 : 200 + i*step)); });
    timers.push(setTimeout(function(){ btn.disabled = false; label.textContent = 'Run again'; }, reduce ? 0 : 300 + nodes.length*step));
  }
  btn.addEventListener('click', run);
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(en,o){ if(en[0].isIntersecting){ run(); o.disconnect(); } }, {threshold:.45}).observe(flow);
  } else { nodes.forEach(function(n){ n.classList.add('lit'); }); }
});

/* ---------- Projects ---------- */
var P = [
 {id:'medibook', cat:'web', catLabel:'Web app', name:'MediBook', sub:'Doctor appointment platform',
  title:'MediBook — Doctor Appointment Platform',
  desc:'Full-stack healthcare booking platform for patients, doctors, and admins — built with production-grade security and concurrency, not a CRUD demo.',
  pipe:['Patient books a slot (React + Vite)','Supabase Auth checks the role','Row Level Security guards every table','Atomic Postgres lock prevents double-booking','Encrypted chat delivered in real time'],
  pts:['Row Level Security on every table, plus zero double-bookings via atomic Postgres locking','End-to-end AES-256 encrypted patient-doctor chat, delivered in real time'],
  stack:['React (Vite)','Supabase','PostgreSQL'], url:'https://doctors-ap.netlify.app/login'},
 {id:'wa-agent', cat:'automation', catLabel:'AI agent', name:'AI WhatsApp Business Agent', sub:'Inventory, FAQs and order status by chat',
  title:'AI WhatsApp Business Agent',
  desc:'Conversational WhatsApp agent checking live inventory, answering FAQs, and updating order status via natural language.',
  pipe:['Customer sends a WhatsApp message','n8n receives it through the Cloud API','Gemini decides which tool to call','Live inventory read from Google Sheets','Reply sent, order status updated'],
  pts:['96%+ correct-handling rate across 25-30 real conversations'],
  stack:['n8n','Gemini API','WhatsApp Cloud API','Sheets']},
 {id:'nexus', cat:'web', catLabel:'Web app', name:'Nexus', sub:'End-to-end encrypted real-time chat',
  title:'Nexus — E2EE Real-Time Chat',
  desc:'Zero-knowledge encrypted chat app where messages are unreadable even to database admins — built to solve real privacy gaps in typical chat apps.',
  pipe:['You type a message','AES encryption runs in your browser','Only ciphertext reaches Firestore','Recipient decrypts on their device'],
  pts:['Client-side AES encryption before any message touches the database','Algorithmic private room pairing (sorted UIDs) with scope-bound Firestore security rules'],
  stack:['CryptoJS (AES)','Firebase Auth','Firestore'], url:'https://nexus-encrypted-app.netlify.app/'},
 {id:'email-agent', cat:'automation', catLabel:'AI agent', name:'AI Email Automation Agent', sub:'Classify and draft replies from Gmail',
  title:'AI Email Automation Agent',
  desc:'End-to-end email workflow that sorts incoming mail and drafts a contextual response for each type.',
  pipe:['New email arrives (Gmail trigger)','Gemini classifies it: Orders or Inquiries','A contextual draft reply is written'],
  pts:['Validated at 100% accuracy across 10-12 real scenarios'],
  stack:['n8n','Gemini API','Gmail API']},
 {id:'assistant', cat:'automation', catLabel:'AI agent', name:'AI Personal Assistant', sub:'One agent across Calendar, Gmail and Sheets',
  title:'AI Personal Assistant',
  desc:'Multi-tool reasoning agent that summarizes unread emails or checks tomorrow\'s meetings by reasoning over Calendar, Gmail, and Sheets in one conversation.',
  pipe:['You ask a question in chat','OpenAI agent plans which tools it needs','Calendar, Gmail and Sheets are queried','One combined answer comes back'],
  pts:['Reasons across three tools inside a single conversation'],
  stack:['n8n','OpenAI API','Gmail','Calendar']},
 {id:'inventory', cat:'automation', catLabel:'AI agent', name:'AI Inventory Management Agent', sub:'Stock and pricing updated by chat',
  title:'AI Inventory Management Agent',
  desc:'Natural-language agent reading and updating a Google Sheets inventory backend — stock levels and pricing.',
  pipe:['You type a stock or price request','Gemini turns it into a structured action','Google Sheets is read or updated','Confirmation returns in plain language'],
  pts:['Built entirely on free-tier APIs'],
  stack:['n8n','Gemini','Sheets']},
 {id:'complaints', cat:'web', catLabel:'Web app', name:'University Complaint Portal', sub:'Verified student grievances, live admin dashboard',
  title:'University Complaint Portal',
  desc:'Authenticated grievance-handling platform tying student complaints to verified institutional identities, resolved through a live admin dashboard.',
  pipe:['Student signs in with Google SSO','Admin approves new students (two tiers)','Complaint and evidence saved in Firestore','Status syncs live to the student'],
  pts:['Google SSO restricted to verified university accounts, with two-tier admin approval for new students','Evidence uploads with priority tracking and live status sync (Pending → In Progress → Resolved)'],
  stack:['Firebase Auth','Firestore','Google SSO'], url:'https://uni-complaint.netlify.app/'},
 {id:'trackify', cat:'web', catLabel:'Web app', name:'Trackify', sub:'Real-time courier tracking',
  title:'Trackify — Courier Tracking System',
  desc:'Serverless real-time courier tracking platform replacing manual update delays with instant, listener-driven parcel status streaming.',
  pipe:['Parcel is booked','Firestore listeners stream every status change','Timeline updates: Booked → Picked Up → In Transit → Delivered','Share by QR code or WhatsApp'],
  pts:['Live parcel timeline via Firestore listeners','Dynamic QR code generation, WhatsApp tracking share, and an in-app AI parcel assistant chatbot'],
  stack:['Firebase Firestore','JavaScript ES6+','Web APIs'], url:'https://trackify-courier.netlify.app/'},
 {id:'cafe', cat:'web', catLabel:'Web app', name:'Mini Cafe', sub:'Order management for customers and staff',
  title:'Mini Cafe — Order Management App',
  desc:'Real-time cafe ordering system for customers and staff, with a live digital menu, cart, and an internal dispatch terminal.',
  pipe:['Customer searches the live menu','Cart totals update instantly','Order lands in Firebase Realtime DB','Staff dispatch it from the admin terminal'],
  pts:['Live search/filtering menu with instant cart totals and real-time order status tracking','Admin dispatch terminal with status filtering and one-click receipt printing'],
  stack:['JavaScript ES6','Firebase Realtime DB','CSS3'], url:'https://mini-cafe-app.netlify.app/'},
 {id:'quiz', cat:'web', catLabel:'Web app', name:'AI Quiz Generator', sub:'LLM quizzes with keys kept off the frontend',
  title:'AI Quiz Generator',
  desc:'Dynamic quiz generator that crafts customized quizzes in real time using an LLM, with API keys kept safely off the frontend.',
  pipe:['You choose a topic','A Cloudflare Worker proxies the request','Groq (Llama 3.1) writes fresh questions','The quiz renders in the browser'],
  pts:['Serverless Cloudflare Worker proxies API calls so keys never reach the client','Fast AI text generation for fresh, non-repeating quiz questions on demand'],
  stack:['Groq Llama 3.1','Cloudflare Workers','JavaScript'], url:'https://ai-quiz-system.netlify.app/'},
 {id:'autohub', cat:'university', catLabel:'University', name:'AutoHub', sub:'Car showroom management system',
  title:'AutoHub — Car Showroom Management',
  desc:'Multi-role web platform (Admin, Salesman, Mechanic, Customer) with a role-personalized AI chatbot, 3NF database design, and role-based access control.',
  pipe:['User signs in as one of four roles','PHP + MySQL (3NF schema) serves the data','Role-based access control filters every screen','Role-personalized AI chatbot assists'],
  pts:['Four distinct roles with their own permissions','Normalized 3NF database design'],
  stack:['PHP','MySQL','Bootstrap','XAMPP']},
 {id:'attendance', cat:'university', catLabel:'University', name:'Attendance Management System', sub:'Desktop app for 70 students',
  title:'Attendance Management System',
  desc:'GUI desktop app managing daily attendance for 70 students with bulk actions, automatic weekend skipping, and PDF report generation.',
  pipe:['Teacher marks attendance in the Tkinter GUI','Bulk actions and weekend skipping apply','Records stored in SQLite','ReportLab exports a PDF report'],
  pts:['Manages daily attendance for 70 students','Bulk actions, automatic weekend skipping, PDF reports'],
  stack:['Python','Tkinter','SQLite','ReportLab']}
];
var filter = 'all', activeId = P[0].id, openId = null;
var listEl = $('#projList'), panelEl = $('#projPanel');

function detail(p){
  var pipe = p.pipe.map(function(s){return '<li>'+s+'</li>';}).join('');
  var pts = p.pts.map(function(s){return '<li>'+s+'</li>';}).join('');
  var chips = p.stack.map(function(s){return '<span>'+s+'</span>';}).join('');
  var link = p.url ? '<a class="btn btn-primary btn-sm" href="'+p.url+'" target="_blank" rel="noopener">Live demo <svg class="i"><use href="#i-out"/></svg></a>' : '';
  return '<div class="pd"><h3>'+p.title+'</h3><p class="pd-desc">'+p.desc+'</p>'+
    '<span class="pd-label">How it works</span><ol class="pipe">'+pipe+'</ol>'+
    '<ul class="pd-points">'+pts+'</ul><div class="chips">'+chips+'</div>'+link+'</div>';
}
function visibleProjects(){ return P.filter(function(p){ return filter==='all' || p.cat===filter; }); }
function renderList(){
  var vis = visibleProjects();
  if(!vis.some(function(p){return p.id===activeId;})) activeId = vis[0].id;
  if(openId && !vis.some(function(p){return p.id===openId;})) openId = null;
  listEl.innerHTML = vis.map(function(p){
    var act = p.id===activeId, open = p.id===openId;
    return '<li class="proj-li'+(act?' active':'')+(open?' open':'')+'" data-id="'+p.id+'">'+
      '<button type="button" class="proj-item" aria-expanded="'+(desktopMQ.matches?act:open)+'" aria-controls="inl-'+p.id+'">'+
      '<span class="pi-main"><span class="pi-title">'+p.name+'</span><span class="pi-sub">'+p.sub+'</span></span>'+
      '<span class="pi-cat">'+p.catLabel+'</span><svg class="i pi-chev"><use href="#i-plus"/></svg></button>'+
      '<div class="proj-inline" id="inl-'+p.id+'"'+(open?'':' hidden')+'>'+(open?detail(p):'')+'</div></li>';
  }).join('');
  renderPanel();
}
function renderPanel(){
  var p = P.filter(function(x){return x.id===activeId;})[0];
  panelEl.innerHTML = detail(p);
}
listEl.addEventListener('click', function(e){
  var btn = e.target.closest('.proj-item'); if(!btn) return;
  var li = btn.parentNode, id = li.getAttribute('data-id');
  if(desktopMQ.matches){
    if(id === activeId) return;
    activeId = id;
    $$('.proj-li', listEl).forEach(function(x){ var a = x.getAttribute('data-id')===id; x.classList.toggle('active', a); $('.proj-item', x).setAttribute('aria-expanded', a); });
    renderPanel();
  } else {
    var willOpen = openId !== id;
    openId = willOpen ? id : null; activeId = id;
    $$('.proj-li', listEl).forEach(function(x){
      var xid = x.getAttribute('data-id'), o = (xid === openId), inl = $('.proj-inline', x);
      x.classList.toggle('open', o); x.classList.toggle('active', xid===activeId);
      $('.proj-item', x).setAttribute('aria-expanded', o);
      if(o){ inl.hidden = false; inl.innerHTML = detail(P.filter(function(p){return p.id===xid;})[0]); } else { inl.hidden = true; inl.innerHTML = ''; }
    });
    renderPanel();
  }
});
$$('.filter-btn').forEach(function(b){
  b.addEventListener('click', function(){
    $$('.filter-btn').forEach(function(x){ x.setAttribute('aria-selected', x===b); });
    filter = b.getAttribute('data-filter'); renderList();
  });
});
renderList();

/* ---------- Contact form (EmailJS, with mailto fallback) ---------- */
var form = $('#contactForm'), note = $('#formMsg'), sendBtn = $('#submitBtn');
function say(cls, msg){ note.className = 'form-note '+cls; note.textContent = msg; }
try{ if(window.emailjs) emailjs.init('uWA6OYbOCk-wh3uv_'); }catch(e){}
form.addEventListener('submit', function(ev){
  ev.preventDefault();
  var name = $('#fname').value.trim(), email = $('#femail').value.trim(), subject = $('#fsubject').value.trim() || 'No subject', message = $('#fmessage').value.trim();
  if(!name || !email || !message || !/^\S+@\S+\.\S+$/.test(email)){ say('err', 'Please fill in your name, a valid email, and a message.'); return; }
  sendBtn.disabled = true; sendBtn.textContent = 'Sending…'; note.className = 'form-note';
  function fallback(){
    var body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
    say('err', 'Could not send from here. Opening your email app instead.');
    window.location.href = 'mailto:adan.mudassar07@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + body;
  }
  if(!window.emailjs){ fallback(); sendBtn.disabled = false; sendBtn.textContent = 'Send message'; return; }
  emailjs.send('service_3v8sk2e','template_4do8eks',{from_name:name, from_email:email, subject:subject, message:message})
    .then(function(){ say('ok', 'Message sent! I\'ll get back to you soon.'); form.reset(); })
    .catch(function(){ fallback(); })
    .then(function(){ sendBtn.disabled = false; sendBtn.textContent = 'Send message'; });
});

/* ---------- Resume download notification (EmailJS) ---------- */
var dl = $('#downloadResumeBtn');
if(dl){
  dl.addEventListener('click', function(){
    if(!window.emailjs) return;
    var ua = navigator.userAgent;
    var device = /Mobi|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop';
    var browser = ua.indexOf('Edg')>-1 ? 'Edge' : ua.indexOf('Chrome')>-1 ? 'Chrome' : ua.indexOf('Safari')>-1 ? 'Safari' : ua.indexOf('Firefox')>-1 ? 'Firefox' : 'Unknown';
    var time = new Date().toLocaleString('en-US',{dateStyle:'medium', timeStyle:'short'});
    var referrer = document.referrer || 'Direct visit';
    function notify(location){ emailjs.send('service_3v8sk2e','template_q3y8oic',{time:time, device:device, browser:browser, location:location, referrer:referrer}).catch(function(){}); }
    fetch('https://ipapi.co/json/').then(function(r){return r.json();}).then(function(d){
      notify((d.city ? d.city+', ' : '') + (d.country_name || 'Unknown location'));
    }).catch(function(){ notify('Location unavailable'); });
  });
}
})();

/* ---------- Email buttons: open Gmail compose on desktop (mailto does nothing without a mail app), mailto on phones ---------- */
(function(){
  var TO='adan.mudassar07@gmail.com';
  var isMobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (window.matchMedia && matchMedia('(pointer:coarse)').matches);
  document.querySelectorAll('a[href^="mailto:"]').forEach(function(a){
    a.addEventListener('click', function(e){
      if(isMobile) return;
      e.preventDefault();
      var w=window.open('https://mail.google.com/mail/?view=cm&fs=1&to='+encodeURIComponent(TO),'_blank','noopener');
      if(!w){ window.location.href='mailto:'+TO; }
    });
  });
})();
