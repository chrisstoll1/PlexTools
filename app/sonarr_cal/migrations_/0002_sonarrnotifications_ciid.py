# Generated by Django 3.0.5 on 2020-04-30 20:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sonarr_cal', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='sonarrnotifications',
            name='Ciid',
            field=models.CharField(default=1, max_length=100),
            preserve_default=False,
        ),
    ]
