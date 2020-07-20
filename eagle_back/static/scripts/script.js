// globals
var warningCodes = {}
var warningSdk = {}
var ignoredWarnings = []
var displayingWarnings = []
var displayedWarnings = []
var currentMainDronePosition = [1,1]
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
        $("#editModal .btn-primary").data('id', id || null)
    })
    $("#editModal .btn-primary").click(function () {
      var id = $("#editModal .btn-primary").data('id')
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
    $.getJSON('/static/json/warningSdk.json', {},function (data){
      warningSdk = data
    })
    $.getJSON('/static/json/warningCodes.json', {},function (data){
      warningCodes = data
    })
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

    var lines = initPath(dots, map);

    getRealtimeGeoposition(map, drones, lines.getLatLngs())

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

function getAllPositionList (paths) {
  var list = [];
  var step = 0.00005;
  var current = paths[0]
  for (var i = 1; i < paths.length; i++) {
    var isLatBigger = paths[i].lat < current.lat
    var isLngBigger = paths[i].lng < current.lng
    if (isLatBigger) {
      if (isLngBigger) {
        while(paths[i].lat < current.lat || paths[i].lng < current.lng) {
          if (paths[i].lat < current.lat && paths[i].lng < current.lng) {
              list.push({lat: current.lat - step, lng:current.lng - step})
          } else if (paths[i].lat < current.lat){
              list.push({lat: current.lat - step, lng:current.lng})
          } else {
              list.push({lat: current.lat, lng:current.lng  - step})
          }
          current = list[list.length - 1]
        }
      } else {
        while(paths[i].lat < current.lat || paths[i].lng > current.lng) {
          if (paths[i].lat < current.lat && paths[i].lng > current.lng) {
              list.push({lat: current.lat - step, lng:current.lng + step})
          } else if (paths[i].lat < current.lat){
              list.push({lat: current.lat - step, lng:current.lng})
          } else {
              list.push({lat: current.lat, lng:current.lng  + step})
          }
          current = list[list.length - 1]
        }
      }
    } else {
      if (isLngBigger) {
        while(paths[i].lat > current.lat || paths[i].lng < current.lng) {
          if (paths[i].lat > current.lat && paths[i].lng < current.lng) {
              list.push({lat: current.lat + step, lng:current.lng - step})
          } else if (paths[i].lat > current.lat){
              list.push({lat: current.lat + step, lng:current.lng})
          } else {
              list.push({lat: current.lat, lng:current.lng  - step})
          }
          current = list[list.length - 1]
        }
      } else {
        while(paths[i].lat > current.lat || paths[i].lng > current.lng) {
          if (paths[i].lat > current.lat && paths[i].lng > current.lng) {
              list.push({lat: current.lat + step, lng:current.lng + step})
          } else if (paths[i].lat > current.lat){
              list.push({lat: current.lat + step, lng:current.lng})
          } else {
              list.push({lat: current.lat, lng:current.lng  + step})
          }
          current = list[list.length - 1]
        }
      }
    }

  }
  return list
}

function doReachDestination() {
  document.querySelector('aside').click(); //hack
  if('speechSynthesis' in window){
    var voices = speechSynthesis.getVoices();
    var speech = new SpeechSynthesisUtterance(text);
    speech.voice = voices[33]
    speech.lang = 'en-US';
    speech.rate = 0.85;
    window.speechSynthesis.speak(speech);
    text = 'You have reached your destination'
  }
}

function setNewDronePosition(i, drones, positionSetList, currentPosition) {
  var posRotation = (i >>> 0).toString(2);
  posRotation = posRotation.length > 1 ? posRotation : "0" + posRotation;
  drones[i].location = [positionSetList[currentPosition].lat + (-0.0005 * posRotation[0]), positionSetList[currentPosition].lng + (-0.0005 * posRotation[1])]
  drones[i].drone.setLatLng(drones[i].location);
  currentMainDronePosition = drones[i].location;
}

function getRealtimeGeoposition(map, drones, paths) {
    var text = ''
    var positionSetList = getAllPositionList(paths);
    var currentPosition = 0;
    var interval = setInterval(function () {
        for (var i in drones) {
          if (positionSetList[currentPosition]) {
            setNewDronePosition(i, drones, positionSetList, currentPosition);
          } else {
            clearInterval(interval)
          }
        }
        currentPosition++
        if(!positionSetList[currentPosition]) {
            doReachDestination()
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

function renderWarningList() {
  $("#list-high .list-group").html("")
  $("#list-medium .list-group").html("")
  $("#list-low .list-group").html("")
  for (var i in displayedWarnings) {
    var template = `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        ${displayedWarnings[i].message}
        <span class="badge badge-primary badge-pill">${displayedWarnings[i].timesince}</span>
      </li>`
    if (displayedWarnings[i].level == 4) {
      $("#list-high .list-group").prepend(template)
    } else if (displayedWarnings[i].level == 3) {
      $("#list-medium .list-group").prepend(template)
    } else if (displayedWarnings[i].level == 2) {
      $("#list-low .list-group").prepend(template)
    }
    if ($("#list-high .list-group").html() == "") {
      $("#list-high .list-group").html("<span>There are no high priority alerts</span>")
    }
    if ($("#list-medium .list-group").html() == "") {
      $("#list-medium .list-group").html("<span>There are no medium priority alerts</span>")
    }
    if ($("#list-low .list-group").html() == "") {
      $("#list-low .list-group").html("<span>There are no low priority alerts</span>")
    }
    $(".badge-warnings").html(displayedWarnings.length)
  }

}

function initWarningListener (executionId) {
  var interval = setInterval(function () {
    navigator.geolocation.getCurrentPosition(function (pos){
      $.ajax({
          url: "get_warnings/" +executionId,
          type: 'post',
          data: {
            latitude: currentMainDronePosition[0],
            // latitude: pos.coords.latitude,
            longitude: currentMainDronePosition[1]
            // longitude:pos.coords.longitude
          },
          success: function (success) {
            showWarnings(success)
            renderWarningList()
          },
          dataType: 'json',
          headers: {
            'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()
          }
      })
    });
  }, 7000)
}

function shouldDisplayWaerning(warning) {
  return ignoredWarnings.indexOf(warning.id) < 0
      && displayingWarnings.indexOf(warning.id) < 0
      && (user_role != "MAIN" || (user_role == "MAIN" && warning.level > 2))
      && (user_type != "anonymous")
}

function showWarnings (warningList) {
  for (var i in warningList) {
    if (shouldDisplayWaerning(warningList[i])) {
      displayingWarnings.push(warningList[i].id)
      createWarning(warningList[i])
      $('#toast' + warningList[i].id).toast({
      animation: true,
      autohide: false
    }).toast('show');
    }
  }
}

function getButtons (actions, warning_id) {
  if (!actions.length) return ""
  var elements = '<div class="btn-group btn-group-sm d-flex p-2 bd-highlight" role="group">'
  for (var i in actions) {
    var element =  document.createElement('button')
    element.className = "btn btn-secondary"
    element.setAttribute('type', 'button')
    element.setAttribute('onclick', `${warningSdk[actions[i].action]}(${warning_id})`)
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
    var buttons = getButtons(warning.warning_action, warning.id)
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
  displayedWarnings.push(warning)
}
function executeWarningAction(warning_id, action) {
  $.ajax({
          url: "set_warning",
          type: 'post',
          success: function (success){
            console.log(success)
            console.log('hiding' + warning_id)
            $('#toast' + warning_id).toast('hide')
          },
          data: {
            warning_id: warning_id,
            action: action
          },
          headers: {
            'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()
          }
      })

}

function ignoreFn (warning_id) {
    executeWarningAction(warning_id, 'ignore')
    ignoredWarnings.push(warning_id)
}

function escalateFn (warning_id) {
  executeWarningAction(warning_id, 'escalate')
}


function snoozeFn(warning_id) {
  executeWarningAction(warning_id, 'snooze')
}
