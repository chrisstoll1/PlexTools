"""PlexTools URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf.urls import url
from main import views as main_views
from users import views as user_views
from sonarr_cal import views as sonarr_cal_views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', main_views.redirectHome, name='main-redirect'),
    path('tasks/', include('main.urls')),
    path('home/calendar/', include('sonarr_cal.urls')),
    path('home/request/', include('ombi_requests.urls')),
    path('home/admin/', main_views.administration, name='main-admin'),
    path('home/', main_views.home, name='main-home'),
    path('profile/', user_views.profile, name='user-profile'),
    path('register/', user_views.register, name='user-register'),
    path('login/', auth_views.LoginView.as_view(template_name='users/login.html'), name='user-login'),
    path('logout/', auth_views.LogoutView.as_view(template_name='users/logout.html'), name='user-logout'),
    path('password-reset/', auth_views.PasswordResetView.as_view(template_name='users/password_reset.html'), name='user-reset'),
    path('password-reset/done/', user_views.password_done, name='password_reset_done'),
    path('password-reset/complete/', user_views.password_complete, name='password_reset_complete'),
    path('password-reset-confirm/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name='users/password_reset_confirm.html'), name='password_reset_confirm'),
]

