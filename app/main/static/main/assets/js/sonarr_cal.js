//Generates TV Show Download Schedule Calendar along with the Notification request
var sonarrN, isMobile, uid, discordValue, emailValue, seriesValue, hasDiscord, gcid, raw_response, calendar

function createNotification(Niid, Nuid, Mode){
    document.getElementById("NotificationSubmit").style.display = "none";
    document.getElementById("NotificationInput").style.display = "none";
    document.getElementById("NotificationLoading").style.display = "inline";
    var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    var settings = {
        "url": `/home/calendar/${gcid}/`,
        "method": "POST",
        "headers": {
        "X-CSRFToken": $csrf_token,
        },
        "data": {
        'notification': 'true',
        'Niid': Niid,
        'Nuid': Nuid,
        'Mode': Mode
        }
    }
         
    $.ajax(settings).done(function (response) {
        document.getElementById("NotificationLoading").style.display = "none";
        document.getElementById("NotificationSubmit").style.display = "inline";
        document.getElementById("NotificationInput").style.display = "inline";
        sonarrN.push({
            'Niid': Niid,
            'Nuid': Nuid,
            'Mode': Mode,
            'calID': gcid,
            'blacklist': ""
        })
        re_renderCalendar();
    });
}

function editNotification(Niid, Nuid, Mode, EpisodeID, type){
    document.getElementById("NotificationSubmit").style.display = "none";
    document.getElementById("NotificationInput").style.display = "none";
    document.getElementById("NotificationLoading").style.display = "inline";
    var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    var settings = {
        "url": `/home/calendar/${gcid}/`,
        "method": "POST",
        "headers": {
        "X-CSRFToken": $csrf_token,
        },
        "data": {
        'editnotification': 'true',
        'Niid': Niid,
        'Nuid': Nuid,
        'Mode': Mode,
        'Ciid': gcid,
        'EpisodeID': EpisodeID,
        'type': type
        }
    }
        
    $.ajax(settings).done(function (response) {
        document.getElementById("NotificationLoading").style.display = "none";
        document.getElementById("NotificationSubmit").style.display = "inline";
        document.getElementById("NotificationInput").style.display = "inline";
        // console.log(response);
        for (i = 0; i < sonarrN.length; i++) {
            if (sonarrN[i].Niid == Niid) {
                if (sonarrN[i].Nuid == Nuid) {
                    if (sonarrN[i].Mode == Mode) {
                        if (sonarrN[i].calID == gcid){
                            sonarrN[i].blacklist = response; //update the blacklist for the notification in javascript
                            // console.log(sonarrN[i].blacklist)

                        }
                    }
                }
            }
        }
        re_renderCalendar();
    });
}

function deleteNotification(Niid, Nuid, Mode){
    document.getElementById("NotificationSubmit").style.display = "none";
    document.getElementById("NotificationInput").style.display = "none";
    document.getElementById("NotificationLoading").style.display = "inline";
    var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    var settings = {
        "url": `/home/calendar/${gcid}/`,
        "method": "POST",
        "headers": {
        "X-CSRFToken": $csrf_token,
        },
        "data": {
        'deletenotification': 'true',
        'Niid': Niid,
        'Nuid': Nuid,
        'Mode': Mode,
        'Ciid': gcid
        }
    }
        
    $.ajax(settings).done(function (response) {
        document.getElementById("NotificationLoading").style.display = "none";
        document.getElementById("NotificationSubmit").style.display = "inline";
        document.getElementById("NotificationInput").style.display = "inline";
        for (i = 0; i < sonarrN.length; i++) {
            if (sonarrN[i].Niid == Niid) {
                if (sonarrN[i].Nuid == Nuid) {
                    if (sonarrN[i].Mode == Mode) {
                        sonarrN.splice(i, 1);
                    }
                }
            }
        }
        re_renderCalendar();
    });
}

function notificationSignup(){ //Some of these logic gates I wrote a long time ago and are un-needed! This is really fucking stupid, but it works so fuck you
    //The way series notifications are handled is really stupid which is why this is so complicated. It should be re-written
    // console.log("Notification Sign Up");
    var emailCheckbox = document.getElementById("emailCheckbox").checked; //get the current value of the email checkbox
    var discordCheckbox = document.getElementById("discordCheckbox").checked; //get the current value of the discord checkbox
    var seriesCheck = document.getElementById("seriesNotificationsSwitch").checked; //get the current value of the notification switch checkbox
    var id = document.getElementById("EventPublicID").innerText; //get the episodeID from a HTML element
    var serid = document.getElementById("EventSeriesID").innerText; //get the seriesID from a HTML element
    
    //check if the notification exists
    dnexists = false;
    enexists = false;
    snexists = false;
    sdnexists = false;
    senexists = false;
    for (i = 0; i < sonarrN.length; i++) { //Loop through all the notifications
        if (sonarrN[i].Niid == id){ //if the episodeID is equal to the notificationID
            if (sonarrN[i].Nuid == uid){ //if the notification userID is equal to the current User
                if (sonarrN[i].Mode == 'discord'){ //if the notification mode is equal to discord
                    dnexists = true; //The notification already exists
                }
                if (sonarrN[i].Mode == 'email'){ //if the notification mode is equal to email
                    enexists = true; //The notification already exists
                }
            }
        }else if (sonarrN[i].Niid == serid) { //if the seriesID is equal to the notificationID
            if (sonarrN[i].Nuid == uid) { //if the notification userID is equal to the current User
                snexists = true; //The series notification already exists
                if (sonarrN[i].Mode == 'discord'){ //if the notification mode is equal to discord
                    sdnexists = true; //The series discord notification already exists
                }
                if (sonarrN[i].Mode == 'email'){ //if the notification mode is equal to email
                    senexists = true; //The series email notification already exists
                }   
            }
        }
    } 

    if (seriesCheck != seriesValue || emailCheckbox != emailValue || discordCheckbox != discordValue){ //Check if any values are changed from what is stored in the database
        // console.log("The value has changed");
        if (seriesCheck == true){ //if the series checkbox is equal to true
            if (emailCheckbox || discordCheckbox){ //if either the email checkbox or discord checkbox is checked
                //series
                if (snexists == false){ //if the series notification does not exist
                    //need to create series notification
                    if (emailCheckbox == true){ //if email checkbox is checked
                        createNotification(serid, uid, 'email') //create a series notification with mode email for the current user
                        if (enexists == true){
                            deleteNotification(id, uid, 'email')
                        }
                    }
                    if (discordCheckbox == true){ //if discord checkbox is checked
                        createNotification(serid, uid, 'discord') //create a series notification with mode discord for the current user
                        if (dnexists == true){
                            deleteNotification(id, uid, 'discord')
                        }
                    }
                }else if (snexists == true){ //if the series notification already exists
                    // console.log("Series Notification already exists");
                    if (emailCheckbox != emailValue){ //if the email checkbox value is different from the value stored in the database
                        // console.log("email checkbox value is different");
                        if (emailCheckbox == true){ //if the email checkbox is checked
                            // console.log("email checkbox is set to true");

                            //need email series
                            if (senexists == false){ //if the series email notification does not already exist
                                createNotification(serid, uid, 'email') //create a series notification with mode email for the current user
                            }else{ // if the series email notification does exist
                                // console.log("make sure episode ID is not in the blacklist");
                                // console.log(id);
                                editNotification(serid, uid, 'email', id, 'remove'); //remove the episode ID from the blacklist
                            }
                        }
                        if (emailCheckbox == false){ //if the email checkbox is unchecked
                            // console.log("email checkbox is set to false");
                            //dont need email series
                            if (senexists == true){ //if the series email notification does already exist
                                if (seriesCheck == true){
                                    editNotification(serid, uid, 'email', id, 'add');  
                                }else{
                                    deleteNotification(serid, uid, 'email') //delete the series email notification for the current user
                                }
                            }
                        }
                    }
                    if (discordCheckbox != discordValue){ //if the discord checkbox value is different from the value stored in the database
                        if (discordCheckbox == true){ //if the discord checkbox is checked
                            //need discord series
                            if (sdnexists == false){ //if the series discord notification does not already exist
                                createNotification(serid, uid, 'discord') //create a series notification with mode discord for the current user
                            }else{
                                // console.log("make sure episode ID is not in the blacklist");
                                // console.log(id);
                                editNotification(serid, uid, 'discord', id, 'remove'); //remove the episode ID from the blacklist
                            }
                        }
                        if (discordCheckbox == false){ //if the discord checkbox is unchecked
                            //dont need discord series
                            if (sdnexists == true){ //if the series notification already exists
                                if (seriesCheck == true){
                                    editNotification(serid, uid, 'discord', id, 'add');
                                }else{
                                    deleteNotification(serid, uid, 'discord') //delete the series discord notification for the current user
                                }
                            }
                        }
                    }
                }
            }else{
                // console.log("Email and discord unchecked, series is checked");
                if (discordCheckbox == false){ //if the discord checkbox is unchecked
                    //dont need discord series
                    if (sdnexists == true){ //if the series notification already exists
                        editNotification(serid, uid, 'discord', id, 'add');
                    }
                }
                if (emailCheckbox == false){ //if the email checkbox is unchecked
                    //dont need discord series
                    if (senexists == true){ //if the series notification already exists
                        editNotification(serid, uid, 'email', id, 'add');
                    }
                }
            }
        }else if (seriesCheck == false){ //if series toggle is false
            //episode
            if (snexists == true){
                //need to delete series notification
                if (senexists == true){
                    deleteNotification(serid, uid, 'email')
                }
                if (sdnexists == true){
                    deleteNotification(serid, uid, 'discord')
                }
            }

            //email notification on
            if (emailCheckbox == true){
                //email notification needs to exist
                if (enexists == false){
                    //create it 
                    createNotification(id, uid, 'email')
                }
            }

            //email notification off
            if (emailCheckbox == false){
                //email notification needs to not exist
                if (enexists == true){
                    //delete it 
                    deleteNotification(id, uid, 'email')
                }
            }
            //discord notification on
            if (discordCheckbox == true){
                //discord notification needs to exist
                if (dnexists == false){
                    //create it 
                    createNotification(id, uid, 'discord')
                }
            }

            //discord notification off
            if (discordCheckbox == false){
                //discord notification needs to not exist
                if (dnexists == true){
                    //delete it 
                    deleteNotification(id, uid, 'discord')
                }
            }
        }
    }

    discordValue = document.getElementById("discordCheckbox").checked
    emailValue = document.getElementById("emailCheckbox").checked
    seriesValue = document.getElementById("seriesNotificationsSwitch").checked

    // console.log(sonarrN);
    if (seriesCheck && (discordCheckbox || emailCheckbox)){ //TODO Fix this its very buggy
        document.getElementById("calendarModalHeader").setAttribute("style", "background-color: #ffc812;");
    }else if(emailCheckbox || discordCheckbox){
        document.getElementById("calendarModalHeader").setAttribute("style", "background-color: #14abde;");
    }else{
        document.getElementById("calendarModalHeader").setAttribute("style", "background-color: #fb6340;");
    }
}

//Renders the Calendar with all events 
function renderCalendar(E){
    var calendarEl = document.getElementById('calendar');
    calendarEl.innerHTML = "";
    if (isMobile){
        var defaultV = 'dayGridDay';
    }else{
        var defaultV = 'dayGridWeek';
    }

    calendar = new FullCalendar.Calendar(calendarEl, {
      plugins: [ 'dayGrid' ],
      defaultView: defaultV,
      events: E,
      eventClick: function(info) {
          var EP = info.event._def.extendedProps
          var EV = info.event._def
          var downloaded = false
          if (info.event._def.ui.backgroundColor == '#2dce89'){
              downloaded = true
          }
          document.getElementById("calendarModalTitle").innerHTML = EV.title + ' - ' + EP.epTitle;
          if (EP.desc == undefined) {
              if (downloaded){
                document.getElementById("calendarModalBody").innerHTML = "<span class='badge badge-pill badge-success text-uppercase'>Downloaded</span><br><br><i>No Description</i>";
              }else{
                document.getElementById("calendarModalBody").innerHTML = "<span class='badge badge-pill badge-warning text-uppercase'>Missing</span><br><br><i>No Description</i>";
              }
          }else{
              if (downloaded){
                document.getElementById("calendarModalBody").innerHTML = "<span class='badge badge-pill badge-success text-uppercase'>Downloaded</span><br><br>" + EP.desc;
              }else{
                document.getElementById("calendarModalBody").innerHTML = "<span class='badge badge-pill badge-warning text-uppercase'>Missing</span><br><br>" + EP.desc;
              }
          }
          document.getElementById("EventPublicID").innerHTML = EV.publicId
          document.getElementById("EventSeriesID").innerHTML = EP.serId

          if (downloaded == false){
            document.getElementById("NotificationSubmit").style.display = "inline";
            document.getElementById("NotificationInput").style.display = "inline";
            document.getElementById("calendarModalFooter").style.visibility = "visible";
            document.getElementById("calendarModalHeader").setAttribute("style", "background-color: #fb6340;");
          }else{
            document.getElementById("NotificationSubmit").style.display = "none";
            document.getElementById("NotificationInput").style.display = "none";
            document.getElementById("calendarModalFooter").style.visibility = "hidden";
            document.getElementById("calendarModalHeader").setAttribute("style", "background-color: #2dce89;");
          }

          if (info.event._def.ui.backgroundColor == '#ffc812'){
            document.getElementById("calendarModalHeader").setAttribute("style", "background-color: #ffc812;");
          }else if (info.event._def.ui.backgroundColor == '#14abde'){
            document.getElementById("calendarModalHeader").setAttribute("style", "background-color: #14abde;");
          }

          document.getElementById("emailCheckbox").checked = false;
          document.getElementById("discordCheckbox").checked = false;
          document.getElementById("seriesNotificationsSwitch").checked = false;
        //   console.log(sonarrN, EP, EV);
          /*The following determines whether the UI should render the Series Notification toggle, Email checkbox, and Discord checkbox as toggled 
          based on whether there is a notification in the database assigned to this episode for the current user*/
          for (i = 0; i < sonarrN.length; i++) { //for each notification in the notifications
            if (sonarrN[i].Niid == EV.publicId){ //if the notificationID is equal to the episodeID
                if (sonarrN[i].Nuid == uid){ //if the notification userID is equal to the current user
                    if (sonarrN[i].Mode == 'discord'){ //if the notification mode is discord
                        document.getElementById("discordCheckbox").checked = true; //set discord notification checkbox to checked
                    }
                    if (sonarrN[i].Mode == 'email'){ //if the notification mode is email
                        document.getElementById("emailCheckbox").checked = true; //set email notification checkbox to checked
                    }
                }
            }else if (sonarrN[i].Niid == EP.serId) { //if the selected episodes notification ID is equal to the seriesID 
                if (sonarrN[i].Nuid == uid) { //if the notification userID is equal to the current user
                    document.getElementById("seriesNotificationsSwitch").checked = true; //set series notification toggle on 
                    if (sonarrN[i].Mode == 'discord'){ //if the notification mode is discord
                        if (sonarrN[i].blacklist != undefined){
                            if (sonarrN[i].blacklist.includes(EV.publicId) == false){ //if the notfications blacklist does not contain the episodeID
                                document.getElementById("discordCheckbox").checked = true; //set discord notification checkbox to checked
                            }
                        }else{
                            document.getElementById("discordCheckbox").checked = true; //set discord notification checkbox to checked
                        }
                    }
                    if (sonarrN[i].Mode == 'email'){ //if the notification mode is email
                        if (sonarrN[i].blacklist != undefined){
                            if (sonarrN[i].blacklist.includes(EV.publicId) == false){ //if the notfications blacklist does not contain the episodeID
                                document.getElementById("emailCheckbox").checked = true; //set email notification checkbox to checked
                            }
                        }else{
                            document.getElementById("emailCheckbox").checked = true; //set email notification checkbox to checked
                        }
                    }   
                }
            }
        }  

        if (hasDiscord == false) {
            document.getElementById("discordCheckbox").setAttribute("disabled", "");
            document.getElementById("discordCheckbox").checked = false;
            document.getElementById("discordCheckbox").style.cursor = "default";
            document.getElementById("discordCheckboxLabel").style.cursor = "default";
            document.getElementById("discordCheckboxLabel").style.color = "#cfcfcf";
        }

        discordValue = document.getElementById("discordCheckbox").checked
        emailValue = document.getElementById("emailCheckbox").checked
        seriesValue = document.getElementById("seriesNotificationsSwitch").checked

          $("#calendarModal").modal();
        },
        eventMouseEnter: function(info){
            var downloaded = false
            ser = false
            epi = false
            if (info.event._def.ui.backgroundColor == '#2dce89'){
                downloaded = true
            }else if (info.event._def.ui.backgroundColor == '#ffc812'){
                ser = true
            }else if (info.event._def.ui.backgroundColor == '#14abde'){
                epi = true
            }
            if (downloaded){
                info.el.style.color = '#2dce89'
            }else if (ser) {
                info.el.style.color = '#ffc812'
            }else if (epi) {
                info.el.style.color = '#14abde'
            }else{
                info.el.style.color = '#fb6340'
            }
            info.el.style.backgroundColor = 'white'
            info.el.style.borderColor = 'white'
            document.body.style.cursor = "pointer";
        },
        eventMouseLeave: function(info){
            var downloaded = false
            ser = false
            if (info.event._def.extendedProps.clr == '#2dce89'){
                downloaded = true
            }else if (info.event._def.extendedProps.clr == '#ffc812'){
                ser = true
            }else if (info.event._def.ui.backgroundColor == '#14abde'){
                epi = true
            }
            if (downloaded){
                info.el.style.backgroundColor = '#2dce89'
                info.el.style.borderColor = '#2dce89'
            }else if (ser){
                info.el.style.backgroundColor = '#ffc812'
                info.el.style.borderColor = '#ffc812'
            }else if (epi) {
                info.el.style.backgroundColor = '#14abde'
                info.el.style.borderColor = '#14abde'
            }else{
                info.el.style.backgroundColor = '#fb6340'
                info.el.style.borderColor = '#fb6340'
            }
            info.el.style.color = 'white'
            document.body.style.cursor = "default";
        },
        eventTextColor: "white",
        height: 750,
        handleWindowResize: true
    });

    cal_loading = document.getElementById("calendar_loading");
    if (cal_loading != null){
        cal_loading.remove();
    }
    calendar.render();
}

function re_renderCalendar(){
    //compile the events
    var i;
    var events = [];
    for (i = 0; i < raw_response.length; i++) {
        var id = raw_response[i].id;
        var seriesId = raw_response[i].seriesId;
        var showTitle = raw_response[i].series.title;
        var episodeTitle = raw_response[i].title;
        var startTime = raw_response[i].airDateUtc;
        // var endTime = new Date(startTime.getTime() + diff*60000);
        var downloaded = raw_response[i].hasFile;
        var description = raw_response[i].overview;
        var seasonNum = raw_response[i].seasonNumber;
        var episodeNum = raw_response[i].episodeNumber;
        var classN;
        var T = showTitle+ ' (' + seasonNum + 'x' + episodeNum + ')'
        var w;
        ser = false
        epi = false
        for (w = 0; w < sonarrN.length; w++) { //Loop through all the notifications
            if (sonarrN[w].Niid == seriesId) { //if the seriesID is equal to the notificationID
                if (sonarrN[w].Nuid == uid) { //if the notification userID is equal to the current User
                    ser = true
                }
            }
            if (sonarrN[w].Niid == id) { //if the seriesID is equal to the notificationID
                if (sonarrN[w].Nuid == uid) { //if the notification userID is equal to the current User
                    epi = true
                }
            }
        } 
        if (downloaded){
            classN = '#2dce89';
        }else if (ser){
            classN = '#ffc812';
        }else if (epi){
            classN = '#14abde';
        }else {
            classN = '#fb6340';
        }

        var temp = {
            id: id,
            title: T,
            start: startTime,
            color: classN,
            // end: endTime,
            extendedProps: {
                epTitle: episodeTitle,
                desc: description,
                sNum: seasonNum,
                eNum: episodeNum,
                clr: classN,
                serId: seriesId
            }
        }
        events.push(temp);
    } 
    //remove all event sources
    var eventSources = calendar.getEventSources();
    var len = eventSources.length;
    for (var i = 0; i < len; i++) { 
        eventSources[i].remove(); 
    } 
    //add the new compiled events
    calendar.addEventSource(events);

}

//gets the episodes from a 2 month range from Sonarr API
function getSonarrData(apikey, baseurl){
    var date = new Date();
    date.setDate(date.getDate() - 30);
    var startDate = date.toISOString().split('T')[0]; 
    date.setDate(date.getDate() + 60);
    var endDate = date.toISOString().split('T')[0]; 
    var url = baseurl + '/api/calendar?apikey=' + apikey + '&start=' + startDate + '&end=' + endDate;
    var events = [];
    var settings = {
        "url": url,
        "method": "GET",
        "timeout": 0,
      };
      
    $.ajax(settings).done(function (response) {
        // console.log(response, sonarrN)
        raw_response = response;
        var i;
        for (i = 0; i < response.length; i++) {
            var id = response[i].id;
            var seriesId = response[i].seriesId;
            var showTitle = response[i].series.title;
            var episodeTitle = response[i].title;
            var startTime = response[i].airDateUtc;
            // var endTime = new Date(startTime.getTime() + diff*60000);
            var downloaded = response[i].hasFile;
            var description = response[i].overview;
            var seasonNum = response[i].seasonNumber;
            var episodeNum = response[i].episodeNumber;
            var classN;
            var T = showTitle+ ' (' + seasonNum + 'x' + episodeNum + ')'
            var w;
            ser = false
            epi = false
            for (w = 0; w < sonarrN.length; w++) { //Loop through all the notifications
                if (sonarrN[w].Niid == seriesId) { //if the seriesID is equal to the notificationID
                    if (sonarrN[w].Nuid == uid) { //if the notification userID is equal to the current User
                        ser = true
                    }
                }
                if (sonarrN[w].Niid == id) { //if the seriesID is equal to the notificationID
                    if (sonarrN[w].Nuid == uid) { //if the notification userID is equal to the current User
                        epi = true
                    }
                }
            } 
            if (downloaded){
                classN = '#2dce89';
            }else if (ser){
                classN = '#ffc812';
            }else if (epi){
                classN = '#14abde';
            }else {
                classN = '#fb6340';
            }

            var temp = {
                id: id,
                title: T,
                start: startTime,
                color: classN,
                // end: endTime,
                extendedProps: {
                    epTitle: episodeTitle,
                    desc: description,
                    sNum: seasonNum,
                    eNum: episodeNum,
                    clr: classN,
                    serId: seriesId
                }
            }
            events.push(temp);
        } 
        renderCalendar(events);
    });
}

//gets the sonarr credentials from the database along with the current list of monitored episodes for notifications
function scalmain(cid) {
    gcid = cid;
    var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    var url = `/home/calendar/${cid}/`;
    var settings = {
        "url": url,
        "method": "POST",
        "headers": {
        "X-CSRFToken": $csrf_token,
        },
        "data": {
          'credentials': 'true',
      }
    }
        
    $.ajax(settings).done(function (response) {
      var cred = JSON.parse(response);
      apikey = cred.apikey;
      baseurl = cred.Link;
      sonarrN = cred.sonarrN;
      uid = cred.Uid;
      hasDiscord = cred.hasDiscord;
      isMobile = cred.isMobile;
      getSonarrData(apikey, baseurl);
    });
}