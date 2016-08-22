/*chiama inactivityTime per ogni evento da tastiera o mouse*/
document.onload = function() {  //in qualsiasi dei 3 eventi viene resettato untimer che
  inactivityTime();             // slocka il documento dopo 3 ore di inattività con la funzione logout
};
document.onmousedown = function() {
inactivityTime();
};
document.onkeypress = function() {
inactivityTime();
};

var inactivityTime = function() {
  var t;
  //se avviene uno dei 3 eventi di seguito invoca resetTimer
  window.onload = resetTimer;
  document.onmousemove = resetTimer;
  document.onkeypress = resetTimer;

  function logout() {
    //se l utente ha il lock sul documento resetta il timeout e lo riporta alla pagina base di annotator mode
  if($("#toggle_event_editing").find("button").eq(0).hasClass('btn-default')){
    clearTimeout(t);
    t=0;
    var ul= document.getElementById("docu");
    var items=ul.getElementsByTagName("li");
    tit=$(items[0]).children("a").attr("title");
    TabID=encodeURIComponent(tit);
    $.getJSON("/wsgi/api/documents/Unlock"+"?ID="+TabID,function(result){
    });

    $("#Unsaved").hide();
    AbleRev();//riattiva le reviews
    /*inizializza la tab collegata alla prima div fissa e inserisce le annotazioni sul panel Annotations se presenti */

        $('#switch_status').html('Switched off.');
        $('#toggle_event_editing button').eq(0).toggleClass('locked_inactive locked_active btn-default btn-primary');
        $('#toggle_event_editing button').eq(1).toggleClass('unlocked_inactive unlocked_active btn-primary btn-default');
        window.location.reload();
  }
  }
//se l utente ha il lock sul documento si esegue resetTimer
  function resetTimer() {
if($("#toggle_event_editing").find("button").eq(0).hasClass('btn-default')){
    //pulisce il timeout di t se presente e setta un nuovo timeout che dopo 3 ore chiama logout
    clearTimeout(t);
    t = setTimeout(logout, 10800000)
      // 1000 milisec = 1 sec
    }
  }
};


//controlla quando l utente ricarica la pagina se ha il lock sul documento e nel caso  lo slocka
function onReload(TabID){
    $(window).bind('beforeunload',function(){
      $.getJSON("/wsgi/api/documents/IsLocked"+"?ID="+TabID,function(result3){
        if(result3.Lock==true){
          $.getJSON("/wsgi/api/documents/Unlock"+"?ID="+TabID,function(result){
          });
          $('#toggle_event_editing button').eq(0).toggleClass('locked_inactive locked_active btn-default btn-primary');
          $('#toggle_event_editing button').eq(1).toggleClass('unlocked_inactive unlocked_active btn-primary btn-default');

        }
          });

      return

  });
}
function checkid(elem,numb,titolo){    // questa funzione controlla tutti gli  id delle annotazioni precedentemente inserite
var ID=encodeURIComponent(titolo)       //se sono unsaved le conta nel localstorage e restituisce id univoco del commento che si vuole aggiungere
var existingEntries=JSON.parse(localStorage.getItem("allUnsaved"));//sennò fa la medesima cosa cenrcando dentro le annotazioni salvate
if (existingEntries== null|| existingEntries.length==0 ){
$(".saved").each(function(i,obj){
  if($(this).attr("id")==elem+numb){
    numb++;
  }
});
return(elem+numb);
}else{
  if(existingEntries[0]==null){return (elem+0);}
for(var i=0;i<existingEntries.length;i++){

    if(existingEntries[i].id==elem+numb){
      numb++;
      existingEntries[i].id=elem+numb;
    }
  }

    return(elem+numb);
  }
}
function CancelAnnotation(){    //questa funzione viene invocata quando si sta per aggiungere una nuova annotazione
  var ul= document.getElementById("docu");//ma si decide di annullare l'operazione,allora la funzione tramite l'id rimuove
  var items=ul.getElementsByTagName("li");//lo span che rende visibille l'annotazione sul testo e toglie la selezione

  var unsul= document.getElementById("Unsaved_list");
  var unit=unsul.getElementsByTagName("li")

  id=checkid(document.getElementById("globaluser").innerHTML,unit.length,$(items[0]).children("a").attr("title"));
  $("#"+id).contents().unwrap();
  var sel = window.getSelection ? window.getSelection() : document.selection;
if (sel) {
    if (sel.removeAllRanges) {
        sel.removeAllRanges();
    } else if (sel.empty) {
        sel.empty();
    }
}
  $("#AnnModal").modal("hide");
  return
}


function OpenGlobal(){  //questa funzione viene invicata quando si clicca il pulsante  per inserire un commento globale ma è gia presente
  var unsul= document.getElementById("Notes_list");// quindi popola il modale con i vecchi valori e quindi permette di modificarli
  var unit=unsul.getElementsByTagName("li");

for(var i=0;i<unit.length;i++){

  if(document.getElementById("Panelcheck").innerHTML=unit[i].textContent){
    var ul= document.getElementById("docu");
    var items=ul.getElementsByTagName("li");
    $.getJSON("/wsgi/api/comments"+"?ID="+encodeURIComponent($(items[0]).children("a").attr("title")),function(result){
      for(var x=0;x<result.ann.length;x++){
        s2=size(result.ann[x])-1;
        if(s2!="-1"){
          if(result.ann[x][s2].name==document.getElementById("Panelcheck").innerHTML){
            document.getElementById("SaveAnnot").value=result.ann[x][0].article.eval.global;
            $('input[value=\''+result.ann[x][0].article.eval.score+'\']').prop("checked",true);
            $('input[value=\''+result.ann[x][0].article.eval.status+'\']').prop("checked",true);
            document.getElementById("ChangeGlobal").setAttribute("onclick",'SaveNewAll(\''+result.ann[x][0]["@id"]+'\')');
            $("#SaveModal").modal("show");
            return
          }
        }

      }
    });
  }
}
  $("#SaveModal").modal("show");

}

function SaveNewAll(globalid){ // questa funzione viene invocata quando  clicchi save all dentro al modale globalmodal  per modificare un commento globale precedentemente inserito
  var existingEntries = JSON.parse(localStorage.getItem("allUnsaved"));//e inserisce nuove annotazioni unsaved se create
  var ul= document.getElementById("docu");
  var items=ul.getElementsByTagName("li");
  var tit=$(items[0]).children("a").attr("title");
  var localstor =[];
  var ModEntries=[];
  k=existingEntries.length;
  if(existingEntries==null){
  }else{
    for ( var i = 0; i < existingEntries.length; i++ ) {
      /*se il titolo e l autore corrispondono col documento corrente inserisce le annotazioni in questione in un altro array e annulla quelle nell array precedente*/
      if ( existingEntries[i].tit == tit && existingEntries[i].user==document.getElementById("globaluser").innerHTML) {
          localstor.push(existingEntries[i]);
          existingEntries[i]=null;
      }
    }
    /*elimina tutte le annotazione nell array settate precedentemente null*/
    for ( var i = 0; i < existingEntries.length; i++ ) {
      if ( existingEntries[i]!=undefined) {
          ModEntries.push(existingEntries[i]);

      }
    }
    /*reinserice gli array opportunamente modificati nei rispettivi local storage e inserisce in form data i campi da iniviare alla richeista post*/
    localStorage.setItem("allUnsaved",JSON.stringify(ModEntries));
    localStorage.setItem("Newsaved",JSON.stringify(localstor));
    var formData = {IDdoc:tit,status:$('input:radio[name=status]:checked').val(),global:document.getElementById("SaveAnnot").value,score:$('input:radio[name=star]:checked').val(),type:"update",LocalStorage:localStorage.getItem("Newsaved"),id:globalid};
    JSON.stringify(formData);
    localStorage.removeItem("Newsaved");
  $.ajax({
      url : "/wsgi/api/comments",
      method: "POST",
      data : formData,
      })
      .always(function() {
          $("#SaveModal").modal("hide");
      });
      /*dopo aver inviato il commento globale e le annotazioni visualizza di nuovo la pagina iniziale*/
      t=$(items[0]).children("a").attr("title");
      TabID=encodeURIComponent(t);
      $.getJSON("/wsgi/api/documents/Unlock"+"?ID="+TabID,function(result){
      });
      $('#switch_status').html('Switched off.');
      $('#toggle_event_editing button').eq(0).toggleClass('locked_inactive locked_active btn-default btn-primary');
      $('#toggle_event_editing button').eq(1).toggleClass('unlocked_inactive unlocked_active btn-primary btn-default');
      window.location.reload();

  }


}
/*Salva permanentemente tutte le annotazioni contenute all interno di localStorage effettuate dall utente corrente*/
function SaveAll(){
  /*inserisce il contenuto del localStorage in un array*/
var existingEntries = JSON.parse(localStorage.getItem("allUnsaved"));
var ul= document.getElementById("docu");
var items=ul.getElementsByTagName("li");
var tit=$(items[0]).children("a").attr("title");
var localstor =[];
var ModEntries=[];
k=existingEntries.length;
if(existingEntries==null){
}else{
  for ( var i = 0; i < existingEntries.length; i++ ) {
    /*se il titolo e l autore corrispondono col documento corrente inserisce le annotazioni in questione in un altro array e annulla quelle nell array precedente*/
    if ( existingEntries[i].tit == tit && existingEntries[i].user==document.getElementById("globaluser").innerHTML) {
        localstor.push(existingEntries[i]);
        existingEntries[i]=null;
    }
  }
  /*elimina tutte le annotazione nell array settate precedentemente null*/
  for ( var i = 0; i < existingEntries.length; i++ ) {
    if ( existingEntries[i]!=undefined) {
        ModEntries.push(existingEntries[i]);

    }
  }
  /*reinserice gli array opportunamente modificati nei rispettivi local storage e inserisce in form data i campi da iniviare alla richeista post*/
  localStorage.setItem("allUnsaved",JSON.stringify(ModEntries));
  localStorage.setItem("Newsaved",JSON.stringify(localstor));
  var formData = {IDdoc:tit,status:$('input:radio[name=status]:checked').val(),global:document.getElementById("SaveAnnot").value,score:$('input:radio[name=star]:checked').val(),type:"review",LocalStorage:localStorage.getItem("Newsaved")};
  JSON.stringify(formData);
  localStorage.removeItem("Newsaved");
$.ajax({
    url : "/wsgi/api/comments",
    method: "POST",
    data : formData,
    })
    .always(function() {
        $("#SaveModal").modal("hide");
    });
    /*dopo aver inviato il commento globale e le annotazioni visualizza di nuovo la pagina iniziale*/
    t=$(items[0]).children("a").attr("title");
    TabID=encodeURIComponent(t);
    $.getJSON("/wsgi/api/documents/Unlock"+"?ID="+TabID,function(result){
    });
    $('#switch_status').html('Switched off.');
    $('#toggle_event_editing button').eq(0).toggleClass('locked_inactive locked_active btn-default btn-primary');
    $('#toggle_event_editing button').eq(1).toggleClass('unlocked_inactive unlocked_active btn-primary btn-default');
    window.location.reload();

}
}



function StorageUnsaved(){
  var ul= document.getElementById("docu");
  var items=ul.getElementsByTagName("li");
  var unsul= document.getElementById("Unsaved_list");
  var unit=unsul.getElementsByTagName("li")
  var existingEntries = JSON.parse(localStorage.getItem("allUnsaved"));
  if(existingEntries== null) existingEntries= [];//se non sono presenti annotazioni inizializza un array per contenerle
  //inserisce in obj gli elementi dell annotazione
  var obj={
    tit:$(items[0]).children("a").attr("title"),
    id:checkid(document.getElementById("globaluser").innerHTML,unit.length,$(items[0]).children("a").attr("title")),
    annotation:document.getElementById("annot").value,
    date:new Date().toLocaleString(),
    user:document.getElementById("globaluser").innerHTML
  }
  //salva gli elementi dell annotazione in un array nel local storage
  localStorage.setItem("entry", JSON.stringify(obj));
  existingEntries.push(obj);
  localStorage.setItem("allUnsaved", JSON.stringify(existingEntries));
  document.getElementById(obj.id).setAttribute("data-tooltip","tooltip");
  document.getElementById(obj.id).setAttribute("title",obj.annotation);
  var formData = {DocumentBody:document.getElementById("docbody").innerHTML,DocumentTitle:$(items[0]).children("a").attr("title")};
//invia il body del documento con la nuova annotazione inserita
$.ajax({
    url : "/wsgi/api/documents/body",
    method: "POST",
    data : formData,
    })
    .always(function() {
      UnsavedPanel($(items[0]).children("a").attr("title"));
      $("#AnnModal").modal("hide");
    });
}


function UnsavedPanel(elem){ //popola  in panello delle annotazioni non salvate presenti  nel local storage
  document.getElementById('Unsaved_list').innerHTML =" ";
  if(JSON.parse(localStorage.getItem("allUnsaved"))!=null){
      for(var k=0;k<JSON.parse(localStorage.getItem("allUnsaved")).length;k++){

        if(JSON.parse(localStorage.getItem("allUnsaved"))[k].user==document.getElementById("globaluser").innerHTML && JSON.parse(localStorage.getItem("allUnsaved"))[k].tit==elem){
          var UAli=document.createElement("li");
          var UAa=document.createElement("a");
          var t=document.createTextNode(JSON.parse(localStorage.getItem("allUnsaved"))[k].id+"-Text:"+JSON.parse(localStorage.getItem("allUnsaved"))[k].annotation);
          setAttributes(UAa,{"class":"list-group-item","onclick":'EditAnnotation(\''+JSON.parse(localStorage.getItem("allUnsaved"))[k].id+'\')'})
          UAa.appendChild(t);
          UAli.appendChild(UAa);
         document.getElementById('Unsaved_list').appendChild(UAli);
      }

    }

    }
}

function EditAnnotation(elem){ //popola il modale con l'annotaZIONE che vogliamo modificare
      for(var k=0;k<JSON.parse(localStorage.getItem("allUnsaved")).length;k++){
        if(JSON.parse(localStorage.getItem("allUnsaved"))[k]!=undefined){
        if(JSON.parse(localStorage.getItem("allUnsaved"))[k].id == elem){
          document.getElementById("EditDate").innerHTML=JSON.parse(localStorage.getItem("allUnsaved"))[k].date;
          document.getElementById('EditAnnot').value=JSON.parse(localStorage.getItem("allUnsaved"))[k].annotation;
          document.getElementById("DelBut").setAttribute("onclick",'DelUnsaved(\''+JSON.parse(localStorage.getItem("allUnsaved"))[k].id+'\')');
          document.getElementById("TextEdit").setAttribute("onclick",'EditText(\''+JSON.parse(localStorage.getItem("allUnsaved"))[k].id+'\')');
        }
      }
      }
      $("#EditModal").modal();
}
/*modifica il testo di un annotazione già creata*/
function EditText(elem){
  var existingEntries=JSON.parse(localStorage.getItem("allUnsaved"));
  for(var k=0;k<existingEntries.length;k++){
    if(existingEntries[k].id == elem){
      existingEntries[k].annotation=document.getElementById("EditAnnot").value;
      existingEntries[k].date=new Date().toLocaleString();
      localStorage.setItem("allUnsaved", JSON.stringify(existingEntries));
    }
  }
  $("#EditModal").modal("hide");
}
/*cliccando il bottone di Delete delle annotazioni create  elimina il localStorage corrispondente e lo span corrispondente*/
function DelUnsaved(elem){
  var ul= document.getElementById("docu");
  var items=ul.getElementsByTagName("li");
  var existingEntries=JSON.parse(localStorage.getItem("allUnsaved"));
  for ( var i = 0; i < existingEntries.length; i++ ) {
    if ( existingEntries[i].id == elem ) {
        existingEntries.splice(i,1);
        $("#"+elem).contents().unwrap();
    }
  }
  var formData = {DocumentBody:document.getElementById("docbody").innerHTML,DocumentTitle:$(items[0]).children("a").attr("title")};
$.ajax({
    url : "/wsgi/api/documents/body",
    method: "POST",
    data : formData,
    })
    .always(function() {
      UnsavedPanel($(items[0]).children("a").attr("title"));
      $("#EditModal").modal("hide");
    });
  localStorage.setItem("allUnsaved", JSON.stringify(existingEntries));
}

/*Bottone lock documento*/
$('#toggle_event_editing button').click(function(){
  /*code to do when on*/
  var ul= document.getElementById("docu");
  var items=ul.getElementsByTagName("li");
  var t="";
  if($(this).hasClass('locked_active') || $(this).hasClass('unlocked_inactive')){
  for (var x=0;x<items.length;x++){
    if($(items[x]).hasClass("active")==true){
      t=$(items[x]).children("a").attr("title");
    }
  }
}
  TabID=encodeURIComponent(t);


    if($(this).hasClass('locked_active') || $(this).hasClass('unlocked_inactive')){
      //se nessuno ha il lock sul documento, imposta lock a true e permette di annotare sul documento
      $.getJSON("/wsgi/api/documents/IsLocked"+"?ID="+TabID,function(result3){
        if(result3.Lock==false){
          $.getJSON("/wsgi/api/documents/Lock"+"?ID="+TabID,function(result){
          });
          $("#Unsaved").show();
      onReload(TabID);
      /*crea il bottone per inserire le annotazioni */
      var butannot=document.createElement("button");
      var butsave=document.createElement("button");
      var butspan=document.createElement("i");
      var butspan2=document.createElement("i");
      var butspan3=document.createElement("i");
      var butdecid=document.createElement("button")
      butspan.setAttribute("class","fa fa-pencil-square-o editsave");
      butspan2.setAttribute("class","fa fa-floppy-o editsave");
      butspan3.setAttribute("class","fa fa-cloud-upload editsave");
      setAttributes(butannot,{"onclick":"AddAnnotation()","type":"button","data-tooltip":"tooltip","title":"Insert your annotation","class":"close closeTab"});
      setAttributes(butsave,{"data-tooltip":"tooltip","title":"Save all annotations","onclick":"OpenGlobal()","class":"close closeTab"});
      setAttributes(butdecid,{"onclick":"DecisionChair()","data-tooltip":"tooltip","title":"Chair Decision","class":"close closeTab"});
      butsave.appendChild(butspan2);
      butannot.appendChild(butspan);
      butdecid.appendChild(butspan3);
      /*rimuove il bottone di chiusura se presente*/
      $(items[0]).find('button').remove();
      if(document.getElementById("role").innerHTML=="Chair"){
      $(items[0]).find("a").append(butdecid);
      }
      $(items[0]).find("a").append(butsave);
      $(items[0]).find("a").append(butannot);//inserisce il bottone creato prima per le annotazioni
      var tito=$(items[0]).children("a").attr("title");
      UnsavedPanel(tito);
      DisableRev();
      $('#switch_status').html('Switched on.');

    }else{
      //se già lockato mostra modale di avviso e setta il bottone di lock su unlcok
      $("#LockModal").modal("show");
      $('#toggle_event_editing button').eq(0).toggleClass('locked_inactive locked_active btn-default btn-primary');
      $('#toggle_event_editing button').eq(1).toggleClass('unlocked_inactive unlocked_active btn-primary btn-default');


    }
    });
  }
  else{
  /* code to do when off */

  t=$(items[0]).children("a").attr("title");
  TabID=encodeURIComponent(t);
  //setta il lock del documento su false
  $.getJSON("/wsgi/api/documents/Unlock"+"?ID="+TabID,function(result){
  });

  $("#Unsaved").hide();//nasconde il pannello delle unsaved annotation
  AbleRev();//riattiva le reviews
  $('#switch_status').html('Switched off.');
  window.location.reload()
    }
  /* reverse locking status */
  $('#toggle_event_editing button').eq(0).toggleClass('locked_inactive locked_active btn-default btn-primary');
  $('#toggle_event_editing button').eq(1).toggleClass('unlocked_inactive unlocked_active btn-primary btn-default');
});

/*fine bottone annotator*/

function DecisionChair(){  // modifica il bottone del global modal per far inviare al chair la decision

  document.getElementById("ChangeGlobal").setAttribute("onclick","Decision()");
  $("#SaveModal").modal("show");
}
function Decision(){//invia un commento globale con type=decision per chiudere l annotazione del documento e stabilire lo status del documneto
  var ul= document.getElementById("docu");
  var items=ul.getElementsByTagName("li");
  var tit=$(items[0]).children("a").attr("title");
  var formData = {IDdoc:tit,status:$('input:radio[name=status]:checked').val(),global:document.getElementById("SaveAnnot").value,score:$('input:radio[name=star]:checked').val(),type:"decision"};

    $.ajax({
      url : "/wsgi/api/comments",
      method: "POST",
      data : formData,
      })
      .always(function() {
          $("#SaveModal").modal("hide");
      });
      /*dopo aver inviato il commento globale e le annotazioni visualizza di nuovo la pagina iniziale*/
      t=$(items[0]).children("a").attr("title");
      TabID=encodeURIComponent(t);
      $.getJSON("/wsgi/api/documents/Unlock"+"?ID="+TabID,function(result){
      });
      $('#switch_status').html('Switched off.');
      $('#toggle_event_editing button').eq(0).toggleClass('locked_inactive locked_active btn-default btn-primary');
      $('#toggle_event_editing button').eq(1).toggleClass('unlocked_inactive unlocked_active btn-primary btn-default');
      window.location.reload();



}
//inserisce classe disabled on lock del documento sugli altri documenti nel pannello
function DisableRev(){
  var items= document.getElementById("Document_list");
  $(items).children("div").addClass("disabled","disabled");
  $(".dropdis").addClass("disabled","disabled");
}
//toglie classe disabled
function AbleRev(){
  var items= document.getElementById("Document_list");
  $(items).children("div").removeClass("disabled");
  $(".dropdis").removeClass("disabled")
}



/*Controlla l elemento selezionato dalla sottolineatura del mouse se non si sovrappone ad altri elementi html permette di aggiungere annotazioni*/
function AddAnnotation() {
//controlla se la selezione non è sovrapposizionata a nessun altro elemento html, contenuta nel body e maggiore di 3 caratteri
  if(elementContainsSelection(document.getElementById('docbody'))==true && window.getSelection().toString().length > 3){
  document.getElementById("annot").value=" ";
  var userSelection = window.getSelection().getRangeAt(0);
  highlightRange(userSelection);
}else{
  $("#ErrModal").modal();
}
}
/*controlla se il nodo è uguale al container o è al suo interno*/
function isOrContains(node, container) {
    while (node) {
        if (node === container) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}
/*controlla se la selezione è contenuta in el, in questo caso body e se è maggiore di 0 caratteri*/
function elementContainsSelection(el) {
    var sel;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount > 0) {
            for (var i = 0; i < sel.rangeCount; ++i) {
                if (!isOrContains(sel.getRangeAt(i).commonAncestorContainer, el)) {
                    return false;
                }
            }
            return true;
        }
    }
    return false;
}
/*inserisce lo span sulla selezione dell utente con l id dell annotazione creata e apre il modale per inserire il testo dell annotazione */
function highlightRange(range) {
  var ul= document.getElementById("docu");
  var items=ul.getElementsByTagName("li");

    var newNode = document.createElement("span");
    var unsul= document.getElementById("Unsaved_list");
    var unit=unsul.getElementsByTagName("li")
    newNode.setAttribute("class","unsaved");

    newNode.setAttribute("id",checkid(document.getElementById("globaluser").innerHTML,unit.length,$(items[0]).children("a").attr("title")));
    try{range.surroundContents(newNode);}
    catch(err){
      if(err.name=="InvalidStateError"){$("#ErrModal").modal();}
    return
    }
    $("#AnnModal").modal("show");
}
