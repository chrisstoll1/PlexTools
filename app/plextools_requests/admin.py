from django.contrib import admin
from .models import SonarrCredential, RadarrCredential, LidarrCredential
# Register your models here.
admin.site.register(SonarrCredential)
admin.site.register(RadarrCredential)
admin.site.register(LidarrCredential)



