from django.contrib import admin

# Register your models here.
from execution.models import Execution, Warning

admin.site.register(Execution)
admin.site.register(Warning)