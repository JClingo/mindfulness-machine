using System.Collections;
using System.Collections.Generic;
using System.Net.Sockets;
using Unity.VisualScripting;
using UnityEngine;
using UnityEngine.AI;

public class PointCloud : MonoBehaviour
{

    private int level;
    public GameObject point;
    public int subsetIdx;


    // Start is called before the first frame update
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public void Initialize(int level, int subsetIdx, HolographVertices holographVertices)
    {
        this.subsetIdx = subsetIdx;
            

        for (int pointsIdx = 0; pointsIdx < GLOBALS.NUM_POINTS_SUBSET; pointsIdx++)
        {
            //point = new GameObject($"Point_{i}_{j}_{k}");
            //allPoints[idx++] = Instantiate(point, pointCloud.transform);
            GameObject pointClone = Instantiate(point, transform);
            pointClone.name = $"Point_{level}_{subsetIdx}_{pointsIdx}";
            Vector3 position = holographVertices.subsets[subsetIdx, pointsIdx].vertex;
                
            //position.z = -GLOBALS.LEVEL_DEPTH * i - (j - GLOBALS.LEVEL_DEPTH / GLOBALS.NUM_SUBSETS) + GLOBALS.SCALE_FACTOR / 2;
            pointClone.transform.localPosition = position;

        }

        CombineMeshes();
        SetColors();

    }

    public void SetColors()
    {
        gameObject.GetComponent<Renderer>().material.color = Random.ColorHSV(0f, 1f, 1f, 1f, 0.5f, 1f);
    }

    /// <summary>
    /// Combines the given object's children into a single mesh
    /// </summary>
    /// <param name="obj"></param>
    public void CombineMeshes(bool shouldRecombine = false)
    {

        if (shouldRecombine)
        {
            // garbage collection or sth--it keeps crashing after a while
        }

        //Temporarily set position to zero to make matrix math easier
        Vector3 position = gameObject.transform.position;
        transform.position = Vector3.zero;

        //Get all mesh filters and combine
        MeshFilter[] meshFilters = gameObject.GetComponentsInChildren<MeshFilter>(true);
        CombineInstance[] combine = new CombineInstance[meshFilters.Length-1];
        int i = 1; // skip self (first filter)
        while (i < meshFilters.Length)
        {
            combine[i-1].mesh = meshFilters[i].sharedMesh;
            combine[i-1].transform = meshFilters[i].transform.localToWorldMatrix;
            meshFilters[i].gameObject.SetActive(false);
            i++;
        }

        transform.GetComponent<MeshFilter>().mesh = new Mesh();
        transform.GetComponent<MeshFilter>().mesh.indexFormat = UnityEngine.Rendering.IndexFormat.UInt32;
        transform.GetComponent<MeshFilter>().mesh.CombineMeshes(combine, true, true);
        transform.gameObject.SetActive(true);

        //Return to original position
        transform.position = position;

        //Add collider to mesh (if needed)
        //obj.AddComponent<MeshCollider>();
    }



}
