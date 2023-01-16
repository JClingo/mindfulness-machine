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

    public int numPointsSubset;

    private Vector3[] vertices;
    private int[] triangles;
    private Vector2[] uvs;
    private HolographVertices holographVertices;
    private int totalPoints;


    // Start is called before the first frame update
    void Start()
    {
        Random.InitState(seed);
        // create holograph mesh (of several hopalong orbits)
        totalPoints = GLOBALS.NUM_SUBSETS * numPointsSubset;
        vertices = new Vector3[totalPoints * 4]; // 4 vertices per point
        triangles = new int[(int)(totalPoints * 6)]; // 6 triangles per point
        uvs = new Vector2[totalPoints * 4];
        mesh = new Mesh();
        mesh.indexFormat = UnityEngine.Rendering.IndexFormat.UInt32;
        holographVertices = new HolographVertices(seed, numPointsSubset);
        UpdateHolographMesh();
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
            UpdateHolographMesh();
            seed++;
            yield return new WaitForSeconds(GLOBALS.NEW_ORBIT_INTERVAL);
        }
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    void UpdateHolographMesh()
    {
        holographVertices.UpdateSubsets(seed, numPointsSubset);

        Random.InitState(seed);

        float x, y, z, x1;
        float xMin = 0f, xMax = 0f, yMin = 0f, yMax = 0f;

        for (int i = 0; i < GLOBALS.NUM_SUBSETS; i++)
        {
            x = i * 0.005f * (0.5f - Random.value);
            y = i * 0.005f * (0.5f - Random.value);

            for (int j = 0; j < numPointsSubset; j++)
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



        float pointXMin = 0f;
        float pointXMax = 0f;
        float pointYMin = 0f;
        float pointYMax = 0f;


        // calculate range (for normalization)
        for (int subsetIdx = 0; subsetIdx < GLOBALS.NUM_SUBSETS; subsetIdx++)
        {
            for (int pointIdx = 0; pointIdx < numPointsSubset; pointIdx++)
            {
                Subset subset = holographVertices.subsets[subsetIdx, pointIdx];
                float pointX = (scaleX * (subset.x - xMin)) - GLOBALS.SCALE_FACTOR;
                float pointY = (scaleY * (subset.y - yMin)) - GLOBALS.SCALE_FACTOR;

                float vXMin = pointX - GLOBALS.POINT_SIZE;
                float vXMax = pointX + GLOBALS.POINT_SIZE;
                float vYMin = pointY - GLOBALS.POINT_SIZE;
                float vYMax = pointY + GLOBALS.POINT_SIZE;

                if (vXMin < pointXMin) pointXMin = vXMin;
                if (vXMax > pointXMax) pointXMax = vXMax;
                if (vXMin < pointYMin) pointYMin = vYMin;
                if (vXMax > pointYMax) pointYMax = vYMax;
            }
        }

        float pointXRange = pointXMax - pointXMin;
        float pointYRange = pointYMax - pointYMin;


        // hand-build vertices, triangles, and uvs
        // each "point" is a quad, centered around a single point
        // 
        // idx == vertex index
        for (int idx = 0, subsetIdx = 0; subsetIdx < GLOBALS.NUM_SUBSETS; subsetIdx++)
        {
            for (int pointIdx = 0; pointIdx < numPointsSubset; pointIdx++)
            {

                Subset subset = holographVertices.subsets[subsetIdx, pointIdx];
                float pointX = (scaleX * (subset.x - xMin)) - GLOBALS.SCALE_FACTOR;
                float pointY = (scaleY * (subset.y - yMin)) - GLOBALS.SCALE_FACTOR;
                float pointZ = subset.vertex.z;

                float vXMin = pointX - GLOBALS.POINT_SIZE;
                float vXMax = pointX + GLOBALS.POINT_SIZE;
                float vYMin = pointY - GLOBALS.POINT_SIZE;
                float vYMax = pointY + GLOBALS.POINT_SIZE;

                vertices[idx].Set(vXMin, vYMin, pointZ);
                vertices[idx + 1].Set(vXMin, vYMax, pointZ);
                vertices[idx + 2].Set(vXMax, vYMin, pointZ);
                vertices[idx + 3].Set(vXMax, vYMax, pointZ);

                int tIdx = (int)(idx * 1.5f);

                triangles[tIdx] = idx;
                triangles[tIdx + 1] = idx + 1;
                triangles[tIdx + 2] = idx + 2;

                triangles[tIdx + 3] = idx + 1;
                triangles[tIdx + 4] = idx + 3;
                triangles[tIdx + 5] = idx + 2;

                // these are the same as vertices, just normalized to 0,1


                uvs[idx].Set((vXMin - pointXMin) / pointXRange, (vYMin - pointYMin) / pointYRange);
                uvs[idx + 1].Set((vXMin - pointXMin) / pointXRange, (vYMax - pointYMin) / pointYRange);
                uvs[idx + 2].Set((vXMax - pointXMin) / pointXRange, (vYMin - pointYMin) / pointYRange);
                uvs[idx + 3].Set((vXMax - pointXMin) / pointXRange, (vYMax - pointYMin) / pointYRange);

                if (vXMin - pointXMin < 1)
                {
                    Debug.Log("hmm");
                }

                if (vYMin - pointYMin < 1)
                {
                    Debug.Log("HMM");
                }

                //uvs[idx].Set(vXMin / totalPoints / 2, vYMin / totalPoints / 2);
                //uvs[idx + 1].Set(vXMin / totalPoints / 2, vYMax / totalPoints / 2);
                //uvs[idx + 2].Set(vXMax / totalPoints / 2, vYMin / totalPoints / 2);
                //uvs[idx + 3].Set(vXMax / totalPoints / 2, vYMax / totalPoints / 2);


                idx += 4;

            }
        }




        mesh.vertices = vertices;
        mesh.triangles = triangles;
        mesh.uv = uvs;
        mesh.RecalculateNormals();

        // calculate the normalized uv

        // take point and shift x and y up by the mins
        // normalization = (x - xmin) / (xmax - xmin)
        // 

        //for (int idx = 0; idx < vertices.Length;)
        //{

        //    float xMinNorm = vertices[idx].x;

        //    uvs[idx].Set((float)idx / totalPoints / 2, (float)subsetIdx / totalPoints / 2);
        //    uvs[idx+1].Set((float)(idx + 1) / totalPoints / 2, (float)subsetIdx / totalPoints / 2);
        //    uvs[idx+2].Set((float)(idx + 2) / totalPoints / 2, (float)subsetIdx / totalPoints / 2);
        //    uvs[idx+3].Set((float)(idx + 3) / totalPoints / 2, (float)subsetIdx / totalPoints / 2);

        //    idx += 4;
        //}






    }


}

public static class GLOBALS
{
    public const int NUM_LEVELS = 16;
    public const int NUM_SUBSETS = 12;
    
    public const int SCALE_FACTOR = 600;
    public const int CAMERA_BOUND = 2000;
    public const int LEVEL_DEPTH = 200;
    public const int NEW_ORBIT_INTERVAL = 4; // seconds
    public const float POINT_SIZE = 0.75f;
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


    public HolographVertices(int seed, int numPointsSubset)
    {
        subsets = new Subset[GLOBALS.NUM_SUBSETS, numPointsSubset];
        for (int i = 0; i < GLOBALS.NUM_SUBSETS; i++)
        {
            for (int j = 0; j < numPointsSubset; j++)
            {
                subsets[i, j] = new Subset();
            }
        }
        UpdateSubsets(seed, numPointsSubset);
    }

    public void UpdateSubsets(int seed, int numPointsSubset)
    {
        Random.InitState(seed);
        a = Random.Range(0, 100000) * (A_MAX - A_MIN);
        b = Random.Range(0, 100000) * (B_MAX - B_MIN);
        c = Random.Range(0, 100000) * (C_MAX - C_MIN);
        d = Random.Range(0, 100000) * (D_MAX - D_MIN);
        e = Random.Range(0, 100000) * (E_MAX - E_MIN);
        
        //for (int i = 0; i < GLOBALS.NUM_SUBSETS; i++)
        //{
        //    for (int j = 0; j < numPointsSubset; j++)
        //    {
        //        subsets[i, j] = new Subset();
        //    }
        //}
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
