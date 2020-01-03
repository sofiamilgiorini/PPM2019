$('#register').on('click', function(){
    var $nickname 	= $('#nickname').val();
    var $password	= $('#password').val();

    $.ajax({
        type: 'POST',
        url: 'https://ppm2020app.000webhostapp.com/query_db.php',
        data: {sender: 'registration', nickname: $nickname, password: $password},
        success: function(data){
            alert("Successo");
            var obj = JSON.parse(data);
            console.log(obj.alreadyInDB);
            if(obj.alreadyInDB === "true"){
                $('#textForProblem').html("nome già esistente");
                console.log("il nome esiste già");
            }else{
                $('#textForProblem').html(" ");
                console.log("il nome ora esiste");
                window.location = "../index.html";
            }
        },
        error: function(e){
            console.warn("Failed");
            console.log(e);
        }
    });
});