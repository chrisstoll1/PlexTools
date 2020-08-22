from django.urls import path
from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^(?P<task_id>^\S+)/$', views.get_task_status, name='get_task_status'),
] 