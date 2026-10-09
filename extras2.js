/* Game AI extras 2: Write tools + Don't overthink mode */
(function(){
const GX=window.GX={blocks:[]};
const FMT='Never write sexually explicit content. Respect boundaries: if someone declines or is not interested, do not help pressure them. Keep texts short, natural and in my voice. ';
const jparse=t=>{t=t.replace(/^```(?:json)?/i,'').replace(/```$/,'').trim();return JSON.parse(t.slice(t.indexOf('{'),t.lastIndexOf('}')+1))};
const ctx=()=>{const t=$('tr').value.trim();return t?'CONVERSATION SO FAR (for context):\n'+t+'\n\n':''};
async function run(steps,prompt,draw,retry){
  const stop=loader(steps);
  try{const o=jparse(await gemini([{text:prompt}],0.8,true));stop();draw(o);$('res').scrollIntoView()}
  catch(e){stop();showError(friendly(e.message),retry)}
}
function panel(tag,sub){
  const R=$('res');R.innerHTML='';
  const c=el('div','card ai');c.append(el('div','tag',tag));
  if(sub)c.append(el('div','mut',sub));
  R.append(c);R.scrollIntoView();return c;
}
function input(c,ph,rows){
  const t=el(rows>1?'textarea':'input');
  if(rows>1)t.style.height=(rows*26)+'px';else t.type='text';
  t.placeholder=ph;c.append(t);return t;
}
function chipRow(c,list,def,on){
  const r=el('div','row');let cur=def;
  list.forEach(n=>{
    const b=el('button','chip'+(n===def?' on':''),n);
    b.onclick=()=>{cur=n;r.querySelectorAll('.chip').forEach(x=>x.classList.remove('on'));b.classList.add('on');if(on)on(n)};
    r.append(b);
  });
  c.append(r);return()=>cur;
}
function cards(R,list,n){
  (list||[]).filter(x=>x&&x.text).slice(0,n||5).forEach((x,i)=>R.append(replyCard(String(x.label||('OPTION '+(i+1))).toUpperCase(),x.text,i===0)));
}
function info(R,tag,text,cls){
  if(!text)return;
  const c=el('div','card'+(cls?' '+cls:''));c.append(el('div','tag',tag),el('div','',String(text)));R.append(c);
}
Object.assign(GX,{FMT,jparse,ctx,run,panel,input,chipRow,cards,info});

/* Decode */
function decode(){
  const c=panel('🔍 DECODE THIS MESSAGE','Paste the message. I will use the chat you loaded as context, if there is one.');
  const m=input(c,"Her message, for example: you're actually so unserious 😭",3);
  const go=el('button','','Decode');c.append(go);
  const doit=()=>{
    const t=m.value.trim();if(!t){say('Paste a message first.');return}
    run(['Reading the message...','Checking the context...','Writing replies...'],
      ctx()+styleBlock(true)+'MESSAGE TO DECODE (from her): "'+t+'"\n\nExplain what it most plausibly means. Do not present one meaning as certain when it is ambiguous, and do not claim to know her feelings. '+FMT+'Return ONLY JSON: {"plain":"","meanings":["",""],"tone":"","uncertain":"","strategy":"","replies":[{"label":"Playful","text":""},{"label":"Funny","text":""},{"label":"Casual","text":""},{"label":"Flirty if it fits","text":""}]}. plain is one or two sentences. meanings has 2 or 3 short possibilities. tone, uncertain and strategy are one short sentence each. replies are my texts back to her.',
      o=>{
        const R=$('res');R.innerHTML='';
        const k=el('div','card ai');k.append(el('div','tag','🔍 DECODED'),el('div','',o.plain||''));
        (o.meanings||[]).forEach(x=>k.append(el('div','q',String(x))));
        R.append(k);
        info(R,'TONE',o.tone);info(R,'WHAT IS UNCERTAIN',o.uncertain);info(R,'STRATEGY',o.strategy);
        cards(R,o.replies,4);
      },doit);
  };
  go.onclick=doit;
}

/* Cringe check */
function cringe(){
  const c=panel('😬 IS THIS CRINGE?','Paste what you want to send. I will check it against the chat, if one is loaded.');
  const m=input(c,'Your message...',3);
  const go=el('button','','Check it');c.append(go);
  const doit=()=>{
    const t=m.value.trim();if(!t){say('Paste your message first.');return}
    run(['Reading your message...','Checking the tone...','Writing better versions...'],
      ctx()+styleBlock(true)+'MESSAGE I AM THINKING OF SENDING: "'+t+'"\n\nGive an honest, kind, concise assessment. Do not humiliate me or treat an ordinary message as embarrassing. Check naturalness, clarity, confidence, tone, awkwardness, whether it is too formal, too long or too aggressive, and whether it fits my texting style. '+FMT+'Return ONLY JSON: {"verdict":"","checks":[{"label":"Naturalness","note":""},{"label":"Clarity","note":""},{"label":"Confidence","note":""},{"label":"Tone","note":""},{"label":"Length","note":""}],"alternatives":[{"label":"Smoother","text":""},{"label":"Shorter","text":""},{"label":"Funnier","text":""},{"label":"More confident","text":""},{"label":"More natural","text":""}]}. verdict is one sentence. Each note is a few words to one short sentence.',
      o=>{
        const R=$('res');R.innerHTML='';
        const k=el('div','card ai');k.append(el('div','tag','😬 VERDICT'),el('div','big',o.verdict||''));
        (o.checks||[]).forEach(x=>{const r=el('div','kv');r.append(el('b','',String(x.label||'')),el('span','mut',String(x.note||'')));k.append(r)});
        R.append(k);
        cards(R,o.alternatives,5);
      },doit);
  };
  go.onclick=doit;
}

/* Openers and compliments */
function generator(tag,sub,types,ph,mk){
  const c=panel(tag,sub);
  const get=chipRow(c,types,types[0]);
  const m=input(c,ph,3);
  const go=el('button','','Generate');c.append(go);
  const doit=()=>{
    run(['Thinking...','Writing options...'],
      ctx()+styleBlock(true)+rulesText()+mk(get())+'\n\nMy extra context: '+(m.value.trim()||'none')+'\n'+FMT+'Return ONLY JSON: {"options":[{"label":"","text":""},{"label":"","text":""},{"label":"","text":""},{"label":"","text":""},{"label":"","text":""}]}. Each label is 1 or 2 words naming the angle.',
      o=>{
        const R=$('res');R.innerHTML='';
        cards(R,o.options,5);
        const more=el('button','sec','Generate more');more.onclick=doit;R.append(more);
      },doit);
  };
  go.onclick=doit;
}
function openers(){
  generator('💬 OPENERS','Pick a type. Add anything you know about her (optional).',['Funny','Casual','Flirty','Interest-based','Story reply','Reconnecting','Conversation starter'],'What do you know? (her story, bio, shared interest...)',
    t=>'Write 5 different "'+t+'" opening messages to a girl. Make them natural, specific and respectful: no plain "hey", no pickup lines, no generic compliments. If I gave context, use it. If not, keep them broadly usable.');
}
function compliments(){
  generator('🌟 COMPLIMENTS','Sincere beats exaggerated. Add context for better ones.',['Appearance','Style','Humor','Personality','Accomplishments','Shared interests'],'What is it about? (what she did, wore, said...)',
    t=>'Write 5 sincere compliments about her '+t.toLowerCase()+'. Specific, not exaggerated, and never claiming anything the context does not support. If I gave no context, keep them general but genuine.');
}

/* Date invitation */
function dateInvite(){
  const c=panel('📅 DATE INVITATION','I will use your chat as context, if one is loaded.');
  const act=input(c,'Activity (coffee, walk, dinner...)',1);
  const place=input(c,'General area (optional)',1);
  const budget=input(c,'Budget (optional)',1);
  const when=input(c,'Preferred day or time (optional)',1);
  const get=chipRow(c,['Casual','Playful','Direct','Thoughtful','Confident'],'Casual');
  const go=el('button','','Write invitations');c.append(go);
  const doit=()=>{
    run(['Reading the chat...','Writing invitations...'],
      ctx()+styleBlock(true)+rulesText()+'Write 5 texts inviting her out. Tone: '+get()+'. Activity: '+(act.value||'my choice')+'. Area: '+(place.value||'unspecified')+'. Budget: '+(budget.value||'unspecified')+'. When: '+(when.value||'flexible')+'. Make a clear invitation without pressure, tied to the chat when possible. '+FMT+'Also write one graceful reply for if she declines or cannot make it, that accepts her answer and does not push. Return ONLY JSON: {"options":[{"label":"","text":""},{"label":"","text":""},{"label":"","text":""},{"label":"","text":""},{"label":"","text":""}],"if_she_declines":""}.',
      o=>{
        const R=$('res');R.innerHTML='';
        cards(R,o.options,5);
        if(o.if_she_declines) R.append(replyCard('IF SHE DECLINES',o.if_she_declines,false));
      },doit);
  };
  go.onclick=doit;
}

/* Write card */
const wcard=el('div','card');
wcard.append(el('div','tag','✍️ WRITE'));
const g=el('div','grid2');
[['🔍 Decode',decode],['😬 Cringe check',cringe],['💬 Openers',openers],['🌟 Compliments',compliments],['📅 Date invite',dateInvite]].forEach(([t,f])=>{const b=el('button','sec',t);b.onclick=f;g.append(b)});
wcard.append(g);
$('goals').nextElementSibling.after(wcard);
GX.last=wcard;

/* Don't overthink mode + shared prompt blocks */
GX.blocks.push(()=>S.get('calm','')==='1'?"DON'T OVERTHINK IT MODE is ON: favor short, relaxed, natural texts, less forced flirting, fewer exaggerated compliments, and no unnecessary follow-up messages. If waiting is the better move, say so.":'');
const _g2=gemini;
gemini=function(parts,temp,json){
  try{
    if(parts&&parts.length===1&&parts[0].text&&!/Here are real texts I sent/.test(parts[0].text)){
      const b=GX.blocks.map(f=>{try{return f()}catch(e){return ''}}).filter(Boolean).join('\n');
      if(b) parts=[{text:parts[0].text+'\n\n'+b+'\nKeep the output format exactly as requested above.'}];
    }
  }catch(e){}
  return _g2.call(this,parts,temp,json);
};
const cu=$('custom');
cu.append(el('div','lbl',"DON'T OVERTHINK IT MODE"));
const cs=el('select');
[['','Off'],['1','On']].forEach(([v,t])=>{const o=el('option','',t);o.value=v;cs.append(o)});
cs.value=S.get('calm','');
cs.onchange=()=>S.set('calm',cs.value);
cu.append(cs);
})();
