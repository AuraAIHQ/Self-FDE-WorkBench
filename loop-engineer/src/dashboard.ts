import { createServer } from "node:http";
import { loadConfig } from "./config.js";
import { scanJobs } from "./jobs.js";
import { loadLedger } from "./usage.js";
import { log } from "./log.js";

const PAGE = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>Loop-Engineer</title>
<style>
:root{--bg:#0e1116;--panel:#161b22;--border:#2b333f;--text:#e6edf3;--muted:#8b98a9;--accent:#4f9dff;--green:#3fb950}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:-apple-system,"PingFang SC",sans-serif;font-size:14px}
.wrap{max-width:900px;margin:0 auto;padding:24px}
.hd{display:flex;align-items:center;justify-content:space-between}
h1{font-size:18px;margin:0 0 4px}.sub{color:var(--muted);font-size:12px;margin-bottom:20px}
#langbtn{background:var(--panel);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:6px 12px;cursor:pointer;font:inherit}
#langbtn:hover{border-color:var(--accent)}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
.card{background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:14px}
.card .k{color:var(--muted);font-size:12px}.card .v{font-size:22px;font-weight:700;margin-top:6px}
.card .v.accent{color:var(--accent)}.card .v.green{color:var(--green)}
table{width:100%;border-collapse:collapse;background:var(--panel);border:1px solid var(--border);border-radius:10px;overflow:hidden}
th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--border);font-size:13px}
th{color:var(--muted);font-weight:600}tr:last-child td{border-bottom:none}
td.num{text-align:right;font-variant-numeric:tabular-nums}
h2{font-size:14px;color:var(--muted);margin:26px 0 10px}
.badge{padding:1px 7px;border-radius:999px;font-size:11px;border:1px solid var(--border)}
.done{color:var(--green);border-color:var(--green)}.failed{color:#f85149;border-color:#f85149}
.dim{color:var(--muted)}
</style></head><body><div class="wrap">
<div class="hd"><h1 data-i18n="title">Loop-Engineer 用量面板</h1><button id="langbtn">EN</button></div>
<div class="sub" id="sub">…</div>
<div class="cards">
  <div class="card"><div class="k" data-i18n="cTok">总 Token（输入+输出）</div><div class="v accent" id="tok">—</div></div>
  <div class="card"><div class="k" data-i18n="cCu">计算秒（墙钟）</div><div class="v" id="cu">—</div></div>
  <div class="card"><div class="k" data-i18n="cCost">成本估算</div><div class="v green" id="cost">—</div></div>
  <div class="card"><div class="k" data-i18n="cCalls">调用次数</div><div class="v" id="calls">—</div></div>
</div>
<h2 data-i18n="byProv">按模型/供应商</h2>
<table id="prov"><thead><tr><th data-i18n="hProv">供应商</th><th class="num" data-i18n="hIn">输入</th><th class="num" data-i18n="hOut">输出</th><th class="num" data-i18n="hCu">计算秒</th><th class="num" data-i18n="hCost">成本估算</th><th class="num" data-i18n="hCalls">次数</th></tr></thead><tbody></tbody></table>
<h2 data-i18n="hJobs">任务</h2>
<table id="jobs"><thead><tr><th data-i18n="hJob">Job</th><th data-i18n="hTask">任务</th><th class="num" data-i18n="hDone">done/总</th></tr></thead><tbody></tbody></table>
<script>
const T={zh:{title:'Loop-Engineer 用量面板',cTok:'总 Token（输入+输出）',cCu:'计算秒（墙钟）',cCost:'成本估算',cCalls:'调用次数',byProv:'按模型/供应商',hProv:'供应商',hIn:'输入',hOut:'输出',hCu:'计算秒',hCost:'成本估算',hCalls:'次数',hJobs:'任务',hJob:'Job',hTask:'任务',hDone:'done/总',updated:'更新于',refresh:'每 3 分钟自动刷新',noUsage:'还没有用量记录，跑一次 run 就有了',noJobs:'watchDirs 下暂无 job',fail:'加载失败：'},
en:{title:'Loop-Engineer Usage',cTok:'Total tokens (in+out)',cCu:'Compute seconds (wall)',cCost:'Est. cost',cCalls:'Calls',byProv:'By model / provider',hProv:'Provider',hIn:'Input',hOut:'Output',hCu:'Compute',hCost:'Est. cost',hCalls:'Calls',hJobs:'Tasks',hJob:'Job',hTask:'Task',hDone:'done/total',updated:'Updated',refresh:'auto-refresh every 3 min',noUsage:'No usage yet — run once to populate',noJobs:'No jobs under watchDirs',fail:'Load failed: '}};
let lang=localStorage.getItem('le:lang')||'zh';let lastAt='—';
const fT=n=>n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e3?(n/1e3).toFixed(1)+'k':''+n;
const fC=u=>u>=0.01?'$'+u.toFixed(2):'$'+u.toFixed(4);
const fS=ms=>{const s=Math.round(ms/1000);return s>=60?Math.floor(s/60)+'m'+(s%60)+'s':s+'s'};
function applyLang(){document.querySelectorAll('[data-i18n]').forEach(e=>{const k=e.getAttribute('data-i18n');if(T[lang][k])e.textContent=T[lang][k]});document.getElementById('langbtn').textContent=lang==='zh'?'EN':'中';document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.getElementById('sub').textContent=T[lang].updated+' '+lastAt+' · '+T[lang].refresh}
document.getElementById('langbtn').onclick=()=>{lang=lang==='zh'?'en':'zh';localStorage.setItem('le:lang',lang);applyLang();load()};
async function load(){
 try{
  const u=await (await fetch('/api/usage')).json();const t=u.total;lastAt=u.updatedAt||'—';
  document.getElementById('tok').textContent=fT(t.inputTokens+t.outputTokens);
  document.getElementById('cu').textContent=fS(t.computeMs);
  document.getElementById('cost').textContent=fC(t.costUsd);
  document.getElementById('calls').textContent=t.calls;
  document.getElementById('sub').textContent=T[lang].updated+' '+lastAt+' · '+T[lang].refresh;
  const pb=document.querySelector('#prov tbody');pb.innerHTML='';
  for(const [name,x] of Object.entries(u.byProvider||{})){const tr=document.createElement('tr');
   tr.innerHTML='<td>'+name+'</td><td class="num">'+fT(x.inputTokens)+'</td><td class="num">'+fT(x.outputTokens)+'</td><td class="num">'+fS(x.computeMs)+'</td><td class="num">'+fC(x.costUsd)+'</td><td class="num">'+x.calls+'</td>';pb.appendChild(tr)}
  if(!Object.keys(u.byProvider||{}).length)pb.innerHTML='<tr><td colspan=6 class=dim>'+T[lang].noUsage+'</td></tr>';
  const s=await (await fetch('/api/status')).json();const jb=document.querySelector('#jobs tbody');jb.innerHTML='';
  for(const j of s.jobs||[])for(const tk of j.tasks){const tr=document.createElement('tr');
   tr.innerHTML='<td class=dim>'+j.id+'</td><td><span class="badge '+tk.status+'">'+tk.status+'</span> '+tk.title+'</td><td class="num">'+j.done+'/'+j.total+'</td>';jb.appendChild(tr)}
  if(!(s.jobs||[]).length)jb.innerHTML='<tr><td colspan=3 class=dim>'+T[lang].noJobs+'</td></tr>';
 }catch(e){document.getElementById('sub').textContent=T[lang].fail+e}
}
applyLang();load();setInterval(load,180000);
</script></div></body></html>`;

export async function startDashboard(port: number): Promise<void> {
  const config = await loadConfig();

  const server = createServer(async (req, res) => {
    try {
      if (req.url === "/api/usage") {
        const ledger = await loadLedger();
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(ledger));
        return;
      }
      if (req.url === "/api/status") {
        const jobs = await scanJobs(config.watchDirs);
        const out = jobs.map((j) => ({
          id: j.manifest.id,
          done: j.manifest.tasks.filter((t) => t.status === "done").length,
          total: j.manifest.tasks.length,
          tasks: j.manifest.tasks.map((t) => ({ id: t.id, title: t.title, status: t.status })),
        }));
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ jobs: out }));
        return;
      }
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(PAGE);
    } catch (e) {
      res.writeHead(500, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: (e as Error).message }));
    }
  });

  // 默认只绑本机
  server.listen(port, "127.0.0.1", () => {
    log.ok(`用量面板已启动：http://127.0.0.1:${port}`);
  });
}
