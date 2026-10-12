window.addEventListener('error',function(e){
  var b=document.getElementById('dbg');
  if(!b){
    b=document.createElement('div');
    b.id='dbg';
    b.style.cssText='position:fixed;left:8px;right:8px;top:8px;z-index:99999;background:#7f1d1d;color:#fff;padding:10px 12px;border-radius:12px;font:12px/1.35 -apple-system,sans-serif;max-height:40vh;overflow:auto;white-space:pre-wrap';
    (document.body||document.documentElement).appendChild(b);
  }
  var f=(e.filename||'').split('/').pop();
  b.textContent+=(b.textContent?'\n\n':'')+'Error: '+e.message+'\n'+f+' line '+e.lineno;
});
