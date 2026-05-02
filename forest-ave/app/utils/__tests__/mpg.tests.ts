import { calculateInstMPGWithoutFuelTrims } from "../mpg";

test('inst mpg without fuel trims', () => {
    const maf = 13;
    const vss = 100;

    const mpg = calculateInstMPGWithoutFuelTrims(maf, vss);
    expect(mpg).toBeCloseTo(54.67);
})