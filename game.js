const $=i=>document.getElementById(i),R=Math.random,PI=Math.PI,H=Math.hypot;
let S={m:0,done:[],cash:0,veh:['bike','scooter'],set:{q:'med',sv:.7,mv:.4,cs:1,ks:1},loc:'MANER'};
try{Object.assign(S,JSON.parse(localStorage.getItem('calicut')||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem('calicut',JSON.stringify(S))}catch(e){}};
// ---------- audio
let ac,eg,eo,mg;
function snd(f,d,ty,v){if(!ac)return;const o=ac.createOscillator(),g=ac.createGain();o.type=ty||'square';o.frequency.value=f;g.gain.value=(v||.2)*S.set.sv;o.connect(g);g.connect(ac.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+d);o.stop(ac.currentTime+d)}
function initAudio(){if(ac)return;try{ac=new(window.AudioContext||window.webkitAudioContext)();eo=ac.createOscillator();eo.type='sawtooth';eg=ac.createGain();eg.gain.value=0;eo.connect(eg);eg.connect(ac.destination);eo.start();mg=ac.createGain();mg.gain.value=.04*S.set.mv;[110,165,220].forEach(f=>{const o=ac.createOscillator();o.frequency.value=f;o.connect(mg);o.start()});mg.connect(ac.destination)}catch(e){ac=null}}
// ---------- renderer
const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(65,1,.1,450);
const rd=new THREE.WebGLRenderer({canvas:$('g'),antialias:false});rd.shadowMap.enabled=true;
const hemi=new THREE.HemisphereLight(0xffffff,0x4a5a30,.9),sun=new THREE.DirectionalLight(0xfff2d0,.9);
sun.shadow.camera.left=sun.shadow.camera.bottom=-50;sun.shadow.camera.right=sun.shadow.camera.top=50;sun.shadow.camera.far=200;sun.shadow.mapSize.set(1024,1024);
sc.add(hemi,sun,sun.target);
const hl=new THREE.SpotLight(0xfff0c0,1.6,70,.6,.5);hl.visible=false;sc.add(hl,hl.target);
function quality(){const q=S.set.q;rd.setPixelRatio(Math.min(window.devicePixelRatio||1,q=='low'?.7:q=='med'?1:1.5));sun.castShadow=q=='high';cam.far=q=='low'?200:q=='med'?320:450;cam.updateProjectionMatrix();sc.fog.far=cam.far*.9;rd.setSize(innerWidth,innerHeight)}
let night=0;
function setNight(n){night=n;const c=n?0x070b1c:0x87ceeb;sc.background=new THREE.Color(c);sc.fog=new THREE.Fog(c,40,300);hemi.intensity=n?.3:.9;sun.intensity=n?.12:.9;sun.color.set(n?0x6677bb:0xfff2d0);quality()}
setNight(0);
addEventListener('resize',()=>{rd.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()});
// ---------- world data
const L=[["MANER",0,0],["GORAIYA STHAN",300,-120],["DANAPUR",420,260],["SHADIPUR",-260,300],["BAYAPUR",-330,-180]];
const E=[[0,1],[0,2],[0,3],[0,4],[1,2]];
const A=(i,x,z)=>[L[i][1]+x,L[i][2]+z];
function rdist(x,z){let m=1e9;for(const[a,b]of E){const ax=L[a][1],az=L[a][2],dx=L[b][1]-ax,dz=L[b][2]-az;let t=((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz);t=Math.max(0,Math.min(1,t));m=Math.min(m,H(x-ax-t*dx,z-az-t*dz))}return m}
const CO=[];
function tex(fn,rx,ry,w){const c=document.createElement('canvas');c.width=c.height=w||128;fn(c.getContext('2d'),c.width);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return t}
const MAT=c=>new THREE.MeshLambertMaterial({color:c});
function build(){
 const g=new THREE.Mesh(new THREE.PlaneGeometry(1800,1800),new THREE.MeshLambertMaterial({map:tex((x,w)=>{x.fillStyle='#5b8c3a';x.fillRect(0,0,w,w);for(let i=0;i<900;i++){x.fillStyle=`hsl(${75+R()*35},${35+R()*20}%,${22+R()*22}%)`;x.fillRect(R()*w,R()*w,2,2)}},300,300)}));
 g.rotation.x=-PI/2;g.receiveShadow=true;sc.add(g);
 // roads
 const rt=tex((x,w)=>{x.fillStyle='#3a3a3e';x.fillRect(0,0,w,w);for(let i=0;i<500;i++){x.fillStyle=R()<.5?'#444':'#2e2e31';x.fillRect(R()*w,R()*w,2,2)}x.fillStyle='#e8e0a0';x.fillRect(0,w/2-2,w*.5,4);x.fillStyle='#ddd';x.fillRect(0,2,w,3);x.fillRect(0,w-5,w,3)},1,1);
 const poles=[];
 for(const[a,b]of E){const ax=L[a][1],az=L[a][2],dx=L[b][1]-ax,dz=L[b][2]-az,len=H(dx,dz);const t=rt.clone();t.needsUpdate=true;t.repeat.set(len/12,1);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(len,9),new THREE.MeshLambertMaterial({map:t}));m.rotation.set(-PI/2,0,-Math.atan2(dz,dx));
  m.position.set(ax+dx/2,.05,az+dz/2);m.receiveShadow=true;sc.add(m);
  for(let d=20;d<len-20;d+=45){const nx=-dz/len*6;const nz=dx/len*6;poles.push({x:ax+dx*d/len+nx,y:3.5,z:az+dz*d/len+nz,sx:1,sy:1,sz:1,c:'#555'})}}
 inst(new THREE.CylinderGeometry(.12,.12,7,5),poles,0);
 // houses
 const pal=['#e8d6a8','#d98c6a','#7fb7c9','#c9a0a0','#f0e0b0','#a5c48a','#e0b050','#b0b0c8','#e86a8a'],hs=[],rs=[],cnt=[28,26,70,24,24],rad=[110,100,140,110,110];
 L.forEach((l,i)=>{let n=cnt[i],tries=0;while(n>0&&tries++<800){const a=R()*PI*2,r=14+R()*rad[i],x=l[1]+Math.cos(a)*r,z=l[2]+Math.sin(a)*r;if(rdist(x,z)<10)continue;const big=i==2&&R()<.5,w=big?10+R()*8:6+R()*5,d=big?10+R()*8:6+R()*5,h=big?9+R()*14:3.5+R()*2.5,cr=Math.max(w,d)/2+1.5;if(CO.some(c=>H(c.x-x,c.z-z)<c.r+cr+3))continue;CO.push({x,z,r:cr});n--;
   hs.push({x,y:h/2,z,sx:w,sy:h,sz:d,c:pal[(R()*pal.length)|0]});if(!big)rs.push({x,y:h+.75,z,sx:w*1.15,sy:1.5,sz:d*1.15,c:'#a5472b'})}});
 inst(new THREE.BoxGeometry(1,1,1),hs,1);inst(new THREE.ConeGeometry(.71,1,4).rotateY(PI/4),rs,1);
 // temple at Goraiya
 const tp=A(1,35,25);for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(18-i*4,3,18-i*4),MAT(i%2?0xe0a060:0xf0d0a0));b.position.set(tp[0],1.5+i*3,tp[1]);b.castShadow=true;sc.add(b)}
 const sp=new THREE.Mesh(new THREE.ConeGeometry(4,8,8),MAT(0xd08040));sp.position.set(tp[0],16,tp[1]);sc.add(sp);CO.push({x:tp[0],z:tp[1],r:10});
 // water + fields
 const pn=A(3,-70,20),w=new THREE.Mesh(new THREE.CircleGeometry(35,24),new THREE.MeshLambertMaterial({color:0x2a78a8}));w.rotation.x=-PI/2;w.position.set(pn[0],.06,pn[1]);sc.add(w);
 for(let i=0;i<10;i++){const l=L[3+(i%2)],f=new THREE.Mesh(new THREE.PlaneGeometry(40,30),MAT(i%3?0xc8b440:0x7ab040));f.rotation.x=-PI/2;const x=l[1]+(R()-.5)*300,z=l[2]+(R()-.5)*300;if(rdist(x,z)<12)continue;f.position.set(x,.03,z);sc.add(f)}
 // trees
 const tr=[],fl=[];for(let i=0,n=0;n<380&&i<3000;i++){const x=(R()-.5)*1300,z=(R()-.5)*1300;if(rdist(x,z)<9||CO.some(c=>H(c.x-x,c.z-z)<c.r+3))continue;n++;const co=R()<.35,h=co?9:4+R()*3;
  tr.push({x,y:h/2,z,sx:co?.5:.9,sy:h,sz:co?.5:.9,c:'#6b4a2b'});fl.push({x,y:h+(co?.4:1.5),z,sx:co?4:5,sy:co?1.2:4,sz:co?4:5,c:co?'#2f8f3a':R()<.5?'#2a6a28':'#3b7d2c'})}
 inst(new THREE.CylinderGeometry(.5,.5,1,6),tr,1);inst(new THREE.IcosahedronGeometry(1,0),fl,1);
}
function inst(geo,list,sh){const m=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial(),list.length),o=new THREE.Object3D(),c=new THREE.Color();list.forEach((q,i)=>{o.position.set(q.x,q.y,q.z);o.scale.set(q.sx,q.sy,q.sz);o.updateMatrix();m.setMatrixAt(i,o.matrix);m.setColorAt(i,c.set(q.c))});m.castShadow=!!sh;m.receiveShadow=true;m.frustumCulled=false;sc.add(m)}
// ---------- characters
function human(sh,pn,sk){sk=sk||0xa8734a;const g=new THREE.Group();
 const add=(geo,c,x,y,z,p)=>{const o=new THREE.Mesh(geo,MAT(c));o.position.set(x,y,z);o.castShadow=true;(p||g).add(o);return o};
 add(new THREE.CylinderGeometry(.3,.26,.75,8),sh,0,1.25,0);add(new THREE.SphereGeometry(.2,10,8),sk,0,1.8,0);add(new THREE.SphereGeometry(.21,10,6,0,PI*2,0,PI/2),0x111111,0,1.83,-.01);
 add(new THREE.SphereGeometry(.03,6,4),0x000000,-.07,1.82,.18);add(new THREE.SphereGeometry(.03,6,4),0x000000,.07,1.82,.18);
 const limb=(x,y,w,l,c,hand)=>{const p=new THREE.Group();p.position.set(x,y,0);g.add(p);add(new THREE.CylinderGeometry(w,w*.8,l,6),c,0,-l/2,0,p);if(hand)add(new THREE.SphereGeometry(.08,6,4),sk,0,-l-.03,0,p);return p};
 g.la=limb(-.4,1.55,.09,.65,sh,1);g.ra=limb(.4,1.55,.09,.65,sh,1);g.ll=limb(-.15,.88,.12,.88,pn);g.rl=limb(.15,.88,.12,.88,pn);
 const st=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,1.3,5),new THREE.MeshBasicMaterial({color:0x33ddff}));st.position.set(0,-.7,.3);st.rotation.x=1.2;st.visible=false;g.ra.add(st);g.st=st;
 sc.add(g);return g}
function pose(h,spd,t){const a=Math.min(spd/5,1.4)*.9,s=Math.sin(t*(spd>6?12:9));h.ll.rotation.x=s*a;h.rl.rotation.x=-s*a;h.la.rotation.x=-s*a*.8;h.ra.rotation.x=s*a*.8}
const lerpA=(a,b,t)=>a+(((b-a+PI)%(2*PI)+2*PI)%(2*PI)-PI)*t;
// ---------- state
const P={x:0,y:0,z:0,vy:0,hp:100,ry:0,at:0,ak:0,cd:0,inv:0,ct:0,dd:0,combo:0,blk:0,run:0,wpn:0,jumps:0,veh:null,spd:0,ph:0,air:0};
let pm,cat,state='menu',cy=0,cp=.35,cmode=0,drag=0,cm=0,st=0,ST={},free=0,en=[],ps=[],vh=[],tf=[],msgT=0,sv=0,prev='menu',stepT=0;
const K={};let jx=0,jy=0;
const mk=new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.5,80,12,1,true),new THREE.MeshBasicMaterial({color:0xffcc22,transparent:true,opacity:.35,side:2}));mk.visible=false;sc.add(mk);
const pf=[...Array(10)].map(()=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.3,6,5),new THREE.MeshBasicMaterial({color:0x555555,transparent:true,opacity:.5}));m.visible=false;sc.add(m);return{m,t:0}});
// ---------- vehicles
const VT={bike:{c:0x222222,mx:30,w:2,L:2.2},sport:{c:0xdd1111,mx:38,w:2,L:2.2},scooter:{c:0x2a6bd1,mx:20,w:2,L:1.8},car:{c:0xf2f2f2,mx:30,w:4,L:4},suv:{c:0x1f3b2a,mx:28,w:4,L:4.4},jeep:{c:0xcc9a2e,mx:24,w:4,L:3.6}};
function veh(t,x,z,h){const d=VT[t],g=new THREE.Group(),b=(a,c,e)=>new THREE.BoxGeometry(a,c,e),cy_=(r,l)=>new THREE.CylinderGeometry(r,r,l,12);
 const add=(geo,c,px,py,pz,rz)=>{const o=new THREE.Mesh(geo,MAT(c));o.position.set(px,py,pz);if(rz)o.rotation.z=PI/2;o.castShadow=true;g.add(o);return o};
 let body;
 if(d.w==2){body=add(b(.45,.5,d.L*.75),d.c,0,.7,0);add(cy_(.36,.18),0x111111,0,.36,d.L/2-.1,1);add(cy_(.36,.18),0x111111,0,.36,-d.L/2+.1,1);add(b(.8,.07,.1),0x111111,0,1.2,.6);add(b(.35,.08,.7),0x222222,0,1.02,-.3)}
 else{body=add(b(2,.8,d.L),d.c,0,.9,0);add(b(1.8,.7,d.L*.5),0x99ccee,0,1.6,-.2);for(const sx of[-1,1])for(const sz of[-1,1])add(cy_(.4,.25),0x111111,sx*1.05,.4,sz*(d.L/2-.7),1)}
 g.position.set(x,0,z);g.rotation.y=h||0;sc.add(g);const v={g,t,d,x,z,h:h||0,sp:0,hp:100,body,dead:0};vh.push(v);return v}
function clearVeh(){vh.forEach(v=>{if(v!==P.veh)sc.remove(v.g)});vh=vh.filter(v=>v===P.veh)}
function smoke(x,z){const p=pf.find(q=>!q.m.visible);if(p){p.t=0;p.m.visible=true;p.m.position.set(x,1.2,z)}}
// ---------- NPCs / enemies
function spawnNPC(x,z,talk){const h=human([0xd8d8d8,0x3a6ea5,0xc86a2a,0x7a3a8a,0x2f7a4a][(R()*5)|0],[0x333333,0x665544,0xeeeeee][(R()*3)|0]);h.position.set(x,0,z);const n={h,x,z,tx:x,tz:z,w:R()*3,ph:R()*9,talk};ps.push(n);return n}
function spawnEn(x,z,boss){const h=human(boss?0x222222:0xaa1c1c,0x333344,0x8a5a3a);if(boss)h.scale.setScalar(1.25);const b=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.14),new THREE.MeshBasicMaterial({color:0xff2222}));sc.add(b);const hp=boss?160:45;en.push({h,b,x,z,hp,max:hp,cd:1,t:0,blk:0,hit:0,sw:0,ph:0,boss})}
function clearEn(){en.forEach(e=>sc.remove(e.h,e.b));en=[]}
const LINES=['Namaste! Stay safe on the roads.','Fresh chai? Maybe later!','Be careful, there are troublemakers around.','Welcome to our village.','Have you tried our market sweets?'];
// ---------- combat
function attack(k){if(P.veh||P.cd>0||state!='play')return;P.cd=k?.55:.38;P.at=.25;P.ak=k;P.combo=P.ct>0?P.combo+1:1;P.ct=.8;const dm=(k?18:11)*(P.wpn?1.6:1)*(P.combo%3==0?1.5:1);snd(k?120:200,.12,'square',.25);
 for(const e of en){if(e.dead)continue;const dx=e.x-P.x,dz=e.z-P.z,d=H(dx,dz);if(d<(P.wpn?3:2.4)&&(dx*Math.sin(P.ry)+dz*Math.cos(P.ry))/(d||1)>.2)hurt(e,dm)}}
function hurt(e,d){if(e.dead)return;if(e.blk>0)d*=.3;e.hp-=d;e.hit=.25;e.blk=R()<.3?.6:0;snd(90,.1,'sawtooth',.3);if(e.hp<=0){e.dead=1;e.t=3;e.h.rotation.x=-1.5;e.h.position.y=.25;e.b.visible=false;S.cash+=10}}
// ---------- movement
function collide(o,r){let hit=0;for(const c of CO){const dx=o.x-c.x,dz=o.z-c.z,d=H(dx,dz),m=c.r+r;if(d<m){const k=m/(d||.01);o.x=c.x+dx*k;o.z=c.z+dz*k;hit=1}}o.x=Math.max(-700,Math.min(700,o.x));o.z=Math.max(-700,Math.min(700,o.z));return hit}
function walk(dt,ix,iy){const fx=-Math.sin(cy),fz=-Math.cos(cy),rx=Math.cos(cy),rz=-Math.sin(cy),mx=fx*iy+rx*ix,mz=fz*iy+rz*ix,m=H(mx,mz);let dx=0,dz=0,sp=0;
 if(P.dd>0){dx=Math.sin(P.ry);dz=Math.cos(P.ry);sp=15}else if(m>.05){dx=mx/m;dz=mz/m;P.ry=lerpA(P.ry,Math.atan2(dx,dz),Math.min(1,dt*12));sp=((P.run||K.shift)?8.5:4.5)*Math.min(m,1)*(P.at>0||P.blk?.4:1)}
 P.x+=dx*sp*dt;P.z+=dz*sp*dt;P.spd=sp;collide(P,.5);P.vy-=25*dt;P.y+=P.vy*dt;if(P.y<=0){P.y=0;P.vy=0;P.air=0}else P.air=1;
 pm.position.set(P.x,P.y,P.z);pm.rotation.y=P.ry;P.ph+=dt;pose(pm,sp,P.ph);
 if(P.at>0){if(P.ak)pm.rl.rotation.x=-1.4;else pm.ra.rotation.x=-1.6}if(P.blk){pm.la.rotation.x=pm.ra.rotation.x=-1.9}pm.st.visible=!!P.wpn;
 if(sp>3&&!P.air&&Math.sin(P.ph*(sp>6?12:9))>.97)snd(70,.05,'triangle',.08)}
function drive(dt,ix,iy){const v=P.veh,d=v.d;if(iy>.1){v.sp+=(v.sp<0?25:14)*iy*dt}else if(iy<-.1){v.sp-=(v.sp>0?25:8)*-iy*dt}else v.sp-=Math.sign(v.sp)*Math.min(Math.abs(v.sp),5*dt);
 v.sp=Math.max(-8,Math.min(d.mx,v.sp));v.h-=ix*1.8*dt*Math.max(-1,Math.min(1,v.sp/5));v.x+=Math.sin(v.h)*v.sp*dt;v.z+=Math.cos(v.h)*v.sp*dt;
 if(collide(v,1.4)){if(Math.abs(v.sp)>6){v.hp-=Math.abs(v.sp)*1.2;snd(60,.25,'sawtooth',.4);v.body.material.color.multiplyScalar(.85)}v.sp*=-.3}
 v.g.position.set(v.x,0,v.z);v.g.rotation.y=v.h;P.x=v.x;P.z=v.z;P.y=0;P.spd=Math.abs(v.sp);
 pm.visible=v.t!='car'&&v.t!='suv'&&v.t!='jeep';pm.position.set(v.x,.35,v.z);pm.rotation.y=v.h;pm.ll.rotation.x=pm.rl.rotation.x=-1.2;pm.la.rotation.x=pm.ra.rotation.x=-1.1;P.ry=v.h;
 if(v.hp<40&&R()<dt*8)smoke(v.x,v.z);if(v.hp<=0){v.dead=1;exitV();smoke(v.x,v.z)}
 if(eg){eg.gain.value=.05*S.set.sv;eo.frequency.value=40+Math.abs(v.sp)*4}
 if(night){hl.visible=true;hl.position.set(v.x,1.2,v.z);hl.target.position.set(v.x+Math.sin(v.h)*20,0,v.z+Math.cos(v.h)*20)}}
function enterV(v){P.veh=v;initAudio()}
function exitV(){const v=P.veh;if(!v)return;P.x=v.x+Math.cos(v.h)*2.4;P.z=v.z-Math.sin(v.h)*2.4;v.sp=0;P.veh=null;pm.visible=true;hl.visible=false;if(eg)eg.gain.value=0}
function use(){if(state!='play')return;if(P.veh){exitV();return}
 let b=null,bd=4;for(const v of vh){if(v.dead)continue;const d=H(v.x-P.x,v.z-P.z);if(d<bd){bd=d;b=v}}if(b){enterV(b);return}
 for(const n of ps){if(H(n.x-P.x,n.z-P.z)<4){say(n.talk||LINES[(R()*LINES.length)|0]);if(n.talk&&ST.k=='talk'&&n===ST.npc)next();return}}}
function say(t){const m=$('msg');m.textContent=t;m.classList.remove('h');msgT=3}
// ---------- missions
const G=(i,dx,dz,r,x,v)=>({k:'go',p:A(i,dx,dz),r,x,v});
const MS=[
{t:'THE BEGINNING',d:'Meet Maner and learn the controls.',l:0,s:0,rw:100,st:[G(0,25,0,4,'Walk to the marker'),G(0,25,-40,5,'Run to the marker (RUN + stick)'),{k:'jump',n:3,x:'Jump 3 times'}]},
{t:'FIRST JOURNEY',d:'Ride the motorcycle from Maner to Goraiya Sthan.',l:0,s:0,rw:200,u:'sport',st:[G(1,0,0,14,'Ride the bike to Goraiya Sthan',1)]},
{t:'VILLAGE TROUBLE',d:'Hostile men threaten villagers. Defeat them.',l:0,s:0,rw:250,st:[{k:'kill',n:3,at:A(0,30,35),x:'Defeat the hostile men'}]},
{t:'THE MARKET',d:'Meet the shopkeepers of Danapur market.',l:2,s:2,rw:300,u:'car',st:[{k:'talk',at:A(2,22,14),x:'Talk to the shopkeeper (USE)'},{k:'talk',at:A(2,-25,20),x:'Talk to the second shopkeeper (USE)'}]},
{t:'THE ROAD CHALLENGE',d:'Race through Indian roads.',l:2,s:2,rw:400,st:[G(0,0,0,15,'Drive to Maner',1),G(3,0,0,15,'Drive to Shadipur',1)]},
{t:'PROTECT THE VILLAGE',d:'Defend Bayapur from raiders.',l:4,s:4,rw:500,u:'suv',st:[{k:'surv',s:35,x:'Protect Bayapur'}]},
{t:'THE NIGHT JOURNEY',d:'Travel between towns at night.',l:1,s:1,n:1,rw:600,st:[G(2,0,0,15,'Drive to Danapur',1),G(0,0,0,15,'Drive to Maner',1)]},
{t:'ENEMY CAMP',d:'Find the camp near Shadipur.',l:3,s:3,rw:700,u:'jeep',st:[G(3,160,-110,14,'Find the enemy camp'),{k:'kill',n:5,at:A(3,160,-110),x:'Clear the camp'}]},
{t:'THE FINAL JOURNEY',d:'Travel through all towns.',l:1,s:1,rw:800,st:[G(2,0,0,15,'Go to Danapur',1),{k:'kill',n:3,at:A(2,40,-30),x:'Stop the ambush'},G(4,0,0,15,'Go to Bayapur',1),G(0,0,0,15,'Return to Maner',1)]},
{t:'THE FINAL BATTLE',d:'Defeat the boss and his gang.',l:0,s:0,rw:1500,st:[G(0,-80,60,8,'Go to the final arena'),{k:'kill',n:5,boss:1,at:A(0,-80,60),x:'Defeat the boss and his gang'}]}];
function startMission(i){initAudio();free=i>=MS.length;cm=free?MS.length-1:i;st=0;clearEn();clearVeh();P.veh=null;pm.visible=true;P.hp=100;P.vy=0;P.y=0;
 const m=MS[cm],l=L[free?0:m.s];P.x=l[1]+8;P.z=l[2]+8;S.veh.forEach((t,k)=>veh(t,P.x+5,P.z-4+k*3.2,PI/2));
 ps.forEach(n=>sc.remove(n.h));ps=[];L.forEach((l,j)=>{for(let k=0;k<(j==2?8:5);k++)spawnNPC(l[1]+(R()-.5)*90,l[2]+(R()-.5)*90)});
 setNight(!free&&m.n?1:0);hl.visible=false;S.m=Math.max(S.m,0);
 ['menu','pause','set','mis','pop'].forEach(x=>$(x).classList.add('h'));$('hud').classList.remove('h');$('tc').classList.toggle('h',!matchMedia('(pointer:coarse)').matches);
 state='play';if(free){mk.visible=false;$('obj').textContent='FREE ROAM unlocked - explore all five locations';say('Free roam!')}else{setStep();say(m.t+': '+m.d)}
 try{document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();screen.orientation.lock('landscape').catch(()=>{})}catch(e){}save()}
function setStep(){const s=MS[cm].st[st];if(!s){win();return}ST=Object.assign({},s);stepT=0;
 if(s.k=='kill'){clearEn();for(let i=0;i<s.n;i++)spawnEn(s.at[0]+(R()-.5)*14,s.at[1]+(R()-.5)*14,s.boss&&i==0)}
 if(s.k=='talk'){ST.npc=spawnNPC(s.at[0],s.at[1],'Welcome to my shop, traveller! The road ahead is dangerous.');ST.npc.w=1e9}
 if(s.k=='surv'){ST.t=s.s;ST.sp=0;clearEn()}if(s.k=='jump')P.jumps=0;
 const p=s.p||s.at;if(p){mk.visible=true;mk.position.set(p[0],40,p[1])}else mk.visible=false}
function next(){st++;snd(660,.2,'sine',.3);setStep()}
function win(){state='pop';const m=MS[cm];S.cash+=m.rw;if(!S.done.includes(cm))S.done.push(cm);S.m=Math.max(S.m,cm+1);if(m.u&&!S.veh.includes(m.u))S.veh.push(m.u);mk.visible=false;clearEn();save();
 $('pt1').textContent='MISSION COMPLETE';$('pt2').innerHTML=m.t+'<br>Reward: Rs '+m.rw+(m.u?'<br>Unlocked vehicle: '+m.u.toUpperCase():'')+(cm==9?'<br><b>Free roam unlocked!</b>':'');$('pb').textContent='Continue';$('pb').onclick=()=>startMission(cm+1);$('pop').classList.remove('h');if(eg)eg.gain.value=0}
function fail(){state='pop';$('pt1').textContent='MISSION FAILED';$('pt2').textContent='You were defeated.';$('pb').textContent='Retry';$('pb').onclick=()=>startMission(free?MS.length:cm);$('pop').classList.remove('h');if(eg)eg.gain.value=0}
function stepCheck(dt){const s=ST;if(!s.k)return;const px=P.x,pz=P.z;
 if(s.k=='go'){const d=H(px-s.p[0],pz-s.p[1]);$('obj').textContent=`${cm+1}/10 ${MS[cm].t}: ${s.x} (${d|0}m)`;if(d<s.r&&(!s.v||P.veh))next()}
 else if(s.k=='kill'){const a=en.filter(e=>!e.dead).length;$('obj').textContent=`${cm+1}/10 ${MS[cm].t}: ${s.x} (${a} left)`;if(!a)next()}
 else if(s.k=='talk')$('obj').textContent=`${cm+1}/10 ${MS[cm].t}: ${s.x}`;
 else if(s.k=='jump'){$('obj').textContent=`${cm+1}/10 ${MS[cm].t}: ${s.x} (${P.jumps}/${s.n})`;if(P.jumps>=s.n)next()}
 else if(s.k=='surv'){const c=A(4,0,0);ST.t-=dt;ST.sp-=dt;if(ST.sp<=0&&en.filter(e=>!e.dead).length<4){ST.sp=6;const a=R()*PI*2;spawnEn(c[0]+Math.cos(a)*35,c[1]+Math.sin(a)*35)}
  $('obj').textContent=`${cm+1}/10 ${MS[cm].t}: ${s.x} (${Math.max(0,ST.t)|0}s)`;mk.position.set(c[0],40,c[1]);if(ST.t<=0){clearEn();next()}}}
// ---------- loop
function upd(dt){
 const k2=k=>K[k]?1:0;let ix=jx*S.set.ks+k2('d')+k2('arrowright')-k2('a')-k2('arrowleft'),iy=jy*S.set.ks+k2('w')+k2('arrowup')-k2('s')-k2('arrowdown');const il=H(ix,iy);if(il>1){ix/=il;iy/=il}
 P.cd-=dt;P.inv-=dt;P.ct-=dt;P.at-=dt;P.dd-=dt;P.blk=P.blk&&!P.veh;
 if(P.veh)drive(dt,ix,iy);else walk(dt,ix,iy);
 // cat
 cat.position.x+=(P.x-1.2-cat.position.x)*Math.min(1,dt*2.5);cat.position.z+=(P.z-1.2-cat.position.z)*Math.min(1,dt*2.5);cat.visible=!P.veh;cat.rotation.y=Math.atan2(P.x-cat.position.x,P.z-cat.position.z);
 // enemies
 for(const e of en){if(e.dead){e.t-=dt;if(e.t<0){sc.remove(e.h,e.b);e.rm=1}continue}
  const dx=P.x-e.x,dz=P.z-e.z,d=H(dx,dz);e.blk-=dt;e.cd-=dt;e.hit-=dt;e.sw-=dt;
  if(d<45&&d>1.7&&e.hit<=0){const sp=e.boss?3.8:3.3;e.x+=dx/d*sp*dt;e.z+=dz/d*sp*dt;e.ph+=dt;pose(e.h,sp,e.ph)}
  if(d<45)e.h.rotation.y=Math.atan2(dx,dz);
  if(d<=2&&e.cd<=0&&e.hit<=0){e.cd=1.2;e.sw=.25;if(P.inv<=0){P.hp-=(e.boss?14:8)*(P.blk?.3:1);P.inv=.35;snd(100,.15,'square',.3)}}
  if(e.sw>0)e.h.ra.rotation.x=-1.6;
  if(P.veh&&Math.abs(P.veh.sp)>6&&d<2.4&&e.hit<=0)hurt(e,25);
  collide(e,.5);e.h.position.set(e.x,e.dead?.25:0,e.z);e.b.position.set(e.x,2.4*(e.boss?1.25:1),e.z);e.b.scale.x=Math.max(.01,e.hp/e.max);e.b.lookAt(cam.position)}
 en=en.filter(e=>!e.rm);
 // npcs
 let hint='';
 for(const n of ps){const d=H(n.x-P.x,n.z-P.z);let sp=0;if(d>90){continue}
  if(P.at>0&&d<8){const a=Math.atan2(n.x-P.x,n.z-P.z);n.x+=Math.sin(a)*3.5*dt;n.z+=Math.cos(a)*3.5*dt;n.h.rotation.y=a;sp=6}
  else if(n.w>0){n.w-=dt}else{const dx=n.tx-n.x,dz=n.tz-n.z,dd=H(dx,dz);if(dd<1){n.w=2+R()*5;const l=L[(R()*5)|0];n.tx=n.x+(R()-.5)*40;n.tz=n.z+(R()-.5)*40;if(R()<.3){n.tx=l[1]+(R()-.5)*60;n.tz=l[2]+(R()-.5)*60}}else{n.x+=dx/dd*1.4*dt;n.z+=dz/dd*1.4*dt;n.h.rotation.y=Math.atan2(dx,dz);sp=1.4}}
  collide(n,.5);n.h.position.set(n.x,0,n.z);n.ph+=dt;pose(n.h,sp*3,n.ph);if(d<4&&!P.veh)hint='USE: talk'}
 for(const v of vh)if(!v.dead&&!P.veh&&H(v.x-P.x,v.z-P.z)<4)hint='USE: enter vehicle';if(P.veh)hint='USE: exit vehicle';
 const hn=$('hint');hn.textContent=hint;hn.classList.toggle('h',!hint);
 // traffic
 for(const t of tf){t.u+=t.d*t.s*dt/t.len;if(t.u>1||t.u<0){t.d*=-1;t.u=Math.max(0,Math.min(1,t.u))}const[a,b]=E[t.e],ax=L[a][1],az=L[a][2],dx=L[b][1]-ax,dz=L[b][2]-az,nx=-dz/t.len*2.5*t.d,nz=dx/t.len*2.5*t.d;t.m.position.set(ax+dx*t.u+nx,0,az+dz*t.u+nz);t.m.rotation.y=Math.atan2(dx*t.d,dz*t.d)}
 for(const p of pf)if(p.m.visible){p.t+=dt;p.m.scale.setScalar(1+p.t*3);p.m.position.y+=dt;p.m.material.opacity=.5-p.t*.5;if(p.t>1)p.m.visible=false}
 if(P.hp<100&&P.hp>0)P.hp=Math.min(100,P.hp+.8*dt);
 if(P.hp<=0)fail();
 if(!free)stepCheck(dt);
 if(msgT>0){msgT-=dt;if(msgT<=0)$('msg').classList.add('h')}
 // camera
 const tx=P.x,tz=P.z,d=[7,4,12][cmode];if(P.veh&&!drag)cy=lerpA(cy,P.veh.h+PI,Math.min(1,dt*2));
 cam.position.set(tx+Math.sin(cy)*Math.cos(cp)*d,1.6+Math.sin(cp)*d,tz+Math.cos(cy)*Math.cos(cp)*d);cam.lookAt(tx,1.5+(P.y||0),tz);
 sun.position.set(tx+40,80,tz+30);sun.target.position.set(tx,0,tz);
 // hud
 $('hp').style.width=Math.max(0,P.hp)+'%';$('spd').textContent=P.veh?Math.round(Math.abs(P.veh.sp)*3.6)+' km/h':'';
 let nl=L[0],nd=1e9;for(const l of L){const q=H(l[1]-P.x,l[2]-P.z);if(q<nd){nd=q;nl=l}}$('loc').textContent=nd<160?nl[0]:'ON THE ROAD';S.loc=nl[0];
 mini();sv+=dt;if(sv>6){sv=0;S.pos=[P.x,P.z];save()}}
function mini(){const c=$('mm').getContext('2d'),W=116,sc2=W/2/160;c.clearRect(0,0,W,W);c.save();c.beginPath();c.arc(58,58,58,0,PI*2);c.clip();c.fillStyle='#2a4a22aa';c.fillRect(0,0,W,W);
 const T=(x,z)=>[58+(x-P.x)*sc2,58+(z-P.z)*sc2];c.strokeStyle='#888';c.lineWidth=3;for(const[a,b]of E){const p=T(L[a][1],L[a][2]),q=T(L[b][1],L[b][2]);c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1]);c.stroke()}
 c.fillStyle='#fff';c.font='bold 9px sans-serif';for(const l of L){const p=T(l[1],l[2]);c.fillRect(p[0]-3,p[1]-3,6,6);c.fillText(l[0][0],p[0]+5,p[1]+3)}
 c.fillStyle='#f33';for(const e of en)if(!e.dead){const p=T(e.x,e.z);c.fillRect(p[0]-2,p[1]-2,4,4)}
 if(mk.visible){let p=T(mk.position.x,mk.position.z),dx=p[0]-58,dy=p[1]-58,dd=H(dx,dy);if(dd>50){p=[58+dx/dd*50,58+dy/dd*50]}c.fillStyle='#fc3';c.beginPath();c.arc(p[0],p[1],4,0,PI*2);c.fill()}
 c.fillStyle='#4af';c.beginPath();c.arc(58,58,4,0,PI*2);c.fill();c.restore()}
let last=0;
function loop(t){requestAnimationFrame(loop);const dt=Math.min((t-last)/1000||0,.05);last=t;
 if(state=='play')upd(dt);else if(state=='menu'){const a=t/6000;cam.position.set(Math.sin(a)*70,25,Math.cos(a)*70);cam.lookAt(0,4,0)}
 rd.render(sc,cam)}
// ---------- input
function act(k,d){if(k=='b'){P.blk=d?1:0;return}if(!d)return;if(k=='p')attack(0);else if(k=='k')attack(1);else if(k=='j'){if(!P.veh&&!P.air&&state=='play'){P.vy=9;P.jumps++}}else if(k=='u')use();else if(k=='r')P.run=!P.run;
 else if(k=='d'){if(!P.veh&&P.dd<-.6){P.dd=.25;P.inv=.4}}else if(k=='w')P.wpn=!P.wpn;else if(k=='c')cmode=(cmode+1)%3;else if(k=='x')pause()}
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(K[k])return;K[k]=1;const m={j:'p',k:'k',' ':'j',e:'u',b:'b',f:'d',q:'w',c:'c',escape:'x'}[k];if(m)act(m,1)});
addEventListener('keyup',e=>{const k=e.key.toLowerCase();K[k]=0;if(k=='b')act('b',0)});
document.querySelectorAll('.a').forEach(el=>{const k=el.dataset.k;el.addEventListener('pointerdown',e=>{e.stopPropagation();act(k,1)});['pointerup','pointercancel','pointerleave'].forEach(n=>el.addEventListener(n,()=>act(k,0)))});
const jl=$('jl'),jk=$('jk');let jid=null;
function jm(e){const r=jl.getBoundingClientRect(),cx=r.left+70,cyy=r.top+70;let dx=e.clientX-cx,dy=e.clientY-cyy;const d=H(dx,dy),m=55;if(d>m){dx*=m/d;dy*=m/d}jk.style.transform=`translate(${dx}px,${dy}px)`;jx=dx/m;jy=-dy/m}
jl.addEventListener('pointerdown',e=>{jid=e.pointerId;jl.setPointerCapture(jid);jm(e)});jl.addEventListener('pointermove',e=>{if(e.pointerId==jid)jm(e)});
const je=e=>{if(e.pointerId==jid){jid=null;jx=jy=0;jk.style.transform=''}};jl.addEventListener('pointerup',je);jl.addEventListener('pointercancel',je);
let did=null,lx=0,ly=0;const cv=$('g');
cv.addEventListener('pointerdown',e=>{if(did===null){did=e.pointerId;lx=e.clientX;ly=e.clientY;drag=1}});
addEventListener('pointermove',e=>{if(e.pointerId==did&&state=='play'){cy-=(e.clientX-lx)*.006*S.set.cs;cp=Math.max(-.1,Math.min(1.2,cp+(e.clientY-ly)*.005*S.set.cs));lx=e.clientX;ly=e.clientY}});
const de=e=>{if(e.pointerId==did){did=null;drag=0}};addEventListener('pointerup',de);addEventListener('pointercancel',de);
// ---------- menus
function pause(){if(state=='play'){state='paused';$('pause').classList.remove('h');if(eg)eg.gain.value=0;jx=jy=0}else if(state=='paused'){state='play';$('pause').classList.add('h')}}
function showSet(from){prev=from;$(from).classList.add('h');$('set').classList.remove('h');$('sq').value=S.set.q;$('ssv').value=S.set.sv;$('smv').value=S.set.mv;$('sks').value=S.set.ks;$('scs').value=S.set.cs}
$('sq').onchange=e=>{S.set.q=e.target.value;quality();save()};
[['ssv','sv'],['smv','mv'],['sks','ks'],['scs','cs']].forEach(([i,k])=>$(i).oninput=e=>{S.set[k]=+e.target.value;if(k=='mv'&&mg)mg.gain.value=.04*S.set.mv;save()});
$('sb').onclick=()=>{$('set').classList.add('h');$(prev).classList.remove('h')};
$('bs').onclick=()=>{S.m=0;S.done=[];S.veh=['bike','scooter'];startMission(0)};
$('bc').onclick=()=>startMission(S.m);
$('bt').onclick=()=>showSet('menu');
$('be').onclick=()=>{try{window.close()}catch(e){}say('You can close this tab.')};
$('bm').onclick=()=>{const l=$('ml');l.innerHTML='';MS.forEach((m,i)=>{const b=document.createElement('div'),ok=i<=S.m||S.done.includes(i);b.className='b';b.style.opacity=ok?1:.4;b.textContent=(S.done.includes(i)?'[done] ':ok?'':'[locked] ')+(i+1)+'. '+m.t+' - '+m.d;if(ok)b.onclick=()=>startMission(i);l.appendChild(b)});$('menu').classList.add('h');$('mis').classList.remove('h')};
$('mb').onclick=()=>{$('mis').classList.add('h');$('menu').classList.remove('h')};
$('pr').onclick=pause;$('pq').onclick=()=>startMission(free?MS.length:cm);$('pt').onclick=()=>showSet('pause');
$('pm').onclick=()=>{state='menu';clearEn();mk.visible=false;setNight(0);['pause','hud','tc'].forEach(x=>$(x).classList.add('h'));$('menu').classList.remove('h');save()};
// ---------- init
build();pm=human(0x2a5f9e,0x23324a);cat=new THREE.Group();
{const o=(g,c,x,y,z)=>{const m=new THREE.Mesh(g,MAT(c));m.position.set(x,y,z);cat.add(m)};o(new THREE.BoxGeometry(.25,.25,.6),0xd98a2b,0,.3,0);o(new THREE.SphereGeometry(.15,8,6),0xd98a2b,0,.45,.35);o(new THREE.BoxGeometry(.06,.06,.5),0xd98a2b,0,.4,-.5);sc.add(cat)}
for(let i=0;i<8;i++){const t=veh(['car','suv','jeep'][i%3],0,0,0);vh.pop();t.g.position.y=0;tf.push({m:t.g,e:i%5,u:R(),d:i%2?1:-1,s:12+R()*6,len:H(L[E[i%5][1]][1]-L[E[i%5][0]][1],L[E[i%5][1]][2]-L[E[i%5][0]][2])})}
cam.position.set(0,20,60);P.x=0;P.z=0;
$('bc').style.opacity=S.m>0?1:.5;
quality();cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();requestAnimationFrame(loop);
