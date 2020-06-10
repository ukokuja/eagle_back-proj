// Article  Javascript 
function initArticle() {


    $(window).on('scroll', function () {
        var scroll = $(window).scrollTop();
        var descriptionTop = $('#description').offset().top;
        var descriptionHeight = $('#description').height();
        var detailsTop = $('#details').offset().top;
        var detailsHeight = $('#details').height();

        initScrollInteraction(scroll, descriptionTop, descriptionHeight, detailsTop, detailsHeight);
    });

    initSeeMore();
}
function initSeeMore () {
    $('#description .expand').click(function(element) {
        $(this).parent().toggleClass('open');
    })
}
function initScrollInteraction(scroll, descriptionTop, descriptionHeight, detailsTop, detailsHeight) {
    if (scroll + 50 > descriptionTop + descriptionHeight) {
        $('.nav-item:nth-of-type(1)').removeClass('active');
        if (scroll + 50 > detailsTop + detailsHeight) {
            $('.nav-item:nth-of-type(3)').addClass('active');
            $('.nav-item:nth-of-type(2)').removeClass('active');
        } else {
            $('.nav-item:nth-of-type(2)').addClass('active');
            $('.nav-item:nth-of-type(3)').removeClass('active');
        }
    } else {
        $('.nav-item:nth-of-type(1)').addClass('active');
        $('.nav-item:nth-of-type(2)').removeClass('active');
    }
}
function initFooterInteraction(form) {
    $(window).on('scroll', function () {
        var scroll = $(window).scrollTop();
        var itineraryTop = $('#itinerary').offset().top;
        if ((scroll + 300) > itineraryTop) {
            $("#footer").fadeOut("fast");
        } else {
            $("#footer").fadeIn("fast");
        }
    });
    $("#footer button").click(function (){
        $(form).submit();
    })
}
function initEditor() {

    // Loop over them and prevent submission

    var form = initFormValidation();
    initBinding();
    initModalSchedule();
    initModalImages();
    initFooterInteraction();
}
function initModalImages() {
    var originalImage = $('header').css('background-image');
    var selectedImage = originalImage;
    $("#imagesModal figure").click(function () {
        $("#imagesModal figure").each(function () {
            $(this).removeClass('selected');
        })
        selectedImage = $(this).children('img').attr('src');
        $(this).addClass('selected');
    })

    $("#imagesModal .modal-footer button:last-of-type").click(function () {
        $("input[name='image']").val(selectedImage);
        $('header').css('background-image', 'url(' + selectedImage + ')');
    })
}
function initModalSchedule() {
    $('#editModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        var timeFrom = button.data('timeFrom') // Extract info from data-* attributes
        var timeTo = button.data('timeTo') // Extract info from data-* attributes
        var place = button.data('place') // Extract info from data-* attributes
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this)
        modal.find('.modal-title').text(place || "Choose a new stop")
        modal.find('.modal-body #place').val(place)
        modal.find('.modal-body #timeFrom').timepicker('setTime', timeFrom)
        modal.find('.modal-body #timeTo').timepicker('setTime', timeTo)
    })
}
function initFormValidation() {
    var editForm = $('#editForm');
    editForm.submit(function (event) {
        if (editForm[0].checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }
        editForm[0].classList.add('was-validated');
    });
    Array.prototype.filter.call(editForm, function (form) {
        for (var i = 0; i < form.length; i++) {
            if (form[i].className.indexOf('no-validate') < 0) {
                form[i].oninvalid = function (e) {
                    e.target.className = e.target.className.replace(/\bis-invalid\b/, '');
                    e.target.className = e.target.className.replace(/\bis-valid\b/, '');
                    e.target.className += ' is-invalid'
                }
                form[i].onkeydown = function (e) {
                    e.target.className = e.target.className.replace(/\bis-invalid\b/, '');
                    e.target.className = e.target.className.replace(/\bis-valid\b/, '');
                }
    
                form[i].onblur = function (e) {
                    e.target.className = e.target.className.replace(/\bis-invalid\b/, '');
                    e.target.className = e.target.className.replace(/\bis-valid\b/, '');
                    e.target.checkValidity();
                    e.target.parentNode.classList.add('was-validated');
                }
            }
            
        }
    });
    return editForm;
}
function initBinding() {
    $("#title").change(function (e) {
        $(".breadcrumbs h2").html(this.value);
    })
}
//Navigate Javascript
function initNavigator() {

    var stops = getStops();
    var drones = getDronePositions();
    var map = addMapWithStyle();
    for (var i in drones) {
        drones[i].drone = setDrone(map, drones[i].location)
    }
    var dots = [];
    for (var i in stops) {
        L.marker(stops[i].location).addTo(map);
        dots.push(stops[i].location)
    }

    initPath(dots, map);

    getRealtimeGeoposition(map, drones)

    initHamburguer();

}
function setDrone(map, pos) {
    var myIcon = L.icon({
        iconUrl: 'images/drone.png',
        iconSize: [50, 50],
    });
    return L.marker(pos, { icon: myIcon }).addTo(map);
}
function getStops() {
    return [{
        name: "Ein Gedi",
        location: [31.469835, 35.3283313],
    },
    {
        name: "First stop",
        location: [31.465169, 35.3521382],
    },
    {
        name: "Second stop",
        location: [31.459354, 35.3579443]
    },
    {
        name: "Third stop",
        location: [31.455787, 35.3677043],
    }]
}

function getDronePositions() {
    return [{
        name: "Back",
        location: [31.465718, 35.3510653]
    },
    {
        name: "Right",
        location: [31.465718, 35.3516873]
    },
    {
        name: "Front",
        location: [31.465169, 35.3521382]
    },
    {
        name: "Left",
        location: [31.464931, 35.3515913]
    }];
}

function addMapWithStyle() {
    var map = L.map('map', {
        center: [31.4664, 35.387983],
        zoom: 5,
        preferCanvas: true,
        zoomControl: false,
        maxZoom: 20
    });
    // couche OpenStreetMap
    var Jawg_Dark = L.tileLayer('https://{s}.tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
        attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 0,
        maxZoom: 22,
        subdomains: 'abcd',
        accessToken: 'R8kO0sUL739jOGWGaqGxQ5B9zaioziEMlP0RKMX7ZCIQ80LCmSmmQTuMqUFCs104'
    });
    map.addLayer(Jawg_Dark);

    map.setView(new L.LatLng(31.465718, 35.3510653), 17);
    
    return map;
}

function initPath(dots, map) {
    var polyline = L.polyline(dots, {
        color: '#AAA', dashArray: "20, 15", weight: 5,
        lineJoin: 'round'
    }).addTo(map);
}

function getRealtimeGeoposition(map, drones) {
    setInterval(function () {
        for (var i in drones) {
            drones[i].location = [drones[i].location[0] - 0.00005, drones[i].location[1] + 0.00005]
            drones[i].drone.setLatLng(drones[i].location);
        }
        map.panTo(new L.LatLng(drones[2].location[0], drones[2].location[1]), { animation: true });
    }, 1000)
}

function initHamburguer() {
    $('header > section').click(function () {
        $('body').toggleClass('isHamburgerOpen');
    })
    $('#map').click(function () {
        $('body').removeClass('isHamburgerOpen');
    })
}

