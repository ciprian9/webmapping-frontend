/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
let been_routed = false;
let routing = '';
let route = '';
const proxyurl = "https://cors-anywhere.herokuapp.com/";
function route_to_station(users_lat_coords1, users_lng_coords1, x1, y1) {
                users_lat_coords = users_lat_coords1;
                users_lng_coords = users_lng_coords1;
                x = x1;
                y = y1;

                if (x !== '') {
                    if (been_routed === true) {
                        //remove waypoint one from index 0
                        routing.spliceWaypoints(0, 1);
                    }
                    //Instantiate a new route and pass in the option and coordinates start/end
                    routing = L.Routing.control({
                            waypoints: [L.latLng(users_lat_coords, users_lng_coords), L.latLng(x, y)],
                            lineOptions: {addWaypoints: false}

                        }
                    );
                    //add the line to the map
                    routing.addTo(map);
                    been_routed = true;

                    var listofroutes = document.getElementsByClassName('leaflet-routing-container leaflet-bar leaflet-control');
                    if (listofroutes.length > 1) {
                        listofroutes[0].remove();
                    }
                    //set the travel directions
                    setTimeout(function(){ route = document.getElementsByClassName('leaflet-routing-alt')[0]
                    document.getElementById('move_map').innerHTML=route.outerHTML;routing.hide();}, 5000);

                }
            }

function pos() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {

    //Set the map view to be the users location
    map = L.map('map').setView([position.coords.latitude, position.coords.longitude], 14);
    //set the map to the index page
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //Change the users marker to a unique red & show users location on click
    L.marker([position.coords.latitude, position.coords.longitude], {
        icon: L.AwesomeMarkers.icon({icon: 'home', prefix: 'glyphicon', markerColor: 'red'})
    }).addTo(map).bindPopup("<b>Your location: </b>" + position.coords.latitude + "," + position.coords.longitude);

    setTimeout(function(){ map.invalidateSize()}, 400);
    var lat;
    var lng;

let dataSet = [];
    $.ajax({
        method: 'GET',
        url: proxyurl + "http://139.59.186.106/json_all_stations/",
        data:{'lat':position.coords.latitude,'long':position.coords.longitude},
        success: function (bike_data) {
        alert('Stations have been loaded');
            let splitting;
            for (i in bike_data['0']) {
                let row = [];
                a = bike_data;
                //Find coords of bike station

                coords = a['0'][i]['fields']['position'];

                //Regex for seperating lat and lng into a variable

                let regExp = /\(([^)]+)\)/;
                let matches = regExp.exec(coords);

                //matches[1] contains the value between the parentheses

                splitting = matches[1].split(" ");
                lng = splitting[0];
                lat = splitting[1];

                //Pushing data to a list for displaying later

                row.push(a['0'][i]['pk']);
                row.push(a['0'][i]['fields']['stand_name']);
                row.push(a['0'][i]['distance']);
                row.push(a['0'][i]['fields']['available_bikes']);

                //Pushing all bike data station details to the datatables view

                dataSet.push(row);
                //create the marker for the bike station
                L.marker([lat, lng]).addTo(map).bindPopup("<hr><b>Number: </b>" + a['0'][i]['pk'] + "<br><b>Name: </b>" + a['0'][i]['fields']['stand_name'] +
                    "<br><b>Free bikes: </b> " + a['0'][i]['fields']['available_bikes'] + "<hr><b>Total stands: </b>" + a['0'][i]['fields']['total_bike_stands'] +
                    "<hr><b>Free stands: </b> " + a['0'][i]['fields']['available_bike_stands'] + "<hr><b>Updated: </b>" +
                    "<hr><b>Distance: </b>" + a['0'][i]['distance'] + "<hr>"
                    + "<br><button class='btn btn-primary' onclick=\"route_to_station(" + position.coords.latitude + "," + position.coords.longitude + "," + lat + "," + lng + ")\">Route to here</button>");
            }

                        //Data table displaying to the user
                        //
                        $('#example').DataTable({
                            data: dataSet,
                            columns: [
                                {title: "#"},
                                {title: "Name"},
                                {title: "Distance (Km)"},
                                {title: "Free Bikes"}

                            ],

                        });

        },


        error(){alert("No Stations available")}
    });

    //Change the users marker to a unique red & show users location
    //

}


var users_lat_coords ='';
var users_lng_coords ='';
var x='';
var y = '';
//Accessible map
var map = '';
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    // deviceready Event Handler

    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');

        pos();

    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);

        console.log('Received Event: ' + id);
    }
};

app.initialize();

