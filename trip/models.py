from django.db import models

# Create your models here.
from common.models import BaseModel, Place, Comment

ACCESSABILITY_CHOICES = (
    ('High Accessible','HIGH'),
    ('Medium Accessible', 'MEDIUM'),
    ('Low Accessible','LOW'),
)


class Drone(BaseModel):
    name = models.CharField(max_length=127, blank=None)
    output = models.FileField(upload_to="trip/videos")
    position = models.ForeignKey(Place, on_delete=models.SET_NULL, null=True)
    height = models.PositiveIntegerField(blank=None, default=1)


class TripImages(BaseModel):
    name = models.CharField(max_length=127, blank=None)
    image = models.ImageField(upload_to="trip/images")


class Trip(BaseModel):
    name = models.CharField(max_length=127, blank=None)
    description = models.CharField(max_length=511, blank=True)
    school = models.CharField(max_length=63, blank=None)
    kids = models.PositiveIntegerField(blank=None)
    guides = models.PositiveIntegerField(blank=None, default=1)
    accessability = models.CharField(max_length=63, choices=ACCESSABILITY_CHOICES, default='HIGH')
    image = models.ForeignKey(TripImages, on_delete=models.SET_NULL, null=True)
    drone_list = models.ManyToManyField(Drone)
    comment_list = models.ManyToManyField(Comment)

    @property
    def image_url(self):
        return 'media/{0}'.format(self.image.image)

class Stop(BaseModel):
    place = models.ForeignKey(Place, on_delete=models.SET_NULL, null=True)
    picture = models.ImageField(upload_to="trip/images")


class Destination(BaseModel):
    name = models.CharField(max_length=127, blank=None)
    stop_list = models.ManyToManyField(Stop)
    start_time = models.DateTimeField(blank=None)
    stop_time = models.DateTimeField(blank=None)
    trip = models.ForeignKey(Trip, on_delete=models.SET_NULL, null=True)


class TripProperty(BaseModel):
    trip = models.ForeignKey(Trip, on_delete=models.SET_NULL, null=True)
    key = models.CharField(max_length=127, blank=None)
    value = models.BooleanField(default=False, blank=None)
