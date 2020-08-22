function rebuildNav(){
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
        //clear menu
        var navroot = document.getElementById("menulist_root");
        navroot.innerHTML = '';
        //create home link
        // var h = document.createElement("li");
        // h.setAttribute("class", "nav-item");
        // h.innerHTML = '<a class="nav-link" href="/home/">Home</a>';
        // navroot.appendChild(h);
        //generate new nav links
        if (response.calendars.length > 0){
            if (response.calendars.length > 1){
                var croot = document.createElement("li");
                croot.setAttribute("id", "nav_calendar");
                croot.setAttribute("class", "nav-item");
                croot.innerHTML = `<a class="nav-link" href="#" data-toggle="collapse" aria-expanded="false" data-target="#submenu-2" aria-controls="submenu-2">${response.CMname}</a>
                <div id="submenu-2" class="collapse">
                  <ul id="nav_calendar_list" class="nav nav-small flex-column">

                  </ul>
                </div>`;
                navroot.appendChild(croot);
                var i;
                for (i = 0; i < response.calendars.length; i++) {
                    var cn = document.createElement("li");
                    cn.setAttribute("id", `nav_${response.calendars[i].id}`);
                    cn.setAttribute("class", 'nav-item');
                    cn.innerHTML = `<a class="nav-link" href="/home/calendar/${response.calendars[i].id}">${response.calendars[i].title}</a>`;
                    document.getElementById("nav_calendar_list").appendChild(cn);
                } 
            }else{
                var i;
                for (i = 0; i < response.calendars.length; i++) {
                    var cn = document.createElement("li");
                    cn.setAttribute("id", `nav_${response.calendars[i].id}`);
                    cn.setAttribute("class", 'nav-item');
                    cn.innerHTML = `<a class="nav-link" href="/home/calendar/${response.calendars[i].id}">${response.calendars[i].title}</a>`;
                    navroot.appendChild(cn);
                }   
            }
        }
        if (response.requests.length > 0){
            if (response.requests.length > 1){
                var rroot = document.createElement("li");
                rroot.setAttribute("id", "nav_request");
                rroot.setAttribute("class", "nav-item");
                rroot.innerHTML = `<a class="nav-link" href="#" data-toggle="collapse" aria-expanded="false" data-target="#submenu-3" aria-controls="submenu-3">${response.RMname}</a>
                <div id="submenu-3" class="collapse">
                  <ul id="nav_request_list" class="nav nav-small flex-column">

                  </ul>
                </div>`;
                navroot.appendChild(rroot);
                var i;
                for (i = 0; i < response.requests.length; i++) {
                    var rn = document.createElement("li");
                    rn.setAttribute("id", `rnav_${response.requests[i].id}`);
                    rn.setAttribute("class", 'nav-item');
                    rn.innerHTML = `<a class="nav-link" href="/home/request/${response.requests[i].id}">${response.requests[i].title}</a>`;
                    document.getElementById("nav_request_list").appendChild(rn);
                } 
            }else{
                var i;
                for (i = 0; i < response.requests.length; i++) {
                    var rn = document.createElement("li");
                    rn.setAttribute("id", `rnav_${response.requests[i].id}`);
                    rn.setAttribute("class", 'nav-item');
                    rn.innerHTML = `<a class="nav-link" href="/home/request/${response.requests[i].id}">${response.requests[i].title}</a>`;
                    navroot.appendChild(rn);
                }  
            }
        }
    });
}