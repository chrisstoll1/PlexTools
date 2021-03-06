# Generated by Django 3.0.5 on 2020-05-19 15:12

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('plextools_requests', '0001_initial'),
        ('main', '0003_auto_20200506_1410'),
    ]

    operations = [
        migrations.CreateModel(
            name='PRequestModule',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=50)),
                ('description', models.CharField(max_length=150)),
                ('status', models.BooleanField(default=False)),
                ('tvEnabled', models.BooleanField(default=False)),
                ('movEnabled', models.BooleanField(default=False)),
                ('musEnabled', models.BooleanField(default=False)),
                ('lidarrcred', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='plextools_requests.LidarrCredential')),
                ('radarrcred', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='plextools_requests.RadarrCredential')),
                ('sonarrcred', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='plextools_requests.SonarrCredential')),
            ],
        ),
    ]
