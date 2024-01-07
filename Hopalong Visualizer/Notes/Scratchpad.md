# Objects

- XR Camera
- Controller 1/2
- Keyboard/mouse input
- Navigator
    - Constants
        - SPRITE_SCALE_FACTOR
        - SCALE_FACTOR
        - CAMERA_BOUND
        - FOG_DENSITY
        - SHOULD_ADDITIVE_BLEND
        - NUM_POINTS_SUBSET
        - NUM_LEVELS
        - LEVEL_DEPTH
        - DEF_BRIGHTNESS
        - DEF_SATURATION

    - On Init()
        - Generate (first) orbit

- Orbit
    - Initial Conditions
        - speed
        - rotationSpeed
    - Constants
        - A_MIN
        - A_MAX
        - B_MIN
        - B_MAX
        - C_MIN
        - C_MAX
        - D_MIN
        - D_MAX
        - E_MIN
        - E_MAX
    - Params
        - Previous orbit
            - a,b,c,d,e (used in formula)
            - xMin,xMax,yMin,yMax,scaleX,scaleY (max and min and scales calculated at runtime)
            - subsets[][]
                - vertex
                    - x
                    - y

        - Orbit constants
        - Navigator constants
        - Current RNG seed
- Subset[]
- Point[] (generate 1 point per vertex (n=levels*subsets))
    - Points are galaxy images
- Particle[]
    - Made of points
    - mySubset (position in level, used for applying color)


- Update loop
    - Move all particles in the z direction (put into one single object (Field) and move the object, as opposed to moving separately)
    - Delete particles that have reached a certain distance from the camera