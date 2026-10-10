/* Game AI extras 5: stop the AI from copying saved example texts */
(function(){
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9\u0600-\u06FF ]/g,'').replace(/\s+/g,' ').trim();
const saved=()=>new Set([...load('mine'),...load('stars')].map(norm).filter(x=>x.length>3));
function isCopy(t,set){
  const n=norm(t);
  if(!n) return false;
  if(set.has(n)) return true;
  if(n.length>=14){for(const s of set){if(s.length>=14&&(s.includes(n)||n.includes(s))) return true}}
  return false;
}

const _g5=gemini;
gemini=async function(parts,temp,json){
  const out=await _g5.apply(this,arguments);
  try{
    if(json&&parts&&parts.length===1&&parts[0].text&&parts[0].text.includes('MY GOAL:')){
      const set=saved();
      const o=JSON.parse(out.slice(out.indexOf('{'),out.lastIndexOf('}')+1));
      const texts=[o.best_reply].concat((o.alternatives||[]).map(a=>a&&a.text)).filter(Boolean);
      if(texts.some(t=>isCopy(t,set))){
        const p2=[{text:parts[0].text+'\n\nYour previous answer copied some of my saved example texts word for word. Write completely NEW texts that directly answer the message I am replying to. None may match or closely resemble any of my example texts.'}];
        return await _g5.call(this,p2,temp,json);
      }
    }
  }catch(e){}
  return out;
};

const _pj=parseJson;
parseJson=function(t){
  const o=_pj(t);
  const set=saved();
  o.alternatives=o.alternatives.filter(a=>!isCopy(a.text,set));
  if(isCopy(o.best_reply,set)&&o.alternatives.length) o.best_reply=o.alternatives.shift().text;
  return o;
};
})();
