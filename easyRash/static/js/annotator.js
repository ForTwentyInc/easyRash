$(document).ready(function(){
  var chair;
//inserisce la prima conferenza nel campo conference e popola il drop down con quelle restanti, inviando un booleano per sapere se è chair o meno
  $.getJSON("/wsgi/api/documents", function(result){
    if(result.length==0){
      var tit=document.createTextNode("No conference");
      document.getElementById("conference").appendChild(tit);
      return;
    }
    for(var i=0;i<result[0].chairs.length;i++){

      if (result[0].chairs[i]==document.getElementById("Panelcheck").innerHTML){
        chair=true;
        var tit=document.createTextNode(result[0].conf);
        var dropli=document.createElement("li");
        var dropa=document.createElement("a");
        document.getElementById("conference").appendChild(tit);
      for(var x=1;x<result.length;x++){
        conf=result[x].conf;
        conf=conf.replace(/\s+/g, '');
      var t=document.createTextNode(result[x].conf)
      dropli.setAttribute("id",conf);
      setAttributes(dropa,{"align":"center","onclick":'Changeconf(\''+conf+'\',\''+result[x].conf+'\')'});
      dropa.appendChild(t);
      dropli.appendChild(dropa);
      document.getElementById("dropdownmenu").appendChild(dropli);}
        Document_ready(result[0],chair);
        return
      }else{
        chair=false;
      }
}
var tit=document.createTextNode(result[0].conf);
var dropli=document.createElement("li");
var dropa=document.createElement("a");
document.getElementById("conference").appendChild(tit);
for(var x=1;x<result.length;x++){
conf=result[x].conf;
conf=conf.replace(/\s+/g, '');
var t=document.createTextNode(result[x].conf)
dropli.setAttribute("id",conf);
setAttributes(dropa,{"align":"center","onclick":'Changeconf(\''+conf+'\',\''+result[x].conf+'\')'});
dropa.appendChild(t);
dropli.appendChild(dropa);
document.getElementById("dropdownmenu").appendChild(dropli);}
  Document_ready(result[0],chair);
  });

});
//modifica la conferenza corrente con quella clickata invertendola
function Changeconf(element,tito){
  var dropli=document.createElement("li");
  var dropa=document.createElement("a");
  var t1=document.getElementById("conference").innerHTML;
  var t2=element;
  var obj1;
  var chair=false;
  var titone=document.createTextNode(t1);
$.getJSON("/wsgi/api/documents", function(result){
for(var i=0;i<result.length;i++){
  if(tito==result[i].conf){
    obj1= result[i];
    for(var x=0;x<result[i].chairs.length;x++){
      if(result[i].chairs[x]==document.getElementById("Panelcheck").innerHTML){
        chair=true;
      }
    }
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
Document_ready(obj1,chair);
});

}

//inizializza la pagina di annotator caricando i documenti in base alla conferenza e popolando il pannello dei documenti in base al lora status se l utente è chair
function Document_ready(documents,bool){
$("#Unsaved").hide();
var styley=document.createTextNode(".saved {background-color:yellow;} .unsaved {background-color:#95B9C7}");
$("style").append(styley);
if(bool==true){//se chair
  $("#under_review").show();
  $("#Decided").show();
  $("#Awaiting_decision").show();
  document.getElementById("role").innerHTML="Chair";
  document.getElementById('under_rev').innerHTML=" ";
  document.getElementById('Awaiting_dec').innerHTML=" ";
  document.getElementById('Deci').innerHTML=" ";
  document.getElementById('Docs').innerHTML=" ";
  document.getElementById('docu').innerHTML=" ";
  document.getElementById('tabs').innerHTML=" ";
  for(var i=0;i<documents.docs.length;i++){
    if(documents.docs[i]!=undefined){
      if(documents.docs[i].status=="awaiting_decision"){
      var docli=document.createElement("a");
      setAttributes(docli,{"id":'rev'+i,"onfocus":'PanelAnnotation(\''+documents.docs[i].title+'\')',"onclick":'AddRev(\''+documents.docs[i].title+'\',\''+documents.docs[i].url+'\',\''+documents.docs[i].status+'\',\''+documents.docs[i].underreview+'\',\''+documents.docs[i].saved+'\',\''+documents.chairs+'\')',"class":"list-group-item dropdis" });
      var t=document.createTextNode(documents.docs[i].title);
      docli.appendChild(t);
      document.getElementById('awaiting_dec').appendChild(docli);}

      if(documents.docs[i].status=="pso:accepted-for-publication"||documents.docs[i].status=="pso:rejected-for-publication"){
      var docli=document.createElement("a");
      setAttributes(docli,{"id":'rev'+i,"onfocus":'PanelAnnotation(\''+documents.docs[i].title+'\')',"onclick":'AddRev(\''+documents.docs[i].title+'\',\''+documents.docs[i].url+'\',\''+documents.docs[i].status+'\',\''+documents.docs[i].underreview+'\',\''+documents.docs[i].saved+'\',\''+documents.chairs+'\')',"class":"list-group-item dropdis" });
      var t=document.createTextNode(documents.docs[i].title);
      docli.appendChild(t);
      document.getElementById('Deci').appendChild(docli);}

      if(documents.docs[i].status=="underreview"){
      var docli=document.createElement("a");
      setAttributes(docli,{"id":'rev'+i,"onfocus":'PanelAnnotation(\''+documents.docs[i].title+'\')',"onclick":'AddRev(\''+documents.docs[i].title+'\',\''+documents.docs[i].url+'\',\''+documents.docs[i].status+'\',\''+documents.docs[i].underreview+'\',\''+documents.docs[i].saved+'\',\''+documents.chairs+'\')',"class":"list-group-item dropdis" });
      var t=document.createTextNode(documents.docs[i].title);
      docli.appendChild(t);
      document.getElementById('under_rev').appendChild(docli);}
    }
  }

}else{//non chair popola il pannello co i documenti annotabili e senza status
      document.getElementById("role").innerHTML="Reviewer";
      var check=false;
      document.getElementById('under_rev').innerHTML=" ";
      document.getElementById('Awaiting_dec').innerHTML=" ";
      document.getElementById('Deci').innerHTML=" ";
      document.getElementById('Docs').innerHTML=" ";
      document.getElementById('docu').innerHTML=" ";
      document.getElementById('tabs').innerHTML=" ";
      $("#under_review").hide();
      $("#Decided").hide();
      $("#Awaiting_decision").hide();
      for(var i=0;i<documents.docs.length;i++){
        if(documents.docs[i]!=undefined){

          for(var x=0;x<documents.docs[i].reviewers.length;x++){
            if(documents.docs[i].reviewers[x]==document.getElementById("Panelcheck").innerHTML){//se l utente è tra i Reviewer del documento popola il pannello
              var docli=document.createElement("a");
              setAttributes(docli,{"id":'rev'+i,"onfocus":'PanelAnnotation(\''+documents.docs[i].title+'\')',"onclick":'AddRev(\''+documents.docs[i].title+'\',\''+documents.docs[i].url+'\',\''+documents.docs[i].status+'\',\''+documents.docs[i].underreview+'\',\''+documents.docs[i].saved+'\',\''+documents.chairs+'\')',"class":"list-group-item dropdis" });
              var t=document.createTextNode(documents.docs[i].title);
              docli.appendChild(t);
              document.getElementById('Docs').appendChild(docli);
              if(check==false){
                tile=documents.docs[i].title;
                status=documents.docs[i].status;
                saved=documents.docs[i].saved;
                reviewers=documents.docs[i].reviewers;
                unsaved=documents.docs[i].underreview;
                chairs=documents.chairs;
                check=true;
              }
            }
          }

        }
      }
    }

  if(bool==true){//se chair inizalizza la tab con il primo documento
  var butinfo=document.createElement("button");
  var butspan2=document.createElement("i");
  var ID=encodeURIComponent(documents.docs[0].title);
  var doculi=document.createElement("li");
  var docua=document.createElement("a");
  var t=document.createTextNode(shorten(documents.docs[0].title));
  var tabdiv=document.createElement("div");
  var title=document.createElement("h1");
  var titletext=document.createTextNode(documents.docs[0].title);
  var jumbodiv=document.createElement("div");
  var Body=document.createElement("body");
  butspan2.setAttribute("class","fa fa-info-circle editsave");
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
  $.getJSON("/wsgi/api/documents/body"+"?ID="+ID,function(result2){
    Body.innerHTML=result2.Body;
    jumbodiv.appendChild(Body);
  });
  tabdiv.appendChild(jumbodiv);
  document.getElementById('docu').appendChild(doculi);
  document.getElementById('tabs').appendChild(tabdiv);
  butinfo.appendChild(butspan2);
  docua.appendChild(butinfo);
  activaTab('ntab0');
  PanelAnnotation(documents.docs[0].title);
}else{//se non chair controlla che il primo documento passato da inizializzare ha già ricevuto una decisione dal chair se è così non permette di cliccare il lock per annotare
  if(status=="pso:accepted-for-publication"||status=="pso:rejected-for-publication"){
  $("#toggle_event_editing").addClass("disabled","disabled");
  }else{$("#toggle_event_editing").removeClass("disabled");}

  var butinfo=document.createElement("button");
  var butspan2=document.createElement("i");
  var ID=encodeURIComponent(tile);
  var doculi=document.createElement("li");
  var docua=document.createElement("a");
  var t=document.createTextNode(shorten(tile));
  var tabdiv=document.createElement("div");
  var title=document.createElement("h1");
  var titletext=document.createTextNode(tile);
  var jumbodiv=document.createElement("div");
  var Body=document.createElement("body");
  butspan2.setAttribute("class","fa fa-info-circle editsave");
  setAttributes(butinfo,{"onclick":'InfoDoc(\''+tile+'\',\''+status+'\',"'+unsaved+'",\''+saved+'\',\''+chairs+'\')',"data-tooltip":"tooltip","title":"Info status document","class":"close closeTab","style":"margin-right:7px;"});
  setAttributes(docua,{"href":"#ntab0","onfocus":'PanelAnnotation(\''+tile+'\')',"data-toggle":"tab","data-tooltip":"tooltip","title":tile});
  docua.appendChild(t);
  doculi.appendChild(docua);
  setAttributes(tabdiv,{"id":"ntab0","class":"tab-pane fade"});
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
  document.getElementById('docu').appendChild(doculi);
  document.getElementById('tabs').appendChild(tabdiv);
  butinfo.appendChild(butspan2);
  docua.appendChild(butinfo);
  activaTab('ntab0');
  PanelAnnotation(tile);

}
}

//Apre un nuovo documento sostituendo il precedente
function AddRev(titolo,url,status,reviewers,saved,chairs){
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
    //se il chair ha preso una decision sul documento non permette di fare lock sul documento
    if(document.getElementById("role").innerHTML=="Reviewer"){
      if(status=="pso:accepted-for-publication"||status=="pso:rejected-for-publication"){
        $("#toggle_event_editing").addClass("disabled","disabled");
      }else{$("#toggle_event_editing").removeClass("disabled");}
    }
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
}
//mostra la singola annotazione cliccata sul modale dell annotazione globale salvata
function ShowSingleA (id,date,name,text){
  $("#GlobalModal").modal("hide");
  document.getElementById("ModalTitle").innerHTML=id;
  document.getElementById("Maut").innerHTML=name;
  document.getElementById("Mdate").innerHTML=date;
  var unsul= document.getElementById("Notes_list");
  var unit=unsul.getElementsByTagName("li")
  if($("#toggle_event_editing").find("button").eq(0).hasClass('btn-default')){
  for(var i=0;i<unit.length;i++){
    if(document.getElementById("Panelcheck").innerHTML==name){
      document.getElementById("Mtext").innerHTML=" ";
      textarea=document.createElement("textarea");
      button=document.createElement("button");
      tb=document.createTextNode("Edit")
      setAttributes(button,{"class":"btn btn-primary btn-block","onclick":"EditSave()","style":"margin-top:10px;"});
      button.appendChild(tb);
      textarea.setAttribute("id","EditSave");
      textarea.setAttribute("class","form-control")
      textarea.innerHTML=text;
      document.getElementById("Mtext").appendChild(textarea);
      document.getElementById("Mtext").appendChild(button);
      $("#myModal").modal("show");
      return
      }
  }
}
  document.getElementById("Mtext").innerHTML=text;
  $("#myModal").modal("show");
}
//modifica il testo e la data di un commento già salvato sul documento
function EditSave(){
  var ul= document.getElementById("docu");
  var items=ul.getElementsByTagName("li");
  tit=$(items[0]).children("a").attr("title");
  var newdate=new Date().toLocaleString();
  var formData = {IDdoc:tit,id:document.getElementById("ModalTitle").innerHTML,annotation:document.getElementById("Mtext").firstElementChild.value,date:newdate,type:"update"};
$.ajax({
    url : "/wsgi/api/comments",
    method: "POST",
    data : formData,
    })
    .always(function() {
        $("#myModal").modal("hide");
    });

}
//popola il pannello delle persone che hanno annotato il documento
function PanelAnnotation(element){
  ID=encodeURIComponent(element);
  document.getElementById('Notes_list').innerHTML ="";
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
      PAa.setAttribute("onclick",'ShowAnnotation(this,\''+ID+'\',\''+nam+'\')');
      PAa.appendChild(t);
      PAli.appendChild(PAa);
      document.getElementById('Notes_list').appendChild(PAli);
      }
    }

  })
  //se non sono presente annotazioni inserisce No saved annotations nel pannello
  .fail(function() {
    var t=document.createTextNode("No saved annotations")
    var PAli=document.createElement("li");
    PAli.setAttribute("class","list-group-item");
    PAli.appendChild(t);
    document.getElementById('Notes_list').appendChild(PAli);
  });
}


//mostra le informazioni sullo status e gli utenti legati al documento
function InfoDoc(titolo,status,underreview,saved,chairs){
  document.getElementById("statustitle").innerHTML=titolo;
  document.getElementById("statusdoc").innerHTML=status;
  document.getElementById("statusreviewers").innerHTML=underreview;
  document.getElementById("statusreviewed").innerHTML=saved;
  document.getElementById("statuschair").innerHTML=chairs;
  $("#InfoDocument").modal("show");
}
//mostra il modale con l annotazione globale e la lista delle singole annotazioni fatte dall utente
function ShowAnnotation(elem,ID,name){
  $.get("/wsgi/api/comments"+"?ID="+ID,function(result2){
    var s1= result2.ann.length;
    for(var i=0;i<=s1;i++){
      var s2 = size(result2.ann[i])-1;
      if(s2!="-1"){
        if(name+"-Chair Decision"==elem.textContent&&result2.ann[i][0]["@type"]=="decision"){
          document.getElementById("Globalaut").innerHTML=name;
          document.getElementById("Globaldate").innerHTML=result2.ann[i][0].article.eval.date;
          document.getElementById("Globaltext").innerHTML=result2.ann[i][0].article.eval.global;
          document.getElementById("Globalscore").innerHTML=result2.ann[i][0].article.eval.score+"/5";
          document.getElementById("Globalstatus").innerHTML=result2.ann[i][0].article.eval.status;
          document.getElementById("LocalComment").innerHTML=" ";
          $("#GlobalModal").modal("show");
          return
        }
        //se si clicca su una decisione del chair apre il modale dell annotazione globale popolandolo con la sua decisione
        if(elem.textContent==name&&result2.ann[i][0]["@type"]!="decision"){
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
    }
});
  $("#GlobalModal").modal("show");

}

function setAttributes(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}
function activaTab(tab){
  $('.nav-tabs a[href="#' + tab + '"]').tab('show');
}
function shorten(text) {
  var ret = text;
  var maxLength=30;
  if (ret.length > maxLength) {
    ret = ret.substr(0,maxLength-3) + "...";
  }
  return ret;
}

function size (result){
  var s1=0;
  var x;
  for(x in result){
    s1++;
  }
  return s1
}
