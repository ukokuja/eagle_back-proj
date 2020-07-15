from django.core import validators
from django.db import models, __all__
from django import forms

# Create your models here.
from django.forms import ModelForm

from common.models import BaseModel, Place, Comment

ACCESSABILITY_CHOICES = (
    ('High Accessible', 'High Accessible'),
    ('Medium Accessible', 'Medium Accessible'),
    ('Low Accessible', 'Low Accessible'),
)
INCLUDES_CHOICES = (
    ('animal','Animal zone'),
    ('water','Water experience'),
    ('views','Panoramic views'),
    ('snow','Snow slides'),
    ('picnic','Picnic area'),
)
NOT_INCLUDES_CHOICES = (
    ('internet', 'Internet everywhere'),
    ('climbing', 'Climbing areas'),
    ('bathroom', 'Public bathroom'),
    ('diving', 'Diving area'),
    ('food', 'Food stores'),
)
FORM_CONTROL = {'class': "form-control"}


class Drone(BaseModel):
    name = models.CharField(max_length=127, blank=None)
    output = models.FileField(upload_to="trip/videos")
    position = models.ForeignKey(Place, on_delete=models.CASCADE, null=True)
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
    image = models.ForeignKey(TripImages, on_delete=models.CASCADE, null=True)
    drone_list = models.ManyToManyField(Drone, through="TripDrone", blank=True, null=True)
    is_active= models.BooleanField(default=True, blank=False)
    # TODO: change manytomany

    @property
    def image_url(self):
        return '/media/{0}'.format(self.image.image)


class TripDrone (models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, null=True)
    drone = models.ForeignKey(Drone,on_delete=models.CASCADE, null=True)


class Stop(BaseModel):
    place = models.ForeignKey(Place, on_delete=models.SET_NULL, null=True)
    picture = models.ImageField(upload_to="trip/images")


class Destination(BaseModel):
    name = models.CharField(max_length=127, blank=None)
    stop_list = models.ManyToManyField(Stop)
    start_time = models.DateTimeField(blank=None)
    stop_time = models.DateTimeField(blank=None)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, null=True)
    description = models.CharField(max_length=511, blank=None, default="")

    @property
    def start_time_parsed(self):
        return self.start_time.strftime("%H:%M")

    @property
    def stop_time_parsed(self):
        return self.stop_time.strftime("%H:%M")

class TripProperty(BaseModel):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, null=True)
    display_name = models.CharField(max_length=127, blank=None, default="")
    key = models.CharField(max_length=127, blank=None)
    value = models.BooleanField(default=False, blank=None)

    class Meta:
        unique_together=('trip', 'key')

    def __str__(self):
        return "{} - {}".format(self.trip.name, self.key)

class TripComment (models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, null=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True)


class TripForm(ModelForm):
    includes = forms.MultipleChoiceField(choices=INCLUDES_CHOICES,
                                         widget=forms.CheckboxSelectMultiple, required=False)
    not_includes = forms.MultipleChoiceField(choices=NOT_INCLUDES_CHOICES, widget=forms.CheckboxSelectMultiple,
                                             required=False)
    destinations = forms.CharField(widget=forms.HiddenInput)
    class Meta:
        model= Trip
        fields = '__all__'
        exclude = ['is_active', 'drone_list','created_by', 'modified_by']
        widgets = {
            'name': forms.TextInput(attrs=FORM_CONTROL),
            'description':forms.Textarea(attrs={'class': "form-control no-validate"}),
            'school':forms.TextInput(attrs=FORM_CONTROL),
            'kids':forms.NumberInput(attrs=FORM_CONTROL),
            'guides':forms.NumberInput(attrs=FORM_CONTROL),
            'accessability':forms.RadioSelect,
            'image': forms.HiddenInput()
        }

    def __init__(self, *args, **kwargs):
        is_set = kwargs.pop('is_set')
        if is_set:
            includes = kwargs.pop('includes')
            not_includes = kwargs.pop('not_includes')
            destinations = kwargs.pop('destinations')
        super(TripForm, self).__init__(*args, **kwargs)
        if is_set:
            self.fields['includes'].initial = includes
            self.fields['not_includes'].initial = not_includes
            self.fields['destinations'].initial = destinations
