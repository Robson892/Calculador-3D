const defaults={quantity:4,weight:48,printTime:120,filamentPrice:89.90,energyPrice:.94,power:150,printerPrice:2000,lifeHours:2000,hourValue:30,laborTime:10,packaging:1.50,profit:150};
const ids=Object.keys(defaults);
let state=JSON.parse(localStorage.getItem("3dprintpro_state")||"null")||{...defaults};
let quotes=JSON.parse(localStorage.getItem("3dprintpro_quotes")||"[]");
const $=id=>document.getElementById(id);
const money=v=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(v)||0);
function calc(s=state){
 const q=Math.max(1,Number(s.quantity)||1), printH=(Number(s.printTime)||0)/60, laborH=(Number(s.laborTime)||0)/60;
 const filamentTotal=(Number(s.weight)||0)*((Number(s.filamentPrice)||0)/1000);
 const energyTotal=printH*((Number(s.power)||0)/1000)*(Number(s.energyPrice)||0);
 const depreciation=printH*((Number(s.lifeHours)||0)>0?(Number(s.printerPrice)||0)/(Number(s.lifeHours)||1):0);
 const maintenance=printH*.30, labor=laborH*(Number(s.hourValue)||0);
 const parts=[filamentTotal/q,energyTotal/q,depreciation/q,maintenance/q,labor/q,Number(s.packaging)||0];
 const cost=parts.reduce((a,b)=>a+b,0), sale=cost*(1+(Number(s.profit)||0)/100);
 return {q,parts,cost,sale,total:sale*q,profit:(sale-cost)*q,filamentTotal,energyTotal,depreciation,maintenance,labor};
}
function save(){localStorage.setItem("3dprintpro_state",JSON.stringify(state))}
function readForm(){
 ids.forEach(id=>{const el=$(id); if(el) state[id]=el.type==="range"?Number(el.value):Number(el.value)||0});
 state.quantity=Math.max(1,Math.round(state.quantity)); save(); render();
}
function fillForm(){ids.forEach(id=>{const el=$(id);if(el)el.value=state[id]});$("profitValue").textContent=state.profit+"%"}
function render(){
 const c=calc(); $("costPiece").textContent=money(c.cost);$("salePiece").textContent=money(c.sale);$("orderTotal").textContent=money(c.total);$("orderProfit").textContent=money(c.profit);$("profitValue").textContent=state.profit+"%";
 const names=["Filamento","Energia","Desgaste","Manutenção","Mão de obra","Embalagem"];
 $("costBreakdown").innerHTML=c.parts.map((v,i)=>`<div class="cost-line"><span>${names[i]}</span><b>${money(v)}</b></div>`).join("")+`<div class="cost-line"><b>Total</b><b>${money(c.cost)}</b></div>`;
 const rows=c.q?new Array(20).fill(0).map((_,i)=>{const q=i+1,cost=(c.filamentTotal/q+c.energyTotal/q+c.depreciation/q+c.maintenance/q+c.labor/q+state.packaging),price=cost*(1+state.profit/100);return {q,cost,price,profit:price-cost}}):[];
 const curQty=Math.min(Math.max(1,Math.round(state.quantity)||1),20);
 $("simTable").innerHTML=rows.map(r=>`<tr class="${r.q===curQty?"highlight":""}"><td>${r.q}</td><td>${money(r.cost)}</td><td>${money(r.price)}</td><td>${money(r.profit)}</td></tr>`).join("");
 drawChart(rows);
 renderSimStats(rows,curQty);
 renderPreview(c);renderHistory();
}
function renderSimStats(rows,curQty){
 if(!rows.length)return;
 const atQty=rows.find(r=>r.q===curQty)||rows[0], minCostRow=rows[rows.length-1], savings=rows[0].cost-minCostRow.cost;
 $("simQtyLabel").textContent=state.quantity;
 $("simCurrentPrice").textContent=money(atQty.price);
 $("simMinCost").textContent=money(minCostRow.cost);
 $("simSavings").textContent=money(savings);
}
function drawChart(rows){
 const canvas=$("chart"),ctx=canvas.getContext("2d"),dpr=devicePixelRatio||1,w=canvas.clientWidth,h=220;canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);
 if(!rows.length)return;
 const padL=54,padB=24,padT=14,padR=10;
 const vals=rows.flatMap(r=>[r.cost,r.price]),max=Math.max(...vals),min=Math.min(...vals),range=(max-min)||1;
 const lineColor=getComputedStyle(document.body).getPropertyValue("--line")||"#e2e8f0";
 const muted=getComputedStyle(document.body).getPropertyValue("--muted")||"#94a3b8";
 const accent=getComputedStyle(document.body).getPropertyValue("--accent")||"#2563eb";
 ctx.strokeStyle=lineColor.trim();ctx.lineWidth=1;ctx.font="11px sans-serif";ctx.fillStyle=muted.trim();
 for(let i=0;i<=3;i++){const y=padT+(h-padT-padB)*i/3;ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(w-padR,y);ctx.stroke();ctx.fillText(money(max-range*i/3),4,y+4)}
 function plot(key,color){
  ctx.beginPath();
  rows.forEach((r,i)=>{const x=padL+i*(w-padL-padR)/(rows.length-1),y=h-padB-(r[key]-min)/range*(h-padT-padB);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});
  ctx.strokeStyle=color.trim();ctx.lineWidth=3;ctx.lineJoin="round";ctx.stroke();
 }
 plot("cost",muted);plot("price",accent);
 ctx.fillStyle=muted.trim();ctx.fillText("1 un.",padL-6,h-6);ctx.fillText("20 un.",w-38,h-6);
}
function renderPreview(c){
 const customer=esc($("customer").value)||"—",product=esc($("productName").value)||"—",notes=esc($("notes").value);
 $("quotePreview").innerHTML=`<h3>Prévia do orçamento</h3>
  <div class="quote-info">
    <p><span>Cliente</span><b>${customer}</b></p>
    <p><span>Produto / peça</span><b>${product}</b></p>
  </div>
  <div class="quote-summary">
    <div><span>Quantidade</span><b>${c.q} un.</b></div>
    <div><span>Preço unitário</span><b>${money(c.sale)}</b></div>
    <div class="total"><span>Total do orçamento</span><b>${money(c.total)}</b></div>
  </div>
  ${notes?`<div class="quote-notes"><span>Observações</span><p>${notes}</p></div>`:""}`
}
function esc(v){return String(v||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function renderHistory(){
 const box=$("historyList");if(!quotes.length){box.innerHTML='<div class="panel"><b>Nenhum orçamento salvo.</b><p style="color:var(--muted)">Os próximos orçamentos aparecerão aqui.</p></div>';return}
 box.innerHTML=quotes.map(q=>`<article class="quote-card"><h3>${esc(q.product||"Peça sem nome")}</h3><p>${esc(q.customer||"Cliente não informado")}</p><p>${new Date(q.date).toLocaleString("pt-BR")} • ${q.quantity} peças</p><p><b>${money(q.total)}</b> • Unitário ${money(q.unit)}</p><div class="quote-actions"><button class="secondary-btn" onclick="reuseQuote('${q.id}')">Reutilizar</button><button class="secondary-btn" onclick="deleteQuote('${q.id}')">Excluir</button></div></article>`).join("")
}
window.reuseQuote=id=>{const q=quotes.find(x=>x.id===id);if(!q)return;state={...q.state};fillForm();save();go("calculator")};
window.deleteQuote=id=>{quotes=quotes.filter(x=>x.id!==id);localStorage.setItem("3dprintpro_quotes",JSON.stringify(quotes));renderHistory()};
function go(id){document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("active",s.id===id));document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.go===id));scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
ids.forEach(id=>$(id)?.addEventListener("input",readForm));
["customer","productName","notes"].forEach(id=>$(id)?.addEventListener("input",()=>renderPreview(calc())));
$("resetBtn").onclick=()=>{state={...defaults};fillForm();save();render()};
$("saveQuote").onclick=()=>{const c=calc();quotes.unshift({id:crypto.randomUUID(),date:new Date().toISOString(),customer:$("customer").value,product:$("productName").value,notes:$("notes").value,quantity:c.q,unit:c.sale,total:c.total,state:{...state}});localStorage.setItem("3dprintpro_quotes",JSON.stringify(quotes));renderHistory();alert("Orçamento salvo!")};
$("clearHistory").onclick=()=>{if(confirm("Apagar todo o histórico?")){quotes=[];localStorage.removeItem("3dprintpro_quotes");renderHistory()}};
$("shareQuote").onclick=async()=>{const c=calc(),text=`ORÇAMENTO DE IMPRESSÃO 3D\nCliente: ${$("customer").value||"-"}\nProduto: ${$("productName").value||"-"}\nQuantidade: ${c.q}\nPreço unitário: ${money(c.sale)}\nTotal: ${money(c.total)}`;if(navigator.share){await navigator.share({title:"Orçamento 3D Print Pro",text})}else{await navigator.clipboard.writeText(text);alert("Resumo copiado para a área de transferência.")}};
$("pdfQuote").onclick=()=>window.print();
$("themeBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("3dprintpro_dark",document.body.classList.contains("dark"))};
if(localStorage.getItem("3dprintpro_dark")==="true")document.body.classList.add("dark");
fillForm();render();
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
