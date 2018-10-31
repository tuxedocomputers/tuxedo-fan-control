const ec_access = require("../build/Release/ec_access.node");

console.log("getCpuFanDuty:             " + ec_access.getCpuFanDuty());

console.log("getCpuFanDuty:             " + ec_access.getCpuFanDuty());
console.log("getRawCpuFanDuty:          " + ec_access.getRawCpuFanDuty());
console.log("getCpuTemp:                " + ec_access.getCpuTemp());
console.log("getCpuFanRpm:              " + ec_access.getCpuFanRpm());

console.log("getGpuFanDuty:             " + ec_access.getGpuFanDuty());
console.log("getRawGpuFanDuty:          " + ec_access.getRawGpuFanDuty());

console.log("getGpuTemp:                " + ec_access.getGpuTemp());
console.log("getGpuFanRpm:              " + ec_access.getGpuFanRpm());

// console.log("setCpuFanDuty: " + ec_access.setCpuFanDuty());
// console.log("setGpuFanDuty: " + ec_access.setGpuFanDuty());

console.log("getCpuFanDutyNew:          " + ec_access.getCpuFanDutyNew());
console.log("getCpuFanTempLocal:        " + ec_access.getCpuFanDutyNew());
console.log("getCpuFanTempRemote:       " + ec_access.getCpuFanDutyNew());

console.log("getGpuFanDutyNew:          " + ec_access.getGpuFanDutyNew());
console.log("getGpuFanTempLocal:        " + ec_access.getCpuFanDutyNew());
console.log("getGpuFanTempRemote:       " + ec_access.getCpuFanDutyNew());

console.log("getGpuTwoFanDutyNew:       " + ec_access.getGpuTwoFanDutyNew());
console.log("getGpuTwoFanTempLocal:     " + ec_access.getCpuFanDutyNew());
console.log("getGpuTwoFanTempRemote:    " + ec_access.getCpuFanDutyNew());