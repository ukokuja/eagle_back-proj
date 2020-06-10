from django.shortcuts import render

# Create your views here.
from trip.models import Trip


def homepage(request):
    trips = Trip.objects.filter(created_by=request.user)
    render(request, 'index.html', {trips: trips})