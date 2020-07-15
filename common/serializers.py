from rest_framework import serializers

from common.models import Place

class PlaceSerializer (serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = ['name', 'longitude', 'latitude']
