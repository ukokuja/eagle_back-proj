// constants
var warningCodes = {
  "HIGH": 'high',
  "MEDIUM": 'medium',
  "LOW": 'low'
}
var warningSdk = {
  "ignore": ignoreFn,
  "sos": executeSOSFn,
  "escalate": escalateFn,
  "snooze": snooze
}
// data
var editorMapProps = {
  editMarker: false,
  isMapInitialized: false,
  map: false
}
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
function copyShare() {
  $(".message").text("link copied");
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

function getDestinationHTML (destination) {
  return `
          <div class="card border-light mb-3">
             <div class="card-header" id="headingOne">
                <h2 class="mb-0">
                   <button class="btn btn-link text-left" type="button" data-toggle="collapse"
                      data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                   ${destination.start_time_parsed} - ${ destination.stop_time_parsed} - ${ destination.name }
                   </button>
                   <button class="btn btn-link" type="button" data-target="#editModal"
                      data-id="${ destination.id }"
                      data-time-from="${ destination.start_time_parsed}"
                      data-time-to="${ destination.stop_time_parsed}" data-place="${ destination.name }"
                      data-description="${ destination.description }" aria-expanded="true"
                      aria-controls="collapseOne"
                      data-toggle="modal">
                   <i class="fa fa-edit"></i>
                   </button>
                   <button class="btn btn-link" type="button" data-target="#collapseOne" aria-expanded="true"
                      aria-controls="collapseOne">
                   <i class="far fa-trash-alt" onclick="removeDestination(${destination.id})"></i>
                   </button>
                </h2>
             </div>
             <div id="collapseOne" class="collapse show" aria-labelledby="headingOne"
                data-parent="#accordionExample">
                <div class="card-body">
                   ${ destination.description }
                </div>
             </div>
          </div>`
}
function renderDestinations () {
  $("#destinationContainer").html("")
  var destinations = JSON.parse($("#id_destinations").val())
  for (var i in destinations) {
    if (destinations[i].is_active) {
      var html = getDestinationHTML(destinations[i])
      var newDestination = document.createElement('div')
      newDestination.className = "accordion"
      newDestination.setAttribute('id', 'accordionExample')
      newDestination.innerHTML = html
      console.log('appended')
      $("#destinationContainer").append(newDestination)
    }
  }
}
function initEditor() {

    // Loop over them and prevent submission
    var form = initFormValidation();
    initBinding();
    initModalSchedule();
    initModalImages();
    initFooterInteraction();
    renderDestinations();
}
function initModalImages() {
    var originalIid = $('header').data('id');
    var originalImage = $('header').css('background-image');
    $("input[name='image']").val(originalIid);
    var selectedId = originalIid;
    var selectedImage = originalImage;
    $("#imagesModal figure").click(function () {
        $("#imagesModal figure").each(function () {
            $(this).removeClass('selected');
        })
        selectedId = $(this).children('img').data('id');
        selectedImage = $(this).children('img').attr('src');
        $(this).addClass('selected');
    })

    $("#imagesModal .modal-footer button:last-of-type").click(function () {
        $("input[name='image']").val(selectedId);
        $('header').css('background-image', 'url(' + selectedImage + ')');
    })
}

function setModalFields(place, description, timeFrom, timeTo) {
  var modal = $(this)
  modal.find('.modal-title').text(place || "Choose a new stop")
  modal.find('.modal-body #place').val(place)
  modal.find('.modal-body #descriptionField').val(description)
  modal.find('.modal-body #timeFrom').timepicker({'showMeridian': false})
  modal.find('.modal-body #timeTo').timepicker({'showMeridian': false})
  modal.find('.modal-body #timeFrom').timepicker('setTime', timeFrom)
  modal.find('.modal-body #timeTo').timepicker('setTime', timeTo)
}

function saveDestiantions(destinations, id) {
  $("#editModal .btn-primary").click(function () {
    var position = editorMapProps.editMarker.getLatLng()
    var destination = {
      stop: {
        place: {}
      }
    }
    if (id) {
      destination = destinations.find(d => d.id == id)
    }
    destination.start_time_parsed = $("#timeFrom").val()
    destination.stop_time_parsed = $("#timeTo").val()
    destination.name = $("#place").val()
    destination.description = $("#descriptionField").val()
    destination.stop.place.longitude = position.lng
    destination.stop.place.latitude = position.lat
    destination.is_active = true
    if (!id)  {
      destinations.push(destination)
    }
    $("#id_destinations").val(JSON.stringify(destinations))
    renderDestinations();
  })
}

function getDestinationParameters(button) {
  var timeFrom = button.data('timeFrom') // Extract info from data-* attributes
  var timeTo = button.data('timeTo') // Extract info from data-* attributes
  var place = button.data('place') // Extract info from data-* attributes
  var description = button.data('description') // Extract info from data-* attributes
  var id = button.data('id') // Extract info from data-* attributes
  return {timeFrom, timeTo, place, description, id};
}

function setEditModalMap(destinations, id) {
  var stops = getStops(destinations);
  var centerLocation = [31.4664, 35.387983]
  if (stops.length > 0) {
    centerLocation = stops[stops.length - 1].location
    if (id && id > -1) {
      centerLocation = stops.find(s => s.id == id).location
    }
  }
  var map = addMapWithStyle(centerLocation);
  var dots = [];
  for (var i in stops) {
    var marker = L.marker(stops[i].location).addTo(map);
    if (stops[i].id == id) editorMapProps.editMarker = marker
    dots.push(stops[i].location)
  }
  // var line = initPath(dots, map);
  setTimeout(function(){
    map.invalidateSize()
  }, 2000)

  if (!id) {
    editorMapProps.editMarker = new L.marker(centerLocation)
  }
  map.on('click', function (e){
    if (editorMapProps.editMarker) map.removeLayer(editorMapProps.editMarker)
    editorMapProps.editMarker = new L.marker(e.latlng).addTo(map);
  });
}


function initModalSchedule() {
    var destinations = JSON.parse($("#id_destinations").val())
  $('#editModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        var {timeFrom, timeTo, place, description, id} = getDestinationParameters(button);
        setModalFields.call(this, place, description, timeFrom, timeTo);
        setEditModalMap(destinations, id);
        saveDestiantions(destinations, id);
    })
}
function removeDestination(id) {
  var destinations = JSON.parse($("#id_destinations").val())
  destination = destinations.find(d => d.id == id)
  destination.is_active = false
  $("#id_destinations").val(JSON.stringify(destinations))
  renderDestinations();
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
function initNavigator(executionId) {

    var stops = getStops(destinations);
    var drones = getDronePositions();
    var map = addMapWithStyle(drones[0].location);
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
    initWarningListener(executionId);

}
function setDrone(map, pos) {
    var myIcon = L.icon({
        iconUrl: '/static/images/drone.png',
        iconSize: [50, 50],
    });
    return L.marker(pos, { icon: myIcon }).addTo(map);
}
function getStops(destinations) {
    var stops = []
    for (var i in destinations) {
      stops.push({
        "id": destinations[i].id,
        "name": destinations[i].stop.place.name ,
        "location": [
            destinations[i].stop.place.latitude,
            destinations[i].stop.place.longitude]
      })
    }
    return stops
}

function getDronePositions() {
    return drones;
}

function addMapWithStyle(center) {
    if (!editorMapProps.isMapInitialized) {
      editorMapProps.isMapInitialized = true
      editorMapProps.map = L.map('map', {
          center: center,
          zoom: 5,
          preferCanvas: true,
          zoomControl: false,
          maxZoom: 20
      });
    }
    // couche OpenStreetMap
    var Jawg_Dark = L.tileLayer('https://{s}.tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
        attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 0,
        maxZoom: 22,
        subdomains: 'abcd',
        accessToken: 'R8kO0sUL739jOGWGaqGxQ5B9zaioziEMlP0RKMX7ZCIQ80LCmSmmQTuMqUFCs104'
    });
    editorMapProps.map.addLayer(Jawg_Dark);

    editorMapProps.map.setView(new L.LatLng(center[0], center[1]), 17);
    
    return editorMapProps.map;
}

function initPath(dots, map) {
    return L.polyline(dots, {
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

function initWarningListener (executionId) {
  var interval = setInterval(function () {
    navigator.geolocation.getCurrentPosition(function (pos){
      $.ajax({
          url: "get_warnings/" +executionId,
          type: 'post',
          data: {
            latitude: 31.459354,
            // latitude: pos.coords.latitude,
            longitude: 35.3579443
            // longitude:pos.coords.longitude
          },
          success: function (success) {
            showWarnings(success)
          },
          dataType: 'json',
          headers: {
            'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()
          }
      })
    });
  }, 7000)
}

function showWarnings (warningList) {
  for (var i in warningList) {
    createWarning(warningList[i])
    $('#toast' + warningList[i].id).toast({
      animation: true,
      autohide: false
    }).toast('show');
  }
}


function getButtons (actions) {
  if (!actions.length) return ""
  var elements = '<div class="btn-group btn-group-sm d-flex p-2 bd-highlight" role="group">'
  for (var i in actions) {
    var element =  document.createElement('button')
    element.className = "btn btn-secondary"
    element.setAttribute('type', 'button')
    element.setAttribute('onclick', warningSdk[actions[i].action])
    element.innerText = actions[i].text
    elements += element.outerHTML
  }
  return elements + "</div>"
}
function createWarning(warning) {
    var alert = document.createElement('div');
    alert.className = `toast ${warningCodes[warning.level]}`;
    alert.setAttribute('id', 'toast' + warning.id)
    alert.setAttribute('role', 'alert')
    alert.setAttribute('aria-live', 'assertive')
    alert.setAttribute('aria-atomic', 'true')
    var buttons = getButtons(warning.warning_action)
    alert.innerHTML = ` <div class="toast-header">
    <strong class="mr-auto">Warning</strong>
      <small>${warning.timesince}</small>
      <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="toast-body">
      ${warning.message}
    </div>
    <div class="toast-footer">
      ${buttons}
    </div>
`
  document.getElementById('toast-container').prepend(alert)
}

function ignoreFn () {

}
function executeSOSFn () {

}
function escalateFn () {}
function snooze() {}