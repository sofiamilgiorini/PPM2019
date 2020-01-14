function cycleImages(){
    var $active = $('#slideshow .active');
    var $next = ($active.next().length > 0) ? $active.next() : $('#slideshow li:first');
    writeInfo($next); // write artwork name and author in the footer
    $next.css('z-index',2);//move the next image up the pile
    $active.fadeOut(2000,function(){//fade out the top image
        $active.css('z-index',1).show().removeClass('active');//reset the z-index and unhide the image
        $next.css('z-index',3).addClass('active');//make the next image the top one
    });
}

// write artwork info on the slideshow image
function writeInfo(art) {
    var opera = Opera[art.attr('data-index')];
    var info = opera.nome + ' - ' + opera.artista.nome;
    var $operaInfo = $('#operaInfo');

    if ($operaInfo.text() !== "") {
        $operaInfo.fadeOut(1000,function() {
            $(this).text(info);
        }).fadeIn(1000);
    } else {
        $operaInfo.text(info);
    }
}

var imgType = "jpg"; // global var that stores the type of images to use
// check whether or not browser supports webp images
Modernizr.on('webp', function(result) {
    if (result) {
        imgType = "webp";
    }
});

$(window).on('load', function () {
    // set proper height for the filterBox
    $('#filterBox').css({
        'margin-top': $("#searchBox").outerHeight(true)+10 + "px"
    });
    // create as much li as there are artworks (actually take only 5 to not make client download every image)
    // load slider images as background
    var $slider = $('#slideshow');
    var k = 0;
    var numImages = 4; // how many images will appear in the slideshow
    var keys = Object.keys(Opera);
    var maxImages = keys.length;
    while (k < numImages && k < maxImages) { // we could make the 5 images choice random instead of linear
        var img = Opera[keys[k]].img+'_720.'+imgType;
        var $item = $('<li></li>')
            .attr('data-index', keys[k])
            .css('background-image', 'url(./img/opere/'+img+')');
        $slider.append($item);
        k++;
    }
    $('#slideshow li:first').addClass('active');
    writeInfo($('#slideshow li.active'));
    // cycle every 5s
    setInterval('cycleImages()', 5000); // timeout must be more than the fadeOut duration


    // check if user is logged in
    var $hW = $('#headerWrapper');
    var user = sessionStorage.getItem("nickname");
    var $topBtn = $('<span id="topBtn"></span>');
    if (user) {
        if (currentPage.includes("opera_page")) {
            $topBtn.text('Prendi appunti');
        }
        else {
            $topBtn.append(
                $('<span id="logout">Esci</span>')
                .on('click', function () {
                    sessionStorage.removeItem("nickname");
                    window.location.reload();
                })
            );
            $hW.append(
                $('<div id="greet">Benvenuto ' + user + '!</div>'));
        }
    }
    else {
        $topBtn.append(
            $('<a href="login/login.html">Accedi</a>')
                .on('click', function () {
                    sessionStorage.setItem("loggedFrom", window.location) // save page to go back there after the login
                })
        );
    }
    $hW.append($topBtn);

    if (!currentPage.includes("opera_page")) // because in opera_page we need to wait for the images to be loaded
        showTutorial(currentPage);
});

var $searchBox = $('#searchBox');
var $searchBoxInput = $('#searchBox input');
$searchBox.on('click', function (e) {
    if ($searchBoxInput.prop('disabled'))
        return;
    if (e.target.id !== "speakBtn") {
        $searchBoxInput.trigger('focus');
    }
});

var $speakBtn = $('#speakBtn');
$speakBtn.on('click', function (e) {
    e.stopImmediatePropagation();
    if ($searchBoxInput.prop('disabled'))
        return;
    recognition.start();
    console.log('Ready to receive a word command.');
});


var storage;
if (typeof(Storage) !== "undefined") {
    storage = true;
} else {
    storage = false;
    console.warn("The browser does not support Storage");
}
function showTutorial(page) {
    if (storage) {
        if (sessionStorage.getItem(page) ===  "true")
            return;
    }
    $searchBoxInput.prop('disabled', true);
    var $tutorialBG = $('<div id="tutorialBG"></div>'); // black background for the tutorial
    var $tutorial = $('<div id="tutorial"></div>');
    var $tutBtn = $('<input id="tutBtn" type="button" value="Ho capito">')
        .on('click', function () {
            $searchBoxInput.prop('disabled', false);
            // don't show the tutorial again by saving state in Storage
            if (storage) {
                sessionStorage.setItem(page, "true");
            }

            $tutorialBG.remove();
            $tutorial.remove();
        });

    $tutorial.append($tutBtn);
    $('body')
        .prepend($tutorialBG, $tutorial);

    function setOffset(toSet, setTo, backoff) {
        backoff = (typeof backoff !== 'undefined') ?  backoff : 0.7;
        var windowWidth = $(window).width();
        var left = (setTo.offset().left + setTo.offset().left + setTo.outerWidth()) / 2 - toSet.width()*backoff; // find center of setTo element and back off to center the arrow (arrow tip is at 0.7 of the image width)
        if (left + toSet.width() <= windowWidth) // check if the image would be offscreen
            toSet.css('left', left);
        else toSet.css('right', 10); // if offscreen set a distance from right margin of 10 instead
    }

    // load correct images based on page
    var $topBtn = $('#topBtn');
    if (page === "take_notes") {
        var $take_notes_1 = $('<img alt="tutorial" src="./img/tutorial/opera_page_notes/take_notes_1.png">')
            .css({
                'top': $topBtn.offset().top + $topBtn.outerHeight()
            });

        var $take_notes_2 = $('<img alt="tutorial" src="./img/tutorial/opera_page_notes/take_notes_2.png">')
            .css({
                'top': canvas.element.offset().top + canvas.height * 0.7
            });

        var $take_notes_3 = $('<img alt="tutorial" src="./img/tutorial/opera_page_notes/take_notes_3.png">')
            .css({
                'top': canvas.element.offset().top + canvas.height * 0.2
            });

        $tutorial.append($take_notes_1, $take_notes_2, $take_notes_3);
        setOffset($take_notes_1, $topBtn, 0.85);
        setOffset($take_notes_2, canvas.element);
        setOffset($take_notes_3, canvas.element, 1);
    } else if (page === "notes_list") {
        var $detailsList = $('#detailsList');
        var $notes_list_1 = $('<img alt="tutorial" src="./img/tutorial/notes_list/notes_list_1.png">');

        $tutorial.append($notes_list_1);
        $notes_list_1.on('load', function () {
            $(this).css('top', $($detailsList.children('li')[0]).offset().top-$notes_list_1.height()*0.9);
        });
        setOffset($notes_list_1, $detailsList);
    } else if (page === "open_note") {
        var $open_note_1 = $('<img alt="tutorial" src="./img/tutorial/open_note/open_note_1.png">')
            .css({
                'top': $topBtn.offset().top + $topBtn.outerHeight()
            });

        $tutorial.append($open_note_1);
        setOffset($open_note_1, $topBtn);
    } else if (page === "edit_note") {
        var $edit_note_1 = $('<img alt="tutorial" src="./img/tutorial/edit_note/edit_note_1.png">')
            .css({
                'top': canvas.element.offset().top
            });

        $tutorial.append($edit_note_1);
        setOffset($edit_note_1, $topBtn);
    } else if (page.includes("opera_page")) {
        var $opera_page_1 = $('<img alt="tutorial" src="./img/tutorial/opera_page/opera_page_1.png">')
            .css({
                'top': $topBtn.offset().top + $topBtn.outerHeight()
            });

        var $readDescBtn = $('#readDescBtn');
        var $opera_page_2 = $('<img alt="tutorial" src="./img/tutorial/opera_page/opera_page_2.png">')
            .css({
                'top': $readDescBtn.offset().top + $readDescBtn.outerHeight()
            });

        var $artImage = $('#artImage');
        var $opera_page_3 = $('<img alt="tutorial" src="./img/tutorial/opera_page/opera_page_3.png">')
            .css({
                'top': $artImage.offset().top + $artImage.outerHeight() - 20
            });

        $tutorial.append($opera_page_1, $opera_page_2, $opera_page_3);
        setOffset($opera_page_1, $topBtn);
        setOffset($opera_page_2, $readDescBtn);
        setOffset($opera_page_3, $artImage);
    } else {
        var $index1 = $('<img alt="tutorial" src="./img/tutorial/index/index_1.png">')
            .css({
                'top': $searchBox.offset().top + $searchBox.outerHeight(),
                'left': 10
            });
        if ($speakBtn.length) {
            var $index2 = $('<img alt="tutorial" src="./img/tutorial/index/index_2.png">')
                .css({
                    'top': $speakBtn.offset().top + $speakBtn.outerHeight()
                });
        }
        var $index3 = $('<img alt="tutorial" src="./img/tutorial/index/index_3.png">')
            .css({
                'top': $topBtn.offset().top + $topBtn.outerHeight() / 2 - 10,
                'width': '60%'
            });

        $tutorial.append($index1, $index2, $index3);
        if ($speakBtn.length) {
            setOffset($index2, $speakBtn);
        }
        $index3.css('left', $topBtn.offset().left - $index3.width())
    }


}