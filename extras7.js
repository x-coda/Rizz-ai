/* Game AI extras 7: pick the saved texts most relevant to the current chat */
(function(){
const STOP=new Set('the a an and or but to of in on at for with is are was were be i you me my your it its that this do did does have has had not no yes so just like what how when where who why can will would could should im ur u ya'.split(' '));
const tok=s=>(String(s||'').toLowerCase().replace(/\[[^\]]*\]/g,' ').match(/[a-z0-9\u0600-\u06FF']+/g)||[]).map(w=>w.replace(/'/g,'')).filter(w=>w.length>1&&!STOP.has(w));
const SYN=[
  [['tysm','ty','thx','thanks','thank','thankyou'],['thanks','thank','ty','tysm','np','npp','welcome','anytime','ofc']],
  [['birthday','bday','bd'],['birthday','bday','happy','celebrate','cake','celebrating']],
  [['lol','lmao','lmfao','haha','hahaha','funny'],['lol','lmao','haha','funny','dead','cry']],
  [['miss','missed'],['miss','missed','missing']],
  [['hey','hi','hello','heyy','heyyy'],['hey','hi','hello','sup','wsp','whats']],
  [['morning','gm'],['morning','gm','wake','sleep']],
  [['night','gn','sleep'],['night','gn','sleep','dream']],
  [['busy','work','working'],['busy','work','later','free']],
  [['sorry','apologize'],['sorry','apologize','forgive','fault']]
];
function expand(words){
  const set=new Set(words);
  SYN.forEach(([keys,adds])=>{if(keys.some(k=>set.has(k)))adds.forEach(a=>set.add(a))});
  return set;
}
function relevant(cands,q,n){
  if(!cands.length||n<=0) return [];
  const df={};
  const toks=cands.map(c=>{const t=new Set(tok(c));t.forEach(w=>{df[w]=(df[w]||0)+1});return t});
  const N=cands.length;
  const scored=cands.map((c,i)=>{let s=0;toks[i].forEach(w=>{if(q.has(w))s+=Math.log(1+N/df[w])});return {c:c,s:s}});
  return scored.filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,n).map(x=>x.c);
}
function mix(list,q,n){
  const rel=relevant(list,q,Math.ceil(n*0.6));
  const left=list.filter(x=>!rel.includes(x));
  return rel.concat(pick(left,n-rel.length));
}

const _sb7=styleBlock;
styleBlock=function(pro){
  try{
    const m=parse($('tr').value);
    if(!m.length) return _sb7(pro);
    const recent=m.slice(-6).map(x=>x.text).join(' ');
    const ar=/[\u0600-\u06FF]/.test(recent), lat=/[A-Za-z]/.test(recent);
    const keep=(ar&&!lat)?(x=>/[\u0600-\u06FF]/.test(x)):(!ar?(x=>!/[\u0600-\u06FF]/.test(x)):(()=>true));
    const ok=x=>keep(x)&&!EXPLICIT.test(x);
    const stars=load('stars').filter(ok);
    const pool=load('mine').filter(ok).filter(x=>!stars.includes(x));
    const tg=m[targetIdx()];
    const q=expand(tok((tg?tg.text+' '+tg.text:'')+' '+m.slice(-4).map(x=>x.text).join(' ')));
    const st=mix(stars,q,pro?6:12);
    const rest=mix(pool,q,pro?12:25);
    const profile=S.get('profile','').trim();
    let b='';
    if(profile) b+=(pro?'MY CASUAL TONE (loose reference only):\n':'MY TEXTING STYLE PROFILE:\n')+profile+'\n\n';
    if(st.length) b+='My favorite texts that I loved. '+(pro?'Use as a loose reference for my tone:':'This is exactly how I want to sound:')+'\n'+st.map(x=>'- '+x).join('\n')+'\n\n';
    if(rest.length) b+='More of my real texts (the first ones are closest to this situation). Use them ONLY to copy my voice, and do NOT reuse their words or topics:\n'+rest.map(x=>'- '+x).join('\n')+'\n\n';
    return b;
  }catch(e){return _sb7(pro)}
};
})();
