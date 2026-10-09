/* Game AI extras 4: language lock, language-matched examples, reply anchor */
(function(){
if(!window.GX||!GX.blocks) return;
const hasAr=s=>/[\u0600-\u06FF]/.test(s);
const hasLat=s=>/[A-Za-z]/.test(s);

function lang(){
  const m=parse($('tr').value);
  if(!m.length) return null;
  const recent=m.slice(-6).map(x=>x.text).join(' ');
  return {ar:hasAr(recent),lat:hasLat(recent)};
}

styleBlock=function(pro){
  const L=lang();
  const keep=!L?(()=>true):(L.ar&&!L.lat)?hasAr:(!L.ar)?(x=>!hasAr(x)):(()=>true);
  const stars=load('stars').filter(keep), mine=load('mine').filter(keep);
  const st=pick(stars,pro?6:12), rest=pick(mine.filter(x=>!stars.includes(x)),pro?10:25);
  const profile=S.get('profile','').trim();
  let b='';
  if(profile) b+=(pro?'MY CASUAL TONE (loose reference only):\n':'MY TEXTING STYLE PROFILE:\n')+profile+'\n\n';
  if(st.length) b+='My favorite texts that I loved. '+(pro?'Use as a loose reference for my tone:':'This is exactly how I want to sound:')+'\n'+st.map(x=>'- '+x).join('\n')+'\n\n';
  if(rest.length) b+='More of my real texts:\n'+rest.map(x=>'- '+x).join('\n')+'\n\n';
  return b;
};

function langLock(){
  const L=lang();
  if(!L) return '';
  if(!L.ar) return 'LANGUAGE LOCK: this chat is in English. Write EVERY text in English only, including the best reply and all alternatives. Do not use any Arabic letters or Arabic words, even if my profile or saved examples contain Arabic.';
  if(!L.lat) return 'LANGUAGE LOCK: this chat is in Arabic. Write EVERY text in Arabic only, in the dialect and style of the chat and my preferences. Do not switch to English.';
  return 'LANGUAGE LOCK: this chat mixes Arabic and English. Mix them the same way she does, and do not switch fully to one language.';
}

function anchor(){
  const m=parse($('tr').value);
  if(!m.length) return '';
  const tg=m[targetIdx()];
  if(!tg||tg.who!=='her') return '';
  return 'ANCHOR: the message I am replying to is: "'+tg.text+'". Every reply must respond directly to THAT message first (for example, if it is a thank-you, answer the thanks) and must fit this conversation. Never change the subject to something that has not come up in the chat. Common texting abbreviations: tysm = thank you so much, ty = thank you, np = no problem, hbu = how about you, wyd = what are you doing, idk = I do not know, ngl = not gonna lie, tbh = to be honest, rn = right now, ikr = I know right, omw = on my way, ily = I love you, imy = I miss you, lmk = let me know, smh = shaking my head, brb = be right back. The word "dear" is a friendly word, not a romantic one by itself.';
}

const _g4=gemini;
gemini=function(parts,temp,json){
  try{
    if(parts&&parts.length===1&&parts[0].text){
      const t=parts[0].text, add=[];
      if(t.includes('CONVERSATION')){const l=langLock();if(l)add.push(l)}
      if(t.includes('MY GOAL:')){const a=anchor();if(a)add.push(a)}
      if(add.length) parts=[{text:t+'\n\n'+add.join('\n')}];
    }
  }catch(e){}
  return _g4.call(this,parts,temp,json);
};
})();
