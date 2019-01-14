const CPUDATA = 1;
const GPUONEDATA = 2;
const GPUTWODATA = 3;
const ec_access = require("../build/Release/ec_access.node");

// console.log("getCpuFanDuty %:           " + ec_access.getCpuFanDuty());
// console.log("getRawCpuFanDuty:          " + ec_access.getRawCpuFanDuty());
// console.log("getCpuTemp:                " + ec_access.getCpuTemp());
// console.log("getCpuFanRpm:              " + ec_access.getCpuFanRpm());

// console.log("\n");
// console.log("getGpuFanDuty %:           " + ec_access.getGpuFanDuty());
// console.log("getRawGpuFanDuty:          " + ec_access.getRawGpuFanDuty());
// console.log("getGpuTemp:                " + ec_access.getGpuTemp());
// console.log("getGpuFanRpm:              " + ec_access.getGpuFanRpm());


// console.log("getGpuFanRpm 1:            " + ec_access.getGpuFanRpm(1));
// console.log("getGpuFanRpm 2:            " + ec_access.getGpuFanRpm(2));

// console.log("setCpuFanDuty: " + ec_access.setCpuFanDuty());
// console.log("setGpuFanDuty: " + ec_access.setGpuFanDuty());

let fanduty = 0;

console.log("\n");
fanduty = ec_access.getRawFanDutyNew(CPUDATA);
console.log("CPU(INDEX 1) getFanDutyNew %:        " + (((fanduty / 255) * 100) + 0.5));
console.log("CPU(INDEX 1) getRawFanDutyNew:       " + fanduty);
console.log("CPU(INDEX 1) getLocalTemp:           " + ec_access.getLocalTemp(CPUDATA));
console.log("CPU(INDEX 1) getRemoteTemp:          " + ec_access.getRemoteTemp(CPUDATA));
console.log("CPU(INDEX 1) getFanRpm:              " + ec_access.getFanRpm(CPUDATA));

for(let i = 0; i < 100000; i++) {}

console.log("\n");
fanduty = ec_access.getRawFanDutyNew(2);
console.log("GPU1 (INDEX 2) getFanDutyNew %:        " + (((fanduty / 255) * 100) + 0.5));
console.log("GPU1 (INDEX 2) getRawFanDutyNew:       " + fanduty);
console.log("GPU1 (INDEX 2) getLocalTemp:           " + ec_access.getLocalTemp(GPUONEDATA));
console.log("GPU1 (INDEX 2) getRemoteTemp:          " + ec_access.getRemoteTemp(GPUONEDATA));
console.log("GPU1 (INDEX 2) getFanRpm:              " + ec_access.getFanRpm(GPUONEDATA));

for(let i = 0; i < 100000; i++) {}

console.log("\n");
fanduty = ec_access.getRawFanDutyNew(3);
console.log("GPU2 (INDEX 3) getFanDutyNew %:        " + (((fanduty / 255) * 100) + 0.5));
console.log("GPU2 (INDEX 3) getRawFanDutyNew:       " + fanduty);
console.log("GPU2 (INDEX 3) getLocalTemp:           " + ec_access.getLocalTemp(GPUTWODATA));
console.log("GPU2 (INDEX 3) getRemoteTemp:          " + ec_access.getRemoteTemp(GPUTWODATA));
console.log("GPU2 (INDEX 3) getFanRpm:              " + ec_access.getFanRpm(GPUTWODATA));3