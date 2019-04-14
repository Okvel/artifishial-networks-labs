const signalGraphId = 'signal-graph';
const errorGraphId = 'error-graph';
const range = [-3, 3];
const k = parseInt(document.getElementById('k').value);

var errors = [];
var w = [];

function configureGraphs() {
    activateGraph(signalGraphId, {
        xRange: range,
        yRange: [-1.5, 1.5],
        title: 'Signal'
    });
    activateGraph(errorGraphId, {
        xRange: [0, 100],
        yRange: [0, 0.5],
        title: 'Error'
    });
}

function activateGraph(graphId, config) {
    Plotly.plot(graphId, [], {
        title: config.title,
        xaxis: {
            range: config.xRange
        },
        yaxis: {
            range: config.yRange
        }
    });
}

function referenceFunction(t) {
    return Math.cos(3 * Math.PI * t);
}

function execute() {
    clearGraph(signalGraphId);
    clearGraph(errorGraphId);

    const t = getT(parseFloat(document.getElementById('deltaT').value));
    const x = getX(t);

    learning(x);
    const y = simulate(x);
    t.splice(0, k);
    drawChart(signalGraphId, {
        x: t,
        y: y,
        name: 'predicted signal',
        title: 'Signal'
    });

    const idealT = getT(0.1);
    const idealX = getX(idealT);
    drawPoints(signalGraphId, {
        x: idealT,
        y: idealX,
        name: 'ideal signal'
    });

    const errorX = [];
    const errorY = [];
    for (let i = 0; i < errors.length; i++) {
        errorX.push(i);
        errorY.push(errors[i]);
    }
    drawChart(errorGraphId, {
        x: errorX,
        y: errors,
        title: "Error"
    });
}

function getT(delta) {
    const t = [];
    for (let i = range[0]; i <= range[1]; i += delta) {
        t.push(i);
    }

    return t;
}

function getX(t) {
    const x = [];
    for (let i = 0; i < t.length; i++) {
        x.push(referenceFunction(t[i]));
    }

    return x;
}

function learning(x) {
    initWeights(k);
    let i = 0;
    let doNext = true;
    errors = [];
    do {
        let error = 0;
        let s = 0;
        const inputs = getInputs(x, i, k);
        for (let j = 0; j < k; j++) {
            s += w[j] * inputs[j];
        }
        error = Math.pow(x[i + k] - s, 2);
        errors.push(error);
        
        if (error > Math.pow(10, -3)) {
            for (let j = 0; j < w.length; j++) {
                w[j] += parseFloat(document.getElementById('learning-rate').value) * inputs[j] * (x[i + k] - s);
            }
        } else {
            doNext = false;
        }

        errors.push(error);
        i++;
        if (i == x.length) {
            i = 0;
        }
    } while(doNext);
}

function initWeights(n) {
    w = [];
    for (let i = 0; i < n; i++) {
        w.push(Math.random());
    }
}

function getInputs(x, i, k) {
    const inputs = [];
    for (let j = 0; j < k; j++) {
        inputs.push(x[i + j]);
    }

    return inputs;
}

function simulate(x) {
    const out = [];
    for (let i = 0; i < x.length; i++) {
        let s = 0;
        for (let j = 0; j < k; j++) {
            s += w[j] * x[i + j];
        }
        out.push(s);
    }

    return out;
}

function clearGraph(graphId) {
    Plotly.purge(graphId);
}

function drawChart(graphId, data) {
    Plotly.plot(graphId, [{
        mode: 'line',
        x: data.x,
        y: data.y,
        name: data.name
    }], { title: data.title });
}

function drawPoints(graphId, data) {
    Plotly.plot(graphId, [{
        mode: 'markers',
        x: data.x,
        y: data.y,
        name: data.name,
        marker: {
            size: 8
        }
    }]);
}

window.addEventListener('load', configureGraphs);
document.getElementById('start').addEventListener('click', execute);
