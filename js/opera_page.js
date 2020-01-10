var opera = Opera[operaID];
var $filterBox;
var $artImage;
var $img;

var canvas = {
    element: $(document.createElement('canvas'))
        .attr('id', 'operaCanvas')
        .text('Il tuo browser è troppo vecchio!'),
    setElement: function (e) {
        this.element = e;
        this.context = e[0].getContext("2d");
    },
    setWidth: function (w) {
        this.width = w;
        this.element[0].width = w;
    },
    setHeight: function (h) {
        this.height = h;
        this.element[0].height = h;
    },
    detailsShown: false,
    inDetail: false,
    toggleDetails: function() {
        if(!this.detailsShown) {
            // draw details
            var det = Opera[operaID].dettagli;
            if (Opera[operaID].hasOwnProperty("dettagli")) {
                this.detailsShown = true;
                this.context.lineWidth = 2;
                this.context.strokeStyle = "yellow";
                for (var i in det) {
                    this.context.strokeRect(det[i].x/100*this.width,det[i].y/100*this.height,det[i].width/100*this.width,det[i].height/100*this.height);
                }
            }
        } else {
            this.detailsShown = false;
            // remove details
            this.context.clearRect(0, 0, this.width, this.height);
            this.context.drawImage($img[0], 0, 0, this.width, this.height);
        }
    },
    animate: function (t, l, w, fromSearch, h) {
        if (h === undefined)
            h = false;
        if (fromSearch === undefined)
            fromSearch = false;
        else if (fromSearch) // remove the top canvas if coming from the search bar to show the animation
            $('#topCanvas').remove();
        var betterImg = new Image(); // FIXME: does it get downloaded multiple times when clicking on multiple details?
        if (!this.inDetail || fromSearch) {
            this.inDetail = true;
            betterImg.src = "./img/opere/"+opera.img+"."+imgType;
            $(betterImg).on('load', function () {
                if (!h) {
                    canvas.element.animate({
                        top: t,
                        left: l,
                        width: w
                    }, 350, changeImg);
                } else {
                    canvas.element.animate({
                        top: t,
                        left: l,
                        height: w
                    }, 350, changeImg);
                }
            });
        } else {
            this.inDetail = false;
            $('#topCanvas').remove(); // remove the top canvas to zoom out
            if (!h) {
                canvas.element.animate({
                    top: t,
                    left: l,
                    width: w
                }, 350);
            } else {
                canvas.element.animate({
                    top: t,
                    left: l,
                    height: w
                }, 350);
            }
        }

        function changeImg() { // draw a better quality image over the canvas when the zoom completes
            var propX = betterImg.width/canvas.element.width();
            var propY = betterImg.height/canvas.element.height();

            var canvasNew = document.createElement("canvas");
            canvasNew.width = canvas.width;
            canvasNew.height = canvas.height;
            $(canvasNew).attr({
                'id': 'topCanvas',
                'class': 'operaCanvas'
            });
            canvasNew.getContext("2d").drawImage(betterImg, -l*propX, -t*propY, canvas.width*propX, canvas.height*propY, 0, 0, canvas.width, canvas.height);
            $artImage.append(canvasNew);
        }

    }
};

$(window).on('load', function () {
    $filterBox = $('#filterBox');
    $artImage = $('#artImage');
    $img = $(document.createElement("img"))
        .attr({
            'id': 'operaImage',
            'src': './img/opere/'+opera.img+'_1024.'+imgType,
            'srcset': './img/opere/'+opera.img+'_360.'+imgType+' 360w, ./img/opere/'+opera.img+'_720.'+imgType+' 720w,  ./img/opere/'+opera.img+'_1024.'+imgType+' 1024w'
        })
        .css('width', '100%');

    // generate page html
    console.log("Opera: "+operaID);

    $('title').text(opera.nome);
    $('#headerWrapper h1').text(opera.nome+', '+opera.artista.nome);
    $('#headerWrapper')
        .prepend(
            $('<span id="backBtn"></span>')
                .on('click', function () {
                    window.location = "./";
                })
        );

    $('#name')
        .attr('data-info', 'nome opera titolo')
        .text(opera.nome)
        .after(', ');
    $('#artist')
        .attr('data-info', 'artista pittore autore')
        .text(opera.artista.nome)
        .after(', ');
    $('#year')
        .attr('data-info', 'anno')
        .text(opera.data);
    $('#location')
        .attr('data-info', 'ubicazione museo')
        .text(opera.ubicazione.nome);
    $('#description')
        .text(opera.descrizione);
    var $operaInfo = $('#info');
    $operaInfo.data('operaInfo', $operaInfo.html()); // save the art details to restore

    // print a loader while the image is being downloaded;
    // if the opera has no image print it and return
    $artImage.html('<div class="loader"></div>');
    if (opera.img === "") {
        $artImage
            .css({'font-size': '12px',
                    'text-align': 'center'
                }
            )
            .text('Immagine non disponibile');
        return;
    }

    // print the image to get dimensions
    // html5 source to fetch the right image based on the screen dimension
    $artImage.html($img);

    $img.on('load', function () {
        // FIXME: on iOS 9 the image appears to have height=0 when inserted in the div, so canvas will not be visible
        $artImage.css({
            'width': $img.width(),
            'height': $img.height()
        });
        canvas.setWidth($img.width());
        canvas.setHeight($img.height());
        canvas.context = canvas.element[0].getContext("2d");
        canvas.context.drawImage($img[0], 0, 0, $artImage.width(), $artImage.height());

        $artImage
            .html(canvas.element)
            .after($(document.createElement("span"))
                .attr('id', 'canvasInfo')
                .text('Clicca l\'immagine per mostrare/nascondere gli appunti')
            );
        setBoxHeight();

        if (sessionStorage.getItem("nickname")) {
            showTutorial(currentPage); // wait for the operaWrap to be filled to get the correct position for tutorials

            // bind functions to the topBtn to start and stop taking notes
            function startNote(e, $t) {
                e.stopImmediatePropagation();
                $t.text('Fine')
                    .css('background-color', '#a02f2f');
                canvas.enlarge();
                takeNotes();
                $t.off().on('click', function () {
                    stopNote(e, $t);
                });
            }

            function stopNote(e, $t) {
                e.stopImmediatePropagation();
                $t.text('Prendi appunti')
                    .css('background-color', '#3498db');
                canvas.element.off('touchmove touchstart touchend'); // disable canvas draw interactions

                canvas.restore();

                $t.off().on('click', function () {
                    startNote(e, $t);
                });
            }

            $('#topBtn').on('click', function (e) {
                startNote(e, $(this));
            });
        }

    });
});

function setBoxHeight() {
    // calculate the correct description height to fill the screen
    var filterBoxMaxHeight = $('#wrapper').height();
    $filterBox.outerHeight(filterBoxMaxHeight, true);
    $filterBox.css('max-height', filterBoxMaxHeight+'px');
    var descriptionHeight = $('#info').height()-$('#title').height()-parseInt($('#description').css('margin-top'));
    $('#description').css('max-height', descriptionHeight+'px');
    $filterBox.css('height', '');
}

/*
$('#filterBox').on('click', '#operaCanvas', function (e) {
    e.stopImmediatePropagation();

    // check if a detail has been clicked and draw it
    if (canvas.detailsShown && !canvas.inDetail) {
        canvas.toggleDetails();
        var x = e.offsetX;
        var y = e.offsetY;
        var imgW = $(this).width();
        var imgH = $(this).height();
        var dets = Opera[operaID].dettagli;
        for (var i in dets) {
            var det = dets[i];
            var detX = det.x / 100 * imgW;
            var detY = det.y / 100 * imgH;
            var detW = det.width / 100 * imgW;
            var detH = det.height / 100 * imgH;
            // if clicked in a detail box
            if ((detX <= x && x <= detX + detW) && (detY <= y && y <= detY + detH)) {
                canvas.showDetail(det);
                return;
            }
        }
    } else if (canvas.inDetail) {
        if (canvas.width >= canvas.height)
            canvas.animate(0, 0, canvas.width, false);
        else
            canvas.animate(0, 0, canvas.height, false, 1);
        // restore the opera info
        $('#canvasInfo').text('Clicca l\'immagine per mostrare/nascondere i dettagli');
        var $info = $('#info');
        $info.html($info.data('operaInfo'));
        setBoxHeight();
    } else {
        canvas.toggleDetails();
    }
});
*/

canvas.enlarge = function () {
    // enlarge canvas
    $searchBox.hide();
    $('#operaWrap').children().not('#artImage').hide();
    $filterBox.data('css', $filterBox.attr('style')); // save style to restore
    $filterBox.css({
        'margin-top': '',
        'height': '100%',
        'flex-grow': 1
    });
    $artImage.data('css', $artImage.attr('style'));
    $artImage.css({
        'height': '100%',
        'flex-grow': 1
    });
    canvas.element.data('prevHeight', canvas.height); // save previous height to restore
    canvas.setHeight($artImage.height());
    canvas.element.data('virtualWidth', canvas.width*canvas.height/canvas.element.data('prevHeight')); // new image width based on height increment
    canvas.context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.context.drawImage($img[0], 0, 0, canvas.element.data('virtualWidth'), canvas.height);
};
canvas.restore = function () {
    // restore normal view
    $searchBox.show();
    $('#operaWrap').children().not('#artImage').show();
    $filterBox.attr('style', $filterBox.data('css'));
    $artImage.attr('style', $artImage.data('css'));
    canvas.setHeight(canvas.element.data('prevHeight'));
    canvas.context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.context.drawImage($img[0], 0, 0, canvas.width, canvas.height);
};

function takeNotes() {
    var $canvas = canvas.element;
    var context = canvas.context;
    var $parent = $canvas.parent();
    var larghezzaLinea = 4;
    $canvas.data('moveX', 0); // image horizontal offset when swiping with two fingers
    $canvas.data('oldMoveX', 0);

    function Touch (obj) {
        this.id = obj.identifier;
        this.pageX = obj.pageX;
        this.pageY = obj.pageY;
        this.puntoInizioDisegnoX = null;
        this.puntoInizioDisegnoY = null;
        this.posizioneCorrenteMouseX = this.pageX - $parent.offset().left;
        this.posizioneCorrenteMouseY = this.pageY - $parent.offset().top;
        this.arrX = [this.posizioneCorrenteMouseX];
        this.arrY = [this.posizioneCorrenteMouseY];
    }

    Touch.prototype.setPos = function (pos) {
        this.puntoInizioDisegnoX = this.posizioneCorrenteMouseX;
        this.puntoInizioDisegnoY = this.posizioneCorrenteMouseY;
        this.posizioneCorrenteMouseX = pos[0] - $parent.offset().left;
        this.posizioneCorrenteMouseY = pos[1] - $parent.offset().top;
        this.arrX.push(this.posizioneCorrenteMouseX);
        this.arrY.push(this.posizioneCorrenteMouseY);
    };

    Touch.prototype.draw = function () {
        context.beginPath();
        context.moveTo(this.puntoInizioDisegnoX, this.puntoInizioDisegnoY);
        context.lineTo(this.posizioneCorrenteMouseX, this.posizioneCorrenteMouseY);
        context.strokeStyle = "#FF0000";
        context.lineWidth = larghezzaLinea;
        context.stroke();
        context.closePath();
    };

    var tracks = []; // array dei tocchi
    var initX = 0; // reference point to know how to move the image
    var startId = 0;
    $canvas.on('touchmove touchstart touchend', function (e) {
        var changedTouches = e.changedTouches;
        if (startId === 0)
            startId = Math.abs(changedTouches[0].identifier); // iOS fix for negative identifier ???

        switch(e.type) {
            case 'touchstart':
                e.preventDefault();
                initX = 0;
                for (var i=0; i<changedTouches.length; i++){
                    if (changedTouches[i].identifier < 0) {
                        tracks[startId % Math.abs(changedTouches[i].identifier)] = new Touch(changedTouches[i]);
                        initX += tracks[startId % Math.abs(changedTouches[i].identifier)].posizioneCorrenteMouseX;
                    } else {
                        tracks[changedTouches[i].identifier] = new Touch(changedTouches[i]);
                        initX += tracks[changedTouches[i].identifier].posizioneCorrenteMouseX;
                    }
                }
                initX /= changedTouches.length; // medial point
                break;

            case 'touchmove':
                // max 2 changedTouches
                if (tracks.length === 1) {
                    e.preventDefault();
                    if (changedTouches[0].identifier < 0) {
                        tracks[startId % Math.abs(changedTouches[0].identifier)].setPos([changedTouches[0].pageX, changedTouches[0].pageY]);
                        tracks[startId % Math.abs(changedTouches[0].identifier)].draw();
                    } else {
                        tracks[changedTouches[0].identifier].setPos([changedTouches[0].pageX, changedTouches[0].pageY]);
                        tracks[changedTouches[0].identifier].draw();
                    }
                } else {
                    // if the detail form is showing, remove it before sliding
                    var $exists = $('#form');
                    if ($exists.length) {
                        $exists.remove();
                    }

                    // move the image
                    var curX = 0;
                    for (var i=0; i<changedTouches.length; i++){
                        if (changedTouches[i].identifier < 0) {
                            tracks[startId % Math.abs(changedTouches[i].identifier)].setPos([changedTouches[i].pageX, changedTouches[i].pageY]);
                        } else {
                            tracks[changedTouches[i].identifier].setPos([changedTouches[i].pageX, changedTouches[i].pageY]);
                        }
                    }
                    for (i=0; i<tracks.length; i++){
                        if (typeof tracks[i]  !== "undefined")
                            curX += tracks[i].posizioneCorrenteMouseX;
                        else return; // exit if a touch has been lost
                    }
                    curX /= tracks.length; // medial point
                    // don't move if out of bounds
                    if (curX - initX + $canvas.data('oldMoveX') >= canvas.width - canvas.element.data('virtualWidth') && curX - initX + $canvas.data('oldMoveX') <= 0) {
                        $canvas.data('moveX', curX - initX);
                        //console.log("moveX: " + $canvas.data('moveX')); // negative: move left, positive: move right
                        context.clearRect(0, 0, $canvas.width(), $canvas.height());
                        context.drawImage($img[0], $canvas.data('moveX') + $canvas.data('oldMoveX'), 0, canvas.element.data('virtualWidth'), canvas.height);
                    }
                }
                break;

            case 'touchend':
                startId = 0;
                if (tracks.length === 1) {
                    context.clearRect(0, 0, $canvas.width(), $canvas.height());
                    context.drawImage($img[0], $canvas.data('oldMoveX'), 0, canvas.element.data('virtualWidth'), canvas.height);
                    var arrX, arrY;
                    if (changedTouches[0].identifier < 0) {
                        arrX = tracks[startId % Math.abs(changedTouches[0].identifier)].arrX;
                        arrY = tracks[startId % Math.abs(changedTouches[0].identifier)].arrY;
                    } else {
                        arrX = tracks[changedTouches[0].identifier].arrX;
                        arrY = tracks[changedTouches[0].identifier].arrY;
                    }
                    var minCoordinataX = Math.min.apply(null, arrX);
                    var minCoordinataY = Math.min.apply(null, arrY);
                    var maxCoordinataX = Math.max.apply(null, arrX);
                    var maxCoordinataY = Math.max.apply(null, arrY);
                    var rectWidth = maxCoordinataX - minCoordinataX;
                    var rectHeight = maxCoordinataY - minCoordinataY;
                    context.beginPath();
                    context.lineWidth = 2;
                    context.strokeStyle = "#FFFF00";
                    context.rect(minCoordinataX, minCoordinataY, rectWidth, rectHeight);
                    context.stroke();
                    context.closePath();
                    var detail = {
                        relX: minCoordinataX,
                        x: minCoordinataX - $canvas.data('moveX'), // detail offset considering the image scroll
                        y: minCoordinataY,
                        width: rectWidth * 100 / canvas.width,
                        height: rectHeight * 100 / canvas.height
                    };
                    drawInputs(detail);
                } else {
                    if (e.touches.length === 0) {
                        $canvas.data('oldMoveX', $canvas.data('moveX') + $canvas.data('oldMoveX'));
                        //console.log("oldMoveX: " + $canvas.data('oldMoveX'));
                    }
                }
                for (var i=0; i<changedTouches.length; i++){
                    if (changedTouches[i].identifier < 0) {
                        delete tracks[startId % Math.abs(changedTouches[i].identifier)];
                    } else {
                        delete tracks[changedTouches[i].identifier];
                    }
                }
                if (e.touches.length === 0) {
                    tracks = [];
                }
                break;
        }
    });

    // show the text boxes and buttons to take the note
    function drawInputs(detail) {
        function saveDetail(detail) {
            console.log(detail);
            $.ajax({
                type: 'POST',
                url: 'http://ppm2019.altervista.org/query_opereDB.php',
                data: {sender: 'saveDetail', nickname: sessionStorage.getItem("nickname"), opera: opera.nome, dettaglio: JSON.stringify(detail)}
            }).done(function(data) {
                var obj = JSON.parse(data);
                if(obj.alreadyInDB === "true"){
                    alert("Dettaglio già esistente");
                }else{
                    alert("Appunto aggiunto");
                }
                $f.remove();
                context.clearRect(0, 0, $canvas.width(), $canvas.height());
                context.drawImage($img[0], $canvas.data('oldMoveX'), 0, canvas.element.data('virtualWidth'), canvas.height);
            }).fail(function(e){
                console.warn(e);
            });
        }

        // remove an already existing form
        var $exists = $('#form');
        if ($exists.length) {
            $exists.remove();
        }

        if (detail.width !== 0) { // prevents the form from showing on a single tap
            var top, left;
            var $f = $('<div id="form"></div>')
                .css({
                    'top': detail.y + detail.height * canvas.height / 100,
                    'left': detail.relX,
                    'width': $canvas.width * 0.2,
                    'height': $canvas.height * 0.2
                })
                .append('<input type="text" id="noteTitle" placeholder="Titolo">')
                .append('<textarea id="noteText" rows="10" placeholder="Appunti...">')
                .append($('<input type="button" id="noteCancBtn" value="Annulla">')
                    .on('click', function () {
                        $f.remove();
                    }))
                .append($('<input type="button" id="noteSaveBtn" value="Salva">')
                    .on('click', function () {
                        detail.nome = $('#noteTitle').val();
                        detail.descrizione = $('#noteText').val();
                        delete detail.relX;
                        saveDetail(detail);
                    })
                );

            $artImage.append($f);

            var formHeight = document.getElementById('form').clientHeight;
            var formWidth = document.getElementById('form').clientWidth;
            if (canvas.height - (detail.y + (detail.height) * canvas.height / 100) < formHeight) {
                if (detail.y < formHeight) {
                    top = canvas.height / 2 - formHeight / 2;
                } else
                    top = detail.y - formHeight - 15;
            } else
                top = detail.y + (detail.height) * canvas.height / 100 + 15;
            left = canvas.width / 2 - formWidth / 2;

            $f.css({
                'top': top,
                'left': left
            });
        }
    }
}

canvas.showDetail = function(detail, fromSearch) {
    if (fromSearch === undefined)
        fromSearch = false;
    var imgW = canvas.width;
    var imgH = canvas.height;
    var detX = detail.x/100*imgW;
    var detY = detail.y/100*imgH;
    var detW = detail.width/100*imgW;
    var detH = detail.height/100*imgH;
    if (detW >= detH)
        detH = detW;
    else
        detW = detH;

    var maxP, zoom = 0, top, left;
    if (imgW >= imgH){
        maxP = (imgH-40)*100/imgW;
        zoom = maxP*100/(detW*100/imgW); // ingrandimento in modo che il dettaglio occupi il maxP% in larghezza dello spazio disponibile
        top = (detY*zoom/100)-20;//centra l'immagine in altezza
        left = (detX*zoom/100)-(100-maxP)/2*imgW/100;//centra l'immagine in larghezza
        canvas.animate(-top, -left, zoom/100*$artImage.width(), fromSearch);
    }
    if (imgW < imgH){
        maxP = (imgW-40)*100/imgH;
        zoom = maxP*100/(detH*100/imgH);
        top = (detY*zoom/100)-20;
        left = (detX*zoom/100)-(100-maxP)/2*imgH/100;
        canvas.animate(-top, -left, zoom/100*$artImage.height(), fromSearch, 1);
    }

    // update info
    $('#canvasInfo').text('Clicca l\'immagine per tornare all\'opera completa');
    $('#title').html($('#title h2').html($('#name').text(detail.nome)));
    $('#description').text(detail.descrizione);

    setBoxHeight();
};

// TODO: this will be removed, the  searchBox will be only used to search notes titles
// highlight searched text or special artwork information or show detail
var $textWrap = $('#info');
var original;
$('#searchBox input')
    .on('keyup', function(){
        $textWrap.html(original);

        var details = Opera[operaID].dettagli;
        var word = $(this).val().replace(/[^a-zA-Z0-9]/g, "").toLowerCase(); // input string
        // if looking for a detail, show it immediately
        // FIXME: opening a detail when one is already opened causes the detail to shrink to previous one dimension
        for (var det in details) {
            if (word === details[det].nome.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()) {
                canvas.showDetail(details[det], true);
                original = $textWrap.html();
                $(this).trigger('focusout');
                return;
            }
        }

        // else look for the word or special info and mark it
        // if the searched word is a special info (museo, autore, ...), highlight it
        $('[data-info]').each(function () {
            var queries = $(this).attr('data-info').split(" ");
            if (queries.includes(word)) {
                $(this).wrap('<mark></mark>');
                speak($(this).text());
            }
        });

        // cycle through the text until no matches are found
        var $description = $textWrap.children('#description');
        var output = $description.html();
        var i = 0;
        while (i+word.length<=output.length) {
            // get the index of a word that matches the input string (regex \b matches only begin of words)
            var start = output.replace(/[^a-zA-Z0-9]/g, " ").toLowerCase().regexIndexOf(new RegExp("\\b"+word, "g"), i);
            var end = start+word.length;
            if (start >= 0) {
                var $wrap = $(document.createElement("mark")) // wrap the text with mark html5 element to highlight it
                    .text(output.substring(start, end));
                output = [output.slice(0, start), $wrap[0].outerHTML, output.slice(end)].join('');
            } else break;
            i += start+$wrap[0].outerHTML.length;
        }
        $description.html(output);
    })
    // save the original text
    .on('focus', function () {
        original = $textWrap.html();
    })
    // restore the original text
    .on('focusout', function () {
        $textWrap.html(original);
        $(this).val('');
    });

// new function that acts like indexOf() but accepts regex
String.prototype.regexIndexOf = function(regex, startpos) {
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
};

// FIXME: this only reads for a limited time (about 15 seconds) (so it depends on the speech speed (rate)), a longer text needs to be chunked (it's best to split on full stops and commas)
$('#readDescBtn').on('click', function (e) {
    e.stopImmediatePropagation();
    if ($(this).attr("data-playing")) {
        synth.cancel();
        $(this)
            .text("Leggi descrizione")
            .removeAttr("data-playing");
    } else {
        speak($('#description').text());
        $(this)
            .html("&nbsp;&nbsp;&nbsp;Ferma lettura&nbsp;&nbsp;&nbsp;")
            .attr("data-playing", "true");
    }
});