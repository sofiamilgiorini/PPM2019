$(window).on('load', function () {
    $('#headerWrapper')
        .prepend(
            $('<span id="backBtn"></span>')
                .on('click', function () {
                    window.location = "../";
                })
        );
})
    .on('beforeunload', function () {
        sessionStorage.removeItem("loggedFrom");
    });

$('#login')
    .on('click', function(){
        var $nickname 	= $('#nickname').val();
        var $password	= $('#password').val();
        $.ajax({
                type: 'POST',
                url: 'https://ppm2019.altervista.org/query_db.php',
                data: {sender: 'login', nickname: $nickname, password: $password}
        }).done(function (data) {
            var obj = JSON.parse(data);
            if(obj.valid === "true"){
                console.log(obj.nickname + " " + obj.id);
                sessionStorage.setItem("nickname", obj.nickname);

                $('#textForProblem').html("");
                var pageToRestore = sessionStorage.getItem("loggedFrom");
                sessionStorage.removeItem("loggedFrom");
                window.location = pageToRestore ? pageToRestore : "../";
            }else{
                $('#textForProblem').html("Nome o passoword errati");
            }
        }).fail(function () {
            alert('Errore');
        });
});
