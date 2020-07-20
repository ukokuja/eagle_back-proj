import json

from django.contrib.auth.decorators import login_required
from django.core import serializers
from django.db.models import F
from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.
from rest_framework.exceptions import PermissionDenied

from common.models import Place
from execution.models import Execution, Warning
from execution.serializers import WarningSerializer
from trip.models import Destination
import geopy.distance

from trip.serializers import DestinationSerializer


def get_places(list, prop):
    places_ids = [x.get(prop) for x in list.values()]
    places = Place.objects.filter(id__in=places_ids)
    return [{"name": x.name, "location": [x.latitude, x.longitude]} for x in places]


def navigate(request, trip_id):
    execution = Execution.objects.create(trip_id=trip_id)
    if request.user.is_anonymous:
        if not execution.trip.is_public:
            raise PermissionDenied
        user_type = 'anonymous'
    elif execution.trip.tripcollaborator_set.filter(user_id=request.user.id).count() > 0:
        user_type = 'collaborator'
    elif request.user.id == execution.trip.created_by.id:
        user_type = 'owner'
    else:
        raise PermissionDenied

    destinations = DestinationSerializer(Destination.objects.filter(trip_id=trip_id), many=True).data
    drones = get_places(execution.trip.drone_list, 'position_id')
    drone_videos = [x.output for x in list(execution.trip.drone_list.all()) if x.output]
    return render(request, "navigate.html", {"execution": execution,
                                             "destinations": json.dumps(destinations) ,
                                             "drones": drones,
                                             "drone_videos": drone_videos,
                                             "user_role": request.user.role,
                                             "user_type": user_type})

@login_required
def get_warnings(request, execution_id):
    latitude = request.POST.get('latitude')
    longitude = request.POST.get('longitude')
    # warnings = Warning.objects.filter(execution_id=execution_id)
    warnings = Warning.objects.filter(execution_id=1, snooze_count=0, is_active=True)
    Warning.objects.filter(execution_id=1, snooze_count__gt=0).update(snooze_count=F('snooze_count')-1)
    serializer = WarningSerializer(warnings, many=True)
    warning_within_radius = get_warnings_within_radius(serializer.data, latitude, longitude)

    return HttpResponse(json.dumps(warning_within_radius), content_type="application/json")

@login_required
def set_warning(request):
    warning_id = request.POST.get('warning_id')
    action = request.POST.get('action')
    warning = Warning.objects.get(id=warning_id)
    if action == 'snooze':
        warning.snooze_count = 5
    elif action == 'escalate':
        level = int(warning.level) + 1
        warning.level = str(level)
    elif action == 'ignore':
        # warning.is_active = False
        pass #for demo purposes
    warning.save()
    return HttpResponse('OK', status=200)


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
