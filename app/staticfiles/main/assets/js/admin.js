
function updateCheckboxes(){
    var x = document.getElementsByName("checkeme")
    for (var i = 0; i < x.length; ++i) {
      var item = x[i];  
      item.checked = true;
    }
    var x = document.getElementsByName("uncheckeme")
    for (var i = 0; i < x.length; ++i) {
      var item = x[i];  
      item.checked = false;
    }
}
function POSTemailCredentials(){
    USE_TLS = document.getElementById('use_tls');
    E_HOST = document.getElementById('email_host');
    E_PORT = document.getElementById('email_port');
    E_USERNAME = document.getElementById('email_username');
    E_PASS = document.getElementById('email_password');
    if ((E_HOST.value != "" || null) && (E_PORT.value != "" || null) && (E_USERNAME.value != "" || null) && (E_PASS.value != "" || null)){
        var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
        var settings = {
            "url": "/home/admin/",
            "method": "POST",
            "headers": {
            "X-CSRFToken": $csrf_token,
            },
            "data": {
                'POSTserverEmail': 'true',
                'USE_TLS': USE_TLS.checked,
                'E_HOST': E_HOST.value,
                'E_PORT': E_PORT.value,
                'E_USERNAME': E_USERNAME.value,
                'E_PASS': E_PASS.value
            }
        }
            
        $.ajax(settings).done(function (response) {
            USE_TLS.checked = response.USE_TLS
            E_HOST.value = response.E_HOST
            E_PORT.value = response.E_PORT
            E_USERNAME.value = response.E_USERNAME
            E_PASS.value = response.E_PASS
            document.getElementById('ESS_Save').innerHTML = 'Update';
            document.getElementById('ESS_Delete').style.visibility = 'visible';
        });   
    }

    // console.log(USE_TLS.value, E_HOST.value, E_PORT.value, E_USERNAME.value, E_PASS.value)
}
function DELETEemailCredentials(){
    USE_TLS = document.getElementById('use_tls');
    E_HOST = document.getElementById('email_host');
    E_PORT = document.getElementById('email_port');
    E_USERNAME = document.getElementById('email_username');
    E_PASS = document.getElementById('email_password');
    var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    var settings = {
        "url": "/home/admin/",
        "method": "POST",
        "headers": {
        "X-CSRFToken": $csrf_token,
        },
        "data": {
            'DELETEserverEmail': 'true'
        }
    }
        
    $.ajax(settings).done(function (response) {
        document.getElementById('ESS_Delete').style.visibility = 'hidden';
        document.getElementById('ESS_Save').innerHTML = 'Save';
        USE_TLS.value = null;
        E_HOST.value = null;
        E_PORT.value = null;
        E_USERNAME.value = null;
        E_PASS.value = null;
    });   
}
function GETRedirects(){
    //Update the Home Redirect drop down list
    var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    var settings = {
        "url": "/home/admin/",
        "method": "POST",
        "headers": {
        "X-CSRFToken": $csrf_token,
        },
        "data": {
            'rebuildNav': 'true'
        }
    }
        
    $.ajax(settings).done(function (response) {
        redirectDropdown = document.getElementById('home_redirect_select');
        //clear the redirect drop down
        redirectDropdown.innerHTML = "";
        //create empty redirect option
        option = document.createElement("option");
        if (response.redirect == false){
            option.setAttribute("selected", "");
        }
        redirectDropdown.appendChild(option);
        //loop through calendars
        var c;
        for (c = 0; c < response.calendars.length; c++) {
            option = document.createElement("option");
            option.setAttribute("title", "calendar");
            option.setAttribute("value", response.calendars[c].id);
            if (response.calendars[c].id == response.redirect.id && response.redirect.type == "C"){
                option.setAttribute("selected", "");
            }
            option.innerHTML = response.calendars[c].title;
            redirectDropdown.appendChild(option);
        } 
        //loop through requests
        var r;
        for (r = 0; r < response.requests.length; r++) {
            option = document.createElement("option");
            option.setAttribute("title", "request");
            option.setAttribute("value", response.requests[r].id);
            if (response.requests[r].id == response.redirect.id && response.redirect.type == "R"){
                option.setAttribute("selected", "");
            }
            option.innerHTML = response.requests[r].title;
            redirectDropdown.appendChild(option);
        } 
    });  
}
function UpdateSiteSettings(){
    title = document.getElementById('site_title');
    redirectS = document.getElementById('home_redirect_select');
    redirect = redirectS.options[redirectS.selectedIndex]
    if (title.value == '' || null){
        title.value = 'Plex Tools'
    }
    var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    var settings = {
        "url": "/home/admin/",
        "method": "POST",
        "headers": {
        "X-CSRFToken": $csrf_token,
        },
        "data": {
            'UpdateSiteSettings': 'true',
            'title': title.value,
            'redirect_class': redirect.title,
            'redirect': redirect.value
        }
    }
        
    $.ajax(settings).done(function (response) {
        document.getElementById('b_site_title').innerHTML = response.title;
        // GETRedirects();
    });  
}

//calendar Functions
function openAddCalendar(){
    //get input
    var title = document.getElementById("calendarTitle");
    var description = document.getElementById("calendarDescription");
    var sonarrName = document.getElementById("sonarrName");
    var sonarrBasePath = document.getElementById("sonarrLink");
    var sonarrApiKey = document.getElementById("sonarrApi");

    //clear any existing input
    title.value = ''; 
    description.value = '';
    sonarrName.value = '';
    sonarrBasePath.value = '';
    sonarrApiKey.value = '';

    //clear any existing errors
    if (sonarrName.classList.contains("is-invalid")) {
        sonarrName.classList.remove("is-invalid");
    }
    if (sonarrBasePath.classList.contains("is-invalid")) {
        sonarrBasePath.classList.remove("is-invalid");
    }
    if (sonarrApiKey.classList.contains("is-invalid")) {
        sonarrApiKey.classList.remove("is-invalid");
    }
    if (sonarrName.classList.contains("is-valid")) {
        sonarrName.classList.remove("is-valid");
    }
    if (sonarrBasePath.classList.contains("is-valid")) {
        sonarrBasePath.classList.remove("is-valid");
    }
    if (sonarrApiKey.classList.contains("is-valid")) {
        sonarrApiKey.classList.remove("is-valid");
    }

    document.getElementById("sonarrTestingMessage").style.visibility = "hidden";
    document.getElementById("calendarModalTitle").innerHTML = 'Add Calendar Module';
    var submit = document.getElementById("calendarModalSubmit");
    submit.setAttribute("onclick", "addCalendar()")
    submit.innerHTML = "Test Connection";
    //open modal
    $('#addCalendarModule').modal('show')
}
function generateCalendarHTML(module) {
    document.getElementById("calendarTitle").value = module.title;
    document.getElementById("calendarDescription").value = module.description;
    if (module.status){
        var toggleclass = 'checkeme';
    }else{
        var toggleclass = 'uncheckeme'
    }
    var noCalT = document.getElementById("noCalendarsText"); 
    if(typeof(noCalT) != 'undefined' && noCalT != null){
        noCalT.parentNode.removeChild(noCalT);
    }
    var task = document.createElement("div");
    task.setAttribute("id", module.id);
    task.setAttribute("class", "card card-task");
    task.setAttribute("name", "calendar-card");
    task.innerHTML = `
    <div class="progress">
    <div class="progress-bar" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
  </div>
  <div class="card-body">
    <div class="card-title">
      <a href="/home/calendar/${module.id}"><h6>${module.title}</h6></a>
      <span class="text-small">${module.description}</span>
    </div>
    <div class="card-meta">

        <div class="d-flex align-items-center">
            <label class="switch">
                <input id="enableToggle_${module.id}" name="${toggleclass}" type="checkbox" onchange="CalendarToggleEnabled(${module.id})">
                <span class="slider round"></span>
            </label>    
        </div>

      <div class="dropdown card-options">
        <button class="btn-options" type="button" id="task-dropdown-button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <i class="material-icons">more_vert</i>
        </button>
        <div class="dropdown-menu dropdown-menu-right">
        <a class="dropdown-item text-primary" style="cursor: pointer;" onclick="CalendarSettings(${module.id})">Settings</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item text-danger" style="cursor: pointer;" onclick="CalendarDelete(${module.id})">Delete</a>
        </div>
      </div>
    </div>
  </div>
    `
    document.getElementById("calendarModuleList").appendChild(task);
    updateCheckboxes();
    rebuildNav();
    GETRedirects();
}
function createCalendarModule(title, description, sonarrName, sonarrBasePath, sonarrApiKey) {
    var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    var settings = {
        "url": "/home/admin/",
        "method": "POST",
        "headers": {
        "X-CSRFToken": $csrf_token,
        },
        "data": {
          'title': title,
          'description': description,
          'sonarrName': sonarrName,
          'sonarrBasePath': sonarrBasePath,
          "sonarrApiKey": sonarrApiKey,
          'calendarCreate': 'true'
      }
    }
        
    $.ajax(settings).done(function (response) {
        if (response == 6) {
            document.getElementById("sonarrTestingMessageText").innerHTML = "An error occured while creating the module";
        }else if (response == 7) {
            document.getElementById("sonarrTestingMessageText").innerHTML = "An error occured while retrieving the module from the database";
        }else {
            document.getElementById("sonarrTestingMessageText").innerHTML = "Module Created Successfully!";
            document.getElementById("calendarModalTitle").innerHTML = 'Edit Calendar Module';
            var submit = document.getElementById("calendarModalSubmit");
            calsave = `CalendarSave(${response.id}, '${response.title}', '${response.description}', '${response.status}', '${response.sonarrName}', '${response.sonarrLink}', '${response.sonarrApiKey}')`;
            submit.setAttribute("onclick", calsave);
            submit.innerHTML = "Save";
            generateCalendarHTML(response);
        }
    });
}
function addCalendar(){
    //get input
    var title = document.getElementById("calendarTitle");
    var description = document.getElementById("calendarDescription");
    var sonarrName = document.getElementById("sonarrName");
    var sonarrBasePath = document.getElementById("sonarrLink");
    var sonarrApiKey = document.getElementById("sonarrApi");
    var submit = document.getElementById("calendarModalSubmit");

    //clear any existing errors
    if (sonarrName.classList.contains("is-invalid")) {
        sonarrName.classList.remove("is-invalid");
    }
    if (sonarrBasePath.classList.contains("is-invalid")) {
        sonarrBasePath.classList.remove("is-invalid");
    }
    if (sonarrApiKey.classList.contains("is-invalid")) {
        sonarrApiKey.classList.remove("is-invalid");
    }
    if (sonarrName.classList.contains("is-valid")) {
        sonarrName.classList.remove("is-valid");
    }
    if (sonarrBasePath.classList.contains("is-valid")) {
        sonarrBasePath.classList.remove("is-valid");
    }
    if (sonarrApiKey.classList.contains("is-valid")) {
        sonarrApiKey.classList.remove("is-valid");
    }

    //check for errors
    var error = false;
    if (sonarrName.value == '' || sonarrName.value == undefined) {
        error = true;
        sonarrName.classList.add("is-invalid");
    }else{
        sonarrName.classList.add("is-valid");
    }
    if (sonarrBasePath.value == '' || sonarrBasePath.value == undefined) {
        error = true;
        sonarrBasePath.classList.add("is-invalid");
    }else{
        sonarrBasePath.classList.add("is-valid");
    }
    if (sonarrApiKey.value == '' || sonarrApiKey.value == undefined) {
        error = true
        sonarrApiKey.classList.add("is-invalid");
    }else{
        sonarrApiKey.classList.add("is-valid");
    }

    //dont submit till errors are gone
    if (error) {
        console.log('error')
    }else{
        document.getElementById("sonarrTestingMessageText").innerHTML = "Testing Connection To Sonarr";
        submit.innerHTML = `Connecting <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> `;
        document.getElementById("sonarrTestingMessage").style.visibility = "visible";
        sonarrTimeout = setTimeout(function(){ 
            submit.innerHTML = 'Test Connection';
            document.getElementById("sonarrTestingMessageText").innerHTML = "Connection Failed!";
            sonarrApiKey.classList.add("is-invalid");
            sonarrBasePath.classList.add("is-invalid");
         }, 5000);
        var url = sonarrBasePath.value + '/api/system/status?apikey=' + sonarrApiKey.value;
        var settings = {
            "url": url,
            "method": "GET",
            "timeout": 0,
          };
          
        $.ajax(settings).done(function (response) {
            clearTimeout(sonarrTimeout);
            document.getElementById("sonarrTestingMessageText").innerHTML = "Connected!";
            submit.innerHTML = 'Save';

            createCalendarModule(title.value, description.value, sonarrName.value, sonarrBasePath.value, sonarrApiKey.value);
        });
    }

}
function CalendarToggleEnabled(id){
    var elementid = "enableToggle_" + id.toString();
    var toggleSwitch = document.getElementById(elementid);
    var toggled = toggleSwitch.checked;

    var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    var settings = {
        "url": "/home/admin/",
        "method": "POST",
        "headers": {
        "X-CSRFToken": $csrf_token,
        },
        "data": {
          'id': id,
          'toggled': toggled,
          'calendarToggle': 'true'
      }
    }
        
    $.ajax(settings).done(function (response) {
        if (response == 200){
            if (toggled){
               toggleSwitch.setAttribute("name", "checkeme"); 
            }else{
                toggleSwitch.setAttribute("name", "uncheckeme");
            }
        }else{
            if (toggled){
                toggleSwitch.setAttribute("name", "uncheckeme"); 
            }else{
                toggleSwitch.setAttribute("name", "checkeme");
            }
        }
        updateCheckboxes();
    });
}
function CalendarSettings(id){
    var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    var settings = {
        "url": "/home/admin/",
        "method": "POST",
        "headers": {
        "X-CSRFToken": $csrf_token,
        },
        "data": {
          'id': id,
          'calendarGet': 'true'
      }
    }
        
    $.ajax(settings).done(function (response) {
        var title = document.getElementById("calendarTitle");
        var description = document.getElementById("calendarDescription");
        var sonarrName = document.getElementById("sonarrName");
        var sonarrBasePath = document.getElementById("sonarrLink");
        var sonarrApiKey = document.getElementById("sonarrApi");
    
        title.value = response.title;
        description.value = response.description;
        sonarrName.value = response.sonarrName;
        sonarrBasePath.value = response.sonarrLink;
        sonarrApiKey.value = response.sonarrApiKey;

        if (sonarrName.classList.contains("is-invalid")) {
            sonarrName.classList.remove("is-invalid");
        }
        if (sonarrBasePath.classList.contains("is-invalid")) {
            sonarrBasePath.classList.remove("is-invalid");
        }
        if (sonarrApiKey.classList.contains("is-invalid")) {
            sonarrApiKey.classList.remove("is-invalid");
        }
        if (sonarrName.classList.contains("is-valid")) {
            sonarrName.classList.remove("is-valid");
        }
        if (sonarrBasePath.classList.contains("is-valid")) {
            sonarrBasePath.classList.remove("is-valid");
        }
        if (sonarrApiKey.classList.contains("is-valid")) {
            sonarrApiKey.classList.remove("is-valid");
        }

        document.getElementById("sonarrTestingMessage").style.visibility = "hidden";
        document.getElementById("calendarModalTitle").innerHTML = 'Edit Calendar Module';
        var submit = document.getElementById("calendarModalSubmit");
        calsave = `CalendarSave(${response.id}, '${response.title}', '${response.description}', '${response.status}', '${response.sonarrName}', '${response.sonarrLink}', '${response.sonarrApiKey}')`;
        submit.setAttribute("onclick", calsave);
        submit.innerHTML = "Save";
        //open modal
        $('#addCalendarModule').modal('show')
    });
}
function CalendarSave(mid, mtitle, mdescription, mstatus, msonarrName, msonarrLink, msonarrApiKey){
    var title = document.getElementById("calendarTitle");
    var description = document.getElementById("calendarDescription");
    var sonarrName = document.getElementById("sonarrName");
    var sonarrBasePath = document.getElementById("sonarrLink");
    var sonarrApiKey = document.getElementById("sonarrApi");
    var submit = document.getElementById("calendarModalSubmit");

    //clear any existing errors
    if (sonarrName.classList.contains("is-invalid")) {
        sonarrName.classList.remove("is-invalid");
    }
    if (sonarrBasePath.classList.contains("is-invalid")) {
        sonarrBasePath.classList.remove("is-invalid");
    }
    if (sonarrApiKey.classList.contains("is-invalid")) {
        sonarrApiKey.classList.remove("is-invalid");
    }
    if (sonarrName.classList.contains("is-valid")) {
        sonarrName.classList.remove("is-valid");
    }
    if (sonarrBasePath.classList.contains("is-valid")) {
        sonarrBasePath.classList.remove("is-valid");
    }
    if (sonarrApiKey.classList.contains("is-valid")) {
        sonarrApiKey.classList.remove("is-valid");
    }

    //check for errors
    var error = false;
    if (sonarrName.value == '' || sonarrName.value == undefined) {
        error = true;
        sonarrName.classList.add("is-invalid");
    }else{
        sonarrName.classList.add("is-valid");
    }
    if (sonarrBasePath.value == '' || sonarrBasePath.value == undefined) {
        error = true;
        sonarrBasePath.classList.add("is-invalid");
    }else{
        sonarrBasePath.classList.add("is-valid");
    }
    if (sonarrApiKey.value == '' || sonarrApiKey.value == undefined) {
        error = true
        sonarrApiKey.classList.add("is-invalid");
    }else{
        sonarrApiKey.classList.add("is-valid");
    }

    if (title.value != mtitle || description.value != mdescription || sonarrName.value != msonarrName || sonarrBasePath.value != msonarrLink || sonarrApiKey.value != msonarrApiKey){
        //dont submit till errors are gone
        if (error) {
            console.log('error')
        }else{

            document.getElementById("sonarrTestingMessageText").innerHTML = "Testing Connection To Sonarr";
            submit.innerHTML = `Connecting <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> `;
            document.getElementById("sonarrTestingMessage").style.visibility = "visible";
            sonarrTimeout = setTimeout(function(){ 
                submit.innerHTML = 'Save';
                document.getElementById("sonarrTestingMessageText").innerHTML = "Connection Failed!";
                sonarrApiKey.classList.add("is-invalid");
                sonarrBasePath.classList.add("is-invalid");
            }, 5000);
            var url = sonarrBasePath.value + '/api/system/status?apikey=' + sonarrApiKey.value;
            var settings = {
                "url": url,
                "method": "GET",
                "timeout": 0,
            };
            
            $.ajax(settings).done(function (response) {
                clearTimeout(sonarrTimeout);
                document.getElementById("sonarrTestingMessageText").innerHTML = "Connected!";
                submit.innerHTML = 'Saving <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ';
                var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
                var settings = {
                    "url": "/home/admin/",
                    "method": "POST",
                    "headers": {
                    "X-CSRFToken": $csrf_token,
                    },
                    "data": {
                      'id':mid,
                      'title': title.value,
                      'description': description.value,
                      'sonarrName': sonarrName.value,
                      'sonarrBasePath': sonarrBasePath.value,
                      "sonarrApiKey": sonarrApiKey.value,
                      'calendarUpdate': 'true'
                  }
                }
                    
                $.ajax(settings).done(function (response) {
                    if (response == 8){
                        submit.innerHTML = 'Save';
                        document.getElementById("sonarrTestingMessageText").innerHTML = "Cannot Find Module in Database! Please Refresh the page";
                    }else if (response == 9){
                        submit.innerHTML = 'Save';
                        document.getElementById("sonarrTestingMessageText").innerHTML = "Cannot Update Module in Database! Please Refresh the page";
                    }else{
                        calsave = `CalendarSave(${response.id}, '${response.title}', '${response.description}', '${response.status}', '${response.sonarrName}', '${response.sonarrLink}', '${response.sonarrApiKey}')`;
                        submit.setAttribute("onclick", calsave);
                        submit.innerHTML = 'Save';
                        document.getElementById("sonarrTestingMessageText").innerHTML = "Updated!";
                        var element = document.getElementById(mid);
                        element.parentNode.removeChild(element);
                        var navid = 'nav_' + mid;
                        var navelement = document.getElementById(navid);
                        navelement.parentNode.removeChild(navelement);
                        generateCalendarHTML(response);
                    }
                });
            });
        }
    }else{
        document.getElementById("sonarrTestingMessageText").innerHTML = "Nothing to Save!";
    }

}
function CalendarDelete(mid){
    var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    var settings = {
        "url": "/home/admin/",
        "method": "POST",
        "headers": {
        "X-CSRFToken": $csrf_token,
        },
        "data": {
          'id':mid,
          'calendarDelete': 'true'
      }
    }
        
    $.ajax(settings).done(function (response) {
        if (response == 8){
            console.log("Cannot Get Module From Database");
        }else if (response == 9){
            console.log("Cannot Delete Module From Database")
        }else if (response == 200){
            var element = document.getElementById(mid);
            element.parentNode.removeChild(element);
            if (document.getElementsByName("calendar-card").length == 0){
                var noCalendarsText = document.createElement("h6");
                noCalendarsText.setAttribute("id", 'noCalendarsText');
                noCalendarsText.setAttribute("class", "text-muted text-center");
                noCalendarsText.innerHTML = `No Calendar Modules Yet!`
                document.getElementById("calendarModuleList").appendChild(noCalendarsText);
            }
            rebuildNav();
            GETRedirects();
        }
    });
}
function UpdateCModulesName(){
    CModuleName = document.getElementById('CModuleName');
    CModuleNameText = document.getElementById('CModuleNameText');
    CModulesNameInput = document.getElementById('CModulesNameInput');
    CMnameI = document.getElementById('CMnameInput');
    if (CMnameI.value == '' || CMnameI.value == null){
        CMnameI.value = "Calendar Modules";
    }
    var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    var settings = {
        "url": "/home/admin/",
        "method": "POST",
        "headers": {
        "X-CSRFToken": $csrf_token,
        },
        "data": {
            'UpdateModuleName': 'true',
            'ModuleType': 'Calendar',
            'ModuleName': CMnameI.value
        }
    }
        
    $.ajax(settings).done(function (response) {
        CMnameI.value = response.Name;
        CModuleNameText.innerHTML = response.Name;
        CModuleName.style.display = 'inline';
        CModulesNameInput.style.visibility = 'hidden';
        rebuildNav();
        GETRedirects();
    });
}
function EditCalendarName(){
    CModuleName = document.getElementById('CModuleName');
    CModuleNameText = document.getElementById('CModuleNameText');
    CModulesNameInput = document.getElementById('CModulesNameInput');
    CModuleName.style.display = 'none';
    CModulesNameInput.style.visibility = 'visible';
    document.getElementById('CMnameInput').focus();
}

//request Functions
function openAddRequest(){
    //get input
    var title = document.getElementById("requestTitle");
    var description = document.getElementById("requestDescription");
    var ombiName = document.getElementById("ombiName");
    var ombiBasePath = document.getElementById("ombiLink");
    var ombiApiKey = document.getElementById("ombiApi");
    var tv_toggle = document.getElementById("tv_toggle");
    var mov_toggle = document.getElementById("mov_toggle");
    var mus_toggle = document.getElementById("mus_toggle"); 

    //clear any existing input
    title.value = '';
    description.value = '';
    ombiName.value = '';
    ombiBasePath.value = '';
    ombiApiKey.value = '';
    tv_toggle.checked = false;
    mov_toggle.checked = false;
    mus_toggle.checked = false;

    //clear any existing errors
    if (ombiName.classList.contains("is-invalid")) {
        ombiName.classList.remove("is-invalid");
    }
    if (ombiBasePath.classList.contains("is-invalid")) {
        ombiBasePath.classList.remove("is-invalid");
    }
    if (ombiApiKey.classList.contains("is-invalid")) {
        ombiApiKey.classList.remove("is-invalid");
    }
    if (ombiName.classList.contains("is-valid")) {
        ombiName.classList.remove("is-valid");
    }
    if (ombiBasePath.classList.contains("is-valid")) {
        ombiBasePath.classList.remove("is-valid");
    }
    if (ombiApiKey.classList.contains("is-valid")) {
        ombiApiKey.classList.remove("is-valid");
    }
    document.getElementById("tv_toggleGroup").style.display = 'none';
    document.getElementById("mov_toggleGroup").style.display = 'none';
    document.getElementById("mus_toggleGroup").style.display = 'none';
    document.getElementById("ombiTestingMessage").style.visibility = "hidden";
    document.getElementById("requestModalTitle").innerHTML = 'Add Request Module';
    var submit = document.getElementById("requestModalSubmit");
    submit.setAttribute("onclick", "addRequest()")
    submit.innerHTML = "Test Connection";

    //open modal
    $('#addRequestModule').modal('show')
}
function generateRequestHTML(module) {
    document.getElementById("requestTitle").value = module.title;
    document.getElementById("requestDescription").value = module.description;
    if (module.ombiTV){
        document.getElementById("tv_toggle").checked = module.tvEnabled;
        document.getElementById("tv_toggleGroup").style.display = 'block';
    }
    if (module.ombiMOV){
        document.getElementById("mov_toggle").checked = module.movEnabled;
        document.getElementById("mov_toggleGroup").style.display = 'block';
    }
    if (module.ombiMUS){
        document.getElementById("mus_toggle").checked = module.musEnabled;
        document.getElementById("mus_toggleGroup").style.display = 'block';
    }
    var noReqT = document.getElementById("noRequestsText"); 
    if(typeof(noReqT) != 'undefined' && noReqT != null){
        noReqT.parentNode.removeChild(noReqT);
    }
    if (module.status){
        var toggleclass = 'checkeme';
    }else{
        var toggleclass = 'uncheckeme'
    }
    var task = document.createElement("div");
    identifier = `r${module.id}`;
    task.setAttribute("id", identifier);
    task.setAttribute("class", "card card-task");
    task.setAttribute("name", "request-card");
    task.innerHTML = `
    <div class="progress">
    <div class="progress-bar bg-warning" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
  </div>
  <div class="card-body">
    <div class="card-title">
      <a href="/home/request/${module.id}"><h6>${module.title}</h6></a>
      <span class="text-small">${module.description}</span>
    </div>
    <div class="card-meta">

        <div class="d-flex align-items-center">
            <label class="switch">
                <input id="renableToggle_${module.id}" name="${toggleclass}" type="checkbox" onchange="RequestToggleEnabled(${module.id})">
                <span class="slider round"></span>
            </label>    
        </div>

      <div class="dropdown card-options">
        <button class="btn-options" type="button" id="task-dropdown-button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <i class="material-icons">more_vert</i>
        </button>
        <div class="dropdown-menu dropdown-menu-right">
        <a class="dropdown-item text-primary" style="cursor: pointer;" onclick="RequestSettings(${module.id})">Settings</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item text-danger" style="cursor: pointer;" onclick="RequestDelete(${module.id})">Delete</a>
        </div>
      </div>
    </div>
  </div>
    `
    document.getElementById("requestModuleList").appendChild(task);
    updateCheckboxes();
    rebuildNav();
    GETRedirects();
}
function createRequestModule(title, description, ombiName, ombiBasePath, ombiApiKey, tv_toggle, mov_toggle, mus_toggle) {
    var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    var settings = {
        "url": "/home/admin/",
        "method": "POST",
        "headers": {
        "X-CSRFToken": $csrf_token,
        },
        "data": {
          'title': title,
          'description': description,
          'ombiName': ombiName,
          'ombiBasePath': ombiBasePath,
          "ombiApiKey": ombiApiKey,
          "tv_available": tv_toggle,
          "mov_available": mov_toggle,
          "mus_available": mus_toggle,
          'requestCreate': 'true'
      }
    }
        
    $.ajax(settings).done(function (response) {
        if (response == 6) {
            document.getElementById("ombiTestingMessageText").innerHTML = "An error occured while creating the module";
        }else if (response == 7) {
            document.getElementById("ombiTestingMessageText").innerHTML = "An error occured while retrieving the module from the database";
        }else {
            document.getElementById("ombiTestingMessageText").innerHTML = "Module Created Successfully!";
            document.getElementById("requestModalTitle").innerHTML = 'Edit Request Module';
            var submit = document.getElementById("requestModalSubmit");
            reqsave = `RequestSave(${response.id}, '${response.title}', '${response.description}', '${response.status}', '${response.ombiName}', '${response.ombiLink}', '${response.ombiApiKey}', '${response.tvEnabled}', '${response.movEnabled}', '${response.musEnabled}')`;
            submit.setAttribute("onclick", reqsave);
            submit.innerHTML = "Save";
            generateRequestHTML(response);
        }
    });
}
function addRequest(){
    //get input
    var title = document.getElementById("requestTitle");
    var description = document.getElementById("requestDescription");
    var ombiName = document.getElementById("ombiName");
    var ombiBasePath = document.getElementById("ombiLink");
    var ombiApiKey = document.getElementById("ombiApi");
    var submit = document.getElementById("requestModalSubmit");
    var tv_toggle = document.getElementById("tv_toggle");
    var mov_toggle = document.getElementById("mov_toggle");
    var mus_toggle = document.getElementById("mus_toggle"); 

    //clear any existing errors
    if (ombiName.classList.contains("is-invalid")) {
        ombiName.classList.remove("is-invalid");
    }
    if (ombiBasePath.classList.contains("is-invalid")) {
        ombiBasePath.classList.remove("is-invalid");
    }
    if (ombiApiKey.classList.contains("is-invalid")) {
        ombiApiKey.classList.remove("is-invalid");
    }
    if (ombiName.classList.contains("is-valid")) {
        ombiName.classList.remove("is-valid");
    }
    if (ombiBasePath.classList.contains("is-valid")) {
        ombiBasePath.classList.remove("is-valid");
    }
    if (ombiApiKey.classList.contains("is-valid")) {
        ombiApiKey.classList.remove("is-valid");
    }

    //check for errors
    var error = false;
    if (ombiName.value == '' || ombiName.value == undefined) {
        error = true;
        ombiName.classList.add("is-invalid");
    }else{
        ombiName.classList.add("is-valid");
    }
    if (ombiBasePath.value == '' || ombiBasePath.value == undefined) {
        error = true;
        ombiBasePath.classList.add("is-invalid");
    }else{
        ombiBasePath.classList.add("is-valid");
    }
    if (ombiApiKey.value == '' || ombiApiKey.value == undefined) {
        error = true
        ombiApiKey.classList.add("is-invalid");
    }else{
        ombiApiKey.classList.add("is-valid");
    }

    //dont submit till errors are gone
    if (error) {
        console.log('error')
    }else{
        document.getElementById("ombiTestingMessageText").innerHTML = "Testing Connection To Ombi";
        submit.innerHTML = `Connecting <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> `;
        document.getElementById("ombiTestingMessage").style.visibility = "visible";
        ombiTimeout = setTimeout(function(){ 
            submit.innerHTML = 'Test Connection';
            document.getElementById("ombiTestingMessageText").innerHTML = "Connection Failed!";
            ombiApiKey.classList.add("is-invalid");
            ombiBasePath.classList.add("is-invalid");
         }, 5000);
        var url = ombiBasePath.value + '/api/v1/Status';
        var settings = {
            "url": url,
            "method": "GET",
            "timeout": 0,
            "headers": {
                "ApiKey": ombiApiKey.value,
                "Content-Type": "application/json"
              },
          };
          
        $.ajax(settings).done(function (response) {
            clearTimeout(ombiTimeout);
            var url = ombiBasePath.value + '/api/v1/Settings/sonarr';
            var settings = {
                "url": url,
                "method": "GET",
                "timeout": 0,
                "headers": {
                    "ApiKey": ombiApiKey.value,
                    "Content-Type": "application/json"
                  },
              };
              
            $.ajax(settings).done(function (response) {
                if (response.enabled){
                    tv_toggle.checked = true;
                }
                var url = ombiBasePath.value + '/api/v1/Settings/radarr';
                var settings = {
                    "url": url,
                    "method": "GET",
                    "timeout": 0,
                    "headers": {
                        "ApiKey": ombiApiKey.value,
                        "Content-Type": "application/json"
                      },
                  };
                  
                $.ajax(settings).done(function (response) {
                    if (response.enabled){
                        mov_toggle.checked = true;
                    }
                    var url = ombiBasePath.value + '/api/v1/Settings/lidarr';
                    var settings = {
                        "url": url,
                        "method": "GET",
                        "timeout": 0,
                        "headers": {
                            "ApiKey": ombiApiKey.value,
                            "Content-Type": "application/json"
                          },
                      };
                      
                    $.ajax(settings).done(function (response) {
                        if (response.enabled){
                            mus_toggle.checked = true;
                        }
                        document.getElementById("ombiTestingMessageText").innerHTML = "Connected!";
                        submit.innerHTML = 'Save';
            
                        createRequestModule(title.value, description.value, ombiName.value, ombiBasePath.value, ombiApiKey.value, tv_toggle.checked, mov_toggle.checked, mus_toggle.checked);            
                    });
                });
            });
        });
    }

}
function RequestToggleEnabled(id){
    var elementid = "renableToggle_" + id.toString();
    var toggleSwitch = document.getElementById(elementid);
    var toggled = toggleSwitch.checked;

    var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    var settings = {
        "url": "/home/admin/",
        "method": "POST",
        "headers": {
        "X-CSRFToken": $csrf_token,
        },
        "data": {
          'id': id,
          'toggled': toggled,
          'requestToggle': 'true'
      }
    }
        
    $.ajax(settings).done(function (response) {
        if (response == 200){
            if (toggled){
               toggleSwitch.setAttribute("name", "checkeme"); 
            }else{
                toggleSwitch.setAttribute("name", "uncheckeme");
            }
        }else{
            if (toggled){
                toggleSwitch.setAttribute("name", "uncheckeme"); 
            }else{
                toggleSwitch.setAttribute("name", "checkeme");
            }
        }
        updateCheckboxes();
    });
}
function RequestSettings(id){
    var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    var settings = {
        "url": "/home/admin/",
        "method": "POST",
        "headers": {
        "X-CSRFToken": $csrf_token,
        },
        "data": {
          'id': id,
          'requestGet': 'true'
      }
    }
        
    $.ajax(settings).done(function (response) {
        var title = document.getElementById("requestTitle");
        var description = document.getElementById("requestDescription");
        var ombiName = document.getElementById("ombiName");
        var ombiBasePath = document.getElementById("ombiLink");
        var ombiApiKey = document.getElementById("ombiApi");
        var tv_toggle = document.getElementById("tv_toggle");
        var mov_toggle = document.getElementById("mov_toggle");
        var mus_toggle = document.getElementById("mus_toggle"); 

        tv_toggle.checked = false;
        mov_toggle.checked = false;
        mus_toggle.checked = false;
        document.getElementById("tv_toggleGroup").style.display = 'none';
        document.getElementById("mov_toggleGroup").style.display = 'none';
        document.getElementById("mus_toggleGroup").style.display = 'none';

        if (response.ombiTV){
            document.getElementById("tv_toggle").checked = response.tvEnabled;
            document.getElementById("tv_toggleGroup").style.display = 'block';
        }
        if (response.ombiMOV){
            document.getElementById("mov_toggle").checked = response.movEnabled;
            document.getElementById("mov_toggleGroup").style.display = 'block';
        }
        if (response.ombiMUS){
            document.getElementById("mus_toggle").checked = response.musEnabled;
            document.getElementById("mus_toggleGroup").style.display = 'block';
        }
    
        title.value = response.title;
        description.value = response.description;
        ombiName.value = response.ombiName;
        ombiBasePath.value = response.ombiLink;
        ombiApiKey.value = response.ombiApiKey;

        if (ombiName.classList.contains("is-invalid")) {
            ombiName.classList.remove("is-invalid");
        }
        if (ombiBasePath.classList.contains("is-invalid")) {
            ombiBasePath.classList.remove("is-invalid");
        }
        if (ombiApiKey.classList.contains("is-invalid")) {
            ombiApiKey.classList.remove("is-invalid");
        }
        if (ombiName.classList.contains("is-valid")) {
            ombiName.classList.remove("is-valid");
        }
        if (ombiBasePath.classList.contains("is-valid")) {
            ombiBasePath.classList.remove("is-valid");
        }
        if (ombiApiKey.classList.contains("is-valid")) {
            ombiApiKey.classList.remove("is-valid");
        }

        document.getElementById("ombiTestingMessage").style.visibility = "hidden";
        document.getElementById("requestModalTitle").innerHTML = 'Edit Request Module';
        var submit = document.getElementById("requestModalSubmit");
        reqsave = `RequestSave(${response.id}, '${response.title}', '${response.description}', '${response.status}', '${response.ombiName}', '${response.ombiLink}', '${response.ombiApiKey}', '${response.tvEnabled}', '${response.movEnabled}', '${response.musEnabled}')`;
        submit.setAttribute("onclick", reqsave);
        submit.innerHTML = "Save";
        //open modal
        $('#addRequestModule').modal('show')
    });
}
function RequestSave(mid, mtitle, mdescription, mstatus, mombiName, mombiLink, mombiApiKey, tvEnabled, movEnabled, musEnabled){
    var title = document.getElementById("requestTitle");
    var description = document.getElementById("requestDescription");
    var ombiName = document.getElementById("ombiName");
    var ombiBasePath = document.getElementById("ombiLink");
    var ombiApiKey = document.getElementById("ombiApi");
    var submit = document.getElementById("requestModalSubmit");
    var tv_toggle = document.getElementById("tv_toggle");
    var mov_toggle = document.getElementById("mov_toggle");
    var mus_toggle = document.getElementById("mus_toggle"); 

    //clear any existing errors
    if (ombiName.classList.contains("is-invalid")) {
        ombiName.classList.remove("is-invalid");
    }
    if (ombiBasePath.classList.contains("is-invalid")) {
        ombiBasePath.classList.remove("is-invalid");
    }
    if (ombiApiKey.classList.contains("is-invalid")) {
        ombiApiKey.classList.remove("is-invalid");
    }
    if (ombiName.classList.contains("is-valid")) {
        ombiName.classList.remove("is-valid");
    }
    if (ombiBasePath.classList.contains("is-valid")) {
        ombiBasePath.classList.remove("is-valid");
    }
    if (ombiApiKey.classList.contains("is-valid")) {
        ombiApiKey.classList.remove("is-valid");
    }

    //check for errors
    var error = false;
    if (ombiName.value == '' || ombiName.value == undefined) {
        error = true;
        ombiName.classList.add("is-invalid");
    }else{
        ombiName.classList.add("is-valid");
    }
    if (ombiBasePath.value == '' || ombiBasePath.value == undefined) {
        error = true;
        ombiBasePath.classList.add("is-invalid");
    }else{
        ombiBasePath.classList.add("is-valid");
    }
    if (ombiApiKey.value == '' || ombiApiKey.value == undefined) {
        error = true
        ombiApiKey.classList.add("is-invalid");
    }else{
        ombiApiKey.classList.add("is-valid");
    }

    if (title.value != mtitle || description.value != mdescription || ombiName.value != mombiName || ombiBasePath.value != mombiLink || ombiApiKey.value != mombiApiKey || tv_toggle.checked != tvEnabled || mov_toggle.checked != movEnabled || mus_toggle.checked != musEnabled){
        //dont submit till errors are gone
        if (error) {
            console.log('error')
        }else{

            document.getElementById("ombiTestingMessageText").innerHTML = "Testing Connection To Ombi";
            submit.innerHTML = `Connecting <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> `;
            document.getElementById("ombiTestingMessage").style.visibility = "visible";
            ombiTimeout = setTimeout(function(){ 
                submit.innerHTML = 'Save';
                document.getElementById("ombiTestingMessageText").innerHTML = "Connection Failed!";
                ombiApiKey.classList.add("is-invalid");
                ombiBasePath.classList.add("is-invalid");
            }, 5000);
            var url = ombiBasePath.value + '/api/system/status?apikey=' + ombiApiKey.value;
            var settings = {
                "url": url,
                "method": "GET",
                "timeout": 0,
            };
            
            $.ajax(settings).done(function (response) {
                clearTimeout(ombiTimeout);
                document.getElementById("ombiTestingMessageText").innerHTML = "Connected!";
                submit.innerHTML = 'Saving <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ';
                var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
                var settings = {
                    "url": "/home/admin/",
                    "method": "POST",
                    "headers": {
                    "X-CSRFToken": $csrf_token,
                    },
                    "data": {
                      'id':mid,
                      'title': title.value,
                      'description': description.value,
                      'ombiName': ombiName.value,
                      'ombiBasePath': ombiBasePath.value,
                      "ombiApiKey": ombiApiKey.value,
                      "tv_toggle": tv_toggle.checked,
                      "mov_toggle": mov_toggle.checked,
                      "mus_toggle": mus_toggle.checked,
                      'requestUpdate': 'true'
                  }
                }
                    
                $.ajax(settings).done(function (response) {
                    if (response == 8){
                        submit.innerHTML = 'Save';
                        document.getElementById("ombiTestingMessageText").innerHTML = "Cannot Find Module in Database! Please Refresh the page";
                    }else if (response == 9){
                        submit.innerHTML = 'Save';
                        document.getElementById("ombiTestingMessageText").innerHTML = "Cannot Update Module in Database! Please Refresh the page";
                    }else{
                        reqsave = `RequestSave(${response.id}, '${response.title}', '${response.description}', '${response.status}', '${response.ombiName}', '${response.ombiLink}', '${response.ombiApiKey}', '${response.tvEnabled}', '${response.movEnabled}', '${response.musEnabled}')`;
                        submit.setAttribute("onclick", reqsave);
                        submit.innerHTML = 'Save';
                        document.getElementById("ombiTestingMessageText").innerHTML = "Updated!";
                        var element = document.getElementById(`r${mid}`);
                        element.parentNode.removeChild(element);
                        var navid = 'rnav_' + mid;
                        var navelement = document.getElementById(navid);
                        navelement.parentNode.removeChild(navelement);
                        generateRequestHTML(response);
                    }
                });
            });
        }
    }else{
        document.getElementById("ombiTestingMessageText").innerHTML = "Nothing to Save!";
    }

}
function RequestDelete(mid){
    var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    var settings = {
        "url": "/home/admin/",
        "method": "POST",
        "headers": {
        "X-CSRFToken": $csrf_token,
        },
        "data": {
          'id':mid,
          'requestDelete': 'true'
      }
    }
        
    $.ajax(settings).done(function (response) {
        if (response == 8){
            console.log("Cannot Get Module From Database");
        }else if (response == 9){
            console.log("Cannot Delete Module From Database")
        }else if (response == 200){
            var element = document.getElementById(`r${mid}`);
            element.parentNode.removeChild(element);
            if (document.getElementsByName("request-card").length == 0){
                var noRequestsText = document.createElement("h6");
                noRequestsText.setAttribute("id", 'noRequestsText');
                noRequestsText.setAttribute("class", "text-muted text-center");
                noRequestsText.innerHTML = `No Request Modules Yet!`
                document.getElementById("requestModuleList").appendChild(noRequestsText);
            }
            rebuildNav();
            GETRedirects();
        }
    });
}
function UpdateRModulesName(){
    RModuleName = document.getElementById('RModuleName');
    RModuleNameText = document.getElementById('RModuleNameText');
    RModulesNameInput = document.getElementById('RModulesNameInput');
    RMnameI = document.getElementById('RMnameInput');
    if (RMnameI.value == '' || RMnameI.value == null){
        RMnameI.value = "Request Modules";
    }
    var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    var settings = {
        "url": "/home/admin/",
        "method": "POST",
        "headers": {
        "X-CSRFToken": $csrf_token,
        },
        "data": {
            'UpdateModuleName': 'true',
            'ModuleType': 'Request',
            'ModuleName': RMnameI.value
        }
    }
        
    $.ajax(settings).done(function (response) {
        RMnameI.value = response.Name;
        RModuleNameText.innerHTML = response.Name;
        RModuleName.style.display = 'inline';
        RModulesNameInput.style.visibility = 'hidden';
        rebuildNav();
        GETRedirects();
    });
}
function EditRequestName(){
    RModuleName = document.getElementById('RModuleName');
    RModuleNameText = document.getElementById('RModuleNameText');
    RModulesNameInput = document.getElementById('RModulesNameInput');
    RModuleName.style.display = 'none';
    RModulesNameInput.style.visibility = 'visible';
    document.getElementById('RMnameInput').focus();
}