from django.shortcuts import render, redirect
from .models import Profile
from django.contrib.auth.models import User
from django.shortcuts import HttpResponse
from django.http import JsonResponse
from .forms import UserRegisterForm, ExtendedUserRegisterForm
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import update_session_auth_hash
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from main.models import CalendarModule, RequestModule, ModuleName, SiteSettings, Notification
import re
from .loadsonarrdata import GETsonarrData

# Create your views here.
def register(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        form2 = ExtendedUserRegisterForm(request.POST)
        if form.is_valid() and form2.is_valid():
            username = form.cleaned_data.get('username')
            email = form.cleaned_data.get('email')
            password = form.cleaned_data.get('password1')
            new_user = User.objects.create_user(username, email, password)

            discord = form2.cleaned_data.get('discord')
            new_profile = Profile(user=new_user, discord=discord)

            new_profile.save()
            new_user.save()
            messages.success(request, f'Account Created for {username}! You may now login.')
            return redirect('user-login')
        pass
    else:
        form = UserRegisterForm()
        form2 = ExtendedUserRegisterForm()
    return render(request, 'users/register.html', {'title': 'Register', 'form': form, 'form2': form2})

@login_required
def profile(request):
    calendars = CalendarModule.objects.all()
    requests = RequestModule.objects.all()
    CMname = ModuleName.objects.get(ModuleType="Calendar")
    RMname = ModuleName.objects.get(ModuleType="Request")
    settings = SiteSettings.objects.all()[0]
    try:
        N = Notification.objects.filter(user=request.user)
    except:
        N = False

    Notifications = []
    for n in N:
        Notifications.append({
            'notificationID': n.notificationid,
            'calendarID': n.calendar.id,
            'blacklist': n.blacklist,
            'mode': n.mode
        })

    CMods = []
        
    if request.method == 'POST':
        if "profile-username" in request.POST:
            email = request.POST.get("profile-email")
            discord = request.POST.get("profile-discord")
            
            if request.user.email != email:
                regex = r'^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$'
                if (re.search(regex, email)):
                    request.user.email = email
                    request.user.save()
                    messages.success(request, 'Your email was successfully updated!')
                else:
                    messages.warning(request, 'Could not update email!')

            if request.user.profile.discord != discord:
                try:
                    request.user.profile.discord = discord
                    request.user.profile.save()
                except:
                    messages.warning(request, 'Could not update discord!')
                else:
                    messages.success(request, 'Your discord was successfully updated!')

            return redirect('user-profile')
        elif "GETnotifications" in request.POST:
            for calendarM in calendars:
                #Get the sonarr credentials
                basepath = calendarM.sonarrcred.link
                apikey = calendarM.sonarrcred.apikey
                CMods.append({
                    'calID': calendarM.id,
                    'title': calendarM.title,
                    'data': GETsonarrData(basepath, apikey) #TODO offload to celery long running task. (Dont want to run this on the main thread)
                })

            return JsonResponse({
                'notifications': Notifications,
                'calendars': CMods
            })
        elif "deletenotification" in request.POST:
            Id = request.POST.get("id")
            seriesId = request.POST.get("seriesId")
            Niid = request.POST.get("Niid")
            Ciid = request.POST.get("Ciid")
            L = request.POST.get("list")
            calendar = CalendarModule.objects.get(id=Ciid)
            error = False
            if L == 'episode':
                try:
                    notificationObject1 = Notification.objects.filter(user=request.user, mode='discord', notificationid=Niid, calendar=calendar)  
                    notificationObject1.delete()
                except:
                    error = True
                try:
                    notificationObject2 = Notification.objects.filter(user=request.user, mode='email', notificationid=Niid, calendar=calendar)  
                    notificationObject2.delete()
                except:
                    error = True     
            elif L == 'series_episode':
                try:
                    notificationObject1 = Notification.objects.get(user=request.user, mode='discord', notificationid=Niid, calendar=calendar)  
                    blacklist = notificationObject1.blacklist
                    if blacklist == '' or blacklist == None: 
                        blacklist = Id
                        # print(blacklist)
                    else:
                        if Id not in blacklist:
                            blacklist = f"{str(blacklist)}:{Id}"
                    notificationObject1.blacklist = blacklist
                    notificationObject1.save()
                except:
                    pass
                try:
                    notificationObject2 = Notification.objects.get(user=request.user, mode='email', notificationid=Niid, calendar=calendar)  
                    blacklist = notificationObject2.blacklist
                    if blacklist == '' or blacklist == None: 
                        blacklist = Id
                        # print(blacklist)
                    else:
                        if Id not in blacklist:
                            blacklist = f"{str(blacklist)}:{Id}"
                    notificationObject2.blacklist = blacklist
                    notificationObject2.save()
                except:
                    pass  
            elif L == 'series':
                try:
                    notificationObject1 = Notification.objects.filter(user=request.user, mode='discord', notificationid=Niid, calendar=calendar)  
                    notificationObject1.delete()
                except:
                    error = True
                try:
                    notificationObject2 = Notification.objects.filter(user=request.user, mode='email', notificationid=Niid, calendar=calendar)  
                    notificationObject2.delete()
                except:
                    error = True     
            if error:
                return HttpResponse(500)
            else:
                return HttpResponse(200)
        else:
            passwordForm = PasswordChangeForm(request.user, request.POST)
            if passwordForm.is_valid():
                user = passwordForm.save()  
                update_session_auth_hash(request, user)
                messages.success(request, 'Your password was successfully updated!')
                return redirect('user-profile')
            else:
                messages.warning(request, 'Could not update password!')
                return redirect('user-profile')

    else:     
        passwordForm = PasswordChangeForm(request.user)
        context = {
            'title': 'Profile',
            'calendars': calendars,
            'requests': requests,
            'passwordForm': passwordForm,
            'CMname': CMname.ModuleName,
            'RMname': RMname.ModuleName,
            'settings': settings
        }
        return render(request, 'users/profile.html', context)


def password_done(request):
    messages.success(request, f'Password Reset Email Sent!')
    return redirect('user-reset')

def password_complete(request):
    messages.success(request, f'Password Reset Successfully!')
    return redirect('user-login') 