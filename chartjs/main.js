const ctx = document.getElementById('myChart').getContext("2d")

// gradient fill
let gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0.3,'rgba(60,50,40,0.5)'); // top of chart
gradient.addColorStop(1,'rgba(0,170,190,0.4)'); // bottom of chart

const labels = [
    "last week",
    "6 days ago",
    "5 days ago",
    "4 days ago",
    "3 days ago",
    "yesterday",
    "today",
]

const data = {
    labels,
    datasets: [{
        data: [
            63,
            65,
            99,
            43,
            44,
            22,
            1
        ],
        label: 'stream shit',
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