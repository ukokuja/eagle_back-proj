import json

from django.shortcuts import render, redirect

# Create your views here.
from trip.models import Trip, TripForm, TripImages, TripProperty, INCLUDES_CHOICES, NOT_INCLUDES_CHOICES, Destination
from trip.serializers import DestinationSerializer, SimpleDestinationSerializer


def homepage(request):
    trips = Trip.objects.filter(created_by=request.user, is_active=True)
    return render(request, 'index.html', {"trips": trips})


def delete_trip(request, trip_id):
    trip = Trip.objects.get(id=trip_id)
    trip.is_active = False
    trip.save()

def create_trip(request, trip_id):
    trip = Trip.objects.get(id=trip_id)
    images = TripImages.objects.filter(created_by=request.user)
    destination_qs = Destination.objects.filter(trip=trip)
    destinations = SimpleDestinationSerializer(destination_qs, many=True).data
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
    return render(request, 'edit.html', {"trip": trip, 'form': form, "images": images, "destinations": destinations})

def article(request, trip_id):
    trip = Trip.objects.get(id=trip_id)
    properties = TripProperty.objects.filter(trip_id=trip_id)
    destinations = DestinationSerializer(Destination.objects.filter(trip_id=trip_id), many=True)
    return render(request, 'article.html', {"trip": trip, "properties": properties, "destinations": destinations.data})


def set_destinations(data):
    pass


def edit (request, trip_id):
    trip = Trip.objects.get(id=trip_id)
    images = TripImages.objects.filter(created_by=request.user)
    destination_qs = Destination.objects.filter(trip=trip)
    destinations = SimpleDestinationSerializer(destination_qs, many=True).data
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
    return render(request, 'edit.html', {"trip": trip, 'form': form, "images": images, "destinations": destinations})


def get_trip_properties(trip):
    includes = [x.key for x in TripProperty.objects.filter(trip=trip, value=True)]
    not_includes = [x.key for x in TripProperty.objects.filter(trip=trip, value=False)]
    # includes = TripProperty.objects.filter(trip=trip, value=True)
    # not_includes = TripProperty.objects.filter(trip=trip, value=False)
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