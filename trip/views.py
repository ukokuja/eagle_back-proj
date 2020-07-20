import json
from datetime import datetime

from django.contrib.auth.decorators import login_required
from rest_framework.exceptions import PermissionDenied

from common.models import Place

from django.shortcuts import render, redirect

# Create your views here.
from trip.models import Trip, TripForm, TripImages, TripProperty, INCLUDES_CHOICES, NOT_INCLUDES_CHOICES, Destination, \
    Stop, Drone, CollaboratorsForm, TripCollaborator
from trip.serializers import DestinationSerializer
from trip.utils import get_rand

def homepage(request):
    if request.user.is_authenticated:
        trips = Trip.objects.filter(created_by=request.user, is_active=True)
        trips_collaborator = TripCollaborator.objects.filter(user_id=request.user.id, trip__is_active=True)
        return render(request, 'index.html', {"trips": trips,
                                              "trips_collaborator": trips_collaborator})
    return redirect('login')

@login_required
def set_collaborator(request, trip_id):
    if request.method == 'POST':
        # create a form instance and populate it with data from the request:
        form = CollaboratorsForm(request.POST, **{"user_id": request.user.id})
        for user_id in form.data['collaborators']:
            TripCollaborator.objects.get_or_create(trip_id=trip_id, user_id=user_id)
    return redirect('trip', trip_id)

@login_required
def set_public(request, trip_id):
    trip = Trip.objects.get(id=trip_id)
    if trip.created_by.id == request.user.id:
        trip.is_public = True
        trip.save()
    return redirect('trip', trip_id)

@login_required
def delete_trip(request, trip_id):
    trip = Trip.objects.get(id=trip_id)
    if trip.created_by.id == request.user.id:
        trip.is_active = False
        trip.save()
    return redirect('index')


def create_trip(request, trip_id):
    trip = Trip.objects.get(id=trip_id)
    images = TripImages.objects.filter(created_by=request.user)
    destination_qs = Destination.objects.filter(trip=trip)
    destinations = DestinationSerializer(destination_qs, many=True).data
    if request.method == 'POST':
        # create a form instance and populate it with data from the request:
        form = TripForm(request.POST, instance=trip, **{"is_set": False})
        # check whether it's valid:
        if form.is_valid():
            data = form.cleaned_data
            set_trip_properties(data, trip)
            set_destinations(data)
            form.save()
            return redirect('trip', trip_id)

        # if a GET (or any other method) we'll create a blank form
    else:
        includes, not_includes = get_trip_properties(trip)
        form = TripForm(instance=trip, **{"includes":includes, "not_includes":not_includes, "is_set": True, "destinations": json.dumps(destinations)})
    return render(request, 'edit.html', {"trip": trip, 'form': form,
                                         "images": images, "destinations": destinations, "user": request.user})

@login_required
def article(request, trip_id):
    trip = Trip.objects.get(id=trip_id)
    is_collaborator=False
    if request.user.id != trip.created_by.id:
        collaborator_trip = TripCollaborator.objects.filter(user_id=request.user.id, trip_id=trip_id)
        if collaborator_trip.count() > 0:
            is_collaborator=True
        else:
            raise PermissionDenied
    properties = TripProperty.objects.filter(trip_id=trip_id)
    destinations = DestinationSerializer(Destination.objects.filter(trip_id=trip_id), many=True)
    form = CollaboratorsForm(request.POST, **{"user_id": request.user.id})
    collaborators = [x.user.id for x in TripCollaborator.objects.filter(trip_id=trip_id)]
    return render(request, 'article.html', {"trip": trip, "properties": properties,
                                            "destinations": destinations.data,
                                            "user": request.user,
                                            "form": form, "collaborators": collaborators, "is_collaborator":is_collaborator})




def set_drones(data, trip):
    destinations = get_destinations(data)
    if destinations.__len__() > 0:
        d = destinations[0]
        for i in range(1,5):
            rand = get_rand(i)
            place = Place.objects.create(
                name="Drone {} - position".format(i),
                latitude=d['stop']['place']['latitude'] + rand[0],
                longitude=d['stop']['place']['longitude'] + rand[1]
            )
            new_drone = Drone.objects.create(
                name= "Drone {}".format(i),
                position=place,
            )
            trip.drone_list.add(new_drone)

def set_destinations(data, trip):
    destinations = get_destinations(data)
    for d in destinations:
        id = d.get('id', False)
        if id:
            update_destination(d, id)
        else:
            create_destination(d, trip)


def get_destinations(data):
    destinations_str = data.get('destinations', [])
    destinations = json.loads(destinations_str)
    return destinations


def create_destination(d, trip):
    place = Place.objects.create(
        name=d['name'],
        latitude=d['stop']['place']['latitude'],
        longitude=d['stop']['place']['longitude']
    )
    stop = Stop.objects.create(
        place=place
    )
    Destination.objects.create(
        trip=trip,
        stop_id=stop.id,
        name=d['name'],
        description=d['description'],
        start_time=datetime.strptime(d['start_time_parsed'], '%H:%M').time(),
        stop_time=datetime.strptime(d['stop_time_parsed'], '%H:%M').time()
    )


def update_destination(d, id):
    destination = Destination.objects.get(id=id)
    destination.name = d['name']
    destination.description = d['description']
    destination.start_time = datetime.strptime(d['start_time_parsed'], '%H:%M').time()
    destination.stop_time = datetime.strptime(d['stop_time_parsed'], '%H:%M').time()
    destination.is_active = d['is_active']
    destination.stop.place.latitude = d['stop']['place']['latitude']
    destination.stop.place.longitude = d['stop']['place']['longitude']
    destination.stop.place.save()
    destination.stop.save()
    destination.save()

@login_required
def edit (request, trip_id):
    trip = Trip.objects.get(id=trip_id)
    images = TripImages.objects.filter(created_by=request.user)
    destination_qs = Destination.objects.filter(trip=trip)
    destinations = DestinationSerializer(destination_qs, many=True).data
    if request.method == 'POST':
        # create a form instance and populate it with data from the request:
        form = TripForm(request.POST, instance=trip, **{"is_set": False})
        # check whether it's valid:
        if form.is_valid():
            data = form.cleaned_data
            set_trip_properties(data, trip)
            set_destinations(data, trip)
            form.save()
            return redirect('trip', trip_id)
        # if a GET (or any other method) we'll create a blank form
    else:
        includes, not_includes = get_trip_properties(trip)
        form = TripForm(instance=trip, **{"includes":includes, "not_includes":not_includes, "is_set": True,
                                          "destinations": json.dumps(destinations), "created_by": request.user.id})
    return render(request, 'edit.html', {"trip": trip, 'form': form,
                                         "images": images, "path": "/trip/edit/", "user": request.user})

@login_required
def create (request):
    images = TripImages.objects.filter(created_by=request.user)
    if request.method == 'POST':
        # create a form instance and populate it with data from the request:
        form = TripForm(request.POST, **{"is_set": False})
        # check whether it's valid:
        if form.is_valid():
            data = form.cleaned_data
            form.save()
            set_trip_properties(data, form.instance)
            set_destinations(data, form.instance)
            set_drones(data, form.instance)
            return redirect('trip', form.instance.id)
        # if a GET (or any other method) we'll create a blank form
    else:
        form = TripForm(**{"includes":[], "not_includes":[], "is_set": True,
                                          "destinations": [], "created_by": request.user.id})
    return render(request, 'edit.html', {'form': form, "images": images, "path": "/trip/create",
                                         "created_by": request.user.id, "user": request.user})


def get_trip_properties(trip):
    includes = [x.key for x in TripProperty.objects.filter(trip=trip, value=True)]
    not_includes = [x.key for x in TripProperty.objects.filter(trip=trip, value=False)]
    return includes, not_includes


def set_trip_properties(data, trip):
    for key, value in INCLUDES_CHOICES:
        TripProperty.objects.update_or_create(
            key=key, trip=trip, defaults={"value": key in data["includes"], "display_name": value}
        )
    for key, value in NOT_INCLUDES_CHOICES:
        TripProperty.objects.update_or_create(
            key=key, trip=trip, defaults={"value": key not in data["not_includes"], "display_name": value}
        )

@login_required
def make_public(request, trip_id):
    trip = Trip.objects.get(id=trip_id)
    if trip.created_by.id == request.user.id:
        trip.is_public = True
    raise PermissionDenied