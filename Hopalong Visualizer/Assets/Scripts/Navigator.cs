using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Xml.Schema;
using Unity.VisualScripting;
using UnityEngine;



public class Navigator : MonoBehaviour
{
    public GameObject holograph;
    public GameObject pointCloud;
    public GameObject point;

    public int seed = 1999;


    // Start is called before the first frame update
    void Start()
    {
        Random.InitState(seed);
        // calculate holograph (of several hopalong orbits)
        HolographVertices holographVertices = GenerateHolographVertices(seed);
        // generate color field
        float[] hueValues = GenerateColors(seed, GLOBALS.NUM_SUBSETS);

        // generate particleCloud (made from points)
        //for (int i = 0; i < GLOBALS.NUM_LEVELS; i++)
        //{
        //    for (int j = 0; j < GLOBALS.NUM_SUBSETS; j++)
        //    {
        //        Vector3[] points = new Vector3[GLOBALS.NUM_POINTS_SUBSET];
        //        for (int k = 0; k < GLOBALS.NUM_POINTS_SUBSET; k++) points[k] = holographVertices.subsets[j][k];

        //    }
        //}

        // generate intitial Holograph Clusters

        GameObject[] allPoints = new GameObject[GLOBALS.NUM_LEVELS * GLOBALS.NUM_SUBSETS * GLOBALS.NUM_POINTS_SUBSET];
        int idx = 0;
        for (int i = 0; i < GLOBALS.NUM_LEVELS; i++)
        {
            
            GameObject holographClone = Instantiate(holograph, transform); // should attach all this to Navigator
            holographClone.name = $"Holograph_{i}";
            for (int j = 0; j < GLOBALS.NUM_SUBSETS; j++)
            {
                //GameObject holograph = new GameObject($"Holograph_{i}_{j}");
                
                GameObject pointCloudClone = Instantiate(pointCloud, holographClone.transform);
                pointCloudClone.name = $"Point Cloud_{i}_{j}";
                for (int k = 0; k < GLOBALS.NUM_POINTS_SUBSET; k++)
                {
                    //point = new GameObject($"Point_{i}_{j}_{k}");
                    //allPoints[idx++] = Instantiate(point, pointCloud.transform);
                    GameObject pointClone = Instantiate(point, pointCloudClone.transform);
                    pointClone.name = $"Point_{i}_{j}_{k}";
                    Vector3 position = holographVertices.subsets[j, k].vertex;
                    position.z = -GLOBALS.LEVEL_DEPTH * i - (j - GLOBALS.LEVEL_DEPTH / GLOBALS.NUM_SUBSETS) + GLOBALS.SCALE_FACTOR / 2;
                    pointClone.transform.position = position;

                }
                //CombineMeshes(pointCloudClone);
            }
        }

        // combine meshes for efficiency



    }

    /// <summary>
    /// Combines the given object's children into a single mesh
    /// </summary>
    /// <param name="obj"></param>
    public void CombineMeshes(GameObject obj)
    {
        //Temporarily set position to zero to make matrix math easier
        Vector3 position = obj.transform.position;
        obj.transform.position = Vector3.zero;

        //Get all mesh filters and combine
        MeshFilter[] meshFilters = obj.GetComponentsInChildren<MeshFilter>();
        CombineInstance[] combine = new CombineInstance[meshFilters.Length];
        int i = 1;
        while (i < meshFilters.Length)
        {
            combine[i].mesh = meshFilters[i].sharedMesh;
            combine[i].transform = meshFilters[i].transform.localToWorldMatrix;
            meshFilters[i].gameObject.SetActive(false);
            i++;
        }

        obj.transform.GetComponent<MeshFilter>().mesh = new Mesh();
        obj.transform.GetComponent<MeshFilter>().mesh.indexFormat = UnityEngine.Rendering.IndexFormat.UInt32;
        obj.transform.GetComponent<MeshFilter>().mesh.CombineMeshes(combine, true, true);
        obj.transform.gameObject.SetActive(true);

        //Return to original position
        obj.transform.position = position;

        //Add collider to mesh (if needed)
        //obj.AddComponent<MeshCollider>();
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

    HolographVertices GenerateHolographVertices(int seed)
    {
        HolographVertices holographVertices = new HolographVertices(seed);
        Random.InitState(seed);

        float x, y, z, x1;
        float xMin = 0f, xMax = 0f, yMin = 0f, yMax = 0f;

        for (int i = 0; i < GLOBALS.NUM_SUBSETS; i++)
        {
            x = i * 0.005f * (0.5f - Random.value);
            y = i * 0.005f * (0.5f - Random.value);

            //// initialize vertices as needed
            //if (holographVertices.subsets.Length == 0)
            //{
            //    holographVertices.subsets[]
            //}


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

        // Normalize vertex data

        for (int i = 0; i < GLOBALS.NUM_LEVELS; i++)
        {
            for (int j = 0; j < GLOBALS.NUM_SUBSETS; j++)
            {
                for (int k = 0; k < GLOBALS.NUM_POINTS_SUBSET; k++)
                {
                    Subset subset = holographVertices.subsets[j, k];
                    holographVertices.subsets[j,k].vertex.Set(
                        (scaleX * (subset.x - xMin)) - GLOBALS.SCALE_FACTOR,
                        (scaleY * (subset.y - yMin)) - GLOBALS.SCALE_FACTOR,
                        subset.vertex.z);
                }
            }
        }

        return holographVertices;
    }



}

public static class GLOBALS
{
    public const int NUM_LEVELS = 10;
    public const int NUM_SUBSETS = 7;
    public const int NUM_POINTS_SUBSET = 1000;
    public const int SCALE_FACTOR = 1600;
    public const int SPRITE_SCALE_FACTOR = 800;
    public const int CAMERA_BOUND = 200;
    public const float FOG_DENSITY = 0.0012f;
    public const int LEVEL_DEPTH = 400;
    public const float DEF_BRIGHTNESS = 0.5f;
    public const float DEF_SATURATION = 1f;
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
        //subsets = new Vector3[GLOBALS.NUM_SUBSETS, GLOBALS.NUM_POINTS_SUBSET];


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





