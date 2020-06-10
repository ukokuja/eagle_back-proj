from django.contrib.auth.models import User
from django.db import models

# Create your models here.

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="user")
    bio = models.TextField(max_length=500, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    picture = models.ImageField(upload_to="user/picture")


class BaseModel(models.Model):
    created_by = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, related_name="+")
    created_date = models.DateTimeField(auto_now_add=True)
    modified_by = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, related_name="+")
    modified_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Place(models.Model):
    name = models.CharField(max_length=127, blank=None)
    latitude = models.IntegerField(blank=None)
    longitude = models.IntegerField(blank=None)


class Comment(BaseModel):
    message = models.CharField(max_length=511, blank=False)
    rank = models.PositiveIntegerField(default=1)

class Setting(BaseModel):
    user = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True)
    key = models.CharField(max_length=127, blank=None)
    value = models.CharField(blank=True, default="", max_length=127)