export const MVersion = 3

export const mUpQuery = `
    ALTER TABLE trip_results_aggregated ADD COLUMN fuel_consumption REAL;
    ALTER TABLE trip_results_aggregated ADD COLUMN trip_cost REAL;
    ALTER TABLE trip_results_aggregated ADD COLUMN regional_fuel_price REAL DEFAULT 5.00;
`;
export const  mDownQuery = `
    ALTER TABLE trip_results_aggregated DROP COLUMN fuel_consumption;
    ALTER TABLE trip_results_aggregated DROP COLUMN trip_cost;
    ALTER TABLE trip_results_aggregated DROP COLUMN regional_fuel_price;
`;