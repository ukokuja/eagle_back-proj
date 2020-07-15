
from django.urls import path

from execution.views import navigate, get_warnings

urlpatterns = [
    path('<int:trip_id>', navigate),
    path('get_warnings/<int:execution_id>', get_warnings),
]
