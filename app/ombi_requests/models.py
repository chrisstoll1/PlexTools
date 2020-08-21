from django.db import models

# Create your models here.
class OmbiCredential(models.Model):
    name = models.CharField(max_length=100, blank=True, null=True)
    link = models.CharField(max_length=150, blank=True, null=True)
    apikey = models.CharField(max_length=100, blank=True, null=True)
    tv = models.BooleanField(default=False)
    mov = models.BooleanField(default=False)
    mus = models.BooleanField(default=False)

    def __str__(self):
        return self.name