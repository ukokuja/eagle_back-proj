from django.db import models

# Create your models here.
from common.models import BaseModel, Place
from trip.models import Trip


class Execution(BaseModel):
    duration = models.DurationField(blank=None, default=0)
    trip = models.ForeignKey(Trip, on_delete=models.SET_NULL, null=True)


class Warning(BaseModel):
    name = models.CharField(max_length=127, blank=None)
    place = models.ForeignKey(Place, on_delete=models.SET_NULL, null=True)
    message = models.CharField(max_length=255, blank=None)
    execution = models.ForeignKey(Execution, on_delete=models.SET_NULL, null=True)
