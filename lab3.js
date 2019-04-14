const graphId = 'graph';
const range = [-5, 5];

var numOfNeurons = 0;
var inW = [];
var outW = [];
var inWDiff = [];
var outWDiff = [];
var w0 = [];
var outW0 = [];

function f(t) {
    return (0.5 * t + 1.9) * Math.cos(0.7 * t - 1.3);
}

function execute() {   
    numOfNeurons = parseInt(document.getElementById('n').value);
    const t = getT(parseFloat(document.getElementById('step').value));
    const y = getY(t);
    clearGraph();
    drawChart({
        x: t,
        y: y,
        name: 'ideal chart'
    });

    learning(y, t);
    const x = simulate(t);
    drawChart({
        x: t,
        y: x,
        name: 'approximated chart'
    });
}

function getT(delta) {
    const out = [];
    for (let i = range[0]; i <= range[1]; i += delta) {
        out.push(i);
    }

    return out;
}

function getY(t) {
    const out = [];
    for (let i = 0; i < t.length; i++) {
        out.push(f(t[i]));
    }

    return out;
}

async function learning(y, t) {
    initWeights();
    let doNext = true;
    let i = 0;
    let limit = 600;
    let lr = parseFloat(document.getElementById('learning-rate').value);

    do {
        let error = 0;
        let inS = [];
        let s = 0;

        for (let j = 0; j < numOfNeurons; j++) {
            inS.push(0);
            let sum = w0[j] + (inW[j] * t[i]);
            inS[j] = activationFunction(sum);
            s += outW0[j] + (outW[j] * inS[j]);
        }

        error = Math.pow(y[i] - s, 2);

        if (error > Math.pow(10, -5)) {
            let alpha = 0.3;
            lr = 0.05;
            let delta = (y[i] - s);
            for (let j = 0; j < numOfNeurons; j++) {
                let outDelta = 0.5 * (1 + inS[j]) * (1 - inS[j]) * outW[j] * delta;
                // sigmoid
                // let outDelta = (1 - inS[j]) * inS[j] * outW[j] * delta;

                // let outDelta = (2 * Math.exp(-1 * inS[j])) / (Math.pow(1 + Math.exp(-1 * inS[j]), 2)) * outW[j] * delta;
                let outGrad = delta * inS[j];
                let outDeltaW = (lr * outGrad) + (alpha * outWDiff[j]);
                outW[j] += outDeltaW;
                outWDiff[j] = outDeltaW;

                let inGrad = outDelta * t[i];
                let inDeltaW = (lr * inGrad) + (alpha * inWDiff[j]);
                inW[j] += inDeltaW;
                inWDiff[j] = inDeltaW;
            }

            // let oD1 = 0.5 * (1 + inS[0]) * (1 - inS[0]) * outW[0] * delta;
            // let oD2 = 0.5 * (1 + inS[1]) * (1 - inS[1]) * outW[1] * delta;
            // let oD3 = 0.5 * (1 + inS[2]) * (1 - inS[2]) * outW[2] * delta;
            // let oD4 = 0.5 * (1 + inS[3]) * (1 - inS[3]) * outW[3] * delta;
            
            // let oG1 = delta * inS[0];
            // let oG2 = delta * inS[1];
            // let oG3 = delta * inS[2];
            // let oG4 = delta * inS[3];

            // let dOW1 = (lr * oG1) + (alpha * outWDiff[0]);
            // let dOW2 = (lr * oG2) + (alpha * outWDiff[1]);
            // let dOW3 = (lr * oG3) + (alpha * outWDiff[2]);
            // let dOW4 = (lr * oG4) + (alpha * outWDiff[3]);

            // outWDiff[0] = dOW1;
            // outWDiff[1] = dOW2;
            // outWDiff[2] = dOW3;
            // outWDiff[3] = dOW4;

            // outW[0] += dOW1;
            // outW[1] += dOW2;
            // outW[2] += dOW3;
            // outW[3] += dOW4;

            // let iG1 = oD1 * t[i];
            // let iG2 = oD2 * t[i];
            // let iG3 = oD3 * t[i];
            // let iG4 = oD4 * t[i];

            // let dIW1 = (lr * iG1) + (alpha * inWDiff[0]);
            // let dIW2 = (lr * iG2) + (alpha * inWDiff[1]);
            // let dIW3 = (lr * iG3) + (alpha * inWDiff[2]);
            // let dIW4 = (lr * iG4) + (alpha * inWDiff[3]);

            // inWDiff[0] = dIW1;
            // inWDiff[1] = dIW2;
            // inWDiff[2] = dIW3;
            // inWDiff[3] = dIW4;

            // inW[0] += dIW1;
            // inW[1] += dIW2;
            // inW[2] += dIW3;
            // inW[3] += dIW4;

             limit--;
        } else {
            doNext = false;
        }
        i++;
        if (i == t.length) {
            i = 0;
        }
    } while(doNext && limit > 0);
}

function initWeights() {
    inW = [];
    outW = [];
    w0 = [];
    outW0 = [];
    inWDiff = [];
    outWDiff = [];
    for (let i = 0; i < numOfNeurons; i++) {
        let b = 0.5;
        inW.push(Math.random() - b);
        outW.push(Math.random() - b);       
        w0.push(Math.random() - b);
        outW0.push(Math.random() - b);
        inWDiff.push(0);
        outWDiff.push(0);
    }
}

function activationFunction(s) {
    return 2 / (1 + Math.exp(-1 * s)) - 1;
    // sigmoid
    // return 1 / (1 - Math.exp(-1 * s));
}

function simulate(t) {
    const out = [];
    for (let i = 0; i < t.length; i++) {
        let s = 0;

        for (let j = 0; j < numOfNeurons; j++) {
            s += outW0[j] + (outW[j] * activationFunction(w0[j] + (inW[j] * t[i])));
        }
        out.push(s);
    }

    return out;
}

function activateGraph() {
    Plotly.plot(graphId, [], {
        xaxis: {
            range: range
        },
        yaxis: {
            range: [-1, 1]
        }
    });
}

function clearGraph() {
    Plotly.purge(graphId);
}

function drawChart(data) {
    Plotly.plot(graphId, [{
        mode: 'line',
        x: data.x,
        y: data.y,
        name: data.name
    }]);
}

window.addEventListener('load', activateGraph)
document.getElementById('start').addEventListener('click', execute);
document.getElementById('tf').addEventListener('click', useTF);

function useTF() {
    numOfNeurons = parseInt(document.getElementById('n').value);
    const t = getT(parseFloat(document.getElementById('step').value));
    const y = getY(t);
    simTF(t, y);
}

async function simTF(t, y) {
    document.getElementById('loader').style.display = 'block';
    let lr = parseFloat(document.getElementById('learning-rate').value);

    const model = tf.sequential();
    model.add(tf.layers.dense({
        units: numOfNeurons,
        activation: 'sigmoid',
        inputShape: [1],
        biasInitializer: tf.initializers.randomUniform({
            minval: -0.5,
            maxval: 0.5
        })
    }));
    model.add(tf.layers.dense({
        units: 1,
        activation: 'linear'
    }));
    const optimizer = tf.train.sgd(lr);
    model.compile({
        loss: 'meanSquaredError',
        optimizer: optimizer
    });

    await model.fit(tf.tensor(t), tf.tensor(y), {
        epochs: 600
    });

    let out = [];
    let modelOut = (await model.predict(tf.tensor(t)).array());
    for (let i = 0; i < modelOut.length; i++) {
        out.push(modelOut[i][0]);
    }
    document.getElementById('loader').style.display = 'none';

    clearGraph();
    drawChart({
        x: t,
        y: y,
        name: 'ideal chart'
    });
    drawChart({
        x: t,
        y: out,
        name: 'approximated chart'
    });
}