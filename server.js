// Hardwood GM – serveur de ligue (Node, zéro dépendance). Sert le jeu + l'API de synchronisation.
const http=require("http"),fs=require("fs"),path=require("path");
const PORT=process.env.PORT||3000,DIR=process.env.DATA_DIR||path.join(__dirname,"data");
const HTML=path.join(__dirname,"Hardwood_GM.html");fs.mkdirSync(DIR,{recursive:true});
const L={},locks={},timers={};
const okCode=c=>/^[a-z0-9]{1,24}$/.test(c);
const file=c=>path.join(DIR,c+".json");
function load(c){
  if(L[c]!==undefined)return L[c];
  try{L[c]=JSON.parse(fs.readFileSync(file(c),"utf8"))}catch(e){L[c]=null}
  return L[c];
}
function save(c){
  clearTimeout(timers[c]);
  timers[c]=setTimeout(()=>{const f=file(c);fs.writeFile(f+".tmp",JSON.stringify(L[c]),e=>{if(!e)fs.rename(f+".tmp",f,()=>{})})},300);
}
const send=(res,code,obj)=>{const b=JSON.stringify(obj);res.writeHead(code,{"content-type":"application/json","cache-control":"no-store"});res.end(b)};
function body(req,cb){let b="",n=0;req.on("data",d=>{n+=d.length;if(n>2e6){req.destroy();return}b+=d});req.on("end",()=>cb(b))}
http.createServer((req,res)=>{
  const u=req.url.split("?")[0];
  if(req.method==="GET"&&(u==="/"||u==="/index.html")){
    fs.readFile(HTML,(e,d)=>{if(e){res.writeHead(500);return res.end("HTML manquant")}res.writeHead(200,{"content-type":"text/html; charset=utf-8","cache-control":"no-cache"});res.end(d)});return;
  }
  if(u==="/api/ping")return send(res,200,{ok:true,hgm:true});
  const m=u.match(/^\/api\/league\/([a-z0-9]+)(\/rev|\/lock)?$/);
  if(!m||!okCode(m[1]))return send(res,404,{error:"not_found"});
  const c=m[1],sub=m[2];
  if(req.method==="GET"&&!sub){const d=load(c);return d?send(res,200,d):send(res,404,{exists:false})}
  if(req.method==="GET"&&sub==="/rev"){const d=load(c);return send(res,200,{rev:d?d.rev:-1})}
  if(req.method==="PUT"&&!sub)return body(req,b=>{
    let d;try{d=JSON.parse(b)}catch(e){return send(res,400,{error:"json"})}
    if(!d||typeof d.rev!=="number"||typeof d.state!=="string")return send(res,400,{error:"format"});
    const cur=load(c);
    if(cur&&d.rev<=cur.rev)return send(res,409,{error:"stale",rev:cur.rev});
    L[c]=d;save(c);send(res,200,{ok:true,rev:d.rev});
  });
  if(req.method==="POST"&&sub==="/lock")return body(req,b=>{
    let o={};try{o=JSON.parse(b)}catch(e){}
    const now=Date.now(),k=locks[c];
    if(!k||k.until<now||k.holder===o.holder){locks[c]={holder:o.holder,until:now+Math.min(5000,o.ttlMs||1500)};return send(res,200,{acquired:true})}
    send(res,200,{acquired:false});
  });
  send(res,404,{error:"not_found"});
}).listen(PORT,()=>console.log("Hardwood GM sur le port "+PORT+", données : "+DIR));
