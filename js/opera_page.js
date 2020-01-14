var opera = Opera[operaID];
var $filterBox;
var $artImage;
var $img;
var nickname = sessionStorage.getItem("nickname");

var canvas = {
    element: $(document.createElement('canvas'))
        .attr('class', 'operaCanvas') // class because there will be another canvas on top
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
            this.detailsShown = true;
            this.context.lineWidth = 2;
            this.context.strokeStyle = "yellow";
            var $detailsList = $('<ul id="detailsList"></ul>');
            if (details.length === 0)
                $detailsList.append('<li>Nessun dettaglio presente</li>');
            for (var i in details) {
                this.context.strokeRect(details[i].x/100*this.width,details[i].y/100*this.height,details[i].width/100*this.width,details[i].height/100*this.height);
                $detailsList.append($('<li id="'+details[i]["id"]+'">'+details[i]["nome"]+'</li>')
                    .on('click', function () { // redraw details but with the clicked one highlighted
                        var btn = this;
                        $(this).css('color', '#ec1f1f');
                        $(this).parent().children().not($(this)).css('color', 'white');
                        canvas.context.fillStyle = "rgba(255, 255, 0, 0.5)";
                        canvas.context.clearRect(0, 0, canvas.width, canvas.height);
                        canvas.context.drawImage($img[0], 0, 0, canvas.width, canvas.height);
                        var clickedDetail;
                        $.each(details, function (index, det) {
                            canvas.context.strokeRect(det.x/100*canvas.width,det.y/100*canvas.height,det.width/100*canvas.width,det.height/100*canvas.height);
                            if (btn.id === det["id"]) {
                                clickedDetail = det;
                                canvas.context.fillRect(det.x / 100 * canvas.width, det.y / 100 * canvas.height, det.width / 100 * canvas.width, det.height / 100 * canvas.height);
                            }
                        });
                        // change topBtn to open detail
                        $('#topBtn')
                            .text("Apri appunto")
                            .addClass('endBtn')
                            .off().on('click', function () {
                                canvas.inDetail = true;
                                canvas.enlarge();
                                canvas.context.clearRect(0, 0, canvas.element.width(), canvas.element.height());
                                var detRelX = clickedDetail.relX;
                                var detX = clickedDetail.x /100 * canvas.element.data('virtualWidth');
                                var detY = clickedDetail.y /100 * canvas.height;
                                var detW = clickedDetail.width /100 * canvas.element.data('virtualWidth');
                                var detH = clickedDetail.height /100 * canvas.height;
                                var offsetX = -detX+(-detW/2+canvas.width)/2;
                                var onEdge = true;
                                // either center the image and the detail box or keep it off center if reached the image edge
                                if (offsetX < canvas.element.data("maxMoveX"))
                                    offsetX = canvas.element.data("maxMoveX");
                                else if (offsetX > 0)
                                    offsetX = 0;
                                else
                                    onEdge = false;
                                canvas.context.drawImage($img[0], offsetX, 0, canvas.element.data('virtualWidth'), canvas.height);
                                canvas.context.lineWidth = 2;
                                canvas.context.strokeStyle = "yellow";
                                if (onEdge)
                                    canvas.context.strokeRect(detRelX, detY, detW, detH);
                                else
                                    canvas.context.strokeRect((-detW/2 + canvas.width)/2, detY, detW, detH);

                                // draw inputs to modify and delete the note
                                drawInputs(clickedDetail, true);

                                $(this).text('Torna agli appunti')
                                    .off().on('click', function (e) {
                                        canvas.inDetail = false;
                                        // remove an the form
                                        var $exists = $('#form');
                                        if ($exists.length) {
                                            $exists.remove();
                                        }
                                        canvas.restore();
                                        $(this).text('Prendi appunti')
                                            .removeClass('endBtn')
                                            .off().on('click', function () {
                                                startNote($(this), e);
                                        });
                                });
                                showTutorial("edit_note");
                            });
                        showTutorial("open_note");
                    })
                );
            }
            // write details list
            var $info = $('#info');
            $info.children().hide();
            $info.append(($('<h2 id="listHeader">Lista appunti</h2>')));
            $info.append($detailsList);
            // calculate the correct detailsList height to fill the screen
            var filterBoxMaxHeight = $('#wrapper').height();
            $filterBox.outerHeight(filterBoxMaxHeight, true);
            $filterBox.css('max-height', filterBoxMaxHeight+'px');
            var descriptionHeight = $info.height()-$('#listHeader').height()-parseInt($detailsList.css('margin-top'));
            $detailsList.css('max-height', descriptionHeight+'px');
            $filterBox.css('height', '');
        } else {
            this.detailsShown = false;
            // remove details
            this.context.clearRect(0, 0, this.width, this.height);
            this.context.drawImage($img[0], 0, 0, this.width, this.height);
            $('#listHeader').remove();
            $('#detailsList').remove();
            $('#info').children().show();
        }
    },
    showDetail: function(detail, fromSearch) {
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
        $('#canvasInfo').text('Clicca l\'immagine per tornare ai dettagli');
        $('#title').html($('#title h2').html($('#name').text(detail.nome)));
        $('#description').text(detail.descrizione);
        $('#detailsList').remove();
        $('#info').children().show();
        setBoxHeight();
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
    $searchBox.hide(); // no use for searchBox as of now
    $filterBox.css('margin-top', '');
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

        if (nickname) {
            showTutorial(currentPage); // wait for the operaWrap to be filled to get the correct position for tutorials
            fetchDetails(); // fetch the details immediately supposing the user will want to see them

            $('#topBtn').on('click', function (e) {
                startNote($(this), e);
            });
        }

    });
});

// functions of the topBtn to start and stop taking notes
function startNote($t, e) {
    if (e !== undefined)
        e.stopImmediatePropagation();
    $t.text('Fine')
        .addClass('endBtn');
    canvas.enlarge();
    takeNotes();
    $t.off().on('click', function () {
        stopNote(e, $t);
    });

    showTutorial("take_notes"); // wait for the operaWrap to be filled to get the correct position for tutorials
}

function stopNote(e, $t) {
    e.stopImmediatePropagation();
    // prevent a form to persist when restoring the normal view
    var $exists = $('#form');
    if ($exists.length) {
        $exists.remove();
    }

    $t.text('Prendi appunti')
        .removeClass('endBtn');
    canvas.element.off('touchmove touchstart touchend'); // disable canvas draw interactions
    $.when(fetchDetails()).always(function () {
            canvas.restore();
        });

    $t.off().on('click', function () {
        startNote($t, e);
    });
}

function setBoxHeight() { // calculate the correct description height to fill the screen
    var filterBoxMaxHeight = $('#wrapper').height();
    $filterBox.outerHeight(filterBoxMaxHeight, true);
    $filterBox.css('max-height', filterBoxMaxHeight+'px');
    var descriptionHeight = $('#info').height()-$('#title').height()-parseInt($('#description').css('margin-top'));
    $('#description').css('max-height', descriptionHeight+'px');
    $filterBox.css('height', '');
}

// fetch the details from the database when loading the opera_page
var details;
function fetchDetails () {
    var dfd = $.Deferred(); // return a promise when done fetching
    if (nickname) {
        $.ajax({
            type: 'POST',
            url: 'https://ppm2019.altervista.org/query_opereDB.php',
            data: {sender: 'loadDetail', nickname: nickname, opera: operaID}
        }).done(function(data) {
                if(data === "0 results"){
                    console.log("Non ci sono dettagli");
                    details = [];
                }else{
                    details = JSON.parse(data); // details array
                    details.sort(function(a,b){
                        return a.nome.toLowerCase().localeCompare(b.nome.toLowerCase());
                    });
                    console.log(details);
                }
                dfd.resolve({loggedIn: true});
            }).fail(function(e){
                console.warn("Caricamento dettagli fallito");
                console.log(e);
                dfd.reject();
                alert("Caricamento dettagli fallito");
            });
    } else {
        dfd.resolve({loggedIn: false});
    }
    return dfd.promise();
}

function canvasClick(e) {
    e.stopImmediatePropagation();
    if (nickname) {
        if (canvas.detailsShown && !canvas.inDetail) { // check if a detail has been clicked
            var x = e.offsetX;
            var y = e.offsetY;
            var imgW = canvas.width;
            var imgH = canvas.height;
            for (var i in details) {
                var det = details[i];
                var detX = det.x / 100 * imgW;
                var detY = det.y / 100 * imgH;
                var detW = det.width / 100 * imgW;
                var detH = det.height / 100 * imgH;
                // if clicked in a detail box
                if ((detX <= x && x <= detX + detW) && (detY <= y && y <= detY + detH)) {
                    //canvas.showDetail(det);
                    $('#'+details[i]["id"]).trigger('click');
                    return;
                }
            }
        }/*
        else if (canvas.inDetail) { // if in a detail zoom out and back to details list
            canvas.toggleDetails();
            if (canvas.width >= canvas.height)
                canvas.animate(0, 0, canvas.width, false);
            else
                canvas.animate(0, 0, canvas.height, false, 1);
            // restore the opera info
            $('#canvasInfo').text('Clicca l\'immagine per mostrare/nascondere i dettagli');
            canvas.toggleDetails();

        }*/
        // draw details boxes
        $('#topBtn').text('Prendi appunti')
            .removeClass('endBtn')
            .off().on('click', function (e) {
            startNote($(this), e);
        });
        canvas.toggleDetails();
        if (details.length)
            showTutorial("notes_list");
    } else {
        alert("Esegui il login per visualizzare gli appunti presi");
    }
}
$('#filterBox').on('click', '.operaCanvas', function (e) {
    canvasClick(e);
});

var detailsWereShown = false;
canvas.enlarge = function () { // enlarge canvas
    if (canvas.detailsShown) { // if showing details hide them
        canvas.toggleDetails();
        detailsWereShown = true;
    }
    //$searchBox.hide();
    $('#operaWrap').children().not('#artImage').hide();
    $filterBox.data('css', $filterBox.attr('style')) // save style to restore
        .css({
            'margin-top': '',
            'height': '100%',
            'flex-grow': 1
        })
        .off();
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
    canvas.element.data("maxMoveX", -(canvas.element.data('virtualWidth') - canvas.width)); // useful when moving the image
};

canvas.restore = function () { // restore normal view
    //$searchBox.show();
    $('#operaWrap').children().not('#artImage').show();
    $filterBox.attr('style', $filterBox.data('css'))
        .on('click', '.operaCanvas', function (e) {
            canvasClick(e);
        });
    $artImage.attr('style', $artImage.data('css'));
    canvas.setHeight(canvas.element.data('prevHeight'));
    canvas.context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.context.drawImage($img[0], 0, 0, canvas.width, canvas.height);
    if (detailsWereShown) { // restore previous details state
        canvas.toggleDetails();
        detailsWereShown = false;
    }
};

function takeNotes() {
    var $canvas = canvas.element;
    var context = canvas.context;
    var $parent = $canvas.parent();
    var larghezzaLinea = 4;
    $canvas.data('moveX', 0); // image horizontal offset when swiping with two fingers
    $canvas.data('totMoveX', 0);

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
        touchRec(e);
    });
    function touchRec(e) {
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
                    if (curX - initX + $canvas.data('totMoveX') >= canvas.width - canvas.element.data('virtualWidth') && curX - initX + $canvas.data('totMoveX') <= 0) {
                        $canvas.data('moveX', curX - initX);
                        //console.log("moveX: " + $canvas.data('moveX')); // negative: move left, positive: move right
                        context.clearRect(0, 0, $canvas.width(), $canvas.height());
                        context.drawImage($img[0], $canvas.data('moveX') + $canvas.data('totMoveX'), 0, canvas.element.data('virtualWidth'), canvas.height);
                    }
                }
                break;

            case 'touchend':
                startId = 0;
                if (tracks.length === 1) {
                    context.clearRect(0, 0, $canvas.width(), $canvas.height());
                    context.drawImage($img[0], $canvas.data('totMoveX'), 0, canvas.element.data('virtualWidth'), canvas.height);
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
                        x: (minCoordinataX - $canvas.data('totMoveX')) * 100 / canvas.element.data("virtualWidth"), // detail offset considering the image scroll
                        y: minCoordinataY * 100 / canvas.height,
                        width: rectWidth * 100 / canvas.element.data("virtualWidth"),
                        height: rectHeight * 100 / canvas.height
                    };
                    drawInputs(detail, false, touchRec); // pass the function to be reattached
                } else {
                    if (e.touches.length === 0) {
                        var totMoveX = $canvas.data('moveX') + $canvas.data('totMoveX');
                        if (totMoveX <= 0) {
                            if (totMoveX >= $canvas.data("maxMoveX")) // maxMoveX <= totMoveX <= 0
                                $canvas.data('totMoveX', totMoveX);
                            else
                                $canvas.data('totMoveX', $canvas.data("maxMoveX"));
                        }
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
    }
}

// show the text boxes and buttons to take the note
function drawInputs(detail, existingDetail, func) {
    if (existingDetail === undefined)
        existingDetail = false;

    function saveDetail(detail) {
        console.log(detail);
        $.ajax({
            type: 'POST',
            url: 'https://ppm2019.altervista.org/query_opereDB.php',
            data: {sender: 'saveDetail', nickname: nickname, opera: operaID, dettaglio: JSON.stringify(detail)}
        }).done(function(data) {
            var obj = JSON.parse(data);
            if(obj["alreadyInDB"] === "true"){
                alert("Nome dettaglio già esistente");
            }else{
                alert("Appunto salvato");
            }
            $f.remove();
            canvas.context.clearRect(0, 0, canvas.element.width(), canvas.element.height());
            canvas.context.drawImage($img[0], canvas.element.data('totMoveX'), 0, canvas.element.data('virtualWidth'), canvas.height);
        }).fail(function(e){
            console.warn(e);
            alert("Connesione fallita");
        });
    }

    function modifyDetail(detail) {
        $.ajax({
            type: 'POST',
            url: 'https://ppm2019.altervista.org/query_opereDB.php',
            data: {sender: 'modifyDetail', nickname: nickname, opera: operaID, modifica: JSON.stringify(detail)}
        }).done(function(data) {
            var obj = JSON.parse(data);

            if(obj["newNameisInDB"] === "true"){
                alert("Dettaglio "+detail.nome+" già esistente");
            } else {
                alert("Appunto modificato");
            }

            $f.remove();
            $.when(fetchDetails()).always(function () {
                canvas.inDetail = false;
                canvas.restore();
                $('#topBtn').text('Prendi appunti')
                    .removeClass('endBtn')
                    .off().on('click', function () {
                    startNote($(this));
                });
            });
        }).fail(function(e){
            console.warn(e);
            alert("Connesione fallita");
        });
    }

    function deleteDetail(detail) {
        $.ajax({
            type: 'POST',
            url: 'https://ppm2019.altervista.org/query_opereDB.php',
            data: {sender: 'deleteDetail', nickname: nickname, opera: operaID, nome: detail.nome}
        }).done(function(data) {
            var obj = JSON.parse(data);

            if(obj["deleteFromDB"] === "true"){
                alert("Dettaglio eliminato correttamente");
            }else{
                alert("Problemi nell'eliminare il dettaglio");
            }

            $f.remove();
            $.when(fetchDetails()).always(function () {
                canvas.inDetail = false;
                canvas.restore();
                $('#topBtn').text('Prendi appunti')
                    .removeClass('endBtn')
                    .off().on('click', function () {
                    startNote($(this));
                });
            });
        }).fail(function(e){
            console.warn(e);
            alert("Connesione fallita");
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
                'width': canvas.width * 0.8
            });
        if (!existingDetail) {
            canvas.element.off('touchmove touchstart touchend'); // disable the handler
            $f
                .append('<input type="text" id="noteTitle" placeholder="Titolo">')
                .append('<textarea id="noteText" rows="10" placeholder="Appunti...">')
                .append($('<input type="button" id="noteCancBtn" class="noteBtn" value="Annulla">')
                .on('click', function () {
                    $f.remove();
                    canvas.context.clearRect(0, 0, canvas.element.width(), canvas.element.height());
                    canvas.context.drawImage($img[0], canvas.element.data('totMoveX'), 0, canvas.element.data('virtualWidth'), canvas.height);
                    canvas.element.on('touchmove touchstart touchend', function (e) { // reattach the handler
                        func(e);
                    });
                }))
                .append($('<input type="button" id="noteSaveBtn" class="noteBtn" value="Salva">')
                    .on('click', function () {
                        detail.nome = $('#noteTitle').val();
                        detail.descrizione = $('#noteText').val();
                        saveDetail(detail);
                        canvas.element.on('touchmove touchstart touchend', function (e) {
                            func(e);
                        });
                    })
                );
        } else {
            $f
                .append('<input type="text" id="noteTitle" value="'+detail.nome+'">')
                .append('<textarea id="noteText" rows="10">'+detail.descrizione+'</textarea>>')
                .append($('<input type="button" id="noteDeleteBtn" class="noteBtn" value="Elimina">')
                    .on('click', function () {
                        deleteDetail(detail);
                    }))
                .append($('<input type="button" id="noteModifyBtn" class="noteBtn" value="Salva">')
                    .on('click', function () {
                        detail.old_nome = detail.nome;
                        detail.nome = $('#noteTitle').val();
                        detail.descrizione = $('#noteText').val();
                        modifyDetail(detail);
                    })
                );
        }

        $artImage.append($f);

        var formHeight = document.getElementById('form').clientHeight;
        var formWidth = document.getElementById('form').clientWidth;
        var detY = detail.y * canvas.height / 100;
        var detH = detail.height * canvas.height / 100;
        if (canvas.height - (detY + detH) < formHeight) {
            if (detY < formHeight) {
                top = canvas.height / 2 - formHeight / 2;
            } else
                top = detY - formHeight - 15;
        } else
            top = detY + detH + 15;
        left = canvas.width / 2 - formWidth / 2;

        $f.css({
            'top': top,
            'left': left
        });
    }
}

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

// FIXME (Chrome pc only): this only reads for a limited time (about 15 seconds) (so it depends on the speech speed (rate)), a longer text needs to be chunked (it's best to split on full stops and commas)
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

$(window).on('unload', function () {
    synth.cancel();
});