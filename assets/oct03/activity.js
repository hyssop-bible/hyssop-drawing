(function(){
'use strict';
const pairs=[
 {made:'건물',madeFile:'building.jpg',madeText:'건물은 사람이 지었어요.',nature:'나무',natureFile:'tree.jpg',natureText:'나무는 하나님이 만드신 자연이에요.'},
 {made:'놀이터',madeFile:'playground.jpg',madeText:'놀이터의 놀이 기구는 사람이 만들었어요.',nature:'강아지',natureFile:'dog.jpg',natureText:'강아지도 하나님이 만드신 자연이에요.'},
 {made:'버스정류장',madeFile:'shelter.jpg',madeText:'버스정류장은 사람이 만들었어요.',nature:'사과',natureFile:'apple-1200.jpg',natureText:'나무에서 열린 사과는 하나님이 만드신 자연이에요.'},
 {made:'다리',madeFile:'bridge.jpg',madeText:'다리는 사람이 만들었어요.',nature:'물고기',natureFile:'fish.jpg',natureText:'물고기도 하나님이 만드신 자연이에요.'},
 {made:'등대',madeFile:'lighthouse.jpg',madeText:'등대는 사람이 지었어요.',nature:'새',natureFile:'bird.jpg',natureText:'새도 하나님이 만드신 자연이에요.'},
 {made:'건물',madeFile:'building.jpg',madeText:'건물은 사람이 지었어요.',nature:'도토리',natureFile:'acorn.jpg',natureText:'도토리는 참나무에서 자라는 열매예요. 하나님이 만드신 자연이에요.'},
 {made:'놀이터',madeFile:'playground.jpg',madeText:'놀이터의 놀이 기구는 사람이 만들었어요.',nature:'밤',natureFile:'chestnut.jpg',natureText:'밤은 밤나무에서 자라는 열매예요. 하나님이 만드신 자연이에요.'}
];
const $=id=>document.getElementById(id);
const states=pairs.map(()=>({pick:null,stage:'find',fruit:[false,false],met:false}));
const requestedPage=Number(new URLSearchParams(location.search).get('page'));
let page=Number.isInteger(requestedPage)&&requestedPage>=1&&requestedPage<=pairs.length?requestedPage-1:0, gallery=false, epoch=0;
const animations=new Set();
let inputMode='drag',drag=null;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const fruitArt=kind=>kind==='acorn' ? '<img src="assets/oct03/acorn-realistic.png" alt="" draggable="false" aria-hidden="true">'  : `<svg viewBox="0 0 120 140" aria-hidden="true"><path d="M60 15 C51 30 18 42 13 82 C7 114 27 130 60 130 C95 130 114 114 108 82 C102 46 69 32 60 15Z" fill="#794127" stroke="#512d22" stroke-width="3"/><path d="M17 106 Q60 84 105 106 C99 124 81 130 60 130 C39 130 22 124 17 106Z" fill="#d3af76"/><path d="M34 49 Q19 68 25 87" fill="none" stroke="#c08a56" stroke-width="7" stroke-linecap="round"/><path d="M32 112 L35 121 M44 108 L46 124 M57 106 L57 126 M70 108 L69 124 M83 111 L80 122" stroke="#a18459" stroke-width="2"/></svg>`;
function kind(){return page===5?'acorn':'chestnut'}
function hasActivity(){return page>=5}
function instruction(){
 if(gallery)return '오늘 만난 자연이에요. 사진을 눌러 다시 보세요.';
 const s=states[page],p=pairs[page];
 if(s.stage==='collect')return `${p.nature}${page===5?'를':'을'} ${inputMode==='drag'?'잡고 바구니로 끌어 보세요.':'눌러 바구니에 담아 보세요.'}`;
 if(s.stage==='review')return `${p.nature} 두 개를 담았어요. 하나님이 만드신 자연이에요.`;
 return '하나님이 만드신 자연을 찾아볼까요?';
}
function cancelMotion(){cancelDrag();epoch++;for(const a of animations)a.cancel();animations.clear();document.querySelectorAll('.flying').forEach(el=>el.remove());}
function action(text,fn){const b=$('activity-action');b.hidden=!text;b.textContent=text||'';b.onclick=fn||null;}
function move(index){cancelMotion();gallery=false;page=index;render();$('title').focus();}
function feedback(){
 const s=states[page],p=pairs[page];
 for(const type of ['made','nature']){$(type).classList.toggle('selected',s.pick===type);$(type).setAttribute('aria-pressed',String(s.pick===type));}
 $('feedback').classList.toggle('correct',s.pick==='nature');
 $('feedback').textContent=s.pick==='nature'?p.natureText:s.pick==='made'?p.madeText+' 다른 사진도 살펴볼까요?':'자연이라고 생각하는 사진을 눌러 보세요.';
 action(hasActivity()&&s.pick==='nature'?'바구니에 담아 볼까요?':null,()=>{cancelMotion();s.stage='collect';render();$('title').focus();});
}
function fillBasket(){const s=states[page];$('basket-fruits').innerHTML=s.fruit.filter(Boolean).map(()=>fruitArt(kind())).join('');$('basket-label').textContent=s.fruit.every(Boolean)?'두 개를 담았어요':s.fruit.some(Boolean)?'한 개를 담았어요':'바구니';}
function finishCollect(){
 fillBasket();
 const done=states[page].fruit.every(Boolean);
 $('feedback').textContent=done?'두 개가 바구니에 쏙!':instruction();$('feedback').classList.toggle('correct',done);
 action(done?'담은 열매 보기':null,()=>{cancelMotion();states[page].stage='review';render();$('title').focus();});
}
async function collectFruit(index,button,dropRect){
 const s=states[page];if(s.fruit[index])return;
 s.fruit[index]=true;
 const token=epoch;
 const from=dropRect||button.getBoundingClientRect(),to=$('basket-fruits').getBoundingClientRect();
 const flying=document.createElement('div');flying.className='fruit flying';flying.innerHTML=fruitArt(kind());
 Object.assign(flying.style,{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'});
 button.disabled=true;button.setAttribute('aria-label',`${pairs[page].nature} ${index+1}번 담았어요`);
 const other=$('fruit-tray').querySelector('button:not(:disabled)');if(other)other.focus();
 if(!reduced.matches && flying.animate){
  document.body.appendChild(flying);
  const a=flying.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${to.left+to.width/2-from.left-from.width/2+(index===0?-38:38)}px,${to.top-from.top}px) scale(.6)`,opacity:1}],{duration:550,easing:'ease-in-out',fill:'forwards'});
  animations.add(a);try{await a.finished}catch(e){}animations.delete(a);flying.remove();
 }
 if(token!==epoch)return;
 // Wait for both flights before replacing the basket contents or moving focus.
 if(animations.size)return;
 finishCollect();
 if(s.fruit.every(Boolean))$('activity-action').focus();
}

function inBasket(x,y){const r=$('basket-area').getBoundingClientRect();return x>=r.left-20&&x<=r.right+20&&y>=r.top-15&&y<=r.bottom+15;}
function cancelDrag(){
 if(!drag)return;
 const d=drag;drag=null;d.clone?.remove();d.button.classList.remove('grabbed');$('basket-area').classList.remove('drop-ready');
 if(d.button.hasPointerCapture(d.pointerId))d.button.releasePointerCapture(d.pointerId);
 d.button.onpointermove=d.button.onpointerup=d.button.onpointercancel=d.button.onlostpointercapture=null;
}
function startDrag(e,index,button){
 if(inputMode!=='drag'||button.disabled||drag||!e.isPrimary||e.button!==0)return;
 e.preventDefault();
 const r=button.getBoundingClientRect();
 drag={button,index,pointerId:e.pointerId,x:e.clientX,y:e.clientY,r,clone:null};
 button.setPointerCapture(e.pointerId);
 button.onpointermove=event=>{
  const d=drag;if(!d||event.pointerId!==d.pointerId)return;
  event.preventDefault();
  const dx=event.clientX-d.x,dy=event.clientY-d.y;
  if(!d.clone&&Math.hypot(dx,dy)<6)return;
  if(!d.clone){d.clone=document.createElement('div');d.clone.className='fruit flying drag-ghost';d.clone.innerHTML=fruitArt(kind());Object.assign(d.clone.style,{width:r.width+'px',height:r.height+'px'});document.body.appendChild(d.clone);button.classList.add('grabbed');}
  d.clone.style.left=r.left+dx+'px';d.clone.style.top=r.top+dy+'px';
  $('basket-area').classList.toggle('drop-ready',inBasket(event.clientX,event.clientY));
 };
 button.onpointerup=event=>{
  const d=drag;if(!d||event.pointerId!==d.pointerId)return;
  event.preventDefault();button.suppressUntil=performance.now()+500;
  const moved=!!d.clone,accepted=moved&&inBasket(event.clientX,event.clientY);
  const dropRect=d.clone?.getBoundingClientRect();cancelDrag();
  if(accepted)collectFruit(index,button,dropRect);
  else if(moved){$('feedback').textContent='괜찮아요. 바구니로 다시 끌어 보세요.';if(!reduced.matches)button.animate([{transform:'scale(.94)'},{transform:'scale(1)'}],{duration:200});}
  else $('feedback').textContent=instruction();
 };
 button.onpointercancel=button.onlostpointercapture=()=>cancelDrag();
}
for(const mode of ['drag','tap'])$('mode-'+mode).onclick=()=>{cancelMotion();inputMode=mode;renderCollect();};
document.addEventListener('keydown',e=>{if(e.key==='Escape')cancelDrag();});
function renderCollect(){
 const s=states[page];$('fruit-tray').replaceChildren();
 for(const mode of ['drag','tap'])$('mode-'+mode).setAttribute('aria-pressed',String(mode===inputMode));
 s.fruit.forEach((done,index)=>{const b=document.createElement('button');b.className='fruit';b.innerHTML=fruitArt(kind());b.disabled=done;b.setAttribute('aria-label',`${pairs[page].nature} ${index+1}번 ${done?'담았어요':'바구니에 담기'}`);b.onclick=e=>{if(performance.now()<(b.suppressUntil||0))return;if(inputMode==='tap'||e.detail===0)collectFruit(index,b);else $('feedback').textContent=instruction();};b.onpointerdown=e=>startDrag(e,index,b);$('fruit-tray').appendChild(b);});
 finishCollect();
}
function renderGallery(){
 $('title').textContent='오늘 만난 자연';$('count').textContent='모아 보기';$('gallery').replaceChildren();
 const seen=pairs.filter((p,i)=>states[i].met);
 for(const p of seen){const b=document.createElement('button');b.className='photo';b.innerHTML=`<span class="frame"><img src="assets/oct03/${p.natureFile}" alt="${p.nature} 사진"></span><span class="caption">${p.nature}</span>`;b.onclick=()=>{$('feedback').textContent=p.natureText;if(!reduced.matches)b.animate([{transform:'scale(.97)'},{transform:'scale(1)'}],{duration:350});};$('gallery').appendChild(b);}
 if(!seen.length){const p=document.createElement('p');p.className='empty';p.textContent='자연을 찾아보면 여기에 모여요.';$('gallery').appendChild(p);}
 $('feedback').textContent=seen.length?'사진을 눌러 다시 만나 보세요.':'아래 버튼을 눌러 시작해 보세요.';
 $('prev').disabled=false;$('prev').textContent='← 돌아가기';$('next').textContent='처음부터 ↻';action(null);
}
function render(){
 const p=pairs[page],s=states[page];
 document.querySelector('main').dataset.stage=gallery?'gallery':s.stage;
 $('steps').hidden=gallery||!hasActivity();$('pages').hidden=gallery;
 for(const id of ['choice','collect','review','gallery'])$(id).hidden=gallery?id!=='gallery':id!==({find:'choice',collect:'collect',review:'review'}[s.stage]);
 $('feedback').classList.remove('correct');action(null);
 if(gallery){renderGallery();return;}
 $('count').textContent=`${page+1} / ${pairs.length}`;
 $('pages').replaceChildren();pairs.forEach((_,i)=>{const b=document.createElement('button');b.className='page';b.textContent=i+1;b.setAttribute('aria-label',`${i+1}페이지`);if(i===page)b.setAttribute('aria-current','step');b.onclick=()=>move(i);$('pages').appendChild(b);});
 [...$('steps').children].forEach((li,i)=>{if(i===['find','collect','review'].indexOf(s.stage))li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
 $('prev').disabled=page===0&&s.stage==='find';$('prev').textContent=s.stage==='find'?'← 이전':'← 사진 찾기';$('next').textContent=page===pairs.length-1?'모아 보기 →':'다음 →';
 if(s.stage==='find'){
  $('title').textContent='하나님이 만드신 ‘자연’은 무엇일까요?';
  for(const type of ['made','nature']){$(type+'-img').src='assets/oct03/'+p[type+'File'];$(type+'-img').alt=p[type]+' 사진';$(type+'-name').textContent=p[type];}feedback();
 }else if(s.stage==='collect'){$('title').textContent=p.nature+'를 바구니에 담아요';if(page===6)$('title').textContent='밤을 바구니에 담아요';renderCollect();}
 else{$('title').textContent=p.nature+' 두 개를 담았어요';$('review-img').src='assets/oct03/'+p.natureFile;$('review-img').alt=p.nature+' 사진';$('review-name').textContent=p.nature;$('review-message').textContent='하나님이 만드신 자연이에요.';$('review-fruits').innerHTML=fruitArt(kind()).repeat(2);$('feedback').textContent='사진을 눌러 다시 볼 수 있어요.';}
}
$('made').onclick=()=>{states[page].pick='made';feedback();};
$('nature').onclick=()=>{states[page].pick='nature';states[page].met=true;feedback();};
$('review-photo').onclick=()=>{if(!reduced.matches)$('review-img').animate([{transform:'scale(.96)'},{transform:'scale(1)'}],{duration:400});};
$('replay').onclick=()=>{cancelMotion();states[page].fruit=[false,false];states[page].stage='collect';render();$('title').focus();};
$('prev').onclick=()=>{if(gallery){move(page);return;}if(states[page].stage!=='find'){states[page].stage='find';move(page);}else if(page>0)move(page-1);};
$('next').onclick=()=>{if(gallery){states.forEach(s=>Object.assign(s,{pick:null,stage:'find',fruit:[false,false],met:false}));move(0);}else if(page<pairs.length-1)move(page+1);else{cancelMotion();gallery=true;render();$('title').focus();}};
window.addEventListener('pagehide',cancelMotion);
render();
})();
