from django.db import models
from sonarr_cal.models import SonarrCredential
from ombi_requests.models import OmbiCredential
from plextools_requests import models as PRM
from django.contrib.auth.models import User

class CalendarModule(models.Model):
    sonarrcred = models.OneToOneField(SonarrCredential, on_delete=models.CASCADE)
    title = models.CharField(max_length=50)
    description = models.CharField(max_length=150)
    status = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class RequestModule(models.Model):
    ombicred = models.OneToOneField(OmbiCredential, on_delete=models.CASCADE)
    title = models.CharField(max_length=50)
    description = models.CharField(max_length=150)
    status = models.BooleanField(default=False)
    tvEnabled = models.BooleanField(default=False)
    movEnabled = models.BooleanField(default=False)
    musEnabled = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class PRequestModule(models.Model):
    sonarrcred = models.OneToOneField(PRM.SonarrCredential, on_delete=models.CASCADE)
    radarrcred = models.OneToOneField(PRM.RadarrCredential, on_delete=models.CASCADE)
    lidarrcred = models.OneToOneField(PRM.LidarrCredential, on_delete=models.CASCADE)
    title = models.CharField(max_length=50)
    description = models.CharField(max_length=150)
    status = models.BooleanField(default=False)
    tvEnabled = models.BooleanField(default=False)
    movEnabled = models.BooleanField(default=False)
    musEnabled = models.BooleanField(default=False)  

    def __str__(self):
        return self.title

MODULE_CHOICES = (
    ('Calendar', 'CALENDAR'),
    ('Request', 'REQUEST')
)
class ModuleName(models.Model):
    ModuleType = models.CharField(max_length=10, choices=MODULE_CHOICES, default='Calendar')
    ModuleName = models.CharField(max_length=50)

    def __str__(self):
        return self.ModuleType

EMAIL_TYPES = (
    ('Server', 'SERVER'),
)
class EmailCredential(models.Model):
    EmailCredentialType = models.CharField(max_length=10, choices=EMAIL_TYPES, default='Server')
    USE_TLS = models.BooleanField(default=True)
    HOST = models.CharField(max_length=100)
    PORT = models.CharField(max_length=15)
    USERNAME = models.CharField(max_length=50)
    PASSWORD = models.CharField(max_length=50)

    def __str__(self):
        return self.EmailCredentialType

NotificationChoices = (
    ('discord', 'Discord'),
    ('email', 'Email')
)
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    mode = models.CharField(max_length=15, choices=NotificationChoices, blank=True, null=True)
    notificationid = models.CharField(max_length=25)
    calendar = models.ForeignKey(CalendarModule, on_delete=models.CASCADE)
    blacklist = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.notificationid

class SiteSettings(models.Model): 
    title = models.CharField(max_length=50) 
    redirectC = models.ForeignKey(CalendarModule, on_delete=models.CASCADE, null=True)
    redirectR = models.ForeignKey(RequestModule, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.title