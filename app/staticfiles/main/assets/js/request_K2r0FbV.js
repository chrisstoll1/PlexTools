var apikey, baseurl, $csrf_token, pid, msg, rmsg, tvenabled, movenabled, musenabled;
var resultObjects = [];

function toggleLoading(bool){
    container = document.getElementById("request_loading_container");
    if (bool){
        container.innerHTML = `<div id="request_loading" class="d-flex justify-content-center mt-5 mb-5">
        <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status">
          <span class="sr-only">Loading...</span>
        </div>
    </div>`;
    }else{
        container.innerHTML = '';
    }
}

class Message {
    constructor(type, mess) {
        this.messagediv = document.createElement('div');
        this.messagediv.setAttribute("class", `alert alert-${type} text-center mt-3`);
        this.messagediv.setAttribute("role", "alert");
        this.message = mess;
        this.messagediv.innerHTML = mess;
        document.getElementById("messages").appendChild(this.messagediv);
    }

    destroy() {
        this.messagediv.remove();
    }
}

class ResMessage {
  constructor(type, mess, id) {
      this.messagediv = document.createElement('div');
      this.messagediv.setAttribute("class", `alert alert-${type} text-center`);
      this.messagediv.setAttribute("role", "alert");
      this.message = mess;
      this.messagediv.innerHTML = mess;
      document.getElementById(`res_${id}_message`).appendChild(this.messagediv);
  }

  destroy() {
      this.messagediv.remove();
  }
}

class Result {
    constructor(result, bg, id) {
        this.id = id;
        this.iid = result.iid;
        this.date = result.date;
        this.description = result.description;
        this.posterLink = result.posterLink;
        this.requested = result.requested;
        this.rtype = result.rtype;
        this.title = result.title;
        this.parent = document.createElement("div");
        this.parent.setAttribute("class", `card shadow mb-3 pt-5 ${bg}`);
        this.parent.setAttribute("id", `res_${this.id}`);
        document.getElementById("ResultContainer").appendChild(this.parent);
        this.generateHTML();
    }

    generateHTML() {
        if (this.requested) {
            this.badge = `<span class="badge badge-success mr-2">Requested</span>`;
            this.button = '';
        }else{
            this.badge = `<span class="badge badge-warning mr-2">UnRequested</span>`;
            this.button = `<button id="res_${this.id}_button" type="button" class="btn btn-warning align-self-end float-right mt-3" onclick="resultObjects[${this.id}].request()">Request</button>`;
        }
        try {
            this.d = this.date.substring(0, 10);
        }
        catch(err) {
            this.d = '(no date)';
        }
        this.parent.innerHTML = `<div class="ml-5 mr-5 mb-2" id="res_${this.id}_message"></div><div class="media mb-5 ml-5 mr-5">
        <figure class="figure align-self-start mr-3" style="max-width: 200px">
        <img class="figure-img img-fluid rounded" src="${this.posterLink}" alt="${this.title} Poster">
        <figcaption class="figure-caption text-center"><small class="text-uppercase text-muted font-weight-bold">${this.d}</small></figcaption>
        </figure>
        <div class="media-body">
          <h5 class="mt-0">${this.badge}${this.title}</h5>
          <p">${this.description.substring(0, 300)}</p>
          ${this.button}
        </div>
        </div>  `;
    }

    destroy() {
        this.parent.remove();
    }

    updateRequested(value){
      this.requested = value;
    }

    request() {
      var rid = this.id;
      if (typeof rmsg !== 'undefined'){
        rmsg.destroy();
      }
      var btn = document.getElementById(`res_${this.id}_button`);
      btn.setAttribute("disabled", "");
      btn.setAttribute("class", "btn btn-info align-self-end float-right mt-3");
      btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...`;
      
      if (this.rtype == 'm'){
        var link = baseurl + "/api/v1/Request/movie";
        var data = JSON.stringify({"theMovieDbId":this.iid});
      }else if (this.rtype == 't'){
        var link = baseurl + "/api/v1/Request/tv";
        var data = JSON.stringify({"requestAll":true,"tvDbId":this.iid});
      }else if (this.rtype == 'mu'){
        var link = baseurl + "/api/v1/Request/music";
        var data = JSON.stringify({"foreignAlbumId": this.iid});
      }
      var settings = {
        "url": link,
        "method": "POST",
        "timeout": 0,
        "headers": {
          "ApiKey": apikey,
          "Content-Type": "application/json"
        },
        "data": data,
      };
      $.ajax(settings).done(function (response) {
        //remove the loading icon
        toggleLoading(false);
  
        //if request was successful 
        if (response.result) {
          resultObjects[rid].updateRequested(true);
          resultObjects[rid].generateHTML();
          rmsg = new ResMessage('success', 'Your request has been added successfully', rid);
        }else{//if request was unsuccessful 
          btn.removeAttribute("disabled");
          btn.setAttribute("class", "btn btn-warning align-self-end float-right mt-3");
          btn.innerHTML = `Request`;
          if (/([^\s])/.test(response.errorMessage)){
            rmsg = new ResMessage('warning', response.errorMessage, rid);
          }else{
            rmsg = new ResMessage('warning', `Your request could not be completed!`, rid);
          }
        }
  
      });
    }

}

function loadCredentials(id){
  //load ombi credentials from database
    pid = id;
    document.getElementById("searchSubmit").setAttribute("disabled", "");
    toggleLoading(true);
    $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');
    var settings = {
        "url": `/home/request/${id}/`,
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
      toggleLoading(false);
      document.getElementById("searchSubmit").removeAttribute("disabled");
    });
}

//display results function
//takes our search results and generates html to display them on the page using the createDiv function
function DisplayResults(array, searchTerm) {
    //clear previous results in case there are any 
    if (resultObjects.length > 0){
        let i;
        for (i=0; i<resultObjects.length; i++) {
            resultObjects[i].destroy();
        };
        resultObjects.splice(0, resultObjects.length);
    }
    //hide the loading icon
    toggleLoading(false);
  
    //If there are no results display warning message
    if (array.length == 0) {
        msg = new Message('warning', `The search term <u>${searchTerm}</u> returned no results`);
    }else {
      //If there are results go through each one and send it to the createDiv function
      //which will generate the results in the results section of the page
      let i;
      for (i=0; i<array.length; i++) {
        if (i % 2 == 0) {
          //Even number
          bg = ''
        }else{
          //odd number
          bg = 'bg-light'
        }
        resultObjects.push(window[i] = new Result(array[i], bg, i));
      };
    }
  }

//movie request function
//sends our search string to ombi and returns our search results
function SearchMovie(string) {
    var results = [];
    var link = baseurl + "/api/v1/Search/movie/" + string;
    var posterBasePath = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
    var settings = {
        "url": link,
        "method": "GET",
        "timeout": 0,
        "headers": {
          "ApiKey": apikey,
          "Accept": "*/*"
        },
      };
      
      $.ajax(settings).done(function (response) {
        var i;
        for (i=0; i<response.length; i++) {
          var poster = posterBasePath + response[i].posterPath;
          results.push({
            "title": response[i].title,
            "description": response[i].overview,
            "posterLink": poster,
            "requested": response[i].approved,
            "date": response[i].releaseDate,
            "iid": response[i].id,
            "rtype": "m"
          });
        };
        DisplayResults(results, string);
      });    
} 

//tv request function
//sends our search string to ombi and returns our search results
function SearchTV(string) {
    //empty array for search results
    var results = [];
    //api link
    var link = baseurl + "/api/v1/Search/tv/" + string;
    //send get request to ombi api for search results based on link
    var settings = {
        "url": link,
        "method": "GET",
        "timeout": 0,
        "headers": {
          "ApiKey": apikey,
          "Accept": "*/*"
        },
      };
      
      $.ajax(settings).done(function (response) {
        //for each item in the response take the fields we want and add it to our results array
        var i;
        for (i=0; i<response.length; i++) {
          results.push({
            "title": response[i].title,
            "description": response[i].overview,
            "posterLink": response[i].banner,
            "requested": response[i].approved,
            "date": response[i].firstAired,
            "iid": response[i].id,
            "rtype": "t"
          });
        }
        //call the display results function 
        DisplayResults(results, string);
      });    
}

//music request function
//sends our search string to ombi and returns our search results
function SearchMusic(string) {
  //empty array for search results
  var results = [];
  //api link
  var link = baseurl + "/api/v1/Search/music/album/" + string;
  //send get request to ombi api for search results based on link
  var settings = {
      "url": link,
      "method": "GET",
      "timeout": 0,
      "headers": {
        "ApiKey": apikey,
        "Accept": "*/*"
      },
    };
    
    $.ajax(settings).done(function (response) {
      // for each item in the response take the fields we want and add it to our results array
      var i;
      for (i=0; i<response.length; i++) {
        results.push({
          "title": response[i].title,
          "description": "Artist - " + response[i].artistName + ", Genre - " + response[i].genres[0],
          "posterLink": response[i].cover,
          "requested": response[i].approved,
          "date": response[i].releaseDate,
          "iid": response[i].foreignAlbumId,
          "rtype": "mu"
        });
      }
      //call the display results function 
      DisplayResults(results, string); 
    });   
}

//Main Search Function
function Searchmain() {
    //clear previous messages if there are any
    if (typeof msg !== 'undefined'){
        msg.destroy();
    }
    if (typeof rmsg !== 'undefined'){
      rmsg.destroy();
    }
    //clear result area
    document.getElementById("ResultContainer").innerHTML = '';
    //get search input value
    var search = document.getElementById("search_input").value;
    //Test if input is empty or not
    if (/([^\s])/.test(search)){
      if (!/[^a-zA-Z0-9!.,@#$%: ]/.test(search)){
        //show loading icon
        toggleLoading(true);
        //get request type tv or movie
        var radTV = document.getElementById("tvSelect").checked;
        var radMovie = document.getElementById("movieSelect").checked;
        var radMusic = document.getElementById("musicSelect").checked;
        //depending on request type either call a tv request or a movie request
        if (radTV) {
          SearchTV(search);
        }else if (radMovie) {
          SearchMovie(search);
        }else if (radMusic) {
          SearchMusic(search);
        }
      }else{
        msg = new Message('warning', `Search string <u>${search}</u> contains invalid characters`);
      }
    }else{
      msg = new Message('warning', `Search string cannot be blank`);
    }
}