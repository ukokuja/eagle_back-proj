from django.db import models
from django.conf import settings

# Create your models here.
from django.db.models.signals import post_save
from django.dispatch import receiver

class BaseModel(models.Model):
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, related_name="+")
    created_date = models.DateTimeField(auto_now_add=True)
    modified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, related_name="+")
    modified_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Place(models.Model):
    name = models.CharField(max_length=127, blank=None)
    latitude = models.FloatField(blank=None)
    longitude = models.FloatField(blank=None)

    def __str__(self):
        return self.name

class Comment(BaseModel):
    message = models.CharField(max_length=511, blank=False)
    rank = models.PositiveIntegerField(default=1)

class Setting(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    key = models.CharField(max_length=127, blank=None)
    value = models.CharField(blank=True, default="", max_length=127)

