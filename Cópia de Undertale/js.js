"use strict";

/*console.log("Analise o código fonte para achar a palavra secreta que te faz ganhar!");
{
  const str="qfojt";
  let res="";
  for(let i=0; i<5; i++){
    res+=String.fromCharCode(str[i].charCodeAt()-1);
  }
  Object.defineProperty(window,res,{
    get:function () {
      alert("vc ganho");
    }
  });
}*/

// Fazer isso para a propriedade x e y das imagens funcionar
delete HTMLImageElement.prototype.x;
delete HTMLImageElement.prototype.y;

// Pra não ficar precisando calcular raiz de 2 toda hora
const r2=Math.sqrt(2);

// Versão do jogo. Se não for compatível, deleta o save antigo.
const versao=2;


// Html's

const coracao=     document.querySelector("#coracao");
const wrapper=     document.querySelector("#jogo-wrapper"); // Pai do div principal (necessário para centralizá-lo)
const div=         document.querySelector("#jogo");         // Div principal
const divBattle=   document.querySelector("#batalha");
const spanHp=      document.querySelector("#vidaAtual");
const spanHpMax=   document.querySelector("#vidaMax");
const barraHp=     document.querySelector("#vida");
const divObsts=    document.querySelector("#obstaculos");
const balao=       document.querySelector("#balao");        // Balão de fala do boss
const opon=        document.querySelector("#oponente");
const bhpOpon=     document.querySelector("#vidaOpon");     // Barra HP oponente
const bhpOponCinza=document.querySelector("#barraOpon");    // Parte cinza da barra de HP
const divFF=       document.querySelector("#ff");
const spanFF=      document.querySelector("#multFF");       // Indicação da velocidade de passagem do tempo (FF = Fast Forward)
const imgOpon=     document.querySelector("#imgOpon");


// Range input

const sliders=document.querySelectorAll(".slider");
const externos=document.querySelectorAll(".meter");
const tracks=document.querySelectorAll(".track");
const largTrack=120,largSlider=12;
const maxSlide=largTrack-largSlider;
let rem;
let xMouseclick,slidersLeft=[],slidersLeftClick=[],xInicTracks=[];
let slidersLeftRem=[],vals=[];
for(let i=0; i<sliders.length; i++){
  slidersLeftRem[i]=(+externos[i].dataset.start)*maxSlide;
  sliders[i].style.left=slidersLeftRem[i]+"rem";
}

for(let i=0; i<sliders.length; i++){ // TODO
  function sliderMousemove(e){
    slidersLeft[i]=e.pageX-xMouseclick+slidersLeftClick[i];
    if(slidersLeft[i]<0){
      slidersLeft[i]=0;
    }
    else{
      let maxPx=maxSlide*rem;
      if(slidersLeft[i]>maxPx){
        slidersLeft[i]=maxPx;
      }
    }
    slidersLeftRem[i]=slidersLeft[i]/rem;
    sliders[i].style.left=slidersLeftRem[i]+"rem";
  }

  sliders[i].addEventListener("mousedown",function (e) {
    xMouseclick=e.pageX;
    slidersLeftClick[i]=slidersLeft[i];
    addEventListener("mousemove",sliderMousemove);
  });
  externos[i].addEventListener("mousedown",function (e) {
    if(e.target!=sliders[i]){
      xMouseclick=e.pageX;
      slidersLeftClick[i]=xMouseclick-largSlider/2*rem-xInicTracks[i];
      sliderMousemove(e);
      addEventListener("mousemove",sliderMousemove);
    }
  });
  addEventListener("mouseup",function () {
    removeEventListener("mousemove",sliderMousemove);
  });
}

function getValue(i){
  return slidersLeftRem[i]/maxSlide;
}


// Relativas à luta

let larg,alt; // Largura e altura do div de batalha
let x,y,velX,velY,velRealX,velRealY,hpMax,hp,invul,xAnt,yAnt; // Variáveis relativas ao coraçãozinho
let direcaoHab,estaRapido;
let mult; /* Multiplicador da velocidade. Para torná-la constante, ela é dividida por Math.sqrt(2) quando o coração está
  movendo na diagonal. */
const hbc=6,roac=12; // hbc = hitbox do coração, roac = raio real
let premidas,tamPremidas; /* Guarda as teclas já apertadas, para ignorar novos eventos de aperto dela. Isso é necessário
  pois, se você segurar uma tecla por um tempo, o JavaScript começa a detectar vários eventos de click. */
let t,ronda,fase,emJogo,tFim,fases,naoEPrimeira; // Relativas à fase
let dific,acelerando,incrDificSubito=0.2,incrDificGradual,dificUsuario,meterValue,rondaFim;
let numObst,obsts;
let itens,arma,prot;
let multFF; /* Multiplicador da velocidade do jogo. Se a velocidade for normal é igual a 1. Menor que 1 o jogo fica mais lento
e maior fica mais rápido. */


// Relativas ao textinho pré-luta

let texto,textoAtual,txtDisponivel,pararTxt,pararJogo;


// Relativas à ação "fight"

let intv, // Intervalo médio entre as barrinhas
  numBarras, // Num de barrinhas
  tt; // Tempo total da ação fight
const espera=500; // Espera para a 1a barrinha surgir
let fadeDur, // Duração da transição de visível para invisível das barrinhas
  fadeStart; // Tempo para a barrinha ser considerada um "miss" e ter sua transição iniciada
let penalidades;
const barraAtk=document.querySelector("#tiros"); // Div com as barrinhas brancas
let hpOpon,hpMaxOpon;
let atkPlayer,velPlayer,multAtk;

let tInic,tAtual,tLuta;
let barrasDano,sangues;
let danoLuta;
let hits;
let acertou;
let timeoutFim,timeouts;

let tut=false, // Se está no tutorial
  hitTracker,continuando,loaded,treinando=-1;


const btnsMenu=document.querySelectorAll("#menu button");
const tooltipSave=document.querySelector("#ttSave");

function load(){
  loaded=localStorage.getItem("save");

  try{
    if(loaded==null) throw 0;
    loaded=JSON.parse(loaded);
    if(loaded.versao!=versao){
alert("Sinto muito, mas, devido a mudanças no código e à minha preguiça de fazer compatibilidade com o formato antigo, seus saves foram pro saco... Se quiser uma compensação por isso, me contate:\n\n\
E-mail: samuelfernandomendespires@gmail.com\n\
Endereço: Rua do Barreiro, nº NaN\n\
Atende por \"João Peludão\"");
      throw 1;
    }
    btnsMenu[1].removeAttribute("disabled");

    const itens=loaded.itens;
    let strItens;
    if(itens.length==0){
      strItens="Nenhum";
    }
    else{
      strItens="<span class='nobr'>";
      for(let j=0; j<itens.length; j++){
        if(j!=0){
          strItens+=",</span> <span class='nobr'>";
        }
        strItens+=itens[j].nome;
        if(itens[j].usos){
          strItens+=" ("+itens[j].usos+")";
        }
      }
      strItens+="</span>";
    }

    function removerUndefined(x){
      return x=="undefined"? "Nenhuma": x;
    }

    tooltipSave.innerHTML="\
      <div><dt>Rodada</dt><dd>"+(loaded.ronda+1)+"</dd></div>\
      <div><dt>Seu HP</dt><dd>"+loaded.hp.toFixed(0)+"</dd></div>\
      <div><dt>HP do oponente</dt><dd>"+loaded.hpOpon.toFixed(0)+"</dd></div>\
      <div><dt>Itens</dt><dd>"+strItens+"</dd></div>\
      <div><dt>Defesa</dt><dd>"+removerUndefined(loaded.prot)+"</dd></div>\
      <div><dt>Arma</dt><dd>"+(removerUndefined(loaded.arma)+(loaded.pularProx? " (recarregando)": ""))+"</dd></div>\
    ";
  }
  catch(e){
    if(e!=0){
      loaded=null;
      localStorage.removeItem("save");
    }
    btnsMenu[1].setAttribute("disabled","");
  }
}
load();


// Responsa

/* Em vez de px, nessa página, usei a unidade "rem" (tamanho da fonte aplicado no elemento <html>) para poder aumentar e diminuir
o tamanho de tudo ao mesmo tempo mexendo somente no tamanho da fonte do <html> (pensando bem teria sido mais fácil se eu tivesse
usado transform...) */

let html=document.documentElement,app=document.querySelector("#app");
const altApp=652/*app.offsetHeight*/,
  largApp=922/*app.offsetWidth*/;
  // Infelizmente temos que atualizar isso sempre que mudamos o layout.....
const lpaApp=largApp/altApp;
let sectionLeft,sectionTop;
const section=document.querySelector("#itens");
const ddAtk=document.querySelector("#ddAtk"),ddDef=document.querySelector("#ddDef");
const modais=document.querySelectorAll(".modal");

function autoSize(){
  let lpaW=innerWidth/innerHeight; // Largura por altura janela
  if(lpaW>=lpaApp){
    rem=innerHeight/altApp;
    html.style.fontSize=rem+"px";
  }
  else{
    rem=innerWidth/largApp;
    html.style.fontSize=rem+"px";
  }

  for(let i=0; i<tracks.length; i++){
    xInicTracks[i]=tracks[i].getBoundingClientRect().x;
  }

  const rect=section.getBoundingClientRect();
  sectionLeft=rect.left;
  sectionTop=rect.top;
}

const divsMenu=document.querySelectorAll("#botoesMenu>div");
let maior=0;
for(let i=0; i<divsMenu.length; i++){
  let cand=divsMenu[i].firstElementChild.offsetWidth;
  if(cand>maior) maior=cand;
}
for(let i=0; i<divsMenu.length; i++){
  divsMenu[i].style.width=(maior+1)+"rem";
}


// Itens

const atkBase=5,defBase=5;
let multDano,multInvul,multVel,restauracao,bonusItem,pularProx;

function equiparProt(){
  multDano=10/((prot.def||0)+defBase);

  if(prot.nome=="Óculos"){
    multInvul=2;
  }
  else{
    multInvul=1;
  }

  if(prot.nome=="Botas"){
    multVel=0.8;
  }
  else{
    multVel=1;
  }

  if(prot.nome=="Avental"){
    restauracao=2;
  }
  else{
    restauracao=0;
  }
}

function equiparArma(){
  if(arma.nome=="Panela"){
    bonusItem=4;
  }
  else{
    bonusItem=0;
  }

  if(arma.nome=="Revólver"){
    numBarras=6;
    intv=250;
    tt=1000;
    fadeStart=15*tt/19;
    penalidades=[0.76,0.84,0.92,1.13];
  }
  else if(arma.nome=="Panela"){
    numBarras=5;
    intv=200;
    tt=1400;
    fadeStart=15*tt/19;
    penalidades=[0.61,0.74,0.87,1];
  }
  else if(arma.nome=="Arco"){
    numBarras=4;
    intv=300;
    tt=1200;
    fadeStart=15*tt/19;
    penalidades=[0.5,0.66667,0.83333,1];
  }
  else{
    numBarras=1;
    tt=1000;
    fadeStart=tt;
    penalidades=[0.5,0.66667,0.83333,1];
  }
  fadeDur=4*tt/19;
}


function torta(){
  return{
    txItemUsado:"Você comeu a Torta.",
    txHpCurado:"Sua vida foi completamente restaurada.",
    txExtra:"",
    funcConsumo:function () {
      cura(hpMax);
    },
    nome:"Pie",
    desc:"Restaura toda a vida."
  };
}
function bife(){
  return{
    txItemUsado:"Você comeu o Bife.",
    txHpCurado:"50 HP restaurados.",
    txExtra:"",
    funcConsumo:function () {
      cura(50);
    },
    nome:"Steak",
    desc:"Restaura 50 HP."
  };
}
function seatea(){
  return{
    txItemUsado:"Você tomou o chá.",
    txHpCurado:"25 HP restaurados.",
    txExtra:"Sua velocidade aumentou!",
    funcConsumo:function () {
      cura(25);
      velPlayer+=0.5;
    },
    nome:"Sea Tea",
    desc:"Restaura 25 HP e aumenta velocidade em 25%."
  };
}
function lhero(){
  return{
    txItemUsado:"Você comeu o sanduíche.",
    txHpCurado:"38 HP restaurados.",
    txExtra:"Seu ataque aumentou!",
    funcConsumo:function () {
      cura(38);
      atkPlayer+=1.25;
    },
    nome:"L. Hero",
    desc:"Restaura 38 HP e aumenta ataque em 12%."
  };
}
function cookies(){
  return{
    txItemUsado:"Você pegou um cookie do pacote.",
    txHpCurado:"30 HP restaurados.",
    txExtra:"",
    usos:3,
    funcConsumo:function () {
      this.usos--;
      cura(30);
    },
    nome:"Cookies",
    desc:"Restaura 30 HP. Pode ser comido 3 vezes."
  };
}


// Equips

function avental(){
  return{
    txItemUsado:"Você vestiu o avental.",
    pronome:"Seu",
    pretPerf:"ou",
    def:3,
    nome:"Avental",
    desc:"+3 de defesa. Ganhe 2 de vida ao final de cada turno."
  };
}
function colete(){
  return{
    txItemUsado:"Você vestiu o colete.",
    pronome:"Seu",
    pretPerf:"ou",
    def:5,
    nome:"Colete",
    desc:"+5 de defesa."
  };
}
function botas(){
  return{
    txItemUsado:"Você calçou as botas.",
    pronome:"Suas",
    pretPerf:"aram",
    def:8,
    nome:"Botas",
    desc:"+8 de defesa. Diminui sua velocidade em 20%."
  };
}
function oculos(){
  return{
    txItemUsado:"Você colocou os óculos.",
    pronome:"Seus",
    pretPerf:"aram",
    def:2,
    nome:"Óculos",
    desc:"+2 de defesa. Duplica seu tempo de invencibilidade após tomar dano."
  };
}

function adaga(){
  return{
    txItemUsado:"Você empunhou sua adaga.",
    pronome:"Sua",
    pretPerf:"ou",
    atk:3,
    nome:"Adaga",
    desc:"+3 de ataque. Não requer muita precisão."
  };
}
function revolver(){
  return{
    txItemUsado:"Você pega seu revólver.",
    pronome:"Seu",
    pretPerf:"ou",
    atk:13,
    nome:"Revólver",
    desc:"+13 de ataque. Perca o próximo turno recarregando o revólver após atacar. Tiros certeiros dão dano imenso."
  };
}
function arco(){
  return{
    txItemUsado:"Você prepara seu arco e flecha.",
    pronome:"Seu",
    pretPerf:"ou",
    atk:5,
    nome:"Arco",
    desc:"+5 de ataque."
  };
}
function panela(){
  return{
    txItemUsado:"Sua panela está pronta para causar destruição.",
    pronome:"Sua",
    pretPerf:"ou",
    atk:4,
    nome:"Panela",
    desc:"+(Minha nota na prova de filosofia) de ataque. Os itens que você consome curam 4 a mais."
  };
}


const comidasInic=[0,1,2,4,5,7,8,10];
const defInic=1,atkInic=2;

const itensInv=[
  [
    torta(),
    bife(),
    bife(),
    bife(),
    seatea(),
    seatea(),
    seatea(),
    lhero(),
    lhero(),
    lhero(),
    cookies(),
    cookies(),
    cookies()
  ],
  [
    avental(),
    colete(),
    botas(),
    oculos()
  ],
  [
    adaga(),
    revolver(),
    arco(),
    panela()
  ]
];

const posNE=[[],[],[]];
const posEq=[[],[]];
const posInv=[];

const ulInv=document.querySelector("#seus");
const seus=[];
const itemLists=document.querySelectorAll("#inv>ul");
const elsDds=document.querySelectorAll("#equips dd");
const aneInv=document.querySelector("#aneInv");
const descInv=document.querySelector("#descAtual");
const descInvH3=descInv.querySelector("h3");
const descInvP=descInv.querySelector("p");
const itemDds=[[],[]];

function absolutificar(li,x){
  li.className="abs";
  li.style.left=li.left+"rem";
  li.style.top=li.top+"rem";
  li.tipo=x;
  li.larg=li.offsetWidth;
  li.alt=li.offsetHeight;
  li.desloc=0;
}
function solidificar(ul){
  ul.alt=ul.offsetHeight+3;
  ul.style.height=ul.alt+"rem";
}
function getRekt(li,dsi,copy=true,v,i){
  const ob={};
  const rect=li.getBoundingClientRect();
  ob.left=rect.left;
  ob.top=rect.top;
  if(copy){
    li.left=li.origX=ob.left;
    li.top=li.origY=ob.top;
    li.dsi=dsi;
    li.pv=v;
  }
  if(v!=undefined){
    v[i]=ob;
  }
}
function appendLi(el,v,vi,ii,ij){
  v[vi]=itensInv[ii][ij];
  v[vi].v=v;
  el.appendChild(v[vi].li);
}
function pushLi(v,ii,ij){
  const el=itensInv[ii][ij];
  el.v=v;
  v.push(el);
}


for(let i=0; i<itensInv.length; i++){
  for(let j=0; j<itensInv[i].length; j++){
    const li=itensInv[i][j].li=document.createElement("li");
    li.textContent=itensInv[i][j].nome;
    itemLists[i].appendChild(li);
  }
  solidificar(itemLists[i]);
}

let dummies=[
  new Array(8),
  new Array(1),
  new Array(1)
];
for(let i=0; i<dummies.length; i++){
  for(let j=0; j<dummies[i].length; j++){
    dummies[i][j]=document.createElement("li");
    itemLists[i].appendChild(dummies[i][j]);
  }
}

for(let i=0; i<comidasInic.length; i++){
  appendLi(ulInv,seus,i,0,comidasInic[i]);
}
appendLi(elsDds[0],itemDds[0],0,1,defInic);
appendLi(elsDds[1],itemDds[1],0,2,atkInic);

solidificar(ulInv);
const itensNE=[[],[],[]];

for(let i=0,j=0; j<itensInv[0].length; j++){
  if(comidasInic[i]==j){
    getRekt(itensInv[0][j].li,0,true,posInv,i);
    i++;
  }
  else{
    getRekt(itensInv[0][j].li,2,true,posNE[0],itensNE[0].length);
    pushLi(itensNE[0],0,j);
  }
}
for(let i=0; i<itensInv[1].length; i++){
  if(i==defInic){
    getRekt(itensInv[1][i].li,1,true,posEq[0],0);
  }
  else{
    getRekt(itensInv[1][i].li,2,true,posNE[1],itensNE[1].length);
    pushLi(itensNE[1],1,i);
  }
}
for(let i=0; i<itensInv[2].length; i++){
  if(i==atkInic){
    getRekt(itensInv[2][i].li,1,true,posEq[1],0);
  }
  else{
    getRekt(itensInv[2][i].li,2,true,posNE[2],itensNE[2].length);
    pushLi(itensNE[2],2,i);
  }
}

for(let i=0; i<dummies.length; i++){
  for(let j=0; j<dummies[i].length; j++){
    getRekt(dummies[i][j],undefined,false,posNE[i],j+itensNE[i].length);
  }
  for(let j=0; j<dummies[i].length; j++){
    dummies[i][j].remove();
  }
}

for(let i=0; i<itensInv.length; i++){
  for(let j=0; j<itensInv[i].length; j++){
    absolutificar(itensInv[i][j].li,i);
  }
}


const merged=[];
for(let k=0,i=0; k<itensInv.length; k++){
  for(let j=0; j<itensInv[k].length; i++,j++){
    merged[i]=itensInv[k][j];
  }
}

const dropSpaces=[
  document.querySelector("#inventario"),
  document.querySelector("#equips"),
  document.querySelector("#inv")
];
for(let i=0; i<dropSpaces.length; i++){
  const obj=dropSpaces[i].getBoundingClientRect();
  dropSpaces[i].top=obj.top;
  dropSpaces[i].left=obj.left;
  dropSpaces[i].larg=dropSpaces[i].offsetWidth;
  dropSpaces[i].alt=dropSpaces[i].offsetHeight;
}


let dragX,dragY,drop,dropInd,hoverIdx=-1,msmTipo;

function moveTo(el1,el2){
  el1.style.left=el2.origX+"rem";
  el1.style.top=el2.origY+"rem";
}
function transMove(el1,el2){
  el1.classList.add("hasTransition");
  moveTo(el1,el2);
  setTimeout(function () {
    el1.classList.remove("hasTransition");
  },250);
}
function moveComplete(fn,el1,el2){
  el1.classList.add("hasTransition");
  void el1.offsetHeight;
  fn(el1,el2);
  setTimeout(function () {
    el1.classList.remove("hasTransition");
  },250);
}
function resetPos(el){
  el.left=el.origX;
  el.top=el.origY;
}

function copyElPos(el,el2,mv=true){
  el.left=el.origX=el2.origX;
  el.top=el.origY=el2.origY;
  if(mv){
    transMove(el,el);
  }
}
function copyElData(el,el2){
  el.v=el2.v;
  el.li.dsi=el2.li.dsi;
  el.li.pv=el2.li.pv;
}
function copyEl(el,el2,mv=true){
  copyElPos(el.li,el2.li,mv);
  copyElData(el,el2);
}

function moveToPos(el1){
  const po=posNE[el1.tipo][itensNE[el1.tipo].length];
  el1.style.left=po.left+"rem";
  el1.style.top=po.top+"rem";
}
function copyPos(el,v1,v2,mv=true){
  el.li.left=el.li.origX=v2[v1.length].left;
  el.li.top=el.li.origY=v2[v1.length].top;
  v1.push(el);
  el.li.dsi=dropInd;
  el.v=v1;
  el.li.pv=v2;
  if(mv){
    transMove(el.li,el.li);
  }
}

function chainRemoval(el){
  let i;
  for(i=el.v.length-1; el.v[i]!=el; i--){
    copyElPos(el.v[i].li,el.v[i-1].li);
  }
  el.v.splice(i,1);
}

function dropEInvalido(i,drag){
  const el=merged[i].li;
  let arg1,arg2;

  if(dropInd==el.dsi){
    return true;
  }
  else if(dropInd==2){
    arg1=itensNE[el.tipo];
    arg2=posNE[el.tipo];
  }
  else if(dropInd==0){
    if(drag || seus.length<8){
      arg1=seus;
      arg2=posInv;
    }
  }
  else if(dropInd==1){
    if(el.tipo!=0){
      const vet=itemDds[el.tipo-1];
      if(vet.length==0 || drag){
        arg1=vet;
        arg2=posEq[el.tipo-1];
      }
    }
  }
  else{
    alert("Deu um pau crítico. Por favor contate o desenvolvedor:\n\
E-mail: samuelfernandomendespires@gmail.com\n\
Endereço: Rua do Barreiro, nº NaN\n\
Atende por \"João Peludão\"\n\n\
Código do erro: COMPUTER_ABOUT_TO_EXPLODE_EXCEPTION");
  }

  const ret=arg1==undefined;
  if(!ret){
    if(!drag){
      chainRemoval(merged[i],merged[i].v);
      copyPos(merged[i],arg1,arg2);
    }
  }
  return ret;
}

function getTruePos(e){
  return[
    (e.pageX-sectionLeft)/rem,
    (e.pageY-sectionTop)/rem
  ];
}
function checkHover(el,x,y){
  return x>=el.left && y>=el.top && x<=el.left+el.larg && y<=el.top+el.alt;
}
function getDrop(x,y){
  for(let j=0; j<dropSpaces.length; j++){
    if(checkHover(dropSpaces[j],x,y)){
      dropInd=j;
      drop=dropSpaces[j];
      return;
    }
  }
  dropInd=-1;
}

function updateDef(){
  ddDef.innerHTML=defBase+(itemDds[0][0]? itemDds[0][0].def: 0);
}
function updateAtk(){
  ddAtk.innerHTML=atkBase+(itemDds[1][0]? itemDds[1][0].atk: 0);
}

for(let i=merged.length-1; i>=0; i--){
  merged[i].li.mousemove=function (e) {
    const[trueX,trueY]=getTruePos(e);

    merged[i].li.left=e.pageX/rem-dragX;
    merged[i].li.top=e.pageY/rem-dragY;
    merged[i].li.style.left=merged[i].li.left+"rem";
    merged[i].li.style.top=merged[i].li.top+"rem";

    for(let j=0; j<merged.length; j++){
      if(j!=i){
        if(checkHover(merged[j].li,trueX,trueY)){
          if(!merged[j].li.desloc){
            getDrop(trueX,trueY);
            msmTipo=merged[j].li.tipo==merged[i].li.tipo;
            if(!msmTipo && dropInd!=0 || dropEInvalido(i,true)){
              merged[j].li.desloc=1;
            }
            else{
              let ptrFunc=msmTipo? moveTo: moveToPos;
              moveComplete(ptrFunc,merged[j].li,merged[i].li);
              hoverIdx=j;
              merged[j].li.desloc=2;
            }
          }
        }
        else if(merged[j].li.desloc){
          moveComplete(moveTo,merged[j].li,merged[j].li);
          merged[j].li.desloc=0;
          hoverIdx=-1;
        }
      }
    }
  };


  merged[i].li.mouseup=function (e) {
    if(hoverIdx==-1){
      const[trueX,trueY]=getTruePos(e);
      getDrop(trueX,trueY);
      if(dropInd==-1 || dropEInvalido(i,false)){
        moveComplete(moveTo,merged[i].li,merged[i].li);
      }
      else{
        updateAtk();
        updateDef();
      }
      merged[i].li.desloc=0;
    }
    else{
      merged[hoverIdx].li.desloc=0;

      if(msmTipo){
        merged[i].v[merged[i].v.indexOf(merged[i])]=merged[hoverIdx];
        merged[hoverIdx].v[merged[hoverIdx].v.indexOf(merged[hoverIdx])]=merged[i];
        const temp={li:{}};
        copyEl(temp,merged[i],false);
        copyEl(merged[i],merged[hoverIdx]);
        copyEl(merged[hoverIdx],temp,false);
      }
      else{
        const antigo=merged[hoverIdx].v.indexOf(merged[hoverIdx]);
        const novo=merged[hoverIdx].li.tipo;
        chainRemoval(merged[i]);
        merged[hoverIdx].v[antigo]=merged[i];
        copyEl(merged[i],merged[hoverIdx]);
        copyPos(merged[hoverIdx],itensNE[novo],posNE[novo],false);
        merged[hoverIdx].li.dsi=2;
      }

      resetPos(merged[hoverIdx].li);
      hoverIdx=-1;
      updateAtk();
      updateDef();
    }
    resetPos(merged[i].li);

    removeEventListener("mouseup",merged[i].li.mouseup);
    removeEventListener("mousemove",merged[i].li.mousemove);
  };


  merged[i].li.addEventListener("mousedown",function (e) {
    dragX=e.pageX/rem-this.left;
    dragY=e.pageY/rem-this.top;
    addEventListener("mousemove",merged[i].li.mousemove);
    addEventListener("mouseup",merged[i].li.mouseup);

    descInv.classList.remove("oculto");
    aneInv.classList.add("oculto");
    descInvH3.innerHTML=merged[i].nome;
    descInvP.innerHTML=merged[i].desc;
  });
}


document.querySelector("#conteudoDif>p").style.width=document.querySelector("#conteudoDif>div").offsetWidth+"rem";
html.classList.add("autosized");
autoSize();
for(let i=0; i<tracks.length; i++){
  slidersLeftClick[i]=slidersLeft[i]=slidersLeftRem[i]*rem;
}
addEventListener("resize",autoSize);
updateAtk();
updateDef();

const tudo=document.querySelectorAll("#app *");
for(let i=0; i<tudo.length; i++){
  const objAttr=tudo[i].attributes;
  const objNovo=tudo[i].attrsInic=[];
  for(let j=0; j<objAttr.length; j++){
    objNovo[j]={
      name:objAttr[j].name,
      value:objAttr[j].value
    };
  }
}
let elsTemps;


// Funções texto

const sprites=document.querySelectorAll("#imgOpon>img");
for(let i=0; i<sprites.length; i++){
  sprites[i].srcAttr=sprites[i].getAttribute("src");
}

function setImgOpon(src){
  for(let i=0; i<sprites.length; i++){
    if(sprites[i].srcAttr==src){
      sprites[i].classList.add("visivel");
    }
    else{
      sprites[i].classList.remove("visivel");
    }
  }
}

function pararTexto(){ // Passa para a próxima fala do boss.
  txtDisponivel=true;
  clearInterval(pararTxt);
  textoAtual++;
  spansLetra=[];
}

let spansLetra;
function passarTexto(){ // Exibe a fala atual do boss.
  if(tut){
    if(ronda==6 && textoAtual==1 && hitTracker>0){
      setImgOpon("TorielBrava.png");
    }
    else if((ronda==8 || ronda==9) && textoAtual==0){
      setImgOpon("Toriel.png");
    }
  }

  txtDisponivel=false;
  balao.innerHTML="";
  let pausa=0,i=0,tam=texto[textoAtual].length;
  let els=[balao],numEl=0;

  for(let j=0,k=0; j<tam; j++){
    let ch=texto[textoAtual][j];
    if(ch=="<"){
      if(texto[textoAtual][j+1]=="/"){
        while(texto[textoAtual][j]!=">"){
          j++;
        }
        els.pop();
        numEl--;
      }
      else{
        let tagHtml="";
        let atrsNome=[],atrsValor=[];
        while(true){
          j++;
          if(texto[textoAtual][j]==">"){
            break;
          }
          else if(texto[textoAtual][j]==" "){
            let nome="",valor="",tem2parte=true;
            while(true){
              j++;
              if(texto[textoAtual][j]=="="){
                j++;
                break;
              }
              else if(texto[textoAtual][j]==" "){
                tem2parte=false;
                break;
              }
              else{
                nome+=texto[textoAtual][j];
              }
            }
            if(tem2parte){
              while(true){
                j++;
                const ch=texto[textoAtual][j];
                if(ch=="'"){
                  break;
                }
                else{
                  valor+=ch;
                }
              }
            }
            atrsNome.push(nome);
            atrsValor.push(valor);
          }
          else{
            tagHtml+=texto[textoAtual][j];
          }
        }

        const el=document.createElement(tagHtml);
        els[numEl].appendChild(el);
        for(let l=0; l<atrsNome.length; l++){
          el.setAttribute(atrsNome[l],atrsValor[l]);
        }

        if(tagHtml!="br" && tagHtml!="img" && tagHtml!="hr" && tagHtml!="input"){
          els.push(el);
          numEl++;
        }
      }
    }
    else{
      const span=document.createElement("span");
      els[numEl].appendChild(span);
      spansLetra[k]=span;
      span.innerHTML=ch;

      function setWait(prop){
        span.wait=+getComputedStyle(span).getPropertyValue("--"+prop);
      }
      if(ch==","||(ch=="."&&texto[textoAtual][i+1]!=".")||ch=="!"||ch=="?"||ch==":"){
        setWait("waitpont");
      }
      else{
        setWait("wait");
      }

      span.className="letraInvisivel elFala";
      k++;
    }
  }

  clearInterval(pararTxt);
  const tamSpans=spansLetra.length;

  pararTxt=setInterval(function () { // Mostra o texto letra por letra
    while(pausa<=0){
      spansLetra[i].classList.remove("letraInvisivel");
      if(i==tamSpans-1){
        pararTexto();
        return;
      }
      else{
        pausa=spansLetra[i].wait;
      }
      i++;
    }
    pausa--;
  }, 20);
}


// Funções do jogo

function atualizarPosCor(){ // ATUALIZAR POSição do CORação
  coracao.style.left=x+"rem";
  coracao.style.top=y+"rem";
}

function timeoutApagavel(fn,t){
  const clearer=setTimeout(fn,t);
  timeouts.push(clearer);
  return clearer;
}

function criarElEfemero(tag="div"){
  const el=document.createElement(tag);
  elsTemps.push(el);
  return el;
}
function removerElEfemero(el){
  el.remove();
  elsTemps.splice(elsTemps.indexOf(el),1);
}
function remover1tanto(el,num){
  const v=elsTemps.splice(elsTemps.indexOf(el),num);
  for(let i=0; i<v.length; i++){
    v[i].remove();
  }
}
function removerVetorEl(v){
  remover1tanto(v[0],v.length);
  v=[];
}

function exit(){
  app.classList.add("oculto");
  divMenu.classList.remove("oculto");
  removeEventListener("keyup",keyup);
  removeEventListener("keydown",keydown);
  if(pararJogo!=undefined) clearInterval(pararJogo);
  if(pararTxt!=undefined) clearInterval(pararTxt);
  if(tut){
    tut=false;
  }
  else{
    if(treinando==-1){
      load();
      continuando=false;
    }
    else{
      treinando=-1;
    }
  }

  setTimeout(function () {
    for(let i=0; i<timeouts.length; i++){
      clearTimeout(timeouts[i]);
    }
    timeouts=undefined;

    for(let i=0; i<tudo.length; i++){
      const el=tudo[i];
      const attrsInic=el.attrsInic;
      const attrsAtuais=[];
      for(let j=0; j<el.attributes.length; j++){
        attrsAtuais[j]=el.attributes[j].name;
      }
      for(let j=0; j<attrsAtuais.length; j++){
        el.removeAttribute(attrsAtuais[j]);
      }
      for(let j=0; j<attrsInic.length; j++){
        const attr=attrsInic[j];
        el.setAttribute(attr.name,attr.value);
      }
    }

    for(let i=0; i<elsTemps.length; i++){
      elsTemps[i].remove();
    }
    elsTemps=undefined;
  },0);
}


function resetMeiaBoca(){
  ronda++;
  fase++;
  invul=0;
  textoAtual=0;
  numObst=0;
  multFF=1;
  estaRapido=false;
  timeouts=[];

  t=0;
  funcFrameAntes=funcFrameDepois=funcFim=undefined;
  numPlats=numChaves=chavesObtidas=0;
}

function resetRonda(){
  resetMeiaBoca();
  const notTut=!tut;
  clearInterval(pararJogo);
  divFF.className="";
  divBattle.classList.remove("visivel");
  coracao.classList.remove("pseudoOculto");
  let nepAntigo=true;

  if(naoEPrimeira){
    removerVetorEl(obsts);
    const vaiPular=pularProx;
    setTimeout(function () {
      if(!vaiPular) elAtual.classList.add("hasHeart");
      hp=Math.min(hp+restauracao,hpMax);
      atualizaVida();
    },500);
    if(notTut && treinando!=-1){
      exit();
      return;
    }
  }
  else{
    naoEPrimeira=true;
    nepAntigo=false;
    emJogo=-1;
  }

  if(treinando==-1 && (notTut || ronda>7)){
    function recarregarRevolver(){
      if(pularProx){
        mudarDivId("itemUsado");
        pItemUsado.innerHTML="Você passa esse turno recarregando seu revólver.";
        pHpCurado.innerHTML=pExtra.innerHTML="";
        emJogo=-3;
        pularProx=false;
      }
      else{
        mudarDivId("ane");
        emJogo=-1;
      }
    }

    if(notTut){
      if(fase>=fases.length){
        fase=0;
        embaralhar(fases);
        acelerando=true;
        dific+=incrDificSubito-incrDificGradual;
      }
    }

    if(nepAntigo){
      if(notTut){
        if(acelerando){
          dific+=incrDificGradual;
        }

        if(hpOpon>0 && ronda<rondaFim){
          let strItens;
          if(itens.length==0){
            strItens="[]";
          }
          else{
            strItens="[";
            for(let i=0;;){
              strItens+="{\"nome\":\""+itens[i].nome+"\"";
              if(itens[i].usos){
                strItens+=",\"usos\":\""+itens[i].usos+"\"";
              }
              strItens+="}";
              if(++i>=itens.length){
                strItens+="]";
                break;
              }
              else{
                strItens+=",";
              }
            }
          }

          localStorage.setItem("save",
            "{\"hp\":"+hp+",\"hpOpon\":"+hpOpon+",\"itens\":"+strItens+
            ",\"ronda\":"+ronda+",\"rondaFim\":"+rondaFim+
            ",\"arma\":\""+arma.nome+"\",\"prot\":\""+prot.nome+
            '","pularProx":'+pularProx+
            ',"versao":'+versao+ // Evitar problemas com saves antigos
          "}");
        }

        else{
          alert("vc ganhou uau c e o bixao");
          localStorage.removeItem("save");
          exit();
        }
      }

      div.style.width=div.style.height="";

      div.classList.add("hasTransition");
      timeoutApagavel(function () {
        div.classList.remove("hasTransition");
        recarregarRevolver();
      },500);
    }

    else{
      recarregarRevolver();
    }
  }

  else{
    prepararFase();
  }
}


let roaxo,roayo,cox,coy,dx,dy,ccy,ccx; // Variáveis hitbox

let funcFrameAntes,funcFrameDepois,funcFim;
let numPlats,numChaves;
let multDific;
let chavesObtidas;

function preencherComObj(len,tag="div"){ // Cria "len" divs e os coloca no vetor de obstáculos
  let ret=numObst;
  for(let i=numObst; i<numObst+len; i++){
    obsts[i]=criarElEfemero(tag);
  }
  numObst+=len;
  return ret;
}


// Funções hitbox

function pitagoras(cat1,cat2){
  return Math.sqrt(cat1*cat1+cat2*cat2);
}
function getRaioObst(ob){
  roaxo=ob.widthRem/2;
  roayo=ob.heightRem/2;
  // Distância no eixo x/y da borda do obstáculo até seu centro
}
function getDists(ob){
  cox=ob.posX+roaxo;
  coy=ob.posY+roayo;
  // Coordenadas do centro do obstáculo

  dx=Math.abs(ccx-cox);
  dy=Math.abs(ccy-coy);
  // Distância entre centros do coração e obstáculo
}
function getTudo(ob){
  getRaioObst(ob);
  getDists(ob);
}
function quadradoSemGet(){
  return (dy<=roayo&&dx<=roaxo+hbc)||(dx<=roaxo&&dy<=roayo+hbc);
}
function quadrado(ob=this){ // this = obstáculo
  getTudo(ob);
  return quadradoSemGet();
}


// Obsts gerais

function atualizaPosX(obs,val=obs.x){
  obs.style.left=(obs.posX=val)+"rem";
}
function atualizaPosY(obs,val=obs.y){
  obs.style.top=(obs.posY=val)+"rem";
}
function atualizaPosXGiro(obs,o){
  if(o.girar270){
    atualizaPosY(obs,obs.x);
  }
  else{
    atualizaPosX(obs,obs.x);
  }
}
function atualizaPosYGiro(obs,o){
  if(o.girar270){
    atualizaPosX(obs,obs.y);
  }
  else{
    atualizaPosY(obs,obs.y);
  }
}
function atualizaPosGiro(obs,o){
  atualizaPosXGiro(obs,o);
  atualizaPosYGiro(obs,o);
}
function atualizaPosNormal(obs){
  atualizaPosX(obs,obs.x);
  atualizaPosY(obs,obs.y);
}
function resizeX(obs,val=obs.larg){
  obs.style.width=(obs.widthRem=val)+"rem";
}
function resizeY(obs,val=obs.alt){
  obs.style.height=(obs.heightRem=val)+"rem";
}

function obstGenerico(o,funcApar,funcMov){
  o.velX*=multDific;
  o.velY*=multDific;
  o.tSurg/=multDific;
  /*
    Cria um obstáculo retangular sem nada especial.
    Recebe a função executada por esse obstáculo quando ele surge, a função que determina seu movimento,
    e um objeto com as propriedades:
      - tSurg: Frame no qual o obstáculo aparece, e será executada sua "funcApar".
      - cor: "laranja", "azul" ou "branco"
      - x, y: Coordenadas iniciais
      - velX, velY: Movimento por frame (pode ser negativo)
      - larg, alt: Largura, altura
  */

  let el=criarElEfemero("div");
  el.hitbox=quadrado;
  el.dano=o.dano==undefined? 9: o.dano;
  el.invul=o.invul==undefined? 100: o.invul;
  resizeX(el,o.larg);
  resizeY(el,o.alt);
  el.className=o.cor;
  el.tSurg=o.tSurg;
  obsts[numObst++]=el;

  if(funcApar==undefined){ // funcApar padrão, se nenhuma for passada
    funcApar=function () {
      el.x=o.x;
      el.y=o.y;
      atualizaPosNormal(el);
    }
  }
  if(funcMov==undefined){ // funcMov padrão
    funcMov=function () {
      el.x+=o.velX;
      el.y+=o.velY;
      atualizaPosNormal(el);
    }
  }

  el.funcApar=function () {
    funcApar(el,o);
  }

  el.funcMov=function () {
    funcMov(el,o);
  }
}

function embaralhar(v) { // Embrarlha vetor
  for (let i = v.length-1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = v[i];
    v[i] = v[j];
    v[j] = temp;
  }
}
function atualizaFF(x){ // Muda o valor de multFF (velocidade do jogo)
  multFF=x;
  spanFF.innerHTML=x;
  if(x>=64){
    estaRapido=true;
  }
}
function sinalAleatorio(x){ // Retorna X com um sinal aleatório
  return Math.random()>0.5? x: -x;
}
function formulaDific(m,n){
  return 1+((m-1)*n);
}
function setMultDific(aum,dim=aum){
  const m=dific*dificUsuario;
  multDific=formulaDific(m,m>1? aum: dim);
}


// Lasers!

const pares1=[
  [resizeX,resizeY],
  [atualizaPosY,atualizaPosX]
];
const pares2=[
  [resizeY,resizeX],
  [atualizaPosX,atualizaPosY]
];

function l(altObj,velX,velY,tSurg,cores,girar270=false,toler=120,compr,passouX=0){
  // Cria objeto com os parâmetros para a função laserColorido
  return{
    altObj:altObj,
    velX:velX,
    velY:velY,
    tSurg:tSurg,
    cores:cores,
    girar270:girar270,
    toler:toler,
    compr:compr,
    passouX:passouX
  };
}


function laserColorido(o,funcCria){
  o.velY*=multDific;
  o.velX*=multDific;
  o.tSurg/=multDific;
  /*
    Cria um obstáculo com várias cores que vão se alternando.
    Parâmetros:
      - o: objeto com seguintes propriedades:
        - cores: Vetor com qualquer combinação entre as strings "branco", "azul" e "laranja".
        - altObj: Espessura do laser.
        - toler: Distância da zona de batalha que o laser vai estar quando surgir.
        - compr: Comprimento do laser. Se não for passado é toda a largura ou altura da zona de batalha (dependendo do parâmetro girar270)
        - velX: Movimento por frame das partes coloridas do laser no eixo paralelo ao de movimento do laser. Pode ser negativo.
        - passouX: Deslocamento inicial. estritamente positivo
        - velY: Movimento por frame no eixo de movimento do laser. Se negativo, o laser surge em baixo da zona de batalha; se positivo, em cima.
        - tSurg: Já expliquei.
        - girar270: se verdadeiro, torna o eixo de movimento do laser o X em vez do Y, girando-o 270 graus no sentido horário.
     - funcCria: função extra que será executada quando der a hora do laser surgir.
  */
  o.numCores=o.cores.length;
  o.numObstAnt=preencherComObj(o.numCores*2);

  if(o.altObj==undefined) o.altObj=6;
  if(o.passouX==undefined) o.passouX=0;

  for(let i=0; i<o.numCores*2; i++){


    // Fixos

    let a=obsts[i+o.numObstAnt];
    a.hitbox=quadrado;
    a.invul=100;
    a.tSurg=o.tSurg;

    a.funcApar=function () {


      // Comuns a todos

      if(i==0){
        if(funcCria) funcCria(o);

        if(o.girar270){
          o.pares=pares2;
          if(o.compr==undefined){
            o.compr=alt;
            o.deslocX=0;
          }
          else{
            o.deslocX=alt-o.compr/2;
          }
        }
        else{
          o.pares=pares1;
          if(o.compr==undefined){
            o.compr=larg;
            o.deslocX=0;
          }
          else{
            o.deslocX=larg-o.compr/2;
          }
        }

        o.largCada=o.compr/o.numCores;
      }

      a.classList.add(o.cores[i%o.numCores]);
      o.pares[0][1](a,o.altObj);
      o.pares[0][0](a,o.largCada);


      // Eixo de movimento do laser

      a.y=o.toler-o.altObj/2;
      if(o.velY>0){
        a.y*=-1;
      }
      else{
        a.y+=(o.girar270? larg: alt);
      }


      // Eixo de movimento das cores

      if(o.velX>0){
        if(i<o.numCores-1 || (i==o.numCores-1 && o.passouX==0)){
          a.x=o.largCada*(i-(o.numCores-1))+o.passouX;
          a.larg=0;
          o.pares[0][0](a,0);
          a.dano=0;
        }
        else{
          if(i==o.numCores-1){
            a.larg=o.passouX;
            a.x=o.largCada*(i-(o.numCores-1))+o.passouX-a.larg;
          }
          else{
            if(i==o.numCores*2-1 && o.passouX!=0){
              a.larg=o.largCada-o.passouX;
              a.x=o.compr-a.larg;
            }
            else{
              a.larg=o.largCada;
              a.x=o.largCada*(i-(o.numCores-1))+o.passouX-a.larg;
            }
          }

          o.pares[0][0](a,a.larg);
          a.dano=9;
        }
      }


      else{
        if(i<o.numCores-1 || (i==o.numCores-1 && o.passouX==0)){
          a.x=o.largCada*(-i+(o.numCores-1))-o.passouX+o.compr;
          a.larg=0;
          o.pares[0][0](a,0);
          a.dano=0;
        }
        else{
          if(i==o.numCores-1){
            a.larg=o.passouX;
            a.x=o.largCada*(i-(o.numCores-1))-o.passouX+o.compr;
          }
          else{
            if(i==o.numCores*2-1 && o.passouX!=0){
              a.larg=o.largCada-o.passouX;
              a.x=0;
            }
            else{
              a.larg=o.largCada;
              a.x=o.largCada*(-i+(o.numCores-1))-o.passouX+o.compr;
            }
          }

          o.pares[0][0](a,a.larg);
          a.dano=9;
        }
      }

      o.pares[1][1](a,a.x+o.deslocX);
      o.pares[1][0](a,a.y);
    };

    a.funcMov=function () {
      if(o.velX>0){ // Eixo X
        if(a.x>=(o.numCores-1)*o.largCada){
          if(a.larg>0){
            a.larg-=o.velX;
            a.x+=o.velX;
          }
          else{
            o.pares[0][0](a,0);
            a.x=-(o.numCores-1)*o.largCada+a.x%o.largCada;
            // isso ta meio esquisito mas ok
            a.dano=0;
          }
        }
        else if(a.x<=0&&a.x>-o.velX&&a.larg<o.largCada){
          a.larg+=o.velX;
          a.dano=9;
        }
        else{
          a.x+=o.velX;
        }
      }

      else{
        if(a.x<=0){
          if(a.larg>0){
            a.larg+=o.velX;
          }
          else{
            o.pares[0][0](a,0);
            a.x=(o.numCores*2-1)*o.largCada+o.velX;
            a.larg=0;
            a.dano=0;
          }
        }
        else if(a.x<=o.compr&&a.larg<o.largCada){
          a.larg-=o.velX;
          a.dano=9;
          a.x+=o.velX;
        }
        else{
          a.x+=o.velX;
        }
      }


      a.y+=o.velY; // Eixo Y

      if(o.velY>0){
        if(a.y>120+o.altObj/2+larg){
          a.classList.remove("visivel");
        }
      }
      else{
        if(a.y<-120+o.altObj/2){
          a.classList.remove("visivel");
        }
      }

      if(a.larg){
        o.pares[1][1](a,a.x+o.deslocX);
        o.pares[1][0](a,a.y);
        o.pares[0][0](a,a.larg);
      }
    }
  }
}

function laserMonocor(o,funcCria){
  o.velX*=multDific;
  o.velY*=multDific;
  o.tSurg/=multDific;

  let el=criarElEfemero("div");
  obsts[numObst++]=el;

  el.hitbox=quadrado;
  el.dano=9;
  el.invul=100;
  el.tSurg=o.tSurg;

  let dimPara,dimMov;

  el.funcApar=function () {
    if(funcCria) funcCria(o);

    if(o.altObj==undefined) o.altObj=6;
    if(o.girar270){
      o.pares=pares2;
      dimPara=alt;
      dimMov=larg;
    }
    else{
      o.pares=pares1;
      dimPara=larg;
      dimMov=alt;
    }
    if(o.compr==undefined){
      o.compr=dimPara;
    }

    el.classList.add(o.cor);
    o.pares[0][1](el,o.altObj);
    o.pares[0][0](el,o.compr);


    // Eixo de movimento do laser

    el.y=o.toler-o.altObj/2;
    if(o.velY>0){
      el.y*=-1;
    }
    else{
      el.y+=dimMov;
    }

    o.pares[1][1](el,(dimPara-o.compr)/2);
    o.pares[1][0](el,el.y);
  };

  el.funcMov=function () {
    el.y+=o.velY*multFF; // Eixo Y

    if(o.velY>0){
      if(el.y>120+o.altObj/2+larg){
        el.classList.remove("visivel");
      }
    }
    else{
      if(el.y<-120+o.altObj/2){
        el.classList.remove("visivel");
      }
    }

    o.pares[1][0](el,el.y);
  }
}


// Caixas!

const tamCaixa=40;

function caixa(o,funcCria){
  /*
    Basicamente um obstáculo genérico, mas já vem com alguns estilos e propriedades predefinidas.
    Acho que nada aqui vai ser útil pra você.
  */
  o.velY*=multDific;
  o.tSurg/=multDific;

  let el=criarElEfemero("div");
  el.hitbox=quadrado;
  el.dano=9;
  el.invul=100;
  el.className=o.semBuraco? o.cor: "caixaComBuraco "+o.cor;
  el.tSurg=o.tSurg;
  obsts[numObst++]=el;

  el.funcApar=function () {
    if(funcCria){
      funcCria(o);
    }

    o.larg=o.larg||tamCaixa;
    resizeX(el,o.larg);
    resizeY(el,o.larg);

    el.x=o.deslocX;
    if(o.velY*multFF<0){
      el.y=larg+o.toler;
    }
    else{
      el.y=-o.toler-o.larg;
    }
    atualizaPosGiro(el,o);
  };

  el.funcMov=function () {
    if(!o.nSome){
      const cond=o.velY>0;
      if(cond && el.y>larg+o.toler || !cond && el.y<-o.toler-o.larg){
        el.classList.remove("visivel");
      }
    }
    el.y+=o.velY*multFF;
    atualizaPosYGiro(el,o);
  };
}


// Plataformas!

const largPlat=40,altPlat=6;

function plataforma(o){
  /*
    Cria um obstáculo que não dá dano mas não é atravessável. Parâmetros:
    - o: Objeto com seguintes propriedades:
      - larg, alt, x, y: Óbvios
      - girar270: Se verdadeiro, troca largura por altura
  */
  let el=criarElEfemero("div");
  el.hitbox=quadrado;
  el.dano=0;
  el.invul=0;
  el.tSurg=0;
  el.className="plataforma";
  obsts[numObst++]=el;

  el.funcApar=function () {
    el.larg=o.girar270? altPlat: o.larg;
    el.alt=o.girar270? o.larg: altPlat;
    resizeX(el,el.larg);
    resizeY(el,el.alt);
    el.x=o.x;
    el.y=o.y;
    atualizaPosX(el,el.x);
    atualizaPosY(el,el.y);
  };

  el.funcMov=function(){};
}

function criarPlat(x,y,girou,larg=largPlat){
  plataforma({
    x: x-(girou? altPlat/2: 0),
    y:y-(girou? 0: altPlat/2),
    girar270:girou,
    larg:larg
  });
  numPlats++;
}

function ffaPlat(){
  /*
    Se estiver usando plataformas, a variável funcFrameAntes, que é uma função que é executada antes do movimento em cada
    frame, deve ser essa. Ela guarda a posição do coração anterior, que é necessária para a próxima função.
  */
  xAnt=x;
  yAnt=y;
}

function ffdPlat(start=0){
  /*
    Se estiver usando plataformas, a variável funcFrameDepois, que é uma função que é executada depois do movimento em cada
    frame, deve ser essa. Ela não deixa o coração atravessar plataformas.
  */
  for(let i=start; i<numPlats+start; i++){
    const el=obsts[i];

    for(let k=0; k<2; k++){
      let eixoPara,eixoMov,areaCol,espessura,coordMovAnt,coordParaAnt,coordMov,coordPara;

      if(k==1){
        if(velY==0) continue;
        eixoPara="x";
        eixoMov="y";
        areaCol="larg";
        espessura="alt";
        coordMov=y;
        coordPara=x;
        coordMovAnt=yAnt;
        coordParaAnt=xAnt;
      }
      else{
        if(velX==0) continue;
        eixoPara="y";
        eixoMov="x";
        areaCol="alt";
        espessura="larg";
        coordMov=x;
        coordPara=y;
        coordMovAnt=xAnt;
        coordParaAnt=yAnt;
      }

      // Tecnicamente a hitbox do coração é um círculo mas dane-se

      for(let j=0; j<2; j++){
        let coordMovCol,cond,coordParaCol;

        if(j==1){
          coordMovCol=el[eixoMov]+el[espessura];
          cond=coordMov<coordMovCol && coordMovAnt>=coordMovCol;
        }
        else{
          coordMovCol=el[eixoMov]-roac*2;
          cond=coordMov>coordMovCol && coordMovAnt<=coordMovCol;
        }

        if(cond && function(){
          coordParaCol=coordParaAnt+(coordPara-coordParaAnt)*((coordMovAnt-coordMovCol)/(coordMovAnt-coordMov));
          return coordParaCol>el[eixoPara]-2*roac && coordParaCol<el[eixoPara]+el[areaCol];
        }()){
          /*if(k==1){
            x=coordParaCol;
          }
          else{
            y=coordParaCol;
          }*/

          if(k==1){
            y=coordMovCol;
            if(y==yAnt) velRealY=0;
          }
          else{
            x=coordMovCol;
            if(x==xAnt) velRealX=0;
          }
        }
      }
    }
  }
}

function ffdChave(start){
  for(let i=start; i<start+numChaves; i++){
    let el=obsts[i];
    if(!el.classList.contains("visivel")){
      continue;
    }

    for(let k=0; k<2; k++){
      let eixoMov,eixoPara,coordPara,coordParaAnt,areaCol,coordMovAnt,coordMov,espessura;

      if(k==1){
        if(velY==0) continue;
        eixoMov="y";
        eixoPara="x";
        areaCol="offsetWidth";
        espessura="offsetHeight";
        coordMov=y;
        coordMovAnt=yAnt;
        coordPara=x;
        coordParaAnt=xAnt;
      }
      else{
        if(velX==0) continue;
        eixoMov="x";
        eixoPara="y";
        areaCol="offsetHeight";
        espessura="offsetWidth";
        coordMov=x;
        coordMovAnt=xAnt;
        coordPara=y;
        coordParaAnt=yAnt;
      }

      // Tecnicamente a hitbox do coração é um círculo mas dane-se

      for(let j=0; j<2; j++){
        let coordMovCol,cond;

        if(j==1){
          coordMovCol=el[eixoMov]+el[espessura];
          cond=coordMov<coordMovCol && coordMovAnt>=coordMovCol;
        }
        else{
          coordMovCol=el[eixoMov]-roac*2;
          cond=coordMov>coordMovCol && coordMovAnt<=coordMovCol;
        }

        if(cond && function(){
          const coordParaCol=coordParaAnt+(coordPara-coordParaAnt)*((coordMovAnt-coordMovCol)/(coordMovAnt-coordMov));
          return coordParaCol>el[eixoPara]-2*roac && coordParaCol<el[eixoPara]+el[areaCol];
        }()){
          el.classList.remove("visivel");
          chavesObtidas++;
          if(chavesObtidas==numChaves){
            tFim=t+40*multFF;
          }
        }
      }
    }
  }
}


// Laser grosso

const largLaser=40;
const comprBoca=60;
const altBoca=comprBoca*(527/401); // Resolução da img
const toler=60;
const overlap=10;

function gaster(o,funcCria){
  /*
    Laser branco grosso lançado por aquela boca estranha. Muito específico logo acho que você não vai achar útil também
  */
  o.tSurg/=multDific;
  o.tAviso/=multDific;
  let pla,plab;

  const aviso=criarElEfemero("img");
  resizeX(aviso,comprBoca);
  aviso.dano=0;
  aviso.tSurg=o.tSurg*multFF;
  obsts[numObst++]=aviso;

  const el=criarElEfemero("div");
  el.hitbox=quadrado;
  if(o.tAtk==undefined) o.tAtk=50;
  if(o.invul==undefined) o.invul=5;
  if(o.dano==undefined) o.dano=1;
  el.tSurg=(o.tSurg+o.tAviso)*multFF;
  obsts[numObst++]=el;

  o.tAtk/=multDific;
  o.invul/=multDific;

  let transform;
  let transformStr;
  let tDec;
  const durTrans=10,deslocTrans=24;
  let aoContr,triggered;

  aviso.funcApar=function () {
    if(funcCria) funcCria(o);
    aoContr=multFF<=0;

    aviso.src=aoContr? "laser-grosso-ativo.png": "laser-grosso.png";
    triggered=false;
    transform=0;
    tDec=0;

    if(o.girar270){
      pla=[resizeY,resizeX];
      plab=[altBoca,comprBoca];
    }
    else{
      pla=[resizeX,resizeY];
      plab=[comprBoca,altBoca];
    }

    // Toler: Negativo = embaixo, positivo = em cima
    let rotacao=0;
    if(o.girar180==false){
      aviso.y=-(toler+(comprBoca+altBoca+(o.girar270? -overlap: overlap))/2);
      // Não sei porque essa conta aí mas funcionou
    }
    else{
      aviso.y=(o.girar270? larg: alt)+toler-(comprBoca-altBoca-(o.girar270? -overlap: -3*overlap))/2; // Idem
      // Porque -3? Sei lá ;-;
      rotacao+=180;
    }

    if(o.girar270){
      rotacao+=270;
    }

    aviso.x=o.x-(plab[0]-largLaser)/2;
    transformStr="rotate("+rotacao+"deg)"+" translateY(-";
    aviso.style.transform=transformStr+(aoContr? "": deslocTrans+"rem)")+(aoContr? " scale(0.94)": "");

    atualizaPosGiro(aviso,o);
  }

  aviso.funcMov=function () {
    if(!aoContr){
      if(tDec<durTrans){
        tDec++;
        aviso.style.transform=transformStr+((durTrans-tDec)/durTrans*deslocTrans)+"rem)";
      }
    }
    else{
      tDec++;
      if(tDec>o.tAviso){
        if(tDec>=o.tAviso+10){
          aviso.classList.remove("visivel");
        }
        else{
          aviso.style.transform=transformStr+((tDec-o.tAviso)/durTrans*deslocTrans)+"rem)";
        }
      }
      else if(tDec>=o.tAtk){
        aviso.src="laser-grosso.png";
      }
    }
  }


  el.funcApar=function () {
    el.x=o.x;
    el.y=-toler;
    pla[1](el,larg+2*toler);
    pla[0](el,largLaser);
    el.className="gasterLaser branco";
    el.dano=o.dano;
    el.invul=o.invul;
    aoContr=multFF<=0;

    if(o.girar270){
      el.classList.add("girar270");
    }
    else{
      el.classList.add("nao");
    }
    el.style.animationDuration=o.tAtk*10+100+"ms";
    atualizaPosGiro(el,o);

    if(!aoContr){
      aviso.src="laser-grosso-ativo.png";
      aviso.style.transform+=" scale(0.94)";
    }
    else{
      el.classList.add("reverso");
      aviso.funcApar();
      aviso.classList.add("visivel");
      aviso.apareceu=true;
      tDec=0;
    }
  }

  el.funcMov=function () {
    if((t-el.tSurg)/multFF>=o.tAtk){
      el.dano=0;
      timeoutApagavel(function () {
        el.className="";
      },100);
      if(!aoContr){
        aviso.classList.remove("visivel");
      }
    }
  }
}


// Caixa com buraco grande

const tTrans=50;

function configuraCxGrande(o){
  let el=criarElEfemero("div");
  el.className="caixaPseudoBuraco azul";
  el.tam=o.tam;
  resizeX(el,o.tam);
  resizeY(el,o.tam);
  el.tSurg=o.tSurg=o.tSurg || 0;
  el.dano=9;
  el.invul=100;
  el.hitbox=function () {
    roayo=el.tam/2;
    roaxo=roayo;
    getDists(el);
    const raioInterno=(el.tam/r2-roac-hbc)/2;
    return quadradoSemGet() && pitagoras(dx,dy)>=raioInterno;
  }
  obsts[numObst++]=el;
  return el;
}

function configuraFundo(o){
  let fundo=criarElEfemero("div");
  fundo.className="branco";
  resizeX(fundo,larg);
  resizeY(fundo,alt);
  atualizaPosX(fundo,0);
  atualizaPosY(fundo,0);
  fundo.invul=100;
  const ant=numObst+1;
  fundo.hitbox=function () {
    roayo=obsts[ant].tam/2;
    roaxo=roayo;
    getDists(obsts[ant]);
    roayo-=roac;
    roaxo-=roac;
    return !quadradoSemGet();
  }
  fundo.funcMov=function(){};
  obsts[numObst++]=fundo;
  return fundo;
}

function caixaGrandeCPrevia(o,script,funcReset){
  // Fundo e el tem que ser nessa ordem
  let fundo=configuraFundo(o);
  let el=configuraCxGrande(o);

  fundo.classList.add("fundoFade");
  fundo.tSurg=100000;
  fundo.funcApar=function(){
    timeoutApagavel(function () {
      fundo.dano=9;
    },500);
  };

  function surgir(){
    el.x=o.x;
    el.y=o.y;
    atualizaPosNormal(el);
    script.passo=0;
    if(funcReset) funcReset();
  }

  el.funcApar=function () {
    if(o.x==undefined) o.x=(larg-el.tam)/2;
    if(o.y==undefined) o.y=(alt-el.tam)/2;
    surgir();
  };

  let nAtivou=true;

  el.funcMov=function () {
    if(t<=o.tRep+o.tSurg){
      script(t-o.tSurg,el,o);
    }
    else{
      if(nAtivou){
        multFF=0;
        fundo.classList.add("visivel");
        nAtivou=false;

        x=larg/2-roac;
        y=alt/2-roac;
        coracao.style.transition=el.style.transition="left 500ms linear, top 500ms linear";
        void coracao.offsetHeight; // Reflow

        timeoutApagavel(function () {
          multFF=1;
          coracao.style.transition=el.style.transition="";
        },500);

        atualizarPosCor();
        surgir();
      }
      else{
        if(t>=2*o.tRep+o.tSurg+tTrans){
          fundo.classList.remove("visivel");
          el.classList.remove("visivel");
        }
        else if(t>=o.tRep+tTrans+o.tSurg){
          script(t-o.tSurg-o.tRep-tTrans,el,o);
        }
      }
    }
  };
}


function caixaGrande(o,script){
  let fundo=configuraFundo(o);
  let el=configuraCxGrande(o);

  fundo.funcApar=function(){};
  fundo.tSurg=o.tSurg;
  fundo.dano=9;

  el.funcApar=function () {
    if(o.x==undefined) o.x=(larg-el.tam)/2;
    if(o.y==undefined) o.y=(alt-el.tam)/2;
    el.x=o.x;
    el.y=o.y;
    atualizaPosNormal(el);
  };

  el.funcMov=function () {
    script(t-o.tSurg,el,o);
  }
}


const largChave=24;

function chave(o){
  let el=criarElEfemero("img");
  obsts[numObst++]=el;
  el.src="chave.png";
  el.dano=0;
  el.tSurg=0;
  el.hitbox=1;
  resizeX(el,largChave);
  el.className="chave";

  el.funcApar=function () {
    el.x=o.x;
    el.y=o.y;
    atualizaPosNormal(el);
  }

  el.funcMov=function () {}
}

function criarChave(x,y){
  chave({
    x:x,
    y:y
  });
  numChaves++;
}


// Fases

const fasesPadrao=[
  {//r1
    larg:240,
    alt:240,
    fn:function () {
      function naSorte(x,vely,ft){
        let cores=["azul","branco","laranja"];
        const ordem=[[1,false],[-1,true],[-1,false],[1,true]];
        for(let i=0; i<x; i++){
          embaralhar(cores);
          laserColorido(l(6,sinalAleatorio(i%2? 0.66667: 1.33333),ordem[i][0]*vely,ft(i),cores,ordem[i][1],240,undefined,Math.random()*79));
        }
      }

      setMultDific(1,0.8);
      const spd1=1.1111111111,spd2=0.8888888889;

      naSorte(4,spd1,function (i) {
        return 144*i;
      });

      naSorte(4,spd2,function (i) {
        switch(i){
          case 0:
          return 644;
          case 1:
          return 696;
          case 2:
          return 936;
          case 3:
          return 1003;
        }
      });

      tFim=1600;
    }
  },

  {//r2
    larg:240,
    alt:24,
    fn:function () {
      setMultDific(1,1);
      const cores2=["laranja","azul"];
      let t=0;
      const velx1=1.5,vely1=1.5,velx2=0.75,vely2=1.5;
      const disty=264,distx=280,multRapido=0.5;

      laserColorido(l(6,sinalAleatorio(velx1),vely1,t,cores2,false,360,undefined,Math.random()*80));
      t+=Math.round(disty/vely1);
      laserColorido(l(6,sinalAleatorio(velx1),vely1,t,cores2,true,180,larg,Math.random()*80),function (o) {
        if(x>(larg-roac)/2) o.velY*=-1;
      });
      t+=Math.round(distx/vely1);

      laserColorido(l(6,sinalAleatorio(velx2),vely2,t,cores2,false,360,undefined,Math.random()*80));
      t+=Math.round(disty/vely2*multRapido);
      laserColorido(l(6,sinalAleatorio(velx2),vely2,t,cores2,false,360,undefined,Math.random()*80));
      t+=Math.round(disty/vely2*multRapido);
      laserColorido(l(6,sinalAleatorio(velx2),vely2,t,cores2,false,360,undefined,Math.random()*80));
      t+=Math.round(disty/vely2);

      let ladoEscolhido;
      laserColorido(l(6,sinalAleatorio(velx1),vely1,t,cores2,true,180,larg,Math.random()*80),function (o) {
        if(x>(larg-roac)/2){
          ladoEscolhido=-1;
          o.velY*=-1;
        }
        else{
          ladoEscolhido=1;
        }
      });
      t+=Math.round(disty/vely2*multRapido);
      laserColorido(l(6,sinalAleatorio(velx1),vely1,t,cores2,true,180,larg,Math.random()*80),function (o) {
        o.velY*=ladoEscolhido;
      });
      t+=Math.round(disty/vely2*multRapido);
      laserColorido(l(6,sinalAleatorio(velx1),vely1,t,cores2,true,180,larg,Math.random()*80),function (o) {
        o.velY*=ladoEscolhido;
      });
      t+=Math.round(distx*2/vely2); // Vezes 2 porque sim

      tFim=t;
    }
  },

  {//r3
    larg:240,
    alt:240,
    fn:function () {
      setMultDific(0.6,1);
      const vel=1,num=24,tCada=120;

      for(let i=0; i<num; i++){
        caixa({
          velY:vel,
          toler:240,
          cor:"branco",
          tSurg:i*tCada
        },function(o){
          if(i%2==1){
            o.girar270=true;
            o.deslocX=y-8; // 8 pq eh o tam da caixa menos o do coracao sobre 2
          }
          else{
            o.girar270=false;
            o.deslocX=x-8;
          }

          const j=i%4;
          if(j==1 || j==2){
            o.velY*=-1;
          }
        });
      }

      for(let i=0; i<7; i++){
        gaster({
          tSurg:360*(i+1),
          tAviso:160,
          x:(larg-largLaser)/2,
          girar180:Math.random()<0.5
        },function (o) {
          o.girar270=Math.abs(x-(larg-roac)/2)<Math.abs(y-(alt-roac)/2);
        });
      }

      tFim=num*tCada;
      const incr=(1/tFim)*1.5*multDific;

      funcFrameAntes=function () {
        multFF+=incr;
        spanFF.innerHTML=multFF.toFixed(1);
      };

      divFF.classList.add("visivel");
    }
  },

  {//r4
    larg:76,
    alt:110,
    fn:function () {
      setMultDific(1.25);
      const vel=6.66667,num=10;
      const tCada=tamCaixa/vel*4;
      const cores=["azul","laranja"];
      let ultimo=1;

      atualizaFF(0.25);

      for(let i=0; i<num; i++){
        caixa({
          velY:vel,
          toler:240,
          cor:function () {
            let ind;
            if(ultimo==0){
              ind=1;
            }
            else{
              ind=Math.random()<0.5? 0: 1;
            }
            ultimo=ind;
            return cores[ind];
          }(),
          tSurg:25+i*tCada,
          deslocX:(larg-tamCaixa)/2
        });
      }

      laserColorido(l(6,2,0,0,["branco","azul"],true,-21));
      laserColorido(l(6,-2,0,0,["branco","azul"],true,-55));

      tFim=tCada*num+(280+alt)/vel;
      divFF.classList.add("visivel");
    }
  },

  {//r5
    larg:240,
    alt:240,
    fn:function () {
      setMultDific(1);
      atualizaFF(64);
      divFF.classList.add("visivel");

      criarPlat(0,largPlat,false);
      criarPlat(2*largPlat,0,true);
      criarPlat(2.5*largPlat,0*largPlat,true,2.25*largPlat);
      criarPlat(2*largPlat,5*largPlat,false);
      criarPlat(2*largPlat,4*largPlat,false);
      criarPlat(5*largPlat,4.5*largPlat,false);
      criarPlat(3.75*largPlat,2*largPlat,false,2.25*largPlat);
      criarPlat(1.25*largPlat,5*largPlat,true);
      criarPlat(4*largPlat,3*largPlat,true);
      criarPlat(0.25*largPlat,2.5*largPlat,true,2*largPlat);
      criarPlat(3.25*largPlat,1*largPlat,false,1.5*largPlat);
      criarPlat(4*largPlat,0,true);
      criarPlat(2*largPlat,1*largPlat,false,0.5*largPlat);

      funcFrameAntes=ffaPlat;
      funcFrameDepois=ffdPlat;

      let tInic=360;
      const intvMedio=110,intvCurto=85,av1=160,av2=160,av3=440,av4=600;

      function gasterEsperto(girar180,girar270,tSurg,tAviso){
        gaster({
          girar180:girar180,
          girar270:girar270,
          tSurg:tSurg,
          tAviso:tAviso
        },function (o) {
          o.x=(girar270? y: x)-(largLaser-2*roac)/2;
        });
      }

      gasterEsperto(false,false,100,av1);

      gasterEsperto(false,false,tInic,av1);
      tInic+=intvCurto;
      gasterEsperto(false,true,tInic,av1);
      tInic+=intvCurto;
      gasterEsperto(true,false,tInic,av1);
      tInic+=intvCurto;
      gasterEsperto(true,true,tInic,av1);
      tInic+=intvCurto+av1;

      gasterEsperto(false,false,tInic,av2);
      gasterEsperto(false,true,tInic,av2);
      tInic+=intvMedio;
      gasterEsperto(true,false,tInic,av2);
      gasterEsperto(true,true,tInic,av2);
      tInic+=intvMedio;
      gasterEsperto(false,false,tInic,av2);
      gasterEsperto(false,true,tInic,av2);
      tInic+=intvMedio+av2;


      const linhas=larg/largLaser;

      function gasterSet(girar180,girar270,toler,tAviso){ // Melhorar quando der vontade
        let linhaEsc=Math.floor(Math.random()*(linhas-1-toler));
        if(linhaEsc==linhas-2-toler) linhaEsc++;

        for(let i=0; i<linhas; i++){
          if(i==linhaEsc){
            if(linhaEsc!=0){
              i+=toler+1;
            }
            else{
              i+=toler;
            }
          }
          else{
            gaster({
              girar180:girar180,
              girar270:girar270,
              tSurg:tInic,
              tAviso:tAviso,
              x:i*largLaser
            });
          }
        }
      }

      gasterSet(false,true,1,av3);
      gasterSet(false,false,1,av3);
      tInic+=av3+50;

      gasterSet(true,false,0,av4);
      gasterSet(true,true,0,av4);
      tInic+=av4+50;

      tFim=tInic*multFF+100;
    }
  },

  {//r6
    larg:280,
    alt:260,
    fn:function () {
      setMultDific(1);
      atualizaFF(64);
      divFF.classList.add("visivel");
      x=2*largPlat+4;

      criarPlat(2*largPlat,1.5*largPlat,false);
      criarPlat(2*largPlat,1.5*largPlat,true,0.75*largPlat);
      criarPlat(1.5*largPlat,4.5*largPlat,false);
      criarPlat(5*largPlat,5*largPlat,false);
      criarPlat(6*largPlat,4.25*largPlat,true,largPlat*3/4);
      criarPlat(0,5.5*largPlat,false);
      criarPlat(3.25*largPlat,5.5*largPlat,false,1.75*largPlat);
      criarPlat(6*largPlat-3,3.5*largPlat,false,largPlat+3);
      criarPlat(5.5*largPlat-3,1*largPlat,true);
      criarPlat(4.5*largPlat-3,1*largPlat,false);
      criarPlat(3*largPlat-3,3*largPlat,true,1.25*largPlat);

      criarChave(5.5*largPlat-6,2*largPlat-4);
      criarChave(larg-32,4.25*largPlat);

      funcFrameAntes=function () {
        multFF+=0.032*multDific;
        spanFF.innerHTML=multFF.toFixed(0);
        ffaPlat();
      };
      funcFrameDepois=function () {
        ffdPlat();
        ffdChave(numPlats);
      };

      for(let i=0; i<61; i++){ // MELHORAR ESSA ZORRA
        const restoIpor4=i%4;
        gaster({
          girar180:restoIpor4==1 || restoIpor4==2,
          girar270:restoIpor4==1 || restoIpor4==3,
          tSurg:200+i*240,
          tAviso:160,
        },function (o) {
          o.x=(o.girar270? y: x)-(largLaser-2*roac)/2;
        });
      }

      tFim=6000*160;
    }
  },

  {//r7
    larg:80,
    alt:80,
    fn:function () {
      setMultDific(1);
      divFF.classList.add("visivel");
      spanFF.innerHTML="1.0";
      multFF=1;
      const intv=320,pares=3;
      const numGasters=pares*2;
      const multPt2=4;
      const areas=larg/largLaser;

      let gastersAnts=[];
      let areasPerigosas=[];
      for(let i=0; i<areas; i++){
        areasPerigosas[i]=[];
      }

      do{
        for(let i=0; i<areas; i++){
          for(let j=0; j<areas; j++){
            areasPerigosas[i][j]=0;
          }
        }

        for(let i=0; i<pares; i++){
          function set(zeroou1){
            const atual=2*i+zeroou1;
            let parteQInteressa={};

            function setRandom(){
              parteQInteressa.girar180=Math.random()>0.5;
              parteQInteressa.areaX=Math.floor(Math.random()*areas);
              if(atual>=2){
                if(parteQInteressa.girar180==gastersAnts[atual-2].girar180
                && parteQInteressa.areaX==gastersAnts[atual-2].areaX){
                  parteQInteressa.girar180=!parteQInteressa.girar180;
                }
              }
            }

            function addLinha(j){
              for(let i=0; i<areas; i++){
                areasPerigosas[j][i]++;
              }
            }
            function addCol(j){
              for(let i=0; i<areas; i++){
                areasPerigosas[i][j]++;
              }
            }

            setRandom();
            if(zeroou1==1){
              addLinha(parteQInteressa.areaX);
            }
            else{
              addCol(parteQInteressa.areaX);
            }
            gastersAnts[atual]=parteQInteressa;
          }

          set(0);
          set(1);
        }
      } while(function(){
        for(let i=0; i<areas; i++){
          for(let j=0; j<areas; j++){
            if(areasPerigosas[i][j]==0) return true;
          }
        }
        return false;
      }());

      for(let i=0; i<numGasters; i++){
        gaster({
          girar180:gastersAnts[i].girar180,
          girar270:i%2==1,
          x:gastersAnts[i].areaX*largLaser,
          tAviso:intv,
          tSurg:Math.floor(i/2)*intv
        },function (o) {
          if(multFF>1){
            o.tAtk=Math.round(50/multPt2);
            o.dano=9*1.8/o.tAtk; // nao sei
            o.invul=1;
          }
        });
      }


      const tRev=(pares*intv+50)/multDific;
      let varia=0;
      let nZerou1=true,nZerou2=true,nIniciou2=true;

      function resetObsts(){
        for(let i=0; i<numObst; i++){
          obsts[i].apareceu=false;
        }
      }

      funcFrameAntes=function () {
        if(t>tRev && nIniciou2){
          if(multFF>0) varia++;
          else{
            varia--;
            if(nZerou1){
              divFF.classList.add("reverso");
              resetObsts();
              nZerou1=false;
            }
          }
          multFF-=0.0004*varia;
          spanFF.innerHTML=Math.abs(multFF).toFixed(1);
        }
        else if(!nZerou1 && (t<=0 || !nIniciou2) && multFF<multPt2){
          if(nIniciou2){
            varia=0;
            nIniciou2=false;
            tFim=tRev+50; // tFim de verdade
          }
          if(multFF<(-1+multPt2)/2){
            varia++;
            if(nZerou2 && multFF>0){
              divFF.classList.remove("reverso");
              resetObsts();
              nZerou2=false;
            }
          }
          else{
            varia--;
          }
          if(varia==0){
            nZerou1=true;
          }
          else{
            multFF+=0.00016*varia;
            spanFF.innerHTML=Math.abs(multFF).toFixed(1);
          }
        }
      }
      tFim=10000;
    }
  },

  {//r8
    larg:400,
    alt:400,
    fn:function () {
      setMultDific(0.5,0.7);
      y=alt-2*roac-10;
      x=10;

      tFim=2000;
      const tLava=2000;

      obstGenerico({
        larg:larg,
        x:0,
        y:alt,
        alt:0,
        cor:"laranja",
        tSurg:400,
        invul:200
      },undefined,function (el,o) {
        if(t<tLava){
          o.alt+=alt/((tLava/multDific)-o.tSurg);
          resizeY(el,o.alt);
          atualizaPosY(el,o.y-o.alt);
        }
      });

      criarChave(10,10);

      criarPlat(0,85,false,larg-90);
      criarPlat(100,180,false,larg-100);
      criarPlat(0,295,false,larg-110);

      laserColorido(l(6,2,0,0,["azul","laranja"],true,-197));

      funcFrameAntes=function () {
        ffaPlat();
      }
      funcFrameDepois=function () {
        ffdChave(1);
        ffdPlat(2);
      }

      for(let tSurg=50; tSurg<tLava;){
        const dado=Math.random();

        if(dado<0.45){
          const dado2bool=Math.random()<0.5;
          const dado3=Math.random();
          const xPossivelMax=larg-largLaser;

          gaster({
            girar180:dado2bool,
            girar270:true,
            tSurg:tSurg,
            tAviso:160,
            x:xPossivelMax*dado3
          });

          tSurg+=90;
        }

        else{
          const xPossivelMax=larg-tamCaixa;
          function jogarDado(){
            let res=Math.random()*larg-tamCaixa/2;
            if(res<0) res=0;
            else if(res>xPossivelMax) res=xPossivelMax;
            return res;
          }

          let dadoscx=[jogarDado()];
          do{
            dadoscx[1]=jogarDado();
          } while(Math.abs(dadoscx[1]-dadoscx[0])<tamCaixa+12);

          function cx(i){
            caixa({
              velY:2,
              toler:200,
              cor:"branco",
              tSurg:tSurg,
              girar270:false,
              deslocX: dadoscx[i]
            });
          }
          cx(0);
          cx(1);

          tSurg+=80;
        }
      }
    }
  },

  {//r9
    larg:400,
    alt:400,
    fn:function () {
      setMultDific(1.25,1);
      const vel=1,num=22,tCada=90;
      let vicio=0.5,resAnt;

      for(let i=0; i<num; i++){
        let res=Math.random()<vicio;
        if(i==0 || res!=resAnt){
          vicio=0.5;
        }
        if(resAnt) vicio-=0.25;
        else vicio+=0.25;
        resAnt=res;

        laserMonocor({
          toler:120,
          cor:res? "laranja": "azul",
          velY:Math.random()<0.5? vel: -vel,
          girar270: Math.random()<0.5,
          tSurg:i*tCada
        });
      }

      tFim=(num+1)*tCada;
    }
  },

  {//r10
    larg:240,
    alt:240,
    fn:function () {
      setMultDific(0.5,0.7);
      y=24;
      let vel4,angCirc,nFoi3;
      let nAcabou1=true;
      const vel2=1*multDific;
      const tCirc=386/multDific,velCirc=0.5;
      const tInic=50/multDific;

      caixaGrandeCPrevia({
        tSurg:0,
        tRep:1000000,
        tam:120
      },function f(tf,el,o) {
        if(f.passo==0){
          if(tf>=tInic){
            f.passo++;
          }
        }
        else{
          if(f.passo==1){
            el.y+=(tf<100+tInic? (tf-tInic)/100*2: 2)*multDific;
            if(el.y>=alt-el.tam/2){
              f.passo++;
            }
          }

          else if(f.passo==2){
            el.y-=vel2*0.8;
            el.x-=vel2*0.6;
            if(el.x<=-el.tam/2){
              f.passo++;
            }
          }

          else if(f.passo==3){
            el.x-=Math.cos(angCirc)*velCirc*multDific;
            el.y-=Math.sin(angCirc)*velCirc*multDific;
            angCirc+=Math.PI/tCirc;
            if(angCirc>3*Math.PI/2){
              if(nFoi3){
                angCirc=Math.PI/2;
                nFoi3=false;
              }
              else{
                f.passo++;
              }
            }
          }

          else if(f.passo==4){
            el.y+=vel4*0.8*multDific;
            el.x-=vel4*0.6*multDific;
            if(vel4<1.5){
              vel4+=0.02;
            }
            else{
              vel4=1.5;
              if(el.x<=o.x){
                f.passo++;
              }
            }
          }

          else{
            if(nAcabou1){
              nAcabou1=false;
              o.tRep=tf+50;
              tFim=o.tSurg+2*o.tRep+2*tTrans;
            }
          }

          atualizaPosNormal(el);
        }
      },function () {
        angCirc=Math.PI/2;
        nFoi3=true;
        vel4=velCirc;
      });
      tFim=100000;
    }
  },

  {//r11
    larg:320,
    alt:320,
    fn:function () {
      setMultDific(0.5);
      function randomCSinal(x){
        return Math.random()*2*x-x;
      }

      let accAng=randomCSinal(0.5);
      let acc=0;
      const accMax=0.4*multDific;
      const accSuper=0.8*multDific;
      let ang=2*Math.PI*Math.random();
      const velMax=1;
      const tStart=50;
      let tObst=tStart+250;

      const tCada=300;
      let dirs=[true,false];
      let cores=["laranja","azul"];
      embaralhar(dirs);
      embaralhar(cores);

      caixaGrande({
        tSurg:0,
        tam:160
      },function(tf,el,o){
        if(tf<tStart/multDific) return;

        if(acc<accMax || (t>tObst/multDific && acc<accSuper)){
          acc+=accMax/100*multDific;
        }
        accAng+=function () {
          return (Math.random()*(2-Math.abs(accAng))-Math.min(accAng+1,1))/10;
        }();
        ang+=accAng*Math.PI/20*acc;

        let vel=(1-Math.abs(accAng))*acc;
        el.x+=vel*Math.cos(ang);
        el.y+=vel*Math.sin(ang);

        if(el.x<0){
          el.x=0;
          ang=-ang+Math.PI;
        }

        else if(el.x>larg-el.tam){
          el.x=larg-el.tam;
          ang=-ang+Math.PI;
        }

        else if(el.y<0){
          el.y=0;
          ang=-ang;
        }

        else if(el.y>alt-el.tam){
          el.y=alt-el.tam;
          ang=-ang;
        }

        atualizaPosNormal(el);
      });

      for(let i=0; i<2; i++){
        laserMonocor({
          toler:160,
          cor:cores[i],
          velY:1.33333,
          girar270: dirs[i],
          tSurg:tObst
        },function (o) {
          if(o.girar270){
            if(x>larg/2-roac) o.velY*=-1;
          }
          else{
            if(y>alt/2-roac) o.velY*=-1;
          }
        });
        tObst+=tCada;
      }

      laserColorido({
        velX:1,
        velY:0.73,
        tSurg:tObst,
        cores:cores,
        toler:120,
        passouX:Math.random()*larg/2
      },
      function (o) {
        const distX=x-(larg/2-roac);
        const distY=y-(alt/2-roac);
        if(Math.abs(distX)>Math.abs(distY)){
          o.girar270=true;
          if(distX>0) o.velY*=-1;
        }
        else{
          o.girar270=false;
          if(distY>0) o.velY*=-1;
        }
      });
      tObst+=600;

      tFim=tObst+400;
    }
  },

  {//r12
    larg:240,
    alt:400,
    fn:function () {
      setMultDific(0.2,0.4);
      let espacoAtual=2,espacoAnt=espacoAtual;
      let dir,dirAnt;
      const tamCxMaior=48;
      const espacos=larg/tamCxMaior;
      const vel=2.4;
      const tCada=tamCxMaior/vel;
      let tTotal=0;
      const toler=240;
      const fim=20;

      atualizaFF(0.5);
      divFF.classList.add("visivel");
      y=40;

      for(let i=0; i<fim; i++){
        function cx(j){
          caixa({
            velY:vel,
            toler:toler,
            cor:"branco",
            tSurg:tTotal,
            deslocX:tamCxMaior*j-0.5,
            girar270:false,
            larg:tamCxMaior+1
          });
        }

        for(let j=0; j<espacos; j++){
          if(j!=espacoAtual && j!=espacoAnt){
            cx(j);
          }
        }

        espacoAnt=espacoAtual;
        tTotal+=tCada;

        const iMenorQue10=i<10;
        if(i>0 && !((iMenorQue10 && i%2==0) || (!iMenorQue10 && i%3==0))){
          if(espacoAtual==0){
            dir=1;
          }
          else if(espacoAtual==espacos-1){
            dir=-1;
          }
          else{
            dir=sinalAleatorio(1);
          }
          espacoAtual+=dir;

          if(tTotal>0 && dir!=dirAnt){
            obstGenerico({
              alt:6,
              larg:tamCxMaior+1,
              x:tamCxMaior*espacoAtual-0.5,
              y:-toler-3,
              cor:"branco",
              tSurg:tTotal
            },undefined,function (el,o) {
              el.y+=vel*multFF*multDific;
              if(el.y>alt+toler-3){
                el.classList.remove("visivel");
              }
              else atualizaPosY(el,el.y);
            });
          }

          dirAnt=dir;
        }
      }

      tFim=tTotal+270;
    }
  },

  {//r13
    larg:360,
    alt:24,
    fn:function () {
      setMultDific(0.3,0.5);
      const tamCxMaior=72;
      const espacos=larg/tamCxMaior;
      let espacoAtual=2,espacoAnt=espacoAtual;
      let dir,dirAnt;
      const vel=1.6;
      const tCada=tamCxMaior/vel;
      let tTotal=0;
      const toler=240;
      const fim=8;

      atualizaFF(0.75);
      divFF.classList.add("visivel");

      for(let i=0; i<fim; i++){
        function cx(j){
          caixa({
            velY:vel,
            toler:toler,
            cor:"branco",
            tSurg:tTotal,
            deslocX:tamCxMaior*j-0.5,
            girar270:false,
            larg:tamCxMaior+1,
            nSome:true
          });
        }

        for(let j=0; j<espacos; j++){
          if(j!=espacoAtual && j!=espacoAnt){
            cx(j);
          }
        }

        espacoAnt=espacoAtual;
        tTotal+=tCada;

        if(espacoAtual==0){
          dir=1;
        }
        else if(espacoAtual==espacos-1){
          dir=-1;
        }
        else{
          dir=sinalAleatorio(1);
        }
        espacoAtual+=dir;

        if(tTotal>0 && dir!=dirAnt){
          obstGenerico({
            alt:6,
            larg:tamCxMaior+1,
            x:tamCxMaior*espacoAtual-0.5,
            y:-toler-3,
            cor:"branco",
            tSurg:tTotal
          },undefined,function (el,o) {
            el.y+=vel*multFF*multDific;
            atualizaPosY(el,el.y);
          });
        }

        dirAnt=dir;
      }

      let varia=1;
      const start=multFF,end=-1.125;
      const meio=(start+end)/2;
      let nTrocou=true,comecouAMudar=false;
      const tTroca=(tTotal+(toler+alt+tamCxMaior)/vel)/multDific;

      funcFrameAntes=function () {
        if(t>tTroca || comecouAMudar){
          comecouAMudar=true;
          if(multFF>end && varia!=0){
            multFF-=0.002*varia;
            spanFF.innerHTML=Math.abs(multFF).toFixed(1);

            if(multFF<0 && nTrocou){
              for(let i=0; i<numObst; i++){
                if(!obsts[i].classList.contains("visivel")){
                  obsts[i].classList.add("visivel");
                  obsts[i].funcApar();
                }
              }
              nTrocou=true;
              divFF.classList.add("reverso");
            }

            if(multFF>meio){
              varia++;
            }
            else{
              varia--;
            }
          }
          else{
            multFF=end;
            varia=0;
            comecouAMudar=false;
            spanFF.innerHTML=Math.abs(multFF).toFixed(1);
          }
        }

        else if(multFF<0 && t<=0){
          resetRonda();
        }
      }

      tFim=10000;
    }
  }
];

incrDificGradual=incrDificSubito/(fasesPadrao.length+1);


// Check

const checkMsgs=document.querySelectorAll("#checkMsg>div");
let lastCheck;
let bateria;
const spanBateria=document.querySelector("#bateria");
let decrBateria;

function showCheck(i){
  if(lastCheck!=checkMsgs[i]){
    if(lastCheck!=undefined){
      lastCheck.classList.remove("visivel");
    }
    lastCheck=checkMsgs[i];
    lastCheck.classList.add("visivel");
  }
}


function keyup(e){
  if(e.which==27){
    exit();
  }

  // Reverte mudanças na velocidade quando solta tecla

  else if(e.which<=40&&e.which>=37&&tamPremidas>0){ // Se não for setinha, ignorar
    tamPremidas--;
    for(let i=0; i<=tamPremidas; i++){
      if(e.which==premidas[i]){
        premidas.splice(i,1);
        break;
      }
    }
    mudaVel(e.which,-1);
  }
}


function prepararFase(fDepois){
  let flagNormal=true,flagHitkill=false;
  const cond=hpOpon<=0,
    condPacifista=!cond && (fase>=12 || fase>=10 && hpOpon==hpMaxOpon);

  if(tut){
    if(cond || condPacifista){
      if(ronda==8){
        flagHitkill=true;
      }
      ronda=10;
      fase=10;
    }
    else if(ronda==10){
      ronda--;
    }
  }
  else{
    const cond2=cond || treinando==fasesPadrao.length;
    if(cond2) ronda=-1;
    if(cond2 || ronda==rondaFim-1){
      alt=240;
      larg=240;
      flagNormal=false;
    }
  }
  if(flagNormal){
    larg=fases[fase].larg;
    alt=fases[fase].alt;
  }

  if(alt>240){
    div.classList.add("overflow");
  }
  else{
    div.classList.remove("overflow");
  }

  div.classList.add("hasTransition");
  div.style.width=larg+"rem";
  div.style.height=alt+"rem";
  emJogo=-4;

  // Colocar no vetor "texto" strings com a fala desejada do boss, de acordo com a rodada.
  if(tut){
    if(ronda==0){
      texto=["Olá, sou a Toriel e vou te ensinar a jogar essa coisa. <em>(Aperte Z para passar)</em>",
      "Para começar vamos aprender a mexer e desviar.",
      "Use as setinhas do teclado para desviar da coisa branca que vai aparecer mexendo em sua direção."];
    }

    else if(ronda==1){
      texto=["Acho que peguei muito pesado. Vamos facilitar um pouco."];
    }

    else if(ronda==2){
      texto=["Esplêndido! Mas também há outros classes de obstáculos, como os <span class='txAzul'>azuis</span>.",
      "Mas eles são ainda mais fáceis: basta ficar parado para atravessá-los e sair ileso!",
      "Pense assim, azul lembra gelo, né? Então, se vir algo azul, se congele!"];
    }

    else if(ronda==3){
      texto=["Entendo, às vezes dá medo e uma vontade de sair correndo, né?",
      "Vamos tentar de outra forma."];
    }

    else if(ronda==4){
      texto=["Você está pegando o jeito! Acho que já está preparado para aprender a próxima cor, a <span class='txLaranja'>laranja</span>.",
      "Ela é o contrário da azul, ou seja, você só passa nela mexendo.",
      "Pense que você está descalço(a) sobre um piso ardente e se não atravessá-lo logo, se queima!",
      "Fogo é laranja, né?",
      "Ah, e é importante mover até o final. Se você parar no meio, nem que por pouco tempo, de nada adianta a tentativa!"];
    }

    else if(ronda==5){
      texto=["Eu sei que é muita informação, vamos de novo."];
    }

    else if(ronda==6){
      texto=["É basicamente isso. Será que dá para juntar tudo agora?"];
      if(hitTracker){
        texto.push("<span class='soletrado'>Provavelmente não, né?</span>");
      }
      else{
        texto.push("Algumas fases, como essa mesmo que preparei para você agora, têm uns obstáculos especiais. Mas você pega o jeito!");
      }
    }

    else if(ronda==7){
      texto=["Agora vamos dirigir nossa atenção a esses botões aí embaixo.",
      "Em sua luta, após cada ataque do oponente, você poderá navegar pelo menu, usando as setinhas, para escolher uma ação.",
      "A ação <span class='btnToriel'>FIGHT</span> te permite dar dano no oponente.",
      "Barras varticais aparecerão e você deve apertar Z quando elas estiverem no meio da tela, para maximizar o dano.",
      "Tente usá-la contra este boneco. Aperte Z para selecioná-la."];
    }

    else if(ronda==8){
      texto=["Continue tentando até a vida dele acabar."];
    }

    else if(ronda==9){
      texto=[];
    }

    else if(ronda==10){
      setImgOpon("Toriel.png");
      if(flagHitkill){
        texto=["Eita.",
        "Você é muito mais forte que eu pensava. A luta vai ser tranquila para você, suponho.",
        "Mas, continuando..."];
      }
      else if(condPacifista){
        texto=["Pelo visto você não é um cara do tipo agressivo, então vamos pular essa parte."];
      }
      else{
        texto=[];
      }
      texto.push("Além de lutar, você tem no menu outras opções úteis.",
      "Em <span class='btnToriel'>ACT</span>, você pode realizar uma ação. As ações disponíveis dependem de seu oponente e da situação.",
      "Em <span class='btnToriel'>ITEM</span>, você encontra um menu de itens que podem ser gastos para recuperar vida.",
      "Em <span class='btnToriel'>MERCY</span>, você pode tentar fugir, se essa opção estiver disponível (no caso não vai estar, então esquece),",
      "Ou simplesmente passar a vez. Sei lá, vai ver você não é um cara violento. <span class='spoiler'>Spoiler: É possível ganhar dessa forma.</span>",
      "Navegue pelo menu com as setinhas, e se você se arrepender de escolher uma opção, volte com X.",
      "E isso é basicamente tudo. Boa sorte!");
    }
  }
  else if(treinando!=-1){
    texto=["<em style='--wait:0;--waitpont:0'>(Aperte Z para iniciar)</em>"];
  }
  else{
    if(ronda==-1){
      texto=["Sobrecarregando armas, iniciando sequência de autodestruição..."];
    }
    else if(ronda==rondaFim-1){
      texto=["Desisto."];
    }
    else if(ronda==fases.length){
      texto=["Acabaram as fases. Agora vai repetir tudo de novo...",
      "Só que mais rápido, é claro."];
    }
    else if(ronda==6){
      texto=["Você já me viu mudar a velocidade da passagem do tempo. Mas e a direção dele?"];
    }
    else if(ronda==9){
      texto=["Primeiro observe com calma, porque você vai ter que fazer depois."];
    }
    else{
      texto=[];
    }
  }

  timeoutApagavel(function () {
    inicRonda();
    if(fDepois) fDepois();
    div.classList.remove("hasTransition");
  },500);
}

function sumirDivEPreparar(fDepois){
  divAtual.classList.remove("visivel");
  prepararFase(fDepois);
}


function keydown(e){
  // Fim da luta

  function finalizarFight(){
    // Cria elemento que indica o dano causado
    let toma=criarElEfemero("span");
    toma.innerHTML=acertou? Math.round(danoLuta): "MISS";
    opon.appendChild(toma);
    toma.className="spanFight "+(acertou? "hit": "miss");
    toma.style.top=(opon.offsetHeight-toma.offsetHeight)/2+"rem";

    timeoutApagavel(function () {
      removerVetorEl(sangues);
      removerVetorEl(barrasDano);
      tLuta=[];

      divAtual.style.transform="scale(0)";
      divAtual.classList.add("pseudoOculto");

      prepararFase(function () {
        divAtual.classList.remove("pseudoOculto");
        divAtual.style.transform="";
        divAtual.classList.remove("visivel");
        removerElEfemero(toma);
      });
    },1000);

    if(acertou){
      // Dano no boss
      hpOpon-=danoLuta;
      bhpOponCinza.classList.remove("pseudoOculto");
      atualizaVidaOpon();
      imgOpon.style.animation="shake 1s linear 0s 1";

      setTimeout(function () { // Não é apagável mesmo!
        bhpOponCinza.classList.add("pseudoOculto");
        imgOpon.style.animation="";
      },tt);
    }
  }


  /* Navegação */

  if(emJogo==-1){
    if(e.which<=40&&e.which>=37){ // Moveu
      function eListaDupla(){
        return divAtual.childNodes[1].classList.contains("dlpl");
      }

      if(vetorAtual==botoes){
        if(e.which==38){
          const len=lis[idxDiva].length;
          if(len){
            if(eListaDupla()){
              let indEsq,indDir;
              if(len%2==1){
                indEsq=len-1;
                indDir=len-2;
              }
              else{
                indEsq=len-2;
                indDir=len-1;
              }

              if(idxEla<=1){
                moverCoracao(lis[idxDiva],indEsq);
              }
              else{
                moverCoracao(lis[idxDiva],indDir);
              }
            }

            else{
              moverCoracao(lis[idxDiva],len-1);
            }
          }
        }

        else if(e.which==37){
          if(idxEla!=0) moverCoracao(botoes,idxEla-1);
        }
        else if(e.which==39){
          if(idxEla!=botoes.length-1) moverCoracao(botoes,idxEla+1);
        }

        fnSairQlqrTecla();
      }
      else{
        const eListaDuplaRet=eListaDupla();
        const idxElaEPar=idxEla%2==0;
        let limite=eListaDuplaRet? 2: 1;

        if(e.which==40){
          const novoInd=idxEla+limite;
          if(novoInd>=vetorAtual.length){
            if(eListaDuplaRet && !idxElaEPar){
              moverCoracao(botoes,2);
            }
            else{
              moverCoracao(botoes,0);
            }
          }
          else{
            moverCoracao(vetorAtual,novoInd);
          }
        }
        else if(e.which==38){
          const novoInd=idxEla-limite;
          if(novoInd>=0){
            moverCoracao(vetorAtual,novoInd);
          }
        }
        else if(eListaDuplaRet){
          if(e.which==37){
            if(!idxElaEPar){
              moverCoracao(vetorAtual,idxEla-1);
            }
          }
          else{
            const novoInd=idxEla+1;
            if(idxElaEPar && vetorAtual[novoInd]){
              moverCoracao(vetorAtual,novoInd);
            }
          }
        }
      }
    }
    else if(e.which==90){ // Apertou Z
      if(vetorAtual==botoes){
        mudarDivId(elAtual.dataset.div);

        if(elAtual.dataset.div=="fight"){

          // Fight!! Início

          elAtual.classList.remove("hasHeart");
          emJogo=-2;
          hits=0;
          danoLuta=atkPlayer*multAtk*(atkBase+(arma.atk||0))*(0.95+0.1*Math.random());
          barrasDano=[];
          sangues=[];
          acertou=false;
          if(arma.nome=="Revólver") pularProx=true;

          function criaBarraDano(i){
            barrasDano[i]=criarElEfemero("div");
            barrasDano[i].classList.add("tiro");
            barraAtk.appendChild(barrasDano[i]);

            barrasDano[i].style.animation="pow "+tt+"ms linear,blur "+fadeDur+"ms linear "+fadeStart+"ms forwards";
            barrasDano[i].style.left="100%";

            barrasDano[i].t=tLuta[i];
          }

          timeoutApagavel(function () {
            tLuta[0]=0;
            tInic=performance.now(); // Pega tempo atual (em milissegundos)
            criaBarraDano(0);
            if(numBarras>1){
              for(let i=1; ; ++i){
                tLuta[i]=tLuta[i-1]+intv/2+Math.random()*intv;
                timeoutApagavel(function () {
                  criaBarraDano(i);
                },tLuta[i]);

                if(i==numBarras-1){
                  timeoutFim=timeoutApagavel(function () {
                    danoLuta*=Math.pow(0.5,numBarras-hits);
                    finalizarFight();
                  },tLuta[i]+tt);
                  break;
                }
              }
            }
            else{
              timeoutFim=timeoutApagavel(function () {
                danoLuta=0;
                finalizarFight();
              },fadeStart+fadeDur);
            }
          },espera);
        }
        else{
          if(lis[idxDiva].length){
            moverCoracao(lis[idxDiva],0);
          }
          else{
            bobocabo.classList.remove("oculto");
            sairQlqrTecla=true;
          }
        }
      }

      else{
        if(divAtual.id=="item"){
          emJogo=-3;
          mudarDivId("itemUsado");

          const o=itens[idxEla];
          pItemUsado.innerHTML=o.txItemUsado;

          if(o.li.tipo==0){
            pHpCurado.innerHTML=o.txHpCurado+
              (bonusItem && o.nome!="Pie"? " (+"+bonusItem+" de bônus)": "");
            pExtra.innerHTML=o.txExtra;
            o.funcConsumo();

            if(o.usos==undefined || o.usos==0){
              removerItemAtual();
            }
            else{
              lis[2][idxEla].spam.innerHTML="Cookies ("+o.usos+")";
            }
          }

          else{
            pExtra.innerHTML="";

            function concordancia(ant){
              if(ant.nome){
                pHpCurado.innerHTML=ant.pronome+" "+ant.nome+" volt"+ant.pretPerf+" para seu inventário.";
                lis[2][idxEla].spam.innerHTML=ant.nome;
                itens[idxEla]=ant;
              }
              else{
                pHpCurado.innerHTML="";
                removerItemAtual();
              }
            }

            if(o.li.tipo==1){
              concordancia(prot);
              prot=o;
              equiparProt();
            }
            else{
              concordancia(arma);
              arma=o;
              equiparArma();
            }
          }

          moverCoracao(botoes,2,false);
        }

        else if(divAtual.id=="act"){
          emJogo=-3;
          if(idxEla==0){
            mudarDivId("checkMsg");
            if(!tut){
              spanBateria.innerHTML=(100-ronda*decrBateria).toFixed(0);
            }
          }
          moverCoracao(botoes,1,false);
        }

        else{
          moverCoracao(botoes,3,false);
          sumirDivEPreparar();
        }
      }
    }
    else if(e.which==88){ // Apertou X (voltar)
      if(vetorAtual==lis[idxDiva]){
        moverCoracao(botoes,function() {
          for(let i=0; i<botoes.length; i++){
            if(botoes[i].dataset.div==containers[idxDiva].id){
              return i;
            }
          }
        }());
        mudarDivId("ane");
      }
      else{
        fnSairQlqrTecla();
      }
    }
  }


  // Dar um hit

  else if(emJogo==-2&&e.which==90){
    if(barrasDano[hits]!==undefined){
      let th,atual;
      function atualiza(){
        th=barrasDano[hits];
        atual=(performance.now()-tInic)-th.t;
      }
      const tt2=tt/2;

      // Se barras passaram da distância limite, considerá-las como miss e pulá-las. Se não, ir para a próxima barra
      do{
        atualiza();
        /*
          BUG: Se você apertar Z depois da última barrinha de ataque ter passado da última linha vermelha, aparece um erro no console.
          Mas como o programa continua rodando sem problema depois disso, eu ignorei kkkk
        */
        hits++;
      }while(atual>=fadeStart && function() { // Só executa essa função se atual>=fadeStart, ou seja, caso de miss
        danoLuta*=0.5;
        return true;
      }());

      th.style.setProperty("animation-delay", "0s,"+atual+"ms", "important");
      let sangue=criarElEfemero("div");
      sangues.push(sangue);
      barraAtk.appendChild(sangue);
      sangue.classList.add("sangue");
      sangue.style.left=atual/tt*100+"%";
      acertou=true;

      danoLuta*=penalidades[function(){
        let porc=(tt2-Math.abs(tt2-atual))/tt2;
        /* Multiplica o dano por um número menor que 1 se o ataque foi imperfeito */
        if(porc<8/19){
          return 0;
        }
        else if(porc<14/19){
          return 1;
        }
        else if(porc<18/19){
          return 2;
        }
        else{
          return 3;
        }
      }()];

      if(hits==numBarras){
        timeoutApagavel(function () {
          clearTimeout(timeoutFim);
          finalizarFight();
        },fadeDur);
      }
    }
  }


  else if(emJogo==-3){
    sumirDivEPreparar();
  }


  else if(emJogo===0){
    if(e.which==90){
      if(textoAtual<texto.length){ // Se o boss vai falar alguma coisa...
        if(txtDisponivel){
          passarTexto();
        }
      }
      else{ // Senão inicia direto
        if(tut){
          if(ronda==6){
            setImgOpon("Toriel.png");
          }
          else if(ronda==7 || ronda==8){
            setImgOpon("boneco.gif");
          }
          else if(ronda==10){
            exit();
            return;
          }
        }
        balao.classList.add("oculto");
        novaRonda();
      }
    }
    else if(e.which==88&&txtDisponivel==false){ // Se apertar X o texto todo fica visível de uma vez
      for(let i=0; i<spansLetra.length; i++){
        spansLetra[i].classList.remove("letraInvisivel");
      }
      pararTexto();
    }
  }


  else{
    if(e.which<=40&&e.which>=37){
      for(let i=0; i<tamPremidas; i++){
        if(e.which==premidas[i]) return;
      }
      premidas.push(e.which);
      tamPremidas++;
      mudaVel(e.which,1);
    }
  }
}


function novaRonda(){ // Carrega a fase atual
  texto=undefined;
  obsts=[];
  divBattle.classList.add("visivel");
  y=alt/2-roac;
  x=larg/2-roac;
  atualizarPosCor();

  if(ronda==-1 || ronda==rondaFim-1){ // Qdo ele morre vai pra essa ronda
    function dificUltimaRonda(n){
      return formulaDific(dificUsuario,n);
    }
    setMultDific(0);
    let cores=["azul","laranja"];
    const dificLaser=dificUltimaRonda(1);
    const velLs=2*dificLaser,tLs=120/dificLaser;
    let tTotal=50/dificLaser;

    embaralhar(cores);
    function ls1(i){
      laserMonocor({
        toler:240,
        cor:cores[i],
        velY:sinalAleatorio(velLs),
        girar270: i==0,
        tSurg:tTotal
      });
    }
    ls1(0);
    ls1(1);
    tTotal+=tLs;

    embaralhar(cores);
    function ls2(i){
      const ie0=i==0;
      laserMonocor({
        toler:240,
        cor:cores[i],
        velY:ie0? velLs: -velLs,
        girar270: ie0,
        tSurg:tTotal
      },function (o) {
        const distX=x-(larg/2-roac);
        const distY=y-(alt/2-roac);
        if(Math.abs(distX)>Math.abs(distY)){
          o.girar270=true;
        }
        else{
          o.girar270=false;
        }
      });
    }
    ls2(0);
    ls2(1);
    tTotal+=tLs;

    const cxs=larg/tamCaixa;
    const dificCaixa=dificUltimaRonda(1);
    let xCxs=[],yCxs=[];
    for(let i=0; i<cxs; i++){
      xCxs[i]=yCxs[i]=i;
    }
    embaralhar(xCxs);
    embaralhar(yCxs);
    const velCx=2*dificCaixa;
    const girar180cx1=sinalAleatorio(-1);
    const girar180cx2=sinalAleatorio(-1);
    const intvMinCx=tamCaixa/velCx;
    for(let i=0; i<cxs; i++){
      caixa({
        velY:velCx*girar180cx1,
        toler:240,
        cor:"branco",
        tSurg:tTotal,
        girar270:false,
        deslocX: xCxs[i]*tamCaixa
      });
      caixa({
        velY:velCx*girar180cx2,
        toler:240,
        cor:"branco",
        tSurg:tTotal,
        girar270:true,
        deslocX: yCxs[i]*tamCaixa
      });
      tTotal+=3*intvMinCx;
    }

    const dificGst=dificUltimaRonda(0.5);
    tTotal+=120/dificGst;
    const tGst=tTotal;
    let xGst,yGst;
    const numGst=4;
    const intvGst=160/dificGst;
    const espacGst=50;
    function gstGroup(pioneiro){
      for(let j=0; j<numGst; j++){
        function gst(girar270){
          gaster({
            tSurg:tTotal,
            tAviso:intvGst,
            x:j*espacGst,
            girar180:false,
            girar270:girar270
          },function (o) {
            if(j==0 && girar270){
              if(pioneiro){
                function get(coord){
                  return Math.floor((coord+roac)/(larg/(numGst+1)));
                }
                xGst=get(x);
                yGst=get(y);
              }
              let novoXGst,novoYGst;
              do{
                const dir=Math.random()<0.5;
                const mov=sinalAleatorio(2);
                const movSec=sinalAleatorio(1);
                if(dir){
                  novoXGst=xGst+mov;
                  novoYGst=yGst+movSec;
                }
                else{
                  novoXGst=xGst+movSec;
                  novoYGst=yGst+mov;
                }
              }while(novoXGst<0 || novoYGst<0 || novoXGst>numGst || novoYGst>numGst);
              xGst=novoXGst;
              yGst=novoYGst;
            }
            if(j>=(girar270? yGst: xGst)){
              o.x+=espacGst;
            }
          });
        }
        gst(true);
        gst(false);
      }
    }
    gstGroup(true);
    tTotal+=intvGst+20/dificGst;
    gstGroup();
    tTotal+=intvGst-50/dificGst;
    caixa({
      velY:3*dificGst,
      cor:"branco",
      tSurg:tTotal
    },function (o) {
      const largReal=larg-2*roac;
      const dif=(espacGst-tamCaixa)/2;
      const xEsp=xGst*espacGst+dif,yEsp=yGst*espacGst+dif;
      const toler=360;
      if(yEsp<largReal/3){
        o.girar270=false;
        o.toler=toler-yEsp;
        o.deslocX=xEsp-(tamCaixa-2*roac)/2;
      }
      else{
        o.girar270=true;
        o.deslocX=yEsp-(tamCaixa-2*roac)/2;
        if(xEsp>largReal/2){
          o.toler=toler-(largReal-xEsp);
          o.velY*=-1;
        }
        else{
          o.toler=toler-xEsp;
        }
      }
    });
    tTotal+=intvGst-60/dificGst;

    let coresLc=["azul","laranja"];
    const dificUltimoLaser=dificUltimaRonda(1);
    const velLc=0.4*dificUltimoLaser;
    const vels=[0,0.4,0.8,1.2];
    function lc(i,g270,g180) {
      embaralhar(coresLc)
      laserColorido({
        velX:sinalAleatorio(vels[i])*dificUltimoLaser,
        velY:g180? -velLc: velLc,
        tSurg:tTotal,
        cores:coresLc,
        toler:120,
        passouX:Math.random()*larg/2,
        girar270:g270
      });
    }
    embaralhar(vels);
    lc(0,true,true);
    lc(1,false,false);
    lc(2,true,false);
    lc(3,false,true);

    tTotal+=(120+larg)/velLc+235/dificUltimoLaser;
    const tCabum=tTotal;
    const durBalango=475;
    const inicBalango=tCabum-durBalango;
    const incrIncr=0.001;
    let incr=0;
    let balangoAtual=0;

    const dificEst=dificUltimaRonda(0.5);
    const largEst=12,altEst=12;
    const centroDispY=-132,centroDispX=larg/2-roac;
    const disp=120;
    const velEst=2*dificEst;
    const accEst=velEst*velEst*0.004;

    function estilhaco(ang){
      const el=criarElEfemero("div");
      el.className="estilhaco branco";
      el.tSurg=tCabum;
      el.invul=5;
      el.dano=9;
      resizeX(el,largEst);
      resizeY(el,altEst);
      el.hitbox=function () {
        roayo=altEst/2;
        roaxo=largEst/2;
        getDists(el);
        let ret=pitagoras(dx,dy)<=roaxo+hbc;
        if(ret) el.classList.remove("visivel");
        return ret;
      }
      obsts[numObst++]=el;
      let o={};

      el.funcApar=function () {
        const sin=Math.sin(ang),cos=Math.cos(ang);
        el.y=centroDispY;
        el.x=centroDispX;
        const random=Math.sqrt(Math.random());
        o.velY=random*velEst*sin;
        o.velX=random*2*cos;
        atualizaPosNormal(el);
      }

      el.funcMov=function () {
        o.velY+=accEst;
        el.x+=o.velX;
        el.y+=o.velY;
        atualizaPosNormal(el);
      }
    }

    const num=48;
    function gerar(n,ang,rand){
      for(let i=0; i<n; i++){
        estilhaco((ang+rand*Math.random())*Math.PI);
      }
    }
    gerar(num,0,2);
    gerar(num/2,1,1);
    gerar(num/4,1.25,0.5);
    gerar(num/8,1.385,0.25);
    gerar(num/16,1.4385,0.125);

    let vivo=true;

    funcFrameAntes=function () {
      if(t>=tCabum){
        if(vivo){
          imgOpon.style.left="";
          imgOpon.style.top="";
          imgOpon.classList.add("explodido");
          vivo=false;
        }
      }
      else if(t>=inicBalango){
        if(t%4==0){
          incr+=incrIncr;
          balangoAtual+=incr;
          function balango() {
            return (Math.random()*2-1)*balangoAtual+"rem";
          }
          imgOpon.style.left=balango();
          imgOpon.style.top=balango();
        }
      }
    }
    tFim=tTotal+400/dificEst;
  }
  else{
    if(tut){
      multDific=1;
    }
    fases[fase].fn();
    if(tut){
      hitTracker=0;
    }
  }

  for(let i=0; i<numObst; i++){ // Coloca os obstáculos no HTML
    divObsts.appendChild(obsts[i]);
    obsts[i].apareceu=false;
  }
  if(divFF.classList.contains("visivel") && (larg<120 || alt<60)){
    divFF.classList.add("embaixo");
  }
  tFim/=multDific;
  emJogo=1;
  frame(funcFrameAntes,funcFrameDepois,funcFim);
  if(tFim!=0) pararJogo=setInterval(function () { // 100 frames por segundo
    frame(funcFrameAntes,funcFrameDepois,funcFim);
  },10);
}


function inicFase(){ // Chamada quando o jogo inicia
  naoEPrimeira=tut;
  atkPlayer=10;
  velPlayer=2;
  hpMax=76;
  acelerando=false;
  sairQlqrTecla=false;
  elsTemps=[];
  divMenu.classList.add("oculto");
  app.classList.remove("oculto");
  mudarDivId("ane");
  texto=[];
  tLuta=[];
  spansLetra=[];
  velX=0;
  velY=0;
  premidas=[];
  tamPremidas=0;



  function padrao(){
    ronda=-1;
    fase=ronda;
    hp=hpMax;
    hpOpon=hpMaxOpon;
    if(meterValue<0.5){
      rondaFim=Math.floor((1+2*meterValue)*fasesPadrao.length)+1;
    }
    else{
      rondaFim=2*fasesPadrao.length+1;
    }

    itens=Array.from(seus);
    arma=itemDds[1][0]||{};
    prot=itemDds[0][0]||{};
    pularProx=false;
  }


  if(!tut){
    showCheck(0);

    meterValue=getValue(0);
    if(meterValue<0.5){
      dificUsuario=0.7+0.6*meterValue;
      multAtk=2-2*meterValue;
    }
    else{
      dificUsuario=0.6+0.8*meterValue;
      multAtk=1;
    }

    if(treinando!=-1){
      dific=1+getValue(1)*0.4;
      if(treinando!=fasesPadrao.length){
        fases=[fasesPadrao[treinando]];
      }
      else{
        fases=[];
      }
      divAtual.classList.remove("visivel");
    }
    else{
      dific=1;
      fases=[...fasesPadrao];
    }

    hpMaxOpon=1000;

    if(continuando){
      ronda=loaded.ronda-1;
      fase=(ronda-1)%fases.length+1;
      hp=loaded.hp;
      hpOpon=loaded.hpOpon;
      rondaFim=loaded.rondaFim;
      itens=[];
      pularProx=loaded.pularProx;

      if(ronda>fases.length){
        acelerando=true;
        dific+=incrDificSubito+(incrDificGradual*(-1+(ronda-fases.length)));
      }

      let tipo;
      function matchArmas(x){
        switch (x) {
          case "Adaga":
          tipo=2;
          return adaga;
          case "Revólver":
          tipo=2;
          return revolver;
          case "Panela":
          tipo=2;
          return panela;
          case "Arco":
          tipo=2;
          return arco;
        }
        return Object;
      }
      function matchProts(x){
        switch (x) {
          case "Avental":
          tipo=1;
          return avental;
          case "Botas":
          tipo=1;
          return botas;
          case "Óculos":
          tipo=1;
          return oculos;
          case "Colete":
          tipo=1;
          return colete;
        }
        return Object;
      }

      const itensLoad=loaded.itens;
      for(let i=0; i<itensLoad.length; i++){
        itens[i]=function () {
          switch (itensLoad[i].nome) {
            case "Sea Tea":
            tipo=0;
            return seatea;
            case "Pie":
            tipo=0;
            return torta;
            case "Steak":
            tipo=0;
            return bife;
            case "L. Hero":
            tipo=0;
            return lhero;
            case "Cookies":
            tipo=0;
            return cookies;
          }
          let ret=matchArmas(itensLoad[i].nome);
          if(ret==Object){
            ret=matchProts(itensLoad[i].nome);
          }
          return ret;
        }()();
        if(itensLoad[i].nome=="Cookies"){
          itens[i].usos=itensLoad[i].usos;
        }
        itens[i].li={tipo:tipo};
      }
      arma=matchArmas(loaded.arma)();
      prot=matchProts(loaded.prot)();
    }
    else{
      padrao();
    }

    decrBateria=100/rondaFim;
    setImgOpon("boss.gif");
    resetRonda();
  }


  else{
    showCheck(1);
    hpMaxOpon=95;
    multAtk=1;
    padrao();

    function noHitPula(nova){
      funcFim=function () {
        if(hitTracker==0) ronda=fase=nova;
      }
    }

    function tutBranco(facil){
      const toler=240,vel=1,tSurg=50,velLento=0.4;
      return{
        larg:240,
        alt:240,
        fn:function () {
          caixa({
            velY:facil? velLento: vel,
            toler:toler,
            cor:"branco",
            tSurg:tSurg,
            girar270:true,
            deslocX: (alt-tamCaixa)/2
          });
          tFim=tSurg+(toler+larg+tamCaixa)/vel;
          if(!facil){
            noHitPula(1);
          }
        }
      };
    }

    function tutAzul(facil){
      const toler=240,vel=1.5,tSurg=50;
      let largFase,altFase;
      if(facil){
        largFase=altFase=24;
      }
      else{
        largFase=altFase=240;
      }
      return{
        larg:largFase,
        alt:altFase,
        fn:function () {
          laserMonocor({
            velY:-vel,
            toler:toler,
            cor:"azul",
            tSurg:tSurg,
            girar270:false,
            compr:240
          });
          tFim=tSurg+(toler+240)/vel;
          if(!facil){
            noHitPula(3);
          }
        }
      };
    }

    function tutLaranja(facil){
      return{
        larg:120,
        alt:240,
        fn:function () {
          const gap=40;
          const tSurgLava=500;
          tFim=1000;
          const aumento=gap/(tFim-tSurgLava);

          criarChave((larg-largChave)/2,(gap-largChave)/2);
          obstGenerico({
            larg:larg,
            alt:alt-2*gap,
            x:0,
            y:gap,
            tSurg:0,
            cor:"laranja"
          },undefined,function(){});

          obstGenerico({
            larg:larg,
            alt:0,
            x:0,
            y:alt,
            tSurg:500,
            cor:"branco"
          },undefined,function (el,o) {
            el.y-=aumento;
            o.alt+=aumento;
            atualizaPosY(el);
            resizeY(el,o.alt);
          });

          funcFrameAntes=ffaPlat;
          funcFrameDepois=function () {
            ffdChave(0);
          };
          if(facil){
            y=gap/2-roac;
            x=y;
          }
          else{
            y=alt-gap/2-roac;
          }
          if(!facil){
            noHitPula(5);
          }
        }
      };
    }

    const faseVazia={
      larg:720,
      alt:240,
      fn:function () {
        tFim=0;
      }
    }

    fases=[
      tutBranco(false),
      tutBranco(true),
      tutAzul(false),
      tutAzul(true),
      tutLaranja(false),
      tutLaranja(true),
      {
        larg:240,
        alt:240,
        fn:function () {
          const tiles=5;
          const largTile=larg/tiles;

          for(let i=0; i<tiles; i++){
            const mod=(i+1)%2;

            for(let j=mod; j<tiles; j+=2){
              let estavaAki=false,nuncaEsteve=true;

              function update(el){
                const newEstavaAki=quadrado(el);
                if(nuncaEsteve && estavaAki && !newEstavaAki){
                  el.classList.remove("laranja");
                  el.classList.add("azul");
                  nuncaEsteve=false;
                  setTimeout(function () {
                    el.classList.add("laranja");
                    el.classList.remove("azul");
                    nuncaEsteve=true;
                  },4800);
                }
                estavaAki=newEstavaAki;
              }

              obstGenerico({
                larg:largTile,
                alt:largTile,
                x:i*largTile,
                y:j*largTile,
                cor:"laranja",
                tSurg:0
              },function (el,o) {
                el.x=o.x;
                el.y=o.y;
                atualizaPosNormal(el);

                el.hitbox=function () {
                  update(el);
                  return estavaAki;
                }
              },function (el,o) {
                if(nuncaEsteve && (invul!=0 || velRealX!=0 || velRealY!=0)){
                  ccx=x+roac;
                  ccy=y+roac;
                  update(el);
                }
              });
            }

            if(mod==0){
              for(let j=1; j<tiles; j+=2){
                obstGenerico({
                  larg:largTile,
                  alt:largTile,
                  x:i*largTile,
                  y:j*largTile,
                  cor:"branco",
                  tSurg:0
                },undefined,function(){});
              }
            }
          }

          let tTotal=100;
          const vel=1.25;
          for(let i=0; i<10; i++){
            caixa({
              toler:160,
              tSurg:tTotal,
              cor:"branco",
              girar270:Math.random()<0.5,
              larg:largTile
            },function (o) {
              o.velY=(o.girar270? x: y)>larg/2-roac? vel: -vel;
              o.deslocX=Math.floor((o.girar270? y: x)/(larg*2)*tiles)*2*largTile;
            });
            tTotal+=160;
          }
          tFim=tTotal;
        }
      },
      faseVazia,
      faseVazia,
      faseVazia,
      faseVazia,
      faseVazia
    ];

    setImgOpon("Toriel.png");
    resetMeiaBoca();
    sumirDivEPreparar();
    divBattle.classList.remove("visivel");
  }


  {
    let i;
    for(i=0; i<itens.length; i++){
      lis[2][i]=lisItens[i];
    }
    lis[2].splice(i);
    for(; i<lisItens.length; i++){
      lisItens[i].classList.add("oculto");
    }
  }

  for(let i=0; i<itens.length; i++){
    const spam=criarElEfemero("span");
    lis[2][i].spam=spam;
    spam.innerHTML=itens[i].nome+(itens[i].usos? " ("+itens[i].usos+")": "");
    lis[2][i].appendChild(spam);
  }

  equiparProt();
  equiparArma();
  atualizaVida();
  atualizaVidaOpon();
  spanHpMax.innerHTML=hpMax;
  addEventListener("keyup",keyup);
  addEventListener("keydown",keydown);
  moverCoracao(botoes,0);
}

function mudaVel(tecla,z){ // Muda velocidade com base na tecla apertada
  if(tecla==38){
    velY-=z; // Cima
    direcaoHab=-1;
  }
  else if(tecla==40){
    velY+=z; // Baixo
    direcaoHab=-1;
  }
  else if(tecla==37){
    velX-=z; // Esquerda
    direcaoHab=1;
  }
  else if(tecla==39){
    velX+=z; // Direita
    direcaoHab=1;
  }
}


/* Navegação pré-batalha */

let elAtual,idxEla;
let divAtual,idxDiva;
let vetorAtual;
const botoes=document.querySelectorAll("#botoes button");
const containers=document.querySelectorAll(".tx"),lenCont=containers.length;
let lis=[],lisItens=[];
const bobocabo=document.querySelector("#bobocabo");
let sairQlqrTecla;

function fnSairQlqrTecla(){
  if(sairQlqrTecla){
    sairQlqrTecla=false;
    mudarDivId("ane");
  }
}

function removerItemAtual(){
  elAtual.classList.add("oculto");
  lis[2].splice(idxEla, 1);
  itens.splice(idxEla, 1);
}

function moverCoracao(vetor,i,addClass=true){
  let el=vetor[i];
  if(elAtual) elAtual.classList.remove("hasHeart");
  elAtual=el;
  if(addClass) elAtual.classList.add("hasHeart");
  idxEla=i;
  vetorAtual=vetor;
}

function mudarDivId(id){
  for(let i=0; i<lenCont; i++){
    if(containers[i].id==id){
      containers[i].classList.add("visivel");
      divAtual=containers[i];
      idxDiva=i;
    }
    else{
      containers[i].classList.remove("visivel");
    }
  }
}

function criarCoracao(el){
  const cor=document.createElement("div");
  for(let i=0; i<2; i++){
    const novo=document.createElement("div");
    novo.className="arredondador";
    cor.appendChild(novo);
  }
  cor.classList.add("coracao");
  el.prepend(cor);
}

for(let i=0; i<lenCont; i++){
  let filho=containers[i].childNodes[1];
  if(filho&&filho.tagName=="UL"){
    // Ignora ChildNodes vazios (que só contêm espaço)
    lis[i]=Array.from(filho.children);
    for(let j=0; j<lis[i].length; j++){
      criarCoracao(lis[i][j]);
    }
  }
  else{
    lis[i]=[];
  }
}
lisItens=Array.from(lis[2]);

for(let i=0; i<botoes.length; i++){
  criarCoracao(botoes[i]);
}

const pItemUsado=document.querySelector("#voceComeu");
const pHpCurado=document.querySelector("#hpRestaurado");
const pExtra=document.querySelector("#extra");

function cura(qtd){
  let curouTudo=false;
  hp+=qtd+bonusItem;
  if(hp>=hpMax){
    hp=hpMax;
    curouTudo=true;
  }
  atualizaVida();
}

function inicRonda(){
  // Chamada antes de começar o ataque do boss

  elAtual.classList.remove("hasHeart");
  if(texto.length){
    emJogo=0;
    balao.classList.remove("oculto");
    passarTexto();
  }
  else{
    novaRonda();
  }
}

function atualizaVida(){
  spanHp.innerHTML=tut?
    Math.round(hp*10)/10:
    Math.round(hp);
  barraHp.style.width=Math.round(100*hp/hpMax)+"%";
}
function atualizaVidaOpon(){
  bhpOpon.style.left=-(1- hpOpon/hpMaxOpon) *100+"%";
}

function dano(obst){ // Quando é atingido por um obstáculo
  const resto=invul;
  hp-=tut? 0.1: obst.dano*multDano;
  atualizaVida();
  if(Math.round(hp)<=0){
    alert("vc morreu rsrs.");
    exit();
    return;
  }
  invul=obst.invul*multInvul+resto;
}

function frame(funcFrameAntes,funcFrameDepois,funcFim){
  /* Função executada a cada 10ms durante as fases. Os parâmetros são opcionais e são funções que, se existirem, são executadas
  antes e depois de ser computado o movimento do coração. */

  if(t>=tFim){ // Se acabou fase
    if(funcFim) funcFim();
    resetRonda();
    return;
  }

  if(funcFrameAntes) funcFrameAntes();


  // Movimento

  mult=velPlayer*multVel; // Velocidade base do coração (pode mudar pra ficar + ou - rápido)
  if(multFF<0) mult*=-1;

  {
    let multFF2=multFF;

    if(estaRapido){
      multFF2=450;
      if(tamPremidas==2){
        if(direcaoHab==1){
          y+=velY*mult*multFF2;
        }
        else{
          x+=velX*mult*multFF2;
        }
        direcaoHab*=-1;
      }
      else{
        y+=velY*mult*multFF2;
        x+=velX*mult*multFF2;
      }
    }
    else{
      if(tamPremidas==2){
        mult/=r2; // Se estiver andando na diagonal fica mais lento
      }
      y+=velY*mult*multFF2;
      x+=velX*mult*multFF2;
    }
  }

  velRealX=velX;
  velRealY=velY;
  /* Variáveis que verificam se o coração realmente andou. Se, por exemplo, ele já estiver o mais em cima possível e tentar
  andar mais para cima, velRealY será 0 e o coração será considerado como parado (para ataques azuis e laranjas). */

  if(x<0){
    x=0;
    velRealX=0;
  }
  else if(x>larg-2*roac){
    x=larg-2*roac;
    velRealX=0;
  }

  if(y<0){
    y=0;
    velRealY=0;
  }
  else if(y>alt-2*roac){
    y=alt-2*roac;
    velRealY=0;
  }

  if(funcFrameDepois) funcFrameDepois();

  for(let i=0; i<numObst; i++){
    if(obsts[i].classList.contains("visivel")){
      obsts[i].funcMov();
    }
  }


  // Obstáculos

  {
    let cond=multFF>0;
    for(let i=0; i<numObst; i++){
      if((cond? t>=obsts[i].tSurg: t<=obsts[i].tSurg) && !obsts[i].apareceu){
        obsts[i].funcApar();
        obsts[i].classList.add("visivel");
        obsts[i].apareceu=true;
      }
    }
  }


  // Dano

  if(invul>0){
    invul--;
    if(invul%20==10){
      coracao.classList.add("pseudoOculto");
    }
    else if(invul%20===0){
      coracao.classList.remove("pseudoOculto");
    }
  }
  else if(invul<=0 && !(numChaves && numChaves==chavesObtidas)){
    // Hitbox!!!
    // A hitbox do coração está sendo assumida como circular de raio 6 (hbc==6).

    ccx=x+roac;
    ccy=y+roac;
    // Coordenadas do centro do coração x/y. Relembrando que roac é o raio do coração.

    for(let i=0; i<numObst; i++){
      if(obsts[i].dano&&
        obsts[i].classList.contains("visivel")&&(
          obsts[i].classList.contains("branco")||
          (obsts[i].classList.contains("laranja")&&velRealX==0&&velRealY==0)||
          (obsts[i].classList.contains("azul")&&(velRealX!=0||velRealY!=0))
      )){
        if(obsts[i].hitbox()){
          if(tut){
            hitTracker++;
          }
          dano(obsts[i]);
          break;
        }
      }
    }
  }


  if(multFF!=0){
    atualizarPosCor();
    t+=multFF; // Incrementa tempo
  }
}


// Menu e sair do jogo

const divMenu=document.querySelector("#menu");
const btnClose=document.querySelector("#close");

let btnsFechar=[];
function fechaModal(el){
  el.classList.remove("visivel");
  el.removeEventListener("click",el.fn);
}

for(let i=0; i<modais.length; i++){
  let btn=document.createElement("button");
  btn.className="fechar";
  btn.addEventListener("click",function () {
    fechaModal(modais[i]);
  });
  modais[i].firstElementChild.prepend(btn);
  modais[i].fn=function(e) {
    if(e.target==this){
      fechaModal(this);
    }
  }
}

function abreModal(num){
  modais[num].classList.add("visivel");
  modais[num].addEventListener("click",modais[num].fn);
}

btnsMenu[0].addEventListener("click",function () {
  localStorage.removeItem("save");
  inicFase();
});
btnsMenu[1].addEventListener("click",function () {
  continuando=true;
  inicFase();
});
btnsMenu[2].addEventListener("click",function () {
  tut=true;
  inicFase();
});

btnsMenu[3].addEventListener("click",function () {
  abreModal(0);
});
btnsMenu[5].addEventListener("click",function () {
  abreModal(1);
});
btnsMenu[6].addEventListener("click",function () {
  abreModal(2);
});

btnClose.addEventListener("click",exit);

modais[2].addEventListener("click",function (e) {
  if(e.target.tagName!="LI"){
    descInv.classList.add("oculto");
    aneInv.classList.remove("oculto");
  }
});


// Treinamento

const olFases=document.querySelector("#fases");

function addLi(html,num){
  const li=document.createElement("li");
  const btn=document.createElement("button");
  btn.innerHTML=html;
  btn.addEventListener("click",function () {
    treinando=num;
    inicFase();
  });
  li.appendChild(btn);
  olFases.appendChild(li);
  return li;
}

for(let i=0; i<fasesPadrao.length; i++){
  addLi(String(i+1),i);
}
addLi("Final",fasesPadrao.length).className="final";
