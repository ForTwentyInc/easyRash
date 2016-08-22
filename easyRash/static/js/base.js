/*popola e apre il modale con i dati dell utente corrente*/
function ViewProfile(){
  $.getJSON("/wsgi/api/user",function(result){
    document.getElementById("Fname").innerHTML=result.User.given_name;
    document.getElementById("Sname").innerHTML=result.User.family_name;
    document.getElementById("email").innerHTML=result.User.email;
    document.getElementById("sex").innerHTML=result.User.sex;
    $("#ViewProfile").modal("show");
  });
}
/*Facendo la richiesta di modifica password controlla la risposta di ritorno se 200 stampa successo*/
window.addEventListener("load", function () {
  function sendData() {
    var XHR = new XMLHttpRequest();

    // Creiamo una variabile con i dati del form da mandare
    var FD  = new FormData(form);

// definiamo cosa accade se il server torna un 200:successo modifica password
    XHR.addEventListener("load", function(event) {
      if(event.target.status==200){
  $("#passchanged").show();
}else{
  $("#passchanged").hide();
}
    });


    //definiamo la richiesta
    XHR.open("POST", "/wsgi/api/user");

    //i dati inviati sono quelli presenti nel form di modifica pass
    XHR.send(FD);
  }


  var form = document.getElementById("changepassform");

  //intercetta l evento on submit del cambio password
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    sendData();
  });
});
/*controlla che la nuova password inserita corrisponda al confirm password*/
function checkpsw()
{
    var pass1 = document.getElementById('password');
    var pass2 = document.getElementById('confirm-password');
    var goodColor = "#66cc66";
    var badColor = "#ff6666";
    if(pass1.value == pass2.value){
        button=document.getElementById("Changepass");
        $(button).removeClass("disabled");
        pass2.style.borderColor = goodColor;
            }else{
        button=document.getElementById("Changepass");
        $(button).addClass("disabled","disabled");
        pass2.style.borderColor = badColor;
      }
}
