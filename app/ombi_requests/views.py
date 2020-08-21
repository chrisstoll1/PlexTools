from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.shortcuts import HttpResponse
from main.models import CalendarModule, RequestModule, ModuleName, SiteSettings
import json
# Create your views here.
@login_required
def home(request, req_id):
    req = RequestModule.objects.get(id=req_id)
    calendars = CalendarModule.objects.all()
    requests = RequestModule.objects.all()
    CMname = ModuleName.objects.get(ModuleType="Calendar")
    RMname = ModuleName.objects.get(ModuleType="Request")
    settings = SiteSettings.objects.all()[0]

    ombiC = {
        "Link": req.ombicred.link,
        "apikey": req.ombicred.apikey
    }
    context = {
        'title': f'{req.title} - Request',
        'req': req,
        'calendars': calendars,
        'requests': requests,
        'CMname': CMname.ModuleName,
        'RMname': RMname.ModuleName,
        'settings': settings
    }


    if request.method == 'POST':
        if 'credentials' in request.POST:
            return HttpResponse(json.dumps(ombiC))

    return render(request, 'ombi_requests/home.html', context)