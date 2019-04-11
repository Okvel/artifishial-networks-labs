const signalGraphId = 'signal-graph';
const errorGraphId = 'error-graph';
const range = [-3, 3];
const k = parseInt(document.getElementById('k').value);
const w0 = 0.3;

var errors = [];
var w = [];
var outW = [];

function configureGraphs() {
    activateGraph(signalGraphId, {
        xRange: range,
        yRange: [-1.5, 1.5]
    });
    activateGraph(errorGraphId, {
        xRange: [0, 100],
        yRange: [0, 0.5]
    })
}

function activateGraph(graphId, config) {
    Plotly.plot(graphId, [], {
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

function error(x, y) {
    return y - x;
}

function execute() {
    clearGraph(signalGraphId);
    clearGraph(errorGraphId);

    const t = getT();
    const x = getX(t);
    const p = getEntriesMatrix(x);

    learning(p, x);
    const y = simulate(x);
    drawChart(signalGraphId, {
        x: t,
        y: y,
        name: 'signal',
        xRange: range,
        yRange: [-1.5, 1.5]
    });
    const errorX = [];
    const errorY = [];
    for (let i = 0; i < errors.length; i++) {
        // if (i % 10 === 0) {
            errorX.push(i);
            errorY.push(errors[i]);
        // }
    }
    drawChart(errorGraphId, {
        x: errorX,
        y: errors,
        name: 'error',
        xRange: [],
        yRange: [0, 1.5]
    });
}

function getT() {
    const t = [];
    const deltaT = parseFloat(document.getElementById('deltaT').value);
    for (let i = range[0]; i <= range[1]; i += deltaT) {
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

function getEntriesMatrix(x) {
    const p = [];
    const l = x.length;
    for (let i = 0; i < k; i++) {
        p.push([]);
        for (let j = 0; j < l; j++) {
            p[i].push(0);
        }
    }

    for (let i = 0; i < k; i++) {
        let k = 0;
        for (let j = i+1; j < l; j++) {
            p[i][j] = x[k];
            k++;
        }
    }

    return p;
}

function learning(p, x) {
    initWeights(k);
    var totalError = 0;
    var counter = 0;
    let i = 0;
    let error = 0;
    do {
        // for (let i = 0; i < x.length; i += k-1) {
            let innerS = [];
            let s = 0;
            const inputs = getInputs(x, i, k);
            for (let j = 0; j < k; j++) {
                innerS.push(0);
                for (let l = 0; l < k; l++) {
                    innerS[j] += inputs[l] * w[j][l];
                }
                innerS[j] = activationFunction(innerS[j]);
                s += outW[j] * innerS[j];
            }
            const out = activationFunction(s);
            error = (x[i + k] - Math.pow(out, 2)) / 2;
            errors.push(error);
            // errors.push(error);
            
            correctInputWeights(x[i + k], out, innerS, inputs);
            correctOutWeights(x[i + k], out, innerS);
        // }

        // for (let i = 0; i < errors.length; i++) {
        //     totalError += Math.abs(errors[i]);
        // }
        counter++;
        i++;
        if (i == x.length) {
            i = 0;
        }
    } while(error > Math.pow(10, -10));
}

function initWeights(n) {
    w = [];
    outW = [];
    for (let i = 0; i < n; i++) {
        w.push([]);
        outW.push(Math.random());
        for (let j = 0; j < n; j++) {
            w[i].push(Math.random());
        }
    }
}

function getInputs(x, i, k) {
    const inputs = [];
    for (let j = 0; j < k; j++) {
        inputs.push(x[i + j]);
    }

    return inputs;
}

function activationFunction(value) {
    return (Math.exp(value) - Math.exp(-1 * value)) / (Math.exp(value) + Math.exp(-1 * value));
}

function correctInputWeights(expectedOut, actualOut, innerOuts, inputs) {
    for (let i = 0; i < w.length; i++) {
        for (let j = 0; j < w[i].length; j++) {
            w[i][j] -= (expectedOut - actualOut) * (1 - Math.pow(actualOut, 2)) * outW[i] * (1 - Math.pow(innerOuts[i], 2)) * inputs[j];
        }
    }
    // (nnn['ot'] - nnn['oaout']) * \
    //                      (1 - (nnn['oaout']) ** 2) * \
    //                      w['wh1o'] * (1 - (nnn['h1out']) ** 2) * nnn['i1']
}

function correctOutWeights(expectedOut, actualOut, innerOuts) {
    for (let i = 0; i < outW.length; i++) {
        outW[i] -= (-1 * (expectedOut - actualOut)) * (1 - Math.pow(actualOut, 2)) * innerOuts[i];
    }
    // -1 * (nnn['ot'] - nnn['oaout']) * \
    //                     (1 - (nnn['oaout']) ** 2) * nnn['h1out']
}

function simulate(x) {
    const out = [];
    for (let i = 0; i < x.length; i++) {
        let innerS = [];
        let s = 0;
        for (let j = 0; j < k; j++) {
            innerS.push(0);
            for (let l = 0; l < k; l++) {
                innerS[j] += x[i + l] * w[j][l];
            }
            innerS[j] = activationFunction(innerS[j]);
            s += outW[j] * innerS[j];
        }
        out.push(activationFunction(s));
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
        // showlegend: false
    }], {
        xaxis: {
            range: data.xRange
        },
        yaxis: {
            range: data.yRange
        }
    });
}

window.addEventListener('load', configureGraphs);
document.getElementById('start').addEventListener('click', execute);
