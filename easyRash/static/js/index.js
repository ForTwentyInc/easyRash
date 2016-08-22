/*Facendo la richiesta di login controlla la risposta di ritorno è un errore lo stampa*/
window.addEventListener("load", function () {
  function sendData() {
    var XHR = new XMLHttpRequest();

    // Creiamo una variabile con i dati del form da mandare
    var FD  = new FormData(form);
    // definiamo cosa accade se il server torna un errore  dovuto alla password errata
    XHR.addEventListener("load", function(event) {
      if(event.target.status>400){
  $("#logerror").show();
}else{
  $("#logerror").hide();
  window.location="/wsgi/home";
}
    });


    // Definiamo la richiesta da controllare
    XHR.open("POST", "/wsgi/login");

    //I dati inviati sono quelli del form inseriti dall utente
        XHR.send(FD);
  }

  // Accediamo ai dati contenuti nel form di login
  var form = document.getElementById("loginform");

  // intercetta l evento submit del login
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    sendData();
  });
});

$(function() {
/*gestisce il passaggio del modale dal form login a register e viceversa*/
  $('#login-form-link').click(function(e) {
  $("#loginform").delay(100).fadeIn(100);
  $("#registerform").fadeOut(100);
  $('#register-form-link').removeClass('active');
  $(this).addClass('active');
  e.preventDefault();
});
$('#register-form-link').click(function(e) {
  $("#registerform").delay(100).fadeIn(100);
  $("#loginform").fadeOut(100);
  $('#login-form-link').removeClass('active');
  $(this).addClass('active');
  e.preventDefault();
});

});
