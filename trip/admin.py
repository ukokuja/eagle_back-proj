from django.contrib import admin

# Register your models here.
from trip.models import Drone, TripImages, Trip, TripProperty, Stop, Destination

admin.site.register(Drone)
admin.site.register(TripImages)
admin.site.register(Trip)
admin.site.register(Stop)
admin.site.register(Destination)
admin.site.register(TripProperty)