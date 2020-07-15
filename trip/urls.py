from django.urls import path
from trip.views import homepage, article, edit

urlpatterns = [
    path('<int:trip_id>', article, name='trip'),
    path('edit/<int:trip_id>', edit, name='edit'),
]
