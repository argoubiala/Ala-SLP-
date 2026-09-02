const decks = {
  articulation: [
    {
      title:"/SH/ Initial Position",
      description:"Identify the /sh/ sound at the beginning of words.",
      cards:[
        {picture:"👟",question:"What sound does “shoe” start with?",answers:["/s/","/sh/","/f/"],correct:1},
        {picture:"🦈",question:"What sound does “shark” start with?",answers:["/k/","/sh/","/s/"],correct:1},
        {picture:"🐑",question:"What sound does “sheep” start with?",answers:["/sh/","/t/","/p/"],correct:0},
        {picture:"🚢",question:"What sound does “ship” start with?",answers:["/s/","/ch/","/sh/"],correct:2},
        {picture:"🧴",question:"What sound does “shampoo” start with?",answers:["/m/","/sh/","/s/"],correct:1}
      ]
    },
    {
      title:"/K/ Initial Position",
      description:"Practice identifying the /k/ sound.",
      cards:[
        {picture:"🐱",question:"What sound does “cat” start with?",answers:["/t/","/k/","/g/"],correct:1},
        {picture:"🪁",question:"What sound does “kite” start with?",answers:["/k/","/s/","/t/"],correct:0},
        {picture:"🚗",question:"What sound does “car” start with?",answers:["/p/","/g/","/k/"],correct:2}
      ]
    }
  ],
  phonology: [
    {
      title:"Initial Sounds",
      description:"Choose the first sound you hear.",
      cards:[
        {picture:"🍎",question:"What is the first sound in “apple”?",answers:["/a/","/p/","/l/"],correct:0},
        {picture:"🐟",question:"What is the first sound in “fish”?",answers:["/f/","/sh/","/s/"],correct:0},
        {picture:"🐶",question:"What is the first sound in “dog”?",answers:["/b/","/d/","/g/"],correct:1}
      ]
    }
  ],
  language: [
    {
      title:"Categories",
      description:"Choose the item that belongs with the group.",
      cards:[
        {picture:"🍎",question:"Which one is a fruit?",answers:["Apple","Chair","Shoe"],correct:0},
        {picture:"🐕",question:"Which one is an animal?",answers:["Dog","Table","Banana"],correct:0},
        {picture:"🚗",question:"Which one is a vehicle?",answers:["Car","Apple","Cat"],correct:0}
      ]
    }
  ],
  literacy: [
    {
      title:"Letter Sounds",
      description:"Match the letter to its sound.",
      cards:[
        {picture:"A",question:"What sound does the letter A make here?",answers:["/m/","/a/","/s/"],correct:1},
        {picture:"M",question:"What sound does the letter M make?",answers:["/m/","/t/","/k/"],correct:0},
        {picture:"S",question:"What sound does the letter S make?",answers:["/p/","/s/","/b/"],correct:1}
      ]
    }
  ],
  cognitive: [
    {
      title:"Memory & Attention",
      description:"Choose the item that matches the prompt.",
      cards:[
        {picture:"🔴",question:"Which color is shown?",answers:["Blue","Red","Green"],correct:1},
        {picture:"⭐",question:"What is shown?",answers:["Circle","Star","Square"],correct:1},
        {picture:"🍌",question:"What is shown?",answers:["Banana","Apple","Pear"],correct:0}
      ]
    }
  ],
  aac: [
    {
      title:"Everyday Requests",
      description:"Practice recognizing useful communication choices.",
      cards:[
        {picture:"💧",question:"Which symbol means “drink”?",answers:["💧 Drink","🍎 Eat","🛏️ Sleep"],correct:0},
        {picture:"🍎",question:"Which symbol means “eat”?",answers:["💧 Drink","🍎 Eat","🚽 Toilet"],correct:1},
        {picture:"🚽",question:"Which symbol means “toilet”?",answers:["🚽 Toilet","🛏️ Sleep","🎮 Play"],correct:0}
      ]
    }
  ]
};

const categoryInfo = {
  articulation:{emoji:"🗣️",name:"Articulation",desc:"Speech sound practice",color:"#5B5FEF"},
  phonology:{emoji:"🔤",name:"Phonological Awareness",desc:"Sounds, syllables & rhyming",color:"#22A6B3"},
  language:{emoji:"📚",name:"Language",desc:"Vocabulary, concepts & sentences",color:"#F6A623"},
  literacy:{emoji:"📖",name:"Literacy",desc:"Reading, letters & spelling",color:"#8E5CF7"},
  cognitive:{emoji:"🧠",name:"Cognitive",desc:"Memory, attention & thinking",color:"#2FAE66"},
  aac:{emoji:"🧩",name:"AAC",desc:"Functional communication practice",color:"#FF7A59"}
};

/* ================= Supabase client & auth state ================= */

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const MEDIA_BUCKET = "media";

let currentUser = null;
let authMode = "signin"; // "signin" | "signup"

let currentCategory="", currentCategoryDecks=[], currentDeckIndex=0, currentDeck=null, currentIndex=0, score=0, answered=false, uidCounter=0;
let pendingMedia={};
let activeObjectUrls=[];

const THEME_KEY = "alaSlpTheme";
const MAX_MEDIA_BYTES = 8*1024*1024; // 8MB per file

function escapeAttr(s){
  return (s===undefined||s===null?"":String(s)).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
}

/* ================= Auth ================= */

function initAuth(){
  sb.auth.getSession().then(({data})=>{
    currentUser = data.session ? data.session.user : null;
    boot();
  });
  sb.auth.onAuthStateChange((_event, session)=>{
    currentUser = session ? session.user : null;
    boot();
  });
}
function boot(){
  updateHeader();
  if(currentUser) showHome(); else showAuthScreen();
}
function updateHeader(){
  const emailEl=document.getElementById("userEmail");
  const logoutBtn=document.getElementById("logoutBtn");
  if(!emailEl||!logoutBtn) return;
  if(currentUser){
    emailEl.textContent=currentUser.email||"";
    logoutBtn.style.display="";
  } else {
    emailEl.textContent="";
    logoutBtn.style.display="none";
  }
}
async function handleLogout(){
  await sb.auth.signOut();
}

function showAuthScreen(){
  document.getElementById("app").innerHTML=`
  <div class="container auth-screen">
    <div class="auth-card">
      <h1>${authMode==="signup"?"Create your account":"Welcome back"}</h1>
      <p class="muted">${authMode==="signup"?"Set up a free account to save and sync your decks.":"Sign in to access your decks."}</p>
      <div id="authError" class="auth-error"></div>
      <label>Email</label>
      <input type="email" id="authEmail" placeholder="you@example.com" autocomplete="email">
      <label>Password</label>
      <input type="password" id="authPassword" placeholder="At least 6 characters" autocomplete="${authMode==="signup"?"new-password":"current-password"}">
      <button type="button" class="play auth-submit" id="authSubmitBtn" onclick="handleAuthSubmit()">${authMode==="signup"?"Sign up":"Sign in"}</button>
      <p class="muted auth-switch">
        ${authMode==="signup"
          ? `Already have an account? <a href="#" onclick="switchAuthMode('signin');return false;">Sign in</a>`
          : `New here? <a href="#" onclick="switchAuthMode('signup');return false;">Create an account</a>`}
      </p>
    </div>
  </div>`;
}
function switchAuthMode(mode){ authMode=mode; showAuthScreen(); }
async function handleAuthSubmit(){
  const email=document.getElementById("authEmail").value.trim();
  const password=document.getElementById("authPassword").value;
  const errEl=document.getElementById("authError");
  errEl.textContent="";
  if(!email || !password){ errEl.textContent="Please enter an email and password."; return; }

  const btn=document.getElementById("authSubmitBtn");
  btn.disabled=true; btn.textContent="Please wait…";
  try{
    const {error} = authMode==="signup"
      ? await sb.auth.signUp({email,password})
      : await sb.auth.signInWithPassword({email,password});
    if(error){
      errEl.textContent=error.message;
    } else if(authMode==="signup"){
      errEl.textContent="Account created! If email confirmation is required, check your inbox, then sign in.";
    }
    // A successful sign-in fires onAuthStateChange, which calls boot() for us.
  }catch(e){
    errEl.textContent="Something went wrong reaching the server. Please try again.";
  } finally {
    btn.disabled=false; btn.textContent=authMode==="signup"?"Sign up":"Sign in";
  }
}

/* ================= Decks (Postgres via Supabase) ================= */

async function fetchCustomDecks(){
  try{
    const {data,error} = await sb.from("decks").select("*").order("created_at",{ascending:true});
    if(error){ console.error(error); alert("Couldn't load your decks: "+error.message); return []; }
    return data.map(d=>({
      id:d.id, category:d.category, title:d.title, description:d.description||"",
      cards:d.cards||[], custom:true
    }));
  }catch(e){ console.error(e); alert("Couldn't reach the server to load your decks."); return []; }
}
async function fetchCustomDeckById(id){
  try{
    const {data,error} = await sb.from("decks").select("*").eq("id",id).single();
    if(error||!data) return null;
    return {id:data.id, category:data.category, title:data.title, description:data.description||"", cards:data.cards||[], custom:true};
  }catch(e){ return null; }
}
async function getDecksForCategory(cat){
  const builtIn=(decks[cat]||[]).map(d=>({...d,custom:false}));
  const all=await fetchCustomDecks();
  const custom=all.filter(d=>d.category===cat);
  return [...builtIn,...custom];
}

/* ================= Media (Supabase Storage) ================= */

function mediaPathFor(filename){
  const ext=(filename.split(".").pop()||"bin").toLowerCase().replace(/[^a-z0-9]/g,"")||"bin";
  const rand=Math.random().toString(36).slice(2,9);
  return `${currentUser.id}/${Date.now()}_${rand}.${ext}`;
}
async function uploadMediaFile(file){
  const path=mediaPathFor(file.name||"upload");
  const {error}=await sb.storage.from(MEDIA_BUCKET).upload(path, file, {upsert:false, contentType:file.type||undefined});
  if(error) throw error;
  return path;
}
async function deleteMediaFile(path){
  if(!path) return;
  try{ await sb.storage.from(MEDIA_BUCKET).remove([path]); }catch(e){ console.error(e); }
}
async function getSignedMediaUrl(path){
  if(!path) return null;
  try{
    const {data,error}=await sb.storage.from(MEDIA_BUCKET).createSignedUrl(path, 3600);
    if(error){ console.error(error); return null; }
    return data.signedUrl;
  }catch(e){ return null; }
}
function trackObjectUrl(url){ activeObjectUrls.push(url); return url; }
function revokeTrackedObjectUrls(){ activeObjectUrls.forEach(u=>URL.revokeObjectURL(u)); activeObjectUrls=[]; }

function blobToDataURL(blob){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>resolve(r.result);
    r.onerror=()=>reject(r.error);
    r.readAsDataURL(blob);
  });
}
function dataURLToBlob(dataURL){
  const [header, b64] = dataURL.split(",");
  const mime=(header.match(/data:(.*?);base64/)||[])[1] || "application/octet-stream";
  const bin=atob(b64);
  const arr=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i);
  return new Blob([arr],{type:mime});
}

/* ================= Theme (customizable colors — stays on-device) ================= */

const DEFAULT_THEME = { primary:"#5B5FEF", accent:"#FF7A59", bg:"#F6F5FB" };

function loadTheme(){
  try{ return {...DEFAULT_THEME, ...JSON.parse(localStorage.getItem(THEME_KEY)||"{}")}; }
  catch(e){ return {...DEFAULT_THEME}; }
}
function saveTheme(theme){
  try{ localStorage.setItem(THEME_KEY, JSON.stringify(theme)); }catch(e){}
}
function shadeColor(hex, percent){
  const num=parseInt(hex.replace("#",""),16);
  let r=(num>>16)+Math.round(2.55*percent);
  let g=((num>>8)&0xff)+Math.round(2.55*percent);
  let b=(num&0xff)+Math.round(2.55*percent);
  r=Math.min(255,Math.max(0,r)); g=Math.min(255,Math.max(0,g)); b=Math.min(255,Math.max(0,b));
  return "#"+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}
function applyTheme(theme){
  const root=document.documentElement.style;
  root.setProperty("--color-primary", theme.primary);
  root.setProperty("--color-primary-dark", shadeColor(theme.primary,-16));
  root.setProperty("--color-primary-light", shadeColor(theme.primary,42));
  root.setProperty("--color-accent", theme.accent);
  root.setProperty("--color-accent-dark", shadeColor(theme.accent,-16));
  root.setProperty("--color-bg", theme.bg);
}
function showThemePanel(){
  const theme=loadTheme();
  document.body.insertAdjacentHTML("beforeend", `
  <div class="modal-backdrop" id="themeBackdrop" onmousedown="if(event.target===this) closeThemePanel()">
    <div class="modal">
      <h2>Customize colors</h2>
      <p class="muted">Changes preview instantly and save automatically on this device.</p>
      <label>Primary color <span class="muted">(buttons, headings, progress)</span></label>
      <input type="color" id="themePrimary" value="${theme.primary}" oninput="previewTheme()">
      <label>Accent color <span class="muted">(highlights & decoration)</span></label>
      <input type="color" id="themeAccent" value="${theme.accent}" oninput="previewTheme()">
      <label>Background tint</label>
      <input type="color" id="themeBg" value="${theme.bg}" oninput="previewTheme()">
      <div class="modal-actions">
        <button type="button" class="secondary-btn" onclick="resetTheme()">Reset to default</button>
        <button type="button" class="play" onclick="closeThemePanel()">Done</button>
      </div>
    </div>
  </div>`);
}
function previewTheme(){
  const theme={
    primary:document.getElementById("themePrimary").value,
    accent:document.getElementById("themeAccent").value,
    bg:document.getElementById("themeBg").value
  };
  applyTheme(theme);
  saveTheme(theme);
}
function resetTheme(){
  applyTheme(DEFAULT_THEME);
  saveTheme(DEFAULT_THEME);
  const p=document.getElementById("themePrimary"), a=document.getElementById("themeAccent"), b=document.getElementById("themeBg");
  if(p) p.value=DEFAULT_THEME.primary;
  if(a) a.value=DEFAULT_THEME.accent;
  if(b) b.value=DEFAULT_THEME.bg;
}
function closeThemePanel(){
  const el=document.getElementById("themeBackdrop");
  if(el) el.remove();
}

/* ================= Screens ================= */

function showHome(){
  document.getElementById("app").innerHTML=`
  <div class="container">
    <section class="hero">
      <h1>Ala SLP Activities</h1>
      <p>Interactive therapy activities — simple, visual and child-friendly.</p>
    </section>
    <h2 class="section-title">Choose a category</h2>
    <div class="categories">
      ${Object.entries(categoryInfo).map(([key,v])=>`
        <div class="category" style="--cat-color:${v.color}" onclick="showCategory('${key}')">
          <div class="emoji">${v.emoji}</div><h3>${v.name}</h3><p>${v.desc}</p>
        </div>`).join("")}
    </div>
    <div class="home-actions">
      <button class="create-deck-btn" onclick="showDeckCreator()">+ Create a New Deck</button>
      <button class="secondary-btn" onclick="exportDecks()">⬇ Export My Decks</button>
      <label class="secondary-btn file-label">⬆ Import Decks
        <input type="file" accept=".json,application/json" style="display:none" onchange="importDecks(event)">
      </label>
    </div>
  </div>`;
}

async function showCategory(cat){
  currentCategory=cat;
  document.getElementById("app").innerHTML=`<div class="container"><p class="muted loading-text">Loading decks…</p></div>`;
  currentCategoryDecks=await getDecksForCategory(cat);
  const info=categoryInfo[cat];
  document.getElementById("app").innerHTML=`
  <div class="container" style="--cat-color:${info.color}">
    <button class="back" onclick="showHome()">← Back</button>
    <h1>${info.emoji} ${info.name}</h1><p class="muted">${info.desc}</p>
    <div class="deck-list">
      ${currentCategoryDecks.map((d,i)=>`
        <div class="deck">
          ${d.custom?`<span class="badge">Your deck</span>`:""}
          <h3>${d.title}</h3><p>${d.description||""}<br><span class="muted">${d.cards.length} cards</span></p>
          <div class="deck-actions">
            <button class="play" onclick="startDeck(${i})">Play →</button>
            ${d.custom?`<button class="edit" onclick="showDeckCreator(null,'${d.id}')">Edit</button><button class="delete" onclick="deleteDeckAt(${i})">Delete</button>`:""}
          </div>
        </div>`).join("")}
    </div>
    <button class="create-deck-btn" onclick="showDeckCreator('${cat}')">+ Create a Deck in this Category</button>
  </div>`;
}

function startDeck(i){
  currentDeckIndex=i; currentDeck=currentCategoryDecks[i]; currentIndex=0; score=0; showCard();
}

async function deleteDeckAt(i){
  const d=currentCategoryDecks[i];
  if(!d || !d.custom) return;
  if(!confirm(`Delete "${d.title}"? This can't be undone.`)) return;
  for(const c of d.cards){
    if(c.imagePath) await deleteMediaFile(c.imagePath);
    if(c.soundPath) await deleteMediaFile(c.soundPath);
  }
  const {error}=await sb.from("decks").delete().eq("id", d.id);
  if(error){ alert("Couldn't delete that deck: "+error.message); return; }
  showCategory(currentCategory);
}

function showCard(){
  answered=false;
  revokeTrackedObjectUrls();
  const c=currentDeck.cards[currentIndex], total=currentDeck.cards.length;
  const dots = Array.from({length:total}).map((_,i)=>
    `<span class="dot ${i<currentIndex?'done':''} ${i===currentIndex?'active':''}"></span>`).join("");
  document.getElementById("app").innerHTML=`
  <div class="game">
    <button class="back" onclick="showCategory('${currentCategory}')">← Back to decks</button>
    <div class="game-meta">
      <span class="muted">Card ${currentIndex+1} of ${total}</span>
      <span class="score-pill">Score ${score}</span>
    </div>
    <div class="progress-dots">${dots}</div>
    <div class="card">
      <div class="picture" id="cardMedia">${c.imagePath?"":(c.picture||"❓")}</div>
      ${c.soundPath?`<button type="button" class="sound-btn" onclick="playCardSound()">🔊 Play sound</button>`:""}
      <div class="question">${c.question}</div>
      <div class="answers">
        ${c.answers.map((a,i)=>`<button class="answer" onclick="chooseAnswer(${i})"><span class="answer-badge">${String.fromCharCode(65+i)}</span>${a}</button>`).join("")}
      </div>
      <div class="feedback" id="feedback"></div>
      <button class="next" id="next" onclick="nextCard()" disabled>${currentIndex===total-1?"Finish":"Next →"}</button>
    </div>
  </div>`;
  if(c.imagePath){
    getSignedMediaUrl(c.imagePath).then(url=>{
      if(!url) return;
      const el=document.getElementById("cardMedia");
      if(el) el.innerHTML=`<img src="${url}" alt="" class="card-img">`;
    });
  }
}
function playCardSound(){
  const c=currentDeck.cards[currentIndex];
  if(!c || !c.soundPath) return;
  getSignedMediaUrl(c.soundPath).then(url=>{
    if(!url) return;
    new Audio(url).play().catch(()=>{});
  });
}
function chooseAnswer(i){
  if(answered)return;
  answered=true;
  const c=currentDeck.cards[currentIndex];
  const buttons=document.querySelectorAll(".answer");
  buttons.forEach((b,n)=>{b.disabled=true;if(n===c.correct)b.classList.add("correct");});
  const f=document.getElementById("feedback");
  if(i===c.correct){score++;f.textContent="🎉 Great job!";}else{buttons[i].classList.add("wrong");f.textContent="Not quite — try the next one!";}
  document.getElementById("next").disabled=false;
  const scorePill=document.querySelector(".score-pill");
  if(scorePill) scorePill.textContent=`Score ${score}`;
}
function nextCard(){
  if(currentIndex<currentDeck.cards.length-1){currentIndex++;showCard();}
  else showResult();
}
function showResult(){
  revokeTrackedObjectUrls();
  const total=currentDeck.cards.length, pct=Math.round(score/total*100);
  document.getElementById("app").innerHTML=`
  <div class="container"><div class="result">
    <div class="result-emoji">${pct>=80?"🎉":"👏"}</div>
    <h1>Finished!</h1>
    <div class="score">${score} / ${total}</div>
    <p class="muted">${pct}% correct</p>
    <button class="restart" onclick="startDeck(${currentDeckIndex})">Play Again</button>
    <button class="home-btn" style="margin-left:8px" onclick="showCategory('${currentCategory}')">Choose Deck</button>
  </div></div>`;
}

/* ================= Deck Creator ================= */

function answerRowHTML(uid, value, checked){
  return `<div class="cr-answer-row">
    <input type="radio" name="correct-${uid}" class="cr-correct" ${checked?"checked":""}>
    <input type="text" class="cr-answer" placeholder="Answer text" value="${escapeAttr(value)}">
    <button type="button" class="remove-answer" onclick="removeAnswerRow(this)" title="Remove answer">✕</button>
  </div>`;
}
function cardRowHTML(uid, card){
  card = card || {picture:"",question:"",answers:["",""],correct:0,imagePath:null,soundPath:null};
  const answers = card.answers && card.answers.length ? card.answers : ["",""];
  return `<div class="card-row" data-uid="${uid}">
    <div class="card-row-head"><strong>Card</strong><button type="button" class="remove-card" onclick="this.closest('.card-row').remove()">✕ Remove card</button></div>

    <label>Picture</label>
    <div class="media-row">
      <div class="media-upload">
        <input type="file" accept="image/*" id="imgInput-${uid}" style="display:none" onchange="handleMediaFile('${uid}','image',this)">
        <button type="button" class="upload-btn" onclick="document.getElementById('imgInput-${uid}').click()">🖼️ Upload image</button>
        <div class="media-preview" id="imgPreview-${uid}"></div>
      </div>
      <div class="media-upload">
        <input type="file" accept="audio/*" id="sndInput-${uid}" style="display:none" onchange="handleMediaFile('${uid}','sound',this)">
        <button type="button" class="upload-btn" onclick="document.getElementById('sndInput-${uid}').click()">🔊 Upload sound</button>
        <div class="media-preview" id="sndPreview-${uid}"></div>
      </div>
    </div>
    <label>Emoji / fallback picture <span class="muted">(shown when no image is uploaded)</span></label>
    <input type="text" class="cr-picture" placeholder="e.g. 🐶" value="${escapeAttr(card.picture)}">

    <label>Question</label>
    <input type="text" class="cr-question" placeholder="What sound does…?" value="${escapeAttr(card.question)}">
    <label>Answers <span class="muted">(select the correct one)</span></label>
    <div class="cr-answers">
      ${answers.map((a,i)=>answerRowHTML(uid,a,i===card.correct)).join("")}
    </div>
    <button type="button" class="add-answer" onclick="addAnswerRow('${uid}')">+ Add answer choice</button>
  </div>`;
}
function initCardMediaState(uid, card){
  pendingMedia[uid] = {
    imagePath: (card && card.imagePath) || null,
    soundPath: (card && card.soundPath) || null,
    imageFile:null, soundFile:null, imageRemoved:false, soundRemoved:false
  };
  if(card && card.imagePath){ getSignedMediaUrl(card.imagePath).then(url=>{ if(url) renderMediaPreview(uid,"image",url); }); }
  if(card && card.soundPath){ getSignedMediaUrl(card.soundPath).then(url=>{ if(url) renderMediaPreview(uid,"sound",url); }); }
}
function addCardRow(card){
  const uid = "c"+(uidCounter++);
  document.getElementById("cardsBuilder").insertAdjacentHTML("beforeend", cardRowHTML(uid, card));
  initCardMediaState(uid, card);
}
function addAnswerRow(uid){
  const wrap = document.querySelector(`.card-row[data-uid="${uid}"] .cr-answers`);
  wrap.insertAdjacentHTML("beforeend", answerRowHTML(uid,"",false));
}
function removeAnswerRow(btn){
  const wrap = btn.closest(".cr-answers");
  if(wrap.querySelectorAll(".cr-answer-row").length<=2){alert("Each card needs at least 2 answers.");return;}
  btn.closest(".cr-answer-row").remove();
}
function handleMediaFile(uid, kind, input){
  const file = input.files[0];
  if(!file) return;
  if(file.size > MAX_MEDIA_BYTES){
    alert("That file is a bit large — please choose one under 8MB.");
    input.value="";
    return;
  }
  pendingMedia[uid] = pendingMedia[uid] || {};
  pendingMedia[uid][kind+"File"] = file;
  pendingMedia[uid][kind+"Removed"] = false;
  renderMediaPreview(uid, kind, file);
}
function renderMediaPreview(uid, kind, source){
  const el = document.getElementById((kind==="image"?"imgPreview-":"sndPreview-")+uid);
  if(!el) return;
  if(!source){ el.innerHTML=""; return; }
  const url = (source instanceof Blob) ? trackObjectUrl(URL.createObjectURL(source)) : source;
  if(kind==="image"){
    el.innerHTML = `<img src="${url}" class="media-thumb" alt=""><button type="button" class="remove-media" onclick="clearMedia('${uid}','image')">✕</button>`;
  } else {
    el.innerHTML = `<audio controls src="${url}" class="media-audio"></audio><button type="button" class="remove-media" onclick="clearMedia('${uid}','sound')">✕</button>`;
  }
}
function clearMedia(uid, kind){
  pendingMedia[uid] = pendingMedia[uid] || {};
  pendingMedia[uid][kind+"File"] = null;
  pendingMedia[uid][kind+"Removed"] = true;
  renderMediaPreview(uid, kind, null);
  const input = document.getElementById((kind==="image"?"imgInput-":"sndInput-")+uid);
  if(input) input.value="";
}

async function showDeckCreator(prefillCategory, editId){
  pendingMedia={};
  document.getElementById("app").innerHTML=`<div class="container"><p class="muted loading-text">Loading…</p></div>`;
  const editingDeck = editId ? await fetchCustomDeckById(editId) : null;
  const backAction = editingDeck ? `showCategory('${editingDeck.category}')` : (prefillCategory ? `showCategory('${prefillCategory}')` : `showHome()`);
  const selectedCat = editingDeck ? editingDeck.category : (prefillCategory || Object.keys(categoryInfo)[0]);
  const catOptions = Object.entries(categoryInfo).map(([k,v])=>
    `<option value="${k}" ${selectedCat===k?"selected":""}>${v.emoji} ${v.name}</option>`).join("");
  const cardsSource = editingDeck ? editingDeck.cards : [null];
  const uids = cardsSource.map(()=>"c"+(uidCounter++));

  document.getElementById("app").innerHTML=`
  <div class="container creator">
    <button class="back" onclick="${backAction}">← Back</button>
    <h1>${editingDeck?"Edit Deck":"Create a New Deck"}</h1>
    <p class="muted">Add your own pictures, sounds, questions and answers — no coding needed.</p>
    <input type="hidden" id="deckEditId" value="${editingDeck?editingDeck.id:""}">
    <label>Category</label>
    <select id="deckCategory">${catOptions}</select>
    <label>Deck title</label>
    <input type="text" id="deckTitle" placeholder="e.g. /R/ Initial Position" value="${editingDeck?escapeAttr(editingDeck.title):""}">
    <label>Description</label>
    <input type="text" id="deckDescription" placeholder="Short description shown in the deck list" value="${editingDeck?escapeAttr(editingDeck.description):""}">
    <h2 class="section-title">Cards</h2>
    <div id="cardsBuilder">${cardsSource.map((c,idx)=>cardRowHTML(uids[idx], c)).join("")}</div>
    <button type="button" class="add-card" onclick="addCardRow()">+ Add another card</button>
    <div class="creator-actions">
      <button type="button" class="play" id="saveDeckBtn" onclick="saveDeckFromForm()">💾 Save Deck</button>
      <button type="button" class="back" onclick="${backAction}">Cancel</button>
    </div>
  </div>`;
  cardsSource.forEach((c,idx)=>initCardMediaState(uids[idx], c));
}

async function saveDeckFromForm(){
  const category = document.getElementById("deckCategory").value;
  const title = document.getElementById("deckTitle").value.trim();
  const description = document.getElementById("deckDescription").value.trim();
  const editId = document.getElementById("deckEditId").value;
  if(!title){ alert("Please give the deck a title."); return; }

  const cardRows = document.querySelectorAll("#cardsBuilder .card-row");
  if(cardRows.length===0){ alert("Add at least one card."); return; }

  const saveBtn = document.getElementById("saveDeckBtn");
  if(saveBtn){ saveBtn.disabled=true; saveBtn.textContent="Saving…"; }

  try{
    const cards=[];
    for(const row of cardRows){
      const uid = row.dataset.uid;
      const picture = row.querySelector(".cr-picture").value.trim();
      const question = row.querySelector(".cr-question").value.trim();
      const answers=[]; let correct=-1;
      row.querySelectorAll(".cr-answer-row").forEach(ar=>{
        const val = ar.querySelector(".cr-answer").value.trim();
        if(val){
          if(ar.querySelector(".cr-correct").checked) correct = answers.length;
          answers.push(val);
        }
      });
      if(!question || answers.length<2 || correct===-1){
        alert("Every card needs a question, at least 2 filled-in answers, and one marked correct.");
        return;
      }

      const pm = pendingMedia[uid] || {};
      let imagePath = pm.imagePath || null;
      let soundPath = pm.soundPath || null;

      if(pm.imageFile){
        if(imagePath) await deleteMediaFile(imagePath);
        imagePath = await uploadMediaFile(pm.imageFile);
      } else if(pm.imageRemoved){
        if(imagePath) await deleteMediaFile(imagePath);
        imagePath = null;
      }
      if(pm.soundFile){
        if(soundPath) await deleteMediaFile(soundPath);
        soundPath = await uploadMediaFile(pm.soundFile);
      } else if(pm.soundRemoved){
        if(soundPath) await deleteMediaFile(soundPath);
        soundPath = null;
      }

      cards.push({picture: picture||"❓", question, answers, correct, imagePath, soundPath});
    }

    if(editId){
      const {error} = await sb.from("decks").update({category,title,description,cards}).eq("id",editId);
      if(error) throw error;
    } else {
      const {error} = await sb.from("decks").insert({user_id:currentUser.id, category, title, description, cards});
      if(error) throw error;
    }
    pendingMedia={};
    showCategory(category);
    return;
  } catch(e){
    alert("Couldn't save the deck: "+(e.message||e));
  } finally {
    if(saveBtn){ saveBtn.disabled=false; saveBtn.textContent="💾 Save Deck"; }
  }
}

/* ================= Export / Import (media embedded as base64) ================= */

async function exportDecks(){
  const custom = await fetchCustomDecks();
  if(custom.length===0){ alert("You don't have any custom decks yet — create one first!"); return; }
  const exportable=[];
  for(const deck of custom){
    const cards=[];
    for(const c of deck.cards){
      const cc = {picture:c.picture, question:c.question, answers:c.answers, correct:c.correct};
      if(c.imagePath){
        const {data,error} = await sb.storage.from(MEDIA_BUCKET).download(c.imagePath);
        if(!error && data) cc.imageData = await blobToDataURL(data);
      }
      if(c.soundPath){
        const {data,error} = await sb.storage.from(MEDIA_BUCKET).download(c.soundPath);
        if(!error && data) cc.soundData = await blobToDataURL(data);
      }
      cards.push(cc);
    }
    exportable.push({category:deck.category, title:deck.title, description:deck.description, cards});
  }
  const blob = new Blob([JSON.stringify(exportable,null,2)],{type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url; a.download="ala-slp-my-decks.json"; a.click();
  URL.revokeObjectURL(url);
}

async function importDecks(event){
  const file = event.target.files[0];
  if(!file) return;
  try{
    const text = await file.text();
    const imported = JSON.parse(text);
    if(!Array.isArray(imported)) throw new Error("bad format");
    let count=0;
    for(const d of imported){
      if(!d || typeof d.title!=="string" || !Array.isArray(d.cards) || !categoryInfo[d.category]) continue;
      const cards=[];
      for(const c of d.cards){
        if(!c || typeof c.question!=="string" || !Array.isArray(c.answers)) continue;
        const cc = {picture:c.picture||"", question:c.question, answers:c.answers, correct:c.correct||0, imagePath:null, soundPath:null};
        if(typeof c.imageData==="string"){
          const blob=dataURLToBlob(c.imageData);
          cc.imagePath = await uploadMediaFile(new File([blob],"image",{type:blob.type}));
        }
        if(typeof c.soundData==="string"){
          const blob=dataURLToBlob(c.soundData);
          cc.soundPath = await uploadMediaFile(new File([blob],"sound",{type:blob.type}));
        }
        cards.push(cc);
      }
      if(cards.length===0) continue;
      const {error} = await sb.from("decks").insert({user_id:currentUser.id, category:d.category, title:d.title, description:d.description||"", cards});
      if(!error) count++;
    }
    if(count===0){ alert("No valid decks were found in that file."); return; }
    alert(`Imported ${count} deck(s).`);
    showHome();
  }catch(e){
    alert("Couldn't read that file — make sure it's a decks export from this app.");
  }
  event.target.value="";
}

/* ================= Init ================= */

applyTheme(loadTheme());
initAuth();
