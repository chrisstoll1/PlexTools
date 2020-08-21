from django.core.management.base import BaseCommand, CommandError
from main.models import CalendarModule, EmailCredential, Notification
import requests, json
from datetime import date, timedelta, datetime
from django.core.mail import send_mail, get_connection
from django.core.mail.message import EmailMessage

def sendEmail(email, array, server):
    my_host = server['HOST']
    my_port = server['PORT']
    my_username = server['USERNAME']
    my_password = server['PASSWORD']
    if int(server['USE_TLS']) == 1:
        my_use_tls = True
    else:
        my_use_tls = False
    with get_connection(host=my_host, port=my_port, username=my_username, password=my_password, use_tls=my_use_tls) as connection: 
        try:
            # TODO Update this to whatever the title of the site is set to
            subject = 'Plex Tools Notifications: ' + str(array['seriesT']) + ' (' + str(array['seasonN']) + 'x' + str(array['episodeN']) + ')   #' + str(array['id'])
            message = array['seriesT'] + ' (' + str(array['seasonN']) + 'x' + str(array['episodeN']) + ') - ' + str(array['episodeT']) + ' | ' + str(array['airdate']) + ' has been downloaded to the server! '
            recipient_list = [email]
            EmailMessage(subject, message, my_username, recipient_list, connection=connection).send()
        except:
            return 500
        else:
            return 200

class Command(BaseCommand):
    help = "Sends out email for sonarr_cal"

    def handle(self, *args, **options):
        #Get email connection settings
        self.stdout.write('Starting sonarr_cal_email script')
        try:
            Credentials = EmailCredential.objects.get(EmailCredentialType='Server')
            Server = ({
                'HOST': Credentials.HOST,
                'PORT': Credentials.PORT,
                'USERNAME': Credentials.USERNAME,
                'PASSWORD': Credentials.PASSWORD,
                'USE_TLS': int(Credentials.USE_TLS)
            })
        except:
            self.stdout.write('Script Exited Unexpectedly: Cannot connect to the email server! Ensure your settings are correct')
        else:
            #Loop through CalendarModules
            counter = 0
            CalendarModules = CalendarModule.objects.all()
            for calendarM in CalendarModules:
                #Get the sonarr credentials
                basepath = calendarM.sonarrcred.link
                apikey = calendarM.sonarrcred.apikey
                startdate = date.today() - timedelta(days=30)
                enddate = date.today() + timedelta(days=30)
                #Get the sonarr releases
                url = f"{basepath}/api/calendar?apikey={apikey}&start={startdate}&end={enddate}"
                payload = {}
                headers= {}

                try:
                    response = requests.request("GET", url, headers=headers, data = payload)
                except:
                    self.stdout.write(f"Script Error: Could not connect to Sonarr Module - {calendarM.sonarrcred.link}")
                else:
                    res = json.loads(response.text) 
                    releases = []
                    for x in res:
                        releases.append({
                            'id': x['id'],
                            'seriesId': x['seriesId'],
                            'downloaded': x['hasFile'],
                            # 'downloaded': True, # This is for testing only!
                            'airdate': x['airDate'],
                            'seriesT': x['series']['title'],
                            'episodeT': x['title'],
                            'seasonN': x['seasonNumber'],
                            'episodeN': x['episodeNumber']
                        })
                    
                    requested = Notification.objects.filter(calendar=calendarM, mode='email')
                    for r in requested:
                        for y in releases:
                            if str(r.notificationid) == str(y['id']):
                                if y['downloaded']:            
                                    if r.mode == 'email':
                                        if sendEmail(r.user.email, y, Server) == 200:  
                                            counter += 1     
                                            r.delete()                 
                            elif str(r.notificationid) == str(y['seriesId']):
                                if y['downloaded']:
                                    if r.blacklist == '' or r.blacklist == None:
                                        if r.mode == 'email':
                                            if sendEmail(r.user.email, y, Server) == 200:
                                                counter += 1 
                                                r.blacklist = str(y['id'])
                                                r.save()
                                    else:
                                        if str(y['id']) not in r.blacklist:
                                            if r.mode == 'email':
                                                if sendEmail(r.user.email, y, Server) == 200:
                                                    counter += 1 
                                                    temp = f"{str(r.blacklist)}:{str(y['id'])}"
                                                    r.blacklist = temp
                                                    r.save() 
            self.stdout.write(f"Script finished: {counter} emails sent")