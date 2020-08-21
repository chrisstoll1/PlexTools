# Generated by Django 3.0.5 on 2020-08-08 15:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0004_prequestmodule'),
    ]

    operations = [
        migrations.CreateModel(
            name='ModuleName',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ModuleType', models.CharField(choices=[('Calendar', 'CALENDAR'), ('Request', 'REQUEST')], default='Calendar', max_length=10)),
                ('ModuleName', models.CharField(max_length=50)),
            ],
        ),
    ]