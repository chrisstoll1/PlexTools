from django.urls import path
from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^(?P<req_id>\w+)/$', views.home, name='request'),
] 