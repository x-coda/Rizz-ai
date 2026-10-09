/* Game AI extras: dialects, fine-tune, tools, feedback, tour, backup, screenshot tray */
(function(){
const css=document.createElement('style');
css.textContent='.bar{height:8px;background:var(--line);border-radius:6px;overflow:hidden;margin:4px 0 8px}.bar>i{display:block;height:100%;background:var(--acc)}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.grid2 button{margin-top:0}.thumb{display:flex;align-items:center;gap:8px;margin-top:8px}.thumb img{width:48px;height:64px;object-fit:cover;border-radius:8px}.thumb .n{flex:1;font-size:14px;color:var(--mut)}#tour{position:fixed;top:0;right:0;bottom:0;left:0;background:var(--bg);z-index:20;display:flex;flex-direction:column;justify-content:center;padding:32px;text-align:center}#tour h2{font-size:28px;margin:0 0 12px}#tour p{color:var(--mut);font-size:18px}.fine{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:8px}.fine select{width:55%;margin:0}';
document.head.appendChild(css);

const DIALECTS={
  'Auto-detect from chat':'',
  'Egyptian':'Egyptian Arabic (typical flavor: ازيك، عامل ايه، دلوقتي، اوي، ايه ده، مش)',
  'Gulf':'Gulf Arabic (typical flavor: شلونك، وش، ليش، زين، مرة، حبيبي)',
  'Sudanese':'Sudanese Arabic (typical flavor: كيفنك، شنو، ياخ، هسي، زول، كدا)',
  'Emirati':'Emirati Arabic (typical flavor: شخبارك، شو، وايد، مب، هلا)'
};
const FINE={
  Length:['Auto','Short','Medium','Long'],
  Emojis:['Auto','None','Few','Lots'],
  Flirting:['Auto','Low','Medium','High'],
  Confidence:['Auto','Chill','Confident','Very confident'],
  Slang:['Auto','Low','Medium','High'],
  Humor:['Auto','Low','Medium','High']
};
const KEYS=['mine','stars','flops','profile','chats','rules','dial','dialect','mode','side','theme'];

function prefsBlock(){
  const d=S.get('dialect','Auto-detect from chat');
  let b='MY PREFERENCES FOR THESE TEXTS (follow them):\n- Write ALL texts in the same language and script as the chat, including every alternative. If the chat is in Arabic, write natural Arabic the way people really text, never formal Modern Standard Arabic. If the chat mixes Arabic and English, or uses Arabic written in Latin letters, mix the same way.\n';
  if(DIALECTS[d]) b+='- When writing Arabic, use '+DIALECTS[d]+'. Use those words only for flavor when they fit naturally.\n';
  let dial={}; try{dial=JSON.parse(S.get('dial','{}'))||{}}catch(e){}
  Object.keys(FINE).forEach(k=>{if(dial[k]&&dial[k]!=='Auto') b+='- '+k+' preference: '+dial[k]+'\n'});
  const fl=load('flops').slice(-6);
  if(fl.length) b+='- These texts of mine flopped, so avoid this kind of phrasing:\n'+fl.map(x=>'  * '+x).join('\n')+'\n';
  return b;
}

const _g=gemini;
gemini=function(parts,temp,json){
  try{
    if(parts&&parts.length===1&&parts[0].text&&!/Here are real texts I sent/.test(parts[0].text)){
      parts=[{text:parts[0].text+'\n\n'+prefsBlock()+(json?'\nStill return ONLY the JSON in the shape given above.':'')}];
    }
  }catch(e){}
  return _g.call(this,parts,temp,json);
};

/* Customize: dialect and fine-tune */
const cu=$('custom');
cu.append(el('div','lbl','ARABIC DIALECT (WHEN THE CHAT IS IN ARABIC)'));
const ds=el('select');
Object.keys(DIALECTS).forEach(k=>{const o=el('option','',k);o.value=k;ds.append(o)});
ds.value=S.get('dialect','Auto-detect from chat');
ds.onchange=()=>S.set('dialect',ds.value);
cu.append(ds);
cu.append(el('div','lbl','FINE-TUNE'));
let dial={}; try{dial=JSON.parse(S.get('dial','{}'))||{}}catch(e){}
Object.keys(FINE).forEach(k=>{
  const row=el('div','fine'); row.append(el('span','',k));
  const s=el('select');
  FINE[k].forEach(v=>{const o=el('option','',v);o.value=v;s.append(o)});
  s.value=dial[k]||'Auto';
  s.onchange=()=>{dial[k]=s.value;S.set('dial',JSON.stringify(dial))};
  row.append(s); cu.append(row);
});

/* Tools helpers */
function needChat(){
  if(!parse($('tr').value).length){showError('Upload or paste a conversation first, then pick this tool.');$('res').scrollIntoView();return true}
  return false;
}
function jparse(t){
  t=t.replace(/^```(?:json)?/i,'').replace(/```$/,'').trim();
  const s=t.indexOf('{'), e=t.lastIndexOf('}');
  return JSON.parse(t.slice(s,e+1));
}
async function run(steps,prompt,draw,retry){
  const stop=loader(steps);
  try{
    const o=jparse(await gemini([{text:prompt}],0.8,true));
    stop(); draw(o); $('res').scrollIntoView();
  }catch(e){stop();showError(friendly(e.message),retry)}
}
function head(){
  return 'Here is a text conversation between me and a girl. Lines starting with "Me:" are from me. Lines starting with "Her:" are from her.'+NOTE+'\n\nCONVERSATION:\n'+$('tr').value.trim()+'\n\n';
}
const SAFE2='Never write sexually explicit content. Respect boundaries: if she has said no or is clearly not interested, advise giving her space and do not help pressure her. Keep texts short, natural and in my voice.\n\n';
function textCards(R,list){
  (list||[]).filter(x=>x&&x.text).slice(0,3).forEach((x,i)=>R.append(replyCard(String(x.label||('OPTION '+(i+1))).toUpperCase(),x.text,i===0)));
}
function infoCard(R,tag,text,cls){
  if(!text) return;
  const c=el('div','card'+(cls?' '+cls:'')); c.append(el('div','tag',tag),el('div','',String(text))); R.append(c);
}

/* Recovery */
const SITS=['I sent something boring','I double texted','I came on too strong','I got left on read','I made things awkward','The conversation went dry','I said something embarrassing','She gave a one-word reply',"I don't know what to say next"];
function recovery(){
  if(needChat()) return;
  const R=$('res'); R.innerHTML='';
  const c=el('div','card ai'); c.append(el('div','tag','💀 RECOVERY MODE'),el('div','mut','What happened?'));
  const box=el('div','row');
  SITS.forEach(s=>{const b=el('button','sm',s);b.onclick=()=>doRecovery(s);box.append(b)});
  c.append(box); R.append(c); R.scrollIntoView();
}
function doRecovery(s){
  const p=head()+styleBlock(true)+rulesText()+'SITUATION: '+s+'\n\nFirst work out what actually happened in the chat. Then give recovery options. '+SAFE2+'Return ONLY JSON: {"diagnosis":"","should_reply":true,"advice":"","options":[{"label":"","text":""},{"label":"","text":""},{"label":"","text":""}],"avoid":""}. diagnosis and advice are one or two short sentences. If waiting or saying nothing is the best move, set should_reply to false and leave options empty. Each option has a different tone (for example light humor, sincere, confident).';
  run(['Reading the chat...','Working out what went wrong...','Finding a way out...'],p,o=>{
    const R=$('res'); R.innerHTML='';
    const c=el('div','card ai'); c.append(el('div','tag','💀 RECOVERY: '+s.toUpperCase()));
    if(o.diagnosis) c.append(el('div','',o.diagnosis));
    if(o.advice) c.append(el('div','q',o.advice));
    R.append(c);
    textCards(R,o.options);
    infoCard(R,'AVOID',o.avoid);
  },()=>doRecovery(s));
}

/* Revive */
function revive(){
  if(needChat()) return;
  const p=head()+styleBlock(true)+rulesText()+'This chat went quiet. Work out why and how to restart it. '+SAFE2+'Return ONLY JSON: {"why_it_went_dry":"","best_way_to_restart":"","options":[{"label":"","text":""},{"label":"","text":""},{"label":"","text":""}],"avoid":""}. Base everything on what is actually in the chat (for example interview-style questions, one-word replies, a topic that fizzled, or my unanswered message). Each option brings back something real from the chat or opens something fresh and specific, with no guilt-tripping and no "hey stranger". If the chat shows she is not interested, say so kindly and give no options.';
  run(['Reading the chat...','Finding where it went quiet...','Writing ways to restart...'],p,o=>{
    const R=$('res'); R.innerHTML='';
    infoCard(R,'♻️ WHY IT WENT DRY',o.why_it_went_dry,'ai');
    infoCard(R,'🎯 BEST WAY TO RESTART',o.best_way_to_restart);
    textCards(R,o.options);
    infoCard(R,'AVOID',o.avoid);
  },revive);
}

/* Rizz Score */
function score(){
  if(needChat()) return;
  const p=head()+rulesText()+'Judge ONLY my texting (the lines starting with "Me:") in this chat. Return ONLY JSON: {"score":0,"naturalness":0,"confidence":0,"flirting":0,"momentum":0,"humor":0,"strengths":"","improve":"","best_message":""}. All numbers are 0 to 100 and are rough AI estimates from this one chat. strengths and improve are one or two short, specific sentences that point at real things I wrote (for example asking too many questions back-to-back). best_message is my single best line copied exactly, or empty.';
  run(['Reading your messages...','Scoring the chat...','Finding what to improve...'],p,o=>{
    const R=$('res'); R.innerHTML='';
    const c=el('div','card ai');
    c.append(el('div','tag','📊 RIZZ SCORE'),el('div','big',clamp(o.score,0,100)+'/100'),el('div','mut','AI estimate based on this one chat. Not scientific.'));
    [['Naturalness','naturalness'],['Confidence','confidence'],['Flirting','flirting'],['Conversation momentum','momentum'],['Humor','humor']].forEach(([l,k])=>{
      const v=clamp(o[k],0,100);
      const r=el('div','kv'); r.append(el('span','mut',l),el('b','',String(v))); c.append(r);
      const b=el('div','bar'); const i=el('i'); i.style.width=v+'%'; b.append(i); c.append(b);
    });
    R.append(c);
    infoCard(R,'✅ WHAT IS WORKING',o.strengths);
    infoCard(R,'🎯 WHAT SHOULD I IMPROVE?',o.improve);
    infoCard(R,'⭐ YOUR BEST LINE',o.best_message);
  },score);
}

/* No reply yet */
function ghost(){
  if(needChat()) return;
  const p=head()+styleBlock(true)+rulesText()+'My last message may not have been answered. Decide what to do. '+SAFE2+'Return ONLY JSON: {"status":"","wait_recommendation":"","wait_time":"","followup":"","why":""}. status is one short line (for example "No reply yet" or "She already replied, so this is not a follow-up situation"). wait_recommendation is clear advice, usually not to send another message right now. wait_time says how long to wait (for example "until tomorrow evening") or is empty. followup is ONE natural, short follow-up for later, only if a follow-up makes sense. If she clearly is not interested or said no, leave followup empty and tell me to give her space. Never encourage repeated messages.';
  run(['Reading the chat...','Checking the timing...','Deciding the next move...'],p,o=>{
    const R=$('res'); R.innerHTML='';
    const c=el('div','card ai'); c.append(el('div','tag','👻 NO REPLY YET'));
    if(o.status) c.append(el('div','big',o.status));
    if(o.wait_recommendation) c.append(el('div','q',o.wait_recommendation));
    if(o.wait_time) c.append(el('div','mut','Wait: '+o.wait_time));
    R.append(c);
    if(o.followup&&String(o.followup).trim()) R.append(replyCard('⏳ FOLLOW-UP FOR LATER',o.followup,true));
    infoCard(R,'WHY',o.why);
  },ghost);
}

/* Tools card */
const tools=el('div','card');
tools.append(el('div','tag','🛠 TOOLS'));
const g2=el('div','grid2');
[['💀 Recovery',recovery],['♻️ Revive chat',revive],['📊 Rizz Score',score],['👻 No reply yet',ghost]].forEach(([t,f])=>{const b=el('button','sec',t);b.onclick=f;g2.append(b)});
tools.append(g2);
$('goals').after(tools);

/* "Did it land?" feedback after copying */
const _copy=copy;
copy=function(text,btn){_copy(text,btn);fbCard(text)};
function fbCard(text){
  const old=$('fb'); if(old) old.remove();
  const c=el('div','card'); c.id='fb';
  c.append(el('div','tag','AFTER YOU SEND IT'),el('div','mut','Did it land?'));
  const y=el('button','sm','👍 She liked it'), n=el('button','sm','👎 It flopped');
  y.onclick=()=>{addUnique('stars',[text]);addUnique('mine',[text]);styleNote();c.remove();say('Saved as a favorite. I will copy more of this.')};
  n.onclick=()=>{save('flops',[...load('flops'),text].slice(-30));c.remove();say('Got it. I will avoid that kind of line.')};
  c.append(y,n); $('res').append(c);
}

/* Screenshot tray: reorder and remove before reading */
let tray=[], trayCont=false;
$('file').onchange=function(){
  const f=[...this.files];
  if(!f.length) return;
  tray=f.slice(0,12); trayCont=cont; cont=false; this.value=''; drawTray();
};
function drawTray(){
  const R=$('res'); R.innerHTML='';
  const c=el('div','card ai');
  c.append(el('div','tag','📎 '+tray.length+' SCREENSHOT'+(tray.length>1?'S':'')+' (TOP TO BOTTOM = OLDEST TO NEWEST)'));
  tray.forEach((f,i)=>{
    const row=el('div','thumb');
    const im=el('img'); im.src=URL.createObjectURL(f); im.alt='Screenshot '+(i+1);
    const n=el('div','n',(i+1)+'. '+(f.name||'screenshot'));
    const up=el('button','sm','↑'), dn=el('button','sm','↓'), rm=el('button','sm','✕');
    up.setAttribute('aria-label','Move up'); dn.setAttribute('aria-label','Move down'); rm.setAttribute('aria-label','Remove');
    up.onclick=()=>{if(i>0){const t=tray[i-1];tray[i-1]=tray[i];tray[i]=t;drawTray()}};
    dn.onclick=()=>{if(i<tray.length-1){const t=tray[i+1];tray[i+1]=tray[i];tray[i]=t;drawTray()}};
    rm.onclick=()=>{tray.splice(i,1);if(tray.length)drawTray();else{R.innerHTML='';emptyRes()}};
    row.append(im,n,up,dn,rm); c.append(row);
  });
  const go=el('button','','Read '+tray.length+' screenshot'+(tray.length>1?'s':''));
  go.onclick=()=>{
    files=tray.slice(); const cc=trayCont; tray=[];
    $('thumbs').textContent=files.length+' screenshot'+(files.length>1?'s':'')+' selected';
    readShots(cc);
  };
  c.append(go); R.append(c); R.scrollIntoView();
}

/* Backup */
const bk=el('div'); bk.append(el('div','lbl','BACKUP (DOES NOT INCLUDE YOUR API KEY)'));
const ex=el('button','sec','Export everything (backup)');
const bta=el('textarea'); bta.style.height='80px'; bta.placeholder='Paste a backup here to restore it';
const rs=el('button','sec','Restore from backup');
ex.onclick=async()=>{
  const o={}; KEYS.forEach(k=>{const v=S.get(k,null);if(v!==null)o[k]=v});
  S.set('lastBackup',String(Date.now()));
  const txt=JSON.stringify(o);
  try{await navigator.clipboard.writeText(txt);say('Backup copied. Paste it into Notes or email it to yourself.')}
  catch(e){bta.value=txt;say('Could not copy automatically. Select the text in the box and copy it.')}
};
rs.onclick=()=>{
  try{
    const o=JSON.parse(bta.value);
    if(!o||typeof o!=='object') throw new Error('x');
    Object.keys(o).forEach(k=>{if(KEYS.includes(k)&&typeof o[k]==='string') S.set(k,o[k])});
    say('Restored. Reload the page to see everything.');
  }catch(e){say('That does not look like a backup.')}
};
bk.append(ex,bta,rs); $('st2').before(bk);
const lb=Number(S.get('lastBackup','0'));
if(load('mine').length>=20&&Date.now()-lb>14*86400000) setTimeout(()=>say('Tip: back up your style in Settings so you never lose it.'),2500);

/* First-time tour */
if(!S.get('tour','')){
  const T=[['Meet your AI wingman.','Screenshot a chat and get the best move in seconds.'],['Upload a conversation.','Pick screenshots, or paste the messages.'],['Get natural replies that match your style.','The more of your own texts you save, the more it sounds like you.'],['Your chats stay under your control.','Everything is saved on this phone only, and you can delete it any time.']];
  let i=0;
  const o=el('div'); o.id='tour';
  const h=el('h2'), p=el('p'), next=el('button','',''), skip=el('button','sec','Skip');
  const show=()=>{h.textContent=T[i][0];p.textContent=T[i][1];next.textContent=i<T.length-1?'Next':'Start now'};
  const done=()=>{S.set('tour','1');o.remove()};
  next.onclick=()=>{if(i<T.length-1){i++;show()}else done()};
  skip.onclick=done;
  o.append(h,p,next,skip); document.body.append(o); show();
}
})();
