from django.contrib import admin

# Register your models here.
from execution.models import Execution, Warning, WarningAction


class WarningActionAdmin(admin.TabularInline):
    model = WarningAction
    extra = 1

class WarningAdmin(admin.ModelAdmin):
   inlines = [WarningActionAdmin,]

admin.site.register(Execution)
admin.site.register(Warning, WarningAdmin)