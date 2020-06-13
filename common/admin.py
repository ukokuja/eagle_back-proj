from django.contrib import admin

# Register your models here.
from common.models import Place, Comment, Setting

admin.site.register(Place)
admin.site.register(Comment)
admin.site.register(Setting)
