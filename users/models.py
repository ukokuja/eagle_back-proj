from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
MAIN = 'MAIN'
SECONDARY = 'SECONDARY'
THIRD = 'THIRD'
ROLE_CHOICES = (
    (MAIN, MAIN),
    (SECONDARY, SECONDARY),
    (THIRD, THIRD)
)
class Profile (AbstractUser):
    picture = models.ImageField(upload_to="user/images")
    role = models.CharField(max_length=63, choices=ROLE_CHOICES, default=MAIN)