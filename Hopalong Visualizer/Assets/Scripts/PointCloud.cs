using System.Collections;
using System.Collections.Generic;
using System.Net.Sockets;
using Unity.Jobs;
using Unity.VisualScripting;
using UnityEngine;
using UnityEngine.AI;

public class PointCloud : MonoBehaviour
{

    private int level;
    public GameObject point;
    public int subsetIdx;
    CombineMeshesJob combineMeshesJob;
    MeshCombiner meshCombiner;

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

        //CombineMeshes();

        meshCombiner = gameObject.AddComponent<MeshCombiner>();
        meshCombiner.CreateMultiMaterialMesh = true;
        meshCombiner.CombineInactiveChildren = false;
        meshCombiner.DeactivateCombinedChildren = true;
        meshCombiner.DestroyCombinedChildren = false;
        meshCombiner.DeactivateCombinedChildrenMeshRenderers = false;

        //combineMeshesJob = new CombineMeshesJob
        //{
        //    gameObject = gameObject
        //};

        ScheduleCombineMeshesJob();
        SetColors();

    }

    public void SetColors()
    {
        gameObject.GetComponent<Renderer>().material.color = Random.ColorHSV(0f, 1f, 1f, 1f, 0.5f, 1f);
    }

    public void ScheduleCombineMeshesJob()
    {

        meshCombiner.CombineMeshes(true);


        //if (shouldRecombine)
        //{
        //    // garbage collection or sth--it keeps crashing after a while
        //}

        ////Temporarily set position to zero to make matrix math easier
        //Vector3 position = gameObject.transform.position;
        //gameObject.transform.position = Vector3.zero;

        ////Get all mesh filters and combine
        //MeshFilter[] meshFilters = gameObject.GetComponentsInChildren<MeshFilter>(true);
        //CombineInstance[] combine = new CombineInstance[meshFilters.Length - 1];
        //int i = 1; // skip self (first filter)
        //while (i < meshFilters.Length)
        //{
        //    combine[i - 1].mesh = meshFilters[i].sharedMesh;
        //    combine[i - 1].transform = meshFilters[i].transform.localToWorldMatrix;
        //    meshFilters[i].gameObject.SetActive(false);
        //    i++;
        //}

        //gameObject.transform.GetComponent<MeshFilter>().mesh = new Mesh();
        //gameObject.transform.GetComponent<MeshFilter>().mesh.indexFormat = UnityEngine.Rendering.IndexFormat.UInt32;

        //JobHandle handle = combineMeshesJob.Schedule(1, 1);
        //handle.Complete();



        //gameObject.transform.GetComponent<MeshFilter>().mesh.CombineMeshes(combine, true, true);
        //gameObject.transform.gameObject.SetActive(true);

        ////Return to original position
        //gameObject.transform.position = position;



        
    }
    



}

public struct CombineMeshesJob : IJobParallelFor
{

    public GameObject gameObject;

    public void Execute(int index)
    {
        CombineMeshes();
    }

    /// <summary>
    /// Combines the given object's children into a single mesh
    /// </summary>
    /// <param name="obj"></param>
    private void CombineMeshes(bool shouldRecombine = false)
    {

        
    }
}
