const w0 = 0.1;
const graphId = 'graph';
const lineColors = ['orange', 'brown'];

var trainSet = [];
var weights = [];
var range = [];
var numberOfNeurons = 1;

function oneNeuron() {
    trainSet = [[-0.5, -0.5, [0]], [-0.5, 0.5, [0]], [0.3, -0.5, [1]], [-0.1, 1, [1]]];
    range = [-1, 1];
    numberOfNeurons = 1;

    clearGraph();
    var markers = [];
    for (let i = 0; i < trainSet.length; i++) {
        markers.push(makeMarker({
            x: [trainSet[i][0]],
            y: [trainSet[i][1]],
            color: getColor(trainSet[i][2])
        }));
    }

    drawPoints(markers);    
}

function xorProblem() {
    trainSet = [[-0.5, -0.5, [0]], [-0.5, 0.5, [1]], [0.5, -0.5, [1]], [0.5, 0.5, [0]]];
    range = [-1, 1];
    numberOfNeurons = 1;

    clearGraph();
    var markers = [];
    for (let i = 0; i < trainSet.length; i++) {
        markers.push(makeMarker({
            x: [trainSet[i][0]],
            y: [trainSet[i][1]],
            color: getColor(trainSet[i][2])
        }));
    }

    drawPoints(markers);
}

function twoNeuron() {
    trainSet = [[-0.5, -0.5, [1, 1]], [0.5, -3.5, [1, 0]], [3, -0.5, [0, 1]], [1.5, -1.5, [0, 0]], [3.5, -1.5, [0, 0]], [1.5, -3.5, [0, 0]]];
    range = [-4, 4];
    numberOfNeurons = 2;

    clearGraph();
    var markers = [];
    for (let i = 0; i < trainSet.length; i++) {
        markers.push(makeMarker({
            x: [trainSet[i][0]],
            y: [trainSet[i][1]],
            color: getColor(trainSet[i][2])
        }));
    }

    drawPoints(markers);
}

async function train() {
    const speed = document.getElementById('speed').value;
    const learningRate = document.getElementById('learningRate').value; 

    initWeights(2);
    let networkError = 0;
    let counter = 0;
    do {
        let errors = [];
        for (let i = 0; i < trainSet.length; i++) {
            deleteLines();

            for (let j = 0; j < numberOfNeurons; j++) {
                let networkError = 0;
                let s = w0;
                for (let k = 0; k < weights[j].length; k++) {
                    s += trainSet[i][k] * weights[j][k];
                }
                let type = getType(s);
                networkError = trainSet[i][2][j] - type;
                errors.push(networkError);
                let alpha = Math.floor(counter / 10) + 1;
                for (let k = 0; k < weights[j].length; k++) {
                    weights[j][k] += learningRate / alpha * trainSet[i][k] * networkError;
                }
            }
            
            await sleep(speed);
        }
        networkError = 0;
        for (let i = 0; i < errors.length; i++) {
            networkError += Math.abs(errors[i]);
        }
        counter++;
    } while(networkError > 0 && counter < 100);

    if (counter != 100) {
        alert("Learning successfully completed");
    } else {
        alert("Learning got stuck");
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function line(y, w) {
    return (-w[1] * y - w0) / w[0];
}

function initWeights(numberOfEntries) {
    weights = [];
    for (let i = 0; i < numberOfNeurons; i++) {
        weights.push([]);
        for (let j = 0; j < numberOfEntries; j++) {
            weights[i].push(Math.random() - 0.5);
        }
    }
}

function getType(s) {
    if (s > 0) {
        return 1;
    } else {
        return 0;
    }
}

function getColor(t) {
    if (t.length === 1) {
        if (t[0] === 0) {
            return 'green';
        } else {
            return 'red';
        }
    } else if (t.length === 2) {
        if (t[0] === 0 && t[1] === 0) {
            return 'green';
        } else if (t[0] === 0 && t[1] === 1) {
            return 'aqua';
        } else if (t[0] === 1 && t[1] ===0) {
            return 'blue';
        } else {
            return 'red';
        }
    }
}

function makeMarker(data) {
    return {
        mode: 'markers',
        x: data.x,
        y: data.y,
        marker: {
            color: data.color,
            size: 8
        },
        showlegend: false
    };
}

function activateGraph() {
    Plotly.plot(graphId, [], {
        xaxis: {
            range: [-1, 1],
            dtick: 0.1
        },
        yaxis: {
            range: [-1, 1],
            dtick: 0.5
        }
    });
}

function clearGraph() {
    Plotly.purge(graphId);
}

function drawPoints(markers) {
    Plotly.plot(graphId, markers, {
        xaxis: {
            range: [range[0] - 0.2, range[1] + 0.2]
        },
        yaxis: {
            range: [range[0] - 0.2, range[1] + 0.2]
        }
    });
}

function drawLine(data) {
    Plotly.plot(graphId, [{
        mode: 'line',
        x: data.x,
        y: data.y,
        line: {
            color: data.color
        },
        showlegend: false
    }], {
        xaxis: {
            range: [range[0] - 0.2, range[1] + 0.2]
        },
        yaxis: {
            range: [range[0] - 0.2, range[1] + 0.2]
        }
    });
}

function deleteLines() {
    if (document.getElementById(graphId).data.length - trainSet.length == numberOfNeurons) {
        for (let j = 0; j < numberOfNeurons; j++) {
            Plotly.deleteTraces(graphId, trainSet.length);
        }
    }
    for (let j = 0; j < numberOfNeurons; j++) {
        let data = {
            x: [line(range[0], weights[j]), line(range[1], weights[j])],
            y: range,
            color: lineColors[j]
        };
        drawLine(data);
    }
}

document.getElementById('one-neuron').addEventListener('click', oneNeuron);
document.getElementById('xor-problem').addEventListener('click', xorProblem);
document.getElementById('two-neuron').addEventListener('click', twoNeuron);
document.getElementById('train').addEventListener('click', train);
document.getElementById('classificate').addEventListener('click', classificate);

window.addEventListener('load', configureGraph);


function configureGraph() {
    activateGraph();
}

function classificate() {
    const x = document.getElementById('x').value;
    const y = document.getElementById('y').value;
    const t = [];

    for (let i = 0; i < numberOfNeurons; i++) {
        var s = w0;
        s += x * weights[i][0];
        s += y * weights[i][1];
        t.push(getType(s));
    }

    var data = {
        x: [x],
        y: [y],
        color: getColor(t)
    };
    drawPoints([makeMarker(data)]);
}
