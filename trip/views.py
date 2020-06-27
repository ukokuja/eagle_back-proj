from django.shortcuts import render

# Create your views here.
from trip.models import Trip


def homepage(request):
    trips = Trip.objects.filter(created_by=request.user, is_active=True)
    return render(request, 'index.html', {"trips": trips})


def delete_trip(request, trip_id):
    trip = Trip.objects.get(id=trip_id)
    trip.is_active = False
    trip.save()

