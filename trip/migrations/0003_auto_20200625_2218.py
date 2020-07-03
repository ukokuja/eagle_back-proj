# Generated by Django 3.0.6 on 2020-06-25 22:18
from xmlrpc.client import DateTime

from django.db import migrations
import datetime

PLACES = [{
        "name": "Ein Gedi",
        "location": [31.469835, 35.3283313],
    },
    {
        "name": "First stop",
        "location": [31.465169, 35.3521382],
    },
    {
        "name": "Second stop",
        "location": [31.459354, 35.3579443]
    },
    {
        "name": "Third stop",
        "location": [31.455787, 35.3677043],
    }]
DRONES = [{
        "name": "Back",
        "location": [31.465718, 35.3510653]
    },
    {
        "name": "Right",
        "location": [31.465718, 35.3516873]
    },
    {
        "name": "Front",
        "location": [31.465169, 35.3521382]
    },
    {
        "name": "Left",
        "location": [31.464931, 35.3515913]
    }]
def create_trip(apps, schema_editor):
    Trip = apps.get_model('trip', 'Trip')
    TripImages = apps.get_model('trip', 'TripImages')
    Drone = apps.get_model('trip', 'Drone')
    Destination = apps.get_model('trip', 'Destination')
    Stop = apps.get_model('trip', 'Stop')
    Place = apps.get_model('common', 'Place')


    tp, _ = TripImages.objects.get_or_create(
        name="Sde Boker",
        image="images/sdeBoker.jpg"
    )
    new_trip, _ = Trip.objects.get_or_create(
        name="Sde Boker",
        description="""The kibbutz of Sde Boker is famous as the home of David Ben Gurion, Israel's first Prime
                  Minister whose home is now a museum open to the public, and is the feature of a number of
                  supporting exhibits in the kibbutz. Sde Boker is located in the center of the Negev Desert
                  in southern Israel, a community founded in 1952 by a number of pioneering families who were
                  later joined by Ben Gurion after an interesting encounter. Today, visitors from around the
                  world visit to learn about the life of Israel's iconic leader.""",
        school="Eagle eye school",
        kids=40,
        guides=3,
        image=tp,
        is_active=True
    )
    for place in DRONES:
        new_place = Place.objects.create(
            name=place['name'],
            latitude=place['location'][0],
            longitude=place['location'][1]
        )
        new_drone, _ = Drone.objects.get_or_create(
            name=place['name'],
            position=new_place,
            height=10
        )
        new_trip.drone_list.add(new_drone)
    destination, _ = Destination.objects.get_or_create(
        name="Sde Boker",
        start_time=datetime.datetime(2021, 2, 4, 10, 15, 30),
        stop_time=datetime.datetime(2021, 2, 4, 15, 15, 30),
        trip_id=new_trip.id
    )
    for place in PLACES:
        new_place, _ = Place.objects.get_or_create(
            name=place['name'],
            latitude=place['location'][0],
            longitude=place['location'][1]
        )
        new_stop, _ = Stop.objects.get_or_create(
            place=new_place
        )
        destination.stop_list.add(new_stop)

class Migration(migrations.Migration):



    dependencies = [
        ('trip', '0002_auto_20200627_1450'),
    ]

    operations = [
        migrations.RunPython(create_trip)
    ]