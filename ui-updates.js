/* Interface e avisos independentes dos dados clínicos. Nenhum aviso altera o banco. */
function setupRegistrationSteps(sp){
 const shell=sp.querySelector('.register-shell'),fields=sp.querySelector('.registration-fields');
 const security=sp.querySelector('.registration-security'),heading=security.previousElementSibling;
 const personal=[...fields.children].filter(x=>x!==security&&x!==heading);
 const submit=shell.querySelector('button[onclick="doEntryRegister()"]');
 const step=document.createElement('p');step.className='reg-step-label';shell.querySelector('.registration-title').after(step);
 const back=document.createElement('button');back.type='button';back.className='reg-back';back.textContent='Voltar aos dados pessoais';submit.after(back);
 function show(n){
  shell.classList.toggle('step-security',n===2);
  personal.forEach(x=>x.classList.toggle('reg-step-hidden',n===2));
  [security,heading].forEach(x=>x.classList.toggle('reg-step-hidden',n===1));
  shell.querySelector('.registration-title h2').classList.toggle('reg-step-hidden',n===2);
  back.classList.toggle('reg-step-hidden',n===1);step.textContent=`Etapa ${n} de 2 · ${n===1?'Seus dados':'Segurança'}`;
  submit.textContent=n===1?'Continuar →':'Criar acesso e entrar';
  submit.onclick=()=>{if(n===1){const missing=['regNome','regIdade','regSexo','regCPF','regUser'].map(id=>document.getElementById(id)).find(x=>!x.value.trim());if(missing){document.getElementById('regErr').textContent='Preencha os dados pessoais para continuar.';missing.focus();return;}document.getElementById('regErr').textContent='';show(2);}else doEntryRegister();};
 }
 back.onclick=()=>show(1);show(1);
}
window.VFCNotices=(()=>{
 const storedWeekly=()=>{try{return testStorage.getItem('vfc_notice_weekly')!=='0';}catch{return true;}};
 let config={weekly:storedWeekly(),announcement:null},busy=false,lastFetch=0;
 const weeklyText='Estamos aprimorando o VetFlowCare para tornar sua rotina cada vez mais prática.\n\nObrigado pela confiança e por compartilhar suas sugestões. Pedimos desculpas pelos transtornos das últimas atualizações.\n\nComece a semana com um backup completo salvo em um local seguro.';
 const day=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const dateOK=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(Date.parse(s))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
 function validate(c){
  if(!c||c.version!==1)return null;
  const out={weekly:c.weekly===true,announcement:null},a=c.announcement;
  if(a?.enabled===true&&typeof a.id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(a.id)&&dateOK(a.start)&&dateOK(a.end)&&dateOK(a.updateDate)&&a.start<=a.end&&a.updateDate>=a.start&&a.updateDate<=a.end&&typeof a.title==='string'&&a.title.length<=120&&typeof a.body==='string'&&a.body.length<=1400)out.announcement={...a};
  return out;
 }
 function candidate(c,now=new Date()){
  const today=day(now),a=c?.announcement;
  if(a&&today>=a.start&&today<=a.end)return {...a,key:'campaign-'+a.id,campaign:true};
  if(c?.weekly&&now.getDay()===1)return {key:'monday-'+today,title:'Uma nova semana de cuidado',body:weeklyText,campaign:false};
  return null;
 }
 function seen(key){try{return testStorage.getItem('vfc_notice_seen')===key;}catch{return false;}}
 function dismiss(key){try{testStorage.setItem('vfc_notice_seen',key);}catch{}document.querySelector('.vfc-aviso')?.remove();setTimeout(()=>window.checarNovidades?.(),400);}
 function show(a){
  if(!a||document.querySelector('.vfc-aviso'))return;
  const previous=document.activeElement,ov=document.createElement('div');ov.className='vfc-aviso';
  ov.innerHTML='<section class="vfc-notice-card" role="dialog" aria-modal="true" aria-labelledby="noticeTitle"><div class="vfc-notice-brand">VetFlow<span>Care</span></div><div class="vfc-notice-tag">ORGANIZA · CONECTA · CUIDA</div><div class="vfc-notice-icon" aria-hidden="true"></div><h2 id="noticeTitle"></h2><p class="vfc-notice-body"></p><button class="notice-primary"></button><button class="notice-later">Entendido</button><div class="vfc-notice-signature">Com carinho, equipe VetFlowCare</div></section>';
  ov.querySelector('.vfc-notice-icon').innerHTML=a.campaign?'<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#079c9e" stroke-width="1.6" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M4 15v6h16v-6"/></svg>':accessIcon('shield');ov.querySelector('h2').textContent=a.title;ov.querySelector('p').textContent=a.body;
  const close=()=>{dismiss(a.key);previous?.focus();};
  const primary=ov.querySelector('.notice-primary');primary.textContent='Abrir opções de backup';primary.onclick=()=>{close();goTab('settings');openBackupHelp();};ov.querySelector('.notice-later').onclick=close;
  ov.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const buttons=[...ov.querySelectorAll('button')];if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0].focus();}}});
  document.body.append(ov);primary.focus();
 }
 function ready(){return !window._LOCKED&&document.getElementById('appHeader')&&!document.getElementById('appHeader').classList.contains('hidden')&&!document.querySelector('.access-screen')&&!document.querySelector('#modalBV')&&!document.getElementById('modals')?.innerHTML.trim()&&!document.getElementById('modals2')?.innerHTML.trim()&&document.visibilityState==='visible';}
 function check(){
  if(!ready())return;
  const a=candidate(config);document.getElementById('vfcNoticeBanner')?.remove();
  if(a?.campaign){const banner=document.createElement('button');banner.id='vfcNoticeBanner';banner.textContent='💾 '+a.title+' · Ver aviso';banner.onclick=()=>show(a);document.getElementById('appHeader').after(banner);}
  if(a&&!seen(a.key))show(a);
 }
 async function refresh(){
  if(busy)return;busy=true;const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),4000);
  try{const r=await fetch('./avisos.json',{cache:'no-store',signal:ctrl.signal});if(!r.ok)throw Error('notice unavailable');const raw=await r.text();if(raw.length>12000)throw Error('notice size');config=validate(JSON.parse(raw));if(config){try{testStorage.setItem('vfc_notice_weekly',config.weekly?'1':'0');}catch{}}}catch{config={weekly:storedWeekly(),announcement:null};}finally{clearTimeout(timer);busy=false;lastFetch=Date.now();check();}
 }
 document.addEventListener('DOMContentLoaded',()=>{refresh();setInterval(()=>{if(Date.now()-lastFetch>300000)refresh();else check();},15000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});});
 return {check,refresh,validate,candidate,show};
})();
