$('#register').on('click', function(){
    var $nickname 	= $('#nickname').val();
    var $password	= $('#password').val();

    $.ajax({
        type: 'POST',
        url: 'https://ppm2019.altervista.org/query_db.php',
        data: {sender: 'registration', nickname: $nickname, password: $password}
    }).done(function(data){
        var obj = JSON.parse(data);
        console.log(obj.alreadyInDB);
        if(obj.alreadyInDB === "true"){
            $('#textForProblem').html("nome già esistente");
            console.log("il nome esiste già");
        }else{
            $('#textForProblem').html(" ");
            console.log("il nome ora esiste");
            alert("Successo");
            window.location = "../index.html";
        }
    }).fail(function(e){
        console.warn("Failed");
        console.log(e);
    });
});