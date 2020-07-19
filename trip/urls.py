from django.urls import path
from trip.views import homepage, article, edit, create, delete_trip, set_public, set_collaborator

urlpatterns = [
    path('<int:trip_id>', article, name='trip'),
    path('edit/<int:trip_id>', edit, name='edit'),
    path('create', create, name='create'),
    path('delete/<int:trip_id>', delete_trip),
    path('set_public/<int:trip_id>', set_public),
    path('set_collaborator/<trip_id>', set_collaborator),
]
