$(function(){
    $('#login').on('click', function(){
        var $nickname 	= $('#nickname').val();
        var $password	= $('#password').val();
        $.ajax({
				type: 'POST',
				url: 'https://ppm2020app.000webhostapp.com/query_db.php',
                data: {sender: 'login', nickname: $nickname, password: $password},
				success: function(data){
				    var obj = JSON.parse(data);
				    if(obj.valid === "true"){
                        alert("Successo");
                        if(obj.nickname === $nickname){
                            sessionStorage.setItem("nickname",$nickname);
                            console.log(obj.nickname + " " + obj.id);
                        }
                        else{
                            console.log("problemi nel ritornare robe");
                        }
                        $('#textForProblem').html(" ");
                        window.location = "../index.html";
                    }else{
                        $('#textForProblem').html("nome o passoword errati");
                    }
                },
                error: function(data){
                      alert('there were errors while doing the operation.');
				}
        })
    });
});
