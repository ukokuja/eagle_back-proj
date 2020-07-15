from rest_framework import serializers

from common.serializers import PlaceSerializer
from trip.models import Destination, Stop

class StopSerializer(serializers.ModelSerializer):
    place = PlaceSerializer()
    class Meta:
        model = Stop
        fields = "__all__"


class DestinationSerializer(serializers.ModelSerializer):
    stop_list = StopSerializer(many=True)
    start_time_parsed = serializers.ReadOnlyField()
    stop_time_parsed = serializers.ReadOnlyField()

    class Meta:
        model = Destination
        fields = ['name', 'stop_list', 'start_time_parsed', 'stop_time_parsed', 'description']



class SimpleDestinationSerializer(serializers.ModelSerializer):
    start_time_parsed = serializers.ReadOnlyField()
    stop_time_parsed = serializers.ReadOnlyField()

    class Meta:
        model = Destination
        fields = ['id', 'name', 'start_time_parsed', 'stop_time_parsed', 'description']