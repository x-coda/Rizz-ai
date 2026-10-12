/* Game AI extras 8: better openers and compliments */
(function(){
if(!window.GX||!GX.run) return;
const {FMT,run,panel,input,chipRow,cards}=GX;
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9\u0600-\u06FF ]/g,'').replace(/\s+/g,' ').trim();
const saved=()=>new Set([...load('mine'),...load('stars')].map(norm).filter(x=>x.length>3));
const copied=(t,set)=>{
  const n=norm(t); if(!n) return false;
  if(set.has(n)) return true;
  if(n.length>=14){for(const s of set){if(s.length>=14&&(s.includes(n)||n.includes(s))) return true}}
  return false;
};
function langLine(l){
  if(l==='English') return 'Write every message in English only (there is no chat yet, so use this language).';
  const d=S.get('dialect','Auto-detect from chat');
  return 'Write every message in natural everyday Arabic as people really text'+(d&&!/^Auto/.test(d)?' ('+d+' dialect)':'')+', never formal Modern Standard Arabic (there is no chat yet, so use this language).';
}
const toneBlock=()=>{const p=S.get('profile','').trim();return p?'\nMY CASUAL TONE (loose reference only, not wording to copy):\n'+p+'\n':''};
function makeTool(tag,sub,types,ph,mk){
  const shown=[];
  const c=panel(tag,sub);
  const getT=chipRow(c,Object.keys(types),Object.keys(types)[0]);
  c.append(el('div','lbl','LANGUAGE'));
  const getL=chipRow(c,['English','Arabic'],'English');
  const m=input(c,ph,3);
  const go=el('button','','Write them');c.append(go);
  const doit=()=>{
    const type=getT(), lang=getL();
    const prompt=mk(type,types[type],m.value.trim())+'\n'+langLine(lang)+toneBlock()+(shown.length?'\nDo not repeat or closely resemble these earlier options:\n'+shown.map(x=>'- '+x).join('\n')+'\n':'')+'\n'+FMT+'\nReturn ONLY JSON: {"options":[{"label":"","text":""},{"label":"","text":""},{"label":"","text":""},{"label":"","text":""},{"label":"","text":""}]}. Each label is 1 or 2 words naming the angle.';
    run(['Thinking of angles...','Writing them...'],prompt,o=>{
      const set=saved();
      const list=(o.options||[]).filter(x=>x&&x.text&&!copied(x.text,set));
      const R=$('res');R.innerHTML='';
      if(!list.length){showError('Those came out too close to your old texts. Tap Try Again.',doit);return}
      list.forEach(x=>shown.push(x.text));
      cards(R,list,5);
      const more=el('button','sec','Generate more');more.onclick=doit;R.append(more);
    },doit);
  };
  go.onclick=doit;
}

const OPEN={
  'Funny':'a playful, funny first message that makes her smile and is easy to answer (a light dilemma, a silly "settle this" question, or a harmless playful accusation)',
  'Casual':'a relaxed, specific first message about something simple (her day, a plan, a small preference) that is easy to answer',
  'Flirty':'a confident, playful first message with light flirting and a little tease, classy and not sexual',
  'Interest-based':'a first message about a shared interest or something from the context I gave, with a real question',
  'Story reply':'a reply to her story or post: react to what is in it and ask something about it',
  'Reconnecting':'a message to someone I have not talked to in a while: warm, light, no guilt-tripping and no "hey stranger"',
  'Conversation starter':'a question or topic that gets a real answer and leads to a back-and-forth'
};
function openers2(){
  makeTool('💬 OPENERS','A real first message she can easily answer. Tell me what you know about her for better ones.',OPEN,'What do you know? (her story, bio, shared interest...) optional',
    (type,help,ctx)=>'Write 5 different opening messages that I could send to a girl to START a conversation.\nType: '+type+' - '+help+'.\nWhat I know about her: '+(ctx||'nothing, so keep them broadly usable')+'\n\nRULES:\n- Each option is a complete first message that stands on its own and makes sense with NO earlier chat.\n- Each one gives her something easy and fun to answer (a question, a playful challenge, or a light dilemma).\n- 6 to 18 words, natural texting, lowercase is fine, at most one emoji in the whole set.\n- Each option uses a different angle.\n- Never plain "hey" or "hey how are you", never pickup lines, never generic compliments, and nothing sexual or about dominance or intimacy.\n- Do NOT copy or closely resemble any text I have written before.\n- Quality bar (do NOT reuse these): "ok settle this: pizza or tacos for your last meal ever?" / "your story looks like a movie. where is that?" / "i have a theory about you after one look at your profile. want it?"');
}

const COMP={
  'Appearance':'tasteful, specific compliments about how she looks (her smile, eyes, glow, or overall look), never about her body and never sexual',
  'Style':'compliments about her style, outfit choices, taste or aesthetic',
  'Humor':'compliments about her sense of humor, how she makes me laugh, or her wit',
  'Personality':'compliments about her energy, kindness, confidence or how she treats people',
  'Accomplishments':'compliments about something she achieved or worked hard on',
  'Shared interests':'compliments that connect to something we both like'
};
function compliments2(){
  makeTool('🌟 COMPLIMENTS','Sincere beats exaggerated. Add what happened for better ones.',COMP,'What is it about? (what she did, wore, said...) optional',
    (type,help,ctx)=>'Write 5 different sincere compliments I could text to a girl.\nType: '+type+' - '+help+'.\nContext: '+(ctx||'none given, so keep them general but genuine')+'\n\nRULES:\n- Specific and believable, never exaggerated, and never claiming anything the context does not support.\n- Each can be sent on its own and ends in a way she can easily reply to.\n- 6 to 20 words, natural texting, at most one emoji in the whole set.\n- Each option uses a different angle, with no copies of my old texts and nothing sexual.');
}

[...document.querySelectorAll('button')].forEach(b=>{
  if(b.textContent==='💬 Openers') b.onclick=openers2;
  if(b.textContent==='🌟 Compliments') b.onclick=compliments2;
});
})();
