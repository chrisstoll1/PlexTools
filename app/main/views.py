from django.shortcuts import render, redirect
from .models import CalendarModule
from sonarr_cal.models import SonarrCredential
from ombi_requests.models import OmbiCredential
from django.shortcuts import HttpResponse
from django.http import JsonResponse
from .models import CalendarModule, RequestModule, PRequestModule, ModuleName, EmailCredential, SiteSettings
from django.contrib.admin.views.decorators import staff_member_required
from django.views.decorators.csrf import csrf_exempt
from celery.result import AsyncResult
# Create your views here.
def home(request):
    calendars = CalendarModule.objects.all()
    requests = RequestModule.objects.all()
    #load settings
    try:
        settings = SiteSettings.objects.all()[0]
    except:
        settings = SiteSettings(title='Plex Tools')
        settings.save()
    try:
        CMname = ModuleName.objects.get(ModuleType="Calendar")
    except:
        CMname = ModuleName(ModuleName='Calendar Modules', ModuleType='Calendar')
        CMname.save()
    try:
        RMname = ModuleName.objects.get(ModuleType="Request")
    except:
        RMname = ModuleName(ModuleName='Request Modules', ModuleType='Request')
        RMname.save()
    context = {
        'title': 'Home',
        'calendars': calendars,
        'requests': requests,
        'CMname': CMname.ModuleName,
        'RMname': RMname.ModuleName,
        'settings': settings
    }

    if settings.redirectC:
        return redirect(f'/home/calendar/{settings.redirectC.id}')
    if settings.redirectR:
        return redirect(f'/home/request/{settings.redirectR.id}')


    return render(request, 'main/home.html', context)  

@staff_member_required
def administration(request): 
    calendars = CalendarModule.objects.all()
    requests = RequestModule.objects.all()
    prequests = PRequestModule.objects.all()
    #load settings
    try:
        settings = SiteSettings.objects.all()[0]
    except:
        settings = SiteSettings(title='Plex Tools')
        settings.save()
    #try to load email credentials
    try:
        ServerEmail = EmailCredential.objects.get(EmailCredentialType='Server')
    except:
        ServerEmail = False
    #Load Module Category Names
    try:
        CMname = ModuleName.objects.get(ModuleType="Calendar")
    except:
        CMname = ModuleName(ModuleName='Calendar Modules', ModuleType='Calendar')
        CMname.save()
    try:
        RMname = ModuleName.objects.get(ModuleType="Request")
    except:
        RMname = ModuleName(ModuleName='Request Modules', ModuleType='Request')
        RMname.save()

    calendarModules = []
    for cmodule in calendars:
        calendarModules.append({
            'id': cmodule.id,
            'title': cmodule.title,
            'description': cmodule.description,
            'status': cmodule.status,
            'sonarrName': cmodule.sonarrcred.name,
            'sonarrLink': cmodule.sonarrcred.link,
            'sonarrApiKey': cmodule.sonarrcred.apikey
        })
    
    requestModules = []
    for rmodule in requests:
        requestModules.append({
            'id': rmodule.id,
            'title': rmodule.title,
            'description': rmodule.description,
            'status': rmodule.status,
            'ombiName': rmodule.ombicred.name,
            'ombiLink': rmodule.ombicred.link,
            'ombiApiKey': rmodule.ombicred.apikey
        })
    
    pRequestModules = []
    for prmodule in prequests:
        pRequestModules.append({
            'id': rmodule.id,
            'title': rmodule.title,
            'description': rmodule.description,
            'status': rmodule.status,
            'ombiName': rmodule.ombicred.name,
            'ombiLink': rmodule.ombicred.link,
            'ombiApiKey': rmodule.ombicred.apikey
        })

    if request.method == 'POST':
        if 'calendarCreate' in request.POST:
            if (request.POST.get("title") == ''):
                title = "Calendar"
            else:
                title = request.POST.get("title")
            if (request.POST.get("description") == ''):
                description = 'Calendar For Sonarr'
            else:
                description = request.POST.get("description")
            sonarrName = request.POST.get("sonarrName")
            sonarrBasePath = request.POST.get("sonarrBasePath")
            sonarrApiKey = request.POST.get("sonarrApiKey")

            try:
                new_sonarrCred = SonarrCredential(name=sonarrName, link=sonarrBasePath, apikey=sonarrApiKey)
                new_sonarrCred.save()
                new_calendar = CalendarModule(sonarrcred=new_sonarrCred, title=title, description=description)
                new_calendar.save()
            except:
                return HttpResponse(6)
            else:
                try:
                    module = CalendarModule.objects.get(id=new_calendar.id)
                except:
                    return HttpResponse(7)
                else:
                    return JsonResponse({
                        'id': module.id,
                        'title': module.title,
                        'description': module.description,
                        'status': module.status,
                        'sonarrName': module.sonarrcred.name,
                        'sonarrLink': module.sonarrcred.link,
                        'sonarrApiKey': module.sonarrcred.apikey
                    })
        elif 'calendarToggle' in request.POST:
            mid = request.POST.get('id')
            toggled = request.POST.get('toggled')
            try:
                module = CalendarModule.objects.get(id=mid)
            except:
                return HttpResponse(8)
            else:
                try:
                    if (toggled == 'true'):
                        module.status = True
                    else:
                        module.status = False
                    module.save()
                except:
                    return HttpResponse(9)
                else:
                    return HttpResponse(200)
        elif 'calendarGet' in request.POST:
            mid = request.POST.get('id')
            try:
                module = CalendarModule.objects.get(id=mid)
            except:
                return HttpResponse(8)
            else:
                return JsonResponse({
                    'id': module.id,
                    'title': module.title,
                    'description': module.description,
                    'status': module.status,
                    'sonarrName': module.sonarrcred.name,
                    'sonarrLink': module.sonarrcred.link,
                    'sonarrApiKey': module.sonarrcred.apikey
                })
        elif 'calendarUpdate' in request.POST:
            mid = request.POST.get('id')
            title = request.POST.get("title")
            description = request.POST.get("description")
            sonarrName = request.POST.get("sonarrName")
            sonarrBasePath = request.POST.get("sonarrBasePath")
            sonarrApiKey = request.POST.get("sonarrApiKey")

            try:
                module = CalendarModule.objects.get(id=mid)
            except:
                return HttpResponse(8)
            else:
                try:
                    if module.title != title:
                        module.title = title
                    if module.description != description:
                        module.description = description
                    if module.sonarrcred.name != sonarrName:
                        module.sonarrcred.name = sonarrName
                    if module.sonarrcred.link != sonarrBasePath:
                        module.sonarrcred.link = sonarrBasePath
                    if module.sonarrcred.apikey != sonarrApiKey:
                        module.sonarrcred.apikey = sonarrApiKey
                    module.save()
                    module.sonarrcred.save()
                except:
                    return HttpResponse(9)
                else:
                    return JsonResponse({
                        'id': module.id,
                        'title': module.title,
                        'description': module.description,
                        'status': module.status,
                        'sonarrName': module.sonarrcred.name,
                        'sonarrLink': module.sonarrcred.link,
                        'sonarrApiKey': module.sonarrcred.apikey
                    })
        elif 'calendarDelete' in request.POST:
            mid = request.POST.get('id')

            try:
                module = CalendarModule.objects.get(id=mid)
            except:
                return HttpResponse(8)
            else:
                try:
                    module.sonarrcred.delete()
                    module.delete()
                except:
                    return HttpResponse(9)
                else:
                    return HttpResponse(200)
        elif 'requestCreate' in request.POST:
            if (request.POST.get("title") == ''):
                title = "Request"
            else:
                title = request.POST.get("title")
            if (request.POST.get("description") == ''):
                description = 'Content Request Page'
            else:
                description = request.POST.get("description")
            ombiName = request.POST.get("ombiName")
            ombiBasePath = request.POST.get("ombiBasePath")
            ombiApiKey = request.POST.get("ombiApiKey")
            if request.POST.get("tv_available") == 'true':
                tv_available = True
            else:
                tv_available = False
            if request.POST.get("mov_available") == 'true':
                mov_available = True
            else:
                mov_available = False
            if request.POST.get("mus_available") == 'true':
                mus_available = True
            else:
                mus_available = False

            try:
                new_ombiCred = OmbiCredential(name=ombiName, link=ombiBasePath, apikey=ombiApiKey, tv=tv_available, mov=mov_available, mus=mus_available)
                new_ombiCred.save()
                new_request = RequestModule(ombicred=new_ombiCred, title=title, description=description)
                new_request.save()
            except:
                return HttpResponse(6)
            else:
                try:
                    module = RequestModule.objects.get(id=new_request.id)
                except:
                    return HttpResponse(7)
                else:
                    return JsonResponse({
                        'id': module.id,
                        'title': module.title,
                        'description': module.description,
                        'status': module.status,
                        'tvEnabled': module.tvEnabled,
                        'movEnabled': module.movEnabled,
                        'musEnabled': module.musEnabled,
                        'ombiName': module.ombicred.name,
                        'ombiLink': module.ombicred.link,
                        'ombiApiKey': module.ombicred.apikey,
                        'ombiTV': module.ombicred.tv,
                        'ombiMOV': module.ombicred.mov,
                        'ombiMUS': module.ombicred.mus
                    })
        elif 'requestToggle' in request.POST:
                mid = request.POST.get('id')
                toggled = request.POST.get('toggled')
                try:
                    module = RequestModule.objects.get(id=mid)
                except:
                    return HttpResponse(8)
                else:
                    try:
                        if (toggled == 'true'):
                            module.status = True
                        else:
                            module.status = False
                        module.save()
                    except:
                        return HttpResponse(9)
                    else:
                        return HttpResponse(200)
        elif 'requestGet' in request.POST:
            mid = request.POST.get('id')
            try:
                module = RequestModule.objects.get(id=mid)
            except:
                return HttpResponse(8)
            else:
                return JsonResponse({
                    'id': module.id,
                    'title': module.title,
                    'description': module.description,
                    'status': module.status,
                    'tvEnabled': module.tvEnabled,
                    'movEnabled': module.movEnabled,
                    'musEnabled': module.musEnabled,
                    'ombiName': module.ombicred.name,
                    'ombiLink': module.ombicred.link,
                    'ombiApiKey': module.ombicred.apikey,
                    'ombiTV': module.ombicred.tv,
                    'ombiMOV': module.ombicred.mov,
                    'ombiMUS': module.ombicred.mus
                })
        elif 'requestUpdate' in request.POST:
            mid = request.POST.get('id')
            title = request.POST.get("title")
            description = request.POST.get("description")
            ombiName = request.POST.get("ombiName")
            ombiBasePath = request.POST.get("ombiBasePath")
            ombiApiKey = request.POST.get("ombiApiKey")
            tv_toggle = request.POST.get("tv_toggle")
            mov_toggle = request.POST.get("mov_toggle")
            mus_toggle = request.POST.get("mus_toggle")

            try:
                module = RequestModule.objects.get(id=mid)
            except:
                return HttpResponse(8)
            else:
                try:
                    if module.title != title:
                        module.title = title
                    if module.description != description:
                        module.description = description
                    if module.ombicred.name != ombiName:
                        module.ombicred.name = ombiName
                    if module.ombicred.link != ombiBasePath:
                        module.ombicred.link = ombiBasePath
                    if module.ombicred.apikey != ombiApiKey:
                        module.ombicred.apikey = ombiApiKey
                    if module.ombicred.tv:
                        if tv_toggle == 'true':
                            tv_toggle = True
                        else:
                            tv_toggle = False
                        if module.tvEnabled != tv_toggle:
                            module.tvEnabled = tv_toggle
                    else:
                        module.tvEnabled = False
                    if module.ombicred.mov:
                        if mov_toggle == 'true':
                            mov_toggle = True
                        else:
                            mov_toggle = False
                        if module.movEnabled != mov_toggle:
                            module.movEnabled = mov_toggle
                    else:
                        module.movEnabled = False
                    if module.ombicred.mus:
                        if mus_toggle == 'true':
                            mus_toggle = True
                        else:
                            mus_toggle = False
                        if module.musEnabled != mus_toggle:
                            module.musEnabled = mus_toggle
                    else:
                        module.musEnabled = False
                    module.save()
                    module.ombicred.save()
                except:
                    return HttpResponse(9)
                else:
                    return JsonResponse({
                        'id': module.id,
                        'title': module.title,
                        'description': module.description,
                        'status': module.status,
                        'tvEnabled': module.tvEnabled,
                        'movEnabled': module.movEnabled,
                        'musEnabled': module.musEnabled,
                        'ombiName': module.ombicred.name,
                        'ombiLink': module.ombicred.link,
                        'ombiApiKey': module.ombicred.apikey,
                        'ombiTV': module.ombicred.tv,
                        'ombiMOV': module.ombicred.mov,
                        'ombiMUS': module.ombicred.mus
                    })
        elif 'requestDelete' in request.POST:
            mid = request.POST.get('id')

            try:
                module = RequestModule.objects.get(id=mid)
            except:
                return HttpResponse(8)
            else:
                try:
                    module.ombicred.delete()
                    module.delete()
                except:
                    return HttpResponse(9)
                else:
                    return HttpResponse(200)
        elif 'rebuildNav' in request.POST:
            settings = SiteSettings.objects.all()[0]
            try:
                redir = {
                    'id': settings.redirectC.id,
                    'type': "C"
                    }
            except:
                try:
                    redir = {
                        'id': settings.redirectR.id,
                        'type': "R"
                    }
                except:
                    redir = False
            return JsonResponse({
                'calendars': calendarModules,
                'requests': requestModules,
                'CMname': CMname.ModuleName,
                'RMname': RMname.ModuleName,
                'redirect': redir 
            })
        elif 'UpdateModuleName' in request.POST:
            Type = request.POST.get('ModuleType')
            Name = request.POST.get('ModuleName')

            if Type == 'Calendar':
                CMname.ModuleName = Name
                CMname.save()
                return JsonResponse({
                    'Name': CMname.ModuleName
                })
            elif Type == 'Request':
                RMname.ModuleName = Name
                RMname.save()
                return JsonResponse({
                    'Name': RMname.ModuleName
                })
            else:
                return HttpResponse(405)
        elif 'POSTserverEmail' in request.POST:
            if request.POST.get('USE_TLS') == 'true':
                USE_TLS = True
            else:
                USE_TLS = False
            E_HOST = request.POST.get('E_HOST')
            E_PORT = request.POST.get('E_PORT')
            E_USERNAME = request.POST.get('E_USERNAME')
            E_PASS = request.POST.get('E_PASS')

            if not ServerEmail:
                ServerEmail = EmailCredential(USE_TLS=USE_TLS, HOST=E_HOST, PORT=E_PORT, USERNAME=E_USERNAME, PASSWORD=E_PASS)
                ServerEmail.save()
            else:
                ServerEmail.USE_TLS = USE_TLS
                ServerEmail.HOST = E_HOST
                ServerEmail.PORT = E_PORT
                ServerEmail.USERNAME = E_USERNAME
                if not E_PASS == '**********':
                    ServerEmail.PASSWORD = E_PASS
                ServerEmail.save()
            
            return JsonResponse({
                'USE_TLS': ServerEmail.USE_TLS,
                'E_HOST': ServerEmail.HOST,
                'E_PORT': ServerEmail.PORT,
                'E_USERNAME': ServerEmail.USERNAME,
                'E_PASS': '**********'
            })
        elif 'DELETEserverEmail' in request.POST:
            try:
                ServerEmail.delete()
            except: 
                return HttpResponse(405)
            else:
                return HttpResponse(200)
        elif 'UpdateSiteSettings' in request.POST:
            redirect_class = request.POST.get('redirect_class')
            redirectID = request.POST.get('redirect')
            if redirect_class == 'calendar':
                module = CalendarModule.objects.get(id=redirectID)
                settings.redirectC = module
                settings.redirectR = None
                settings.save()
            elif redirect_class == 'request':
                module = RequestModule.objects.get(id=redirectID)
                settings.redirectR = module
                settings.redirectC = None
                settings.save()
            else:
                settings.redirectR = None
                settings.redirectC = None
                settings.save()
            title = request.POST.get('title')
            settings.title = title
            settings.save()

            return JsonResponse({
                'title': settings.title,
            })


    context = {
        'title': 'Admin',
        'calendars': calendars,
        'cmodules': calendarModules,
        'rmodules': requestModules,
        'requests': requests, 
        'CMname': CMname.ModuleName,
        'RMname': RMname.ModuleName,
        'ServerEmail': ServerEmail,
        'settings': settings
    }

    return render(request, 'main/admin.html', context)

def redirectHome(request):
    return redirect('main-home')

@csrf_exempt
def get_task_status(request, task_id):
    task_result = AsyncResult(task_id)
    result = {
        'task_id': task_id,
        "task_status": task_result.status,
        "task_result": task_result.result
    }
    return JsonResponse(result, status=200)



