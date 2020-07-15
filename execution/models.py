from datetime import datetime

from django.db import models

# Create your models here.
from django.utils.timesince import timesince

from common.models import BaseModel, Place
from trip.models import Trip
from datetime import timedelta
HIGH = 'HIGH'
MEDIUM = 'MEDIUM'
LOW = 'LOW'
INFO = 'INFO'

LEVEL_CHOICES = (
    (HIGH,HIGH),
    (MEDIUM, MEDIUM),
    (LOW,LOW),
    (INFO,INFO),
)
class Execution(BaseModel):
    duration = models.DurationField(blank=None, default=timedelta(minutes=0))
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.trip.name

class Warning(BaseModel):
    name = models.CharField(max_length=127, blank=None)
    place = models.ForeignKey(Place, on_delete=models.CASCADE, null=True)
    message = models.CharField(max_length=255, blank=None)
    execution = models.ForeignKey(Execution, on_delete=models.CASCADE, null=True)
    radius = models.PositiveIntegerField(default=0)
    level = models.CharField(max_length=63, choices=LEVEL_CHOICES, default=INFO)

    def __str__(self):
        return "{} - {}".format(self.name, self.message)

    @property
    def timesince(self):

        return timesince(self.modified_date)

class WarningAction(BaseModel):
    warning = models.ForeignKey(Warning, on_delete=models.CASCADE, null=False, related_name='warning_action')
    text = models.CharField(max_length=63, default="Ignore")
    action = models.CharField(max_length=63, default="ignore")