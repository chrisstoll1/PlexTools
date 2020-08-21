from django.shortcuts import render, HttpResponse
import json
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from main.models import CalendarModule, RequestModule, ModuleName, Notification, SiteSettings

@login_required
def home(request, cal_id):
    calendars = CalendarModule.objects.all()
    requests = RequestModule.objects.all()
    calendar = CalendarModule.objects.get(id=cal_id)
    CMname = ModuleName.objects.get(ModuleType="Calendar")
    RMname = ModuleName.objects.get(ModuleType="Request")
    settings = SiteSettings.objects.all()[0]

    if request.user.is_superuser:
        try:
            if request.user.profile.discord != '' and request.user.profile.discord != None:
                hasDiscord = True
            else:
                hasDiscord = False
        except:
            hasDiscord = False
    elif request.user.profile.discord != '' and request.user.profile.discord != None:
        hasDiscord = True
    else:
        hasDiscord = False 

    sonarrN = []
    for x in Notification.objects.all():
        if int(x.calendar.id) == int(cal_id):
            sonarrN.append({
                "Mode": x.mode,
                "Nuid": x.user.id,
                "Niid": x.notificationid,
                "blacklist": x.blacklist,
                "calID": x.calendar.id
            })

    sonarrC = {
        "Link": calendar.sonarrcred.link,
        "apikey": calendar.sonarrcred.apikey,
        "sonarrN": sonarrN,
        "Uid": request.user.id,
        "hasDiscord": hasDiscord,
        'isMobile': request.user_agent.is_mobile
    }

    if request.method == 'POST':
        if 'credentials' in request.POST:
            return HttpResponse(json.dumps(sonarrC))

        if 'notification' in request.POST:
            try:
                user = User.objects.get(id=int(request.POST.get("Nuid")))
                notificationid = int(request.POST.get("Niid"))
                mode = str(request.POST.get("Mode"))
                calendar = CalendarModule.objects.get(id=int(cal_id))
                SN = Notification.objects.create(notificationid=notificationid, user=user, calendar=calendar, mode=mode)
                SN.save()
            except:
                return HttpResponse(500)
            else:
                return HttpResponse(200)
        
        if 'editnotification' in request.POST:
            Niid = request.POST.get("Niid")
            user = User.objects.get(id=int(request.POST.get("Nuid")))
            calendar = CalendarModule.objects.get(id=int(request.POST.get("Ciid")))
            Mode = request.POST.get("Mode")
            EpisodeID = str(request.POST.get("EpisodeID"))
            T = request.POST.get("type")

            NotificationObject = Notification.objects.get(notificationid=Niid, user=user, mode=Mode, calendar=calendar)
            blacklist = NotificationObject.blacklist

            if T == 'remove':
                EID = f":{EpisodeID}"
                if EpisodeID in blacklist:
                    if EID in blacklist:
                        blacklist = blacklist.replace(EID, "")
                    else:
                        blacklist = blacklist.replace(EpisodeID, "")
            elif T == 'add':
                print(blacklist)
                if blacklist == '' or blacklist == None: #why doesn't this fire? 
                    blacklist = EpisodeID
                    print(blacklist)
                else:
                    if EpisodeID not in blacklist:
                        blacklist = f"{str(blacklist)}:{EpisodeID}"
                        
            NotificationObject.blacklist = blacklist
            NotificationObject.save()
            return HttpResponse(json.dumps(NotificationObject.blacklist))

        if 'deletenotification' in request.POST:
            user = User.objects.get(id=int(request.POST.get("Nuid")))
            calendar = CalendarModule.objects.get(id=int(request.POST.get("Ciid")))
            try:
                Notification.objects.get(user=user, mode=request.POST.get("Mode"), notificationid=request.POST.get("Niid"), calendar=calendar).delete()
            except:
                return HttpResponse(500)
            else:
                return HttpResponse(200)

    context = {
        'title': f'{calendar.title} - Calendar',
        'calendar': calendar,
        'calendars': calendars,
        'requests': requests,
        'CMname': CMname.ModuleName,
        'RMname': RMname.ModuleName,
        'settings': settings
    }
 
    return render(request, 'sonarr_cal/home.html', context)