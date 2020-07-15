from rest_framework import serializers

from common.models import Place
from common.serializers import PlaceSerializer
from execution.models import Warning, WarningAction


class ActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WarningAction
        fields = ['text', 'action']

class WarningSerializer(serializers.ModelSerializer):
    warning_action = ActionSerializer(many=True)
    timesince = serializers.ReadOnlyField()
    place = PlaceSerializer()

    class Meta:
        model = Warning
        fields = ['id', 'message', 'radius', 'level', 'place', 'warning_action', 'timesince']