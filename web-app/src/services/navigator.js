///////////////////////////////////////////////
// Hopalong Orbit Generator
///////////////////////////////////////////////
export const generateOrbit = (orbit, O, S, rng, shouldJitter) => {

    let x, y, z, x1;

    //shuffle params
    orbit.a = O.A_MIN + rng() * (O.A_MAX - O.A_MIN);
    orbit.b = O.B_MIN + rng() * (O.B_MAX - O.B_MIN);
    orbit.c = O.C_MIN + rng() * (O.C_MAX - O.C_MIN);
    orbit.d = O.D_MIN + rng() * (O.D_MAX - O.D_MIN);
    orbit.e = O.E_MIN + rng() * (O.E_MAX - O.E_MIN);

    // limit need to access nested properties (efficiency)
    const al = orbit.a;
    const bl = orbit.b;
    const cl = orbit.c;
    const dl = orbit.d;
    const el = orbit.e;
    const subsets = orbit.subsets;
    const num_points_subset_l = S.NUM_POINTS_SUBSET;
    const scale_factor_l = S.SCALE_FACTOR;

    let xMin = 0, xMax = 0, yMin = 0, yMax = 0;

    for (let s = 0; s < S.NUM_SUBSETS; s++) {

        // Use a different starting point for each orbit subset
        x = s * 0.005 * (0.5 - rng());
        y = s * 0.005 * (0.5 - rng());

        let curSubset = subsets[s];

        for (let i = 0; i < num_points_subset_l; i++) {

            // Iteration formula (generalization of the Barry Martin's original one)
            z = (dl + Math.sqrt(Math.abs(bl * x - cl)));
            if (x > 0) { x1 = y - z; }
            else if (x === 0) { x1 = y; }
            else { x1 = y + z; }
            y = al - x;
            x = x1 + el;

            const jitterX = shouldJitter ? Math.random() * 50 - 50: 0;
            const jitterY = shouldJitter ? Math.random() * 50 - 50: 0;

            curSubset[i].x = x + jitterX;
            curSubset[i].y = y + jitterY;

            if (x < xMin) { xMin = x; }
            else if (x > xMax) { xMax = x; }
            if (y < yMin) { yMin = y; }
            else if (y > yMax) { yMax = y; }

            //idx++;
        }
    }

    const scaleX = 2 * scale_factor_l / (xMax - xMin);
    const scaleY = 2 * scale_factor_l / (yMax - yMin);

    orbit.xMin = xMin;
    orbit.xMax = xMax;
    orbit.yMin = yMin;
    orbit.yMax = yMax;
    orbit.scaleX = scaleX;
    orbit.scaleY = scaleY;

    

    
    // Normalize vertex data
    for (let k = 0, idx = 0; k < S.NUM_LEVELS; k++) {
        for (let s = 0; s < S.NUM_SUBSETS; s++, idx++) {
            let curSubset = subsets[s];
            for (let i = 0; i < num_points_subset_l; i++) {
                
                curSubset[i].vertex.x = scaleX * (curSubset[i].x - xMin) - scale_factor_l;
                curSubset[i].vertex.y = scaleY * (curSubset[i].y - yMin) - scale_factor_l;
            }
        }
    }
  
    

    return orbit;

}

