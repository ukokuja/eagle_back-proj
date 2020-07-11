from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.contrib.auth import login, logout, authenticate

def registerForm(request):
    if (request.method == 'GET'):
        return render(request, 'login/registerForm.html', {'form': UserCreationForm() })

    else:
        if request.POST['password1'] == request.POST['password2']:

            try:
                user = User.objects.create_user(request.POST['username'], password=request.POST['password1'])
                user.save()
                login(request, user)
                return redirect('index')
            except IntegrityError:
                return render(request, 'login/registerForm.html', {'form': UserCreationForm(), "errMsg": "User exists. Choose a different one" })

        else:
            return render(request, 'login/registerForm.html', {'form': UserCreationForm(), "errMsg": "Password didn't match" })




def logoutuser(request):
    if request.method == 'POST':
        logout(request)
    return redirect('index') 


def loginuser(request):
    if (request.method == 'GET'):
        return render(request, 'login/login.html', {'form': AuthenticationForm() })
    else:
        user = authenticate(request, username=request.POST['username'], password=request.POST['password'])

        if user is None:
            return render(request, 'login/login.html', {'form': AuthenticationForm(), "errMsg": "User doesn't exist" })

        else:
            login(request, user)
            return redirect('index')


