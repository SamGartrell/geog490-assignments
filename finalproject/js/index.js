mapboxgl.accessToken = 'pk.eyJ1Ijoic2FtZ2FydHJlbGwiLCJhIjoiY2w3OWt3MW00MDNjbDN2cGRpc20ya3JnbyJ9.6t2ISNlyP1BvBmkSH2Ks_Q';
var map = new mapboxgl.Map({
    container: 'map', // pointing to the above "map" div
    style: 'mapbox://styles/samgartrell/cl7tnbdlk000215qdvkret4rv',
    center: [-120.5542, 43.8041],
    zoom: 8
});

// Data for Map points:
// actual endpoint (gets 403)
var endpoint = `https://waterservices.usgs.gov/nwis/iv/?format=json&indent=on&stateCd=or&${formatDateStamp()}&parameterCd=00060&siteStatus=all`
// // local file endpoint, copied from the rest API response in browser (works)
var local = './data/data.json'

// send api request
fetch(local)
    .then(response => response.json())
    .then(data => {
        // get data body
        var gauges = data.value.timeSeries;

        // set a counter and limit for testing
        let counter = 0;
        let limit = 999;
        console.log('gauges:', gauges)
        // iterate through locations, adding each one to the map
        gauges.forEach(function (gauge) {
            counter++;
            if (counter <= limit) {
                // make a little gauge object "g" for better readability
                g = {
                    'lat': gauge.sourceInfo.geoLocation.geogLocation.latitude,
                    'lon': gauge.sourceInfo.geoLocation.geogLocation.longitude,
                    'title': gauge.sourceInfo.siteName,
                    'id': gauge.sourceInfo.siteCode[0].value,
                    'data': {
                        'value': gauge.values[0].value[0].value,
                        'time': gauge.values[0].value[0].dateTime,
                        'desc': gauge.variable.variableDescription,
                        'unit': gauge.variable.unit.unitcode
                    }
                }
                // manually create a marker div and popup
                let markerEl = document.createElement('div');
                markerEl.setAttribute('id', `${g.id}`);
                console.log(markerEl)

                let popup = new mapboxgl.Popup(
                    { closeOnClick: true, focusAfterOpen: false }
                    ).setHTML(`<h2>${g.title}</h2>
                            <p>${g.data.desc}: ${g.data.value}</p>
                            <br>
                            <a href=https://waterdata.usgs.gov/nwis/rt>updated at ${g.data.time}</a>`
                    );
                
                
                // create the Mapbox marker object and add it to the map
                let marker = new mapboxgl.Marker({g})
                    .setLngLat([g.lon, g.lat])
                    .addTo(map)
                    .setPopup(popup)
                    
                let element = marker.getElement()
                element.setAttribute('siteid', `${g.id}`)
                element.setAttribute(
                    'onClick', "passID(this)"
                )
            }
        }
        )
    }
    );
    
//ChatGPT and the 7 JSONs
const days = ['today', 'yesterday', '2daysago', '3daysago', '4daysago', '5daysago', '6daysago'];
const results = {};

// Create an array of promises
const promises = days.map((day, i) => {
    const url = `./data/${i + 1}.json`;
    return fetch(url).then(response => response.json());
});

// Wait for all promises to resolve before continuing
Promise.all(promises).then(data => {
    data.forEach(json => {
        const timeSeries = json.value.timeSeries;
        for (let j = 0; j < timeSeries.length; j++) {
            const siteCode = timeSeries[j].sourceInfo.siteCode[0].value;
            const siteName = timeSeries[j].sourceInfo.siteName;

            if (!results[siteCode]) {
                results[siteCode] = {
                    name: siteName,
                    readings: {}
                };
            }

            const readings = timeSeries[j].values[0].value.map(v => parseFloat(v.value));
            const index = data.indexOf(json) + 1;
            results[siteCode].readings[index] = readings;
        }
    });

    console.log(results);
}).catch(error => {
    console.error(error);
});


// CHART
let site = '14400000';

const ctx = document.getElementById('line-canvas').getContext("2d");

// gradient fill
let gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0.3, 'rgba(60,50,40,0.5)'); // top of chart
gradient.addColorStop(1, 'rgba(0,170,190,0.4)'); // bottom of chart

const labels = [
    "last week",
    "6 days ago",
    "5 days ago",
    "4 days ago",
    "3 days ago",
    "yesterday",
    "today",
];

let flowRates = [];

// wait for the data to finish cooking before doing any chart stuff with it
Promise.all(promises)
    .then(() => {
        for (let i = 1; i <= 7; i++) {
            vals = results[site]["readings"][i];
            mean = vals.reduce(
                (acc, val) => acc + val, 0
            ) / vals.length;
            flowRates.push(mean)

        }

        console.log(flowRates)

        const data = {
            labels,
            datasets: [{
                data: flowRates,
                label: results[site].name,
                fill: true,
                backgroundColor: gradient,
                borderColor: "#FFF",
                pointRadius: 5,
                pointHoverRadius: 10,
                pointHitRadius: 15
            }]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'flow (cubic ft/sec)'
                        }
                    }]
                }
            }
        };

        const myChart = new Chart(ctx, config)
    });


// FUNCTIONS:
function formatDateStamp() {
    // TODO: make this return an array of 7 dates, extending back in time to last week
    // TODO: integrate with requests after figuring out USGS bullshit, so that it makes 7 requests and compiles the data for each site 
    const now = new Date().toISOString();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    return `startDT=${weekAgo}&endDT=${now}`;
}

// color markers based on stream depth
function getMarkerColor(attributes) {
    if (attributes.depth < 2) {
        return 'green';
    } else if (attributes.depth < 4) {
        return 'yellow';
    } else {
        return 'red';
    }
}

// pass ID to chart element
function passID(e, chartEl=document.getElementById('line')) {
    id = e.getAttribute('siteid')
    chartEl.setAttribute('siteid', id)
    console.log(id)
};


// panel selection function. opens or closes the panel (manipulates css height prop) depending on its current state, when clicked.
// changes the icon! points the glyph at one of two chevrons
function panelSelect(e) {
    console.log(e) //note that "e" represents the 
    //               ELEMENT in which this function was called, 
    //               since we put "this" inside the () when
    //               calling the funciton
    if (state.panelOpen) {
        document.getElementById('chartPanel').style.height = '40px';
        document.getElementById('chartPanel').style.width = '40px';
        document.getElementById('chartPanel').style.bottom = '5%';
        document.getElementById('glyph').className = "chevron glyphicon glyphicon-chevron-up";
        document.getElementById('closer').style.height = "0px";
        document.getElementById('closer').style.width = "0px";
        state.panelOpen = false;
    } else {
        document.getElementById('chartPanel').style.height = '250px';
        document.getElementById('chartPanel').style.width = '90%';
        document.getElementById('chartPanel').style.bottom = '10%';
        document.getElementById('glyph').className = "chevron glyphicon glyphicon-chevron-down";
        document.getElementById('closer').style.height = "26px";
        document.getElementById('closer').style.width = "26px";
        state.panelOpen = true;
    }
    console.log(state)
}