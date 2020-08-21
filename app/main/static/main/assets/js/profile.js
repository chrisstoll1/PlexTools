function setPasswordResetStyles(){
    oldpass = document.getElementById("id_old_password");
    oldpassGroup = document.getElementById("div_id_old_password");
    oldpassLabel = oldpassGroup.firstElementChild;
    
    oldpassGroup.setAttribute("class", "form-group row align-items-center");
    oldpassLabel.setAttribute("class", "col-3");
    oldpassLabel.innerHTML = 'Current Password';
    oldpass.parentElement.setAttribute("class", "col");
    oldpass.setAttribute("placeholder", "Enter your current password");

    newpass1 = document.getElementById("id_new_password1");
    newpassGroup1 = document.getElementById("div_id_new_password1");
    newpassLabel1 = newpassGroup1.firstElementChild;
    
    newpassGroup1.setAttribute("class", "form-group row align-items-center");
    newpassLabel1.setAttribute("class", "col-3");
    newpassLabel1.innerHTML = 'New Password';
    newpass1.parentElement.setAttribute("class", "col");
    newpass1.setAttribute("placeholder", "Enter a new password");
    document.getElementById("hint_id_new_password1").remove();

    newpass2 = document.getElementById("id_new_password2");
    newpassGroup2 = document.getElementById("div_id_new_password2");
    newpassLabel2 = newpassGroup2.firstElementChild;
    
    newpassGroup2.setAttribute("class", "form-group row align-items-center");
    newpassLabel2.setAttribute("class", "col-3");
    newpassLabel2.innerHTML = 'Confirm Password';
    newpass2.parentElement.setAttribute("class", "col");
    newpass2.setAttribute("placeholder", "Confirm your new password");
}

function loadNotifications(){
    episodeNList = document.getElementById('episodeNotifications');
    seriesNList = document.getElementById('seriesNotifications');
    var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    var settings = {
        "url": "/profile/",
        "method": "POST",
        "headers": {
        "X-CSRFToken": $csrf_token,
        },
        "data": {
            'GETnotifications': 'true'
        }
    }
    $.ajax(settings).done(function (response) {
        episodes = [];
        series = [];
        for (let i = 0; i < response.notifications.length; i++) { //loop through the users notifications
            //assign notifications values to variables
            notificationID = response.notifications[i].notificationID;
            calendarID = response.notifications[i].calendarID;
            if (response.notifications[i].blacklist == null){
                blacklist = ""
            }else{
                blacklist = response.notifications[i].blacklist;
            }   
            mode = response.notifications[i].mode;
            for (let c = 0; c < response.calendars.length; c++) { //loop through the calendars
                //assign calendar values to variables
                if (response.calendars[c].calID == calendarID){
                    calTitle = response.calendars[c].title;
                    calData = response.calendars[c].data;
                }
            }
            for (let d = 0; d < calData.length; d++) { //loop through the data for the calendar
                //assign data values to variable
                hasFile = calData[d].hasFile;
                id = calData[d].id;
                seriesId = calData[d].seriesId;
                seriesT = calData[d].series.title;
                episodeT = calData[d].title;
                seasonN = calData[d].seasonNumber;
                episodeN = calData[d].episodeNumber;
                airdate = calData[d].airDate;

                if (hasFile == false) { //if the episode is NOT downloaded
                    if (notificationID == id){ //episode notification
                        //determine value of email and discord
                        emailM = false;
                        discordM = false;
                        if (mode == 'email'){
                            emailM = true;
                        }
                        if (mode == 'discord'){
                            discordM = true;
                        }
                        query = episodes.filter(episode => episode.notificationID == notificationID && episode.calendarID == calendarID); // get any episodes with a matching ID 
                        if (query.length > 0){ // if an episode already exists
                            query.forEach(notification => { //loop through the existing episode
                                if (notification.discord){  //if that episode is mode discord set discordM to true
                                    discordM = true;
                                }
                                if (notification.email){ //if that episode is mode email set emailM to true
                                    emailM = true;
                                }
                            });
                            for (let index = 0; index < episodes.length; index++) { //loop through the episodes 
                                if (episodes[index].notificationID == notificationID && episodes[index].calendarID == calendarID){ //if its the duplicate  
                                    episodes.splice(index, 1); //delete the episode
                                }                                
                            }
                        }
                        //add episode to array 
                        episodes.push({
                            'notificationID': notificationID,
                            'calendarID': calendarID,
                            'blacklist': blacklist,
                            'email': emailM,
                            'discord': discordM,
                            'calTitle': calTitle,
                            'seriesT': seriesT,
                            'episodeT': episodeT,
                            'seasonN': seasonN,
                            'episodeN': episodeN,
                            'airdate': airdate,
                            'seriesId': seriesId,
                            'episodeId': id
                        })
                    }else if (notificationID == seriesId){ //series notification
                        emailM = false;
                        discordM = false;
                        if (mode == 'email'){
                            emailM = true;
                        }
                        if (mode == 'discord'){
                            discordM = true;
                        }
                        query = series.filter(ser => ser.notificationID == notificationID && ser.calendarID == calendarID);
                        if (query.length > 0){
                            for (let index = 0; index < series.length; index++) {
                                if (series[index].notificationID == notificationID && series[index].calendarID == calendarID){
                                    if (emailM){
                                        series[index].email = true;
                                    }
                                    if (discordM){
                                        series[index].discord = true;
                                    }
                                    if (series[index].episodes.filter(x => x.episodeID == id).length == 0 && blacklist.includes(id) == false){
                                        series[index].episodes.push({
                                            'episodeID': id,
                                            'episodeT': episodeT,
                                            'seasonN': seasonN,
                                            'episodeN': episodeN,
                                            'airdate': airdate
                                        });
                                    }
                                }
                            }
                        }else if (blacklist.includes(id) == false){
                            series.push({
                                'notificationID': notificationID,
                                'calendarID': calendarID,
                                'blacklist': blacklist,
                                'email': emailM,
                                'discord': discordM,
                                'calTitle': calTitle,
                                'seriesT': seriesT,
                                'seriesId': seriesId,
                                'episodes': [{
                                    'episodeID': id,
                                    'episodeT': episodeT,
                                    'seasonN': seasonN,
                                    'episodeN': episodeN,
                                    'airdate': airdate
                                }]
                            })
                        }else{
                            series.push({
                                'notificationID': notificationID,
                                'calendarID': calendarID,
                                'blacklist': blacklist,
                                'email': emailM,
                                'discord': discordM,
                                'calTitle': calTitle,
                                'seriesT': seriesT,
                                'seriesId': seriesId,
                                'episodes': []
                            })
                        }
                    }
                }
            }
        }
        episodes.forEach(episode => { //for each episode notification - generate html 
            li = document.createElement("li");
            li.setAttribute("class", "list-group-item");
            li.setAttribute("id", `E_${episode.notificationID}`);
            if (episode.email && episode.discord){
                badges = `<span class="badge badge-primary">Discord</span> <span class="badge badge-primary">Email</span>`;
            }else if (episode.email){
                badges = `<span class="badge badge-primary">Email</span>`;
            }else if (episode.discord){
                badges = `<span class="badge badge-primary">Discord</span>`;
            }
            episodeInfo = `${episode.seriesT} (${episode.seasonN}x${episode.episodeN}) - ${episode.episodeT} | ${episode.airdate}`;
            li.innerHTML = `<div class="row pb-1">
                                <div class="col-6">
                                <span class="badge badge-secondary">${episode.calTitle}</span> ${badges}
                                </div>
                                <div class="col-5"></div>
                                <div class="col-1">
                                <div class="dropdown">
                                    <button class="btn-options float-right" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <i class="material-icons">more_vert</i>
                                    </button>
                                    <div class="dropdown-menu">
                                    <a class="dropdown-item text-danger" href="#" onclick="DeleteEpisodeNotification('${episode.episodeId}', '${episode.seriesId}', '${episode.notificationID}', '${episode.calendarID}', 'episode')">Delete</a>
                                    </div>
                                </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-11">
                                ${episodeInfo}
                                </div>
                                <div class="col-1"></div>
                            </div>`
            episodeNList.appendChild(li)
        });
        series.forEach(serie => {
            li = document.createElement("li");
            li.setAttribute("class", "list-group-item");
            li.setAttribute("id", `S_${serie.notificationID}_${serie.calendarID}`);
            if (serie.email && serie.discord){
                badges = `<span class="badge badge-warning">Discord</span> <span class="badge badge-warning">Email</span>`;
            }else if (serie.email){
                badges = `<span class="badge badge-warning">Email</span>`;
            }else if (serie.discord){
                badges = `<span class="badge badge-warning">Discord</span>`;
            }
            seriesInfo = `${serie.seriesT}`;
            seid = `SE_${serie.notificationID}_${serie.calendarID}`;
            scid = `SC_${serie.notificationID}_${serie.calendarID}`;
            snid = `SN_${serie.notificationID}_${serie.calendarID}`;
            li.innerHTML = `<div class="row pb-1">
            <div class="col-6">
              <span class="badge badge-secondary">${serie.calTitle}</span> ${badges} 
            </div>
            <div class="col-5"></div>
            <div class="col-1">
              <div class="dropdown">
                <button class="btn-options float-right" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i class="material-icons">more_vert</i>
                </button>
                <div class="dropdown-menu">
                  <a class="dropdown-item text-danger" href="#" onclick="DeleteEpisodeNotification('', '${serie.seriesId}', '${serie.notificationID}', '${serie.calendarID}', 'series')">Delete</a>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-11">
              ${seriesInfo}
            </div>
            <div class="col-1"></div>
          </div>
          <div class="row">
            <div class="collapse col-12" id="${scid}">
                <p id="${snid}" class="text-center" style="display: none;">Nothing to see here!</p>
                <ul class="list-group" id="${seid}">


                </ul>
            </div>
          </div>
          <div class="row">
            <div class="text-center col-12">
              <a class=" text-muted" data-toggle="collapse" href="#${scid}" role="button" aria-expanded="false" aria-controls="collapseExample">
                <i class="material-icons">expand_more</i>
              </a>
            </div>
          </div>`;
            seriesNList.appendChild(li);
            seriesEList = document.getElementById(seid);
            serie.episodes.forEach(episode => {
                li = document.createElement("li");
                seliid = `SEIID_${serie.notificationID}_${serie.calendarID}_${episode.episodeID}`;
                li.setAttribute("id", seliid);
                li.setAttribute("class", "list-group-item");
                episodeInfo = `(${episode.seasonN}x${episode.episodeN}) - ${episode.episodeT} | ${episode.airdate}`;
                li.innerHTML = `<div class="row">
                                <div class="col-11">
                                ${episodeInfo}
                                </div>
                                <div class="col-1">
                                <a class="text-danger" href="#" onclick="DeleteEpisodeNotification('${episode.episodeID}', '${serie.seriesId}', '${serie.notificationID}', '${serie.calendarID}', 'series_episode')">
                                    <i class="material-icons">close</i>
                                </a>
                                </div>
                            </div>`;
                seriesEList.appendChild(li);
            });
            if (seriesEList.childNodes.length == 1){
                document.getElementById(snid).style.display = "block"
            }
        });

        document.getElementById("notification_loadingE").style.display = "none";
        document.getElementById("notification_loadingS").style.display = "none";
        document.getElementById("notification_loadingEs").style.display = "none";
        document.getElementById('notification_loadingSs').style.display = "none";    
        if (episodeNList.childNodes.length == 1){
            document.getElementById("Enothing").style.display = "block";
        }
        if (seriesNList.childNodes.length == 1){
            document.getElementById("Snothing").style.display = "block";
        }
    });  
}

function DeleteEpisodeNotification(id, seriesId, Niid, Ciid, list){
    episodeNList = document.getElementById('episodeNotifications');
    seriesNList = document.getElementById('seriesNotifications');
    var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    var settings = {
        "url": `/profile/`,
        "method": "POST",
        "headers": {
        "X-CSRFToken": $csrf_token,
        },
        "data": {
        'deletenotification': 'true',
        'id': id,
        'seriesId': seriesId,
        'Niid': Niid,
        'Ciid': Ciid,
        'list': list
        }
    }
        
    $.ajax(settings).done(function (response) {
        if (response == 200){
            try{
                if (list == 'episode'){
                    document.getElementById(`E_${Niid}`).remove();
                }else if (list == 'series'){
                    document.getElementById(`S_${Niid}_${Ciid}`).remove();
                }else if (list == 'series_episode'){
                    document.getElementById(`SEIID_${Niid}_${Ciid}_${id}`).remove();
                }
            }catch (error){
                console.error(error);
            }

            if (episodeNList.childNodes.length == 1){
                document.getElementById("Enothing").style.display = "block";
            }
            if (seriesNList.childNodes.length == 1){
                document.getElementById("Snothing").style.display = "block";
            }
            try {
                snid = `SN_${Niid}_${Ciid}`;
                seid = `SE_${Niid}_${Ciid}`;
                seriesEList = document.getElementById(seid);
                if (seriesEList.childNodes.length == 1){
                    document.getElementById(snid).style.display = "block"
                }
            } catch (error) {
                //do nothing
            }
        }
    });
}
