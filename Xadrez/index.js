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

function fnValorPadrao(pos,c,l){
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
  [90,  90,  90,  90,  90,  90,  90,  90],
  [2,   3.5, 7.5, 12,  12,  7.5, 3.5, 2],
  [-1,  1,   5,   8,   8,   5,   1,   -1],
  [-3,  -1.5,3,   6,   6,   3,   0,   -1.5],
  [-3,  -1.5,1.5, 4.5, 4.5, 1.5, 9,   9],
  [-3,  -1.5,1.5, 3,   3,   9,   12,  9],
  [0,   0,   0,   0,   0,   0,   0,   0]
]/*[
[0,   0,   0,   0,   0,   0,   0,   0],[0,   0,   0,   0,   0,   0,   0,   0],[0,   0,   0,   0,   0,   0,   0,   0],[0,   0,   0,   0,   0,   0,   0,   0],[0,   0,   0,   0,   0,   0,   0,   0],[0,   0,   0,   0,   0,   0,   0,   0],[0,   0,   0,   0,   0,   0,   0,   0],[0,   0,   0,   0,   0,   0,   0,   0]
]*/;

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
      return pos[i][j].mob*0+this.preco;
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
      return pos[i][j].mob*0+this.preco;
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
      return pos[i][j].mob*0+this.preco;
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
      return pos[i][j].mob*0+this.preco;
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
    preco:999999,
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
    fnValor:function (pos,i,j) {
      return this.preco+mp[pos[i][j].cor==0? 7-j: j][i];
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

const durTrans=200;

let casas;
let vez; // 0=branco, 1=preto
let tilesPodeMover,cPecaClicada,lPecaClicada;
let lReis,cReis;
let xeque;
let roques;
let boardStates;
let ultimaJogada;
let jogadas,plays;
let jogEmExibicao;
let enPassant,podeEnPassant;
let regra50jog,rep3;


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
      const o=casas[i][j];
      if(casas[i][j]==null){
        cloneCasas[i][j]=null;
      }
      else{
        cloneCasas[i][j]={
          cor:o.cor,
          id:o.id,
          mob:o.mob
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

function repetiu3vezes(){
  let reps=0;
  for(let i=playQueComecou+vez+1; i<boardStates.length-1; i+=2){
    if(equals(podeEnPassant,boardStates[i].podeEnPassant) && (podeEnPassant.length==0 || boardStates[i].enPassant==enPassant)){
      let iguais=true;
      for(let j=0; j<2; j++){
        for(let k=0; k<2; k++){
          if(boardStates[i].roques[j][k]!=roques[j][k]){
            iguais=false;
            break;
          }
        }
      }

      if(iguais){
        a:for(let j=0; j<8; j++){
          for(let k=0; k<8; k++){
            const casa=boardStates[i].pos[j][k];
            if(casa==null){
              if(casas[j][k]!=null){
                iguais=false;
                break a;
              }
            }
            else if(casas[j][k]==null){
              iguais=false;
              break a;
            }
            else{
              if(casa.id!=casas[j][k].id || casa.cor!=casas[j][k].cor){
                iguais=false;
                break a;
              }
            }
          }
        }
      }

      if(iguais){
        if(reps==1){
          return true;
        }
        else{
          reps++;
        }
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
  if(numMovs==0 && podeEnPassant.length==0){
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
    if(rep3==0 && repetiu3vezes()){
      rep3=plays+1;
    }
    if(rep3>0 || regra50jog>=100){
      btnEmpate.removeAttribute("disabled");
    }
  }

  addNotacaoJogada(ultimaJogada,vez==1);
  atualizarClasseVez();
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
  playQueComecou=plays;
  cReis=[4,4];
  lReis=[0,7];
  roques=[[],[]];
  verRoques();
  regra50jog=0;
  enPassant=null;
  podeEnPassant=[];
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
  casas=matriz8x8(null);
  tilesPodeMover=[];
  boardStates=[];
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
  saveState();

  if(totaisPecas[0]==0 && totaisPecas[1]==0){
    inicVarsDeJogo();
    iniciar();
    start();
  }
  else{
    iniciarSelecao();
  }
}


function iniciar(){
  terminarSelecao();
  determinarMovsLegais(casas,cReis,lReis,vez);
  atualizarClasseVez();
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

function quaoFerradoEstou(pos){
  callsQFE++;
  let res=0;
  for(let i=0; i<8; i++){
    for(let j=0; j<8; j++){
      if(pos[i][j]!=null){
        res+=prototiposPecas[pos[i][j].id].fnValor(pos,i,j)*(pos[i][j].cor==0? 1: -1);
      }
    }
  }
  if(isNaN(res)){
    throw Error("DEU UM SUPER PAU");
  }
  return res;
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

function mexida(o,mov){
  const pos=clonarCasas(o.pos);
  const cor=o.cor;
  const eRoque=mov.cOrig==casaOrigRoque;
  const cOrig=eRoque? 4: mov.cOrig;
  let roques,cReis,lReis;

  const cp=pos[cOrig][mov.lOrig];
  pos[cOrig][mov.lOrig]=null;
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
    if(cor==0){
      roques=[[false,false],[...o.roques[1]]];
      cReis=[mov.cDest,o.cReis[1]];
      lReis=[mov.lDest,o.lReis[1]];
    }
    else{
      roques=[[...o.roques[0]],[false,false]];
      cReis=[o.cReis[0],mov.cDest];
      lReis=[o.lReis[0],mov.lDest];
    }
  }

  else{
    if(cOrig==o.cReis[cor] && mov.lOrig==o.lReis[cor]){
      if(cor==0){
        roques=[[false,false],[...o.roques[1]]];
        cReis=[mov.cDest,o.cReis[1]];
        lReis=[mov.lDest,o.lReis[1]];
      }
      else{
        roques=[[...o.roques[0]],[false,false]];
        cReis=[o.cReis[0],mov.cDest];
        lReis=[o.lReis[0],mov.lDest];
      }
    }

    else{
      cReis=[...o.cReis];
      lReis=[...o.lReis];
      roques=[];
      for(let i=0; i<2; i++){
        if(cor==i && mov.lOrig==7*i){
          roques[i]=[];
          for(let j=0; j<2; j++){
            roques[i][j]=o.roques[i][j] && !mov.cOrig==7*j;
          }
        }
        else{
          roques[i]=[...o.roques[i]];
        }
      }
    }
  }
  return{
    cor:+!cor,
    pos:pos,
    roques:roques,
    cReis:cReis,
    lReis:lReis,
    mov:mov,
    eCapt:o.pos[mov.cDest][mov.lDest]!=null
  }
}

let transp=new Array(1048576);

const allNode=0,cutNode=1,exactNode=2;
const casaOrigRoque=8; // Valor de casaOrig quando a jogada for um roque

function reiMorto(pos,cReis,lReis,cor){
  const casaRei=pos[cReis[cor]][lReis[cor]];
  return(casaRei==null || casaRei.cor!=cor);
}

function movsIguais(n,m){
  return n.cOrig==m.cOrig && n.lOrig==m.lOrig && n.cDest==m.cDest && n.lDest==m.lDest && n.id==m.id;
}

let callsDM,callsQFE;
function melhorPlay(o0,nrest,qrest,aspa,aspb){
  // Posição bem legal   r2qkbnr/ppp2ppp/2np4/4p2b/2B1P3/2N2N1P/PPPP1PP1/R1BQK2R w KQkq - 0 5

  function add2transp(o1,mov,rest,_eval,nodeType){
    const h=hash(o1.pos,o1.roques,o1.cor);
    const o={
      hash:h,
      rest:rest,
      eval:_eval,
      mov:mov,
      nodeType:nodeType
    };
    transp[h%BigInt(transp.length)]=o;
    return o;
  }

  let provaveis=[];
  for(let i=0; i<nrest; i++){
    provaveis[i]=[];
  }
  let melhor;

  function novaProvavel(rest,o){
    if(!o.eCapt){
      let i=rest-1;
      for(let j=0; j<provaveis[i].length; j++){
        if(movsIguais(provaveis[i][j],o.mov)){
          return;
        }
      }
      if(provaveis[i][0]){
        provaveis[i][1]=provaveis[i][0];
      }
      provaveis[i][0]=o.mov;
    }
  }

  function playArray(o,qui,provs,jp){
    const pos=o.pos;
    const cor=o.cor;
    const cReis=o.cReis;
    const lReis=o.lReis;
    const roques=o.roques;
    determinarMovs(pos,cor);
    let os=[];
    os.reiComido=false;
    const outraCor=+!cor;

    function pushDM(o){
      for(let i=0; i<jp.length; i++){
        if(movsIguais(o.mov,jp[i].mov)){
          return false;
        }
      }
      if(reiMorto(o.pos,o.cReis,o.lReis,outraCor)){
        os.reiComido=true;
      }
      os.push(o);
      return os.reiComido;
    }

    if(!qui){
      for(let i=0,j=-1; i<2; i++,j+=2){
        if(roques[cor][i]){
          const linha=cor*7,col=i*7;
          if(checkRoque(pos,cor,j,col,linha)){
            const posRei=4+2*j,posTorre=4+j;
            const nroques=[],ncReis=[];
            nroques[cor]=[false,false];
            nroques[outraCor]=[...roques[outraCor]];
            ncReis[cor]=posRei;
            ncReis[outraCor]=cReis[outraCor];

            const npos=clonarCasas(pos);
            npos[posRei][linha]=npos[4][linha];
            npos[4][linha]=null;
            npos[posTorre][linha]=npos[col][linha];
            npos[col][linha]=null;

            const o={
              pos:npos,
              cReis:ncReis,
              lReis:[...lReis],
              cor:outraCor,
              roques:nroques,
              eCapt:false
            }
            if(provs){
              o.mov={
                cOrig:casaOrigRoque,
                lOrig:linha,
                cDest:posRei,
                lDest:linha,
                id:4
              };
            }
            if(pushDM(o)) return os;
          }
        }
      }
    }

    function addMov(i,j,k,m,n,o){
      if(provs){
        o.mov={
          cOrig:i,
          lOrig:j,
          cDest:k,
          lDest:m,
          id:n
        };
      }
    }

    for(let i=0; i<8; i++){
      for(let j=0; j<8; j++){
        if(pos[i][j]!=null && pos[i][j].cor==cor){
          for(let k=0; k<8; k++){
            for(let m=0; m<8; m++){
              if(pos[i][j].movs[k][m] && (!qui || pos[k][m]!=null)){
                let ncReis=[],nlReis=[],nroques=[];

                if(pos[i][j].id==4){
                  ncReis[cor]=k;
                  nlReis[cor]=m;
                  ncReis[outraCor]=cReis[outraCor];
                  nlReis[outraCor]=lReis[outraCor];
                  nroques[cor]=[false,false];
                }
                else{
                  ncReis=[...cReis];
                  nlReis=[...lReis];
                  nroques[cor]=[...roques[cor]];
                  if(j==cor*7){
                    if(i==0){
                      nroques[cor][0]=false;
                    }
                    else if(i==7){
                      nroques[cor][1]=false;
                    }
                  }
                }
                nroques[outraCor]=[...roques[outraCor]];

                if(pos[i][j].id==5 && m==7*(+!cor)){
                  for(let n=0; n<=3; n++){
                    const npos=clonarCasas(pos);
                    npos[i][j]=null;
                    npos[k][m]={
                      id:n,
                      cor:pos[i][j].cor,
                      mob:pos[i][j].mob
                    };

                    const o={
                      pos:npos,
                      cReis:ncReis,
                      lReis:nlReis,
                      cor:outraCor,
                      roques:nroques,
                      eCapt:pos[k][m]!=null
                    };
                    let ganhoCapt=o.eCapt? prototiposPecas[pos[k][m].id].fnValor(pos,k,m): 0;
                    o.saldo=ganhoCapt+prototiposPecas[npos[k][m].id].fnValor(npos,k,m)-prototiposPecas[pos[i][j].id].fnValor(pos,i,j);

                    addMov(i,j,k,m,n,o);
                    if(pushDM(o)) return os;
                  }
                }

                else{
                  const npos=clonarCasas(pos);
                  npos[i][j]=null;
                  npos[k][m]={
                    id:pos[i][j].id,
                    cor:pos[i][j].cor,
                    mob:pos[i][j].mob
                  };

                  const o={
                    pos:npos,
                    cReis:ncReis,
                    lReis:nlReis,
                    cor:outraCor,
                    roques:nroques,
                    eCapt:pos[k][m]!=null
                  };
                  let ganhoCapt=o.eCapt? prototiposPecas[pos[k][m].id].fnValor(pos,k,m): 0;
                  o.saldo=ganhoCapt+prototiposPecas[npos[k][m].id].fnValor(npos,k,m)-prototiposPecas[pos[i][j].id].fnValor(pos,i,j);

                  addMov(i,j,k,m,pos[i][j].id,o);
                  if(pushDM(o)) return os;
                }
              }
            }
          }
        }
      }
    }

    if(os.length==0) return os;
    function evalTurn(i){
      if(provs){
        for(let j=0; j<provs.length; j++){
          if(movsIguais(os[i].mov,provs[j])){
            return 26-j;
          }
        }
      }
      return os[i].saldo;
    }
    for(let i=0; i<os.length; i++){
      os[i].eval=evalTurn(i);
    }
    for(let i=0; i<os.length; i++){
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

  function quiesce(o,rest,alpha,beta){
    if(rest==0){
      return quaoFerradoEstou(o.pos);
    }
    const cor=o.cor;
    determinarMovs(o.pos,cor);
    let os=playArray(o,true,null,[]);
    if(os.length==0){
      return quaoFerradoEstou(o.pos);
    }
    if(os.reiComido){
      return (1000000000+rest)*(cor==0? 1: -1);
    }

    let max;
    if(cor==0){
      max=quaoFerradoEstou(o.pos);
      if(max>alpha){
        alpha=max;
      }
      if(beta<=alpha){
        return max;
      }
      for(let i=0; i<os.length; i++){
        const res=quiesce(os[i],rest-1,alpha,beta);
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
      max=quaoFerradoEstou(o.pos);
      if(max<beta){
        beta=max;
      }
      if(beta<=alpha){
        return max;
      }
      for(let i=0; i<os.length; i++){
        const res=quiesce(os[i],rest-1,alpha,beta);
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

  function negamax(o,rest,alpha,beta){
    if(rest==0){
      return quiesce(o,qrest,alpha,beta);
    }
    const cor=o.cor;
    const a0=alpha,b0=beta;
    const first=rest==nrest;

    const hashDesse=hash(o.pos,o.roques,cor);
    const objTrans=transp[hashDesse%BigInt(transp.length)];
    let os=[],jogadaPrioritaria=null;
    if(objTrans){
      if(hashDesse==objTrans.hash){
        let nenhumaJogPresta=objTrans.nodeType==allNode;
        if(objTrans.rest>=rest){
          if(objTrans.nodeType==exactNode){
            if(first) melhor=objTrans.mov;
            return objTrans.eval;
          }
          if(!nenhumaJogPresta && objTrans.mov===null) throw Error("DEU BIZIU");
          if(cor==nenhumaJogPresta){
            if(objTrans.eval<=alpha){
              return objTrans.eval;
            }
          }
          else{
            if(alpha<=objTrans.eval){
              return objTrans.eval;
            }
          }
        }

        else if(!nenhumaJogPresta){
          jogadaPrioritaria=objTrans.mov;
        }
      }
    }

    let max=Infinity*(cor==0? -1: 1),imax;

    if(jogadaPrioritaria){
      let posJP=mexida(o,jogadaPrioritaria);
      max=negamax(posJP,rest-1,alpha,beta);
      imax=0;
      os.push(posJP);

      if(cor==0){
        if(max>alpha){
          alpha=max;
        }
        if(beta<=alpha){
          //if(beta==aspb)console.log("cucucu");
          objTrans.rest=rest;
          novaProvavel(rest,posJP);
          if(first) melhor=objTrans.mov;
          return max;
        }
      }

      else{
        if(max<beta){
          beta=max;
        }
        if(beta<=alpha){
          //if(alpha==aspb)console.log("cucucu");
          objTrans.rest=rest;
          novaProvavel(rest,posJP);
          if(first) melhor=objTrans.mov;
          return max;
        }
      }
    }

    const novas=playArray(o,false,provaveis[rest-1],os);
    if(novas.reiComido){
      const max=(1000001000+rest)*(cor==0? 1: -1);
      if(first) melhor=novas[novas.length-1].mov;
      add2transp(o,novas[novas.length-1].mov,99,max,exactNode);
      return max;
    }

    let numVelhas=os.length;
    for(let i=numVelhas,j=0; j<novas.length; i++,j++){
      os[i]=novas[j];
    }

    if(cor==0){
      for(let i=numVelhas; i<os.length; i++){
        const res=negamax(os[i],rest-1,alpha,beta);
        if(res>max){
          max=res;
          imax=i;
          if(max>alpha){
            alpha=max;
          }
        }
        if(beta<=alpha){
          //if(beta==aspb)console.log("cucucu");
          novaProvavel(rest,os[i]);
          if(first) melhor=os[i].mov;
          add2transp(o,os[i].mov,rest,max,cutNode);
          return max;
        }
      }
    }

    else{
      for(let i=numVelhas; i<os.length; i++){
        const res=negamax(os[i],rest-1,alpha,beta);
        if(res<max){
          max=res;
          imax=i;
          if(max<beta){
            beta=max;
          }
        }
        if(beta<=alpha){
          //if(alpha==aspb)console.log("cucucu");
          novaProvavel(rest,os[i]);
          if(first) melhor=os[i].mov;
          add2transp(o,os[i].mov,rest,max,cutNode);
          return max;
        }
      }
    }

    if(first) melhor=os[imax].mov;
    if(alpha>a0 || beta<b0){
      //if(alpha!=a0 && beta!=b0) throw Error("DEU PANE "+a0+" "+b0+" "+alpha+" "+beta);
      add2transp(o,os[imax].mov,rest,max,exactNode);
    }
    else{
      add2transp(o,null,rest,max,allNode);
    }
    return max;
  }

  return{
    eval:negamax(o0,nrest,aspa,aspb),
    mov:melhor
  }
}

function toNotation(p0,p,mov,cor){
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
      ultimaJogada+=colunaParaLetra(mov.Dest)+(mov.lDest+1)+"="+imgPeca(mov.id,cor,true);
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
      return(ePeao? "": imgPeca(p0[mov.cOrig][mov.lOrig].id,cor))+stringDif+stringCapt+colunaParaLetra(mov.cDest)+(mov.lDest+1);
    }
  }
}

let tempoMin=5000,tempoMax=50000;
let lastEval=0;
btnBot.addEventListener("click",function () {
  limpar(imgs);
  callsDM=0;
  callsQFE=0;
  const n=performance.now();
  let res=null,i=1;
  const intBase=Infinity,mult=4;
  determinarMovs(casas,+!vez);
  const o0={
    pos:casas,
    cReis:cReis,
    lReis:lReis,
    cor:vez,
    roques:roques
  };
  for(; i<=6/* && performance.now()-n<tempoMin*/; i++){
    let inta=intBase,intb=intBase;
    while(true){
      const aspa=lastEval-inta,aspb=lastEval+intb;
      res=melhorPlay(o0,i,6,aspa,aspb);
      if(Math.abs(res.eval)>=1000000000){
        break;
      }
      if(res.eval<=aspa){
        console.log("fail low");
        inta*=mult;
        continue;
      }
      if(res.eval>=aspb){
        console.log("fail high");
        intb*=mult;
        continue;
      }
      break;
    }
    lastEval=res.eval;
    console.log("Profundidade "+i+": "+(performance.now()-n)+" ms");
    console.log(res);

    /*// Obter sequência prevista (DEBUG)
    let seq=[];
    for(let o=o0;;){
      let objTrans=transp[hash(o.pos,o.roques,o.cor)%BigInt(transp.length)];
      if(objTrans && objTrans.nodeType==exactNode){
        determinarMovsLegais(o.pos,o.cReis,o.lReis,+!o.cor);
        determinarMovsLegais(o.pos,o.cReis,o.lReis,o.cor);
        const o2=mexida(o,objTrans.mov);
        seq.push(toNotation(o.pos,o2.pos,objTrans.mov,o.cor));
        o=o2;
      }
      else{
        break;
      }
    }
    console.log(seq);*/
  }
  console.log("Chamou determinarMovs "+callsDM+" vezes e quaoFerradoEstou "+callsQFE);
  const o=mexida(o0,res.mov);
  ultimaJogada=toNotation(casas,o.pos,res.mov,vez);

  const pos=o.pos;
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
  roques=o.roques;
  cReis=o.cReis;
  lReis=o.lReis;
  jogada();
  addEventosDeClick();
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
