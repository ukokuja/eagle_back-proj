from django.shortcuts import render

# Create your views here.

def settingsView(request):
    return render(request, 'settings.html')