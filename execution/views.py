import json

from django.core import serializers
from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.
from common.models import Place
from execution.models import Execution, Warning
from execution.serializers import WarningSerializer
from trip.models import Destination
import geopy.distance


def get_places(list, prop):
    places_ids = [x.get(prop) for x in list.values()]
    places = Place.objects.filter(id__in=places_ids)
    return [{"name": x.name, "location": [x.latitude, x.longitude]} for x in places]


def navigate(request, trip_id):
    execution = Execution.objects.create(trip_id=trip_id)
    destination = Destination.objects.get(trip_id=trip_id)
    stops = get_places(destination.stop_list, 'place_id')
    drones = get_places(execution.trip.drone_list, 'position_id')

    return render(request, "navigate.html", {"execution": execution, "stops": stops, "drones": drones})


def get_warnings (request, execution_id):
    latitude = request.POST.get('latitude')
    longitude = request.POST.get('longitude')
    # warnings = Warning.objects.filter(execution_id=execution_id)
    warnings = Warning.objects.filter(execution_id=1)
    serializer = WarningSerializer(warnings, many=True)
    warning_within_radius = get_warnings_within_radius(serializer.data, latitude, longitude)

    return HttpResponse(json.dumps(warning_within_radius), content_type="application/json")


def get_warnings_within_radius(warnings, latitude, longitude):
    warning_within_radius = []
    for w in warnings:
        coords_1 = (latitude, longitude)
        place = w.get('place')
        coords_2 = (place.get('latitude'), place.get('longitude'))
        distance = geopy.distance.distance(coords_1, coords_2).km
        if distance <= w.get('radius'):
            warning_within_radius.append(w)


    return warning_within_radius
