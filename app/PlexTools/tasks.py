from celery import shared_task
from django.core.management import call_command

@shared_task
def sample_task():
    print("The sample task just ran.")

@shared_task
def send_sonarr_email_notifications():
    call_command("sonarr_cal_email",)