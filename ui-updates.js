/* Referências oficiais recebidas: arte intacta e controles HTML sobrepostos. */
// Mostra o erro de validação do cadastro diretamente no campo (borda vermelha + foco), em vez de
// só num texto pequeno lá embaixo. Se o campo estiver na etapa 1 mas a tela atual for a etapa 2
// (Segurança), volta para a etapa 1 automaticamente antes de focar, pra o campo ficar visível.
function regFieldErr(fieldId, msg){
 const err = document.getElementById('regErr');
 document.querySelectorAll('#splash.art-registration input.field-error,#splash.art-registration select.field-error').forEach(x=>x.classList.remove('field-error'));
 const shell = document.querySelector('.register-shell');
 const stepOneFields = ['regNome','regIdade','regSexo','regCPF','regUser'];
 if(fieldId && shell?.classList.contains('step-security') && stepOneFields.includes(fieldId)){
  document.querySelector('.reg-back')?.click();
 }
 if(err) err.textContent = msg;
 const input = fieldId && document.getElementById(fieldId);
 if(input){
  input.classList.add('field-error');
  input.focus();
  input.scrollIntoView?.({block:'center',behavior:'smooth'});
 }
}
function referenceIcon(name){
 const paths={person:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 6 0 0 1 16 0v3z"/>',calendar:'<rect x="3" y="5" width="18" height="17" rx="2"/><path d="M7 2v6m10-6v6M3 11h18"/>',gender:'<circle cx="10" cy="10" r="6"/><path d="M10 16v7m-3-3h6m1-14 7-5m-5 0h5v5"/>',document:'<rect x="5" y="2" width="14" height="21" rx="2"/><path d="M8 7h8M8 11h8m-8 4h5"/>',mail:'<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 6 9 8 9-8"/>',bulb:'<path d="M8 17c0-4-4-4-4-9a8 8 0 0 1 16 0c0 5-4 5-4 9zM8 20h8m-6 3h4"/>',gift:'<rect x="2" y="8" width="20" height="5" rx="1"/><path d="M4 13v10h16V13M12 8v15"/><path d="M12 8C2 8 3 0 7 2c3 1 5 6 5 6s2-5 5-6c4-2 5 6-5 6"/>'};
 return paths[name]?'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+paths[name]+'</svg>':accessIcon(name);
}
function fitReferenceFrames(){
 const viewport=window.visualViewport;if(viewport&&Math.abs(viewport.scale-1)>.02)return;
 document.querySelectorAll('.reference-frame').forEach(frame=>{
  const parent=frame.parentElement,style=getComputedStyle(parent);
  const rawWidth=parent.clientWidth-(parseFloat(style.paddingLeft)||0)-(parseFloat(style.paddingRight)||0);
  const width=Math.min(rawWidth,480);
  frame.style.width=width+'px';
  // A altura NÃO é mais calculada a partir de innerHeight: em celulares reais, innerHeight pode
  // não bater com a altura de fato renderizada da caixa position:fixed;inset:0 (#splash /
  // .access-screen) — varia com a barra de endereço do navegador — e esse descompasso é o que
  // causava corte na arte/caixa da senha (frame com altura diferente da área realmente visível).
  // Em vez disso, .reference-frame tem height:100% no CSS (herda a altura real já resolvida pelo
  // navegador para o próprio container fixo) e aqui só LEMOS o valor já renderizado.
  const height=Math.max(320,frame.clientHeight||innerHeight);
  const baseW=Number(frame.dataset.artWidth),baseH=Number(frame.dataset.artHeight);
  // "Cover" (por pedido explícito do Bruno): a arte SEMPRE preenche a tela inteira, sem sobrar
  // nenhuma faixa vazia — se a proporção do aparelho não bater com a da arte, o excesso é cortado
  // (geralmente nas laterais, no texto decorativo/patinhas), nunca deixado como espaço em branco.
  // Antes usávamos "contain" pra nunca cortar o texto lateral, mas o espaço vazio resultante
  // parecia "serviço mal feito" — o Bruno prefere o corte a sobrar espaço.
  const scale=Math.max(width/baseW,height/baseH);
  frame.style.setProperty('--ref-scale',String(scale));
  const stage=frame.querySelector('.reference-stage');
  if(stage){
   // Centraliza o corte (sobra/falta dividida igual dos dois lados) — sem isso o corte inteiro
   // cairia de um lado só, ainda mais perceptível.
   stage.style.left=((width-baseW*scale)/2)+'px';
   stage.style.top=((height-baseH*scale)/2)+'px';
  }
 });
}
function setupReferenceFrame(frame,width,height){
 frame.classList.add('reference-frame');frame.dataset.artWidth=width;frame.dataset.artHeight=height;
 const stage=document.createElement('div');stage.className='reference-stage';stage.style.width=width+'px';stage.style.height=height+'px';
 while(frame.firstChild)stage.appendChild(frame.firstChild);frame.appendChild(stage);fitReferenceFrames();
}
window.addEventListener('resize',fitReferenceFrames);window.visualViewport?.addEventListener('resize',fitReferenceFrames);
function setupRegistrationSteps(sp){
 const shell=sp.querySelector('.register-shell'),fields=sp.querySelector('.registration-fields');
 const security=sp.querySelector('.registration-security'),heading=security.previousElementSibling;
 const row=document.createElement('div');row.className='registration-pair';
 const cpf=sp.querySelector('#regCPF'),user=sp.querySelector('#regUser');cpf.before(row);row.append(cpf,user);
 sp.querySelector('#regIdade').parentElement.classList.add('registration-person-row');
 sp.querySelector('#regPass').placeholder='Senha (6+)';sp.querySelector('#regPass2').placeholder='Confirmar';sp.querySelector('#regHint').placeholder='Dica de senha (opcional)';
 for(const[id,icon]of Object.entries({regNome:'person',regIdade:'calendar',regSexo:'gender',regCPF:'document',regUser:'person',regEmail:'mail',regPass:'lock',regPass2:'lock',regHint:'bulb'})){
  const input=sp.querySelector('#'+id);let wrap=input.parentElement;
  if(!wrap.classList.contains('pwwrap')){wrap=document.createElement('div');input.before(wrap);wrap.appendChild(input);}
  wrap.classList.add('reference-field');if(['regNome','regEmail','regHint'].includes(id))wrap.classList.add('reference-wide');
  const symbol=document.createElement('span');symbol.className='reference-field-icon';symbol.innerHTML=referenceIcon(icon);wrap.prepend(symbol);
 }
 const toggle=sp.querySelector('.registration-toggle');
 toggle.firstElementChild.firstElementChild.textContent='Proteger com senha?';toggle.insertAdjacentHTML('afterbegin','<span class="reference-toggle-icon">'+referenceIcon('lock')+'</span>');
 const note=sp.querySelector('#regSenhaCampos').lastElementChild;note.classList.add('reference-security-note');note.innerHTML=referenceIcon('shield')+'<span>Dados criptografados (AES-256) · Guarde bem a senha</span>';
 const trial=shell.querySelector(':scope>div[style*="rgba(45,192,174"]');trial.classList.add('reference-trial');trial.innerHTML=referenceIcon('gift')+'<div><b>Teste grátis por 30 dias</b><p>Ao criar sua conta, você libera <strong>todas as funções</strong> por 30 dias, sem compromisso.</p></div>';
 const personal=[...fields.children].filter(x=>x!==security&&x!==heading);
 const submit=shell.querySelector('button[onclick="doEntryRegister()"]');
 const step=document.createElement('p');step.className='reg-step-label';shell.querySelector('.registration-title').after(step);
 const back=document.createElement('button');back.type='button';back.className='reg-back';back.textContent='Voltar aos dados pessoais';submit.after(back);
 const scene=document.createElement('div');scene.className='registration-scene';
 scene.innerHTML='<img class="registration-background" src="register-data-art.png" alt=""><img class="registration-foreground" src="register-data-art.png" alt="" aria-hidden="true">';
 sp.appendChild(scene);scene.querySelector('.registration-background').after(shell);setupReferenceFrame(scene,864,1536);
 function show(n){
  // Troca de etapa sempre limpa aviso de erro e destaque de campo anteriores — evita mensagem
  // "fantasma" de uma etapa aparecendo em outra (ex: erro do passo 1 ainda visível após "Voltar").
  document.getElementById('regErr').textContent='';
  sp.querySelectorAll('input.field-error,select.field-error').forEach(x=>x.classList.remove('field-error'));
  shell.classList.toggle('step-security',n===2);scene.classList.toggle('reference-step-security',n===2);
  for(const img of scene.querySelectorAll('.registration-background,.registration-foreground'))img.src=n===1?'register-data-art.png':'register-security-art.png';
  personal.forEach(x=>x.classList.toggle('reg-step-hidden',n===2));
  [security,heading].forEach(x=>x.classList.toggle('reg-step-hidden',n===1));
  shell.querySelector('.registration-title h2').classList.toggle('reg-step-hidden',n===2);
  back.classList.toggle('reg-step-hidden',n===1);step.textContent=`Etapa ${n} de 2 · ${n===1?'Seus dados':'Segurança'}`;
  submit.textContent=n===1?'Continuar →':'Criar acesso e entrar →';
  submit.onclick=()=>{
   if(n===1){
    const missing=['regNome','regIdade','regSexo','regCPF','regUser'].map(id=>document.getElementById(id)).find(x=>!x.value.trim());
    if(missing){regFieldErr(missing.id,'⚠ Preencha os dados pessoais para continuar');return;}
    const nomeVal=document.getElementById('regNome').value.trim();
    // Valida nome completo já na etapa 1 (antes o aviso só aparecia depois, na etapa 2, com o
    // campo Nome Completo fora de vista — agora o usuário vê e corrige na hora).
    if(nomeVal.length<3||!nomeVal.includes(' ')){regFieldErr('regNome','⚠ Informe seu nome completo (nome e sobrenome)');return;}
    show(2);
   }else doEntryRegister();
  };
  fitReferenceFrames();
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
/* VisualViewport mantém formulários e rodapés de diálogos acessíveis com teclado. */
(function(){
 function size(){
  const viewport=window.visualViewport;
  // O zoom manual deve continuar livre: só acompanha teclado/rotação em escala normal.
  if(viewport && Math.abs(viewport.scale-1)>.02)return;
  document.documentElement.style.setProperty('--vfc-visual-height',(viewport?viewport.height:window.innerHeight)+'px');
  document.documentElement.style.setProperty('--vfc-offset',(viewport?viewport.offsetTop:0)+'px');
 }
 window.addEventListener('resize',size);window.visualViewport?.addEventListener('resize',size);window.visualViewport?.addEventListener('scroll',size);size();
})();
