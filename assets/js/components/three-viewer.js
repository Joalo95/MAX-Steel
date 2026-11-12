export function createViewer(){
const box=document.getElementById('v3d'),msg=document.getElementById('v3msg'),fail=t=>{msg.textContent=t;msg.style.display='grid'};
if(location.protocol==='file:'){fail('Para cargar los modelos 3D, sirve esta carpeta por HTTP (por ejemplo: python -m http.server) y abre http://localhost:8000.');return}
if(!window.THREE||!THREE.GLTFLoader||!THREE.OrbitControls){fail('No se pudo cargar el visor 3D. Revisa tu conexión e inténtalo de nuevo.');return}
const T=THREE;let renderer;
try{renderer=new T.WebGLRenderer({antialias:true,alpha:true})}catch(e){fail('Tu navegador no permite mostrar gráficos 3D (WebGL).');return}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.localClippingEnabled=true;box.appendChild(renderer.domElement);
const scene=new T.Scene(),cam=new T.PerspectiveCamera(38,1,.1,300);
scene.add(new T.HemisphereLight(0xdfe8f5,0x20242c,1.05));
const sun=new T.DirectionalLight(0xffffff,1.15);sun.position.set(12,22,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:70});sun.shadow.bias=-.0004;scene.add(sun);
const fill=new T.DirectionalLight(0x9fb4d0,.5);fill.position.set(-14,8,-12);scene.add(fill);
const ground=new T.Mesh(new T.PlaneGeometry(90,90),new T.ShadowMaterial({opacity:.4}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
const grid=new T.GridHelper(40,40,0x64748B,0x2a3039);grid.position.y=.002;grid.material.transparent=true;grid.material.opacity=.45;scene.add(grid);
const plane=new T.Plane(new T.Vector3(0,-1,0),50);
const ctl=new T.OrbitControls(cam,renderer.domElement);ctl.enableDamping=true;ctl.maxPolarAngle=Math.PI*.495;ctl.minDistance=3;ctl.maxDistance=60;ctl.autoRotateSpeed=1.2;
const cut=document.getElementById('v3cut'),out=document.getElementById('v3o'),auto=document.getElementById('v3auto');
const GRP=[['Estructura',[['Muros exteriores','Muros exteriores','#c3ccda',1],['Tabiques','Tabiques','#8799b1',1],['Refuerzos de vanos','Refuerzos de vanos','#B58A45',1],['Cubierta','Entramado de techo','#e0d2b5',1],['Cruces de San Andres','Cruces de San Andrés (flejes en X)','#B58A45',1],['Strapping','Strapping (flejes horizontales)','#d8c99e',1],['Encuentros de muros','Encuentros de muros: L, T y cruz','#B58A45',1]]],
['Cerramiento exterior',[['OSB 11 mm','OSB 11 mm','#C79E62',0],['Barrera Tyvek','Barrera de agua y viento','#f2f4f5',0],['EPS 50 mm','EIFS: EPS 50 mm','#9fc8e6',0],['Basecoat y finishcoat','EIFS: basecoat y finishcoat','#8c8e92',0],['Placa Superboard 10 mm','Placa Superboard 10 mm','#b5b3b6',0],['Siding Superboard Cedar 8 mm','Siding Superboard Cedar 8 mm','#b8693f',0]]],
['Terminación interior',[['Lana de vidrio R8','Lana de vidrio R8','#ee8c9e',0],['Barrera de vapor','Barrera de vapor','#4d80d9',0],['Placa de yeso','Placa de yeso','#e5e5de',0]]],
['Techo',[['Techo OSB','OSB de techo','#C79E62',0],['Techo Tyvek','Tyvek para techo','#dfe3e6',0],['Techo chapa prepintada','Chapa prepintada','#4b5058',0],['Techo hormigon alivianado','Hormigón alivianado (pend. 1,5 %)','#9a9a96',0]]],
['Pretiles',[['Pretil OSB','Pretil: OSB','#C79E62',0],['Pretil Tyvek','Pretil: Tyvek para techo','#dfe3e6',0],['Pretil yeso alta densidad','Pretil: yeso de alta densidad','#b3b8b3',0],['Pretil basecoat y finishcoat','Pretil: basecoat y finishcoat','#8c8e92',0]]],
['Zinguería',[['Babetas y zingueria','Babetas, gotero y compriband','#6b7280',0],['Esquineros','Esquineros de siding','#e8ebee',0]]],
['Aberturas',[['Aberturas','Ventanas y puertas','#4aa3d8',0]]],
['Base de entrepiso',[
 ['Pilares de hormigon','Pilares de hormigón','#8799b1',1],
 ['Entrepiso vigas tubo','Vigas tubo perimetrales','#8799b1',1],
 ['Entrepiso montantes PGC 150','Montantes PGC 150 mm','#c3ccda',1],
 ['Entrepiso rigidizadores','Refuerzos de encuentro','#B58A45',1],
 ['Entrepiso flejes','Flejes de rigidización','#d8c99e',1]
]],
['Terminación interior del piso',[
 ['Entrepiso banda acustica','Banda acústica','#d2aa4b',0],
 ['Entrepiso OSB 25 mm','Tablero OSB · 25 mm','#C79E62',0],
 ['Piso fibrocemento 10 mm','Placa de fibrocemento · 10 mm','#b5b3b6',0],
 ['Piso adhesivo y geotextil','Geotextil y adhesivo','#d9c99c',0],
 ['Piso ceramico','Piso cerámico','#f4f1ea',0]
]],
['Cara inferior del entrepiso',[
 ['Entrepiso lana de vidrio R11','Lana de vidrio R11','#c9a699',0],
 ['Entrepiso membrana Tyvek','Membrana Tyvek inferior','#d8c99e',0],
 ['Entrepiso placa cementicia 10 mm','Placa cementicia inferior · 10 mm','#c3ccda',0]
]]];
const VIEW_GROUPS={
 architecture:new Set(GRP.filter(g=>!['Estructura','Base de entrepiso'].includes(g[0])).map(g=>g[0])),
 structure:new Set(['Estructura','Base de entrepiso']),
 composition:new Set(GRP.map(g=>g[0]))
};
const ENT=[];const on={};const wrap=document.getElementById('v3l');
GRP.forEach(g=>{const fs=document.createElement('fieldset'),lg=document.createElement('legend');fs.className='v3g';lg.textContent=g[0];fs.appendChild(lg);
 g[1].forEach(l=>{on[l[0]]=!!l[3];on[l[0].replace(/\s/g,'_')]=!!l[3];const lb=document.createElement('label'),c=document.createElement('input');lb.style.setProperty('--c',l[2]);c.type='checkbox';c.checked=!!l[3];
  c.addEventListener('change',()=>{on[l[0]]=c.checked;on[l[0].replace(/\s/g,'_')]=c.checked;layers()});lb.append(c,document.createTextNode(l[1]));fs.appendChild(lb);ENT.push([l[0],lb])});wrap.appendChild(fs)});
let H=3.5,cur=null,request=0;const cache={};
// Increment the cache version when replacing a model at an existing URL.
const MODEL_CACHE='max-steel-models-v1',asset=path=>new URL(`../../../${path}`,import.meta.url).href,FILES={mono:asset('models3D/Monoambiente25.glb'),d1:asset('models3D/1Dormitorio45.glb'),d2:asset('models3D/2Dormitorios65.glb')};const TX={'Siding Cedar':asset('models3D/tex-cedar.png'),'Placa Superboard':asset('models3D/tex-sb.png')},txc={};
function parseModel(data,url){return new Promise((resolve,reject)=>new T.GLTFLoader().parse(data,new URL('.',url).href,resolve,reject))}
async function loadModel(url){
 const absoluteUrl=new URL(url,document.baseURI).href;let storage;
 if('caches' in window){
  try{storage=await window.caches.open(MODEL_CACHE);const saved=await storage.match(absoluteUrl);if(saved)return parseModel(await saved.arrayBuffer(),absoluteUrl)}
  catch(e){console.warn('No se pudo leer la caché local del modelo 3D:',e)}
 }
 const response=await fetch(absoluteUrl);if(!response.ok)throw new Error(`Error HTTP ${response.status} al descargar el modelo`);
 if(storage)try{await storage.put(absoluteUrl,response.clone())}catch(e){console.warn('No se pudo guardar el modelo 3D en la caché local:',e)}
 return parseModel(await response.arrayBuffer(),absoluteUrl)
}
const getTx=url=>txc[url]||(txc[url]=(()=>{const t=new T.TextureLoader().load(url,undefined,undefined,e=>console.error('No se pudo cargar la textura 3D:',url,e));t.wrapS=t.wrapT=T.RepeatWrapping;return t})());
const setCut=()=>{const v=+cut.value;plane.constant=v>=H-.02?50:v;out.textContent=v>=H-.02?'sin corte':'a '+v.toFixed(2).replace('.',',')+' m'};
function layers(){if(cur)cur.traverse(o=>{const n=(o.userData&&o.userData.name in on)?o.userData.name:(o.name in on?o.name:null);if(n!==null)o.visible=on[n]})}
function setViewMode(mode){
 const visibleGroups=VIEW_GROUPS[mode]||VIEW_GROUPS.architecture;
 GRP.forEach(g=>g[1].forEach(l=>{
  const visible=visibleGroups.has(g[0]),name=l[0];
  on[name]=visible;on[name.replace(/\s/g,'_')]=visible;
  const entry=ENT.find(e=>e[0]===name),input=entry&&entry[1].querySelector('input');
  if(input)input.checked=visible
 }));
 layers()
}
cut.addEventListener('input',setCut);
auto.addEventListener('click',()=>{const o=auto.getAttribute('aria-pressed')!=='true';auto.setAttribute('aria-pressed',o);ctl.autoRotate=o&&!matchMedia('(prefers-reduced-motion:reduce)').matches});
const resize=()=>{const w=box.clientWidth,h=box.clientHeight;renderer.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix()};
new ResizeObserver(resize).observe(box);resize();
function swap(m){if(cur)scene.remove(cur);cur=m;scene.add(m);const pres=new Set();m.traverse(o=>{const n=(o.userData&&o.userData.name)||o.name;if(n)pres.add(n)});ENT.forEach(e=>{e[1].hidden=!pres.has(e[0])});document.querySelectorAll('.v3g').forEach(f=>{f.hidden=![...f.querySelectorAll('label')].some(l=>!l.hidden)});H=m.userData.H;cut.max=(Math.ceil(H*20)/20).toFixed(2);cut.value=cut.max;setCut();layers();const R=m.userData.R;cam.position.set(R*.85,R*.6,R*1.05);ctl.target.set(0,H*.45,0);ctl.update();msg.style.display='none'}
function open(k){document.querySelectorAll('.v3m').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===k));
 const current=++request;
 if(cache[k]){swap(cache[k]);return}
 if(!FILES[k]){fail('El modelo seleccionado no está disponible.');return}
 msg.textContent='Cargando modelo 3D…';msg.style.display='grid';
 const onError=e=>{if(current!==request)return;console.error('No se pudo cargar el modelo 3D:',FILES[k],e);fail('No se pudo cargar el modelo 3D. Comprueba que el archivo exista en models3D y vuelve a intentarlo.')};
 loadModel(FILES[k]).then(g=>{if(current!==request)return;const m=g.scene;m.traverse(o=>{if(o.isMesh){const q=o.material;q.side=T.DoubleSide;q.clippingPlanes=[plane];q.clipShadows=true;if(/^(Acero|Refuerzo|Fleje|Encuentro|Zinc)/.test(q.name))q.metalness=.35;else{q.polygonOffset=true;q.polygonOffsetFactor=1;q.polygonOffsetUnits=1}if(q.name==='Vidrio')q.depthWrite=false;if(TX[q.name]){q.map=getTx(TX[q.name]);q.color.set(0xffffff);q.needsUpdate=true}o.castShadow=true;o.receiveShadow=true}});
   m.updateMatrixWorld(true);const bb=new T.Box3().setFromObject(m),c=bb.getCenter(new T.Vector3()),z=bb.getSize(new T.Vector3());
   m.position.set(-c.x,-bb.min.y,-c.z);
   m.userData={H:z.y,R:Math.max(z.x,z.z)};cache[k]=m;swap(m)}).catch(onError)}
document.querySelectorAll('.v3m').forEach(b=>b.addEventListener('click',()=>open(b.dataset.m)));
let vis=false,run=false;const loop=()=>{if(!vis){run=false;return}requestAnimationFrame(loop);ctl.update();renderer.render(scene,cam)};
new IntersectionObserver(e=>{vis=e[0].isIntersecting;if(vis&&!run){run=true;loop()}}).observe(box);
return {openModel:open,setViewMode};
}
