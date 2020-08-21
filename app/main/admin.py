from django.contrib import admin
from .models import CalendarModule, RequestModule, PRequestModule, ModuleName, EmailCredential, Notification, SiteSettings
# Register your models here.
admin.site.register(CalendarModule)
admin.site.register(RequestModule)
admin.site.register(PRequestModule)
admin.site.register(ModuleName)
admin.site.register(EmailCredential)
admin.site.register(Notification)
admin.site.register(SiteSettings)