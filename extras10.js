/* Game AI extras 10: premium redesign layer (design tokens, 4 screens, bottom nav, results screen) */
(function(){
const css=document.createElement('style');
css.textContent=`
:root,[data-theme=night]{--bg:#08080C;--bg2:#0E0E14;--card:#13131B;--card2:#1A1A25;--line:#282735;--text:#F8F7FF;--text2:#E4E2F2;--mut:#AAA8BB;--acc:#8B5CF6;--acc2:#A78BFA;--accS:#6D28D9;--accg:linear-gradient(135deg,#8B5CF6 0%,#6D28D9 100%);--sel:rgba(139,92,246,.16);--aiBg:#161227;--aiLine:#3a2d7a;--glow:rgba(139,92,246,.16);--ok:#34D399;--warn:#FBBF24;--err:#FB7185}
[data-theme=day]{--bg:#F7F7FB;--bg2:#FFFFFF;--card:#FFFFFF;--card2:#F1F0F7;--line:#E7E5EF;--text:#171622;--text2:#2a2938;--mut:#696779;--acc:#E11D2E;--acc2:#C8102E;--accS:#B3121F;--accg:linear-gradient(135deg,#EF3340 0%,#C8102E 100%);--sel:#FDECEE;--aiBg:#FFF1F2;--aiLine:#F5B5BA;--glow:rgba(225,29,46,.07);--ok:#0f9f6e;--warn:#b45309;--err:#e11d48}
[data-theme=day][data-acc=purple]{--acc:#7045E8;--acc2:#5b34cf;--accS:#5b34cf;--accg:linear-gradient(135deg,#8B5CF6 0%,#6D28D9 100%);--sel:#F1ECFF;--aiBg:#F6F2FF;--aiLine:#d9ccff;--glow:rgba(112,69,232,.08)}
body{background:radial-gradient(120% 45% at 50% -8%,var(--glow),transparent 62%),var(--bg);background-attachment:fixed;transition:background-color .25s,color .25s;padding-bottom:calc(112px + env(safe-area-inset-bottom))}
h1{font-size:26px;letter-spacing:.5px;display:inline-block;vertical-align:middle}
.logo{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:11px;background:var(--accg);margin-right:10px;vertical-align:middle}
body button{min-height:50px;border-radius:16px;font-weight:600;background:var(--accg);color:#fff;border:0}
body button.sec,body button.sm{background:var(--card2);color:var(--text);border:1px solid var(--line);font-weight:500}
body button.sm{min-height:40px;border-radius:12px}
body button.star{background:transparent;border:0;min-height:0;color:var(--mut)}
body button.star.on{color:#ffb300}
body #theme{min-height:0;width:44px;height:44px;border-radius:50%;background:var(--card2);border:1px solid var(--line)}
body .chip{min-height:40px;background:var(--card2);border:1px solid var(--line);color:var(--text);font-weight:500}
body .chip.on{background:var(--sel);border-color:var(--acc);color:var(--text);box-shadow:0 0 0 1px var(--acc) inset}
body .ok{background:var(--ok)!important;color:#fff!important;border-color:transparent!important}
body .card{border-radius:22px;background:var(--card);border:1px solid var(--line)}
body .card.ai{background:linear-gradient(180deg,var(--aiBg),var(--card));border-color:var(--aiLine)}
body .card.ai .row>button:first-child{background:var(--accg);color:#fff;border:0}
body .rep{font-size:19px;line-height:1.38}
body textarea,body input[type=password],body input[type=text],body input[type=search],body select{border-radius:14px;background:var(--card2);border:1px solid var(--line);color:var(--text)}
body details{border-radius:20px;background:var(--card);border:1px solid var(--line)}
body #go{box-shadow:0 8px 24px var(--glow);display:flex;align-items:center;justify-content:center;gap:8px}
body .tag{color:var(--acc2)}
#nav{position:fixed;left:50%;transform:translateX(-50%);bottom:max(12px,env(safe-area-inset-bottom));width:min(92%,440px);display:flex;gap:4px;padding:6px;background:var(--card);border:1px solid var(--line);border-radius:26px;box-shadow:0 10px 30px rgba(0,0,0,.28);z-index:15}
#nav button{flex:1;min-height:52px;margin:0;padding:6px 4px;background:transparent!important;color:var(--mut)!important;border:0!important;font-size:11px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border-radius:20px;font-weight:500}
#nav button.on{background:var(--sel)!important;color:var(--acc2)!important}
body.kb #nav{display:none}
body #toast{bottom:calc(90px + env(safe-area-inset-bottom));background:var(--card2);border:1px solid var(--line);color:var(--text)}
.screen{display:none}
body[data-view=chats] #chatsScreen,body[data-view=style] #styleScreen,body[data-view=settings] #settingsScreen{display:block;animation:vin .22s ease}
body[data-view=chats] .cols,body[data-view=style] .cols,body[data-view=settings] .cols{display:none}
body[data-view=results] .cols{display:block}
body[data-view=results] #left{display:none}
#resHead{display:none}
body[data-view=results] #resHead{display:block}
body[data-view=home][data-showres="0"] #right,body[data-view=home]:not([data-showres]) #right{display:none}
#showChats,#chatList,#settings{display:none!important}
.hero h2{font-size:30px;line-height:1.1;margin:8px 0 6px;letter-spacing:-.5px}
.badge{display:inline-block;font-size:11px;letter-spacing:1px;padding:5px 10px;border-radius:20px;background:var(--sel)}
.badge.ok{color:var(--ok)}.badge.bad{color:var(--warn)}
#goals{display:grid!important;grid-template-columns:1fr 1fr;gap:8px;overflow:visible}
#goals .chip{width:100%;text-align:left;display:flex;align-items:center;gap:8px;white-space:normal;border-radius:16px;padding:12px}
#goals .chip.more,#chips .chip.more{display:none}
#goals.all .chip.more{display:flex}
#chips.all .chip.more{display:inline-flex}
.stats{display:flex;gap:8px;margin-top:12px}
.tile{flex:1;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:12px;text-align:center}
.tile b{display:block;font-size:22px}
.prev{white-space:pre-line;color:var(--mut);font-size:14px;margin-top:6px}
.fav{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--line)}
.screen h2,#resHead h2{font-size:28px;margin:6px 0 4px;letter-spacing:-.4px}
@keyframes vin{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@media(min-width:900px){#nav{width:420px}body[data-view=home] #right,body[data-view=home][data-showres="0"] #right{display:block}}
`;
document.head.appendChild(css);

const svg=p=>'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
const ICON={
  home:svg('<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>'),
  chats:svg('<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
  style:svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>'),
  settings:svg('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'),
  spark:svg('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>')
};
const app=document.querySelector('.app');
const left=$('left'), right=$('right');
const cardBy=t=>[...document.querySelectorAll('#left>.card')].find(c=>c.firstElementChild&&c.firstElementChild.textContent.includes(t));

/* Header logo */
const lg=el('span','logo');
lg.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="#fff"/></svg>';
document.querySelector('.head h1').before(lg);

/* Home: welcome + key banner */
const hero=el('div','hero');
const bd=el('span','badge','');bd.id='aiBadge';
hero.append(bd,el('h2','','Your next move starts here.'),el('div','mut',"Drop the conversation. I'll help you find the right words."));
const kb=el('div','card');kb.id='keyBanner';
kb.append(el('div','big','Add your Gemini key to get started'),el('div','mut','GAME AI needs your free Gemini API key before it can read chats or write replies.'));
const kbtn=el('button','','Open Settings');kbtn.onclick=()=>setView('settings');kb.append(kbtn);
const upCard=document.querySelector('#left>.card.ai');
upCard.before(hero);hero.after(kb);
upCard.querySelector('.big').textContent='Upload your conversation';
upCard.querySelector('.mut').textContent="Let's figure out what to say next. Upload screenshots or paste your chat to get personalized replies.";
$('pick').textContent='Upload screenshots';
$('pasteBtn').textContent='Paste conversation';
upCard.after($('conv'));
$('go').innerHTML=ICON.spark+'<span>Find my best move</span>';
function badge(){
  const has=!!S.get('key','').trim();
  const b=$('aiBadge');b.className='badge '+(has?'ok':'bad');b.textContent=has?'● AI READY':'● SET UP YOUR KEY';
  $('keyBanner').hidden=has;
}
$('saveSet').addEventListener('click',()=>setTimeout(badge,50));

/* Goals: popular first + See all */
const POP=['Keep chatting','Flirt more','Make her laugh','Get her number','Ask her out','Recover a dry conversation'];
const GICON={'Keep chatting':'💬','Flirt more':'😏','Make her laugh':'😂','Recover a dry conversation':'🔄','Restart a dead conversation':'🧊','Get her number':'📱','Get a call':'📞','Ask her out':'📅','Start a conversation':'👋','Respond to a compliment':'🙏','Respond to rejection':'🤝','Change the subject':'↪️','Follow up after a date':'💌','Good morning':'☀️','Good night':'🌙','Turn friendship into flirting':'✨','Apologize naturally':'🕊️','Recover from coming on too strong':'😅','Recover from double texting':'🫣'};
[...$('goals').children].forEach(b=>{
  const n=b.textContent;
  b.prepend(el('span','',GICON[n]||'•'));
  if(!POP.includes(n)) b.classList.add('more');
});
const sg=el('button','sm','See all goals');
sg.onclick=()=>{const a=$('goals').classList.toggle('all');sg.textContent=a?'Show fewer goals':'See all goals'};
$('goals').after(sg);

/* Reply style card on Home */
const TOP=['Mixed','Playful','Flirty','Funny','Confident','Nonchalant'];
[...$('chips').children].forEach(b=>{if(!TOP.includes(b.textContent)) b.classList.add('more')});
[...$('custom').querySelectorAll('.lbl')].forEach(l=>{if(l.textContent==='MODE'||l.textContent==='REPLY STYLE') l.remove()});
const rs=el('div','card');
rs.append(el('div','tag','REPLY STYLE'),$('modes'),el('div','mut','"My style" copies how you really text, using your saved messages and style profile. "Pro rizz" writes sharper, punchier lines.'),$('chips'));
const ms=el('button','sm','All styles');
ms.onclick=()=>{const a=$('chips').classList.toggle('all');ms.textContent=a?'Fewer styles':'All styles'};
rs.append(ms);
sg.after(rs);

/* More tools */
const mt=el('details');mt.className='moreTools';
mt.append(el('summary','','More tools'));
['🛠 TOOLS','✍️ WRITE','🎮 TRAIN'].map(cardBy).filter(Boolean).forEach(c=>mt.append(c));
$('custom').after(mt);
mt.addEventListener('click',()=>{document.body.dataset.showres='1'});

/* Results header */
const rh=el('div');rh.id='resHead';
const back=el('button','sm','← Back');
back.onclick=()=>{document.body.dataset.showres='0';setView('home');if(!$('conv').hidden)$('conv').scrollIntoView()};
rh.append(back,el('h2','','Your next move'),el('div','mut',"Here's what I'd send."));
$('res').before(rh);
const seeRes=el('button','sm','See last results');seeRes.hidden=true;seeRes.onclick=()=>setView('results');
$('go').after(seeRes);

/* Show results screen when Find my best move is tapped, and when results render */
$('go').addEventListener('click',()=>setView('results'),true);
$('file').addEventListener('change',()=>{document.body.dataset.showres='1';setTimeout(()=>$('res').scrollIntoView(),120)});
const _render=render;
render=function(r){
  _render(r);
  try{
    const R=$('res'),c1=R.firstElementChild;
    if(c1){
      const kids=[...c1.children].slice(1,-0||undefined);
      const hide=el('button','sm','Hide details');
      hide.onclick=()=>{const h=!kids[0].hidden;kids.forEach(k=>{k.hidden=h});hide.textContent=h?'Show details':'Hide details'};
      c1.insertBefore(hide,c1.children[1]);
    }
    [...R.querySelectorAll('.card')].forEach(c=>{
      const t=c.firstElementChild;if(!t) return;
      if(t.textContent.includes('WHY THIS WORKS')){
        const body=t.nextElementSibling;
        if(body){body.hidden=true;t.textContent='▸ WHY THIS WORKS';t.style.cursor='pointer';t.setAttribute('role','button');t.tabIndex=0;
          const tog=()=>{body.hidden=!body.hidden;t.textContent=(body.hidden?'▸ ':'▾ ')+'WHY THIS WORKS'};
          t.onclick=tog;t.onkeydown=e=>{if(e.key==='Enter')tog()}}
      }
      if(t.textContent.includes('SHE REPLIED')) t.textContent='💬 WHAT DID SHE SAY?';
    });
  }catch(e){}
  seeRes.hidden=false;
  setView('results');
};

/* Chats screen */
const chatsScreen=el('div','screen');chatsScreen.id='chatsScreen';
function drawChats(){
  chatsScreen.innerHTML='';
  chatsScreen.append(el('h2','','Your conversations'),el('div','mut','Pick up where you left off.'));
  const all=load('chats');
  if(!all.length){
    const c=el('div','card');c.append(el('div','big','No conversations yet'),el('div','mut','Your saved chats will appear here.'));
    const b=el('button','','Start a conversation');b.onclick=()=>setView('home');c.append(b);chatsScreen.append(c);return;
  }
  let q='';
  const s=el('input');s.type='search';s.placeholder='Search conversations';s.setAttribute('aria-label','Search conversations');
  s.oninput=()=>{q=s.value.toLowerCase();draw()};
  const list=el('div');chatsScreen.append(s,list);
  const open=(c,andCont)=>{
    $('tr').value=c.text;curChat=c.id;replyIdx=-1;refreshConv();$('res').innerHTML='';emptyRes();
    document.body.dataset.showres='0';setView('home');$('conv').scrollIntoView();
    if(andCont){cont=true;$('file').click()}
  };
  function draw(){
    list.innerHTML='';
    all.filter(c=>((c.name||c.title||'')+' '+(c.text||'')+' '+(c.stage||'')+' '+(c.goal||'')).toLowerCase().includes(q)).forEach(c=>{
      const card=el('div','card');
      card.append(el('div','big',c.name||c.title||'Chat'));
      card.append(el('div','mut',[c.stage,c.goal].filter(Boolean).join(' · ')+((c.stage||c.goal)?' · ':'')+'Updated '+ago(c.updated||c.id)));
      card.append(el('div','prev',(c.text||'').split('\n').filter(Boolean).slice(-2).map(l=>l.length>70?l.slice(0,70)+'…':l).join('\n')));
      const row=el('div','row');
      const op=el('button','sm','Open');op.onclick=()=>open(c,false);
      const co=el('button','sm','Continue');co.onclick=()=>open(c,true);
      const rn=el('button','sm','Rename');rn.onclick=()=>{const n=prompt('Rename chat',c.name||c.title||'');if(n){c.name=n;save('chats',all);draw()}};
      const ok=el('button','sm','✓ Worked');ok.onclick=()=>{const l=meLines(c.text);addUnique('stars',l);addUnique('mine',l);styleNote();ok.classList.add('ok');say('Saved '+l.length+' of your messages as favorites.')};
      const dl=el('button','sm','Delete');dl.onclick=()=>{if(!confirm('Delete this conversation?'))return;if(curChat===c.id)curChat=null;all.splice(all.indexOf(c),1);save('chats',all);draw()};
      row.append(op,co,rn,ok,dl);card.append(row);list.append(card);
    });
  }
  draw();
}

/* My Style screen */
const styleScreen=el('div','screen');styleScreen.id='styleScreen';
styleScreen.append(el('h2','','My style'),el('div','mut','Make every reply sound more like you.'));
const stats=el('div','stats');
const mkTile=lbl=>{const t=el('div','tile');const b=el('b','','0');t.append(b,el('span','mut',lbl));stats.append(t);return b};
const tMsgs=mkTile('Saved messages'),tFav=mkTile('Favorites'),tProf=mkTile('Style profile');
styleScreen.append(stats);
const pc=el('div','card');
const profEmpty=el('div','mut','Your texting style starts here. Save your messages or import your Instagram conversations to build a personalized profile.');
const saveProf=el('button','sm','Save changes');
saveProf.onclick=()=>{S.set('profile',$('prof').value);say('Profile saved.');drawStyle()};
const resetProf=el('button','sm','Reset profile');
resetProf.onclick=()=>{if(confirm('Clear your style profile? Your saved messages stay.')){S.del('profile');$('prof').value='';say('Profile cleared.');drawStyle()}};
const prow=el('div','row');prow.append($('profBtn'),saveProf,resetProf);
$('profBtn').classList.add('sm');
pc.append(el('div','tag','STYLE PROFILE'),$('styleNote'),profEmpty,$('prof'),prow);
styleScreen.append(pc);
const ic=el('div','card');
ic.append(el('div','big','Import your Instagram style'),el('div','mut','Use your exported messages to help GAME AI learn how you naturally text. Your export is read on this phone and is not sent to Google.'),$('igName'),$('igBtn'),el('div','lbl','OR PASTE OLD STYLE LINES'),$('imp'),$('impBtn'));
styleScreen.append(ic);
const settingsOld=$('settings');
const findChild=t=>[...settingsOld.children].find(c=>c.textContent.trim().startsWith(t));
const slang=findChild('SLANG DICTIONARY'), backup=findChild('BACKUP');
if(slang){const c=el('div','card');c.append(slang);styleScreen.append(c)}
if(backup){const c=el('div','card');c.append(backup);styleScreen.append(c);$('expBtn').remove&&0}
const fc=el('div','card');
fc.append(el('div','tag','FAVORITES'),el('div','mut','Removing a favorite here does not remove it from your general style examples.'));
const favQ=el('input');favQ.type='search';favQ.placeholder='Search favorites';favQ.setAttribute('aria-label','Search favorites');
const favBox=el('div');
fc.append(favQ,favBox);styleScreen.append(fc);
function drawFav(){
  favBox.innerHTML='';
  const all=[...new Set(load('stars'))];
  if(!all.length){favBox.append(el('div','mut','No favorites yet. Tap ☆ on a reply, or ✓ Worked on a saved chat.'));return}
  const q=favQ.value.toLowerCase();
  const items=all.filter(x=>x.toLowerCase().includes(q));
  items.slice(0,40).forEach(t=>{
    const r=el('div','fav');r.append(el('div','',t));
    const x=el('button','sm','✕');x.setAttribute('aria-label','Remove favorite');
    x.onclick=()=>{save('stars',load('stars').filter(y=>y!==t));say('Removed from favorites. It stays in your style examples.');drawStyle()};
    r.append(x);favBox.append(r);
  });
  if(items.length>40) favBox.append(el('div','mut','Showing 40 of '+items.length+'. Use search to find others.'));
}
favQ.oninput=drawFav;
function drawStyle(){
  styleNote();
  tMsgs.textContent=load('mine').length;tFav.textContent=[...new Set(load('stars'))].length;
  const has=!!S.get('profile','').trim();
  tProf.textContent=has?'Yes':'Not yet';profEmpty.hidden=has;$('prof').value=S.get('profile','');
  drawFav();
}

/* Settings screen */
const settingsScreen=el('div','screen');settingsScreen.id='settingsScreen';
settingsScreen.append(el('h2','','Settings'),el('div','mut','Your key, instructions and privacy.'));
const ai=el('div','card');
const show=el('button','sm','Show key');
show.onclick=()=>{const p=$('key').type==='password';$('key').type=p?'text':'password';show.textContent=p?'Hide key':'Show key'};
ai.append(el('div','tag','AI CONFIGURATION'),el('div','mut','Your Gemini key is used only to send your requests to Google. It is saved in this browser, which is not a secure vault: anyone with access to this phone could read it. A production app would keep the key on a server.'),$('key'),show,$('model'),$('saveSet'),$('find'),$('models'));
const pi=el('div','card');
pi.append(el('div','tag','PERSONAL INSTRUCTIONS'),el('div','mut','Tell GAME AI how you want your replies to sound.'),$('rules'));
const ap=el('div','card');
const da=el('select');da.setAttribute('aria-label','Day mode accent color');
[['red','Red (default)'],['purple','Purple']].forEach(([v,t])=>{const o=el('option','',t);o.value=v;da.append(o)});
da.value=S.get('dayAcc','red');
da.onchange=()=>{S.set('dayAcc',da.value);document.documentElement.dataset.acc=da.value};
ap.append(el('div','tag','APPEARANCE'),el('div','mut','Day mode accent color. Use the sun/moon button at the top to switch day and night.'),da);
const pv=el('div','card');
pv.append(el('div','tag','PRIVACY'),el('div','mut','Chats, style examples and preferences are saved on this phone. When you generate replies, the conversation text or screenshots you choose are sent to Google\'s Gemini API. The buttons below delete data on this phone only; they cannot delete what Google already received. Resetting preferences does not delete your API key.'),$('resetStyle'),$('delChats'),$('resetPrefs'),$('st2'));
settingsScreen.append(ai,pi,ap,pv);
app.append(chatsScreen,styleScreen,settingsScreen);

/* Navigation */
const nav=el('nav');nav.id='nav';nav.setAttribute('aria-label','Main');
[['home','Home',ICON.home],['chats','Chats',ICON.chats],['style','My Style',ICON.style],['settings','Settings',ICON.settings]].forEach(([v,t,s])=>{
  const b=el('button');b.dataset.v=v;b.innerHTML=s+'<span>'+t+'</span>';b.onclick=()=>setView(v);nav.append(b);
});
document.body.append(nav);
function setView(v){
  document.body.dataset.view=v;
  nav.querySelectorAll('button').forEach(b=>{
    const on=b.dataset.v===v||(v==='results'&&b.dataset.v==='home');
    b.classList.toggle('on',on);
    if(on) b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
  });
  if(v==='chats') drawChats();
  if(v==='style') drawStyle();
  if(v==='home') badge();
  window.scrollTo(0,0);
}
document.addEventListener('focusin',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) document.body.classList.add('kb')});
document.addEventListener('focusout',()=>setTimeout(()=>{const a=document.activeElement;if(!a||!/INPUT|TEXTAREA|SELECT/.test(a.tagName)) document.body.classList.remove('kb')},150));

document.documentElement.dataset.acc=S.get('dayAcc','red');
document.body.dataset.showres='0';
settingsOld.hidden=true;
badge();
setView('home');
})();
