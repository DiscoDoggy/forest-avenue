import { OBDPIDS } from "./obdiiCommands";
import { expect, test } from '@jest/globals';

/*
We assume OBD2 responds with 01 0C 27 10 which is the query for RPM. The returned
RPM is 10,000 (4ths of an RPM). The expected processing should be an RPM of 2500.
*/
test('OBD2 RPM hex decoding', () => {
    const rpm = OBDPIDS.RPM;
    const processedRPM = rpm.processor('41 0C 27 10');

    expect(processedRPM).toBe(2500);
});

test('OBD2 MAF decoding', () => {
    const MAF = OBDPIDS.MAF;
    const processedMAF = MAF.processor('41 10 12 34');

    expect(processedMAF).toBeCloseTo(46.60);
});

test('OBD2 MAP decoding', () => {
    const MAP = OBDPIDS.MAP;
    const processedMAP = MAP.processor('41 0B 64');

    expect(processedMAP).toBe(100);
});

test('OBD2 vehicle speed decoding', () => {
    const VSS = OBDPIDS.vehicleSpeed;
    const processedVSS = VSS.processor('41 0D 19');

    expect(processedVSS).toBe(25);
});

test('OBD2 intake air temperature decoding', () => {
    const IAT = OBDPIDS.IAT;
    const processedIAT = IAT.processor('41 0F 1E');

    expect(processedIAT).toBe(-10);
});

