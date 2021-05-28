// INDEX.JS


let corpos=document.querySelectorAll(".body"),visivel=0,primeiraVez=true;

let divEsq=document.querySelector(".esq");
let artigoInfo=document.querySelector(".info");
let artigoConfig=document.querySelector(".config");
let botao2jog=document.querySelector(".jog2");
let botaoSolo=document.querySelector(".solo");
let aqmuda=document.querySelector(".qmuda");

//Entradas
let inTempo=document.querySelector(".tempo");
let checkTempo=document.querySelector(".tempo-check");
let inComeca1=document.querySelector(".qc1");
let inComeca2=document.querySelector(".qc2");
let inFimPts=document.querySelector(".fim-pts");
let inFimModo=document.querySelector(".fim-modo");
let checkFim=document.querySelector(".fim-check");
let inCorBot=document.querySelector(".corBot");
let inDifBot=document.querySelector(".difBot");

let configTurno,tempoInic,turnoInic,fimPts,fimModo,ebot,turnoBot,difBot; //Configurações
let vel,turnos,vitoria,tempoVit,tempoAzul,tempoVerm,parar,meEspera; //resetam no fim do jogo
let caindo,comecou,modoVert="false",ptsAzul,ptsVerm,empates,pausado,formaVit,turno; //não resetam no fim do jogo
let quedaPeca=[],pecasNaCol=[],corPeca=[],jogadasCol,jogadasPeca; //vetores que resetam
let alturaPeca=[],pecasVit; //vetores que não resetam
let rem; //Layout

const linhas=6,colunas=7,necessario=4;
let htmlNums="",htmlPecas="";
let divNums=document.querySelector(".numeros");
let divPecas=document.querySelector(".pecas");

// Geração
for(let i=0; i<linhas*colunas; i++){
  htmlPecas+="<div class=\"peca\"></div>";
}
for(let i=0; i<colunas; i++){
  htmlNums+="<div><div onclick=\"validar("+i+")\"><kbd>"+(i+1)+"</kbd></div></div>";
}
divNums.innerHTML=htmlNums;
divPecas.innerHTML=htmlPecas;

// Elementos
let pecas=document.querySelectorAll(".peca");
let log=document.querySelector(".log");
let tab=document.querySelector(".tabuleiro");
let nums=document.querySelectorAll(".numeros>div");
let numsCirculos=document.querySelectorAll(".numeros>div>div");
let h3vez=document.querySelector(".vez");
let divTempoAzul=document.querySelectorAll(".forca-dos-tempos div")[0];
let divTempoVerm=document.querySelectorAll(".forca-dos-tempos div")[1];
let botaoPlayPause=document.querySelector(".mutavel");
let botaoHome=document.querySelector(".ficsu");
let botaoReset=document.querySelector(".jogo .reset");
let botaoUndo=document.querySelector(".jogo .undo");
let balao=document.querySelector("#balao");

let divFinal=document.querySelector(".anunciaVencedor");
let botaoHomeVenc=document.querySelector(".anunciaVencedor .home");
let botaoResetVenc=document.querySelector(".anunciaVencedor .reset");
let tituloQMuda=document.querySelector(".mudaDeCor");

function visibilizar(x){
  visivel=x;
  for(let i=0; i<corpos.length; i++){
    if(i!=x){
      corpos[i].classList.add("oculto");
    }
    else{
      corpos[i].classList.remove("oculto");
    }
  }
}
function aleaturno(){
  return Math.random()>=0.5? 1: -1;
}
function mudarTxt(){
  if(artigoInfo.classList.toggle("oculto")){
    aqmuda.innerHTML="Instruções";
  }
  else{
    aqmuda.innerHTML="Configurações";
  }
  artigoConfig.classList.toggle("oculto");
}
aqmuda.addEventListener("click",mudarTxt);


checkTempo.addEventListener("change",function(){
  if(checkTempo.checked){
    inTempo.removeAttribute("disabled");
  }
  else{
    inTempo.setAttribute("disabled","disabled");
  }
});
checkFim.addEventListener("change",function(){
  if(checkFim.checked){
    inFimPts.setAttribute("disabled","disabled");
    inFimModo.setAttribute("disabled","disabled");
  }
  else{
    inFimPts.removeAttribute("disabled");
    inFimModo.removeAttribute("disabled");
  }
});

function atualizarConfigs(){
  if(checkTempo.checked){
    tempoInic=parseInt(inTempo.value)*100;
  }
  else{
    tempoInic=-1;
  }

  if(inComeca1.value=="Aleatório"){
    turnoInic=aleaturno();
  }
  else if(inComeca1.value=="Azul"){
    turnoInic=1;
  }
  else{
    turnoInic=-1;
  }

  switch (inComeca2.value) {
    case "Quem jogou em 2º":
      configTurno=2;
      break;
    case "Quem ganhou":
      configTurno=1;
      break;
    case "Quem perdeu":
      configTurno=-1;
      break;
    default:
      configTurno=0;
  }
  if(checkFim.checked){
    fimModo=-1;
  }
  else{
    fimPts=parseInt(inFimPts.value);
    switch (inFimModo.value) {
      case "Partidas":
        fimModo=0;
        break;
      default:
        fimModo=1;
    }
  }

  if(inCorBot.value=="Azul"){
    turnoBot=1
  }
  else{
    turnoBot=-1;
  }
  switch (inDifBot.value) {
    case "Fácil":
      difBot=-1;
      break;
    case "Médio":
      difBot=0;
      break;
    case "Difícil":
      difBot=1;
      break;
    default:
      difBot=2;
      break;
  }
}


function formatoHoras(s){
  let min=parseInt(s/60);
  s=parseInt(s-min*60);
  return min+":"+(s<10? "0": "")+s;
}

function mudah3vez(){
  h3vez.className="vez";
  if(turno==1){
    h3vez.innerHTML="Vez do Azul";
    h3vez.classList.add("azul");
  }
  else{
    h3vez.innerHTML="Vez do Vermelho";
    h3vez.classList.add("vermelho");
  }
}

function linhaPeca(x){
  return parseInt(x/colunas);
}
function colPeca(x){
  return x%colunas;
}
function numPecaDaCol(x){
  return(linhas-pecasNaCol[x])*colunas+x;
}


function reset(){
  for(let i=0; i<linhas*colunas; i++){
    quedaPeca[i]=0;
    corPeca[i]=0;
    pecas[i].classList.add("oculto");
    pecas[i].classList.remove("pecazul");
    pecas[i].classList.remove("pecaverm");
    pecas[i].style.top="0";
  }
  for(let i=0; i<colunas; i++){
    pecasNaCol[i]=0;
  }
  log.innerHTML="<li>1.</li>";

  vel=0;
  turnos=0;
  vitoria=false;
  tempoVit=0;
  jogadasCol=[];
  jogadasPeca=[];
  meEspera=49;

  if(tempoInic>0){
    tempoAzul=tempoInic;
    tempoVerm=tempoInic;
    divTempoAzul.innerHTML=formatoHoras(tempoAzul/100);
    divTempoVerm.innerHTML=formatoHoras(tempoVerm/100);
    botaoPlayPause.classList.remove("off");
    botaoPlayPause.classList.remove("pause");
    botaoPlayPause.classList.add("play");
    pausado=true;
  }
  else{
    divTempoAzul.innerHTML="∞";
    divTempoVerm.innerHTML="∞";
    botaoPlayPause.classList.add("off");
    botaoPlayPause.classList.remove("play");
    botaoPlayPause.classList.add("pause");
    pausado=false;
  }
  clearInterval(parar);
  parar=setInterval(cair,10);
  if(ebot&&turno==turnoBot)meEspera=49;
}
function resetGeral(){
  caindo=-1;
  comecou=turnoInic;
  ptsAzul=0;
  ptsVerm=0;
  empates=0;
  turno=turnoInic;
  mudah3vez();
  if(tempoInic>0){
    botaoPlayPause.classList.remove("pause");
    botaoPlayPause.classList.add("play");
    pausado=true;
  }
  else{
    botaoPlayPause.classList.remove("play");
    botaoPlayPause.classList.add("pause");
    pausado=false;
  }
  document.querySelector(".placar .azul").innerHTML=ptsAzul;
  document.querySelector(".placar .vermelho").innerHTML=ptsVerm;

  if(fimModo!=-1){
    let roedor;
    if(fimModo===0){
      roedor="partida";
    }
    else{
      roedor="vitória";
    }
    if(fimPts>1){
      roedor+="s";
    }
    document.querySelector(".fim span").innerHTML=fimPts+" "+roedor;
  }
  else{
    document.querySelector(".fim span").innerHTML="Nunca";
  }
  reset();
}
function bobocabo(){
  if (fimModo==-1) return false;
  return fimModo===0?
  ptsAzul+ptsVerm+empates>=fimPts||Math.max(ptsAzul,ptsVerm)>(fimPts-empates)/2:
  Math.max(ptsAzul,ptsVerm)>=fimPts;
}

function mudar0pra1(){
  visibilizar(1);
  if(primeiraVez){
    autoSize();
    primeiraVez=false;
  }
  atualizarConfigs();
  resetGeral();
}
botao2jog.addEventListener("click",function(){
  mudar0pra1();
  ebot=false;
});
botaoSolo.addEventListener("click",function(){
  mudar0pra1();
  ebot=true;
});

let botoesComBalao=document.querySelectorAll(".botoes .botaoJogo");
function moveu(e){
  balao.style.top=e.pageY-balao.offsetHeight-2*rem/3+"px";
  balao.style.left=e.pageX-balao.offsetWidth/2+"px";
}
function sumiu(){
  balao.classList.add("oculto");
}
for(let i=0; i<botoesComBalao.length; i++){
  function f(){
    if(botoesComBalao[i].classList.contains("play")){
      balao.innerHTML="Iniciar ou retomar contagem do tempo";
    }
    else if(botoesComBalao[i].classList.contains("pause")&&!botoesComBalao[i].classList.contains("off")){
      balao.innerHTML="Pausar contagem do tempo";
    }
    else if(botoesComBalao[i].classList.contains("pause")&&botoesComBalao[i].classList.contains("off")){
      balao.innerHTML="Pausar contagem do tempo (desabilitado)";
    }
    else if(botoesComBalao[i].classList.contains("reset")){
      balao.innerHTML="Reiniciar rodada";
    }
    else{
      balao.innerHTML="Voltar uma jogada";
    }
  }

  botoesComBalao[i].addEventListener("mouseover",function(){
    balao.classList.remove("oculto");
    f();
  });
  botoesComBalao[i].addEventListener("click",function(e){
    setTimeout(function(){f(); moveu(e);},1);
  });
  botoesComBalao[i].addEventListener("mousemove",moveu);
  botoesComBalao[i].addEventListener("mouseout",sumiu);
}



// JOGO.JS
// VERMELHO É -1
// AZUL É 1


function ganhou(x){
  pecasVit=[];
  function cuidadoMenos(i){
    return linhaPeca(x-i)!=linhaPeca(x-(i-1));
  }
  function cuidadoMais(i){
    return linhaPeca(x+i)!=linhaPeca(x+(i-1));
  }
  function testar2(dir,cuidado1=function(){return false;},cuidado2=function(){return false;}){
    let pecasVitTemp=[x];
    function testar(dir,cuidado){
      for(let i=1; i<necessario; i++){
        if(corPeca[x-i*dir]!=corPeca[x]||cuidado(i)){
          break;
        }
        pecasVitTemp.push(x-i*dir);
      }
    }
    testar(dir,cuidado1);
    testar(-dir,cuidado2);
    if(pecasVitTemp.length>pecasVit.length){
      pecasVit=Array.from(pecasVitTemp);
    }
  }
  testar2(1,cuidadoMenos,cuidadoMais);
  testar2(6,cuidadoMais,cuidadoMenos);
  testar2(7);
  testar2(8,cuidadoMenos,cuidadoMais);
  return pecasVit.length;
}

let bloqueadasDir=[],bloqueadasEsq=[];
function verBloqueadas(cor){ // OPTIMIZE: tá funcionando só pra horizontal ;-;-;
  if(difBot<2)return;
  console.log("cor="+cor);
  for(let i=0; i<6; i++){
    for(let j=0; j<3; j++){
      bloqueadasDir[7*i+j]=true;
      bloqueadasEsq[7*i+j]=false;
    }
    bloqueadasDir[7*i+3]=false;
    bloqueadasEsq[7*i+3]=false;
    for(let j=4; j<7; j++){
      bloqueadasDir[7*i+j]=false;
      bloqueadasEsq[7*i+j]=true;
    }
  }
  for(let i=0; i<6; i++){
    for(let j=0; j<7; j++){
      if(corPeca[7*i+j]==-cor){
        for(let k=Math.max(j-3,0); k<j; k++){
          bloqueadasEsq[7*i+k]=true;
        }
        for(let k=Math.min(j+3,6); k>j; k--){
          bloqueadasDir[7*i+k]=true;
        }
      }
    }
  }
  console.log(bloqueadasEsq,bloqueadasDir);
}
let seqVetor=[],max,dirSeq;

function analisar(x){
  max=0,seqVetor=[];

  function cuidadoMenos(i,j){
    if(j==-3)return false;
    return linhaPeca(x-(i+j))!=linhaPeca(x-((i+j)-1));
  }
  function cuidadoMais(i,j){
    if(j==-3)return false;
    return linhaPeca(x+(i+j))!=linhaPeca(x+((i+j)-1));
  }

  function testar(dir,cuidado=function(){return false;}){
    let seqMem=1;

    for(let i=0; i<4; i++){
      if(difBot>=2&&(x+i*dir>=linhas*colunas||x+(i-3)*dir<0)){
        //console.log(dir,colPeca(x+i));
        continue;
      }

      let seq=0,bloq=0,triggered=false;

      for(j=-3; j<=0; j++){
        let atual=x+(i+j)*dir;
        if(corPeca[atual]==-corPeca[x] ){
          if(difBot>=2)triggered=true;
          break;
        }
        if (cuidado(i,j)) {
          triggered=true;
          break;
        }
        if(corPeca[atual]==corPeca[x]){
          seq++;
        }
        if(difBot>=2&&dir==1&&bloqueadasDir[atual]&&bloqueadasEsq[atual]) {
          bloq++;
        }
      }
      if(seq!=4&&(triggered||bloq>=4))continue;

      if(seq>seqMem){
        seqMem=seq;
      }
    }
    seqVetor.push(seqMem);
  }
  testar(1,cuidadoMais);
  testar(6,cuidadoMenos);
  testar(7);
  testar(8,cuidadoMais);
  for(let i=0; i<4; i++){
    if(seqVetor[i]>max){
      dirSeq=i;
      max=seqVetor[i];
    }
  }
}
function jogadaDoBot(){
  let ameacas=[],coisasBoas=[],tipo,i;
  for(i=0; i<linhas*colunas; i++){
    ameacas[i]=0;
    coisasBoas[i]=0;
  }
  function set(dm1,d0,d1,d2){
    switch (difBot) {
      case -1:
        tipo[i]=dm1;
        break;
      case 0:
        tipo[i]=d0;
        break;
      case 1:
        tipo[i]=d1;
        break;
      default:
        tipo[i]=d2;
    }
  }


  // Ameaças

  if(difBot>=2)verBloqueadas(turnoBot);
  tipo=ameacas;

  for(i=0; i<42; i++){
    if(corPeca[i]!==0)continue;
    corPeca[i]=-turnoBot;
    analisar(i);

    if(max>=4){
      set(2000,3160,10000,100000);
    }
    else if(max==3){
      if(dirSeq==2){
        set(1000,1000,100,316);
      }
      else {
        set(1000,1000,1000,1000);
      }
    }
    else if(max==2){
      if(dirSeq==2){
        set(0,316,1,3);
      }
      else{
        set(0,316,10,10);
      }
    }
    corPeca[i]=0;
  }


  // Oportunidades

  if(difBot>=2)verBloqueadas(-turnoBot);
  tipo=coisasBoas;

  for(i=0; i<42; i++){
    if(corPeca[i]!==0)continue;
    corPeca[i]=turnoBot;
    analisar(i);

    if(max>=4){
      if(corPeca[i+7]!==0||pecasNaCol[i]===0){
        set(2000,3160,10001,Infinity);
      }
      else{
        set(2000,3160,10000,100000);
      }
    }
    else if(max==3){
      if(dirSeq==2){
        set(1000,1000,100,316);
      }
      else{
        set(1000,1000,1000,1000);
      }
    }
    else if(max==2){
      if(dirSeq==2){
        set(0,316,1,3);
      }
      else{
        set(0,316,10,10);
      }
    }
    corPeca[i]=0;
  }

  function nananinanao(x){
    if (isNaN(x)) return 0;
    return x;
  }
  let aval;
  if(difBot==-1)aval=[0,0,0,0,0,0,0,-Infinity];
  else if(difBot===0)aval=[115,205,365,649,365,205,115,-Infinity];
  else aval=[49,154,487,1542,487,154,49,-Infinity];

  for(let i=0; i<7; i++){
    if(pecasNaCol[i]==6){
      aval[i]=-1000000000;
    }
    else{
      function mult(dm1,d0,d1,d2){
        switch (difBot) {
          case -1:
          return dm1;
          break;
          case 0:
          return d0;
          break;
          case 1:
          return d1;
          break;
          default:
          return d2;
        }
      }

      aval[i]-=nananinanao(ameacas[i+7*(4-pecasNaCol[i])])*mult(1/5, 1/3.16,1,1);
      aval[i]+=nananinanao(ameacas[i+7*(5-pecasNaCol[i])])*mult(5, 3.16,3.16,3.16);
      aval[i]+=nananinanao(coisasBoas[i+7*(5-pecasNaCol[i])])*mult(5,1,1,1);
      aval[i]-=nananinanao(coisasBoas[i+7*(4-pecasNaCol[i])])*mult(1/25,1/10,1/3.16,1/3.16);
      if(difBot==2)aval[i]+=nananinanao(coisasBoas[i+7*(3-pecasNaCol[i])])*1/10;
    }
  }
  let indice=7,indicesMax=[];
  for(let i=0; i<7; i++){
    if(aval[i]>aval[indice]){
      indice=i;
      indicesMax=[i];
    }
    else if(aval[i]==aval[indice]){
      indicesMax.push(i);
    }
  }

  let len=indicesMax.length;
  console.log("o vetor eh",indicesMax);
  if(len>1){
    let rng=Math.random();
    let janela=1/len;
    for(let i=1; i<=len; i++){
      if(rng<i*janela){
        indice=indicesMax[i-1];
        break;
      }
    }
  }

  jogada(numPecaDaCol(indice)-7);
  console.log("-----Turno "+turnos+"-----");
  for(let i=0; i<42; i++){
    if(ameacas[i]>10){
      console.log("Ameaça de valor "+Math.round(ameacas[i])+" na casa de linha "+(linhaPeca(i)+1)+" e coluna "+(colPeca(i)+1));
    }
  }
  for(let i=0; i<42; i++){
    if(coisasBoas[i]>10){
      console.log("Coisa boa de valor "+Math.round(coisasBoas[i])+" na casa de linha "+(linhaPeca(i)+1)+" e coluna "+(colPeca(i)+1));
    }
  }
  for(let i=0; i<7; i++){
    aval[i]=Math.round(aval[i]);
  }
  console.log("Avaliação: "+aval);
}




function jogada(x){
  pecasNaCol[colPeca(x)]++;
  let ultimoLi=log.lastElementChild;
  caindo=x;
  pecas[x].classList.remove("oculto");

  if(turno==1){
    ultimoLi.innerHTML+=" <span class=\"azul\">"+(colPeca(x)+1)+"</span>";
    pecas[x].classList.add("pecazul");
  }
  else{
    ultimoLi.innerHTML+=" <span class=\"vermelho\">"+(colPeca(x)+1)+"</span>";
    pecas[x].classList.add("pecaverm");
  }

  if(turno==comecou){
    ultimoLi.innerHTML+=" - ";
  }
  else{
    turnos++;
    log.innerHTML+="<li>"+(turnos+1)+".</li>";
    log.scrollTop=log.scrollHeight; //stack overflow
  }

  jogadasCol.push(colPeca(x));
  jogadasPeca.push(x);
}

function preTerminado(){
  if(tempoVit>=150){
    clearInterval(parar);
    parar=setInterval(terminado,10);
  }
  else if(formaVit==1){
    if(tempoVit%50===0){
      for(let i=0; i<pecasVit.length; i++){
        pecas[pecasVit[i]].classList.add("ganhada");
      }
    }
    else if(tempoVit%50==25){
      for(let i=0; i<pecasVit.length; i++){
        pecas[pecasVit[i]].classList.remove("ganhada");
      }
    }
  }
  else if(formaVit==-1){
    let divQueMuda=turno==1? divTempoVerm: divTempoAzul;
    if(tempoVit%50===0){
      divQueMuda.classList.add("tempo-expirado");
    }
    else if(tempoVit%50==25){
      divQueMuda.classList.remove("tempo-expirado");
    }
  }
  tempoVit++;
}
function terminado(){
  if(vel<0.1){
    vel+=0.001;
    for(let i=0; i<linhas*colunas; i++){
      if(corPeca[i]!==0){
        quedaPeca[i]+=vel;
        pecas[i].style.top=quedaPeca[i]*divPecas.offsetHeight+"px";
      }
    }
  }
  else if(!bobocabo()){
    if(configTurno===0){
      turno=aleaturno();
    }
    else if(configTurno==-1){
      turno*=-1;
    }
    else if(configTurno==2){
      turno=comecou*(-1);
    }
    comecou=turno;
    mudah3vez();
    reset();
  }
  else{
    divFinal.classList.remove("oculto");
    divFinal.style.opacity=0;
    clearInterval(parar);
    tituloQMuda.className="mudaDeCor";
    if(ptsAzul==ptsVerm){
      tituloQMuda.classList.add("amarelo");
      tituloQMuda.innerHTML="Empatou";
    }
    else{
      if(turno==1){
        tituloQMuda.classList.add("azul");
        tituloQMuda.innerHTML="Azul Ganhou!";
      }
      else{
        tituloQMuda.classList.add("vermelho");
        tituloQMuda.innerHTML="Vermelho Ganhou!";
      }
    }
    parar=setInterval(function(){
      if(parseFloat(divFinal.style.opacity)<1){
        divFinal.style.opacity=parseFloat(divFinal.style.opacity)+0.01;
      }
      else{
        clearInterval(parar);
      }
    },10);
  }
}

function alguemGanhou(){
  vitoria=true;
  clearInterval(parar);
  parar=setInterval(preTerminado,10);
  h3vez.className="vez"; //stack overflow
  if(formaVit!==0){
    if(turno==1){
      h3vez.innerHTML="Azul Ganhou!";
      h3vez.classList.add("azul");
      ptsAzul++;
      document.querySelector(".placar .azul").innerHTML=ptsAzul;
    }
    else{
      h3vez.innerHTML="Vermelho Ganhou!";
      h3vez.classList.add("vermelho");
      ptsVerm++;
      document.querySelector(".placar .vermelho").innerHTML=ptsVerm;
    }
  }
  else{
    h3vez.innerHTML="Empatou";
    h3vez.classList.add("amarelo");
    empates++;
  }
}


function cair(){
  if(caindo!=-1){
    vel+=0.001;
    quedaPeca[caindo]+=vel;
    pecas[caindo].style.top=quedaPeca[caindo]*divPecas.offsetHeight+"px";
    if(quedaPeca[caindo]>alturaPeca[caindo]/divPecas.offsetHeight){
      quedaPeca[caindo]=alturaPeca[caindo]/divPecas.offsetHeight;
      quedaPeca[caindo]=alturaPeca[caindo]/divPecas.offsetHeight;
      vel=0;
      pecas[caindo].style.top=alturaPeca[caindo]+"px";
      corPeca[caindo]=turno;
      console.log(ganhou(caindo));
      //jogadaDoBot(caindo);
      if(ganhou(caindo)>=necessario){
        formaVit=1;
        alguemGanhou();
      }
      else{
        turno*=-1;
        mudah3vez();
      }
      caindo=-1;
      if(ebot&&turno==turnoBot)meEspera=49;
    }
  }
  else{
    if(tempoInic!=-1&&!pausado){
      function verSeExpirou(tempoX){
        if(tempoX===0){
          turno*=-1;
          formaVit=-1;
          alguemGanhou();
        }
      }
      if(turno==1){
        tempoAzul-=1;
        if(tempoAzul%100===0){
          divTempoAzul.innerHTML=formatoHoras(tempoAzul/100);
          verSeExpirou(tempoAzul);
        }
      }
      else{
        tempoVerm-=1;
        if(tempoVerm%100===0){
          divTempoVerm.innerHTML=formatoHoras(tempoVerm/100);
          verSeExpirou(tempoVerm);
        }
      }
    }
    if(turnos==21){
      formaVit=0;
      alguemGanhou();
    }
    else if(ebot&&turno==turnoBot&&!pausado){
      //console.log("m.e =",meEspera);
      if(!meEspera--){
        jogadaDoBot();
      }
    }
  }
}

// Event Listeners
function validar(x){
  if(caindo==-1&&!vitoria&&pecasNaCol[x]<6&&!pausado&&!(ebot&&turno==turnoBot)){
    jogada(numPecaDaCol(x)-7);
    return true;
  }
  return false;
}
function desganhar(){
  if(!vitoria)return false;
  for(let i=0; i<pecasVit.length; i++){
    pecas[pecasVit[i]].classList.remove("ganhada");
  }
  if(turno==1){
    ptsAzul--;
    document.querySelector(".placar .azul").innerHTML=ptsAzul;
  }
  else{
    ptsVerm--;
    document.querySelector(".placar .vermelho").innerHTML=ptsVerm;
  }
  return true;
}

window.addEventListener("keydown",function(e){
  if(visivel===0)return;
  validar(e.which-49);
});
botaoPlayPause.addEventListener("click",function(){
  if(tempoInic<=0){
    return;
  }
  if(pausado){
    pausado=false;
    botaoPlayPause.classList.remove("play");
    botaoPlayPause.classList.add("pause");
    if(ebot&&turno==turnoBot){
      //console.log("m.e =",meEspera);
      if(!meEspera--){
        jogadaDoBot();
      }
    }
  }
  else{
    pausado=true;
    botaoPlayPause.classList.remove("pause");
    botaoPlayPause.classList.add("play");
  }
});
botaoReset.addEventListener("click",function(){
  desganhar();
  reset();
  caindo=-1;
  turno=comecou;
  mudah3vez();
});
botaoHome.addEventListener("click",function(){
  visibilizar(0);
  clearInterval(parar);
});
botaoResetVenc.addEventListener("click",function(){
  resetGeral();
  divFinal.classList.add("oculto");
});
botaoHomeVenc.addEventListener("click",function(){
  clearInterval(parar);
  visibilizar(0);
  divFinal.classList.add("oculto");
});

function ctrlZ(){
  if(jogadasCol.length&&!(vitoria&&vel)){
    let ultimoLi=log.lastElementChild,roedor=caindo!=-1||vitoria;
    if(roedor)turno*=-1;
    if(turno==comecou){
      ultimoLi.remove();
      log.lastElementChild.innerHTML=turnos+". <span class=\""+(turno==1? "azul": "vermelho")+"\">"+((jogadasCol[jogadasCol.length-2])+1)+"</span> - ";
      log.scrollTop=log.scrollHeight; //stack overflow
      turnos--;
    }
    else{
      ultimoLi.innerHTML=(turnos+1)+".";
    }

    let emQuestao=jogadasPeca[jogadasPeca.length-1];
    quedaPeca[emQuestao]=0;
    corPeca[emQuestao]=0;
    pecasNaCol[colPeca(emQuestao)]--;
    pecas[emQuestao].classList.add("oculto");
    pecas[emQuestao].classList.remove("pecazul");
    pecas[emQuestao].classList.remove("pecaverm");
    pecas[emQuestao].style.top="0";

    turno*=-1;

    jogadasCol.pop();
    jogadasPeca.pop();
    if(roedor){
      vel=0;
      caindo=-1;
      if(desganhar()){
        vitoria=false;
        clearInterval(parar);
        parar=setInterval(cair,10);
        mudah3vez();
        tempoVit=0;
      }
    }
    else{
      mudah3vez();
    }

    if(ebot&&turno==turnoBot)meEspera=49;
  }
}
botaoUndo.addEventListener("click",ctrlZ);


// Estilização

function autoSize(){
  let divEsq=document.querySelector(".div-info");
  let divDir=document.querySelector(".div-do-log");
  let divEsqDir=document.querySelector(".desnecessario");
  let aTabCM=Math.min(window.innerHeight, window.innerWidth*1.096);
  let aTab,lTab,mTab,laEsp,lEspTotal,mPadrao,lPeca;
  modoVert=false;

  function ajustar(){
    aTab=aTabCM*0.769;
    lTab=aTab*655/503;
    mPadrao=5*aTab/112;
    mTab=aTab/28;
    rem=aTab/32;
    lEspTotal=(lTab-2.5*mTab)/7;
    laEsp=lEspTotal-mTab;
    lPeca=(laEsp+mTab/2)*0.9825;
  }
  ajustar();

  if(lTab+2*mPadrao+divEsq.offsetWidth+divDir.offsetWidth+aTabCM*0.1>window.innerWidth){
    divEsqDir.classList.add("soquenao");
    divEsq.style.marginRight=mPadrao+"px";
    aTabCM*=0.7;
    modoVert=true;
    ajustar();
    divEsqDir.style.marginBottom=aTabCM*0.05+"px";
  }
  else{
    divEsqDir.classList.remove("soquenao");
    divDir.style.left=lTab+mPadrao+"px";
    divEsq.style.right=divDir.style.left;
  }

  tab.width=lTab;
  tab.height=aTab;
  divNums.style.marginBottom=mPadrao+"px";
  divEsqDir.style.fontSize=rem+"px";
  divPecas.style.bottom=mTab+"px";
  divNums.style.fontSize=1.5*rem+"px";
  divDir.style.maxHeight=divEsq.offsetHeight+"px";
  botaoHome.style.fontSize=aTabCM*0.05+"px";
  botaoHome.style.top=aTabCM*0.05+"px";
  botaoHome.style.right=aTabCM*0.05+"px";
  for(let i=0; i<linhas*colunas; i++){
    pecas[i].style.fontSize=lPeca+"px";
    pecas[i].style.margin=(laEsp-lPeca)/2+"px";
    pecas[i].style.left=1.7367*mTab+lEspTotal*colPeca(i)+"px";
    alturaPeca[i]=mPadrao+mTab*0.75+lPeca*(linhaPeca(i)+1);
    pecas[i].style.top=divPecas.clientHeight*quedaPeca[i]+"px";
  }
  for(let i=0; i<colunas; i++){
    nums[i].style.width=lEspTotal+"px";
    numsCirculos[i].style.width=laEsp+"px";
    numsCirculos[i].style.height=laEsp+"px";
  }
}
window.addEventListener('resize', autoSize);
