"use strict";

const div=document.querySelector("#game");
const imgs=document.querySelector("#imgs");
const trs=document.querySelectorAll("#tabBody>tr");
const ol=document.querySelector("#jogadas");
const btnUndo=document.querySelector("#undo");
const btnEmpate=document.querySelector("#empate");
const btnBot=document.querySelector("#stockshit");
const modalProm=document.querySelector("#promocao");
const divBotoesProm=document.querySelector("#divBotoesProm");
const tds=[];
for(let i=0; i<8; i++){
  tds[i]=[];
}

const divInfo=document.querySelector("#info");
const pInfo=document.querySelector("#info p");
const h3Info=document.querySelector("#info h3");
function cliqueDireito(c,l,e){
  e.preventDefault();

  if(casas[c][l]!=null){
    const proto=prototiposPecas[casas[c][l].id];
    h3Info.innerHTML=proto.nome;
    pInfo.innerHTML=proto.desc;
    divInfo.style.top=e.pageY+"px";
    divInfo.style.left=e.pageX+"px";

    function ocultar(e){
      divInfo.classList.add("oculto");
      removeEventListener("click",ocultar);
      removeEventListener("contextmenu",ocultar);
    }
    function ocultar2(e){
      const eTile=e.target.classList.contains("tile");
      if(!(eTile && casas[e.target.c][e.target.l]!=null) && !e.target.classList.contains("peca")){
        ocultar();
      }
    }

    if(divInfo.classList.contains("oculto")){
      divInfo.classList.remove("oculto");
      setTimeout(function () {
        addEventListener("click",ocultar);
        addEventListener("contextmenu",ocultar2);
      },0);
    }
  }
}

for(let i=7,j=0; i>=0; i--,j++){
  const tiles=trs[i].querySelectorAll(".tile");
  for(let k=0; k<8; k++){
    tds[k][j]=tiles[k];
    tiles[k].oncontextmenu=function (e) {
      cliqueDireito(k,j,e);
    };
    tiles[k].c=k;
    tiles[k].l=j;
  }
}


// Utilidades

function matriz8x8(valorInic){
  const res=[];
  for(let i=0; i<8; i++){
    res[i]=[];
    for(let j=0; j<8; j++){
      res[i][j]=valorInic;
    }
  }
  return res;
}

function limpar(el){
  let x;
  while (x=el.firstChild) {
    x.remove();
  }
}


// Movimentos

function determinarLimite(dir){
  return dir==1? 8: -1;
}
function corpoDoLoop(casas,i,j,cor,res){
  if(casas[i][j]!=null){
    if(casas[i][j].cor!=cor){
      res[i][j]=true;
    }
    return false;
  }
  else{
    res[i][j]=true;
    return true;
  }
}
function mover1(casas,i,j,cor,res){
  if(casas[i][j]==null || casas[i][j].cor!=cor){
    res[i][j]=true;
  }
}
function estaDentro(x){
  return x<8 && x>=0;
}

function movHoriz1dir(casas,c,l,cor,res,dir){
  const lim=determinarLimite(dir);
  for(let i=c+dir; i!=lim && corpoDoLoop(casas,i,l,cor,res); i+=dir);
}
function movVert1dir(casas,c,l,cor,res,dir){
  const lim=determinarLimite(dir);
  for(let i=l+dir; i!=lim && corpoDoLoop(casas,c,i,cor,res); i+=dir);
}

function movDiag_a8h1_1dir(casas,c,l,cor,res,dir){
  const limc=determinarLimite(-dir),liml=determinarLimite(dir);
  for(let i=c-dir,j=l+dir; i!=limc && j!=liml && corpoDoLoop(casas,i,j,cor,res); i-=dir,j+=dir);
}
function movDiag_a1h8_1dir(casas,c,l,cor,res,dir){
  const limc=determinarLimite(dir),liml=determinarLimite(dir);
  for(let i=c+dir,j=l+dir; i!=limc && j!=liml && corpoDoLoop(casas,i,j,cor,res); i+=dir,j+=dir);
}

function movCavalo(casas,c,l,cor,res){
  for(let i=-1; i<=1; i+=2){
    for(let j=-1; j<=1; j+=2){
      for(let k=1; k<=2; k++){
        const novoC=c+i*k;
        const novoL=l+j*(3-k);
        if(estaDentro(novoC) && estaDentro(novoL) && (casas[novoC][novoL]==null || casas[novoC][novoL].cor!=cor)){
          res[novoC][novoL]=true;
        }
      }
    }
  }
}

function fnValorPadrao(){
  return this.preco;
}
function avaliarMob(pos,i,j){
  const movs=prototiposPecas[pos[i][j].id].mov(pos,i,j,pos[i][j].cor);
  let mob=0;
  for(let k=0; k<8; k++){
    for(let m=0; m<8; m++){
      mob+=movs[k][m];
    }
  }
  pos[i][j].mob=mob;
}

const mp=[
  [0,   0,   0,   0,   0,   0,   0,   0],
  [30,  30,  30,  30,  30,  30,  30,  30],
  [2,   3.5, 7.5, 12,  12,  7.5, 3.5, 2],
  [-1,  1,   5,   8,   8,   5,   1,   -1],
  [-3,  -1.5,3,   6,   6,   3,   -1.5,-3],
  [-3,  -1.5,1.5, 4.5, 4.5, 1.5, -1.5,-3],
  [-3,  -1.5,1.5, 3,   3,   1.5, -1.5,-3],
  [0,   0,   0,   0,   0,   0,   0,   0]
];
const mpFim=[
  [0,   0,   0,   0,   0,   0,   0,   0],
  [30,  30,  30,  30,  30,  30,  30,  30],
  [13.5,9,   5,   1.5, 1.5, 5,   9,   13.5],
  [10,  5,   2  , 0,   0,   2,   5,   10],
  [7.5, 3   ,0,   -1.5,-1.5,0,   3,   7.5],
  [6,   1.5 ,-1.5,-3,  -3,  -1.5,1.5, 6],
  [6,   1.5 ,-1.5,-3,  -3,  -1.5,1.5, 6],
  [0,   0,   0,   0,   0,   0,   0,   0]
];
const multPassado=[0,1.2,1.2,1.3,1.55,2.3,1,0];

function refletirMatriz(x){
  for(let i=0; i<4; i++){
    for(let j=0; j<4; j++){
      x[i][7-j]=x[i][j];
    }
  }
  x=[,,,,...x];
  for(let i=0; i<4; i++){
    x[i]=[...x[7-i]];
  }
  return x;
}

const posDoRei=refletirMatriz([
  [-3,   -3,   -3,   -3],
  [-2.25,-2.25,-2.6, -3],
  [-0.75,-0.75,-1.5, -2.25],
  [0,    0,    -0.75,-1.5]
]);
const posDoReiFim=refletirMatriz([
  [0,   10,  20,  30],
  [0,   10,  20,  20],
  [0,   10,  10,  10],
  [0,   0,   0,   0]
]);

const prototiposPecas=[
  {
    imgs:["wr.png","br.png"],
    mov:function (casas,c,l,cor) {
      const res=matriz8x8(false);
      for(let i=-1; i<=1; i+=2){
        movHoriz1dir(casas,c,l,cor,res,i);
        movVert1dir(casas,c,l,cor,res,i);
      }
      return res;
    },
    nome:"Torre",
    desc:"Move quanto quiser na horizontal ou vertical.",
    preco:160,
    fnValor:function (pos,i,j) {
      return pos[i][j].mob*(()=>{
        switch(estilo){
          case 2:
          return 0.75;
          case 3:
          return 0.001;
          default:
          return 0.5;
        }
      })()+(estilo==2? this.preco-50: this.preco);
    }
  },
  {
    imgs:["wn.png","bn.png"],
    mov:function (casas,c,l,cor) {
      const res=matriz8x8(false);
      movCavalo(casas,c,l,cor,res);
      return res;
    },
    nome:"Cavalo",
    desc:"Move 2 na vertical e 1 na horizontal, ou 2 na horizontal e 1 na vertical. Pode pular sobre peças.",
    preco:95,
    fnValor:function (pos,i,j) {
      return pos[i][j].mob*(()=>{
        switch(estilo){
          case 2:
          return 2.5;
          case 3:
          return 0.002;
          default:
          return 1;
        }
      })()+(estilo==2? this.preco-20: this.preco);
    }
  },
  {
    imgs:["wb.png","bb.png"],
    mov:function (casas,c,l,cor) {
      const res=matriz8x8(false);
      for(let i=-1; i<=1; i+=2){
        movDiag_a1h8_1dir(casas,c,l,cor,res,i);
        movDiag_a8h1_1dir(casas,c,l,cor,res,i);
      }
      return res;
    },
    nome:"Bispo",
    desc:"Move quanto quiser na diagonal.",
    preco:105,
    fnValor:function (pos,i,j) {
      return pos[i][j].mob*(()=>{
        switch(estilo){
          case 2:
          return 2.5;
          case 3:
          return 0.002;
          default:
          return 1;
        }
      })()+(estilo==2? this.preco-20: this.preco);
    }
  },
  {
    imgs:["wq.png","bq.png"],
    mov:function (casas,c,l,cor) {
      const res=matriz8x8(false);
      for(let i=-1; i<=1; i+=2){
        movHoriz1dir(casas,c,l,cor,res,i);
        movVert1dir(casas,c,l,cor,res,i);
        movDiag_a1h8_1dir(casas,c,l,cor,res,i);
        movDiag_a8h1_1dir(casas,c,l,cor,res,i);
      }
      return res;
    },
    nome:"Dama",
    desc:"Move quanto quiser na vertical, horizontal ou diagonal.",
    preco:280,
    fnValor:function (pos,i,j) {
      return (estilo==2? this.preco-50: this.preco);
    }
  },
  {
    imgs:["wk.png","bk.png"],
    mov:function (casas,c,l,cor) {
      const res=matriz8x8(false);
      for(let i=-1,lim1=0,lim2=7; i<=1; i+=2,lim1=7,lim2=0){
        if(c!=lim1){
          mover1(casas,c+i,l,cor,res);
        }
        if(l!=lim1){
          mover1(casas,c,l+i,cor,res);
        }
        if(c!=lim1 && l!=lim1){
          mover1(casas,c+i,l+i,cor,res);
        }
        if(c!=lim1 && l!=lim2){
          mover1(casas,c+i,l-i,cor,res);
        }
      }
      return res;
    },
    nome:"Rei",
    desc:"Move 1 na vertical, horizontal ou diagonal. Essa peça não pode ser exposta a capturas e, se seu oponente atacá-la, na sua vez você deve tirá-la do ataque, caso contrário você perderá.",
    preco:999,
    fnValor:fnValorPadrao
  },
  {
    imgs:["wp.png","bp.png"],
    mov:function (casas,c,l,cor) {
      const res=matriz8x8(false);
      const avanco=cor==0? 1: -1;
      const novoL=l+avanco;
      const condAvanco=casas[c][novoL]==null;
      if(condAvanco){
        res[c][novoL]=true;
      }
      for(let i=-1; i<=1; i+=2){
        const novoC=c+i;
        if(estaDentro(novoC) && casas[novoC][novoL]!=null && casas[novoC][novoL].cor!=cor){
          res[novoC][novoL]=true;
        }
      }
      if(condAvanco && ((cor==0 && l==1) || (cor==1 && l==6))){
        const outroL=novoL+avanco;
        if(casas[c][outroL]==null){
          res[c][outroL]=true;
        }
      }
      return res;
    },
    nome:"Peão",
    desc:"Move 1 para frente na vertical (ou 2 no primeiro movimento) e captura movendo 1 para frente na diagonal. Se chegar à última fileira, pode virar uma dama, cavalo, bispo ou torre.",
    preco:30,
    fnValor:function (pos,i,j,estagio=0.5,cor=pos[i][j].cor) {
      const j2=cor==0? 7-j: j;
      let ret=(()=>{
        switch(estilo){
          case 2:
          return this.preco-20;
          case 3:
          return this.preco+15;
          default:
          return this.preco;
        }
      })()+(mp[j2][i]*(estilo==2? 2: 1))*estagio+mpFim[j2][i]*(1-estagio)*(estilo==3? 2: 1);
      if(estilo==3){
        ret+=0.45*pos[i][j].mob;
      }
      return ret;
    }
  },
  {
    imgs:["wa.png","ba.png"],
    mov:function (casas,c,l,cor) {
      const res=matriz8x8(false);
      for(let i=0; i<8; i++){
        for(let j=0; j<8; j++){
          if(casas[i][j]==null){
            res[i][j]=true;
          }
        }
      }
      const avanco=cor==0? -1: 1;
      if(estaDentro(l+avanco) && (casas[c][l+avanco]!=null && casas[c][l+avanco].cor!=cor)){
        res[c][l+avanco]=true;
      }
      return res;
    },
    nome:"Assassino",
    desc:"Pode mover para qualquer espaço vazio ou capturar andando 1 para trás.",
    preco:120,
    fnValor:fnValorPadrao
  },
  {
    imgs:["wc.png","bc.png"],
    mov:function (casas,c,l,cor) {
      const res=matriz8x8(false);
      for(let i=-1; i<=1; i+=2){
        movHoriz1dir(casas,c,l,cor,res,i);
        movVert1dir(casas,c,l,cor,res,i);
        movDiag_a1h8_1dir(casas,c,l,cor,res,i);
        movDiag_a8h1_1dir(casas,c,l,cor,res,i);
      }
      for(let i=-1,lim1=0,lim2=7; i<=1; i+=2,lim1=7,lim2=0){
        if(c!=lim1){
          res[c+i][l]=false;
        }
        if(l!=lim1){
          res[c][l+i]=false;
        }
        if(c!=lim1 && l!=lim1){
          res[c+i][l+i]=false;
        }
        if(c!=lim1 && l!=lim2){
          res[c+i][l-i]=false;
        }
      }
      return res;
    },
    nome:"Canhão",
    desc:"Move como a dama, mas deve mover pelo menos 2 quadrados.",
    preco:160,
    fnValor:fnValorPadrao
  },
  {
    imgs:["wt.png","bt.png"],
    mov:function (casas,c,l,cor) {
      const res=matriz8x8(false);
      function cl2(i,j,eImpar){
        if(casas[i][j]!=null){
          if(casas[i][j].cor!=cor){
            res[i][j]=eImpar;
          }
          return false;
        }
        else{
          res[i][j]=eImpar;
          return true;
        }
      }
      for(let dir=-1,lim=-1; dir<=1; dir+=2,lim=8){
        for(let i=dir; i+c!=lim && cl2(i+c,l,i%2!=0); i+=dir);
        for(let i=dir; i+l!=lim && cl2(c,i+l,i%2!=0); i+=dir);
      }
      return res;
    },
    nome:"Torreta",
    desc:"Move como a torre, mas apenas números ímpares de quadrados.",
    preco:80,
    fnValor:fnValorPadrao
  },
  {
    imgs:["wp2.png","bp2.png"],
    mov:function (casas,c,l,cor) {
      const res=matriz8x8(false);
      for(let i=-1,lim1=0,lim2=7; i<=1; i+=2,lim1=7,lim2=0){
        if(c!=lim1 && l!=lim1){
          mover1(casas,c+i,l+i,cor,res);
        }
        if(c!=lim1 && l!=lim2){
          mover1(casas,c+i,l-i,cor,res);
        }
      }
      return res;
    },
    nome:"Padre",
    desc:"Move como o bispo, mas um quadrado só.",
    preco:45,
    fnValor:fnValorPadrao
  },
  {
    imgs:["wn2.png","bn2.png"],
    mov:function (casas,c,l,cor) {
      const res=matriz8x8(false);
      for(let i=-1,lim1=0,lim2=7; i<=1; i+=2,lim1=7,lim2=0){
        if(c!=lim1){
          mover1(casas,c+i,l,cor,res);
        }
        if(l!=lim1){
          mover1(casas,c,l+i,cor,res);
        }
        if(c!=lim1 && l!=lim1){
          mover1(casas,c+i,l+i,cor,res);
        }
        if(c!=lim1 && l!=lim2){
          mover1(casas,c+i,l-i,cor,res);
        }

        function cl2(i,j){
          if(casas[i][j]!=null){
            return false;
          }
          else{
            res[i][j]=true;
            return true;
          }
        }

        for(let j=c+i; j!=lim1+i && cl2(j,l); j+=i);
        for(let j=l+i; j!=lim1+i && cl2(c,j); j+=i);
        for(let j=c+i,k=l+i; j!=lim1+i && k!=lim1+i && cl2(j,k); j+=i,k+=i);
        for(let j=c+i,k=l-i; j!=lim1+i && k!=lim2+i && cl2(j,k); j+=i,k-=i);
      }

      return res;
    },
    nome:"Ninja",
    desc:"Move como a dama, mas captura como o rei.",
    preco:130,
    fnValor:fnValorPadrao
  },
  {
    imgs:["wf.png","bf.png"],
    mov:function (casas,c,l,cor) {
      const res=matriz8x8(false);
      for(let i=-1,lim1=0,lim2=7; i<=1; i+=2,lim1=7,lim2=0){
        if(c!=lim1){
          mover1(casas,c+i,l,cor,res);
        }
        if(l!=lim1){
          mover1(casas,c,l+i,cor,res);
        }
        if(c!=lim1 && l!=lim1){
          mover1(casas,c+i,l+i,cor,res);
        }
        if(c!=lim1 && l!=lim2){
          mover1(casas,c+i,l-i,cor,res);
        }

        function cl2(i,j){
          if(casas[i][j]!=null){
            if(casas[i][j].cor!=cor){
              res[i][j]=true;
            }
            return false;
          }
          else{
            return true;
          }
        }

        for(let j=c+i; j!=lim1+i && cl2(j,l); j+=i);
        for(let j=l+i; j!=lim1+i && cl2(c,j); j+=i);
        for(let j=c+i,k=l+i; j!=lim1+i && k!=lim1+i && cl2(j,k); j+=i,k+=i);
        for(let j=c+i,k=l-i; j!=lim1+i && k!=lim2+i && cl2(j,k); j+=i,k-=i);
      }

      return res;
    },
    nome:"Lutador",
    desc:"Move como o rei, mas captura como a dama.",
    preco:160,
    fnValor:fnValorPadrao
  },
  {
    imgs:["ws.png","bs.png"],
    mov:function (casas,c,l,cor) {
      const res=matriz8x8(false);
      for(let i=-1,lim1=0,lim2=7; i<=1; i+=2,lim1=7,lim2=0){
        if(c!=lim1){
          mover1(casas,c+i,l,cor,res);
        }
        if(l!=lim1){
          mover1(casas,c,l+i,cor,res);
        }
        if(c!=lim1 && l!=lim1){
          mover1(casas,c+i,l+i,cor,res);
        }
        if(c!=lim1 && l!=lim2){
          mover1(casas,c+i,l-i,cor,res);
        }
      }

      return res;
    },
    nome:"Soldado",
    desc:"Move como o rei, mas não recebe xeque.",
    preco:100,
    fnValor:fnValorPadrao
  },
  {
    imgs:["wd.png","bd.png"],
    mov:function (casas,c,l,cor) {
      const res=matriz8x8(false);
      if(c>1){
        mover1(casas,c-2,l,cor,res);
      }
      if(l>1){
        mover1(casas,c,l-2,cor,res);
      }
      if(c>1 && l>1){
        mover1(casas,c-2,l-2,cor,res);
      }
      if(c>1 && l<6){
        mover1(casas,c-2,l+2,cor,res);
      }

      if(c<6){
        mover1(casas,c+2,l,cor,res);
      }
      if(l<6){
        mover1(casas,c,l+2,cor,res);
      }
      if(c<6 && l<6){
        mover1(casas,c+2,l+2,cor,res);
      }
      if(c<6 && l>1){
        mover1(casas,c+2,l-2,cor,res);
      }

      return res;
    },
    nome:"Mula",
    desc:"Move 2 quadrados para a vertical, horizontal ou diagonal, podendo pular sobre peças.",
    preco:60,
    fnValor:fnValorPadrao
  },
  {
    imgs:["wj.png","bj.png"],
    mov:function (casas,c,l,cor) {
      const res=matriz8x8(false);

      function cl2(i,j,diri,dirj){
        if(casas[i][j]!=null){
          if(res[i+diri]!=undefined && res[i+diri][j+dirj]!=undefined && (casas[i+diri][j+dirj]==null || casas[i+diri][j+dirj].cor!=cor)){
            res[i+diri][j+dirj]=true;
          }
          if(casas[i][j].cor!=cor){
            res[i][j]=true;
          }
          return false;
        }
        else{
          res[i][j]=true;
          return true;
        }
      }

      for(let dir=-1,lim=-1; dir<=1; dir+=2,lim=8){
        for(let i=c+dir; i!=lim && cl2(i,l,dir,0); i+=dir);
        for(let i=l+dir; i!=lim && cl2(c,i,0,dir); i+=dir);
      }

      return res;
    },
    nome:"Saltador",
    desc:"Move como a torre, e também pode pular sobre uma peça e parar na casa atrás dela.",
    preco:230,
    fnValor:fnValorPadrao
  },
  {
    imgs:["wg.png","bg.png"],
    mov:function (casas,c,l,cor) {
      const res=matriz8x8(false);

      for(let i=-1; i<=1; i+=2){
        movHoriz1dir(casas,c,l,cor,res,i);
        movVert1dir(casas,c,l,cor,res,i);
        movDiag_a1h8_1dir(casas,c,l,cor,res,i);
        movDiag_a8h1_1dir(casas,c,l,cor,res,i);
      }

      const ic=c<2? 0: c-2;
      const fc=c>5? 7: c+2;
      const il=l<2? 0: l-2;
      const fl=l>5? 7: l+2;

      for(let i=ic; i<=fc; i++){
        for(let j=il; j<=fl; j++){
          if(casas[i][j]==null || casas[i][j].cor!=cor){
            res[i][j]=true;
          }
        }
      }

      return res;
    },
    nome:"Ceifador",
    desc:"Move como a dama, e também pode mover para qualquer espaço em uma área 5x5 em volta dele, pulando sobre peças.",
    preco:400,
    fnValor:fnValorPadrao
  },
  {
    imgs:["wa2.png","ba2.png"],
    mov:function (casas,c,l,cor) {
      const res=matriz8x8(false);

      function cl2(i,j,ePar){
        if(casas[i][j]!=null){
          if(casas[i][j].cor!=cor){
            res[i][j]=ePar;
          }
          return false;
        }
        else{
          res[i][j]=ePar;
          return true;
        }
      }

      for(let dir=-1,lim=-1; dir<=1; dir+=2,lim=8){
        for(let i=dir; i+c!=lim && cl2(i+c,l,i%2==0); i+=dir);
        for(let i=dir; i+l!=lim && cl2(c,i+l,i%2==0); i+=dir);
        movDiag_a1h8_1dir(casas,c,l,cor,res,dir);
        movDiag_a8h1_1dir(casas,c,l,cor,res,dir);
      }

      return res;
    },
    nome:"Cardeal",
    desc:"Move como o bispo, e pode andar na vertical e horizontal números pares de quadrados.",
    preco:190,
    fnValor:fnValorPadrao
  },
  {
    imgs:["wg2.png","bg2.png"],
    mov:function (casas,c,l,cor) {
      const res=matriz8x8(false);

      const casasMov1C=[],casasMov1L=[];
      for(let i=-1,lim1=0,lim2=7; i<=1; i+=2,lim1=7,lim2=0){
        if(c!=lim1 && l!=lim1){
          casasMov1C.push(c+i);
          casasMov1L.push(l+i);
        }
        if(c!=lim1 && l!=lim2){
          casasMov1C.push(c+i);
          casasMov1L.push(l-i);
        }
      }

      for(let i=0; i<casasMov1C.length; i++){
        const c2=casasMov1C[i],l2=casasMov1L[i];
        if(casas[c2][l2]!=null){
          if(casas[c2][l2].cor!=cor){
            res[c2][l2]=true;
          }
        }
        else{
          res[c2][l2]=true;

          for(let dir=-1; dir<=1; dir+=2){
            movHoriz1dir(casas,c2,l2,cor,res,dir);
            movVert1dir(casas,c2,l2,cor,res,dir);
          }
        }
      }

      return res;
    },
    nome:"Grifo",
    desc:"Move 1 na diagonal e depois, se não tiver capturado nenhuma peça, pode mover quanto quiser na horizontal e vertical.",
    preco:340,
    fnValor:fnValorPadrao
  },
  {
    imgs:["wp3.png","bp3.png"],
    mov:function (casas,c,l,cor) {
      const res=matriz8x8(false);

      const casasMov1C=[],casasMov1L=[];
      for(let i=-1,lim=0; i<=1; i+=2,lim=7){
        if(c!=lim){
          casasMov1C.push(c+i);
          casasMov1L.push(l);
        }
        if(l!=lim){
          casasMov1C.push(c);
          casasMov1L.push(l+i);
        }
      }

      for(let i=0; i<casasMov1C.length; i++){
        const c2=casasMov1C[i],l2=casasMov1L[i];
        if(casas[c2][l2]!=null){
          if(casas[c2][l2].cor!=cor){
            res[c2][l2]=true;
          }
        }
        else{
          res[c2][l2]=true;

          for(let dir=-1; dir<=1; dir+=2){
            movDiag_a1h8_1dir(casas,c2,l2,cor,res,dir);
            movDiag_a8h1_1dir(casas,c2,l2,cor,res,dir);
          }
        }
      }

      return res;
    },
    nome:"Pégaso",
    desc:"Move 1 na vertical ou horizontal e depois, se não tiver capturado nenhuma peça, pode mover quanto quiser na diagonal.",
    preco:255,
    fnValor:fnValorPadrao
  },
  {
    imgs:["wd2.png","bd2.png"],
    mov:function (casas,c,l,cor) {
      const res=matriz8x8(false);

      const casasMov1L=[l];
      function cl2(i){
        if(casas[c][i]!=null){
          if(casas[c][i].cor!=cor){
            res[c][i]=true;
          }
          return false;
        }
        else{
          res[c][i]=true;
          casasMov1L.push(i);
          return true;
        }
      }

      for(let dir=-1,lim=l-3<0? -1: l-3; dir<=1; dir+=2,lim=l+3>7? 8: l+3){
        for(let i=l+dir; i!=lim && cl2(i); i+=dir);
      }

      for(let h=0; h<casasMov1L.length; h++){
        for(let dir=-1,lim=c-3<0? -1: c-3; dir<=1; dir+=2,lim=c+3>7? 8: c+3){
          for(let i=c+dir; i!=lim && corpoDoLoop(casas,i,casasMov1L[h],cor,res); i+=dir);
        }
      }

      return res;
    },
    nome:"Dragão",
    desc:"Pode mover até 2 quadrados na vertical e depois, se não tiver capturado nenhuma peça, pode mover até 2 na horizontal.",
    preco:210,
    fnValor:fnValorPadrao
  }
];


let jaJogouAntes=false;

const durTrans=-20;

let casas;
let vez; // 0=branco, 1=preto
let tilesPodeMover,cPecaClicada,lPecaClicada;
let lReis,cReis;
let xeque,xequeMate;
let roques;
let boardStates,pilhaHashes;
let ultimaJogada;
let jogadas,plays;
let jogEmExibicao;
let enPassant,podeEnPassant;
let regra50jog,rep3,ultimaIrr;


function criaElPeca(peca,c,l){
  const el=document.createElement("img");
  el.src=prototiposPecas[peca.id].imgs[peca.cor];
  el.className="peca "+(peca.cor==0? "branco": "preto");
  el.oncontextmenu=function (e) {
    cliqueDireito(peca.c,peca.l,e);
  };
  peca.el=el;
  atualizarCoordsPeca(peca,c,l);
  imgs.appendChild(el);
}

function atualizarCoordsPeca(peca,c,l){
  if(peca.c!=undefined){
    casas[peca.c][peca.l]=null;
  }
  peca.el.style.top=(7-l)+"em";
  peca.el.style.left=c+"em";
  peca.c=c;
  peca.l=l;
  casas[c][l]=peca;
}

function removerCoresDasCasas(){
  for(let i=0,n=tilesPodeMover.length; i<n; i++){
    tilesPodeMover[i].classList.remove("podeMover");
    tilesPodeMover[i].removeEventListener("click",tilesPodeMover[i].event);
    delete tilesPodeMover[i].event;
  }
  if(cPecaClicada!=-1){
    tds[cPecaClicada][lPecaClicada].classList.remove("selecionada");
  }
  tilesPodeMover.length=0;
}
function resetarCoordsClicada(){
  cPecaClicada=-1;
  lPecaClicada=-1;
}

function clonarCasas(casas){
  const cloneCasas=[];
  for(let i=0; i<8; i++){
    cloneCasas[i]=[];
    for(let j=0; j<8; j++){
      if(casas[i][j]==null){
        cloneCasas[i][j]=null;
      }
      else{
        cloneCasas[i][j]={
          cor:casas[i][j].cor,
          id:casas[i][j].id
        };
      }
    }
  }
  return cloneCasas;
}

function clonarRoques(roques){
  const cloneRoques=[];
  for(let i=0; i<2; i++){
    cloneRoques[i]=[...roques[i]];
  }
  return cloneRoques;
}

function saveState(){
  const o={};
  o.pos=clonarCasas(casas);
  o.cor=vez;

  if(plays>=playQueComecou){
    o.roques=clonarRoques(roques);
    o.enPassant=enPassant;
    o.podeEnPassant=[...podeEnPassant];
    o.regra50jog=regra50jog;
    o.cReis=[...cReis];
    o.lReis=[...lReis];

    pilhaHashes.push(hash(casas,roques,vez));
  }

  else{
    const cloneTds=[],cloneInds=[];
    for(let i=0; i<tdsSobrando.length; i++){
      cloneTds[i]=[...tdsSobrando[i]];
    }
    for(let i=0; i<indsPecas.length; i++){
      cloneInds[i]=[...indsPecas[i]];
    }

    o.tdsSobrando=cloneTds;
    o.totaisPecas=[...totaisPecas];
    o.indsPecas=cloneInds;
  }

  boardStates[plays]=o;
}

function atualizarClasseVez(){
  if(vez==0){
    div.className="vezBranco";
  }
  else{
    div.className="vezPreto";
  }
}

function voltarPara(p){
  limpar(imgs);
  for(let i=0; i<8; i++){
    for(let j=0; j<8; j++){
      if(p.pos[i][j]!=null){
        casas[i][j]={...p.pos[i][j]};
        criaElPeca(casas[i][j],i,j);
      }
      else{
        casas[i][j]=null;
      }
    }
  }
}

function addEventosDeClick(){
  for(let i=0; i<8; i++){
    for(let j=0; j<8; j++){
      if(casas[i][j]!=null){
        addEventPeca(casas[i][j]);
      }
    }
  }
}

function determinarMovsLegais(casas,cReis,lReis,vez){
  let numMovs=0;
  for(let i=0; i<8; i++){
    for(let j=0; j<8; j++){
      if(casas[i][j]!=null && casas[i][j].cor==vez){
        const movs=prototiposPecas[casas[i][j].id].mov(casas,i,j,vez);
        let copia=casas[i][j];
        let mob=0;
        casas[i][j]=null;
        for(let k=0; k<8; k++){
          for(let m=0; m<8; m++){
            if(movs[k][m]){
              let copia2=casas[k][m];
              casas[k][m]=copia;
              movs[k][m]=copia.id==4? casaESegura(casas,k,m,vez): casaESegura(casas,cReis[vez],lReis[vez],vez);
              casas[k][m]=copia2;
              numMovs+=movs[k][m];
              mob++;
            }
          }
        }
        casas[i][j]=copia;
        casas[i][j].movs=movs;
        casas[i][j].mob=mob;
      }
    }
  }
  return numMovs;
}

function determinarMovs(casas,vez){
  callsDM++;
  for(let i=0; i<8; i++){
    for(let j=0; j<8; j++){
      if(casas[i][j]!=null && casas[i][j].cor==vez){
        const movs=prototiposPecas[casas[i][j].id].mov(casas,i,j,vez);
        let mob=0;
        for(let k=0; k<8; k++){
          for(let m=0; m<8; m++){
            mob+=movs[k][m];
          }
        }
        casas[i][j].movs=movs;
        casas[i][j].mob=mob;
      }
    }
  }
}

function equals(a,b){
  if(a.length!=b.length){
    return false;
  }
  else{
    for(let i=0; i<a.length; a++){
      if(a[i]!=b[i]){
        return false;
      }
    }
  }
  return true;
}

function repetiunvezes(vez,n){
  let reps=0;
  let st=ultimaIrr;
  if(vez!=st%2){
    st++;
  }
  const final=pilhaHashes.length-1;
  for(let i=st; i<final-3; i+=2){
    //console.log(pilhaHashes[i]);
    if(pilhaHashes[final]==pilhaHashes[i]){
      if(reps==n){
        return true;
      }
      else{
        reps++;
      }
    }
  }
  return false;
}

function casaESegura(casas,c,l,cor){
  let ant=casas[c][l];
  casas[c][l]={cor:cor};
  let ret=true;

  for(let i=0; i<8; i++){
    for(let j=0; j<8; j++){
      if(casas[i][j]!=null && casas[i][j].cor!=cor){
        if(prototiposPecas[casas[i][j].id].mov(casas,i,j,+!cor)[c][l]){
          ret=false;
          break;
        }
      }
    }
  }

  casas[c][l]=ant;
  return ret;
}

function checkRoque(casas,cor,dir,lim,l){
  for(let i=4+dir; i!=lim; i+=dir){
    if(casas[i][l]!=null){
      return false;
    }
  }

  for(let i=4+dir,j=0; j<2; j++,i+=dir){
    if(!casaESegura(casas,i,l,cor)){
      return false;
    }
  }

  return true;
}

function colunaParaLetra(c){
  return String.fromCharCode(97+c);
}

function voltarAtrasEmpate(){
  if(!rep3){
    btnEmpate.setAttribute("disabled","");
  }
}

function addNotacaoJogada(ultimaJogada,criarNovaLi){
  const jog=document.createElement("span");
  jog.innerHTML=ultimaJogada;
  if(!criarNovaLi){
    ol.lastElementChild.appendChild(document.createTextNode(" "));
  }
  else{
    ol.appendChild(document.createElement("li"));
    jogadas++;
    ol.lastElementChild.appendChild(document.createTextNode(jogadas+". "));
    ol.scrollTop=ol.scrollHeight;
  }

  if(plays>0){
    jogEmExibicao.classList.remove("emExibicao");
  }
  ol.lastElementChild.appendChild(jog);
  jogEmExibicao=jog;
  jog.classList.add("emExibicao");

  plays++;
  const playsAtual=plays;
  jog.addEventListener("click",function(){
    jogEmExibicao.classList.remove("emExibicao");
    voltarPara(boardStates[playsAtual]);
    jog.classList.add("emExibicao");
    jogEmExibicao=jog;

    removerCoresDasCasas();
    resetarCoordsClicada();

    if(playsAtual==plays){
      addEventosDeClick();
      determinarMovsLegais(casas,cReis,lReis,vez);
    }
  });

  saveState();
}

function eVezDoBot(){
  if(!xequeMate && btnEmpate.disabled && ((contraOBot & 1) && vez==0 || (contraOBot & 2) && vez==1)){
    setTimeout(botplay,durTrans+20);
  }
  else{
    atualizarClasseVez();
  }
}

function jogada(){
  if(vez==0){
    vez=1;
  }
  else{
    vez=0;
  }
  xeque=!casaESegura(casas,cReis[vez],lReis[vez],vez);

  podeEnPassant=[];
  if(enPassant!=null){
    const antigaL=4-vez;
    for(let i=0; i<8; i++){
      if(casas[i][antigaL]!=null && casas[i][antigaL].id==5 && casas[i][antigaL].cor==vez && (enPassant==i-1 || enPassant==i+1)){
        const cp=casas[i][antigaL];
        casas[i][antigaL]=null;
        const da=casaESegura(casas,cReis[vez],lReis[vez],vez);
        casas[i][antigaL]=cp;
        if(da){
          podeEnPassant.push(i);
        }
      }
    }
  }

  removerCoresDasCasas();
  resetarCoordsClicada();

  const numMovs=determinarMovsLegais(casas,cReis,lReis,vez);
  xequeMate=numMovs==0 && podeEnPassant.length==0;
  if(xequeMate){
    if(xeque){
      console.log("xeque mate");
      ultimaJogada+="#";
    }
    else{
      console.log("rei afogado");
    }
  }
  else{
    if(xeque){
      ultimaJogada+="+";
    }
  }

  addNotacaoJogada(ultimaJogada,vez==1);

  if(!xequeMate){
    if(rep3==0 && repetiunvezes(vez,1)){
      rep3=plays+1;
    }
    if(rep3>0 || regra50jog>=100){
      btnEmpate.removeAttribute("disabled");
    }
  }

  eVezDoBot();
}

function liberarMov(i,j,f){
  tds[i][j].classList.add("podeMover");
  tilesPodeMover.push(tds[i][j]);
  tds[i][j].event=f;
  tds[i][j].addEventListener("click",tds[i][j].event);
}

function imgPeca(id,cor,ml2){
  return "<img src='"+prototiposPecas[id].imgs[cor]+"'"+(ml2? " class='ml2'": "")+">";
}

function diferenciarNotacoes(casas,c,l,i,j,cor){
  if(casas[c][l].id==5){
    return"";
  }

  let temNaMesmaLinha=false,temNaMesmaCol=false,tem=false;
  let stringDif="";
  for(let k=0; k<8; k++){
    for(let m=0; m<8; m++){
      if(casas[k][m]!=null && casas[k][m].id==casas[c][l].id && casas[k][m].cor==cor){
        const eMesmaLinha=m==l,eMesmaCol=k==c;
        if(!(eMesmaLinha && eMesmaCol) && casas[k][m].movs[i][j]){
          tem=true;
          temNaMesmaLinha=temNaMesmaLinha || eMesmaLinha;
          temNaMesmaCol=temNaMesmaCol || eMesmaCol;
        }
      }
    }
  }

  if(tem){
    if(temNaMesmaCol){
      if(temNaMesmaLinha){
        stringDif+=colunaParaLetra(c);
      }
      stringDif+=l+1;
    }
    else{
      stringDif+=colunaParaLetra(c);
    }
  }
  return stringDif;
}

function addEventPeca(peca){
  const cor=peca.cor;

  peca.el.addEventListener("click",function (e) {
    if(vez==cor){
      removerCoresDasCasas();
      if(peca.c==cPecaClicada && peca.l==lPecaClicada){
        resetarCoordsClicada();
      }
      else{
        cPecaClicada=peca.c;
        lPecaClicada=peca.l;
        tds[peca.c][peca.l].classList.add("selecionada");

        let stringCapt="",stringDif="",stringProm="";

        for(let i=0; i<8; i++){
          for(let j=0; j<8; j++){
            function posJogada(){
              atualizarCoordsPeca(casas[peca.c][peca.l],i,j);
              ultimaJogada=(peca.id!=5 && stringProm==""? imgPeca(peca.id,vez): "")+stringDif+stringCapt+colunaParaLetra(i)+(j+1)+stringProm;
              jogada();
            }

            if(peca.movs[i][j]){
              liberarMov(i,j,function () {
                regra50jog++;
                if(peca.id==5 && Math.abs(j-peca.l)==2){
                  enPassant=i;
                }
                else{
                  enPassant=null;
                }

                if(cReis[cor]==peca.c && lReis[cor]==peca.l){
                  cReis[cor]=i;
                  lReis[cor]=j;
                  roques[cor][0]=false;
                  roques[cor][1]=false;
                }

                else if(peca.id==5){
                  regra50jog=0;
                  ultimaIrr=plays+1;
                  voltarAtrasEmpate();

                  if(j==(1-cor)*7){
                    modalProm.classList.add("mostrando");
                    const ordemPrototipos=[3,1,0,2];
                    stringProm+="=";

                    for(let i=0; i<4; i++){
                      const img=document.createElement("img");
                      img.src=prototiposPecas[ordemPrototipos[i]].imgs[cor];
                      img.addEventListener("click",function () {
                        peca.id=ordemPrototipos[i];
                        peca.el.src=img.src;
                        stringProm+=imgPeca(peca.id,vez,true);
                        modalProm.classList.remove("mostrando");
                        divBotoesProm.innerHTML="";
                        posJogada();
                      });
                      divBotoesProm.appendChild(img);
                    }
                  }
                }

                else if(peca.l==0){
                  if(peca.c==0){
                    roques[0][0]=false;
                  }
                  else if(peca.c==7){
                    roques[0][1]=false;
                  }
                }
                else if(peca.l==7){
                  if(peca.c==0){
                    roques[1][0]=false;
                  }
                  else if(peca.c==7){
                    roques[1][1]=false;
                  }
                }

                if(casas[i][j]!=null){
                  if(peca.id==5){
                    stringCapt=colunaParaLetra(peca.c);
                  }
                  stringCapt+="x";
                  regra50jog=0;
                  ultimaIrr=plays+1;
                  voltarAtrasEmpate();
                  const elAnt=casas[i][j].el,elAtual=casas[peca.c][peca.l].el;
                  elAtual.style.zIndex="1";
                  setTimeout(function () {
                    elAnt.remove();
                    elAtual.style.zIndex="0";
                  },durTrans);
                }

                stringDif=diferenciarNotacoes(casas,peca.c,peca.l,i,j,cor);

                if(stringProm==""){
                  posJogada();
                }
              });
            }
          }
        }

        if(peca.id==4 && !xeque){
          for(let i=0,j=-1; i<2; i++,j+=2){
            if(roques[cor][i]){
              const linha=cor*7,col=i*7;
              if(checkRoque(casas,cor,j,col,linha)){
                const posRei=4+2*j,posTorre=4+j;
                liberarMov(posRei,linha,function () {
                  regra50jog++;
                  ultimaIrr=plays+1;
                  roques[cor][0]=false;
                  roques[cor][1]=false;
                  cReis[cor]=posRei;

                  ultimaJogada=i==0? "O-O-O": "O-O";
                  enPassant=null;

                  atualizarCoordsPeca(casas[4][linha],posRei,linha);
                  atualizarCoordsPeca(casas[col][linha],posTorre,linha);
                  jogada();
                });
              }
            }
          }
        }

        const antigaL=4-cor;
        if(peca.l==antigaL && podeEnPassant.indexOf(peca.c)!=-1){
          const novaL=5-3*cor;
          liberarMov(enPassant,novaL,function () {
            regra50jog=0;
            voltarAtrasEmpate();
            ultimaJogada=colunaParaLetra(peca.c)+"x"+colunaParaLetra(enPassant)+(novaL+1);
            atualizarCoordsPeca(peca,enPassant,novaL);
            casas[enPassant][antigaL].el.remove();
            casas[enPassant][antigaL]=null;
            enPassant=null;
            jogada();
          });
        }
      }
    }
  });
}

function criaPeca(id,c,l,cor){
  const peca={
    id:id,
    cor:cor
  };
  criaElPeca(peca,c,l);
  addEventPeca(peca);
}


const divSelecao=document.querySelector("#selecao");
const imgsSelecao=[document.querySelector("#imgsSelecaoBranco"),document.querySelector("#imgsSelecaoPreto")];
let tdsSobrando;
let playQueComecou;

function atualizarClasseSelecao(){
  imgsSelecao[vez].classList.remove("oculto");
  imgsSelecao[+!vez].classList.add("oculto");
}

function inicVarsDeJogo(){
  cReis=[4,4];
  lReis=[0,7];
  roques=[[],[]];
  verRoques();
  regra50jog=0;
  enPassant=null;
  podeEnPassant=[];
  playQueComecou=plays;
  if(plays!=0)playQueComecou++;
  ultimaIrr=playQueComecou;
}

function iniciarSelecao(){
  div.className="vezBranco vezPreto";
  divSelecao.classList.remove("oculto");
  atualizarClasseSelecao();

  for(let i=0; i<2; i++){
    for(let j=0; j<indsPecas[i].length; j++){
      if(indsPecas[i][j]>0){
        const div=adicionarImgPeca(imgsSelecao[i],jParaI[j],i,indsPecas[i][j]);
        const img=div.firstChild;
        const p=div.lastChild;
        const l=7*i;
        let podeClicar=true;

        img.addEventListener("click",function () {
          if(!podeClicar) return;

          indsPecas[i][j]--;
          totaisPecas[i]--;
          p.textContent="x"+indsPecas[i][j];
          podeClicar=false;
          let vezAnt=vez;

          for(let k=0; k<tdsSobrando[i].length; k++){
            liberarMov(tdsSobrando[i][k],l,function () {
              let start=false;
              let vezAnt=vez;
              let pretoAcabou=totaisPecas[1]==-1;
              podeClicar=true;
              criaPeca(jParaI[j],tdsSobrando[i][k],l,i);
              removerCoresDasCasas();

              if(indsPecas[i][j]==0){
                div.remove();
              }

              if(totaisPecas[+!vez]>0){
                vez=+!vez;
                atualizarClasseSelecao();
              }
              else{
                if(totaisPecas[vez]==0){
                  start=true;
                  inicVarsDeJogo()
                }
                else if(totaisPecas[+!vez]!=-1){
                  totaisPecas[+!vez]=-1;
                }
              }
              addNotacaoJogada((jParaI[j]!=5? imgPeca(jParaI[j],vezAnt): "")+colunaParaLetra(tdsSobrando[i][k])+(l+1),vezAnt==1 || (vezAnt==0 && pretoAcabou));
              tdsSobrando[i].splice(k,1);
              if(start){
                iniciar();
              }
            });
          }
        });
      }
    }
  }
}

function verRoques(){
  for(let i=0; i<2; i++){
    for(let j=0; j<2; j++){
      roques[j][i]=casas[7*i][7*j]!=null;
    }
  }
}

function terminarSelecao(){
  divSelecao.classList.add("oculto");
  vez=0;
  jogadas=0;
  verRoques();
}

function iniciarPosic(){
  if(jaJogouAntes){
    limpar(imgs);
    removerCoresDasCasas();
    limpar(ol);
  }
  else{
    jaJogouAntes=true;
  }

  vez=1;
  rep3=0;
  plays=0;
  xeque=false;
  xequeMate=false;
  casas=matriz8x8(null);
  tilesPodeMover=[];
  boardStates=[];
  pilhaHashes=[];
  ultimaJogada=null;
  jogEmExibicao=null;

  tdsSobrando=[];
  for(let i=0; i<2; i++){
    tdsSobrando[i]=[0,1,2,3,5,6,7];
  }

  if(totaisPecas[0]>totaisPecas[1]){
    jogadas=-totaisPecas[0];
  }
  else{
    if(totaisPecas[1]==0){
      jogadas=-1;
    }
    else{
      jogadas=-totaisPecas[1];
    }
  }
  jogadas--;

  btnEmpate.setAttribute("disabled","");
  resetarCoordsClicada();

  for(let i=0; i<2; i++){
    const l=7*i;
    criaPeca(4,4,l,i);
  }
  for(let i=0; i<8; i++){
    criaPeca(5,i,1,0);
  }
  for(let i=0; i<8; i++){
    criaPeca(5,i,6,1);
  }

  if(totaisPecas[0]==0 && totaisPecas[1]==0){
    start();
    iniciar();
    inicVarsDeJogo();
  }
  else{
    iniciarSelecao();
  }

  saveState();
}


function iniciar(){
  terminarSelecao();
  determinarMovsLegais(casas,cReis,lReis,vez);
  eVezDoBot();
}

function loadPos(p){
  roques=clonarRoques(p.roques);
  enPassant=p.enPassant;
  podeEnPassant=[...p.podeEnPassant];
  regra50jog=p.regra50jog;
  cReis=[...p.cReis];
  lReis=[...p.lReis];
  vez=p.cor;
  atualizarClasseVez();
  addEventosDeClick();
  determinarMovsLegais(casas,cReis,lReis,vez);
}

function undo(){
  if(plays>0){
    const jogadasENeg=jogadas<0;
    plays--;
    voltarPara(boardStates[plays]);
    if(plays<rep3){
      rep3=0;
    }
    pilhaHashes.pop();
    voltarAtrasEmpate();
    boardStates.length--;
    jogEmExibicao.classList.remove("emExibicao");
    const ultimo=ol.lastElementChild;
    if(ultimo.children.length==1){
      jogadas--;
      ultimo.remove();
    }
    else{
      ultimo.lastElementChild.remove();
    }
    if(plays>0){
      const novo=ol.lastElementChild.lastElementChild;
      jogEmExibicao=novo;
      novo.classList.add("emExibicao");
    }
    else{
      jogEmExibicao=null;
    }

    if(plays<=playQueComecou){
      if(plays==playQueComecou){
        iniciarSelecao();
      }

      for(let i=0,v=boardStates[plays].indsPecas[i]; i<v.length; i++){
        indsPecas[i]=[...v];
      }
      for(let i=0,v=boardStates[plays].tdsSobrando[i]; i<v.length; i++){
        tdsSobrando[i]=[...v];
      }
      totaisPecas=[...boardStates[plays].totaisPecas];
    }

    else{
      loadPos(boardStates[plays]);
    }
  }
}
btnUndo.addEventListener("click",undo);


// Stockshit

const letrasFenMin="rnbqkp";
const letrasFenMai="RNBQKP";

// Copie e cole o retorno dessa função para apreciar a partida no Lichess
function cecordfpaapnl(){
  return ol.innerHTML.replace(/\<li\>/g,"").replace(/\<\/li\>/g,"\n").replace(/\<span.*?\>/g,"").replace(/\<\/span\>/g,"").replace(/\<img src\=\".(.)\.png\"\>/g,(a,b)=>b.toUpperCase());
}

function importFen(s){
  let s2="";
  let i;
  for(i=0; s[i]!=' '; i++){
    let ind,min;
    const cod=s.charCodeAt(i);
    if(cod>=65 && cod<=90){
      ind=letrasFenMai.indexOf(s[i]);
      min=0;
    }
    else if(cod>=97 && cod<=122){
      ind=letrasFenMin.indexOf(s[i]);
      min=32;
    }
    else{
      ind=-1;
    }
    if(ind!=-1){
      s2+=String.fromCharCode(ind+65+min);
    }
    else{
      s2+=s[i];
    }
  }

  s2+=s.slice(i);
  importFenQP(s2);
}

function importFenQP(s){
  const ret={};
  ret.pos=matriz8x8(null);
  ret.cReis=[];
  ret.lReis=[];
  let ch=0,l=7,c=0;

  for(; ch<s.length; ch++){
    if(s[ch]=='/'){
      l--;
      c=0;
    }
    else if(s[ch]==' '){
      break;
    }
    else{
      const cod=s.charCodeAt(ch);
      if(cod>=48 && cod<=57){
        c+=cod-48;
      }
      else{
        let cor,id;
        if(cod>=65 && cod<=90){
          id=cod-65;
          cor=0;
        }
        else if(cod>=97 && cod<=122){
          id=cod-97;
          cor=1;
        }
        else{
          throw Error("Deu pau na importação de posição");
        }
        if(id==4){
          ret.cReis[cor]=c;
          ret.lReis[cor]=l;
        }
        ret.pos[c][l]={
          cor:cor,
          id:id
        };
        c++;
      }
    }
  }

  ch++;
  if(s[ch]=='w'){
    ret.cor=0;
  }
  else if(s[ch]=='b'){
    ret.cor=1;
  }
  else{
    throw Error("Deu pau na importação de posição");
  }

  ch++;
  ret.roques=[[false,false],[false,false]];
  if(s[ch]=='-'){
    ch++;
  }
  else{
    do{
      if(s[ch]=="K"){
        ret.roques[0][1]=true;
      }
      else if(s[ch]=="Q"){
        ret.roques[0][0]=true;
      }
      else if(s[ch]=="k"){
        ret.roques[1][1]=true;
      }
      else if(s[ch]=="q"){
        ret.roques[1][0]=true;
      }
      ch++;
    }while(s[ch]!=' ');
  }

  ch++;
  if(s[ch]=='-'){
    ret.enPassant=null;
    ret.podeEnPassant=[];
  }
  else{
    ch++;
    ret.enPassant=+s[ch];
  }

  ch+=2;
  let str50="";
  do{
    str50+=s[ch];
    ch++;
  }while(ch<s.length && s[ch]!=' ');
  ret.regra50jog=+str50;

  voltarPara(ret);
  loadPos(ret);
}

function start(){
  importFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
}

function toFen(pos,jog){
  const s=toFenQP(pos,jog);
  let s2="";
  let i=0;
  for(; s[i]!=' '; i++){
    let ind,min;
    const cod=s.charCodeAt(i);
    if(cod>=65 && cod<=90){
      ind=cod-65;
      min=false;
    }
    else if(cod>=97 && cod<=122){
      ind=cod-97;
      min=true;
    }
    else{
      ind=-1;
    }
    if(ind!=-1){
      s2+=(min? letrasFenMin: letrasFenMai)[ind];
    }
    else{
      s2+=s[i];
    }
  }
  s2+=s.slice(i);
  return s2;
}

function toFenQP(o,jog){
  let ret="";
  for(let l=7; ; l--){
    for(let c=0; c<8;){
      if(o.pos[c][l]!=null){
        ret+=String.fromCharCode(65+o.pos[c][l].id+o.pos[c][l].cor*32);
        c++;
      }
      else{
        let sp=0;
        do{
          sp++;
          c++;
        }while(c<8 && o.pos[c][l]==null);
        ret+=sp;
      }
    }
    if(l>0){
      ret+="/";
    }
    else{
      break;
    }
  }

  ret+=" ";
  ret+=o.cor==0? "w": "b";

  ret+=" ";
  const mroques=["QK","qk"];
  let sroques="";
  for(let i=0; i<2; i++){
    for(let j=1; j>=0; j--){
      if(o.roques[i][j]){
        sroques+=mroques[i][j];
      }
    }
  }
  if(sroques==""){
    sroques="-";
  }
  ret+=sroques;
  ret+=" ";

  if(enPassant==null){
    ret+="-";
  }
  else{
    ret+=colunaParaLetra(o.enPassant)+(6-3*o.cor);
  }

  ret+=" ";
  ret+=o.regra50jog;

  if(jog!=undefined){
    ret+=" ";
    ret+=jog;
  }

  return ret;
}

let estilo=0;
let personas=[
  {
    nome:"Stockshit",
    desc:"Foi o melhor que consegui...",
    elo:1900,
    calc:100,
    estr:100,
    estilo:0
  },
  {
    nome:"Bruce",
    desc:`"Não ganha quem come mais peças, ganha quem come o rei."`,
    elo:1700,
    calc:75,
    estr:75,
    estilo:2
  },
  {
    nome:"Lenny",
    desc:`"Não ganha quem come o rei, ganha quem chega com o rei do outro lado."`,
    elo:1500,
    calc:100,
    estr:5,
    estilo:1
  },
  {
    nome:"Muhammad",
    desc:`"Onde você vê um peão eu vejo uma dama em potencial."`,
    elo:1600,
    calc:75,
    estr:50,
    estilo:3
  },
  {
    nome:"Stockshit atenuado",
    desc:`Calcula milhares de jogadas para achar a com o nível perfeito de imprecisão.`,
    elo:1300,
    calc:50,
    estr:40,
    estilo:4
  }
];

function calcEstagio(mat){
  // Parábola com pontos (0, 0); (627, 0.5); (2000, 1)
  // 2000 = Material inicial (sem peões)
  // 627 = Se material < esse número, já considera que está no fim de jogo.
   return 9.3328211E-4*mat-2.16641053E-7*mat*mat;
}
function penalidadeSemRoque(rs,pos,cor){
  let pts=[];
  const l=7*cor;
  for(let i=0,c=1; i<2; i++,c=6){
    if(!rs[i]){
      pts[i]=1;
    }
    else{
      pts[i]=avaliarEstrutura(c,l,pos,cor,false)/5;
    }
  }
  if(estilo==2){
    pts[0]*=1.333;
    pts[1]*=2.667;
    //console.log(pts[0],pts[1]);
    return 1+pts[0]+pts[1]+pts[0]*pts[1]*3.281;
  }
  else{
    pts[0]*=0.77;
    pts[1]*=2.14;
    return 1+pts[0]+pts[1]+pts[0]*pts[1]*3.696;
  }
}
function avaliarEstrutura(c,l,pos,cor,peoesInimigos){
  let estrutura=0;
  let x=cor==0? 1: -1;
  for(let i=c-1; i<=c+1; i++){
    if(i>=0 && i<=7){
      let temPeao=false;
      for(let j=l; j!=l+3*x; j+=x){
        if(j>=0 && j<=7){
          if(pos[i][j]!=null && pos[i][j].id==5 && (peoesInimigos || pos[i][j].cor==cor)){
            temPeao=true;
            break;
          }
        }
        else break;
      }
      if(!temPeao){
        estrutura++;
        if(i==c){
          estrutura++;
        }
      }
    }
  }
  return estrutura;
}

function quaoFerradoEstou(pos,roques,cReis,lReis){
  callsQFE++;
  let res=0;

  let isolados=[[],[]],passados=[[],[]];
  for(let cor=0; cor<=1; cor++){
    for(let i=1; i<7; i++){
      isolados[cor][i]=peoesPorColuna[cor][i-1]==0 && peoesPorColuna[cor][i+1]==0;
    }
    for(let i=0,j=1; i<=7; i+=7,j=6){
      isolados[cor][i]=peoesPorColuna[cor][j]==0;
    }
  }

  const fatorDano=estilo==3? 2: 1;

  for(let cor=0,x=-1; cor<=1; cor++,x=1){
    let r=0;
    for(let i=0; i<8; i++){
      if(peoesPorColuna[cor][i]>1){
        const n=peoesPorColuna[cor][i]-1;
        if(isolados[cor][i]){
          r+=9*n*fatorDano;
        }
        else{
          r+=4.5*n*fatorDano;
        }
      }
      if(isolados[cor][i]){
        r+=2.25*fatorDano;
      }
    }
    res+=r*x;
  }

  const estagio=calcEstagio(material);
  for(let i=0; i<8; i++){
    for(let j=0; j<8; j++){
      if(pos[i][j]!=null){
        let cor=pos[i][j].cor;
        let val=prototiposPecas[pos[i][j].id].fnValor(pos,i,j,estagio)*(cor==0? 1: -1);
        /*if(pos[i][j].id==5){

        }
        else{
          res+=val;
        }*/
        res+=val;
      }
    }
  }

  if(estilo!=1){
    for(let cor=0,x=1; cor<=1; cor++,x=-1){
      const j2=cor==0? 7-lReis[cor]: lReis[cor];
      res+=((posDoRei[j2][cReis[cor]]-avaliarEstrutura(cReis[cor],lReis[cor],pos,cor,true)*0.75)*estagio*penalidadeSemRoque(roques[cor],pos,cor)*function () {
        switch(estilo){
          case 2:
          return 1.5;
          default:
          return 1;
        }
      }()+posDoReiFim[j2][cReis[cor]]*(1-estagio))*x;
    }
  }

  if(estilo==1){
    res+=15*lReis[0];
    res-=15*(7-lReis[1]);
  }

  if(isNaN(res)){
    console.log(pos,roques);
    throw Error("DEU UM SUPER PAU");
  }

  return res==0? 0.000000001: res;
}

const startHashesPreto=prototiposPecas.length*64;
const startHashesRoque=2*startHashesPreto;
const hashVezPreto=startHashesRoque+4;
const hashes=new Array(hashVezPreto+1);
for(let i=0; i<hashes.length;){
  const res=(BigInt(Math.floor(Math.random()*0xFFFFFFFFFFFFF))<<12n) | BigInt(Math.floor(Math.random()*0xFFF));
  if(hashes.indexOf(res)==-1){
    hashes[i++]=res;
  }
}
function hash(pos,roques,cor){
  let ret=0n;

  for(let i=0; i<8; i++){
    for(let j=0; j<8; j++){
      if(pos[i][j]!=null){
        ret^=hashes[pos[i][j].id+startHashesPreto*pos[i][j].cor+((i<<3) | j)*prototiposPecas.length];
      }
    }
  }

  for(let i=0; i<2; i++){
    for(let j=0; j<2; j++){
      if(roques[i][j]){
        ret^=hashes[startHashesRoque+((i<<1) | j)];
      }
    }
  }

  if(cor==1){
    ret^=hashes[hashVezPreto];
  }

  return ret;
}
//const bla=hash([[null,null,null,null,null,null,null,null],[null,null,null,{"cor":0,"id":5,"c":1,"l":3,"movs":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"mob":0},{"cor":1,"id":5,"c":1,"l":4,"movs":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"mob":0},null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,{"cor":1,"id":0,"c":4,"l":1,"movs":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"mob":10},null,{"cor":0,"id":5,"c":4,"l":3,"movs":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"mob":0},{"cor":1,"id":5,"c":4,"l":4,"movs":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"mob":0},null,null,null],[null,null,{"cor":0,"id":5,"c":5,"l":2,"movs":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"mob":0},{"cor":1,"id":1,"c":5,"l":3,"movs":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"mob":6},null,null,null,null],[null,null,{"cor":1,"id":3,"c":6,"l":2,"movs":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,true,false],[false,false,false,false,false,false,false,false]],"mob":12},null,null,null,{"cor":1,"id":4,"c":6,"l":6,"movs":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,true],[false,false,false,false,false,false,true,false],[false,false,false,false,false,false,false,true]],"mob":5},null],[{"cor":0,"id":4,"c":7,"l":0,"movs":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"mob":3},null,null,{"cor":0,"id":5,"c":7,"l":3,"movs":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"mob":0},{"cor":1,"id":5,"c":7,"l":4,"movs":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"mob":0},null,null,null]],[false,false,false,false],0);

let ultimaCapt=[],idUltima=[],pilhaRoques=[],pilhaIrr,numPecas;
let mc=0;

function cm(a,b,c,d,e){
  return{
    cOrig:a,
    lOrig:b,
    cDest:c,
    lDest:d,
    id:e
  }
}

function mexida(o,mov,mudar=true){
  mc++;
  const pos=o.pos;
  const cor=o.cor;
  const eRoque=mov.cOrig==casaOrigRoque;
  const cOrig=eRoque? 4: mov.cOrig;
  const roques=o.roques;

  const cp=pos[cOrig][mov.lOrig];
  pos[cOrig][mov.lOrig]=null;
  let dest=pos[mov.cDest][mov.lDest];

  if(mudar){
    ultimaCapt.push(dest);
    idUltima.push(cp.id);
    if(dest!=null && dest.id!=5 && dest.id!=4){
      numPecas[dest.cor]--;
      material-=prototiposPecas[dest.id].preco;
    }
    if(cp.id!=mov.id){
      material+=prototiposPecas[mov.id].preco;
    }
    pilhaRoques.push(clonarRoques(roques));
    if(cp.id==5 && dest!=null){
      peoesPorColuna[cor][mov.cOrig]--;
      peoesPorColuna[cor][mov.cDest]++;
    }
    if(dest!=null && dest.id==5){
      peoesPorColuna[+!cor][mov.cDest]--;
    }
  }

  if(dest!=null || cp.id==5 || eRoque){
    ultimaIrr=plays+1;
    if(mudar){
      pilhaIrr.push(plays+1);
    }
  }
  pos[mov.cDest][mov.lDest]=cp;
  cp.id=mov.id;

  if(eRoque){
    let cTorreOrig,cTorreDest;
    if(mov.cDest==2){
      cTorreOrig=0;
      cTorreDest=3;
    }
    else{
      cTorreOrig=7;
      cTorreDest=5;
    }
    const cp2=pos[cTorreOrig][mov.lDest];
    pos[cTorreOrig][mov.lDest]=null;
    pos[cTorreDest][mov.lDest]=cp2;
    roques[cor][0]=false;
    roques[cor][1]=false;
    o.cReis[cor]=mov.cDest;
    o.lReis[cor]=mov.lDest;
  }

  else{
    if(cp.id==4){
      roques[cor]=[false,false];
      o.cReis[cor]=mov.cDest;
      o.lReis[cor]=mov.lDest;
    }

    else{
      if(mov.lOrig==7*cor){
        for(let j=0; j<=1; j++){
          if(mov.cOrig==7*j){
            roques[cor][j]=false;
            break;
          }
        }
      }
    }
  }

  o.cor=+!cor;
  o.hash=hash(o.pos,o.roques,o.cor);
  if(mudar){
    pilhaHashes.push(o.hash);
    plays++;
  }
}

function desmexida(o,mov){
  const pos=o.pos;
  const eRoque=mov.cOrig==casaOrigRoque;
  const cOrig=eRoque? 4: mov.cOrig;
  const movid=idUltima.pop();

  const cp=pos[mov.cDest][mov.lDest];
  pos[mov.cDest][mov.lDest]=ultimaCapt.pop();
  const dest=pos[mov.cDest][mov.lDest];
  if(dest!=null && dest.id!=5 && dest.id!=4){
    numPecas[dest.cor]++;
    material+=prototiposPecas[dest.id].preco;
  }
  if(cp.id!=movid){
    material-=prototiposPecas[cp.id].preco;
  }
  pos[cOrig][mov.lOrig]=cp;
  cp.id=movid;
  o.cor=+!o.cor;
  const cor=o.cor;
  o.roques=pilhaRoques.pop();
  pilhaHashes.pop();
  o.hash=pilhaHashes[pilhaHashes.length-1];

  if(cp.id==5 && dest!=null){
    peoesPorColuna[cor][mov.cDest]--;
    peoesPorColuna[cor][mov.cOrig]++;
  }
  if(dest!=null && dest.id==5){
    peoesPorColuna[+!cor][mov.cDest]++;
  }

  if(pilhaIrr[pilhaIrr.length-1]==plays){
    pilhaIrr.pop();
    ultimaIrr=pilhaIrr[pilhaIrr.length-1];
  }

  if(cp.id==4){
    o.cReis[cor]=cOrig;
    o.lReis[cor]=mov.lOrig;
    if(eRoque){
      let cTorreOrig,cTorreDest;
      if(mov.cDest==2){
        cTorreOrig=0;
        cTorreDest=3;
      }
      else{
        cTorreOrig=7;
        cTorreDest=5;
      }
      const cp2=pos[cTorreDest][mov.lDest];
      pos[cTorreDest][mov.lDest]=null;
      pos[cTorreOrig][mov.lDest]=cp2;
    }
  }
  plays--;
}

let transp=new Array(1048576);
const casaOrigRoque=8; // Valor de casaOrig quando a jogada for um roque

function reiMorto(pos,cReis,lReis,cor){
  const casaRei=pos[cReis[cor]][lReis[cor]];
  return(casaRei==null || casaRei.cor!=cor);
}

function movsIguais(n,m){
  return n.cOrig==m.cOrig && n.lOrig==m.lOrig && n.cDest==m.cDest && n.lDest==m.lDest && n.id==m.id;
}

let callsDM,callsQFE,callsnm,callsq,m,pruned;
let peoesPorColuna=[[],[]];
let linhasDosPeoes=[];
let material;
const abortar=2147483647; // Se retornar isso o Negamax é cancelado
const futil=[30,55,77.5];
let provaveis;

function playArray(o,qui,provs0,jp,xeque,sort){
  const provs=provs0-1;
  const pos=o.pos;
  const cor=o.cor;
  const roques=o.roques;
  determinarMovs(pos,cor);
  let os=[];
  os.reiComido=false;

  function pushDM(o){
    for(let i=0; i<jp.length; i++){
      if(movsIguais(o,jp[i])){
        return false;
      }
    }
    os.push(o);
    if(o.cDest==cReis[+!cor] && o.lDest==lReis[+!cor]){
      os.reiComido=true;
    }
    return os.reiComido;
  }

  if(!qui && !xeque){
    for(let i=0,j=-1; i<2; i++,j+=2){
      if(roques[cor][i]){
        const linha=cor*7,col=i*7;
        if(checkRoque(pos,cor,j,col,linha)){
          pushDM(cm(casaOrigRoque,linha,4+2*j,linha,4));
        }
      }
    }
  }

  for(let i=0; i<8; i++){
    for(let j=0; j<8; j++){
      if(pos[i][j]!=null && pos[i][j].cor==cor){
        for(let k=0; k<8; k++){
          for(let m=0; m<8; m++){
            if(pos[i][j].movs[k][m] && (!qui || pos[k][m]!=null)){
              if(pos[i][j].id==5 && m==7*(+!cor)){
                for(let n=0; n<=3; n++){
                  if(pushDM(cm(i,j,k,m,n)))return os;
                }
              }

              else{
                if(pushDM(cm(i,j,k,m,pos[i][j].id)))return os;
              }
            }
          }
        }
      }
    }
  }

  if(os.length==0 || !sort) return os;
  function evalTurn(i){
    if(provs>=0){
      for(let j=0; j<provaveis[provs].length; j++){
        if(movsIguais(os[i],provaveis[provs][j])){
          return 10-j;
        }
      }
    }
    const dest=pos[os[i].cDest][os[i].lDest];
    let ret=dest? prototiposPecas[dest.id].preco: 0;
    let p=pos[os[i].cOrig==8? 4: os[i].cOrig][os[i].lOrig];
    if(p.id==5 && os[i].id==3){
      ret+=220;
    }
    if(dest){
      ret-=prototiposPecas[p.id].preco/1000;
    }
    return ret;
  }
  for(let i=0; i<os.length; i++){
    os[i].eval=evalTurn(i);
  }
  const k=Math.min(os.length,5);
  for(let i=0; i<k; i++){
    let indMax=i,max=os[i].eval;
    for(let j=i+1; j<os.length; j++){
      const res=os[j].eval;
      if(res>max){
        max=res;
        indMax=j;
      }
    }
    const temp=os[i];
    os[i]=os[indMax];
    os[indMax]=temp;
  }
  return os;
}

function prepareSearch(o0){
  pilhaIrr=[ultimaIrr];
  //console.log(pilhaIrr);

  material=0;
  for(let i=0; i<8; i++){
    peoesPorColuna[0][i]=0;
    peoesPorColuna[1][i]=0;
    for(let j=0; j<8; j++){
      const x=o0.pos[i][j];
      if(x!=null){
        if(x.id==5){
          peoesPorColuna[x.cor][i]++;
        }
        else if(x.id!=4){
          material+=prototiposPecas[x.id].preco;
        }
        else{
          cReis[x.cor]=i;
          lReis[x.cor]=j;
        }
      }
    }
  }
}

function melhorPlay(o0,nrest,qrest,aspa,aspb,tempoMax){
  // Posição bem legal   r2qkbnr/ppp2ppp/2np4/4p2b/2B1P3/2N2N1P/PPPP1PP1/R1BQK2R w KQkq - 0 5
  // Teste empate        rnbq1rk1/ppp2p2/2np3p/2b1p2Q/2B1P3/P2P4/1PPN1PPP/1N2K2R w KQ - 0 1
  // Armadilha Nd4       r1bqkbnr/pppp1ppp/8/4p3/2BnP3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 3
  // Mate do corredor    3r2k1/p4ppp/1q6/1Nrn4/8/2p1P3/P1R1QPPP/2R3K1 w - - 8 27
  // mate                rnbqr1k1/pppn1pp1/4p3/3pP1NQ/1b1P4/2N5/PPP2PPP/R1B1K2R w KQ - 0 12
  // Sem roque para as brancas rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kq -
  // Ultimato            K7/8/8/8/4k3/8/8/7R w - - 0 1
  // Rei afogado         2Q5/5Rpk/8/1p2p2p/1P2Pn1P/5Pq1/4r3/7K w - - 0 49
  // RA2                 3r4/4R1pk/pQ3p1p/P4P1P/3P2P1/5P1K/8/2q5 w - - 4 68

  function add2transp(o1,mov,rest,alpha,beta,nmp){
    const o={
      hash:o1.hash,
      rest:rest,
      alpha:alpha,
      beta:beta,
      mov:mov,
      nmp:nmp
    };
    transp[o1.hash%BigInt(transp.length)]=o;
    return o;
  }

  provaveis=[];
  for(let i=0; i<nrest-1; i++){
    provaveis[i]=[];
  }
  let melhor;

  function novaProvavel(plays,mov,o){
    if(o.pos[mov.cDest][mov.lDest]==null){
      let i=plays-1;
      for(let j=0; j<provaveis[i].length; j++){
        if(movsIguais(provaveis[i][j],mov)){
          return;
        }
      }
      if(provaveis[i][0]){
        provaveis[i][1]=provaveis[i][0];
      }
      provaveis[i][0]=mov;
    }
  }

  function quiesce(o,rest,alpha,beta){
    if(performance.now()-n>=tempoMax){
      console.log("abortando");
      return abortar;
    }
    callsq++;
    const cor=o.cor;
    if(repetiunvezes(o.cor,0)){
      return 0;
    }
    /*const xeque=!casaESegura(o.pos,o.cReis[cor],o.lReis[cor],cor);
    if(rest<=0){
      if(xeque){
        rest=1;
      }
      else{
        return quaoFerradoEstou(o.pos,o.roques,o.cReis,o.lReis);
      }
    }
    let os=playArray(o,!xeque,-1,[],xeque);*/
    if(rest<=0){
      return quaoFerradoEstou(o.pos,o.roques,o.cReis,o.lReis);
    }
    let os=playArray(o,true,-1,[],false,true);
    if(os.length==0){
      return quaoFerradoEstou(o.pos,o.roques,o.cReis,o.lReis);
    }
    if(os.reiComido){
      return 1000001000*(cor==0? 1: -1);
    }

    let max;
    if(cor==0){
      max=quaoFerradoEstou(o.pos,o.roques,o.cReis,o.lReis);
      if(max>alpha){
        alpha=max;
      }
      if(beta<=alpha){
        return max;
      }
      for(let i=0; i<os.length; i++){
        mexida(o,os[i]);
        const res=quiesce(o,rest-1,alpha,beta);
        desmexida(o,os[i]);
        if(res==abortar) return res;
        if(res>max){
          max=res;
          if(max>alpha){
            alpha=max;
          }
        }
        if(beta<=alpha){
          return max;
        }
      }
    }

    else{
      max=quaoFerradoEstou(o.pos,o.roques,o.cReis,o.lReis);
      if(max<beta){
        beta=max;
      }
      if(beta<=alpha){
        return max;
      }
      for(let i=0; i<os.length; i++){
        mexida(o,os[i]);
        const res=quiesce(o,rest-1,alpha,beta);
        desmexida(o,os[i]);
        if(res==abortar) return res;
        if(res<max){
          max=res;
          if(max<beta){
            beta=max;
          }
        }
        if(beta<=alpha){
          return max;
        }
      }
    }
    return max;
  }

  function negamax(o,rest,plays,alpha,beta,nmp=true){
    if(performance.now()-n>=tempoMax){
      console.log("abortando");
      return abortar;
    }

    callsnm++;
    const cor=o.cor;
    const first=plays==0;

    if(!first && repetiunvezes(cor,0)){
      add2transp(o,null,999999,0,0,nmp);
      return 0;
    }

    const xeque=!casaESegura(o.pos,o.cReis[cor],o.lReis[cor],cor);

    if(rest<=0){
      return quiesce(o,qrest,alpha,beta);
    }

    const objTrans=transp[o.hash%BigInt(transp.length)];
    let os=[],jogadaPrioritaria=null;
    const ba=cor==0? beta: alpha;
    if(objTrans){
      nmp=objTrans.nmp;
      if(o.hash==objTrans.hash){
        if(objTrans.rest>=rest && !first){
          if(objTrans.alpha>=beta){
            if(first) melhor=objTrans.mov;
            return objTrans.alpha;
          }
          if(objTrans.beta<=alpha){
            if(first) melhor=objTrans.mov;
            return objTrans.beta;
          }
          if(objTrans.alpha==objTrans.beta){
            return objTrans.beta;
          }
          alpha=Math.max(alpha,objTrans.alpha);
          beta=Math.min(beta,objTrans.beta);
        }

        else{
          jogadaPrioritaria=objTrans.mov;
        }
      }
    }


    // Null move

    if(!xeque && nmp && numPecas[cor]>0 && isFinite(ba)){
      o.cor=+!cor;
      const h=o.hash;
      o.hash=hash(o.pos,o.roques,o.cor);
      let res=cor==0? negamax(o,rest-4,plays+1,ba-0.00001,ba,false): negamax(o,rest-4,plays+1,ba,ba+0.00001,false);
      o.cor=cor;
      o.hash=h;
      if(res==abortar) return res;
      if(cor==0){
        if(res>=ba){
          add2transp(o,null,rest,ba,Infinity,true);
          return res;
        }
      }
      else{
        if(res<=ba){
          add2transp(o,null,rest,-Infinity,ba,true);
          return res;
        }
      }
    }

    let max=cor==0? -Infinity: Infinity;
    let i,imax=0,melhorou=false,parou=false,ab=cor==0? alpha: beta;

    if(jogadaPrioritaria){
      mexida(o,jogadaPrioritaria);
      max=negamax(o,rest-1,plays+1,alpha,beta);
      desmexida(o,jogadaPrioritaria);
      if(max==abortar) return max;
      os.push(jogadaPrioritaria);

      if(cor==0){
        if(max>ab){
          ab=max;
          melhorou=true;
        }
        if(beta<=max){
          parou=true;
        }
      }

      else{
        if(max<ab){
          ab=max;
          melhorou=true;
        }
        if(max<=alpha){
          parou=true;
        }
      }
    }

    let ev=null;

    if(!parou){
      const novas=playArray(o,false,plays,os,xeque,true);
      if(novas.reiComido){
        const max=1000001000*(cor==0? 1: -1);
        if(first){
          melhor=novas[novas.length-1];
        }
        add2transp(o,melhor,999999,max,max,false);
        return max;
      }

      let numVelhas=os.length;
      for(let i=numVelhas,j=0; j<novas.length; i++,j++){
        os[i]=novas[j];
      }

      if(cor==0){
        for(let i=numVelhas; i<os.length; i++){
          if(i!=0 && !xeque && alpha!=-Infinity && Math.abs(max)<1000000000 && rest<=2){
            if(ev==null) ev=quaoFerradoEstou(o.pos,o.roques,o.cReis,o.lReis);
            const dest=o.pos[os[i].cDest][os[i].lDest];
            if(ev+futil[rest]+(dest==null? 0: prototiposPecas[dest.id].preco)<alpha){
              pruned++;
              continue;
            }
          }
          mexida(o,os[i]);
          let res;
          if(rest>=2 && !xeque && os[i].eval<=10){
            res=negamax(o,rest-2,plays+1,ab,beta);
            if(res>ab && res!=abortar) {
              res=negamax(o,rest-1,plays+1,ab,beta);
              m++;
            }
          }
          else{
            res=negamax(o,rest-1,plays+1,ab,beta);
          }
          desmexida(o,os[i]);
          if(res==abortar) return res;
          if(res>max){
            max=res;
            imax=i;
          }
          if(max>ab){
            ab=max;
            melhorou=true;
          }
          if(beta<=max){
            parou=true;
            break;
          }
        }
      }

      else{
        for(let i=numVelhas; i<os.length; i++){
          if(i!=0 && !xeque && beta!=Infinity && Math.abs(max)<1000000000 && rest<=2){
            if(ev==null) ev=quaoFerradoEstou(o.pos,o.roques,o.cReis,o.lReis);
            const dest=o.pos[os[i].cDest][os[i].lDest];
            if(ev-futil[rest]-(dest==null? 0: prototiposPecas[dest.id].preco)>beta){
              pruned++;
              continue;
            }
          }
          mexida(o,os[i]);
          let res;
          if(rest>=2 && !xeque && os[i].eval<=10){
            res=negamax(o,rest-2,plays+1,alpha,ab);
            if(res < ab && res!=abortar) {
              res=negamax(o,rest-1,plays+1,alpha,ab);
              m++;
            }
          }
          else{
            res=negamax(o,rest-1,plays+1,alpha,ab);
          }
          desmexida(o,os[i]);
          if(res==abortar) return res;
          if(res<max){
            max=res;
            imax=i;
          }
          if(max<ab){
            ab=max;
            melhorou=true;
          }
          if(max<=alpha){
            parou=true;
            break;
          }
        }
      }
    }

    let mov=melhorou? os[imax]: null;
    if(!xeque && max==1000001000*(cor==0? -1: 1)){
      //console.log("Olha! É ela! glub2",JSON.parse(JSON.stringify(o.pos)),o.cor,max,alpha,beta);
      add2transp(o,mov,999999,0,0,nmp);
      return 0;
    }
    else if(Math.abs(max)>1000000100){
      if(max>0){
        max--;
      }
      else{
        max++;
      }
    }

    if(first){
      melhor=os[imax];
      //console.log("__TESTE__",ab);
    }
    else if(parou && melhorou){
      novaProvavel(plays,os[imax],o);
    }
    if(max<=alpha){
      add2transp(o,mov,rest,-Infinity,max,nmp);
    }
    else if(max<beta){
      add2transp(o,mov,rest,max,max,nmp);
    }
    else{
      add2transp(o,mov,rest,max,Infinity,nmp);
    }

    return max;
  }

  return{
    eval:negamax(o0,nrest,0,aspa,aspb,false),
    mov:melhor
  }
}

function toNotation(p0,p,mov,cor,letras=false){
  let gen=letras? function (id) {
    return letrasFenMai[id];
  }: imgPeca;
  if(mov.cOrig==casaOrigRoque){
    return mov.cDest==2? "O-O-O": "O-O";
  }
  else{
    const eCapt=p0[mov.cDest][mov.lDest]!=null;
    if(p[mov.cDest][mov.lDest].id!=p0[mov.cOrig][mov.lOrig].id){
      let ultimaJogada="";
      if(eCapt){
        ultimaJogada+=colunaParaLetra(mov.cOrig)+"x";
      }
      ultimaJogada+=colunaParaLetra(mov.cDest)+(mov.lDest+1)+"="+gen(mov.id,cor,true);
      return ultimaJogada;
    }
    else{
      let stringDif=diferenciarNotacoes(p0,mov.cOrig,mov.lOrig,mov.cDest,mov.lDest,cor);
      let stringCapt="";
      const ePeao=p0[mov.cOrig][mov.lOrig].id==5;
      if(eCapt){
        if(ePeao){
          stringCapt+=colunaParaLetra(mov.cOrig);
        }
        stringCapt+="x";
      }
      return(ePeao? "": gen(p0[mov.cOrig][mov.lOrig].id,cor))+stringDif+stringCapt+colunaParaLetra(mov.cDest)+(mov.lDest+1);
    }
  }
}

let tempoMin=3333,tempoMax=5*tempoMin;
let n;
let contraOBot=0; // 0 = sem bot, 1 = bot branco, 2 = bot preto, 3 = bot vs bot
let lastEval=0;
const intBase=function () {
  switch(estilo){
    case 0:
    return 6;
    case 3:
    return 3;
    default:
    return 12;
  }
}(),mult=6;
//let recap=null;

function asp(o,tempoMin,tempoMax,lastEval){
  let res=null;
  let mate=Math.abs(lastEval)>=1000000000 || lastEval==0;
  n=performance.now();
  a:for(let i=1; performance.now()-n<tempoMin; i++){
    let inta=intBase,intb=intBase;
    let res2;
    while(true){
      let aspa,aspb;
      if(mate){
        aspa=-Infinity;
        aspb=Infinity;
      }
      else{
        aspa=lastEval-inta;
        aspb=lastEval+intb;
      }
      res2=melhorPlay(o,i,6,aspa,aspb,tempoMax);
      if(res2.eval==abortar){
        break a;
      }
      if(Math.abs(res2.eval)>=1000000000 || res2.eval==0){
        mate=true;
        break;
      }
      if(res2.eval<=aspa){
        console.log("fail low");
        inta*=mult;
        continue;
      }
      if(res2.eval>=aspb){
        console.log("fail high");
        intb*=mult;
        continue;
      }
      break;
    }
    res=res2;
    lastEval=res.eval;
    //res=melhorPlay(o,i,6,-Infinity,Infinity);
    console.log("Profundidade "+i+": "+(performance.now()-n)+" ms");
    console.log(res);
  }
  return res;
}

function id2(o,alpha,beta,rest,tempoMax){
  let res=null;
  n=performance.now();
  for(let i=1; i<=rest; i++){
    if(res && (res.eval==0 || Math.abs(res.eval)>=1000000000)){
      alpha=-Infinity;
      beta=Infinity;
    }
    let res2=melhorPlay(o,i,6,alpha,beta,tempoMax);
    if(res2.eval==abortar){
      break;
    }
    res=res2;
    console.log("Profundidade "+i+": "+(performance.now()-n)+" ms");
    console.log(res);
  }
  return res;
}
function id(o,alpha,beta,tempoMin,tempoMax){
  let res=null;
  n=performance.now();
  let i=1;
  for(; performance.now()-n<tempoMin; i++){
    let res2=melhorPlay(o,i,6,alpha,beta,tempoMax);
    if(res2.eval==abortar){
      break;
    }
    res=res2;
    if(res.eval==0 || Math.abs(res.eval)>=1000000000){
      alpha=-Infinity;
      beta=Infinity;
    }
    console.log("Profundidade "+i+": "+(performance.now()-n)+" ms");
    console.log(res);
  }
  res.rest=i;
  return res;
}

function multipv(o0,vacilo){
  let os=playArray(o0,false,-1,[],xeque,true);
  let legais=[];
  for(let i=0; i<os.length; i++){
    mexida(o0,os[i]);
    const cor=+!o0.cor;
    if(casaESegura(o0.pos,o0.cReis[cor],o0.lReis[cor],cor)){
      legais.push(os[i]);
    }
    desmexida(o0,os[i]);
  }
  const tmin=tempoMin/legais.length,tmax=tempoMax/legais.length;
  let rs=[];
  let best=vez==0? -Infinity: Infinity;
  let rest;
  const nn=performance.now();
  for(let i=0; i<legais.length; i++){
    mexida(o0,legais[i]);
    let res;
    if(vez==0){
      if(i==0){
        res=id(o0,best-2*vacilo,Infinity,tmin,tmax);
        rest=res.rest;
      }
      else{
        res=id2(o0,best-2*vacilo,Infinity,rest,tmax);
      }
      if(res.eval>best){
        best=res.eval;
      }
    }
    else{
      if(i==0){
        res=id(o0,-Infinity,best+2*vacilo,tmin,tmax);
        rest=res.rest;
      }
      else{
        res=id2(o0,-Infinity,best+2*vacilo,rest,tmax);
      }
      if(res.eval<best){
        best=res.eval;
      }
    }
    rs.push({eval:res.eval,mov:legais[i]});
    desmexida(o0,legais[i]);
  }
  while(performance.now()-nn<tempoMin){
    console.warn("reptil de novo");
    rest++;
    best=vez==0? -Infinity: Infinity
    for(let i=0; i<legais.length; i++){
      mexida(o0,legais[i]);
      let res;
      if(vez==0){
        n=performance.now();
        res=melhorPlay(o0,rest,6,best-2*vacilo,Infinity,tmax);
        if(res.eval!=abortar && res.eval>best){
          best=res.eval;
        }
      }
      else{
        n=performance.now();
        res=melhorPlay(o0,rest,6,-Infinity,best+2*vacilo,tmax);
        if(res.eval!=abortar && res.eval<best){
          best=res.eval;
        }
      }
      if(res.eval!=abortar) rs[i].eval=res.eval;
      desmexida(o0,legais[i]);
    }
  }
  console.log(rs);
  return rs;
}

function botplay(){
  const o={
    pos:clonarCasas(casas),
    cReis:cReis,
    lReis:lReis,
    cor:vez,
    roques:roques,
    hash:pilhaHashes[pilhaHashes.length-1]
  };
  determinarMovs(o.pos,vez);
  determinarMovs(o.pos,+!vez);

  callsDM=0;
  callsQFE=0;
  callsnm=0;
  callsq=0;
  mc=0;
  m=0;
  pruned=0;

  numPecas=[0,0];
  for(let i=0; i<8; i++){
    for(let j=0; j<8; j++){
      const x=casas[i][j];
      if(x!=null && x.id!=4 && x.id!=5){
        numPecas[x.cor]++;
      }
    }
  }

  prepareSearch(o);
  let res;
  if(estilo==4){
    const vacilo=3;
    let vr=multipv(o,vacilo);
    let best=vr[0];
    if(vez==0){
      for(let i=1; i<vr.length; i++){
        if(vr[i].eval>best.eval){
          best=vr[i];
        }
      }
    }
    else{
      for(let i=1; i<vr.length; i++){
        if(vr[i].eval<best.eval){
          best=vr[i];
        }
      }
    }
    if(Math.abs(best.eval)>=1000000000){
      res=best;
    }
    else{
      function calcDist(x){
        return Math.abs(best.eval-vr[x].eval+vacilo*(vez==0? -1: 1));
      }
      res=vr[0];
      let dist=calcDist(0);
      for(let i=1; i<vr.length; i++){
        const d2=calcDist(i);
        if(d2<dist){
          res=vr[i];
          dist=d2;
        }
      }
    }
  }
  else{
    res=asp(o,tempoMin,tempoMax,lastEval);
    lastEval=res.eval;
  }
  console.log("Chamou determinarMovs "+callsDM+" vezes, quaoFerradoEstou "+callsQFE+", e mexida "+mc);
  console.log("Pruned = "+pruned);
  console.log(o,res);

  let seq=[];
  let o2={
    pos:clonarCasas(o.pos),
    roques:clonarRoques(o.roques),
    cor:o.cor,
    cReis:[...o.cReis],
    lReis:[...o.lReis]
  }
  if(estilo==4){
    const p2=clonarCasas(o2.pos);
    determinarMovsLegais(p2,o2.cReis,o2.lReis,o2.cor);
    mexida(o2,res.mov,false);
    seq.push(toNotation(p2,o2.pos,res.mov,+!o2.cor,true));
  }
  for(let i=0; i<15; i++){
    let objTrans=transp[hash(o2.pos,o2.roques,o2.cor)%BigInt(transp.length)];
    if(objTrans && objTrans.alpha==objTrans.beta && objTrans.mov){
      if(objTrans.mov==null) break;
      const p2=clonarCasas(o2.pos);
      determinarMovsLegais(p2,o2.cReis,o2.lReis,o2.cor);
      mexida(o2,objTrans.mov,false);
      seq.push(toNotation(p2,o2.pos,objTrans.mov,+!o2.cor,true));
    }
    else{
      break;
    }
  }
  console.log(seq);

  mexida(o,res.mov,false);
  ultimaJogada=toNotation(casas,o.pos,res.mov,vez);
  roques=o.roques;

  const pos=o.pos;
  limpar(imgs);
  for(let i=0; i<8; i++){
    for(let j=0; j<8; j++){
      if(pos[i][j]!=null){
        casas[i][j]={...pos[i][j]};
        criaElPeca(casas[i][j],i,j);
      }
      else{
        casas[i][j]=null;
      }
    }
  }
  jogada();

  if(contraOBot!=3){
    addEventosDeClick();
  }
}

btnBot.addEventListener("click",function () {
  botplay();
});


// Escolha peças

const preDiv=document.querySelector("#pregame");
const loja=document.querySelector("#loja");
let imgsLoja=[],pecasEscolhidas;
let jParaI=[];
let indsPecas,totaisPecas;
let numEscolhidas;
let din;
const spanDin=document.querySelector("#moni");
const pInstrucao=document.querySelector("#seuExercito>p");
const seuExercito=document.querySelector("#imgsExercito");
const btnConfirm=document.querySelector("#confirm");
const btnRandom=document.querySelector("#exeAleat");
const btnPadrao=document.querySelector("#exePadrao");
const funcoesClick=[];

function setDin(x){
  din=x;
  spanDin.textContent=x;
}

function adicionarImgPeca(seuExercito,i,vez,num){
  const div=document.createElement("div");
  const img=document.createElement("img");
  img.src=prototiposPecas[i].imgs[vez];
  div.appendChild(img);
  const p2=document.createElement("p");
  p2.textContent="x"+num;
  div.appendChild(p2);
  seuExercito.appendChild(div);
  return div;
}

for(let i=0,j=0; i<prototiposPecas.length; i++){
  if(i!=4 && i!=5){
    const li=document.createElement("li");
    const hack=document.createElement("div");
    hack.className="interno";
    const div1=document.createElement("div");
    div1.className="info";
    imgsLoja[j]=document.createElement("img");
    imgsLoja[j].srcs=prototiposPecas[i].imgs;
    div1.appendChild(imgsLoja[j]);
    const div=document.createElement("div");
    const h2=document.createElement("h2");
    h2.textContent=prototiposPecas[i].nome;
    div.appendChild(h2);
    const preco=document.createElement("p");
    preco.textContent="Preço: "+prototiposPecas[i].preco;
    div.appendChild(preco);
    div1.appendChild(div);
    hack.appendChild(div1);
    const p=document.createElement("p");
    p.className="desc";
    p.innerHTML=prototiposPecas[i].desc;
    hack.appendChild(p);
    li.style.zIndex=prototiposPecas.length-i;
    li.appendChild(hack);
    loja.appendChild(li);
    hack.style.height=hack.clientHeight+"px";
    hack.className+=" liMenu";

    let p2;
    const k=j;
    funcoesClick[k]=function () {
      setDin(din-prototiposPecas[i].preco);
      if(pecasEscolhidas[k]==0){
        const div=adicionarImgPeca(seuExercito,i,vez,1);
        const img=div.firstChild;
        p2=div.lastChild;

        img.addEventListener("click",function () {
          setDin(din+prototiposPecas[i].preco);
          numEscolhidas--;
          pecasEscolhidas[k]--;

          if(pecasEscolhidas[k]==0){
            div.remove();
            if(numEscolhidas==0){
              pInstrucao.classList.add("oculto");
            }
          }
          else{
            p2.textContent="x"+pecasEscolhidas[k];
          }
        });

        if(numEscolhidas==0){
          pInstrucao.classList.remove("oculto");
        }
      }

      else{
        p2.textContent="x"+(pecasEscolhidas[k]+1);
      }

      pecasEscolhidas[k]++;
      numEscolhidas++;
    };

    hack.addEventListener("click",function () {
      if(prototiposPecas[i].preco<=din){
        if(numEscolhidas<7){
          funcoesClick[k]();
        }
        else{
          alert("o máximo é 7 peças");
        }
      }
      else{
        alert("dinheiro insuficiente");
      }
    });

    jParaI[j]=i;
    j++;
  }
}

const body=document.body;
btnPadrao.addEventListener("click",function () {
  resetarLoja();
  body.style.pointerEvents="none";
  const clicks=[0,0,1,1,2,2,3];
  {
    let i=0;
    const intv=setInterval(function () {
      funcoesClick[clicks[i]]();
      if(i==6){
        body.style.pointerEvents="";
        clearInterval(intv);
      }
      else{
        i++;
      }
    },143);
  }
});

let maisBarata=0,maisCara=0;
for(let i=1; i<funcoesClick.length; i++){
  if(prototiposPecas[jParaI[i]].preco<prototiposPecas[jParaI[maisBarata]].preco){
    maisBarata=i;
  }
  else if(prototiposPecas[jParaI[i]].preco>prototiposPecas[jParaI[maisCara]].preco){
    maisCara=i;
  }
}
const maiorPreco=prototiposPecas[jParaI[maisCara]].preco,menorPreco=prototiposPecas[jParaI[maisBarata]].preco;

btnRandom.addEventListener("click",function () {
  if(numEscolhidas==7 || din<menorPreco){
    resetarLoja();
  }
  body.style.pointerEvents="none";

  let clicks;
  if((7-numEscolhidas)*maiorPreco>din){
    let deNovo;
    let bonusLeniencia=0.5;
    do{
      clicks=[];
      const len=10+bonusLeniencia;
      for(let i=numEscolhidas,din2=din; ; i++){
        let precoMin=i==6? din2-len: din2-maiorPreco*(6-i);
        const res=[];

        for(let j=0; j<funcoesClick.length; j++){
          const p=prototiposPecas[jParaI[j]].preco;
          if(p>=precoMin && p<=din2){
            res.push(j);
          }
        }

        if(res.length==0){
          deNovo=true;
          bonusLeniencia*=1.5;
          break;
        }
        else{
          clicks[i-numEscolhidas]=res[Math.floor(Math.random()*res.length)];
          din2-=prototiposPecas[jParaI[clicks[i-numEscolhidas]]].preco;
          if(din2<=len){
            deNovo=false;
            break;
          }
        }
      }
    }while(deNovo);
  }
  else{
    clicks=[];
    for(let i=0; i<7-numEscolhidas; i++){
      clicks[i]=maisCara;
    }
  }

  if(clicks.length){
    let i=0;
    const intv=setInterval(function () {
      funcoesClick[clicks[i]]();
      i++;
      if(i==clicks.length){
        body.style.pointerEvents="";
        clearInterval(intv);
      }
    },143);
  }
});

function resetarLoja(){
  setDin(1000);
  numEscolhidas=0;
  imgsExercito.innerHTML="";
  pecasEscolhidas=[];
  for(let i=0; i<imgsLoja.length; i++){
    pecasEscolhidas[i]=0;
  }
  pInstrucao.className="oculto";
}

function iniciarLoja(){
  resetarLoja();

  for(let i=0; i<imgsLoja.length; i++){
    imgsLoja[i].src=imgsLoja[i].srcs[vez];
  }
}

indsPecas=[[],[]];
totaisPecas=[];
vez=0;
iniciarLoja();

btnConfirm.addEventListener("click",function () {
  indsPecas[vez]=[...pecasEscolhidas];
  totaisPecas[vez]=numEscolhidas;

  if(vez==0){
    vez=1;
    iniciarLoja();
  }
  else{
    preDiv.className="oculto";
    div.className="";
    iniciarPosic();
  }
});
