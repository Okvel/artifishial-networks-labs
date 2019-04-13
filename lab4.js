const p = [[-5, 6], [-4, 4], [-4, -4], [-3, -3], [5, 4], [6, 5], [6, -4], [6, -6]];

const range = [-7, 7];
const graphId = 'graph';
const numOfInputs = 2;

var w = [];
var out = [];
var size = 0;
var clusters = [];

function learning() {
    // size = 8;
    // const inputs = {
    //     x: p,
    //     norm: normalise(p)
    // };

    size = parseInt(document.getElementById('n').value);
    const inputs = initX();
    initClusters(parseInt(document.getElementById('k').value));
    clearGraph();
    doSelfLearning(inputs);
}

function initClusters(k) {
    clusters = [];
    for (let i = 0; i < k; i++) {
        const r = parseInt(Math.random() * 255);
        const g = parseInt(Math.random() * 255);
        const b = parseInt(Math.random() * 255);
        clusters.push({
            x: [],
            y: [],
            name: 'cluster ' + (i + 1),
            color: 'rgb(' + r + ', ' + g + ', ' + b + ')'
        });
    }
}

function initX() {
    const x = [];
    for (let i = 0; i < size; i++) {
        x.push([]);
        for (let j = 0; j < numOfInputs; j++) {
            x[i].push(Math.random() * (range[1] - range[0]) + range[0]);
        }
    }

    return {
        x: x,
        norm: normalise(x)
    };
}

function normalise(x) {
    const res = [];
    for (let i = 0; i < x.length; i++) {
        res.push([]);
        let length = 0;
        for (let j = 0; j < numOfInputs; j++) {
            length += Math.pow(x[i][j], 2);
        }
        if (length != 0) {
            for (let j = 0; j < numOfInputs; j++) {
                res[i].push(x[i][j] / Math.sqrt(length));
            }
        } else {
            for (let j = 0; j < numOfInputs; j++) {
                res[i].push(0);
            }
        }
    }

    return res;
}

async function doSelfLearning(inputs) {
    let limit = 250;
    let normX = inputs.norm;

    let k = parseInt(document.getElementById('k').value);
    initWeights(k);
    let doNext = true;
    let winners;

    do {
        winners = [];
        for (let i = 0; i < size; i++) {
            simulate(i, k, normX);
            winners.push(out.findIndex(getMin));
        }

        const deltas = [];
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < numOfInputs; j++) {
                const delta = 0.7 * (normX[i][j] - w[winners[i]][j]);
                w[winners[i]][j] += delta;
                deltas.push(delta);
            }
        }

        for (let i = 0; i < deltas.length; i++) {
            doNext = false;
            if (Math.abs(deltas[i]) > Math.pow(10, -5)) {
                doNext = true;
            }
        }
        
        limit--;
    } while(limit > 0 && doNext);

    fillClusters(inputs.x, winners);
    const centers = {
        x: [],
        y: []
    };
    for (let i = 0; i < clusters.length; i++) {
        if (clusters[i].x.length != 0) {
            centers.x.push(clusters[i].x.reduce((a,b) => a + b, 0) / clusters[i].x.length);
            centers.y.push(clusters[i].y.reduce((a,b) => a + b, 0) / clusters[i].y.length);
        }
        drawPoints({
            x: clusters[i].x,
            y: clusters[i].y,
            name: clusters[i].name,
            color: clusters[i].color
        });
    }
    drawPointsWithBorder({
        x: centers.x,
        y: centers.y,
        name: 'centers',
        color: 'red',
        legend: true
    });

    alert("Learning has been finished")
}

function initWeights(k) {
    w = [];
    let coeff = 1 / Math.sqrt(2);
    for (let i = 0; i < k; i++) {
        w.push([]);
        for (let j = 0; j < numOfInputs; j++) {
            w[i].push(Math.random() * (coeff - (-1) * coeff) + (-1) * coeff);
        }
    }
}

function simulate(i, k, normX) {
    out = [];
    for (let j = 0; j < k; j++) {
        let s = 0;
        for (let l = 0; l < numOfInputs; l++) {
            s += Math.pow(normX[i][l] - w[j][l], 2);
        }
        out.push(Math.sqrt(s));
    }
}

function getMin(value) {
    return value == Math.min(...out);
}

function fillClusters(x, winners) {
    for (let i = 0; i < clusters.length; i++) {
        clusters[i].x = [];
        clusters[i].y = [];
    }
    for (let i = 0; i < size; i++) {
        clusters[winners[i]].x.push(x[i][0]);
        clusters[winners[i]].y.push(x[i][1]);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function classificate() {
    let k = parseInt(document.getElementById('k').value);
    let data = [[
        parseInt(document.getElementById('x').value),
        parseInt(document.getElementById('y').value)
    ]];
    const inputs = {
        x: data,
        norm: normalise(data)
    };
    simulate(0, k, inputs.norm);
    const winner = out.findIndex(getMin);

    drawPointsWithBorder({
        x: [inputs.x[0][0]],
        y: [inputs.x[0][1]],
        name: clusters[winner].name,
        color: clusters[winner].color,
        legend: false
    });
}

function activateGraph() {
    Plotly.plot(graphId, [], {
        xaxis: {
            range: range
        },
        yaxis: {
            range: range
        }
    });
}

function clearGraph() {
    Plotly.purge(graphId);
}

function drawPoints(data) {
    Plotly.plot(graphId, [{
        mode: 'markers',
        x: data.x,
        y: data.y,
        name: data.name,
        marker: {
            size: 8,
            color: data.color
        }
    }], {
        xaxis: {
            range: range
        },
        yaxis: {
            range: range
        }
    });
}

function drawPointsWithBorder(data) {
    Plotly.plot(graphId, [{
        mode: 'markers',
        x: data.x,
        y: data.y,
        name: data.name,
        marker: {
            size: 15,
            color: data.color,
            line: {
                width: 2,
                color: 'black'
            }
        },
        showlegend: data.legend
    }], {
        xaxis: {
            range: range
        },
        yaxis: {
            range: range
        }
    });
}

window.addEventListener('load', activateGraph);
document.getElementById('train').addEventListener('click', learning);
document.getElementById('classificate').addEventListener('click', classificate);