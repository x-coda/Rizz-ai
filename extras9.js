/* Game AI extras 9: stronger openers and compliments (write 12, edit down to the best 5, optional profile/story image) */
(function(){
if(!window.GX||!GX.run) return;
const {FMT,panel,input,chipRow,jparse}=GX;
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9\u0600-\u06FF ]/g,'').replace(/\s+/g,' ').trim();
const saved=()=>new Set([...load('mine'),...load('stars')].map(norm).filter(x=>x.length>3));
const copied=(t,set)=>{
  const n=norm(t); if(!n) return false;
  if(set.has(n)) return true;
  if(n.length>=14){for(const s of set){if(s.length>=14&&(s.includes(n)||n.includes(s))) return true}}
  return false;
};
function langLine(l){
  if(l==='English') return 'LANGUAGE: write every message in English only.';
  const d=S.get('dialect','Auto-detect from chat');
  return 'LANGUAGE: write every message in natural everyday Arabic as people really text'+(d&&!/^Auto/.test(d)?' ('+d+' dialect)':'')+', never formal Modern Standard Arabic.';
}
const toneBlock=()=>{const p=S.get('profile','').trim();return p?'\nMY CASUAL TONE (loose reference only, never copy wording):\n'+p+'\n':''};
const NOCHAT='There is no chat yet, so ignore any instruction about matching a chat language and follow the LANGUAGE line.';

function strongTool(tag,sub,types,ph,mkA,mkB){
  const shown=[]; let imgCtx='';
  const c=panel(tag,sub);
  const getT=chipRow(c,Object.keys(types),Object.keys(types)[0]);
  c.append(el('div','lbl','LANGUAGE'));
  const getL=chipRow(c,['English','Arabic'],'English');
  const m=input(c,ph,3);
  const fi=el('input'); fi.type='file'; fi.accept='image/*'; fi.hidden=true;
  const up=el('button','sec','📷 Add her profile or story (optional)');
  up.onclick=()=>fi.click();
  fi.onchange=async()=>{
    const f=fi.files[0]; if(!f) return;
    up.disabled=true; up.textContent='Reading...';
    try{
      const d=await toB64(f);
      imgCtx=(await gemini([{text:"This is a screenshot of someone's profile, story or post, shared so I can write a good message to her. Describe ONLY what is visible in short bullet points: setting, activities, objects, places, food, pets, any readable text or bio, and the overall vibe. Never guess who the person is, her name, age, ethnicity, religion, or anything not visible. Output only the bullets."},{inlineData:{mimeType:'image/jpeg',data:d}}],0.2)).trim();
      up.textContent='✓ Profile read - tap to change';
    }catch(e){imgCtx='';up.textContent='📷 Add her profile or story (optional)';say('Error: '+friendly(e.message))}
    up.disabled=false; fi.value='';
  };
  const go=el('button','','Write them');
  c.append(up,fi,go);
  const doit=async()=>{
    const type=getT(), lang=getL(), ctx=[m.value.trim(),imgCtx].filter(Boolean).join('\n');
    go.disabled=true;
    const stop=loader(['Studying the angle...','Writing 12 options...','Cutting the weak ones...','Sharpening the best 5...']);
    try{
      const a=jparse(await gemini([{text:mkA(type,types[type],ctx,lang,shown)}],1.0,true));
      let cands=(a.options||[]).map(x=>x&&(x.text||x)).filter(x=>typeof x==='string'&&x.trim());
      if(cands.length<5) throw new Error('Not enough options came back. Tap Try Again.');
      const set=saved(), clean=cands.filter(t=>!copied(t,set));
      if(clean.length>=5) cands=clean;
      const b=jparse(await gemini([{text:mkB(cands,lang)}],0.5,true));
      const list=(b.options||[]).filter(x=>x&&x.text&&!copied(x.text,set));
      stop();
      if(!list.length) throw new Error('Those came out too close to your old texts. Tap Try Again.');
      list.forEach(x=>shown.push(x.text));
      const R=$('res'); R.innerHTML='';
      list.slice(0,5).forEach((x,i)=>{
        const card=replyCard(String(x.label||('OPTION '+(i+1))).toUpperCase(),x.text,i===0);
        if(x.why) card.append(el('div','mut','Why it works: '+x.why));
        R.append(card);
      });
      const more=el('button','sec','Generate more'); more.onclick=doit; R.append(more);
      R.scrollIntoView();
    }catch(e){stop();showError(friendly(e.message),doit)}
    go.disabled=false;
  };
  go.onclick=doit;
}
const avoid=shown=>shown.length?'\nDo not repeat or closely resemble these earlier options:\n'+shown.map(x=>'- '+x).join('\n')+'\n':'';
const EDITOR=(items,lang,what)=>'Here are candidate '+what+' I might send to a girl:\n'+items.map((t,i)=>(i+1)+'. '+t).join('\n')+'\n\nYou are a ruthless editor. Pick the 5 BEST: the ones most likely to get a warm reply and that sound natural, confident and a little witty. Reject anything generic, cheesy, try-hard, needy, long-winded, sexual, or that sounds like a pickup line. The 5 must use different angles. You may tighten the wording of a pick (keep it natural), but keep its idea.\n'+langLine(lang)+'\n'+NOCHAT+'\n'+FMT+'Return ONLY JSON: {"options":[{"label":"","text":"","why":""}]} with exactly 5 items. label is 1 or 2 words naming the angle; why is one short sentence on why it should get a reply.';

const OPEN={
  'Funny':'a funny first message that makes her smile (a harmless playful accusation, a silly "settle this", or a funny hot take)',
  'Casual':'a relaxed, specific first message about something simple (her day, a plan, a small preference) that is easy to answer',
  'Flirty':'a confident, playful first message with light flirting and a little tease, classy and not sexual',
  'Interest-based':'a first message built on a shared interest or the details I gave, with a real question',
  'Story reply':'a reply to her story or post: react to what is in it and ask something about it',
  'Reconnecting':'a message to someone I have not talked to in a while: warm, light, no guilt-tripping, no "hey stranger"',
  'Conversation starter':'a question or topic that gets a real answer and leads to a back-and-forth'
};
function openers3(){
  strongTool('💬 OPENERS','Add a screenshot of her profile or story for the strongest ones.',OPEN,'Anything you know about her? (optional)',
    (type,help,ctx,lang,shown)=>'You are an elite texting coach. Write 12 DIFFERENT first messages I could send to a girl to start a conversation.\nTYPE: '+type+' - '+help+'\nWHAT I KNOW ABOUT HER: '+(ctx||'nothing, so make them vivid and broadly usable')+'\n\nTHE BAR: each message should feel like it came from someone confident, funny and relaxed who is not trying too hard. It must (1) stand alone with no earlier chat, (2) be specific and vivid instead of generic, (3) give her something fun and easy to answer, (4) have a little spark: a playful assumption, a light challenge, a tease, a funny hot take, a would-you-rather, or a confident curiosity hook.\nMix the angles: a playful assumption about her, a specific observation plus a tease, a light challenge or "prove it", a hot take she will want to argue with, a "settle this" question, and a confident hook.\nRULES: 6 to 18 words, natural texting, lowercase is fine, at most 2 emojis in the whole set. Never plain "hey" or "how are you", never pickup lines, never generic compliments, never needy, nothing sexual or about dominance or intimacy, and do not copy anything I have written before. If I gave details about her, use them, but never invent facts about her.\nQUALITY BAR (the energy only, never reuse their words): "ok i need a ruling: are you a reply-in-5-minutes person or a reply-3-days-later person" / "you give the energy of someone who orders the weird thing on the menu and wins" / "i\'m 90% sure we\'d argue about music and enjoy it. pick a song" / "that story is a cry for a travel buddy. i have notes"\n'+langLine(lang)+'\n'+NOCHAT+toneBlock()+avoid(shown)+FMT+'Return ONLY JSON: {"options":[{"text":""}]} with 12 items.',
    (items,lang)=>EDITOR(items,lang,'opening messages'));
}

const COMP={
  'Appearance':'tasteful, specific compliments about how she looks (her smile, eyes, glow, overall look), never about her body and never sexual',
  'Style':'compliments about her style, outfit choices, taste or aesthetic',
  'Humor':'compliments about her sense of humor, how she makes me laugh, or her wit',
  'Personality':'compliments about her energy, kindness, confidence or how she treats people',
  'Accomplishments':'compliments about something she achieved or worked hard on',
  'Shared interests':'compliments that connect to something we both like'
};
function compliments3(){
  strongTool('🌟 COMPLIMENTS','Specific beats exaggerated. Add what happened or her profile for better ones.',COMP,'What is it about? (what she did, wore, said...) optional',
    (type,help,ctx,lang,shown)=>'You are an elite texting coach. Write 12 DIFFERENT compliments I could text to a girl.\nTYPE: '+type+' - '+help+'\nCONTEXT: '+(ctx||'none given, so keep them general but genuine')+'\n\nTHE BAR: specific and believable, never exaggerated, and never claiming anything the context does not support. Confident and warm, not needy. Each one has a small twist: a playful tease inside the compliment, the effect she has on me, or noticing something others would miss. Each ends in a way she can easily reply to.\nRULES: 6 to 20 words, natural texting, at most 2 emojis in the whole set, nothing sexual, no clichés like "you are beautiful" or "you are so pretty", and do not copy anything I have written before.\n'+langLine(lang)+'\n'+NOCHAT+toneBlock()+avoid(shown)+FMT+'Return ONLY JSON: {"options":[{"text":""}]} with 12 items.',
    (items,lang)=>EDITOR(items,lang,'compliments'));
}

[...document.querySelectorAll('button')].forEach(b=>{
  if(b.textContent==='💬 Openers') b.onclick=openers3;
  if(b.textContent==='🌟 Compliments') b.onclick=compliments3;
});
})();
