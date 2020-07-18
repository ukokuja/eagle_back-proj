from django.urls import path
from trip.views import homepage, article, edit, create, delete_trip

urlpatterns = [
    path('<int:trip_id>', article, name='trip'),
    path('edit/<int:trip_id>', edit, name='edit'),
    path('create', create, name='create'),
    path('delete/<trip_id>', delete_trip),
]
