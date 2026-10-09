/* Game AI extras 3: Library, blend, slang, practice, branches, battle, daily challenge */
(function(){
const GX=window.GX;
if(!GX){return}
const {FMT,jparse,ctx,run,panel,input,chipRow,cards,info}=GX;

/* XP and levels */
const LEVELS=[[0,'Rookie'],[50,'Smooth Learner'],[120,'Certified Flirt'],[220,'Banter Specialist'],[350,'Conversation Architect'],[500,'Wingman Elite']];
const xp=()=>Number(S.get('xp','0'))||0;
const lvl=()=>{let l=LEVELS[0];LEVELS.forEach(x=>{if(xp()>=x[0])l=x});return l[1]};
const lvText=()=>'Level: '+lvl()+' · '+xp()+' XP';
let lv;
function addXp(n){S.set('xp',String(xp()+n));if(lv)lv.textContent=lvText();say('+'+n+' XP · '+lvl())}

/* Reply library */
const CATS=['Flirty','Funny','Playful','Nonchalant','Openers','Compliments','Comebacks','Conversation Starters','Date Invitations','Apologies','Serious Conversations'];
const lib=()=>load('lib');
const setLib=v=>save('lib',v);
function catFor(label){
  const l=String(label).toUpperCase();
  return l.includes('FLIRT')?'Flirty':l.includes('FUNNY')?'Funny':l.includes('NONCHALANT')?'Nonchalant':(l.includes('PLAYFUL')||l.includes('TEASE'))?'Playful':l.includes('OPEN')?'Openers':l.includes('COMPLIMENT')?'Compliments':l.includes('APOLOG')?'Apologies':(l.includes('DATE')||l.includes('INVIT'))?'Date Invitations':'Playful';
}
function addLib(text,cat,note){
  const L=lib();
  L.unshift({id:Date.now()+Math.random(),text:text,cat:cat,note:note||'',fav:false,ts:Date.now()});
  setLib(L.slice(0,500));
}
function similar(x){
  run(['Reading your saved reply...','Writing similar ones...'],
    'Here is a text I saved and like: "'+x.text+'"\n\n'+ctx()+styleBlock(true)+'Write 4 NEW texts with a similar tone, length and energy, but different wording and different ideas. Do not copy it. '+FMT+'Return ONLY JSON: {"options":[{"label":"","text":""},{"label":"","text":""},{"label":"","text":""},{"label":"","text":""}]}. Each label is 1 or 2 words.',
    o=>{const R=$('res');R.innerHTML='';cards(R,o.options,4)},()=>similar(x));
}
function showLib(){
  const R=$('res');R.innerHTML='';
  const c=el('div','card ai');c.append(el('div','tag','📚 REPLY LIBRARY'));
  const q=el('input');q.type='search';q.placeholder='Search saved replies';c.append(q);
  let cat='All';
  chipRow(c,['All','★ Favorites'].concat(CATS),'All',n=>{cat=n;draw()});
  const add=el('button','sec','+ Add a reply');
  add.onclick=()=>{
    const t=prompt('Type the reply to save');if(!t||!t.trim())return;
    const k=prompt('Category: '+CATS.join(', '),'Playful');
    addLib(t.trim(),CATS.includes(k)?k:'Playful');draw();
  };
  const imp=el('button','sec','Import my ★ favorites');
  imp.onclick=()=>{
    const have=new Set(lib().map(x=>x.text));let n=0;
    load('stars').forEach(t=>{if(!have.has(t)){addLib(t,'Playful');n++}});
    say('Imported '+n+' favorites.');draw();
  };
  const list=el('div');
  c.append(add,imp,list);R.append(c);
  function draw(){
    list.innerHTML='';
    const term=q.value.toLowerCase(),L=lib();
    const items=L.filter(x=>(cat==='All'||(cat==='★ Favorites'?x.fav:x.cat===cat))&&(x.text+' '+(x.note||'')+' '+x.cat).toLowerCase().includes(term));
    if(!items.length){list.append(el('div','mut','Nothing here yet. Tap 📚 Save on any reply.'));return}
    items.slice(0,60).forEach(x=>{
      const k=el('div','card');
      k.append(el('div','tag',x.cat.toUpperCase()+(x.fav?' ★':'')),el('div','rep',x.text));
      if(x.note)k.append(el('div','mut','Note: '+x.note));
      const r=el('div','row');
      const cp=el('button','sm','Copy');
      cp.onclick=()=>{
        const done=()=>{cp.textContent='✓ Copied';setTimeout(()=>{cp.textContent='Copy'},1200)};
        if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(x.text).then(done).catch(()=>say('Could not copy. Select the text and copy it.'));
        else say('Could not copy. Select the text and copy it.');
      };
      const fv=el('button','sm',x.fav?'★ Unfavorite':'☆ Favorite');fv.onclick=()=>{x.fav=!x.fav;setLib(L);draw()};
      const ed=el('button','sm','Edit');ed.onclick=()=>{const v=prompt('Edit reply',x.text);if(v&&v.trim()){x.text=v.trim();setLib(L);draw()}};
      const ct=el('button','sm','Category');ct.onclick=()=>{const v=prompt('Category: '+CATS.join(', '),x.cat);if(CATS.includes(v)){x.cat=v;setLib(L);draw()}};
      const nt=el('button','sm','Note');nt.onclick=()=>{const v=prompt('Add a note',x.note||'');if(v!==null){x.note=v;setLib(L);draw()}};
      const sm=el('button','sm','Make similar');sm.onclick=()=>similar(x);
      const dl=el('button','sm','Delete');dl.onclick=()=>{if(confirm('Delete this reply?')){setLib(L.filter(y=>y.id!==x.id));draw()}};
      r.append(cp,fv,ed,ct,nt,sm,dl);k.append(r);list.append(k);
    });
  }
  q.oninput=draw;draw();R.scrollIntoView();
}

/* Reply card upgrades: Save to library, custom edit, previous version */
const _rc=replyCard;
replyCard=function(label,text,best){
  const c=_rc(label,text,best);
  try{
    const rows=c.querySelectorAll('.row'),row=rows[0],panelEl=rows[1],p=c.querySelector('.rep');
    const sv=el('button','sm','📚 Save');
    sv.onclick=()=>{const x=c._ta?c._ta.value:p.textContent;const cat=catFor(label);addLib(x,cat);sv.textContent='✓ Saved';say('Saved to Library under '+cat+'.')};
    row.insertBefore(sv,row.querySelector('.star'));
    const inp=el('input');inp.type='text';inp.placeholder='Custom: e.g. make it funnier but keep it short';inp.style.flex='1 1 100%';
    const ap=el('button','sm','Apply');
    ap.onclick=()=>{const v=inp.value.trim();if(!v)return;panelEl.hidden=true;rewrite(p,'apply this change exactly: '+v,ap)};
    panelEl.append(inp,ap);
  }catch(e){}
  return c;
};
const _rw=rewrite;
rewrite=async function(p,instr,btn){
  const before=p.textContent;
  await _rw(p,instr,btn);
  if(p.textContent!==before){
    p._h=p._h||[before];p._h.push(p.textContent);
    const card=p.closest('.card');let u=card.querySelector('.undo');
    if(!u){
      u=el('button','sm undo','↩ Previous');
      card.querySelectorAll('.row')[0].append(u);
      u.onclick=()=>{if(p._h.length>1){p._h.pop();p.textContent=p._h[p._h.length-1]}u.hidden=p._h.length<2};
    }
    u.hidden=false;
  }
};

/* Personality blend */
const PERS={
  'Rizz God':'confident, smooth and playful',
  'Playful Menace':'teasing, chaotic and humorous without being genuinely insulting',
  'Nonchalant':'calm, concise and effortless',
  'Funny Guy':'witty, entertaining and conversational',
  'Smooth Operator':'charming, subtle and socially aware',
  'Soft Boy':'warm, thoughtful and considerate',
  'Mysterious':'intriguing without artificial mind games',
  'Unhinged':'absurd, unpredictable and comedic',
  'Best Friend':'casual, relatable and friendly',
  'Comeback King':'clever responses to jokes, teasing and playful challenges',
  'Romantic':'affectionate, sincere and emotionally expressive',
  'Dry Texter':'short, understated and direct'
};
function blendBlock(){
  const b=load('blend').filter(x=>x&&x.n&&PERS[x.n]);
  if(!b.length)return '';
  const sum=b.reduce((a,x)=>a+(Number(x.p)||0),0);
  const parts=b.map(x=>({n:x.n,p:sum>0?Math.round((Number(x.p)||0)/sum*100):Math.round(100/b.length)}));
  return 'PERSONALITY BLEND: '+parts.map(x=>x.p+'% '+x.n+' ('+PERS[x.n]+')').join(', ')+'. Let these percentages clearly shape the tone, so the replies sound different from a plain default voice.';
}
const cu=$('custom');
cu.append(el('div','lbl','PERSONALITY BLEND (OPTIONAL)'));
const saved=load('blend');
const total=el('div','mut','');
const rowsB=[0,1,2].map(i=>{
  const row=el('div','fine');
  const s=el('select');
  const none=el('option','','None');none.value='';s.append(none);
  Object.keys(PERS).forEach(k=>{const o=el('option','',k);o.value=k;s.append(o)});
  const n=el('input');n.type='number';n.min='0';n.max='100';n.placeholder='%';n.style.width='80px';n.style.margin='0';
  if(saved[i]){s.value=saved[i].n||'';n.value=saved[i].p||''}
  row.append(s,n);cu.append(row);
  return {s,n};
});
function saveBlend(){
  const v=rowsB.map(r=>({n:r.s.value,p:Number(r.n.value)||0})).filter(x=>x.n);
  save('blend',v);
  const sum=v.reduce((a,x)=>a+x.p,0);
  total.textContent=v.length?('Total: '+sum+'%. I scale it to 100% automatically.'):'No blend set. I use your reply style.';
}
rowsB.forEach(r=>{r.s.onchange=saveBlend;r.n.onchange=saveBlend});
cu.append(total);saveBlend();
GX.blocks.push(blendBlock);

/* Slang dictionary */
function slangBlock(){
  const f=S.get('slangF','Sometimes');
  const w=S.get('slangW','').split('\n').map(x=>x.trim()).filter(Boolean);
  const a=S.get('slangA','').split('\n').map(x=>x.trim()).filter(Boolean);
  if(f==='Off')return 'SLANG: do not use slang or abbreviations.';
  if(!w.length&&!a.length)return '';
  let b='MY SLANG DICTIONARY: ';
  if(w.length)b+='words and phrases I like (use '+f.toLowerCase()+', only when they fit naturally, never in every text): '+w.join(', ')+'. ';
  if(a.length)b+='Never use: '+a.join(', ')+'.';
  return b;
}
const sd=el('div');
sd.append(el('div','lbl','SLANG DICTIONARY'));
const sw=el('textarea');sw.style.height='80px';sw.placeholder='Words I like, one per line (examples: ngl, fr, lowkey, wallah)';sw.value=S.get('slangW','');
const sa=el('textarea');sa.style.height='60px';sa.placeholder='Words to avoid, one per line';sa.value=S.get('slangA','');
const sf=el('select');
['Off','Rarely','Sometimes','Often'].forEach(v=>{const o=el('option','',v);o.value=v;sf.append(o)});
sf.value=S.get('slangF','Sometimes');
sw.onchange=()=>S.set('slangW',sw.value);sa.onchange=()=>S.set('slangA',sa.value);sf.onchange=()=>S.set('slangF',sf.value);
sd.append(sw,sa,sf);
$('st2').before(sd);
GX.blocks.push(slangBlock);

/* Practice */
const SCN=[
  ['Meeting someone new',"You met her at a friend's party and you are texting for the first time afterward."],
  ['Starting a conversation',"She posted a story of a sunset at the beach and you want to reply."],
  ['Responding to teasing',"She keeps teasing you about being late to everything."],
  ['Expressing interest',"You have been chatting for a week and want to show you like talking to her."],
  ['Giving a compliment',"She just shared that she finished a big project."],
  ['Handling awkward silence',"The chat went quiet for a day after a good conversation."],
  ['Asking engaging questions',"She gives short answers and you want to get her talking."],
  ['Resolving a misunderstanding',"She thought your joke was rude and replied coldly."],
  ['Asking someone out',"You two have been joking around for weeks and you want to suggest meeting up."],
  ['Handling rejection',"You asked her out and she politely said she is not interested."]
];
function persona(s,m){
  return 'You are role-playing a fictional woman in a text chat for social-skills practice. Scenario: '+s[1]+' Stay realistic: friendly but not a pushover and not hostile. Answer like a real person in 1 or 2 short texts, react to what I actually wrote, and show interest only if I earn it. Never write anything sexually explicit. If the chat is empty, send her opening text for this scenario.\n\nCHAT SO FAR:\n'+(m.length?m.map(x=>(x.who==='her'?'Her: ':'Me: ')+x.text).join('\n'):'(nothing yet)')+'\n\nWrite only her next text, with no label.';
}
function practice(){
  const c=panel('🎯 PRACTICE','Pick a scenario. I play a fictional person. Nothing here is real.');
  const box=el('div','row');
  SCN.forEach(s=>{const b=el('button','sm',s[0]);b.onclick=()=>startPractice(s);box.append(b)});
  c.append(box);
}
function startPractice(s){
  const msgs=[];
  const R=$('res');R.innerHTML='';
  const c=el('div','card ai');c.append(el('div','tag','🎯 '+s[0].toUpperCase()),el('div','mut',s[1]+' (Fictional.)'));
  const log=el('div');
  const inp=el('textarea');inp.style.height='70px';inp.placeholder='Type your text...';
  const send=el('button','','Send'),fin=el('button','sec','Finish and get feedback'),rst=el('button','sec','Pick another scenario');
  c.append(log,inp,send,fin,rst);R.append(c);R.scrollIntoView();
  const draw=()=>{log.innerHTML='';msgs.forEach(m=>log.append(el('div','q',(m.who==='her'?'Her: ':'You: ')+m.text)))};
  const herTurn=async()=>{
    send.disabled=true;
    try{const t=await gemini([{text:persona(s,msgs)}],0.9);msgs.push({who:'her',text:t.trim().replace(/^(her|she):\s*/i,'')});draw()}
    catch(e){say('Error: '+friendly(e.message))}
    send.disabled=false;
  };
  send.onclick=async()=>{const v=inp.value.trim();if(!v)return;msgs.push({who:'me',text:v});inp.value='';draw();await herTurn()};
  fin.onclick=()=>{
    if(msgs.filter(m=>m.who==='me').length<2){say('Send at least 2 messages first.');return}
    run(['Reading the practice chat...','Writing feedback...'],
      'This was a fictional texting practice scenario: '+s[1]+'\n\nCHAT:\n'+msgs.map(x=>(x.who==='her'?'Her: ':'Me: ')+x.text).join('\n')+'\n\nGive constructive, kind feedback on my texting. Do not diagnose my personality. Return ONLY JSON: {"naturalness":"","clarity":"","responsiveness":"","questions":"","tone":"","boundaries":"","best_moment":"","tip":""}. Each value is one short sentence that points at something I actually wrote.',
      o=>{
        const R2=$('res');R2.innerHTML='';
        const k=el('div','card ai');k.append(el('div','tag','🎯 FEEDBACK'));
        [['Naturalness','naturalness'],['Clarity','clarity'],['Listening and responsiveness','responsiveness'],['Question quality','questions'],['Tone','tone'],['Respect for boundaries','boundaries']].forEach(([l,key])=>{
          if(!o[key])return;
          const r=el('div','kv');r.append(el('b','',l),el('span','mut',String(o[key])));k.append(r);
        });
        R2.append(k);
        info(R2,'⭐ BEST MOMENT',o.best_moment);info(R2,'🎯 ONE TIP',o.tip);
        const again=el('button','sec','Practice another scenario');again.onclick=practice;R2.append(again);
        addXp(10);
      },()=>fin.onclick());
  };
  rst.onclick=practice;
  herTurn();
}

/* Branches */
function branching(){
  const base=$('tr').value.trim();
  const c=panel('🌿 CONVERSATION BRANCHES','Hypothetical paths, not predictions. Type the message you are about to send.');
  const m=input(c,'Your message, for example: you always this difficult or am i special? 😭',3);
  m.value=lastCopied||'';
  const go=el('button','','Show possible paths');c.append(go);
  let context=base;
  const doit=()=>{
    const t=m.value.trim();if(!t){say('Type a message first.');return}
    run(['Reading the chat...','Imagining paths...'],
      (context?'CONVERSATION SO FAR:\n'+context+'\n\n':'')+styleBlock(true)+'MY MESSAGE: "'+t+'"\n\nImagine 3 plausible, different ways she might respond (for example playful, challenging, or changing the subject). These are hypothetical scenarios, not predictions. '+FMT+'Return ONLY JSON: {"branches":[{"path":"A","she_might":"","you_could":"","why":""},{"path":"B","she_might":"","you_could":"","why":""},{"path":"C","she_might":"","you_could":"","why":""}]}. she_might is her possible text, you_could is my next text, why is one short sentence about the approach.',
      o=>{
        const R=$('res');R.innerHTML='';
        (o.branches||[]).slice(0,3).forEach(b=>{
          if(!b||!b.you_could)return;
          const k=el('div','card ai');
          k.append(el('div','tag','PATH '+(b.path||'')+' · HYPOTHETICAL'),el('div','q','She might say: '+(b.she_might||'')),el('div','mut',b.why||''));
          const cont=el('button','sm','Continue this path');
          cont.onclick=()=>{context=(context+'\nMe: '+t+'\nHer: '+(b.she_might||'')).trim();m.value=b.you_could;doit()};
          k.append(cont);R.append(k);
          R.append(replyCard('PATH '+(b.path||'')+': YOU COULD REPLY',b.you_could,false));
        });
        const back=el('button','sec','Back to the original conversation');back.onclick=branching;R.append(back);
      },doit);
  };
  go.onclick=doit;
}

/* Rizz Battle */
const PAIRS=[['Playful','Nonchalant'],['Funny','Smooth'],['Confident','Sweet'],['Teasing','Direct']];
const FB_B=[
  {scenario:"You canceled plans for a good reason and she is teasing you about it.",her_message:"wow so you just ghost plans now? 🙄",a:{style:"Playful",text:"ghost? i'm a professional rescheduler. thursday, you pick the place"},b:{style:"Nonchalant",text:"fair. thursday works if you're free"},difference:"A keeps the teasing alive and makes a plan. B stays calm and low pressure."},
  {scenario:"You matched with someone and she sent her first message.",her_message:"ok i have to ask, are you actually this funny or is it a bit",a:{style:"Funny",text:"it's a bit. but the bit is going well so i'm keeping it"},b:{style:"Smooth",text:"a little of both. you'll have to find out which part"},difference:"A is a joke that owns it. B stays mysterious and invites her to keep talking."},
  {scenario:"A friend you like texts you late at night.",her_message:"can't sleep. entertain me",a:{style:"Confident",text:"say less. what's the weirdest thing you did this week"},b:{style:"Sweet",text:"i'm here. rough night or just wired?"},difference:"A takes the lead with a fun prompt. B checks in on how she feels first."}
];
async function battle(){
  const pr=PAIRS[Math.floor(Math.random()*PAIRS.length)];
  const stop=loader(['Setting the scene...','Writing two replies...']);
  let o;
  try{
    o=jparse(await gemini([{text:'Create a fictional texting scenario for practice. A girl sends me a message and I have two possible replies in different styles: A is '+pr[0]+' and B is '+pr[1]+'. '+FMT+'Return ONLY JSON: {"scenario":"","her_message":"","a":{"style":"'+pr[0]+'","text":""},"b":{"style":"'+pr[1]+'","text":""},"difference":""}. scenario is one sentence. her_message is her text. A and B are my possible replies, short and natural. difference is one or two sentences on how they differ in tone and direction.'}],1.0,true));
    if(!o.her_message||!o.a||!o.b||!o.a.text||!o.b.text)throw new Error('bad');
  }catch(e){o=FB_B[Math.floor(Math.random()*FB_B.length)]}
  stop();
  const R=$('res');R.innerHTML='';
  const k=el('div','card ai');k.append(el('div','tag','⚔️ RIZZ BATTLE · FICTIONAL'),el('div','',o.scenario||''),el('div','q','Her: '+o.her_message));
  R.append(k);
  let chosenAB=false;
  const reveal=()=>{
    info(R,'HOW THEY DIFFER',o.difference,'ai');
    const t=el('textarea');t.style.height='70px';t.placeholder='Optional: write your own reply for feedback';
    const fb=el('button','sec','Get feedback on mine');
    const out=el('div','card');out.hidden=true;
    fb.onclick=async()=>{
      const v=t.value.trim();if(!v)return;fb.disabled=true;
      try{
        const r=await gemini([{text:'Scenario: '+o.scenario+'\nHer text: "'+o.her_message+'"\nMy reply: "'+v+'"\n\nGive short, kind, constructive feedback (2 or 3 sentences) on naturalness, tone and responsiveness, then one improved version. '+FMT}],0.7);
        out.textContent=r.trim();out.hidden=false;
      }catch(e){say('Error: '+friendly(e.message))}
      fb.disabled=false;
    };
    const nx=el('button','','Next battle');nx.onclick=battle;
    R.append(t,fb,out,nx);
    addXp(5);
  };
  [['A',o.a],['B',o.b]].forEach(([l,x])=>{
    const card=el('div','card');
    card.append(el('div','tag','REPLY '+l+' · '+String(x.style||'').toUpperCase()),el('div','rep',x.text));
    const b=el('button','sec','I prefer '+l);
    b.onclick=()=>{if(chosenAB)return;chosenAB=true;b.textContent='✓ You picked '+l;reveal()};
    card.append(b);R.append(card);
  });
  R.scrollIntoView();
}

/* Daily challenge */
const FB_D=[
  {scenario:"A friend you like sends a short reply after you shared a funny story.",her_message:"lmaooo 😭",options:[{text:"ok that one's yours, now i need to hear your worst story",why:"Turns her reaction into a question that keeps the chat going."},{text:"i'll take that as a 10/10",why:"Playful and short, but gives her less to answer."},{text:"i have more where that came from",why:"Confident, but it is an open loop without a question."}]},
  {scenario:"She teases you for taking a long time to reply.",her_message:"you really took 3 business days to reply huh",options:[{text:"i was building suspense. worth the wait?",why:"Owns it with humor instead of over-apologizing."},{text:"sorry, work got crazy. how was your week?",why:"Honest and warm, a little less playful."},{text:"you counted? i'm flattered",why:"Flips the tease back lightly."}]},
  {scenario:"She says she had a rough day.",her_message:"today was honestly awful",options:[{text:"ugh i'm sorry. what happened?",why:"Simple and sincere. This is a moment for care, not jokes."},{text:"come here. tell me everything",why:"Warm but a bit intense this early."},{text:"want a distraction or want to vent?",why:"Lets her choose what she needs."}]}
];
async function daily(){
  const d=new Date().toISOString().slice(0,10);
  let ch=null;
  try{const c=JSON.parse(S.get('dailyData','null'));if(c&&c.d===d)ch=c.c}catch(e){}
  if(!ch){
    const stop=loader(["Picking today's challenge..."]);
    try{
      const o=jparse(await gemini([{text:'Create a fictional daily texting challenge for practice. '+FMT+'Return ONLY JSON: {"scenario":"","her_message":"","options":[{"text":"","why":""},{"text":"","why":""},{"text":"","why":""}]}. scenario is one sentence. her_message is her text. The 3 options are different, realistic replies from me, and why is one short sentence explaining each.'}],1.0,true));
      if(!o.her_message||!Array.isArray(o.options)||o.options.length<2)throw new Error('bad');
      ch=o;
    }catch(e){ch=FB_D[Math.floor(Date.now()/864e5)%FB_D.length]}
    stop();S.set('dailyData',JSON.stringify({d:d,c:ch}));
  }
  const R=$('res');R.innerHTML='';
  const k=el('div','card ai');
  k.append(el('div','tag','🏆 DAILY CHALLENGE · FICTIONAL'),el('div','',ch.scenario||''),el('div','q','Her: '+ch.her_message),el('div','mut','Pick the reply you would send, or write your own.'));
  R.append(k);
  const whys=el('div');let revealed=false;
  const reveal=()=>{
    if(revealed)return;revealed=true;
    ch.options.forEach((x,i)=>{const w=el('div','card');w.append(el('div','tag','OPTION '+(i+1)),el('div','',x.text),el('div','mut',x.why||''));whys.append(w)});
    if(S.get('dailyDone','')!==d){S.set('dailyDone',d);addXp(10)}else say('Already counted today. Come back tomorrow for a new one.');
  };
  ch.options.forEach((x,i)=>{
    const card=el('div','card');card.append(el('div','tag','OPTION '+(i+1)),el('div','rep',x.text));
    const b=el('button','sec','I would send this');b.onclick=()=>{b.textContent='✓ Your pick';reveal()};
    card.append(b);R.append(card);
  });
  R.append(whys);
  const t=el('textarea');t.style.height='70px';t.placeholder='Or write your own reply';
  const fb=el('button','sec','Get feedback on mine');
  const out=el('div','card');out.hidden=true;
  fb.onclick=async()=>{
    const v=t.value.trim();if(!v)return;fb.disabled=true;
    try{
      const r=await gemini([{text:'Scenario: '+ch.scenario+'\nHer text: "'+ch.her_message+'"\nMy reply: "'+v+'"\n\nGive short, kind, constructive feedback (2 or 3 sentences) on naturalness, tone and responsiveness. '+FMT}],0.7);
      out.textContent=r.trim();out.hidden=false;reveal();
    }catch(e){say('Error: '+friendly(e.message))}
    fb.disabled=false;
  };
  R.append(t,fb,out);R.scrollIntoView();
}

/* Train card */
const tcard=el('div','card');
tcard.append(el('div','tag','🎮 TRAIN AND LIBRARY'));
lv=el('div','mut',lvText());tcard.append(lv);
const g=el('div','grid2');
[['🎯 Practice',practice],['🌿 Branches',branching],['⚔️ Rizz Battle',battle],['🏆 Daily challenge',daily],['📚 Library',showLib]].forEach(([t,f])=>{const b=el('button','sec',t);b.onclick=f;g.append(b)});
tcard.append(g);
(GX.last||$('goals')).after(tcard);
})();
