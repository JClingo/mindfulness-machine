using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Xml.Schema;
using Unity.VisualScripting;
using UnityEngine;



public class Navigator : MonoBehaviour
{
    public GameObject holograph;

    public Mesh mesh;

    public int seed;


    // Start is called before the first frame update
    void Start()
    {
        Random.InitState(seed);
        // create holograph mesh (of several hopalong orbits)
        mesh = GenerateHolographMesh(seed);
        // generate color field

        // generate intitial Holograph Clusters

        for (int level = 0; level < GLOBALS.NUM_LEVELS; level++)
        {
            
            GameObject holographClone = Instantiate(holograph, transform);
            holographClone.name = $"Holograph_{level}";
            Holograph script = holographClone.GetComponent<Holograph>();
            script.Initialize(level, mesh);

        }

        StartCoroutine(GenerateParams());


    }

    public IEnumerator GenerateParams()
    {
        for (;;)
        {
            mesh = GenerateHolographMesh(++seed);
            //Random.ColorHSV(0f, 1f, 1f, 1f, 0.5f, 1f);
            yield return new WaitForSeconds(GLOBALS.NEW_ORBIT_INTERVAL);
        }
        
    }

    private float[] GenerateColors(int seed, int n)
    {
        Random.InitState(seed);
        float[] hueValues = new float[n];
        for (int i = 0; i < GLOBALS.NUM_SUBSETS; i++) hueValues[i] = Random.value;
        return hueValues;
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    Mesh GenerateHolographMesh(int seed)
    {
        HolographVertices holographVertices = new HolographVertices(seed);
        Random.InitState(seed);

        float x, y, z, x1;
        float xMin = 0f, xMax = 0f, yMin = 0f, yMax = 0f;

        for (int i = 0; i < GLOBALS.NUM_SUBSETS; i++)
        {
            x = i * 0.005f * (0.5f - Random.value);
            y = i * 0.005f * (0.5f - Random.value);

            for (int j = 0; j < GLOBALS.NUM_POINTS_SUBSET; j++)
            {

                Subset subset = holographVertices.subsets[i, j];
                // iteration formula from Barry Martin
                z = holographVertices.d + Mathf.Sqrt(Mathf.Abs(holographVertices.b * x - holographVertices.c));
                if (x > 0) x1 = y - z;
                else if (x == 0) x1 = y;
                else x1 = y + z;

                y = holographVertices.a - x;
                x = x1 + holographVertices.e;

                subset.x = x;
                subset.y = y;

                if (x < xMin) xMin = x;
                else if (x > xMax) xMax = x;

                if (y < yMin) yMin = y;
                else if (y > yMax) yMax = y;

            }

        }

        float scaleX = 2 * GLOBALS.SCALE_FACTOR / (xMax - xMin);
        float scaleY = 2 * GLOBALS.SCALE_FACTOR / (yMax - yMin);

        holographVertices.xMin = xMin;
        holographVertices.yMin = yMin;
        holographVertices.xMax = xMax;
        holographVertices.yMax = yMax;

       
        Vector3[] vertices = new Vector3[GLOBALS.NUM_SUBSETS * GLOBALS.NUM_POINTS_SUBSET * 4]; // 4 vertices per point
        int[] triangles = new int[(int)(vertices.Length * 1.5)]; // 6 triangles per point

        // Normalize vertex data

       // vIdx == vertex index
        for (int vIdx = 0, subsetIdx = 0; subsetIdx < GLOBALS.NUM_SUBSETS; subsetIdx++)
        {
            for (int pointIdx = 0; pointIdx < GLOBALS.NUM_POINTS_SUBSET; pointIdx++)
            {

                Subset subset = holographVertices.subsets[subsetIdx, pointIdx];
                float pointX = (scaleX * (subset.x - xMin)) - GLOBALS.SCALE_FACTOR;
                float pointY = (scaleY * (subset.y - yMin)) - GLOBALS.SCALE_FACTOR;
                float pointZ = subset.vertex.z;

                vertices[vIdx] = new Vector3(pointX - 0.5f, pointY - 0.5f, pointZ);
                vertices[vIdx+1] = new Vector3(pointX - 0.5f, pointY + 0.5f, pointZ);
                vertices[vIdx+2] = new Vector3(pointX + 0.5f, pointY - 0.5f, pointZ);
                vertices[vIdx+3] = new Vector3(pointX + 0.5f, pointY + 0.5f, pointZ);

                int tIdx = (int)(vIdx * 1.5f);

                triangles[tIdx] = vIdx;
                triangles[tIdx + 1] = vIdx + 1;
                triangles[tIdx + 2] = vIdx + 2;

                triangles[tIdx + 3] = vIdx + 1;
                triangles[tIdx + 4] = vIdx + 3;
                triangles[tIdx + 5] = vIdx + 2;

                vIdx += 4;

                //vertices[idx] = new Vector3(
                //    (scaleX * (subset.x - xMin)) - GLOBALS.SCALE_FACTOR,
                //    (scaleY * (subset.y - yMin)) - GLOBALS.SCALE_FACTOR,
                //    subset.vertex.z);

                

                    
                //holographVertices.subsets[j,k].vertex.Set(
                //    (scaleX * (subset.x - xMin)) - GLOBALS.SCALE_FACTOR,
                //    (scaleY * (subset.y - yMin)) - GLOBALS.SCALE_FACTOR,
                //    subset.vertex.z);


            }
        }
        

        Mesh mesh = new Mesh();
        mesh.indexFormat = UnityEngine.Rendering.IndexFormat.UInt32;
        mesh.vertices = vertices;
        mesh.triangles = triangles;

        //mesh.RecalculateNormals();


        return mesh;



    }

}

public static class GLOBALS
{
    public const int NUM_LEVELS = 10;
    public const int NUM_SUBSETS = 7;
    public const int NUM_POINTS_SUBSET = 20000;
    public const int SCALE_FACTOR = 1600;
    public const int SPRITE_SCALE_FACTOR = 800;
    public const int CAMERA_BOUND = 3000;
    public const float FOG_DENSITY = 0.0012f;
    public const int LEVEL_DEPTH = 400;
    public const float DEF_BRIGHTNESS = 0.5f;
    public const float DEF_SATURATION = 1f;
    public const int NEW_ORBIT_INTERVAL = 6; // seconds
}

public class HolographVertices
{
    public const float A_MIN = -30f;
    public const float A_MAX = 30f;
    public const float B_MIN = 0.2f;
    public const float B_MAX = 1.8f;
    public const float C_MIN = 5f;
    public const float C_MAX = 17f;
    public const float D_MIN = 0f;
    public const float D_MAX = 10f;
    public const float E_MIN = 0f;
    public const float E_MAX = 12f;

    public float a, b, c, d, e;
    //public Vector3[,] subsets;

    public Subset[,] subsets;

    public float xMin, xMax, yMin, yMax;


    public HolographVertices(int seed)
    {
        Random.InitState(seed);
        a = Random.Range(0, 100000) * (A_MAX - A_MIN);
        b = Random.Range(0, 100000) * (B_MAX - B_MIN);
        c = Random.Range(0, 100000) * (C_MAX - C_MIN);
        d = Random.Range(0, 100000) * (D_MAX - D_MIN);
        e = Random.Range(0, 100000) * (E_MAX - E_MIN);
        subsets = new Subset[GLOBALS.NUM_SUBSETS, GLOBALS.NUM_POINTS_SUBSET];
        for (int i = 0; i < GLOBALS.NUM_SUBSETS; i++)
        {
            for (int j = 0; j < GLOBALS.NUM_POINTS_SUBSET; j++)
            {
                subsets[i, j] = new Subset();
            }
        }

    }
    
}

public class Subset
{
    public Vector3 vertex;
    public float x;
    public float y;


    public Subset()
    {

    }
    
}
