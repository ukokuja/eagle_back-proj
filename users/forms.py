from django import forms
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm

from users.models import Profile


class UserRegistrationForm(UserCreationForm):
    email = forms.EmailField()
    username = forms.CharField(label='Username')

    class Meta:
        model = Profile
        fields = ['username', 'email' , 'picture', 'role', 'password1' , 'password2']