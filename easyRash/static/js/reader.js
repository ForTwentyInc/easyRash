$(document).ready(function(){
$("#daniela").hide();           //in modalità reader nascondo il ruolo dalla navbar
$("#role").hide();
$.getJSON("/wsgi/api/documents", function(result){ // con la getjson ricevo dal server l'intera lista delle confrenze
if(result.length==0){
  var tit=document.createTextNode("No conference");   //se è vuota lo inserisco nel campo conferenza della navbar e esco dalla funzione
  document.getElementById("conference").appendChild(tit);
  return;
}
  var tit=document.createTextNode(result[0].conf); //altrimenti essendo nel document ready salvo la prima conferenza
  var dropli=document.createElement("li");         //conferenza e l'aggiungo alla navbar
  var dropa=document.createElement("a");
  document.getElementById("conference").appendChild(tit);
for(var i=1;i<result.length;i++){                  //scorro result per tutta la lunghezza, cioe il numero di
  conf=result[i].conf;                              //conferenze presenti e disponibili per l'utente che fa la richiesta
  conf=conf.replace(/\s+/g, '');                    //e creo un dropdown menu dove inserisco le varie conferenze con un funzione onclick
var t=document.createTextNode(result[i].conf)       // changeconf che cambia la vsualizzazione in base alla conferenza scelta
dropli.setAttribute("id",conf);
setAttributes(dropa,{"align":"center","onclick":'Changeconf(\''+conf+'\',\''+result[i].conf+'\')'});
dropa.appendChild(t);
dropli.appendChild(dropa);
document.getElementById("dropdownmenu").appendChild(dropli);
}
Document_ready(result[0]);   //alla fine chiamo la funzione document_ready passandogli la prima conferenza
                              // e la funzione aprira il primo documento della ocnferenz e popolera i panelli
  });
});


function Document_ready(documents){   //all'inizio della funxione uso jquery per controllare la risoluzione
var width=$(window).width();          // dello shermo ed in base a quello decidocse visualizzarlo come un iframe o come un div
document.getElementById('Document_list').innerHTML=" ";
document.getElementById('docu').innerHTML=" ";         //pulisco i panelli nel caso in cui fossero stati popolati in precedenza
document.getElementById('tabs').innerHTML=" ";
for(var i=0;i<documents.docs.length;i++){              //scorro dentro la lista di documenti della conferenza
  if(documents.docs[i]!=undefined){                     // se non è vuota
    var docli=document.createElement("a");              // creo l'elemento del panello
    setAttributes(docli,{"id":'rev'+i,"onfocus":'PanelAnnotation(\''+documents.docs[i].title+'\')',"onclick":'AddRev(\''+documents.docs[i].title+'\',\''+documents.docs[i].url+'\',\''+documents.docs[i].status+'\',\''+documents.docs[i].underreview+'\',\''+documents.docs[i].saved+'\',\''+documents.chairs+'\')',"class":"list-group-item" });
    var t=document.createTextNode(documents.docs[i].title);    // con il titolo del documento
    docli.appendChild(t);                                       //e una funzione addrev che apre il documento corrispettivo nella tab
    document.getElementById('Document_list').appendChild(docli);
  }
}
if(width<700){                                    //qui avviene il controllo dellla risoluzione(mobile);
  var butinfo=document.createElement("button");   //se entra ci troveremo da mobile quindi per permettere una migliore visualizzazione creremo il documento come una div
  var butspan2=document.createElement("i");
  var ID=encodeURIComponent(documents.docs[0].title);
  var doculi=document.createElement("li");               //creo i diversi elementi della tab
  var docua=document.createElement("a");
  var t=document.createTextNode(shorten(documents.docs[0].title));//utilizzo la funzione shorten che accorcia il titolo da inserire nella tab
  var tabdiv=document.createElement("div");                       // creo i diversi elementi della div dove verra popolato il doc
  var title=document.createElement("h1");
  var titletext=document.createTextNode(documents.docs[0].title);
  var jumbodiv=document.createElement("div");
  var Body=document.createElement("body");
  butspan2.setAttribute("class","fa fa-info-circle editsave"); //creo il pulsante infodoc che on click chiama una funzione a cui passo lo status, da chi è stato e non revisionato il documento, il titolo e i chair e che popola un modale con queste info
  setAttributes(butinfo,{"onclick":'InfoDoc(\''+documents.docs[0].title+'\',\''+documents.docs[0].status+'\',"'+documents.docs[0].underreview+'",\''+documents.docs[0].saved+'\',\''+documents.chairs+'\')',"data-tooltip":"tooltip","title":"Info status document","class":"close closeTab","style":"margin-right:7px;"});
  setAttributes(docua,{"href":"#ntab0","onfocus":'PanelAnnotation(\''+documents.docs[0].title+'\')',"data-toggle":"tab","data-tooltip":"tooltip","title":documents.docs[0].title});
  docua.appendChild(t);
  doculi.appendChild(docua);
  setAttributes(tabdiv,{"id":"ntab0","class":"tab-pane fade"});
  setAttributes(jumbodiv,{"id":"jumbozio"});
  title.appendChild(titletext);
  jumbodiv.appendChild(title);
  jumbodiv.appendChild(Body);
  Body.setAttribute("id","docbody");
  $.getJSON("/wsgi/api/documents/body"+"?ID="+ID,function(result2){ //ricevo il body del doc
    Body.innerHTML=result2.Body;
    jumbodiv.appendChild(Body);
  });
  tabdiv.appendChild(jumbodiv);
  document.getElementById('docu').appendChild(doculi);
  document.getElementById('tabs').appendChild(tabdiv);
  butinfo.appendChild(butspan2);
  docua.appendChild(butinfo);
  activaTab('ntab0');
  PanelAnnotation(documents.docs[0].title);   //popolo il panello delle annotazioni presenti sul doc

}else{
var butinfo=document.createElement("button");  //se ha una risoluzione abbastanza alta crea il doc come un iframe
var butspan2=document.createElement("i");
var doculi=document.createElement("li");
var docua=document.createElement("a");
var t=document.createTextNode(shorten(documents.docs[0].title));
var tabdiv=document.createElement("div");
var tabif=document.createElement("iframe");
setAttributes(docua,{"href":"#ntab0","onfocus":'PanelAnnotation(\''+documents.docs[0].title+'\')',"data-toggle":"tab","data-tooltip":"tooltip","title":documents.docs[0].title});
butspan2.setAttribute("class","fa fa-info-circle editsave");
setAttributes(butinfo,{"onclick":'InfoDoc(\''+documents.docs[0].title+'\',\''+documents.docs[0].status+'\',"'+documents.docs[0].underreview+'",\''+documents.docs[0].saved+'\',\''+documents.chairs+'\')',"data-tooltip":"tooltip","title":"Info status document","class":"close closeTab","style":"margin-right:7px;"});
docua.appendChild(t);
doculi.appendChild(docua);
setAttributes(tabif,{"id":"frm","frameborder":"0","scrolling":"yes","src":"http://site1615.web.cs.unibo.it/"+documents.docs[0].url+""});
tabdiv.setAttribute("id","ntab0");
tabdiv.setAttribute("class","tab-pane");
tabdiv.appendChild(tabif);
document.getElementById('docu').appendChild(doculi);
document.getElementById('tabs').appendChild(tabdiv);
butinfo.appendChild(butspan2);
docua.appendChild(butinfo);
activaTab('ntab0');
PanelAnnotation(documents.docs[0].title);
}
}

function AddRev(titolo,url,status,reviewers,saved,chairs){ //addrev svolge le stesse funzioni del document ready  ma gli passiamo
  var width=$(window).width();                              // il titolo del documento da aprire e tutte le informazioni per il modal info doc

    var ul= document.getElementById("docu");
    var items=ul.getElementsByTagName("li");
    var x=0;
    var k=0;
    /*sposta il focus se la tab è gia aperta*/
    for (x;x<items.length;x++){
      if(items[x].textContent==shorten(titolo)){
        activaTab('ntab'+x);
        PanelAnnotation(titolo);
        return;
      }
    }
    if(items.length==3){$("#WindowModal").modal("show");return} // se si cerca di aprire piu di 3 tab si aprira modale
if(width<700){
  var butinfo=document.createElement("button");
  var butspan2=document.createElement("i");
  var ID=encodeURIComponent(titolo);
  var doculi=document.createElement("li");
  var docua=document.createElement("a");
  var t=document.createTextNode(shorten(titolo));
  var tabdiv=document.createElement("div");
  var title=document.createElement("h1");
  var titletext=document.createTextNode(titolo);
  var jumbodiv=document.createElement("div");
  var Body=document.createElement("body");
  butspan2.setAttribute("class","fa fa-info-circle editsave");
  setAttributes(butinfo,{"onclick":'InfoDoc(\''+titolo+'\',\''+status+'\',"'+reviewers+'",\''+saved+'\',\''+chairs+'\')',"data-tooltip":"tooltip","title":"Info status document","class":"close closeTab","style":"margin-right:7px;"});
  setAttributes(docua,{"href":"#ntab"+x,"onfocus":'PanelAnnotation(\''+titolo+'\')',"data-toggle":"tab","data-tooltip":"tooltip","title":titolo});
  docua.appendChild(t);
  butinfo.appendChild(butspan2);
  docua.appendChild(butinfo);
  doculi.appendChild(docua);
  setAttributes(tabdiv,{"id":"ntab"+x,"class":"tab-pane fade"});
  setAttributes(jumbodiv,{"id":"jumbozio"});
  title.appendChild(titletext);
  jumbodiv.appendChild(title);
  jumbodiv.appendChild(Body);
  Body.setAttribute("id","docbody");
  $.getJSON("/wsgi/api/documents/body"+"?ID="+ID,function(result2){
    Body.innerHTML=result2.Body;
    jumbodiv.appendChild(Body);
  });
  tabdiv.appendChild(jumbodiv);
  document.getElementById('docu').innerHTML=" ";
  document.getElementById('docu').appendChild(doculi);
  document.getElementById('tabs').innerHTML=" ";
  document.getElementById('tabs').appendChild(tabdiv);
  activaTab('ntab'+x);
  PanelAnnotation(titolo);

}else{
        var butinfo=document.createElement("button");
        var butspan2=document.createElement("i");
        var doculi=document.createElement("li");
        var docua=document.createElement("a");
        var t=document.createTextNode(shorten(titolo));
        var tabdiv=document.createElement("div");
        var tabif=document.createElement("iframe");
        var buttonc=document.createElement("button");
        var spanc=document.createElement("span");
        setAttributes(docua,{"href":"#ntab"+x,"onfocus":'PanelAnnotation(\''+titolo+'\')',"data-toggle":"tab","data-tooltip":"tooltip","title":titolo});
        butspan2.setAttribute("class","fa fa-info-circle editsave");
        setAttributes(butinfo,{"onclick":'InfoDoc(\''+titolo+'\',\''+status+'\',"'+reviewers+'",\''+saved+'\',\''+chairs+'\')',"data-tooltip":"tooltip","title":"Info status document","class":"close closeTab","style":"margin-right:7px;"});
        docua.appendChild(t);
        doculi.appendChild(docua);
        tabdiv.setAttribute("id",'ntab'+x);
        tabdiv.setAttribute("class","tab-pane ");
        setAttributes(tabif,{"id":"frm","frameborder":"0","scrolling":"yes","src":"http://site1615.web.cs.unibo.it/"+url+""});
        tabdiv.appendChild(tabif);
        spanc.setAttribute("class","glyphicon glyphicon-remove");
        buttonc.setAttribute("class","close closeTab");
        buttonc.setAttribute("type","button");
        buttonc.setAttribute("onclick",'RemoveTab(this,\''+titolo+'\')');
        buttonc.appendChild(spanc);
        docua.appendChild(buttonc);
          butinfo.appendChild(butspan2);
          docua.appendChild(butinfo);
        document.getElementById('docu').appendChild(doculi);
        document.getElementById('tabs').appendChild(tabdiv);
        activaTab("ntab"+x);
        PanelAnnotation(titolo);
}
}

function InfoDoc(titolo,status,underreview,saved,chairs){   // popolo e mostro il modale infodoc
  document.getElementById("statustitle").innerHTML=titolo;
  document.getElementById("statusdoc").innerHTML=status;
  document.getElementById("statusreviewers").innerHTML=underreview;
  document.getElementById("statusreviewed").innerHTML=saved;
  document.getElementById("statuschair").innerHTML=chairs;
  $("#InfoDocument").modal("show");
}

function Changeconf(element,tito){         // questa funzione viene chiamata quando quando si cambia conferenza nel dropdown menu
  var dropli=document.createElement("li");  // scambia le conferenze prensenti mettenedo la funzione change conf nella conferenza che andra nel drop down
  var dropa=document.createElement("a");
  var t1=document.getElementById("conference").innerHTML;
  var t2=element;
  var obj1;
  var titone=document.createTextNode(t1);
$.getJSON("/wsgi/api/documents", function(result){ // con la get json riceviamo l'insieme delle conferenze
for(var i=0;i<result.length;i++){                   //e creo un oggetto con la conferenza appena scelta che poi passero alla funzione
  if(tito==result[i].conf){                         // document ready che cambiarà tutti i panelli e le tab
    obj1= result[i];
  }
}
t="#"+t2;
$(t).remove();
conf=t1.replace(/\s+/g, '');
dropli.setAttribute("id",conf);
setAttributes(dropa,{"align":"center","onclick":'Changeconf(\''+conf+'\',\''+t1+'\')'});
dropa.appendChild(titone);
dropli.appendChild(dropa);
document.getElementById("conference").innerHTML=tito;
document.getElementById("dropdownmenu").appendChild(dropli);
Document_ready(obj1);
});
}

function setAttributes(el, attrs) {  // per settare piu di un attributo contemporaneamente
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}
function activaTab(tab){  // attiva lab passatogli per parametro
  $('.nav-tabs a[href="#' + tab + '"]').tab('show');
}
function shorten(text) {    // riceve il titolo e lo accorcia per una migliore visulaizzazione
  var ret = text;
  var maxLength=30;
  if (ret.length > maxLength) {
    ret = ret.substr(0,maxLength-3) + "...";
  }
  return ret;
}
function RemoveTab(element,titolo){        // questa funzione rimuove una tab aperta , gli viene passata la tab e il titolo
  var ul= document.getElementById("docu");  //se la tab è la seconda cambia l'id alla terza tab assegnandoci l'id della stessa
  var items=ul.getElementsByTagName("li");  // trova il titolo corrispondente attiva la tab successiva e la rimuove
  var tabdiv=document.getElementById("tabs")
  var div=tabdiv.getElementsByTagName("div")
  var tabID = $(element).parents('a').attr('href');
  for (var x=0;x<items.length;x++){
    if(items[x].textContent==shorten(titolo)){
      if(tabID=="#ntab1"){
        if(items[x].nextSibling!=null&&items[x].nextSibling.firstElementChild.getAttribute("href")=="#ntab2"){
          items[x].nextSibling.firstElementChild.setAttribute("href","#ntab1");
          div[x].nextSibling.setAttribute("id","ntab1");
        }
      }
      y=x-1;
      activaTab('ntab'+ y);
      PanelAnnotation($(items[y]).children("a").attr("title"));
      $(element).parents('li').remove();
      $(tabID).remove();
      return;
    }
  }
}
function PanelAnnotation(element){               //questa funzione viene chiamata quando apriamo o lmettiamo il focus su un doc
  ID=encodeURIComponent(element);                 // popola il panello annatozioni con il nome di chi ha commentato il doc
  document.getElementById('Notes_list').innerHTML ="";// se si clicca apre un modale con il commento globale e le diverse annotazioni locali
  $.get("/wsgi/api/comments"+"?ID="+ID,function(result2){
    var s1= result2.ann.length;
    for(var i=0;i<s1;i++){
      var s2 = size(result2.ann[i])-1;
      if(s2!="-1"){
      var nam= result2.ann[i][s2].name;
      var PAli=document.createElement("li");
      var PAa=document.createElement("a");
      if(result2.ann[i][0]["@type"]=="decision"){
          var t=document.createTextNode(nam+"-Chair Decision");
      }else{var t=document.createTextNode(nam);}
      PAa.setAttribute("class","list-group-item");
      PAa.setAttribute("onclick",'ShowAnnotation(\''+ID+'\',\''+nam+'\')');
          //PAa.addEventListener("click",function(){ShowAnnotation(obj,nam);});
      PAa.appendChild(t);
      PAli.appendChild(PAa);
      document.getElementById('Notes_list').appendChild(PAli);
      }
    }

  })
  .fail(function() {                                            // se il documento non ha annotazioni o commenti globali lo scrive nel pannello
    var t=document.createTextNode("No saved annotations")
    var PAli=document.createElement("li");
    PAli.setAttribute("class","list-group-item");
    PAli.appendChild(t);
    document.getElementById('Notes_list').appendChild(PAli);
  });
}

function ShowAnnotation(ID,name){                         //riceve il titolo del documento e il nome di chi lo sta visualizzando
  $.get("/wsgi/api/comments"+"?ID="+ID,function(result2){ //con la get riceviamo le annotazioni presenti sul documento e popoliamo il modale con le informazioni
    var s1= result2.ann.length;
    for(var i=0;i<=s1;i++){
      var s2 = size(result2.ann[i])-1;
      if(result2.ann[i][s2].name==name){
        document.getElementById("Globalaut").innerHTML=name;
        document.getElementById("Globaldate").innerHTML=result2.ann[i][0].article.eval.date;
        document.getElementById("Globaltext").innerHTML=result2.ann[i][0].article.eval.global;
        document.getElementById("Globalscore").innerHTML=result2.ann[i][0].article.eval.score+"/5";
        document.getElementById("Globalstatus").innerHTML=result2.ann[i][0].article.eval.status;
        document.getElementById("LocalComment").innerHTML=" ";
        for (var x=1;x<=s2;x++){
        if(result2.ann[i]!=undefined){
          if(result2.ann[i][x]["@type"]=="comment"||result2.ann[i][x]["@type"]=="decision"){
          var commentli=document.createElement("li");
          var commenta=document.createElement("a");
          var strong=document.createElement("strong");
          var br=document.createElement("br");
          var t=document.createTextNode(result2.ann[i][x]["@id"]);
          var tex=document.createTextNode(result2.ann[i][x].text);
          strong.setAttribute("float","left");
          strong.appendChild(t);
          //commenta.setAttribute("href"," ");
          id =result2.ann[i][x]["@id"];
          text=result2.ann[i][x].text;
          date=result2.ann[i][x].date;
          setAttributes(commenta,{"onclick":'ShowSingleA(\''+id+'\',\''+date+'\',\''+name+'\',"'+text+'")'});
          //commenta.addEventListener("click",function(){ShowSingleA(obj[i]);});
          commenta.appendChild(strong);
          commenta.appendChild(br);
          commenta.appendChild(tex);
          commentli.appendChild(commenta);
          document.getElementById("LocalComment").appendChild(commentli);
        }
     }else{return}
        }
      }
    }
});
  $("#GlobalModal").modal("show");
}

function ShowSingleA (id,date,name,text){ // quando nel modale clicchiamo sul singolo commento si aprira un alro modal con le informazioni delle singole annotazioni
  $("#GlobalModal").modal("hide");
  document.getElementById("ModalTitle").innerHTML=id;
  document.getElementById("Maut").innerHTML=name;
  document.getElementById("Mdate").innerHTML=date;
  document.getElementById("Mtext").innerHTML=text;
  $("#myModal").modal("show");
}

function size (result){
  var s1=0;
  var x;
  for(x in result){
    s1++;
  }
  return s1
}
