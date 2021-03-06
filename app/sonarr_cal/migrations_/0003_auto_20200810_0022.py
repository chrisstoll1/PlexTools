# Generated by Django 3.0.7 on 2020-08-10 00:22

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('sonarr_cal', '0002_sonarrnotifications_ciid'),
    ]

    operations = [
        migrations.CreateModel(
            name='SonarrNotification',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('mode', models.CharField(blank=True, choices=[('discord', 'Discord'), ('email', 'Email')], max_length=15, null=True)),
                ('episodeid', models.CharField(max_length=25)),
                ('calendarid', models.CharField(max_length=100)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.DeleteModel(
            name='SonarrNotifications',
        ),
    ]
